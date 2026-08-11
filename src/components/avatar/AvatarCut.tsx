import React, { useMemo } from 'react';
import { viewSvg, ensureConfig, type AvConfig } from '../../lib/dicebear';

export type AvatarProps = {
  /** Configuration Big Ears (profil.av) — prioritaire sur `who`. */
  av?: AvConfig;
  /** Ami : la graine porte tout le personnage. */
  who?: string;
  /** Plan : portrait serré, buste ou plan large. */
  crop?: 'full' | 'half' | 'bust' | 'face';
  mood?: string;
  aura?: number;
  style?: React.CSSProperties;
};

/**
 * Avatar Big Ears — SVG généré localement, sans appel réseau.
 * Le cadrage passe par la fenêtre du SVG : pas de mise à l'échelle CSS,
 * donc jamais de visage coupé ni de déformation.
 */
export default function AvatarCut({ av, who, crop = 'bust', style }: AvatarProps) {
  const cfg: AvConfig = useMemo(
    () => (who ? { seed: who } : ensureConfig(av)),
    [who, JSON.stringify(av)]
  );
  const svg = useMemo(() => viewSvg(cfg, crop, 256), [cfg, crop]);

  return (
    <div
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
    />
  );
}
