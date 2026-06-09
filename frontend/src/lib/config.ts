// Centralized env-derived config. All values come from VITE_* env vars.
// Falls back to sensible Monad-testnet defaults so the app still boots
// in SIMULATE mode even if .env is missing.

const ZERO = '0x0000000000000000000000000000000000000000' as const;

// Live MonadSwarm deployment on Monad testnet (chain 10143). These are PUBLIC
// on-chain addresses, so we bake them in as defaults — the app reads real data
// out of the box (e.g. on Vercel) with no env-var setup. VITE_* still overrides.
const DEFAULTS = {
  AGENT_REGISTRY: '0xaF9a75811aF8999b767813E78a9E6592eAF8b3e9',
  SIGNAL_ANCHOR: '0xa07adbcB5Ff1C4204c574Da5C977e102848dcb68',
  SIGNAL_VAULT: '0x2E3723c691A32f1e5Aa43f21fC3557034d26FF10',
  RISK_ROUTER: '0x88D7903951f618d625AAB8b50bE04D3434172a5D',
} as const;

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 10143);

export const RPC_URL =
  (import.meta.env.VITE_RPC_URL as string | undefined) ??
  'https://testnet-rpc.monad.xyz';

export const EXPLORER_URL = 'https://testnet.monadscan.com';

export const AGENT_REGISTRY = (import.meta.env.VITE_AGENT_REGISTRY ??
  DEFAULTS.AGENT_REGISTRY) as `0x${string}`;

export const SIGNAL_ANCHOR = (import.meta.env.VITE_SIGNAL_ANCHOR ??
  DEFAULTS.SIGNAL_ANCHOR) as `0x${string}`;

export const SIGNAL_VAULT = (import.meta.env.VITE_SIGNAL_VAULT ??
  DEFAULTS.SIGNAL_VAULT) as `0x${string}`;

export const RISK_ROUTER = (import.meta.env.VITE_RISK_ROUTER ??
  DEFAULTS.RISK_ROUTER) as `0x${string}`;

// True when we have a usable SignalAnchor address to read from.
export const HAS_SIGNAL_ANCHOR =
  SIGNAL_ANCHOR !== ZERO && SIGNAL_ANCHOR.length === 42;

export function txUrl(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function addressUrl(addr: string): string {
  return `${EXPLORER_URL}/address/${addr}`;
}
