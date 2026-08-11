import React from 'react';
import { C, F } from '../theme';
import type { Day } from '../state/selectors';

/**
 * Barres des sept derniers jours. Lecture d'un coup d'œil :
 * la hauteur code les PX du jour, le point code « au moins une validation ».
 */
export default function WeekStrip({ days, c = C.lime, dark = false, h = 46 }: { days: Day[]; c?: string; dark?: boolean; h?: number }) {
  const max = Math.max(30, ...days.map((d) => d.px));
  const dim = dark ? 'rgba(10,10,12,.16)' : 'rgba(255,255,255,.09)';
  const txt = dark ? 'rgba(10,10,12,.45)' : 'rgba(255,255,255,.42)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length},1fr)`, gap: 6, alignItems: 'end' }}>
      {days.map((d, i) => {
        const pct = Math.round((d.px / max) * 100);
        return (
          <span key={d.t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <span style={{ width: '100%', height: h, borderRadius: 8, background: dim, position: 'relative', overflow: 'hidden' }}>
              <span
                style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(d.px ? 6 : 0, pct) + '%',
                  background: d.today ? c : d.px ? c : 'transparent', opacity: d.today ? 1 : .62, borderRadius: 8,
                  animation: `nuStat .6s cubic-bezier(.2,1,.3,1) ${0.04 * i}s both`
                }}
              />
            </span>
            <span
              style={{
                font: `${d.today ? 700 : 500} 9px ${F.mono}`, letterSpacing: '.06em',
                color: d.today ? (dark ? C.ink : '#fff') : txt
              }}
            >
              {d.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
