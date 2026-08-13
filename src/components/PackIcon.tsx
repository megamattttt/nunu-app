import React, { useState } from 'react';
import { C } from '../theme';
import { DEFAULT_PACK_ICON, packIconLabel, packIconSrc } from '../data/packIcons';

/**
 * Icône de pack : le sticker couleur si le réseau répond, sinon une pastille
 * sobre aux couleurs de l'application. Aucun cadre, aucun fond ajouté.
 */
export default function PackIcon({ id, size = 26 }: { id?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const icon = id || DEFAULT_PACK_ICON;

  if (failed) {
    return (
      <span
        aria-hidden
        style={{
          width: size, height: size, borderRadius: 9, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(156,138,214,.18)', border: `1px solid ${C.iris}55`
        }}
      >
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={C.iris} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M4 7h6l2 2h8v10H4z" />
        </svg>
      </span>
    );
  }

  return (
    <img
      src={packIconSrc(icon, Math.round(size * 2))}
      alt={packIconLabel(icon)}
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{ width: size, height: size, flex: 'none', display: 'block', background: 'transparent' }}
    />
  );
}
