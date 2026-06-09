import { runCycle, type CycleResult } from './agent.js';
import { STRATEGIES } from './strategies.js';
import { addresses } from './config.js';

/**
 * The swarm: all agents run their full cycle CONCURRENTLY (Promise.all). When
 * live, each agent submits from its own wallet, so the transactions hit Monad
 * as independent senders — true parallel execution, not a serialized queue.
 *
 * Usage:
 *   npm run swarm                       # 1 round, dry-run
 *   npm run swarm -- 5                  # 5 rounds, dry-run
 *   npm run swarm -- 5 --interval=2000  # 5 rounds, 2s apart
 *   npm run swarm -- 3 --live           # submit on-chain
 */
async function main() {
  const args = process.argv.slice(2);
  const live = args.includes('--live');
  const rounds = Number(args.find((a) => /^\d+$/.test(a)) ?? '1');
  const intervalMs = Number((args.find((a) => a.startsWith('--interval=')) ?? '=1500').split('=')[1]);

  if (live && !addresses.riskRouter) {
    throw new Error('--live requires RISK_ROUTER in .env (deploy contracts first)');
  }

  console.log(`\n🐝 MonadSwarm — ${STRATEGIES.length} parallel agents · ${rounds} round(s) · ${live ? 'LIVE' : 'dry-run'}\n`);

  for (let round = 1; round <= rounds; round++) {
    console.log(`── round ${round}/${rounds} ──`);
    const t0 = Date.now();
    const results = await Promise.allSettled(STRATEGIES.map((cfg) => runCycle(cfg, { live })));
    const dt = Date.now() - t0;

    const live_txs: string[] = [];
    results.forEach((res, i) => {
      const cfg = STRATEGIES[i];
      if (res.status === 'fulfilled') {
        const r: CycleResult = res.value;
        const status = r.txHash ? `tx ${r.txHash.slice(0, 14)}…` : r.signerOk ? 'signed ✓' : 'sig ✗';
        const conf = `c${r.signal.confidence}`;
        console.log(
          `  ${cfg.name.padEnd(14)} ${r.signal.direction.toUpperCase().padEnd(7)} ` +
            `$${r.price.toFixed(2).padStart(10)}  ${conf.padEnd(5)} ${status}`,
        );
        if (r.txHash) live_txs.push(`     ${cfg.name}: https://testnet.monadscan.com/tx/${r.txHash}`);
      } else {
        const msg = res.reason instanceof Error ? res.reason.message : String(res.reason);
        console.log(`  ${cfg.name.padEnd(14)} ERROR  ${msg}`);
      }
    });
    console.log(`  └─ ${STRATEGIES.length} agents executed in parallel · ${dt}ms`);
    if (live_txs.length) console.log(live_txs.join('\n'));
    console.log();

    if (round < rounds) await new Promise((r) => setTimeout(r, intervalMs));
  }

  if (!live) {
    console.log(addresses.riskRouter
      ? '(dry-run — add --live to submit all agents to Monad concurrently)'
      : '(dry-run — deploy contracts, set addresses in .env, then --live)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
