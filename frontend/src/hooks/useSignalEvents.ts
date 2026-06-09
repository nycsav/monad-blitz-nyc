import { useCallback, useEffect, useRef, useState } from 'react';
import { parseAbiItem } from 'viem';
import { publicClient } from '../lib/wagmi';
import { SIGNAL_ANCHOR, HAS_SIGNAL_ANCHOR } from '../lib/config';
import type { SignalEvent } from '../lib/types';
import { generateMockSignals } from '../lib/mock';

const SIGNAL_ANCHORED = parseAbiItem(
  'event SignalAnchored(uint256 indexed signalId, uint256 indexed agentId, bytes32 reasoningHash, int256 price, int8 direction, uint64 timestamp)',
);

// Monad testnet RPC caps eth_getLogs to a small block range (~100): larger ranges
// SILENTLY return empty (verified), which would drop the feed into simulate mode.
// So every query is split into <=CHUNK windows and fanned out in parallel batches.
const CHUNK = 100n;
const BACKFILL_RANGE = 6000n; // ~40 min of history at 0.4s blocks
const BATCH = 10; // parallel getLogs per wave (stays under RPC rps cap)
const POLL_MS = 4000;

type Status = 'idle' | 'loading' | 'live' | 'simulate' | 'error';

interface UseSignalEventsResult {
  events: SignalEvent[];
  status: Status;
  simulate: boolean;
  setSimulate: (v: boolean) => void;
  error: string | null;
  latestBlock: bigint | null;
}

function keyOf(e: SignalEvent): string {
  return `${e.txHash}:${e.logIndex}`;
}

function sortNewestFirst(arr: SignalEvent[]): SignalEvent[] {
  return [...arr].sort((a, b) => {
    if (a.blockNumber !== b.blockNumber)
      return a.blockNumber > b.blockNumber ? -1 : 1;
    return b.logIndex - a.logIndex;
  });
}

type RawLog = {
  args: {
    signalId?: bigint;
    agentId?: bigint;
    reasoningHash?: `0x${string}`;
    price?: bigint;
    direction?: number;
    timestamp?: bigint;
  };
  blockNumber: bigint | null;
  transactionHash: `0x${string}` | null;
  logIndex: number | null;
};

function toEvent(log: RawLog): SignalEvent {
  const a = log.args;
  return {
    signalId: a.signalId ?? 0n,
    agentId: a.agentId ?? 0n,
    reasoningHash: (a.reasoningHash ?? '0x') as `0x${string}`,
    price: a.price ?? 0n,
    direction: typeof a.direction === 'number' ? a.direction : Number(a.direction ?? 0),
    timestamp: a.timestamp ?? 0n,
    blockNumber: log.blockNumber ?? 0n,
    txHash: (log.transactionHash ?? '0x') as `0x${string}`,
    logIndex: log.logIndex ?? 0,
  };
}

/**
 * Fetch SignalAnchored logs across [from, to] by splitting into <=CHUNK windows
 * (the RPC's getLogs range cap) and fanning out in parallel batches. A single
 * wide getLogs over this range returns empty on Monad testnet — this does not.
 */
async function getLogsChunked(from: bigint, to: bigint): Promise<RawLog[]> {
  if (to < from) return [];
  const windows: Array<[bigint, bigint]> = [];
  let start = from;
  while (start <= to) {
    const end = start + CHUNK - 1n > to ? to : start + CHUNK - 1n;
    windows.push([start, end]);
    start = end + 1n;
  }
  const out: RawLog[] = [];
  for (let i = 0; i < windows.length; i += BATCH) {
    const wave = windows.slice(i, i + BATCH);
    const results = await Promise.all(
      wave.map(([f, t]) =>
        publicClient
          .getLogs({ address: SIGNAL_ANCHOR, event: SIGNAL_ANCHORED, fromBlock: f, toBlock: t })
          .catch(() => [] as unknown[]),
      ),
    );
    for (const r of results) out.push(...(r as unknown as RawLog[]));
  }
  return out;
}

export function useSignalEvents(): UseSignalEventsResult {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [simulate, setSimulateState] = useState<boolean>(!HAS_SIGNAL_ANCHOR);
  const [error, setError] = useState<string | null>(null);
  const [latestBlock, setLatestBlock] = useState<bigint | null>(null);

  const seenRef = useRef<Set<string>>(new Set());
  const lastScannedRef = useRef<bigint | null>(null);
  const simulateRef = useRef<boolean>(simulate);
  simulateRef.current = simulate;

  const merge = useCallback((incoming: SignalEvent[]) => {
    if (incoming.length === 0) return;
    setEvents((prev) => {
      const fresh = incoming.filter((e) => !seenRef.current.has(keyOf(e)));
      if (fresh.length === 0) return prev;
      for (const e of fresh) seenRef.current.add(keyOf(e));
      return sortNewestFirst([...fresh, ...prev]).slice(0, 200);
    });
  }, []);

  const loadMock = useCallback(() => {
    const mock = generateMockSignals(12);
    seenRef.current = new Set(mock.map(keyOf));
    setEvents(sortNewestFirst(mock));
    setStatus('simulate');
  }, []);

  const setSimulate = useCallback(
    (v: boolean) => {
      setSimulateState(v);
      seenRef.current = new Set();
      lastScannedRef.current = null;
      if (v) {
        loadMock();
      } else {
        setEvents([]);
        setStatus('loading');
      }
    },
    [loadMock],
  );

  // Backfill on load (or when leaving simulate mode).
  useEffect(() => {
    if (simulate) {
      loadMock();
      return;
    }
    if (!HAS_SIGNAL_ANCHOR) {
      setSimulateState(true);
      loadMock();
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        if (cancelled) return;
        setLatestBlock(latest);
        const from = latest > BACKFILL_RANGE ? latest - BACKFILL_RANGE : 0n;

        const logs = await getLogsChunked(from, latest);
        if (cancelled) return;

        const mapped = logs.map(toEvent);
        lastScannedRef.current = latest;

        if (mapped.length === 0) {
          // Genuinely no on-chain history in range — fall back to simulate.
          setSimulateState(true);
          loadMock();
          return;
        }

        seenRef.current = new Set(mapped.map(keyOf));
        setEvents(sortNewestFirst(mapped));
        setStatus('live');
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setSimulateState(true);
        loadMock();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulate]);

  // Poll for new events while live (chunked, in case the gap exceeds the range cap).
  useEffect(() => {
    if (simulate || status !== 'live') return;

    let cancelled = false;
    const id = setInterval(async () => {
      if (cancelled || simulateRef.current) return;
      try {
        const latest = await publicClient.getBlockNumber();
        if (cancelled) return;
        setLatestBlock(latest);
        const from =
          lastScannedRef.current && lastScannedRef.current < latest
            ? lastScannedRef.current + 1n
            : latest;
        if (from > latest) return;

        const logs = await getLogsChunked(from, latest);
        if (cancelled) return;
        lastScannedRef.current = latest;
        merge(logs.map(toEvent));
      } catch {
        // transient — next tick retries
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [simulate, status, merge]);

  return { events, status, simulate, setSimulate, error, latestBlock };
}
