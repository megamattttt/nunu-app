import React from 'react';
import { C, F } from '../theme';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';

export const Kicker = ({ children, dark, style }: any) => (
  <span style={{ font: `500 9.5px ${F.mono}`, letterSpacing: '.16em', color: dark ? 'rgba(11,11,12,.5)' : 'rgba(255,255,255,.45)', ...style }}>
    {children}
  </span>
);

export const Bar = ({ pct, c = C.lime, h = 10, track = 'rgba(11,11,12,.1)' }: any) => (
  <span style={{ display: 'block', height: h, borderRadius: 99, background: track, overflow: 'hidden', flex: 1 }}>
    <span style={{ display: 'block', height: '100%', width: Math.max(0, Math.min(100, pct)) + '%', borderRadius: 99, background: c, transition: 'width .7s cubic-bezier(.2,1,.3,1)' }} />
  </span>
);

type TapProps = React.HTMLAttributes<HTMLDivElement> & { onTap?: () => void; haptic?: any; sound?: boolean; as?: any };

/** Zone tactile : retour haptique + son + micro-échelle à l'appui. Cible ≥ 44px à respecter côté appelant. */
export function Tap({ onTap, haptic = 'tap', sound = true, children, style, as: Tag = 'div', ...rest }: TapProps) {
  const [down, setDown] = React.useState(false);
  return (
    <Tag
      {...rest}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onClick={(e: any) => { e.stopPropagation(); buzz(haptic); if (sound) sfx.tap(); onTap?.(); }}
      style={{ cursor: 'pointer', transform: down ? 'scale(.975)' : 'none', transition: 'transform .12s ease', ...style }}
    >
      {children}
    </Tag>
  );
}

export const BackBtn = ({ onTap, light }: { onTap: () => void; light?: boolean }) => (
  <Tap
    onTap={onTap}
    aria-label="Retour"
    style={{
      width: 44, height: 44, borderRadius: 99, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: light ? 'rgba(11,11,12,.08)' : 'rgba(255,255,255,.08)'
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={light ? C.ink : '#fff'} strokeWidth="2.6">
      <path d="M19 12H6M12 5l-7 7 7 7" />
    </svg>
  </Tap>
);

export const Chevron = ({ c = 'rgba(11,11,12,.35)' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" style={{ flex: 'none' }}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const Star = ({ size = 20, fill = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9L6.6 19.7l1-6L3.2 9.4l6.1-.9z" />
  </svg>
);

export const Check = ({ size = 17, c = C.ink, w = 3.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const Bolt = ({ size = 13, c = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={c}><path d="M13 2L5 14h5.5l-1 8 8-12H12z" /></svg>
);

/** En-tête d'écran secondaire (pioche, boutique, mur…). */
export const RouteHead = ({ title, sub, onBack, right }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
    <BackBtn onTap={onBack} />
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', font: `800 28px/1 ${F.display}`, color: '#fff', letterSpacing: '-.025em' }}>{title}</span>
      {sub ? <span style={{ display: 'block', font: `400 12px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{sub}</span> : null}
    </span>
    {right}
  </div>
);

export const Empty = ({ title, text, action }: any) => (
  <div style={{ border: '1px dashed rgba(255,255,255,.2)', borderRadius: 22, padding: '30px 22px', textAlign: 'center', marginTop: 14 }}>
    <div style={{ font: `800 18px ${F.display}`, color: '#fff', letterSpacing: '-.01em' }}>{title}</div>
    <div style={{ font: `400 12.5px/1.5 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 8 }}>{text}</div>
    {action}
  </div>
);
