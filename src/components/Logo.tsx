import React from 'react';
import { C, F } from '../theme';

const SRC = import.meta.env.BASE_URL + 'icons/logo-mark.png';

/**
 * Marque NUNU. `mark` seul, ou avec le mot posé à côté / dessous.
 * Présent sur le login, l'accueil, l'overlay de reprise et l'écran de chargement.
 */
export default function Logo({
  size = 40, word = false, stacked = false, wordSize, color = '#fff', glow = false, style
}: {
  size?: number; word?: boolean; stacked?: boolean; wordSize?: number;
  color?: string; glow?: boolean; style?: React.CSSProperties;
}) {
  const w = wordSize ?? Math.round(size * 0.86);
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: stacked ? 'column' : 'row', gap: stacked ? Math.round(size * 0.22) : Math.round(size * 0.3),
        ...style
      }}
    >
      <img
        src={SRC} alt="NUNU" width={size} height={size}
        style={{
          display: 'block', width: size, height: size, objectFit: 'contain',
          filter: glow ? `drop-shadow(0 10px 30px ${C.logo}88)` : undefined
        }}
      />
      {word ? (
        <span style={{ font: `800 ${w}px/1 ${F.display}`, color, letterSpacing: '-.045em' }}>NUNU</span>
      ) : null}
    </span>
  );
}
