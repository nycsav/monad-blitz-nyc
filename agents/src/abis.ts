/** TradeIntent tuple — component order MUST match the Solidity struct exactly. */
export const tradeIntentComponents = [
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
] as const;

export const riskRouterAbi = [
  {
    type: 'function',
    name: 'executeIntent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'intent', type: 'tuple', components: tradeIntentComponents },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: 'signalId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'hashIntent',
    stateMutability: 'view',
    inputs: [{ name: 'intent', type: 'tuple', components: tradeIntentComponents }],
    outputs: [{ type: 'bytes32' }],
  },
] as const;

export const agentRegistryAbi = [
  {
    type: 'function',
    name: 'registerAgent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentWallet', type: 'address' },
      { name: 'strategy', type: 'string' },
    ],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'walletToAgentId',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalAgents',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const;

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
