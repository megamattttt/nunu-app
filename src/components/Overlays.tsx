import React, { useEffect, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { Tap } from './ui';

export function Toast() {
  const { s } = useGame();
  if (!s.toast) return null;
  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: 16, right: 16, bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)', zIndex: 60,
        background: C.paper, color: C.ink, borderRadius: 18, padding: '14px 16px',
        font: `700 13px ${F.body}`, boxShadow: '0 18px 40px -18px rgba(0,0,0,.7)', animation: 'nuIn .22s ease'
      }}
    >
      {s.toast}
    </div>
  );
}

/** Récompense plein écran : PX, pièces, palier, objet débloqué. */
export function RewardOverlay() {
  const { s, d } = useGame();
  const e = s.event;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!e?.px) { setCount(0); return; }
    let n = 0;
    const target = e.px;
    const id = window.setInterval(() => {
      n = Math.min(target, n + Math.max(1, Math.round(target / 24)));
      setCount(n);
      if (n >= target) window.clearInterval(id);
    }, 26);
    return () => window.clearInterval(id);
  }, [e]);

  if (!e) return null;
  const accent = e.color || C.lime;

  return (
    <div
      onClick={() => d({ t: 'EVENT', event: null })}
      style={{
        position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(11,11,12,.86)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, background: C.paper, borderRadius: 32, padding: '30px 26px 24px', textAlign: 'center', animation: 'nuPop .45s cubic-bezier(.2,1.2,.3,1)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: '50%', top: -160, width: 340, height: 340, marginLeft: -170, borderRadius: '50%', background: accent, opacity: .22 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ font: `500 10px ${F.mono}`, letterSpacing: '.2em', color: 'rgba(11,11,12,.5)' }}>{e.title}</div>
          {e.sub ? <div style={{ font: `800 27px/1.06 ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 10 }}>{e.sub}</div> : null}

          {e.px ? (
            <div style={{ font: `800 62px/1 ${F.display}`, color: C.ink, letterSpacing: '-.04em', marginTop: 18 }}>
              +{count}<span style={{ font: `800 20px ${F.display}`, marginLeft: 6 }}>PX</span>
            </div>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {e.coins ? <span style={{ font: `700 11px ${F.mono}`, background: C.honey, color: C.ink, padding: '8px 12px', borderRadius: 99 }}>{e.coins > 0 ? '+' : ''}{e.coins} PIÈCES</span> : null}
            {e.lp ? <span style={{ font: `700 11px ${F.mono}`, background: C.ink, color: C.paper, padding: '8px 12px', borderRadius: 99 }}>{e.lp > 0 ? '+' : ''}{e.lp} LP</span> : null}
            {e.energy ? <span style={{ font: `700 11px ${F.mono}`, background: C.lime, color: C.ink, padding: '8px 12px', borderRadius: 99 }}>+{e.energy} ⚡</span> : null}
          </div>

          {e.object ? (
            <div style={{ marginTop: 18, background: '#fff', borderRadius: 18, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ width: 34, height: 34, borderRadius: 12, background: accent, flex: 'none' }} />
              <span>
                <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(11,11,12,.5)' }}>OBJET AJOUTÉ AU DIORAMA</span>
                <span style={{ display: 'block', font: `700 14px ${F.body}`, color: C.ink, marginTop: 3 }}>{e.object}</span>
              </span>
            </div>
          ) : null}

          <Tap
            onTap={() => d({ t: 'EVENT', event: null })}
            style={{ marginTop: 22, background: C.ink, color: C.paper, borderRadius: 99, padding: '16px 20px', font: `800 16px ${F.display}`, letterSpacing: '-.01em', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            CONTINUER
          </Tap>
        </div>
      </div>
    </div>
  );
}
