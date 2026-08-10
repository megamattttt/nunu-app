import React from 'react';
import { C, F } from '../theme';
import { TIER_ICONS } from '../data/rankIcons';
import { TIERS, type Rank } from '../data/ranks';

/**
 * Icône de palier — unique source visuelle du rang dans toute l'app.
 * `bg` sert aux facettes évidées (elles reprennent la couleur du fond).
 */
export function RankIcon({
  rank, size = 26, bg = C.ink, pips = true, style
}: { rank: Rank; size?: number; bg?: string; pips?: boolean; style?: React.CSSProperties }) {
  const paths = TIER_ICONS[rank.tier] || TIER_ICONS[0];
  const divs = TIERS[rank.tier].divs;
  const filled = rank.div >= 0 ? rank.div + 1 : 0;

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: Math.max(3, size * 0.14), flex: 'none', ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', overflow: 'visible' }}>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.mode === 'fill' ? rank.c : p.mode === 'knock' && p.fill ? bg : 'none'}
            stroke={p.mode === 'knock' ? (p.fill ? 'none' : bg) : p.mode === 'line' ? rank.c : 'none'}
            strokeWidth={p.sw || 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {pips && divs > 1 ? (
        <span style={{ display: 'flex', gap: Math.max(2, size * 0.09) }}>
          {Array.from({ length: divs }, (_, i) => (
            <span
              key={i}
              style={{
                width: Math.max(3, size * 0.16), height: Math.max(3, size * 0.16), borderRadius: 99,
                background: i < filled ? rank.c : 'transparent',
                border: i < filled ? 'none' : `1px solid ${rank.c}`, opacity: i < filled ? 1 : 0.4
              }}
            />
          ))}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Badge de rang — format unique réutilisé sur l'accueil, le profil,
 * les quêtes et les cartes de partage.
 */
export function RankBadge({
  rank, skillName, size = 'lg', bg = 'rgba(11,11,12,.55)', onTap
}: { rank: Rank; skillName?: string; size?: 'sm' | 'md' | 'lg'; bg?: string; onTap?: () => void }) {
  const S = size === 'lg' ? { ico: 46, pad: '12px 16px 12px 13px', label: 21, kicker: 8.5, r: 20 }
    : size === 'md' ? { ico: 32, pad: '9px 13px 9px 10px', label: 15, kicker: 8, r: 16 }
    : { ico: 22, pad: '6px 10px 6px 7px', label: 12, kicker: 7.5, r: 12 };

  return (
    <span
      onClick={onTap ? () => onTap() : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: size === 'lg' ? 13 : 9, background: bg,
        border: `1px solid ${rank.c}55`, borderRadius: S.r, padding: S.pad, cursor: onTap ? 'pointer' : 'default',
        boxShadow: size === 'lg' ? `0 14px 30px -20px ${rank.c}` : 'none'
      }}
    >
      <RankIcon rank={rank} size={S.ico} bg={C.ink} />
      <span style={{ minWidth: 0 }}>
        {skillName ? (
          <span style={{ display: 'block', font: `500 ${S.kicker}px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.5)' }}>
            {skillName}
          </span>
        ) : null}
        <span style={{ display: 'block', font: `800 ${S.label}px/1 ${F.display}`, color: rank.c, letterSpacing: '-.02em', marginTop: skillName ? 4 : 0, whiteSpace: 'nowrap' }}>
          {rank.label}
        </span>
      </span>
    </span>
  );
}

export default RankIcon;
