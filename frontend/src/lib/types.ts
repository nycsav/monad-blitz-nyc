// Normalized in-app representation of a SignalAnchored event.
export interface SignalEvent {
  signalId: bigint;
  agentId: bigint;
  reasoningHash: `0x${string}`;
  price: bigint; // int256 on-chain
  direction: number; // -1 | 0 | 1
  timestamp: bigint; // uint64, agent-supplied
  blockNumber: bigint;
  txHash: `0x${string}`;
  logIndex: number;
}

export interface AgentMeta {
  id: number;
  name: string;
  strategy: string;
  asset: string;
}

// Static metadata for the three demo agents.
export const AGENTS: AgentMeta[] = [
  { id: 1, name: 'Momentum', strategy: 'Momentum', asset: 'ETH' },
  { id: 2, name: 'MeanReversion', strategy: 'Mean Reversion', asset: 'BTC' },
  { id: 3, name: 'Arbitrage', strategy: 'Arbitrage', asset: 'ETH' },
];
