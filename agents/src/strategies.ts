import type { FeedName } from './pyth.js';

export interface StrategyConfig {
  agentId: bigint;
  name: string;
  strategy: string;
  asset: FeedName;
  pkEnv: string; // env var holding this agent's private key
  positionUsd: number; // notional capital this agent manages
}

/** The three parallel strategies that make up the swarm. */
export const STRATEGIES: StrategyConfig[] = [
  {
    agentId: BigInt(process.env.AGENT1_ID ?? '1'),
    name: 'Momentum',
    strategy: 'momentum — ride established directional moves, buy strength / sell weakness',
    asset: 'ETH/USD',
    pkEnv: 'AGENT1_PRIVATE_KEY',
    positionUsd: 1000,
  },
  {
    agentId: BigInt(process.env.AGENT2_ID ?? '2'),
    name: 'MeanReversion',
    strategy: 'mean reversion — fade overextended moves, expect reversion to recent average',
    asset: 'BTC/USD',
    pkEnv: 'AGENT2_PRIVATE_KEY',
    positionUsd: 1000,
  },
  {
    agentId: BigInt(process.env.AGENT3_ID ?? '3'),
    name: 'Arbitrage',
    strategy: 'cross-asset arbitrage — exploit ETH/BTC relative-value dislocations',
    asset: 'ETH/USD',
    pkEnv: 'AGENT3_PRIVATE_KEY',
    positionUsd: 1000,
  },
];

export function pkFor(cfg: StrategyConfig): string {
  const pk = process.env[cfg.pkEnv];
  if (!pk) throw new Error(`Missing ${cfg.pkEnv} in agents/.env`);
  return pk;
}
