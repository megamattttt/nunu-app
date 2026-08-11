import React from 'react';
import { C, F } from '../theme';
import { RANK_ART, RANK_FILTER } from '../data/rankArt';
import { TIERS, DIV_LABEL, type Rank } from '../data/ranks';

/**
 * Icône de palier — unique source visuelle du rang dans toute l'app.
 * Fleur en pixel art par palier ; la division s'écrit en chiffres romains dessous.
 * `bg` est conservé pour compatibilité d'appel.
 */
export function RankIcon({
  rank, size = 26, bg = C.ink, pips = true, style
}: { rank: Rank; size?: number; bg?: string; pips?: boolean; style?: React.CSSProperties }) {
  const src = RANK_ART[rank.tier] || RANK_ART[0];
  const filter = RANK_FILTER[rank.tier];
  const divs = TIERS[rank.tier].divs;

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: Math.max(2, size * 0.1), flex: 'none', ...style }}>
      <img
        src={src} alt="" width={size} height={size}
        style={{
          display: 'block', width: size, height: size, objectFit: 'contain',
          imageRendering: 'pixelated',
          filter: `${filter ? filter + ' ' : ''}drop-shadow(0 ${Math.round(size * 0.14)}px ${Math.round(size * 0.4)}px ${rank.c}55)`
        }}
      />
      {pips && divs > 1 && rank.div >= 0 ? (
        <span
          style={{
            font: `800 ${Math.max(8, Math.round(size * 0.36))}px ${F.mono}`,
            letterSpacing: '.08em', color: rank.c, lineHeight: 1,
            textShadow: `0 0 10px ${rank.c}55`
          }}
        >
          {DIV_LABEL[rank.div]}
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
  rank, skillName, size = 'lg', bg = 'rgba(11,11,12,.55)', onLight, onTap
}: { rank: Rank; skillName?: string; size?: 'sm' | 'md' | 'lg'; bg?: string; onLight?: boolean; onTap?: () => void }) {
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
          <span style={{ display: 'block', font: `500 ${S.kicker}px ${F.mono}`, letterSpacing: '.16em', color: onLight ? 'rgba(10,10,12,.45)' : 'rgba(255,255,255,.5)' }}>
            {skillName}
          </span>
        ) : null}
        <span style={{ display: 'block', font: `800 ${S.label}px/1 ${F.display}`, color: onLight ? C.ink : rank.c, letterSpacing: '-.02em', marginTop: skillName ? 4 : 0, whiteSpace: 'nowrap' }}>
          {rank.label}
        </span>
      </span>
    </span>
  );
}

export default RankIcon;
