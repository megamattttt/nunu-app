import { DIO_LIGHTS, DIO_OBJ, DIO_SEASONS, DIO_TRACES, ROOM, type DioObj, type DioSurf } from '../data/diorama';
import { DONE0 } from '../data/skills';
import type { GameState } from '../state/types';

/** Placement d'un objet dans la scène. */
export type DioItem = {
  s: DioSurf;
  x: number; y: number;
  /** Rotation en degrés (papier légèrement de travers). */
  r?: number;
  /** Échelle 0.7 → 1.4. */
  sc?: number;
  /** Décalage de calque (avant / arrière). */
  z?: number;
  /** Index de variante de couleur. */
  cw?: number;
};

export const objById = (id: string) => DIO_OBJ.find((o) => o.id === id);

/* ------------------------------------------------------------ Géométrie --- */

/** Projette une position de surface en coordonnées de scène (isométrie vraie). */
export function project(s: DioSurf, x: number, y: number) {
  const R = ROOM;
  if (s === 'floor') {
    return {
      px: R.cx + ((x - y) / 100) * R.hw,
      py: R.top + ((x + y) / 100) * R.hh,
      scale: 1,
      z: 400 + Math.round(x + y)
    };
  }
  const along = s === 'wb' ? 1 : -1;
  const base = R.top + (x / 100) * R.hh;
  return {
    px: R.cx + along * (x / 100) * R.hw,
    py: base - R.wallH * (1 - y / 100),
    scale: 1,
    z: 100 + Math.round(y)
  };
}

/** Inclinaison des découpes posées sur un mur (atan(1/2) = 26,565°). */
export const WL_SKEW = 'skewY(-26.565deg)';
export const WB_SKEW = 'skewY(26.565deg)';

/** Coordonnées de plan (0..100 sur chaque axe) d'un point de la scène. */
function toPlan(px: number, py: number) {
  const R = ROOM;
  const a = (px - R.cx) / R.hw;
  const b = (py - R.top) / R.hh;
  return { x: ((b + a) / 2) * 100, y: ((b - a) / 2) * 100 };
}

/** Position de surface la plus proche d'un point de la scène. */
export function unproject(surf: DioSurf, px: number, py: number) {
  const R = ROOM;
  if (surf === 'floor') {
    const p = toPlan(px, py);
    return { x: clamp(p.x, 0, 100), y: clamp(p.y, 0, 100) };
  }
  const along = surf === 'wb' ? 1 : -1;
  const x = clamp((along * (px - R.cx) / R.hw) * 100, 0, 100);
  const base = R.top + (x / 100) * R.hh;
  return { x, y: clamp(100 - ((base - py) / R.wallH) * 100, 0, 100) };
}

/** Surface visée par un point : le losange du sol, sinon le mur droit ou gauche. */
export function surfaceAt(px: number, py: number): DioSurf {
  const p = toPlan(px, py);
  if (p.x >= 0 && p.y >= 0) return 'floor';
  if (p.y < p.x) return 'wb';
  return 'wl';
}

/** Surface visée par un point : sol sous la ligne de jonction, sinon pan du fond ou latéral. */
export function surfaceAt(px: number, py: number): DioSurf {
  if (px < ROOM.cx) {
    const x = clamp((px / ROOM.cx) * 100, 0, 100);
    const bot = ROOM.lBot - (x / 100) * (ROOM.lBot - ROOM.fy);
    return py > bot ? 'floor' : 'wl';
  }
  return py > ROOM.fy ? 'floor' : 'wb';
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* --------------------------------------------------------------- Aimants --- */

/** Aimants : bord de mur, ligne de sol, et dessus des meubles porteurs. */
export function snap(surf: DioSurf, x: number, y: number, items: Record<string, DioItem>, selfId: string) {
  let out = { x, y, magnet: '' as string };
  const grid = (v: number) => Math.round(v / 2) * 2;
  out.x = grid(x); out.y = grid(y);

  if (surf === 'floor') {
    // Contre un mur, ou au bord avant du plancher.
    if (y < 5) { out.y = 2; out.magnet = 'contre le mur droit'; }
    if (x < 5) { out.x = 2; out.magnet = 'contre le mur gauche'; }
    if (x > 96 && y > 96) { out.x = 97; out.y = 97; out.magnet = 'angle avant'; }
    // Dessus des meubles porteurs (table, commode, établi).
    for (const [id, it] of Object.entries(items)) {
      if (id === selfId) continue;
      const host = objById(id);
      if (!host?.top || it.s !== 'floor') continue;
      const a = project('floor', it.x, it.y);
      const hs = (it.sc || 1) * a.scale;
      const topY = a.py - host.h * hs + host.top[1] * hs;
      const b = project('floor', out.x, out.y);
      if (Math.abs(b.px - a.px) < (host.w * hs) / 2 && Math.abs(b.py - topY) < 50) {
        const t = unproject('floor', b.px, topY);
        return { x: grid(t.x), y: grid(t.y), magnet: 'posé sur ' + host.name.toLowerCase() };
      }
    }
    return out;
  }
  if (y < 5) { out.y = 2; out.magnet = 'aligné en haut'; }
  return out;
}

/* ------------------------------------------------------------ Possession --- */

export const doneOf = (s: GameState, sk: string) => (DONE0[sk] || 0) + (s.progress[sk]?.done || 0);

export function owns(s: GameState, o: DioObj): boolean {
  if (o.src === 'base') return true;
  if (o.src === 'shop') return !!s.owned.atelier[o.sid ?? -1];
  if (o.src === 'quest') return doneOf(s, o.req!.sk) >= (o.req!.done || 1);
  return (s.progress[o.req!.sk]?.px || 0) >= (o.req!.px || 0);
}

export function unlockLabel(o: DioObj): string {
  if (o.src === 'base') return 'Fourni avec l’atelier';
  if (o.src === 'shop') return 'Boutique · rayon Atelier';
  if (o.src === 'quest') return `${o.req!.done} quête${(o.req!.done || 1) > 1 ? 's' : ''} validée${(o.req!.done || 1) > 1 ? 's' : ''} en ${o.req!.sk}`;
  return `${o.req!.px} PX en ${o.req!.sk}`;
}

/** Objets possédés et non rangés, avec leur placement effectif. */
export function placed(s: GameState): { o: DioObj; it: DioItem }[] {
  const items = (s.dio.items || {}) as Record<string, DioItem>;
  return DIO_OBJ
    .filter((o) => owns(s, o) && !s.dio.out[o.id])
    .map((o) => ({ o, it: items[o.id] || { s: o.surf, x: o.x, y: o.y } }))
    .sort((a, b) => project(a.it.s, a.it.x, a.it.y).z + (a.it.z || 0) * 40 - (project(b.it.s, b.it.x, b.it.y).z + (b.it.z || 0) * 40));
}

/* --------------------------------------------------------------- Ambiance --- */

export function lightForHour(h: number) {
  const ix = DIO_LIGHTS.findIndex((l) => (l.hours[0] < l.hours[1] ? h >= l.hours[0] && h < l.hours[1] : h >= l.hours[0] || h < l.hours[1]));
  return ix < 0 ? 2 : ix;
}

export const seasonNow = () => {
  const m = new Date().getMonth();
  return m <= 1 || m === 11 ? 3 : m <= 4 ? 0 : m <= 7 ? 1 : 2;
};

export const seasonName = () => DIO_SEASONS[seasonNow()].name;

/** Traces d'activité visibles : compétences bougées dans leur fenêtre de temps. */
export function traces(s: GameState) {
  const now = Date.now();
  return DIO_TRACES.filter((t) => (s.history || []).some((h) => h.skill === t.sk && now - h.t < t.days * 864e5));
}
