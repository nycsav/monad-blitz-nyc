import { runCycle } from './agent.js';
import { STRATEGIES } from './strategies.js';
import { addresses } from './config.js';

/**
 * Run a single agent cycle. Usage:
 *   npm run agent              # agent 1 (Momentum), dry-run
 *   npm run agent -- 2         # agent 2 (MeanReversion), dry-run
 *   npm run agent -- 1 --live  # submit on-chain (requires deployed contracts + gas)
 */
async function main() {
  const args = process.argv.slice(2);
  const idxArg = args.find((a) => /^\d+$/.test(a));
  const live = args.includes('--live');
  const idx = idxArg ? Number(idxArg) - 1 : 0;
  const cfg = STRATEGIES[idx];
  if (!cfg) throw new Error(`No strategy at index ${idx + 1}`);

  console.log(`\n🤖 Agent ${cfg.agentId} — ${cfg.name}  (${cfg.asset})`);
  console.log(`   mode: ${live ? 'LIVE (on-chain submit)' : 'dry-run'}\n`);

  const r = await runCycle(cfg, { live });

  console.log(`  price        $${r.price.toFixed(2)}`);
  console.log(`  signal       ${r.signal.direction.toUpperCase()}  (conf ${r.signal.confidence}, size ${r.signal.positionPct}%)${r.mocked ? '  [mock]' : ''}`);
  console.log(`  reasoning    ${r.signal.reasoning}`);
  console.log(`  reasoningHash ${r.intent.reasoningHash}`);
  console.log(`  amount       ${Number(r.intent.amount) / 1e6} USDC notional`);
  console.log(`  signature    ${r.signature.slice(0, 26)}…`);
  console.log(`  signer valid ${r.signerOk ? '✓ recovers to agent wallet' : '✗ MISMATCH'}`);

  if (r.txHash) {
    console.log(`\n  ✅ submitted: ${addresses.signalAnchor ? '' : ''}https://testnet.monadscan.com/tx/${r.txHash}`);
  } else if (!addresses.riskRouter) {
    console.log(`\n  (dry-run — deploy contracts + set RISK_ROUTER in .env, then re-run with --live)`);
  } else {
    console.log(`\n  (dry-run — add --live to submit to RiskRouter at ${addresses.riskRouter})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
