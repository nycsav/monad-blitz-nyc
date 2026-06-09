// Copied from /agents/src/abis.ts — only the pieces the dashboard reads.

export const signalAnchorAbi = [
  {
    type: 'function',
    name: 'totalSignals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'SignalAnchored',
    inputs: [
      { name: 'signalId', type: 'uint256', indexed: true },
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'reasoningHash', type: 'bytes32', indexed: false },
      { name: 'price', type: 'int256', indexed: false },
      { name: 'direction', type: 'int8', indexed: false },
      { name: 'timestamp', type: 'uint64', indexed: false },
    ],
  },
] as const;

export const agentRegistryAbi = [
  {
    type: 'function',
    name: 'totalAgents',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'walletToAgentId',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;
