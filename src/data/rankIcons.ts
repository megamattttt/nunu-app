/**
 * Jeu d'icônes de palier — géométrie partagée.
 * Un seul jeu de tracés (viewBox 0 0 24 24) réutilisé par :
 *  - <RankIcon /> en SVG dans l'interface,
 *  - ShareCard.tsx en Path2D sur le canvas d'export.
 *
 * mode :
 *  'fill'   → rempli avec la couleur du palier
 *  'line'   → contour dans la couleur du palier
 *  'knock'  → contour/remplissage dans la couleur de fond (facettes, découpes)
 */
export type IconPath = { d: string; mode: 'fill' | 'line' | 'knock'; sw?: number; fill?: boolean };

const SHIELD = 'M12 2.6l7 2.6v6.1c0 4.3-2.9 7.7-7 9.9-4.1-2.2-7-5.6-7-9.9V5.2z';
const CROWN = 'M3.2 18.4h17.6l-1.5-9.2-4.4 3.4L12 5.2 9.1 12.6 4.7 9.2z';

/** Un tableau par palier de TIERS, dans le même ordre. */
export const TIER_ICONS: IconPath[][] = [
  // FER — bouclier, contour seul
  [{ d: SHIELD, mode: 'line', sw: 1.8 }],
  // BRONZE — bouclier + un chevron
  [
    { d: SHIELD, mode: 'line', sw: 1.8 },
    { d: 'M8 13.4L12 10l4 3.4', mode: 'line', sw: 1.9 }
  ],
  // ARGENT — bouclier + deux chevrons
  [
    { d: SHIELD, mode: 'line', sw: 1.8 },
    { d: 'M8 11.6L12 8.2l4 3.4', mode: 'line', sw: 1.9 },
    { d: 'M8 15.8L12 12.4l4 3.4', mode: 'line', sw: 1.9 }
  ],
  // OR — bouclier plein + étoile centrale évidée
  [
    { d: SHIELD, mode: 'fill' },
    { d: 'M12 7.1l1.5 3.2 3.4.5-2.5 2.4.6 3.4L12 15l-3 1.6.6-3.4-2.5-2.4 3.4-.5z', mode: 'knock', fill: true }
  ],
  // PLATINE — losange/gemme à facettes simples
  [
    { d: 'M12 2.6l7 6.4-7 12-7-12z', mode: 'fill' },
    { d: 'M5 9h14M12 2.6V21', mode: 'knock', sw: 1.4 }
  ],
  // ÉMERAUDE — hexagone à facettes
  [
    { d: 'M12 2.7l8 4.7v9.2l-8 4.7-8-4.7V7.4z', mode: 'fill' },
    { d: 'M12 7l4.2 2.5v5L12 17l-4.2-2.5v-5z', mode: 'knock', sw: 1.4 }
  ],
  // DIAMANT — gemme taillée, plus de facettes
  [
    { d: 'M7.6 3.6h8.8L20.4 9.4 12 21.2 3.6 9.4z', mode: 'fill' },
    { d: 'M3.6 9.4h16.8M9.9 9.4L12 21.2l2.1-11.8M9.9 9.4l1.5-5.8m3.2 5.8l-1.5-5.8', mode: 'knock', sw: 1.3 }
  ],
  // MAÎTRE — couronne simple
  [
    { d: CROWN, mode: 'fill' },
    { d: 'M4.6 20.6h14.8', mode: 'line', sw: 2 }
  ],
  // GRAND MAÎTRE — couronne + ailes stylisées
  [
    { d: CROWN, mode: 'fill' },
    { d: 'M4.6 20.6h14.8', mode: 'line', sw: 2 },
    { d: 'M2 13.2c2.4-2.2 4.1-2.6 5.6-1.4M22 13.2c-2.4-2.2-4.1-2.6-5.6-1.4', mode: 'line', sw: 1.7 }
  ],
  // CHALLENGER — étoile rayonnante
  [
    { d: 'M12 3.4l2.4 5.6 6 1-4.3 4.2 1.1 6-5.2-2.8-5.2 2.8 1.1-6L3.6 10l6-1z', mode: 'fill' },
    { d: 'M12 .4v1.9M12 21.7v1.9M.6 12h1.9M21.5 12h1.9M4.1 4.1l1.4 1.4M18.5 18.5l1.4 1.4M19.9 4.1l-1.4 1.4M5.5 18.5l-1.4 1.4', mode: 'line', sw: 1.5 }
  ]
];
