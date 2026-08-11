import React, { useMemo } from 'react';
import { viewSvg, bleedSvg, ensureConfig, type AvConfig } from '../../lib/dicebear';

export type AvatarProps = {
  /** Configuration Big Ears (profil.av) — prioritaire sur `who`. */
  av?: AvConfig;
  /** Ami : la graine porte tout le personnage. */
  who?: string;
  /** Plan : portrait serré, buste ou plan large. */
  crop?: 'full' | 'half' | 'bust' | 'face';
  /** Couche de premier plan : sans décor, autorisée à déborder du cadre. */
  bleed?: boolean;
  mood?: string;
  aura?: number;
  style?: React.CSSProperties;
};

/**
 * Avatar Big Ears — SVG généré localement, sans appel réseau.
 * Le cadrage passe par la fenêtre du SVG : pas de mise à l'échelle CSS,
 * donc jamais de visage coupé ni de déformation.
 */
export default function AvatarCut({ av, who, crop = 'bust', bleed, style }: AvatarProps) {
  const cfg: AvConfig = useMemo(
    () => (who ? { seed: who } : ensureConfig(av)),
    [who, JSON.stringify(av)]
  );
  const svg = useMemo(() => (bleed ? bleedSvg(cfg, crop, 256) : viewSvg(cfg, crop, 256)), [cfg, crop, bleed]);

  return (
    <div
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ width: '100%', height: '100%', overflow: bleed ? 'visible' : 'hidden', ...style }}
    />
  );
}
