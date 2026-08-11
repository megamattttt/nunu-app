import React from 'react';
import { C, F } from '../theme';
import AvatarCut from './avatar/AvatarCut';

/** Coins coupés : silhouette de vignette de jeu plutôt que simple cercle. */
const CLIP = 'polygon(14% 0, 86% 0, 100% 14%, 100% 86%, 86% 100%, 14% 100%, 0 86%, 0 14%)';

type Props = {
  av?: Record<string, string>;
  who?: string;
  crop?: 'face' | 'bust' | 'full';
  size?: number | string;
  /** Rapport largeur/hauteur du cadre (1 = carré, 0.62 = portrait en pied). */
  ratio?: number;
  /** Couleur d'accent : compétence, rang, signature. */
  accent?: string;
  /** Chiffre affiché dans la pastille en bas à gauche. */
  level?: number;
  label?: string;
  onTap?: () => void;
  style?: React.CSSProperties;
};

/**
 * Vignette d'avatar : cadre à coins coupés, double liseré d'accent,
 * équerres aux angles, balayage lumineux lent. Utilisée partout où
 * un personnage est affiché en grand.
 */
export default function AvatarFrame({
  av, who, crop = 'bust', size = 132, ratio = 1, accent = C.lime, level, label, onTap, style
}: Props) {
  const w = typeof size === 'number' ? size + 'px' : size;
  const px = typeof size === 'number' ? size : 132;
  const tickSize = Math.max(6, Math.min(12, Math.round(px * 0.09)));
  const showTicks = px >= 44;
  const tick = (pos: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute', width: tickSize, height: tickSize, border: `2px solid ${accent}`, opacity: .85, ...pos
  });

  return (
    <span
      onClick={onTap ? () => onTap() : undefined}
      style={{
        display: 'block', position: 'relative', width: w, aspectRatio: `${ratio} / 1`,
        cursor: onTap ? 'pointer' : 'default', flex: 'none', ...style
      }}
    >
      {/* Liseré extérieur */}
      <span
        style={{
          position: 'absolute', inset: 0, clipPath: CLIP,
          background: `linear-gradient(150deg, ${accent}, ${accent}22 45%, ${accent}99)`
        }}
      />
      {/* Corps du cadre : fond seul, découpé aux coins */}
      <span
        style={{
          position: 'absolute', inset: 2, clipPath: CLIP, overflow: 'hidden',
          background: `linear-gradient(180deg, ${C.steel}, ${C.ink})`
        }}
      />

      {/* Personnage : couche libre, légèrement plus grande que le cadre.
          Il déborde donc un peu des coins coupés plutôt que d'être rogné
          net sur les côtés — oreilles et coiffures restent entières. */}
      <span style={{ position: 'absolute', inset: '-4%', pointerEvents: 'none' }}>
        <AvatarCut av={av} who={who} crop={crop} />
      </span>

      {/* Reflets et voile bas, redessinés par-dessus dans la découpe */}
      <span style={{ position: 'absolute', inset: 2, clipPath: CLIP, overflow: 'hidden', pointerEvents: 'none' }}>
        <span
          style={{
            position: 'absolute', top: 0, bottom: 0, width: '38%',
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent)',
            animation: 'nuShine 6s ease-in-out infinite'
          }}
        />
        <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', background: 'linear-gradient(180deg,transparent,rgba(10,10,12,.72))' }} />
      </span>

      {/* Équerres */}
      {showTicks ? (
        <>
          <span style={tick({ left: 5, top: 5, borderRight: 'none', borderBottom: 'none' })} />
          <span style={tick({ right: 5, top: 5, borderLeft: 'none', borderBottom: 'none' })} />
          <span style={tick({ left: 5, bottom: 5, borderRight: 'none', borderTop: 'none' })} />
          <span style={tick({ right: 5, bottom: 5, borderLeft: 'none', borderTop: 'none' })} />
        </>
      ) : null}

      {level !== undefined ? (
        <span
          style={{
            position: 'absolute', left: 9, bottom: 9, background: C.ink, border: `1px solid ${accent}`,
            borderRadius: 9, padding: '4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: `0 8px 20px -12px ${accent}`
          }}
        >
          <span style={{ font: `500 6.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.5)' }}>NIV</span>
          <span style={{ font: `800 16px/1 ${F.display}`, color: '#fff', letterSpacing: '-.02em' }}>{level}</span>
        </span>
      ) : null}

      {label ? (
        <span
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 8, textAlign: 'center',
            font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.62)'
          }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
