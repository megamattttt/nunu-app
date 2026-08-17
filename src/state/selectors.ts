import { BOARDS, MAJOR, skillById, SKILLS } from '../data/skills';
import { rarityOfBoard, diffOfPx, type Rarity, type Difficulty } from '../data/quests';
import { rankOf, nextRank, levelFromPx, levelPct, type Rank } from '../data/ranks';
import type { GameState } from './types';

export const levelOf = (s: GameState, skill: string) => s.progress[skill]?.done || 0;
export const pxOf = (s: GameState, skill: string) => s.progress[skill]?.px || 0;

/** Rang d'une compétence, déduit des PX gagnés dans cette compétence. */
export const skillRank = (s: GameState, skill: string): Rank => rankOf(pxOf(s, skill));
export const skillNextRank = (s: GameState, skill: string) => nextRank(pxOf(s, skill));

/** Niveau global du personnage (1 → 999), agrégat de tous les PX. */
export const globalLevel = (s: GameState) => levelFromPx(s.px);
export const globalPct = (s: GameState) => levelPct(s.px);

export type BoardRow = {
  ix: number; name: string; px: number; major: boolean; rarity: Rarity;
  diff: Difficulty; link?: string; id?: string;
  state: 'done' | 'now' | 'lock';
};

/** Nombre de paliers du plateau d'origine : au-delà, ce sont des quêtes ajoutées. */
export const baseCount = (skill: string) => (BOARDS[skill] || []).length;

export function boardRows(s: GameState, skill: string): BoardRow[] {
  const lvl = levelOf(s, skill);
  const custom = s.customQuests.filter((q) => q.skill === skill);
  const base = BOARDS[skill] || [];
  const rows: BoardRow[] = base.map(([name, px], ix) => {
    const major = (MAJOR[skill] || []).includes(ix);
    return {
      ix, name, px, major, rarity: rarityOfBoard(px, major), diff: diffOfPx(px, major),
      state: ix < lvl ? 'done' : ix === lvl ? 'now' : 'lock'
    };
  });
  // Les quêtes ajoutées (pioche, perso) gardent l'ordre choisi par l'utilisateur.
  const extra: BoardRow[] = custom.map((q, i) => ({
    ix: base.length + i, name: q.name, px: q.px, major: false,
    rarity: q.rarity || rarityOfBoard(q.px, false),
    diff: q.diff || diffOfPx(q.px),
    link: q.link, id: q.id,
    state: q.done ? 'done' : 'now'
  }));
  return [...rows, ...extra];
}

/** Quêtes ajoutées seules — c'est la liste réordonnable. */
export const extraRows = (s: GameState, skill: string) => boardRows(s, skill).slice(baseCount(skill));

/* ---------------- Semaine et statistiques ---------------- */

const dayStart = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };

export type Day = { t: number; px: number; n: number; label: string; today: boolean };

/** Les `n` derniers jours, du plus ancien au plus récent. */
export function lastDays(s: GameState, n = 7): Day[] {
  const L = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const t0 = dayStart(new Date());
  const out: Day[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const t = t0 - i * 864e5;
    const rows = (s.history || []).filter((h) => h.t >= t && h.t < t + 864e5);
    out.push({
      t, px: rows.reduce((a, b) => a + b.px, 0), n: rows.length,
      label: L[new Date(t).getDay()], today: i === 0
    });
  }
  return out;
}

/** Bilan de la semaine glissée : PX, validations, série, compétence la plus active. */
export function weekStats(s: GameState) {
  const days = lastDays(s, 7);
  const px = days.reduce((a, b) => a + b.px, 0);
  const n = days.reduce((a, b) => a + b.n, 0);
  const active = days.filter((d) => d.n > 0).length;
  const best = days.reduce((a, b) => (b.px > a.px ? b : a), days[0]);

  const per = new Map<string, number>();
  (s.history || []).filter((h) => Date.now() - h.t < 7 * 864e5).forEach((h) => per.set(h.skill, (per.get(h.skill) || 0) + h.px));
  let topSkill = '';
  let topPx = 0;
  per.forEach((v, k) => { if (v > topPx) { topPx = v; topSkill = k; } });
  const top = topSkill ? { skill: topSkill, px: topPx } : null;

  // Série en cours : jours consécutifs avec au moins une validation.
  // Une journée encore vide ne casse pas la série tant qu'elle n'est pas finie.
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].n > 0) streak++;
    else if (i === days.length - 1) continue;
    else break;
  }

  // La semaine précédente, pour la comparaison.
  const prev = (s.history || []).filter((h) => {
    const age = Date.now() - h.t;
    return age >= 7 * 864e5 && age < 14 * 864e5;
  }).reduce((a, b) => a + b.px, 0);

  return { days, px, n, active, best, top, streak, prev, delta: prev ? Math.round(((px - prev) / prev) * 100) : null };
}

/** Prochaine quête à valider sur une compétence. */
export function currentQuest(s: GameState, skill: string) {
  return boardRows(s, skill).find((r) => r.state === 'now') || null;
}

/** Quête du jour : compétence de départ en priorité, sinon la plus avancée. */
export function todayQuest(s: GameState) {
  const ranked = [...SKILLS].sort((a, b) => {
    if (a.id === s.startSkill) return -1;
    if (b.id === s.startSkill) return 1;
    return pxOf(s, b.id) - pxOf(s, a.id);
  });
  for (const sk of ranked) {
    const q = currentQuest(s, sk.id);
    if (q) return { skill: sk.id, quest: q };
  }
  return null;
}

/** Progression dans le rang courant d'une compétence (0..100). */
export const rankPct = (s: GameState, skill: string) => skillRank(s, skill).pct;

export const totalPx = (s: GameState) => s.px;

export const questsDone = (s: GameState) => s.stats.questsDone;

export const badgeUnlocked = (s: GameState, skill: string, ix: number) => s.badges.includes(skill + ':' + ix);

export const ownedObjects = (s: GameState) => s.owned.atelier.filter(Boolean).length;

export const skillColor = (skill: string) => skillById(skill).c;
