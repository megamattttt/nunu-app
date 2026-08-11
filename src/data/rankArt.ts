const B = import.meta.env.BASE_URL + 'icons/ranks/';

/**
 * Icônes de palier en pixel art (une fleur par palier), dans l'ordre de TIERS.
 */
export const RANK_ART: string[] = [
  B + 'fer.png',
  B + 'bronze.png',
  B + 'argent.png',
  B + 'or.png',
  B + 'platine.png',
  B + 'emeraude.png',
  B + 'diamant.png',
  B + 'maitre.png',
  B + 'grand-maitre.png',
  B + 'challenger.png'
];

/** Filtre CSS appliqué à l'icône — aucun palier n'en a besoin aujourd'hui. */
export const RANK_FILTER: (string | null)[] = [
  null, null, null, null, null, null, null, null, null, null
];
