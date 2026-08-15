import { skillById, SKILLS } from '../data/skills';
import { CATALOG, catalogOf, questById, MAX_ACTIVE_QUESTS, type CatalogQuest } from '../data/catalog';
import { rarityOfBoard, diffOfPx, DIFF_LIST, type Rarity, type Difficulty } from '../data/quests';
import { rankOf, nextRank, levelFromPx, levelPct, type Rank } from '../data/ranks';
import type { GameState } from './types';

export const pxOf = (s: GameState, skill: string) => s.progress[skill]?.px || 0;

/** Ids validés sur une compétence. */
export const doneIds = (s: GameState, skill: string): string[] => (s.doneQuests || {})[skill] || [];
/** Ids en cours sur une compétence. */
export const activeIds = (s: GameState, skill: string): string[] => (s.activeQuests || {})[skill] || [];

/** Nombre de quêtes du catalogue validées — remplace l'ancien niveau de plateau. */
export const levelOf = (s: GameState, skill: string) => doneIds(s, skill).length;

/** Rang d'une compétence, déduit des PX gagnés dans cette compétence (inchangé). */
export const skillRank = (s: GameState, skill: string): Rank => rankOf(pxOf(s, skill));
export const skillNextRank = (s: GameState, skill: string) => nextRank(pxOf(s, skill));

export const globalLevel = (s: GameState) => levelFromPx(s.px);
export const globalPct = (s: GameState) => levelPct(s.px);

/* ---------------- Catalogue ---------------- */

export type QuestRow = CatalogQuest & {
  /** Index dans le catalogue de la compétence — clé du journal et des badges. */
  ix: number;
  rarity: Rarity;
  done: boolean;
  active: boolean;
  /** Quête perso ajoutée à la main (customQuests) plutôt que tirée du catalogue. */
  custom?: boolean;
  link?: string;
};

function rowOf(s: GameState, skill: string, c: CatalogQuest, ix: number): QuestRow {
  return {
    ...c, ix,
    rarity: rarityOfBoard(c.px, !!c.major),
    done: doneIds(s, skill).includes(c.id),
    active: activeIds(s, skill).includes(c.id)
  };
}

/** Toutes les quêtes d'une compétence : catalogue + quêtes perso, aucun verrou. */
export function questRows(s: GameState, skill: string): QuestRow[] {
  const cat = catalogOf(skill).map((c, ix) => rowOf(s, skill, c, ix));
  const custom: QuestRow[] = s.customQuests.filter((q) => q.skill === skill).map((q, i) => ({
    id: q.id, name: q.name, px: q.px, diff: q.diff || diffOfPx(q.px), description: q.desc || '',
    tags: ['perso'], ix: cat.length + i,
    rarity: q.rarity || rarityOfBoard(q.px, false),
    done: !!q.done, active: !q.done, custom: true, link: q.link
  }));
  return [...cat, ...custom];
}

/** Sections repliables par difficulté, dans l'ordre facile → légendaire. */
export function sectionsOf(s: GameState, skill: string): { diff: Difficulty; rows: QuestRow[] }[] {
  const rows = questRows(s, skill);
  return DIFF_LIST.map((diff) => ({
    diff,
    rows: rows.filter((r) => r.diff === diff).sort((a, b) => Number(a.done) - Number(b.done) || a.px - b.px)
  })).filter((sec) => sec.rows.length > 0);
}

/** Quêtes en cours, dans l'ordre où elles ont été ajoutées. */
export function activeRows(s: GameState, skill: string): QuestRow[] {
  const rows = questRows(s, skill);
  return activeIds(s, skill).map((id) => rows.find((r) => r.id === id)).filter(Boolean) as QuestRow[];
}

export const activeFull = (s: GameState, skill: string) => activeIds(s, skill).length >= MAX_ACTIVE_QUESTS;

/**
 * Quêtes perso ajoutées à la main sur une compétence : mécanisme séparé du
 * catalogue, elles ne comptent pas dans la limite de quêtes actives.
 */
export const customActiveRows = (s: GameState, skill: string) =>
  questRows(s, skill).filter((r) => r.custom && !r.done);

export const questRowById = (s: GameState, skill: string, id: string) =>
  questRows(s, skill).find((r) => r.id === id) || null;

/** Compte de quêtes validées / total, par compétence. */
export const catalogProgress = (s: GameState, skill: string) => ({
  done: doneIds(s, skill).length,
  total: catalogOf(skill).length
});

/* ---------------- Semaine et statistiques ---------------- */

const dayStart = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };

export type Day = { t: number; px: number; n: number; label: string; today: boolean };

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

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].n > 0) streak++;
    else if (i === days.length - 1) continue;
    else break;
  }

  const prev = (s.history || []).filter((h) => {
    const age = Date.now() - h.t;
    return age >= 7 * 864e5 && age < 14 * 864e5;
  }).reduce((a, b) => a + b.px, 0);

  return { days, px, n, active, best, top, streak, prev, delta: prev ? Math.round(((px - prev) / prev) * 100) : null };
}

/* ---------------- Quête du jour ---------------- */

/** Première quête en cours sur une compétence — remplace « le prochain palier ». */
export function currentQuest(s: GameState, skill: string): QuestRow | null {
  return activeRows(s, skill).find((r) => !r.done) || null;
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

export const rankPct = (s: GameState, skill: string) => skillRank(s, skill).pct;
export const totalPx = (s: GameState) => s.px;
export const questsDone = (s: GameState) => s.stats.questsDone;
export const badgeUnlocked = (s: GameState, skill: string, ix: number) => s.badges.includes(skill + ':' + ix);
export const ownedObjects = (s: GameState) => s.owned.atelier.filter(Boolean).length;
export const skillColor = (skill: string) => skillById(skill).c;

/* ---------------- Compatibilité ---------------- */

/**
 * Anciennes signatures gardées le temps de la migration des écrans restants
 * (Path.tsx, Home.tsx). `state` n'a plus de valeur 'lock'.
 */
export type BoardRow = QuestRow & { state: 'done' | 'now' };
export const baseCount = (skill: string) => catalogOf(skill).length;
export function boardRows(s: GameState, skill: string): BoardRow[] {
  return questRows(s, skill).map((r) => ({ ...r, state: r.done ? 'done' : 'now' }));
}
export const extraRows = (s: GameState, skill: string) => boardRows(s, skill).filter((r) => r.custom);
export const allSkillsWithCatalog = () => Object.keys(CATALOG);
export { questById, MAX_ACTIVE_QUESTS };
