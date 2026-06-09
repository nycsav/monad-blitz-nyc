// Display helpers. Prices are int256 with no fixed decimal contract guarantee;
// the agents anchor a USD price. We treat the raw int as a USD value scaled by
// 1e8 (Chainlink-style) when large, otherwise as a plain integer. This is a
// best-effort display for a demo — see formatPrice below.

export function truncateHash(hash: string, lead = 6, tail = 4): string {
  if (!hash) return '';
  if (hash.length <= lead + tail + 2) return hash;
  return `${hash.slice(0, lead + 2)}…${hash.slice(-tail)}`;
}

export function directionLabel(dir: number): string {
  if (dir > 0) return 'BULL';
  if (dir < 0) return 'BEAR';
  return 'NEUTRAL';
}

export function directionSign(dir: number): string {
  if (dir > 0) return '+1';
  if (dir < 0) return '-1';
  return '0';
}

// Best-effort USD formatting. Agents anchor price as int256. If the value is
// large (>= 1e6) we assume 8-decimal scaling (Chainlink convention) used by the
// ETH/BTC feeds referenced in the project. Otherwise show the raw integer.
export function formatPrice(price: bigint): string {
  const abs = price < 0n ? -price : price;
  if (abs >= 1_000_000n) {
    const scaled = Number(price) / 1e8;
    return scaled.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    });
  }
  return price.toString();
}

export function formatTime(ts: bigint): string {
  const ms = Number(ts) * 1000;
  if (!ms || Number.isNaN(ms)) return '—';
  const d = new Date(ms);
  if (d.getFullYear() < 2000) return '—';
  return d.toLocaleTimeString('en-US', { hour12: false });
}
