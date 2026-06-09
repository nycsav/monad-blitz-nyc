import { useMemo } from 'react';
import { useSignalEvents } from '../hooks/useSignalEvents';
import { AgentCards } from './AgentCards';
import { SignalFeed } from './SignalFeed';
import { SIGNAL_ANCHOR, HAS_SIGNAL_ANCHOR, addressUrl } from '../lib/config';
import { truncateHash } from '../lib/format';

export function Dashboard() {
  const { events, status, simulate, setSimulate, error, latestBlock } =
    useSignalEvents();

  // Count distinct blocks that carry >1 signal — the parallel-execution stat.
  const parallelStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      const k = e.blockNumber.toString();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    let blocks = 0;
    let concurrent = 0;
    for (const n of counts.values()) {
      if (n > 1) {
        blocks += 1;
        concurrent += n;
      }
    }
    return { blocks, concurrent };
  }, [events]);

  return (
    <>
      <section>
        <div className="section-title">Active Agents</div>
        <AgentCards events={events} />
      </section>

      <section>
        <div
          className="section-title"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>Live Signal Feed</span>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {parallelStats.blocks > 0 && (
              <span className="chip" style={{ textTransform: 'none', letterSpacing: 0 }}>
                ∥ {parallelStats.concurrent} signals in {parallelStats.blocks} shared{' '}
                {parallelStats.blocks === 1 ? 'block' : 'blocks'}
              </span>
            )}
            <button
              className={`toggle ${simulate ? 'on' : ''}`}
              onClick={() => setSimulate(!simulate)}
              type="button"
              style={{ background: 'transparent', border: 'none', padding: 0 }}
            >
              <span className="switch" />
              Simulate
            </button>
          </div>
        </div>

        <SignalFeed events={events} simulate={simulate} status={status} />
      </section>

      <div className="footnote">
        SignalAnchor:{' '}
        {HAS_SIGNAL_ANCHOR ? (
          <a href={addressUrl(SIGNAL_ANCHOR)} target="_blank" rel="noreferrer">
            <code>{truncateHash(SIGNAL_ANCHOR, 8, 6)}</code>
          </a>
        ) : (
          <code>unset</code>
        )}
        {latestBlock !== null && (
          <>
            {' · '}latest block <code>{latestBlock.toString()}</code>
          </>
        )}
        {error && (
          <>
            {' · '}
            <span style={{ color: 'var(--warn)' }}>RPC: {error}</span>
          </>
        )}
        {simulate && (
          <>
            {' · '}
            <span style={{ color: 'var(--warn)' }}>
              showing mock data — toggle Simulate off to read the chain
            </span>
          </>
        )}
      </div>
    </>
  );
}
