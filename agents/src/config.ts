import 'dotenv/config';
import { createPublicClient, createWalletClient, defineChain, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const RPC = process.env.MONAD_TESTNET_RPC ?? 'https://testnet-rpc.monad.xyz';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  blockExplorers: { default: { name: 'Monadscan', url: 'https://testnet.monadscan.com' } },
});

export const publicClient = createPublicClient({ chain: monadTestnet, transport: http(RPC) });

export const addresses = {
  riskRouter: (process.env.RISK_ROUTER || undefined) as Address | undefined,
  signalAnchor: (process.env.SIGNAL_ANCHOR || undefined) as Address | undefined,
  agentRegistry: (process.env.AGENT_REGISTRY || undefined) as Address | undefined,
  // Canonical WMON on Monad testnet (the nominal trade asset for the demo).
  wmon: '0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541' as Address,
};

/** Build an account + wallet client from a private key. */
export function walletFor(pk: string) {
  const account = privateKeyToAccount(pk as `0x${string}`);
  const wallet = createWalletClient({ account, chain: monadTestnet, transport: http(RPC) });
  return { account, wallet };
}
