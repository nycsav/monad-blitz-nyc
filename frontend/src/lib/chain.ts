import { defineChain } from 'viem';
import { CHAIN_ID, RPC_URL, EXPLORER_URL } from './config';

// Monad testnet is not in wagmi/chains, so define it inline.
export const monadTestnet = defineChain({
  id: CHAIN_ID,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'MonadScan', url: EXPLORER_URL },
  },
  testnet: true,
});
