import { createAvatar } from '@dicebear/core';
import { bigEars } from '@dicebear/collection';

/**
 * Avatars « Big Ears » (The Visual Team, CC BY 4.0) générés localement.
 * La bibliothèque est empaquetée avec l'application : aucune requête réseau,
 * la génération marche donc hors ligne dès que l'app est chargée.
 *
 * Les options ne sont jamais écrites en dur : elles sont lues dans le schéma
 * exposé par le style, ce qui garde l'écran de personnalisation aligné sur
 * la version installée de @dicebear/collection.
 */

export type AvConfig = Record<string, string>;

const SCHEMA: Record<string, any> = ((bigEars as any).schema?.properties) || {};

/** Options du cœur DiceBear (hors schéma de style) que l'on expose aussi. */
const CORE_PALETTE: Record<string, string[]> = {
  backgroundColor: ['transparent', '0A0A0C', '1C1C23', 'B9DE64', 'E8B863', 'E2685A', '6FA5D8', '9C8AD6', '5CBFAE', 'F4F2ED', 'DED6C6']
};

/** Teintes ajoutées aux palettes du style, qui n'en proposent que quatre. */
const EXTRA_PALETTE: Record<string, string[]> = {
  hairColor: ['724133', 'a55728', 'b58143', 'b04a3a', '6a4e9c', '3f6fb8', '2c8c73', 'a9d63f', '9a9aa0'],
  skinColor: ['f2d3b1', '8c4a2f', '6b3520', '4b2e1d']
};

/** Toutes les clés d'option, dans l'ordre du schéma puis du cœur. */
export const AV_KEYS = [...Object.keys(SCHEMA), ...Object.keys(CORE_PALETTE)];

const isColorKey = (k: string) => /color$/i.test(k);
const isProbaKey = (k: string) => /probability$/i.test(k);

/** Valeurs possibles d'une option à choix. Vide pour les couleurs. */
export function optionsOf(key: string): string[] {
  const p = SCHEMA[key];
  if (!p) return [];
  const items = p.items || p;
  return Array.isArray(items?.enum) ? [...items.enum] : [];
}

/** Palette d'une option de couleur : celle du style, élargie de quelques teintes. */
export function paletteOf(key: string): string[] {
  if (CORE_PALETTE[key]) return CORE_PALETTE[key];
  const p = SCHEMA[key];
  const def = p?.default;
  const list = Array.isArray(def) ? def : def != null ? [def] : [];
  const official = list.filter((v: any) => typeof v === 'string').map((v: string) => v.replace(/^#/, ''));
  return [...new Set([...official, ...(EXTRA_PALETTE[key] || [])])];
}

export type AvKind = 'choice' | 'color' | 'toggle';

export const kindOf = (key: string): AvKind => (isProbaKey(key) ? 'toggle' : isColorKey(key) ? 'color' : 'choice');

/* ---------------- Rendu ---------------- */

const cache = new Map<string, string>();

/** Options DiceBear déduites de la configuration enregistrée. */
function toOptions(cfg: AvConfig, size: number) {
  const o: Record<string, any> = { seed: cfg.seed || 'nunu', size };
  for (const k of AV_KEYS) {
    const v = cfg[k];
    if (v === undefined || v === '') continue;
    if (isProbaKey(k)) o[k] = Number(v) || 0;
    else o[k] = [String(v).replace(/^#/, '')];
  }
  return o;}

/** SVG complet, mémoïsé : le même avatar n'est calculé qu'une fois. */
export function avatarSvg(cfg: AvConfig, size = 128): string {
  const key = size + '|' + AV_KEYS.map((k) => cfg[k] ?? '').join(',') + '|' + (cfg.seed || '');
  const hit = cache.get(key);
  if (hit) return hit;
  // Le SVG doit remplir son conteneur : on neutralise les dimensions fixes.
  const svg = createAvatar(bigEars, toOptions(cfg, size)).toString()
    .replace(/(<svg[^>]*?)\swidth="[^"]*"/, '$1 width="100%"')
    .replace(/(<svg[^>]*?)\sheight="[^"]*"/, '$1 height="100%"')
    .replace(/<svg /, '<svg preserveAspectRatio="xMidYMid slice" style="display:block" ');
  if (cache.size > 400) cache.clear();
  cache.set(key, svg);
  return svg;
}

/** Aperçu d'une variante isolée, utilisé par les vignettes du studio. */
export const variantSvg = (cfg: AvConfig, key: string, value: string, size = 56) =>
  avatarSvg({ ...cfg, [key]: value }, size);

/** Avatar d'un ami : la graine suffit, tout le reste est déduit. */
export const seedSvg = (seed: string, size = 96) => avatarSvg({ seed }, size);

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

/** Libellés d'écran. Une clé inconnue retombe sur son nom brut, lisible. */
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
  backgroundColor: 'Fond'
};

export const labelOf = (key: string) =>
  LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

/** Regroupement des options en onglets. L'ordre fixe la lecture de l'écran. */
const GROUP_OF: Record<string, number> = {
  face: 0, skinColor: 0, eyes: 0, nose: 0, mouth: 0, ear: 0,
  hair: 1, hairColor: 1, frontHair: 1, sideburn: 1,
  cheek: 2, cheekProbability: 2,
  backgroundColor: 3
};

export const AV_GROUPS = ['VISAGE', 'CHEVEUX', 'DÉTAILS', 'DÉCOR', 'IDENTITÉ'];

/** Clés d'un onglet, l'onglet Accessoires ramassant tout le reste. */
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
  face: [2, 'cuisine', 7]
};

/** Verrou associé à une variante, ou null si elle est libre. */
export function lockOf(key: string, i: number): [string, number] | null {
  const rule = AV_LOCK_RULES[key];
  if (!rule) return null;
  const [n, skill, level] = rule;
  const total = optionsOf(key).length;
  return total && i >= total - n ? [skill, level] : null;
}
