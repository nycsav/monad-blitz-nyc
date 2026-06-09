/**
 * Pyth price feeds via Hermes (the pull-oracle off-chain endpoint).
 * Agents pull live prices on demand — no gas, ~400ms cadence, matching Monad's
 * block time. Feed IDs are global Pyth IDs (identical across all chains).
 */
export const PYTH_FEEDS = {
  'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
} as const;

export type FeedName = keyof typeof PYTH_FEEDS;

const HERMES = 'https://hermes.pyth.network/v2/updates/price/latest';

export interface PriceQuote {
  /** Human-readable price, e.g. 2153.42 */
  price: number;
  /** Raw Pyth integer (price * 10^-expo), int256-safe — anchored on-chain as-is */
  raw: bigint;
  /** Pyth exponent (negative, typically -8) */
  expo: number;
  publishTime: number;
}

/** Pull the latest price for a feed from Hermes. */
export async function fetchPrice(feedId: string): Promise<PriceQuote> {
  const res = await fetch(`${HERMES}?ids[]=${feedId}`);
  if (!res.ok) throw new Error(`Hermes error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    parsed: Array<{ price: { price: string; expo: number; publish_time: number } }>;
  };
  const p = data.parsed?.[0]?.price;
  if (!p) throw new Error('Hermes returned no parsed price');
  const raw = BigInt(p.price);
  const expo = p.expo;
  return { raw, expo, publishTime: p.publish_time, price: Number(raw) * 10 ** expo };
}

export async function fetchPriceByName(name: FeedName): Promise<PriceQuote> {
  return fetchPrice(PYTH_FEEDS[name]);
}
