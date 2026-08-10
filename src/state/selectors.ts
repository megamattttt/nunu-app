import { BOARDS, MAJOR, skillById, SKILLS } from '../data/skills';
import { rarityOfBoard, diffOfPx, byDiff, type Rarity, type Difficulty } from '../data/quests';
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
  diff: Difficulty; link?: string;
  state: 'done' | 'now' | 'lock';
};

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
  // Les quêtes ajoutées (pioche, perso) s'affichent triées par difficulté.
  const extra: BoardRow[] = custom.map((q, i) => ({
    ix: base.length + i, name: q.name, px: q.px, major: false,
    rarity: q.rarity || rarityOfBoard(q.px, false),
    diff: q.diff || diffOfPx(q.px),
    link: q.link,
    state: q.done ? 'done' : 'now'
  }));
  extra.sort(byDiff);
  return [...rows, ...extra];
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
