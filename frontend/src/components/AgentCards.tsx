import { useMemo } from 'react';
import { AGENTS } from '../lib/types';
import type { SignalEvent } from '../lib/types';
import { directionLabel, directionSign, formatPrice } from '../lib/format';

const ACCENTS: Record<number, string> = {
  1: '#836ef9',
  2: '#f5b13d',
  3: '#2fd47a',
};

function dirClass(dir: number): string {
  if (dir > 0) return 'bull';
  if (dir < 0) return 'bear';
  return 'neutral';
}

interface Props {
  events: SignalEvent[];
}

export function AgentCards({ events }: Props) {
  // Per-agent: latest event (events are newest-first) + total count.
  const byAgent = useMemo(() => {
    const map = new Map<number, { latest: SignalEvent | null; count: number }>();
    for (const a of AGENTS) map.set(a.id, { latest: null, count: 0 });
    for (const e of events) {
      const id = Number(e.agentId);
      const slot = map.get(id);
      if (!slot) continue;
      slot.count += 1;
      if (slot.latest === null) slot.latest = e; // first seen = newest
    }
    return map;
  }, [events]);

  return (
    <div className="agent-grid">
      {AGENTS.map((agent) => {
        const slot = byAgent.get(agent.id) ?? { latest: null, count: 0 };
        const dir = slot.latest ? slot.latest.direction : 0;
        return (
          <div className="agent-card" key={agent.id}>
            <div className="accent-bar" style={{ background: ACCENTS[agent.id] }} />
            <div className="head">
              <div>
                <div className="id">AGENT #{agent.id}</div>
                <div className="name">{agent.name}</div>
                <div className="strat">{agent.strategy}</div>
              </div>
              <span className="asset">{agent.asset}</span>
            </div>

            <div className="metrics">
              <div className="metric">
                <div className="label">Signal</div>
                <div className="value">
                  <span className={`dir-pill ${dirClass(dir)}`}>
                    {directionSign(dir)} {directionLabel(dir)}
                  </span>
                </div>
              </div>
              <div className="metric" style={{ textAlign: 'right' }}>
                <div className="label">Last price</div>
                <div className="value">
                  {slot.latest ? formatPrice(slot.latest.price) : '—'}
                </div>
              </div>
              <div className="metric" style={{ textAlign: 'right' }}>
                <div className="label">Signals</div>
                <div className="value">{slot.count}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
