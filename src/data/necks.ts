/**
 * Cous DandyMTP — couche « cou » du studio d'avatar (style Big Ears).
 *
 * Même principe que `garments.ts` : chaque forme est une fonction
 * (p: Palette) => string qui renvoie du SVG dans la boîte 440 × 440, calée sur
 * la géométrie réelle du bust crop (menton bas ~y438, mâchoires x~150 / x~290).
 *
 * La colonne monte à y≈388, donc bien au-dessus du menton : le haut du cou est
 * masqué par le visage, il ne reste visible que la partie entre le menton et
 * l'encolure (et l'intérieur des cols ouverts). Elle descend jusqu'à y448, si
 * bien qu'aucun trou n'apparaît, quelle que soit la pièce portée — y compris
 * « Aucun ».
 *
 * La couleur n'est jamais choisie : elle est dérivée du `skinColor` du visage
 * via `palette()`, la même fonction que pour les vêtements.
 */

import { palette, type Palette } from './garments';

/** Axe du visage (mâchoires à x150 / x290). */
const CX = 219;

/** Haut de la colonne : franchement au-dessus du menton, donc invisible. */
const TOP = 388;
/** Bas de la boîte de dessin (identique aux tenues). */
const BOT = 448;

/**
 * Colonne du cou : trapèze doux (demi-largeur `tw` en haut, `bw` en bas),
 * ombre portée du menton (le bandeau descend jusqu'à `shadeTo`, juste sous la
 * ligne de menton pour que l'ombre se voie), flanc droit assombri, lumière à
 * gauche.
 */
function column(p: Palette, tw: number, bw: number, shadeTo = 418): string {
  const t = CX - tw, T = CX + tw, b = CX - bw, B = CX + bw;
  const r = (shadeTo - TOP) / (BOT - TOP);
  const sl = t + (b - t) * r, sr = T + (B - T) * r;
  const f = (n: number) => n.toFixed(1);
  return `
  <path d="M${f(t)} ${TOP} L${f(b)} ${BOT} L${f(B)} ${BOT} L${f(T)} ${TOP} Z" fill="${p.base}"/>
  <path d="M${f(CX + tw * .2)} ${TOP} L${f(CX + bw * .2)} ${BOT} L${f(B)} ${BOT} L${f(T)} ${TOP} Z" fill="${p.shadow}" fill-opacity=".5"/>
  <path d="M${f(t)} ${TOP} L${f(b)} ${BOT} L${f(b + bw * .38)} ${BOT} L${f(t + tw * .38)} ${TOP} Z" fill="${p.light}" fill-opacity=".2"/>
  <path d="M${f(t)} ${TOP} H${f(T)} L${f(sr)} ${shadeTo} H${f(sl)} Z" fill="${p.shadow2}" fill-opacity=".55"/>`;
}

/* ---------------- Les 4 formes ---------------- */

/** 1 — Fin : colonne étroite, presque droite. Silhouette élancée. */
export function fin(p: Palette): string {
  return `<g>${column(p, 29, 35, 441)}</g>`;
}

/** 2 — Standard : cylindre légèrement évasé vers les épaules. */
export function standard(p: Palette): string {
  return `<g>${column(p, 38, 49, 441)}</g>`;
}

/** 3 — Large : colonne épaisse, amorce de trapèzes de part et d'autre. */
export function large(p: Palette): string {
  return `<g>${column(p, 47, 63, 442)}
  <path d="M156 ${BOT} C168 434 180 428 196 426 L196 ${BOT} Z" fill="${p.shadow}" fill-opacity=".45"/>
  <path d="M282 ${BOT} C270 434 258 428 242 426 L242 ${BOT} Z" fill="${p.shadow}" fill-opacity=".6"/></g>`;
}

/** 4 — Court : cou trapu, épaules qui remontent haut sous la mâchoire. */
export function court(p: Palette): string {
  return `<g>${column(p, 43, 67, 437)}
  <path d="M152 ${BOT} C170 424 196 416 219 416 C242 416 268 424 286 ${BOT} Z" fill="${p.base}"/>
  <path d="M219 416 C242 416 268 424 286 ${BOT} L219 ${BOT} Z" fill="${p.shadow}" fill-opacity=".42"/>
  <path d="M152 ${BOT} C170 424 196 416 219 416" fill="none" stroke="${p.light}" stroke-opacity=".22" stroke-width="3"/></g>`;
}

/* ---------------- Catalogue ---------------- */

export type NeckDef = { id: string; label: string; draw: ((p: Palette) => string) | null; rise: number };

/**
 * Catalogue des cous. Ordre = ordre d'affichage dans le studio.
 * `rise` : de combien la tête est remontée (en unités 440) pour dégager le cou.
 * Sans ce léger décalage, le menton du style touche presque l'encolure et
 * aucune forme ne serait lisible ; la colonne monte à y388, donc même relevée
 * la tête ne laisse aucun trou.
 */
export const NECKS: NeckDef[] = [
  { id: 'aucun',    label: 'Aucun',    draw: null,     rise: 0 },
  { id: 'fin',      label: 'Fin',      draw: fin,      rise: 17 },
  { id: 'standard', label: 'Standard', draw: standard, rise: 15 },
  { id: 'large',    label: 'Large',    draw: large,    rise: 13 },
  { id: 'court',    label: 'Court',    draw: court,    rise: 7 }
];

export const NECK_IDS = NECKS.map((n) => n.id);

const BY_ID: Record<string, NeckDef> = Object.fromEntries(NECKS.map((n) => [n.id, n]));

/** Teint de repli si la config n'en porte pas encore. */
const DEFAULT_SKIN = 'F2D3B1';

/**
 * Rend le SVG d'un cou. `id` est la forme, `skin` le hex du teint du visage
 * (avec ou sans « # ») : le cou n'a pas de palette propre, il reprend la peau.
 */
export function neckSvg(id: string | undefined, skin: string | undefined): string {
  if (!id || id === 'aucun') return '';
  const def = BY_ID[id];
  if (!def || !def.draw) return '';
  return def.draw(palette('#' + (skin || DEFAULT_SKIN).replace(/^#/, '')));
}

/** Liste { id, label } pour la barre de sous-catégories du studio. */
export function neckShapes(): { id: string; label: string }[] {
  return NECKS.map((n) => ({ id: n.id, label: n.label }));
}

/** Nom lisible d'une forme. */
export const neckLabel = (id: string) => BY_ID[id]?.label || id;

/** Remontée de la tête associée à une forme (0 si pas de cou). */
export const neckRise = (id: string | undefined): number => (id && BY_ID[id]?.rise) || 0;
