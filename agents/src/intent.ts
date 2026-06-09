import { keccak256, toBytes, type Address } from 'viem';
import { monadTestnet } from './config.js';

export interface TradeIntent {
  agentId: bigint;
  asset: Address;
  amount: bigint;
  isBuy: boolean;
  maxSlippageBps: bigint;
  deadline: bigint;
  reasoningHash: `0x${string}`;
  price: bigint;
  direction: number; // +1 bull, -1 bear, 0 neutral
  nonce: bigint;
}

/** EIP-712 type definition — must match RiskRouter.TRADE_INTENT_TYPEHASH. */
export const tradeIntentTypes = {
  TradeIntent: [
    { name: 'agentId', type: 'uint256' },
    { name: 'asset', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'isBuy', type: 'bool' },
    { name: 'maxSlippageBps', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'reasoningHash', type: 'bytes32' },
    { name: 'price', type: 'int256' },
    { name: 'direction', type: 'int8' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;

/** EIP-712 domain — must match the RiskRouter constructor: EIP712("MonadSwarm", "1"). */
export function domain(verifyingContract: Address) {
  return {
    name: 'MonadSwarm',
    version: '1',
    chainId: monadTestnet.id,
    verifyingContract,
  } as const;
}

/** keccak256 of the agent's full reasoning text — the proof-of-cognition link. */
export function reasoningHash(text: string): `0x${string}` {
  return keccak256(toBytes(text));
}
