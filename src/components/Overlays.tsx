import React, { useEffect, useRef, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { Tap } from './ui';
import Logo from './Logo';

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

/**
 * Splash de marque : au premier rendu, puis à chaque retour au premier plan
 * après une absence prolongée. Le logo est l'élément central.
 */
export function ResumeOverlay() {
  const [show, setShow] = useState(true);
  const away = useRef<number>(0);

  useEffect(() => {
    const id = window.setTimeout(() => setShow(false), 1100);
    const onVis = () => {
      if (document.hidden) { away.current = Date.now(); return; }
      if (Date.now() - away.current > 60000) {
        setShow(true);
        window.setTimeout(() => setShow(false), 900);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { window.clearTimeout(id); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  if (!show) return null;
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 90, background: C.ink,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
        animation: 'nuIn .2s ease'
      }}
    >
      <span style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(47,43,201,.5),transparent 68%)' }} />
      <Logo size={96} glow style={{ position: 'relative', animation: 'nuPop .5s cubic-bezier(.2,1.2,.3,1)' }} />
      <span style={{ position: 'relative', font: `500 10px ${F.mono}`, letterSpacing: '.32em', color: 'rgba(255,255,255,.45)' }}>PROGRESSE POUR DE VRAI</span>
    </div>
  );
}

/** Récompense plein écran : PX, pièces, palier, objet débloqué, carte à partager. */
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

  const close = () => d({ t: 'EVENT', event: null });

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(11,11,12,.86)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26
      }}
    >
      <div onClick={(ev) => ev.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: C.paper, borderRadius: 32, padding: '30px 26px 24px', textAlign: 'center', animation: 'nuPop .45s cubic-bezier(.2,1.2,.3,1)', position: 'relative', overflow: 'hidden' }}>
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
            {e.combo && e.combo > 1 ? (
              <span style={{ font: `700 11px ${F.mono}`, background: C.ink, color: C.lime, padding: '8px 12px', borderRadius: 99, animation: e.comboStep ? 'nuComboIn .45s cubic-bezier(.2,1.2,.3,1)' : undefined }}>
                COMBO ×{e.combo}
              </span>
            ) : null}
            {s.onFire ? <span style={{ font: `700 11px ${F.mono}`, background: C.coral, color: '#fff', padding: '8px 12px', borderRadius: 99 }}>EN FEU · PX ×2</span> : null}
          </div>

          {e.fire ? (
            <div style={{ marginTop: 16, background: C.coral, color: '#fff', borderRadius: 18, padding: '13px 15px', font: `700 13px ${F.body}`, textWrap: 'pretty' }}>
              Jauge pleine : tu passes en feu. Les prochaines quêtes rapportent le double de PX.
            </div>
          ) : null}

          {e.object ? (
            <div style={{ marginTop: 18, background: '#fff', borderRadius: 18, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ width: 34, height: 34, borderRadius: 12, background: accent, flex: 'none' }} />
              <span>
                <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(11,11,12,.5)' }}>OBJET AJOUTÉ AU DIORAMA</span>
                <span style={{ display: 'block', font: `700 14px ${F.body}`, color: C.ink, marginTop: 3 }}>{e.object}</span>
              </span>
            </div>
          ) : null}

          {e.share ? (
            <Tap
              onTap={() => { const data = e.share!; d({ t: 'EVENT', event: null }); d({ t: 'SHARE', data }); }}
              haptic="soft"
              style={{ marginTop: 18, background: accent, color: C.ink, borderRadius: 99, padding: '15px 20px', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Logo size={20} />
              <span style={{ font: `800 15px ${F.display}`, letterSpacing: '-.01em' }}>CRÉER MA CARTE</span>
            </Tap>
          ) : null}

          <Tap
            onTap={close}
            style={{ marginTop: 12, background: C.ink, color: C.paper, borderRadius: 99, padding: '16px 20px', font: `800 16px ${F.display}`, letterSpacing: '-.01em', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            CONTINUER
          </Tap>
        </div>
      </div>
    </div>
  );
}
