import React, { useMemo } from 'react';
import { avatarSvg, ensureConfig, type AvConfig } from '../../lib/dicebear';

export type AvatarProps = {
  /** Configuration Big Ears (profil.av) — prioritaire sur `who`. */
  av?: AvConfig;
  /** Ami : la graine porte tout le personnage. */
  who?: string;
  /** Cadrage : simple zoom, le style Big Ears étant un portrait carré. */
  crop?: 'full' | 'half' | 'bust' | 'face';
  mood?: string;
  aura?: number;
  style?: React.CSSProperties;
};

const ZOOM: Record<string, number> = { face: 1.34, bust: 1.12, half: 1.02, full: 0.92 };

/** Avatar Big Ears — SVG généré localement, sans appel réseau. */
export default function AvatarCut({ av, who, crop = 'bust', style }: AvatarProps) {
  const cfg: AvConfig = useMemo(
    () => (who ? { seed: who } : ensureConfig(av)),
    [who, JSON.stringify(av)]
  );
  const svg = useMemo(() => avatarSvg(cfg, 256), [cfg]);
  const z = ZOOM[crop] ?? 1;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', ...style }}>
      <div
        aria-hidden
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{
          width: '100%', height: '100%',
          transform: `scale(${z})`, transformOrigin: '50% 46%',
          display: 'block'
        }}
      />
    </div>
  );
}
