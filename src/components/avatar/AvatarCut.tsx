import React, { useMemo } from 'react';
import { computeAvatar } from './avatarEngine';
import { css } from '../../lib/css';

type Part = { d: string; t?: string; fill?: string; stroke?: string; sw?: number; op?: number; f?: string };

export type AvatarProps = {
  /** Configuration complète (profil.av) — prioritaire sur `who`. */
  av?: Record<string, number>;
  /** Préréglage d'ami : 'lea', 'karim', 'nina'… */
  who?: string;
  crop?: 'full' | 'half' | 'bust' | 'face';
  mood?: string;
  aura?: number;
  style?: React.CSSProperties;
};

const paths = (list: Part[] = [], extra: Record<string, any> = {}) =>
  list.map((p, i) => (
    <path
      key={i} d={p.d} transform={p.t || undefined} fill={p.fill || 'none'}
      stroke={p.stroke && p.stroke !== 'none' ? p.stroke : undefined}
      strokeWidth={p.sw || undefined} opacity={p.op ?? 1}
      filter={p.f && p.f !== 'none' ? p.f : undefined}
      strokeLinejoin="round" strokeLinecap="round" {...extra}
    />
  ));

/** Avatar papier découpé — rendu procédural, aucune image. */
export default function AvatarCut({ av, who, crop = 'bust', mood, aura, style }: AvatarProps) {
  const v: any = useMemo(
    () => computeAvatar({ av, who, crop, mood, aura }),
    [JSON.stringify(av), who, crop, mood, aura]
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'block', overflow: 'hidden', position: 'relative', ...style }}>
      <svg viewBox={v.vb} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <filter id={v.shId} x="-45%" y="-45%" width="190%" height="200%">
            <feDropShadow dx="1.1" dy="2" stdDeviation="0.45" floodColor="#2B1C12" floodOpacity="0.32" />
          </filter>
          <pattern id={v.dotId} width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="1.9" fill={v.bgAcc} />
          </pattern>
          <pattern id={v.patId} width={v.patW} height={v.patH} patternUnits="userSpaceOnUse">
            <path d={v.patBase} fill={v.topC} />
            {paths(v.patParts)}
          </pattern>
        </defs>

        <path d="M-60,-60H160V240H-60Z" fill={v.bg} />
        {paths(v.bgParts)}

        <g style={css(v.aSpin)}>{paths(v.auraSpin)}</g>
        <g style={css(v.aPulse)}>{paths(v.auraPulse)}</g>
        <g style={css(v.aBob)}>{paths(v.bodyParts)}</g>

        <g transform={v.headT}>
          <g style={css(v.aBreath)}>
            {paths(v.headParts)}
            <g style={css(v.aBlink)}>{paths(v.eyeParts)}</g>
            {paths(v.frontParts)}
          </g>
        </g>

        <g style={{ mixBlendMode: 'multiply' }}>{paths(v.texParts)}</g>
      </svg>
      <span
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.14,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>")`,
          backgroundSize: '140px 140px'
        }}
      />
    </div>
  );
}
