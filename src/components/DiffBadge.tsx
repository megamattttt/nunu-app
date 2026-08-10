import React from 'react';
import { F } from '../theme';
import { DIFFS, type Difficulty } from '../data/quests';

/**
 * Badge de difficulté : libellé + jauge de segments remplis.
 * Un seul traitement visuel, réutilisé plateau / pioche / création.
 */
export default function DiffBadge({
  diff, size = 'md', style
}: { diff: Difficulty; size?: 'sm' | 'md'; style?: React.CSSProperties }) {
  const D = DIFFS[diff];
  const sm = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: sm ? 5 : 7, flex: 'none',
        background: D.c, color: D.txt, borderRadius: sm ? 7 : 8,
        padding: sm ? '4px 7px' : '5px 9px', ...style
      }}
    >
      <span style={{ font: `700 ${sm ? 8 : 8.5}px ${F.mono}`, letterSpacing: '.1em' }}>{D.label}</span>
      <span style={{ display: 'flex', gap: 2 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: sm ? 2.5 : 3, height: sm ? 7 : 9, borderRadius: 1,
              background: D.txt, opacity: i < D.blocks ? 0.9 : 0.22
            }}
          />
        ))}
      </span>
    </span>
  );
}
