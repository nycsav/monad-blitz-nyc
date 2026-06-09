import type { SignalEvent } from './types';

function randHash(): `0x${string}` {
  const chars = '0123456789abcdef';
  let out = '0x';
  for (let i = 0; i < 64; i++) out += chars[Math.floor(Math.random() * 16)];
  return out as `0x${string}`;
}

const PRICES: Record<number, bigint> = {
  1: 342_000_000_000n, // ETH ~ $3,420 (1e8 scale)
  2: 6_810_000_000_000n, // BTC ~ $68,100
  3: 341_950_000_000n, // ETH (arb) ~ $3,419.50
};

// Generate a deterministic-ish batch of mock SignalAnchored events for SIMULATE
// mode. Includes a deliberate "same block" cluster so the parallel-execution
// visual cue renders.
export function generateMockSignals(count = 12): SignalEvent[] {
  const now = Math.floor(Date.now() / 1000);
  const baseBlock = 18_500_000n;
  const out: SignalEvent[] = [];

  for (let i = 0; i < count; i++) {
    const agentId = ((i % 3) + 1) as 1 | 2 | 3;
    // Cluster every 3 events into the same block to simulate parallel txns.
    const blockNumber = baseBlock + BigInt(Math.floor(i / 3));
    const dirs = [1, -1, 0, 1, 1, -1];
    const direction = dirs[i % dirs.length];
    const basePrice = PRICES[agentId];
    const jitter = BigInt(Math.floor((Math.random() - 0.5) * 5_000_000));

    out.push({
      signalId: BigInt(count - i),
      agentId: BigInt(agentId),
      reasoningHash: randHash(),
      price: basePrice + jitter,
      direction,
      timestamp: BigInt(now - i * 4),
      blockNumber,
      txHash: randHash(),
      logIndex: i % 3,
    });
  }

  // newest first
  return out;
}
