import { useEffect, useMemo, useRef } from 'react';
import type { SignalEvent } from '../lib/types';
import {
  truncateHash,
  directionLabel,
  directionSign,
  formatPrice,
  formatTime,
} from '../lib/format';
import { txUrl } from '../lib/config';

function dirClass(dir: number): string {
  if (dir > 0) return 'bull';
  if (dir < 0) return 'bear';
  return 'neutral';
}

interface Props {
  events: SignalEvent[];
  simulate: boolean;
  status: string;
}

export function SignalFeed({ events, simulate, status }: Props) {
  // Count events per block to flag "parallel execution" (multiple signals in
  // the same Monad block).
  const parallelBlocks = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      const k = e.blockNumber.toString();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const set = new Set<string>();
    for (const [k, n] of counts) if (n > 1) set.add(k);
    return set;
  }, [events]);

  // Track which row keys are new since last render so we can animate them in.
  const prevKeys = useRef<Set<string>>(new Set());
  const newKeys = useMemo(() => {
    const current = new Set(events.map((e) => `${e.txHash}:${e.logIndex}`));
    const fresh = new Set<string>();
    for (const k of current) if (!prevKeys.current.has(k)) fresh.add(k);
    return fresh;
  }, [events]);
  useEffect(() => {
    prevKeys.current = new Set(events.map((e) => `${e.txHash}:${e.logIndex}`));
  }, [events]);

  return (
    <div className="feed">
      <div className="feed-head">
        <div className="left">
          <span
            className={`chip ${simulate ? 'warn' : 'ok'}`}
            style={{ border: 'none', background: 'transparent', padding: 0 }}
          >
            <span className="led" />
            {simulate ? 'SIMULATED FEED' : status === 'live' ? 'LIVE' : 'LOADING'}
          </span>
          <span>SignalAnchored events</span>
        </div>
        <span className="count">{events.length} shown</span>
      </div>

      <div className="feed-row col-head">
        <div>Agent</div>
        <div className="hide-sm">Block</div>
        <div>Dir</div>
        <div>Price</div>
        <div className="hide-sm">reasoningHash</div>
        <div className="hide-sm">Time</div>
        <div>Tx</div>
      </div>

      {events.length === 0 ? (
        <div className="empty">No signals yet. Waiting for agents to anchor…</div>
      ) : (
        events.map((e) => {
          const key = `${e.txHash}:${e.logIndex}`;
          const isParallel = parallelBlocks.has(e.blockNumber.toString());
          const isNew = newKeys.has(key);
          return (
            <div
              key={key}
              className={`feed-row ${isParallel ? 'parallel' : ''} ${
                isNew ? 'enter' : ''
              }`}
            >
              <div className="mono">#{e.agentId.toString()}</div>
              <div className="mono hide-sm">
                {e.blockNumber.toString()}
                {isParallel && <span className="parallel-badge">∥ parallel</span>}
              </div>
              <div className={`dir-cell ${dirClass(e.direction)}`}>
                {directionSign(e.direction)} {directionLabel(e.direction)}
              </div>
              <div className="mono">{formatPrice(e.price)}</div>
              <div className="mono hide-sm" title={e.reasoningHash}>
                {truncateHash(e.reasoningHash, 8, 6)}
              </div>
              <div className="mono hide-sm">{formatTime(e.timestamp)}</div>
              <div>
                {simulate ? (
                  <span className="mono" style={{ color: 'var(--muted)' }} title="mock">
                    {truncateHash(e.txHash, 4, 4)}
                  </span>
                ) : (
                  <a
                    className="mono"
                    href={txUrl(e.txHash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {truncateHash(e.txHash, 4, 4)} ↗
                  </a>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
