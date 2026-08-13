import { createAvatar } from '@dicebear/core';
import { bigEars } from '@dicebear/collection';
import { garmentSvg, garmentPieces, garmentColors, garmentValue, parseGarment, defaultColor } from '../data/garments';
import { neckSvg, neckShapes, neckLabel, neckRise, NECK_IDS } from '../data/necks';

/**
 * Avatars « Big Ears » (The Visual Team, CC BY 4.0) générés localement.
 * La bibliothèque est empaquetée avec l'application : aucune requête réseau,
 * la génération marche donc hors ligne dès que l'app est chargée.
 *
 * Les options de style ne sont jamais écrites en dur : elles sont lues dans le
 * schéma exposé par la collection. S'y ajoutent deux couches maison — la
 * couleur de fond et un motif décoratif — composées autour du personnage.
 */

export type AvConfig = Record<string, string>;

const SCHEMA: Record<string, any> = ((bigEars as any).schema?.properties) || {};

/** Boîte de dessin du style : tout le reste du fichier raisonne en unités 440. */
const VB = 440;

/* ---------------- Options maison ---------------- */

const BG_PALETTE = ['transparent', '0A0A0C', '1C1C23', 'B9DE64', 'E8B863', 'E2685A', '6FA5D8', '9C8AD6', '5CBFAE', 'F4F2ED', 'DED6C6'];
const PATTERN_PALETTE = ['FFFFFF', '0A0A0C', 'B9DE64', 'E8B863', 'E2685A', '6FA5D8', '9C8AD6', '5CBFAE', 'DED6C6'];

/** Teintes ajoutées aux palettes du style, qui n'en proposent que quatre. */
const EXTRA_PALETTE: Record<string, string[]> = {
  hairColor: ['724133', 'a55728', 'b58143', 'b04a3a', '6a4e9c', '3f6fb8', '2c8c73', 'a9d63f', '9a9aa0'],
  skinColor: ['f2d3b1', '8c4a2f', '6b3520', '4b2e1d']
};

/** Motifs de fond : tracés simples, dessinés dans la boîte 440 × 440. */
const PATTERNS: Record<string, (c: string) => string> = {
  aucun: () => '',
  rayures: (c) => Array.from({ length: 11 }, (_, i) =>
    `<path d="M${-440 + i * 80} 440L${i * 80} 0" stroke="${c}" stroke-width="26" stroke-linecap="square"/>`).join(''),
  grille: (c) => [
    ...Array.from({ length: 6 }, (_, i) => `<path d="M${i * 88} 0V440" stroke="${c}" stroke-width="8"/>`),
    ...Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 88}H440" stroke="${c}" stroke-width="8"/>`)
  ].join(''),
  pois: (c) => Array.from({ length: 25 }, (_, i) =>
    `<circle cx="${44 + (i % 5) * 88}" cy="${44 + Math.floor(i / 5) * 88}" r="15" fill="${c}"/>`).join(''),
  anneaux: (c) => [70, 130, 190, 250].map((r) =>
    `<circle cx="220" cy="220" r="${r}" fill="none" stroke="${c}" stroke-width="14"/>`).join(''),
  rayons: (c) => Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30) * Math.PI / 180;
    const b = (i * 30 + 13) * Math.PI / 180;
    return `<path d="M220 220L${220 + Math.cos(a) * 400} ${220 + Math.sin(a) * 400}L${220 + Math.cos(b) * 400} ${220 + Math.sin(b) * 400}Z" fill="${c}"/>`;
  }).join(''),
  spirale: (c) => {
    let d = 'M220 220';
    for (let i = 0; i <= 220; i++) {
      const a = i * 0.22, r = i * 1.35;
      d += `L${(220 + Math.cos(a) * r).toFixed(1)} ${(220 + Math.sin(a) * r).toFixed(1)}`;
    }
    return `<path d="${d}" fill="none" stroke="${c}" stroke-width="13" stroke-linecap="round"/>`;
  },
  etincelles: (c) => [[70, 90, 34], [350, 70, 26], [90, 330, 26], [370, 320, 34], [220, 40, 20], [40, 220, 18], [400, 200, 18]]
    .map(([x, y, s]) =>
      `<path d="M${x} ${y - s}C${x + s * .18} ${y - s * .18} ${x + s * .18} ${y - s * .18} ${x + s} ${y}C${x + s * .18} ${y + s * .18} ${x + s * .18} ${y + s * .18} ${x} ${y + s}C${x - s * .18} ${y + s * .18} ${x - s * .18} ${y + s * .18} ${x - s} ${y}C${x - s * .18} ${y - s * .18} ${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="${c}"/>`).join(''),
  arche: (c) => `<path d="M60 440V220a160 160 0 0 1 320 0v220Z" fill="${c}"/>`,
  damier: (c) => Array.from({ length: 36 }, (_, i) => {
    const x = i % 6, y = Math.floor(i / 6);
    return (x + y) % 2 ? `<rect x="${x * 74}" y="${y * 74}" width="74" height="74" fill="${c}"/>` : '';
  }).join(''),
  vagues: (c) => Array.from({ length: 6 }, (_, i) =>
    `<path d="M-20 ${40 + i * 80}q55 -46 110 0t110 0t110 0t110 0" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/>`).join(''),
  confettis: (c) => Array.from({ length: 22 }, (_, i) => {
    const x = (i * 97) % 420 + 10, y = (i * 143) % 410 + 10, r = (i * 37) % 180;
    return `<rect x="${x}" y="${y}" width="34" height="12" rx="6" fill="${c}" transform="rotate(${r} ${x + 17} ${y + 6})"/>`;
  }).join('')
};

export const PATTERN_IDS = Object.keys(PATTERNS);

/** Clés gérées par l'application, hors schéma du style. */
const APP_KEYS = ['backgroundColor', 'pattern', 'patternColor', 'garment', 'cou'];

/** Toutes les clés d'option, dans l'ordre du schéma puis des couches maison. */
export const AV_KEYS = [...Object.keys(SCHEMA), ...APP_KEYS];

const isColorKey = (k: string) => /color$/i.test(k);
const isProbaKey = (k: string) => /probability$/i.test(k);

/** Valeurs possibles d'une option à choix. Vide pour les couleurs. */
export function optionsOf(key: string): string[] {
  if (key === 'pattern') return PATTERN_IDS;
  if (key === 'cou') return [...NECK_IDS];
  const p = SCHEMA[key];
  if (!p) return [];
  const items = p.items || p;
  return Array.isArray(items?.enum) ? [...items.enum] : [];
}

/** Palette d'une option de couleur : celle du style, élargie de quelques teintes. */
export function paletteOf(key: string): string[] {
  if (key === 'backgroundColor') return BG_PALETTE;
  if (key === 'patternColor') return PATTERN_PALETTE;
  const p = SCHEMA[key];
  const def = p?.default;
  const list = Array.isArray(def) ? def : def != null ? [def] : [];
  const official = list.filter((v: any) => typeof v === 'string').map((v: string) => v.replace(/^#/, ''));
  return [...new Set([...official, ...(EXTRA_PALETTE[key] || [])])];
}

export type AvKind = 'choice' | 'color' | 'toggle';

export const kindOf = (key: string): AvKind => (isProbaKey(key) ? 'toggle' : isColorKey(key) ? 'color' : 'choice');

/* ---------------- Cadrages ---------------- */

/**
 * Zones du visage, mesurées sur le rendu réel du style.
 * Elles servent aux vignettes : chaque option se voit isolée, agrandie,
 * au lieu d'obliger à chercher la différence sur un visage entier.
 */
const ZONES: Record<string, string> = {
  face: '95 125 250 290',
  skinColor: '95 125 250 290',
  eyes: '152 238 132 76',
  nose: '176 288 88 56',
  mouth: '165 326 108 48',
  cheek: '133 288 175 55',
  cheekProbability: '133 288 175 55',
  ear: '74 241 294 83',
  hair: '80 95 280 190',
  hairColor: '80 95 280 190',
  frontHair: '119 149 202 113',
  sideburn: '116 233 206 73'
};

/** Cadrages d'affichage : large à dessein, pour ne jamais rogner oreilles ni coiffure. */
const VIEWS: Record<string, string> = {
  face: '52 86 336 336',
  bust: '22 52 396 396',
  half: '22 52 396 396',
  full: '0 26 440 440'
};

/** Options d'affichage qui doivent garder le fond et le décor. */
const KEEP_SCENE = new Set(['pattern', 'patternColor', 'backgroundColor']);

/* ---------------- Rendu ---------------- */

const cache = new Map<string, string>();
let clipSeq = 0;

/** Options passées au style : seules les clés qu'il connaît. */
function styleOptions(cfg: AvConfig, size: number) {
  const o: Record<string, any> = { seed: cfg.seed || 'nunu', size, backgroundColor: ['transparent'] };
  for (const k of Object.keys(SCHEMA)) {
    const v = cfg[k];
    if (v === undefined || v === '') continue;
    if (isProbaKey(k)) o[k] = Number(v) || 0;
    else o[k] = [String(v).replace(/^#/, '')];
  }
  return o;
}

const innerOf = (svg: string) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

type Opts = { view?: string; scene?: boolean; fit?: 'slice' | 'meet'; clip?: string; bleed?: boolean };

/**
 * SVG complet et autonome : fond, motif, puis personnage.
 * `view` est la fenêtre (viewBox) affichée, `scene` garde ou non le décor,
 * `clip` découpe le dessin à une zone précise (vignettes d'option).
 */
export function avatarSvg(cfg: AvConfig, size = 128, opts: Opts = {}): string {
  const view = opts.view || `0 0 ${VB} ${VB}`;
  const scene = opts.scene !== false;
  const fit = opts.fit || 'slice';
  const clip = opts.clip || '';
  const bleed = !!opts.bleed;
  const key = [size, view, scene, fit, clip, bleed, cfg.seed || '', ...AV_KEYS.map((k) => cfg[k] ?? '')].join('|');
  const hit = cache.get(key);
  if (hit) return hit;

  const body = innerOf(createAvatar(bigEars, styleOptions(cfg, size)).toString());
  const bg = scene ? (cfg.backgroundColor || 'transparent') : 'transparent';
  const bgFill = bg === 'transparent' ? 'none' : '#' + bg.replace(/^#/, '');
  const patId = scene ? (cfg.pattern || 'aucun') : 'aucun';
  const patColor = '#' + (cfg.patternColor || 'FFFFFF').replace(/^#/, '');
  const pattern = (PATTERNS[patId] || PATTERNS.aucun)(patColor);

  const garment = scene ? garmentSvg(cfg.garment) : '';
  // Le cou est au tout premier plan de l'arrière-plan : il passe SOUS la tenue
  // et sous le visage, il ne se voit donc que dans l'échancrure de l'encolure.
  // Sa teinte suit celle du visage.
  const neck = scene ? neckSvg(cfg.cou, cfg.skinColor) : '';
  // Le personnage est légèrement remonté quand un cou est porté : sans ça, le
  // menton du style touche l'encolure et le cou ne se verrait pas.
  const rise = neckRise(cfg.cou);
  const figure = rise ? `<g transform="translate(0 ${-rise})">${body}</g>` : body;

  const inner =
    `<rect x="-40" y="-40" width="${VB + 80}" height="${VB + 80}" fill="${bgFill}"/>` +
    (pattern ? `<g opacity="0.34">${pattern}</g>` : '') +
    neck +
    garment +
    figure;

  let content = inner;
  if (clip) {
    const [x, y, w, h] = clip.split(' ');
    const id = 'nuz' + (++clipSeq);
    content = `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`;
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="100%" height="100%" ` +
    `preserveAspectRatio="xMidYMid ${fit}" style="display:block${bleed ? ';overflow:visible' : ''}">${content}</svg>`;

  if (cache.size > 500) cache.clear();
  cache.set(key, svg);
  return svg;
}

/** Rendu d'affichage, cadré selon le plan demandé. */
export const viewSvg = (cfg: AvConfig, crop: string = 'bust', size = 256) =>
  avatarSvg(cfg, size, { view: VIEWS[crop] || VIEWS.bust });

/**
 * Même personnage, sans décor et libre de déborder de sa boîte : cette couche
 * se superpose au rendu cadré pour que la coiffure passe devant le cadre.
 */
export const bleedSvg = (cfg: AvConfig, crop: string = 'bust', size = 256) =>
  avatarSvg(cfg, size, { view: VIEWS[crop] || VIEWS.bust, scene: false, bleed: true });

/**
 * Vignette d'option : la zone du visage concernée, agrandie, sans décor —
 * l'élément se reconnaît au premier coup d'œil.
 */
export function thumbSvg(cfg: AvConfig, key: string, value: string, size = 84): string {
  const next = { ...cfg, [key]: value };
  if (KEEP_SCENE.has(key)) return avatarSvg(next, size, { view: `0 0 ${VB} ${VB}` });
  const zone = ZONES[key];
  if (!zone) return avatarSvg(next, size, { view: VIEWS.face, scene: false });
  return avatarSvg(next, size, { view: zone, scene: false, fit: 'meet', clip: zone });
}

/** Avatar d'un ami : la graine suffit, tout le reste est déduit. */
export const seedSvg = (seed: string, crop = 'bust', size = 96) => viewSvg({ seed }, crop, size);

/* ---------------- Configuration ---------------- */

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const randomSeed = () => Math.random().toString(36).slice(2, 10);

/** Configuration complète tirée au hasard, dans les valeurs du style. */
export function randomConfig(): AvConfig {
  const cfg: AvConfig = { seed: randomSeed() };
  for (const k of AV_KEYS) {
    if (isProbaKey(k)) { cfg[k] = pick(['0', '100']); continue; }
    const opts = optionsOf(k);
    if (opts.length) { cfg[k] = pick(opts); continue; }
    const pal = paletteOf(k);
    if (pal.length) cfg[k] = pick(pal);
  }
  return cfg;
}

/** L'état sauvegardé vient-il de l'ancien moteur (valeurs numériques) ? */
export const isLegacy = (av: any): boolean =>
  !av || typeof av !== 'object' || !av.seed || Object.values(av).some((v) => typeof v === 'number');

/** Configuration valide garantie — migre l'ancien format sans rien casser. */
export const ensureConfig = (av: any): AvConfig => (isLegacy(av) ? randomConfig() : (av as AvConfig));

/** Dernière variante d'une option — utilisée par la boutique. */
export function lastOption(key: string): AvConfig {
  const opts = optionsOf(key);
  return opts.length ? { [key]: opts[opts.length - 1] } : {};
}

/* ---------------- Habillage français ---------------- */

const LABELS: Record<string, string> = {
  seed: 'Graine',
  skinColor: 'Teint',
  face: 'Visage',
  eyes: 'Yeux',
  nose: 'Nez',
  mouth: 'Bouche',
  ear: 'Oreilles',
  cheek: 'Joues',
  cheekProbability: 'Afficher les joues',
  hair: 'Coupe',
  hairColor: 'Couleur',
  frontHair: 'Frange',
  sideburn: 'Favoris',
  garment: 'Pièce',
  cou: 'Cou',
  backgroundColor: 'Fond',
  pattern: 'Motif',
  patternColor: 'Couleur du motif'
};

export const labelOf = (key: string) =>
  LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

/** Nom lisible d'une variante de motif. */
export const patternLabel = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/** Regroupement des options en onglets. L'ordre fixe la lecture de l'écran. */
const GROUP_OF: Record<string, number> = {
  face: 0, skinColor: 0, eyes: 0, nose: 0, mouth: 0, ear: 0,
  hair: 1, hairColor: 1, frontHair: 1, sideburn: 1,
  cheek: 2, cheekProbability: 2,
  backgroundColor: 3, pattern: 3, patternColor: 3,
  garment: 4, cou: 4
};

export const AV_GROUPS = ['VISAGE', 'CHEVEUX', 'DÉTAILS', 'DÉCOR', 'TENUE', 'IDENTITÉ'];

// Sélecteurs de tenue (pièce → teinte) réexposés pour le studio
export { garmentPieces, garmentColors, garmentValue, parseGarment, defaultColor };

// Sélecteur de cou réexposé pour le studio (couleur déduite du teint)
export { neckShapes, neckLabel };

/** Clés d'un onglet, l'onglet Détails ramassant tout le reste. */
export const keysOfGroup = (g: number) =>
  AV_KEYS.filter((k) => k !== 'seed' && (GROUP_OF[k] ?? 2) === g);

/**
 * Options verrouillées : les `n` dernières variantes d'une clé demandent
 * un niveau de compétence. Les clés absentes du style sont ignorées.
 */
export const AV_LOCK_RULES: Record<string, [number, string, number]> = {
  hair: [5, 'couture', 10],
  eyes: [4, 'photo', 6],
  mouth: [3, 'perso', 8],
  frontHair: [2, 'course', 9],
  face: [2, 'cuisine', 7],
  pattern: [3, 'jardin', 6]
};

/** Verrou associé à une variante, ou null si elle est libre. */
export function lockOf(key: string, i: number): [string, number] | null {
  const rule = AV_LOCK_RULES[key];
  if (!rule) return null;
  const [n, skill, level] = rule;
  const total = optionsOf(key).length;
  return total && i >= total - n ? [skill, level] : null;
}
