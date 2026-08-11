
/**
 * Palette « high-tech douce » — fond sombre, accents désaturés.
 *  lime   : progression / action (barres, boutons, PX)
 *  honey  : récompense / validation (paliers, pièces, cartes obtenues)
 *  coral  : alerte / urgence, réservée aux moments rares (combo chaud, en feu)
 *  azur   : information calme (semaine, statistiques, liens)
 *  iris   : rare / exceptionnel (pioche, objets)
 *  teal   : réussite tranquille (validé, tâches cochées)
 *  ink / night / slate / steel : surfaces sombres, du plus profond au plus clair
 *  paper / sand : surfaces claires
 * Les couleurs de palier (TIERS[].c) gardent leur propre logique : elles codent une information.
 */
export const C = {
  ink: '#0A0A0C',
  night: '#131318',
  /** Surface secondaire sombre (cartes posées sur le fond). */
  slate: '#1C1C23',
  /** Surface tertiaire, pour les éléments en relief sur une carte sombre. */
  steel: '#262630',
  paper: '#F4F2ED',
  sand: '#DED6C6',

  lime: '#B9DE64',
  honey: '#E8B863',
  coral: '#E2685A',
  azur: '#6FA5D8',
  iris: '#9C8AD6',
  teal: '#5CBFAE',

  /** Filets et séparateurs sur fond sombre / clair. */
  line: 'rgba(255,255,255,.09)',
  lineSoft: 'rgba(255,255,255,.055)',
  lineDark: 'rgba(10,10,12,.09)',

  /* Alias de compatibilité : tout retombe sur la palette resserrée. */
  violet: '#1C1C23',
  sky: '#DED6C6',
  purple: '#1C1C23',
  mint: '#B9DE64',

  logo: '#2F2BC9',
  wood: '#3A2A1C',
  woodPaper: '#F4E7D3'
};

/** Couleurs de signature disponibles dans le profil. */
export const SIG = ['#B9DE64', '#E2685A', '#E8B863', '#DED6C6', '#6FA5D8', '#9C8AD6', '#5CBFAE', '#F4F2ED'];

export const F = {
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace"
};

/** Raccourcis typo (font shorthand) utilisés partout dans les écrans. */
export const T = {
  kicker: `500 9.5px ${F.mono}`,
  mono: `700 11px ${F.mono}`,
  h1: `800 42px/1 ${F.display}`,
  h2: `800 28px/1 ${F.display}`,
  h3: `800 21px ${F.display}`,
  body: `400 13px/1.45 ${F.body}`,
  strong: `700 13.5px ${F.body}`
};

/** Rythme vertical commun : plus aéré qu'avant. */
export const S = { gutter: 22, gap: 16, gapLg: 22, section: 28 };

export const RADIUS = { card: 26, tile: 22, chip: 16, pill: 99 };
export const ease = 'cubic-bezier(.2,1.2,.3,1)';
