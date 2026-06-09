import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { createPublicClient } from 'viem';
import { monadTestnet } from './chain';
import { RPC_URL } from './config';

// wagmi config — injected/MetaMask only (no paid wallet services).
export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http(RPC_URL),
  },
});

// A standalone public client for reads/getLogs that does NOT depend on a
// connected wallet — the live feed works whether or not a wallet is connected.
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(RPC_URL),
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
