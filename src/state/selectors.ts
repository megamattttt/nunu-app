import { BOARDS, DONE0, MAJOR, PALIERS, PSHORT, DIVW, skillById, SKILLS } from '../data/skills';
import type { GameState } from './types';

export const levelOf = (s: GameState, skill: string) => DONE0[skill] + (s.progress[skill]?.done || 0);
export const pxOf = (s: GameState, skill: string) => s.progress[skill]?.px || 0;

export type BoardRow = {
  ix: number; name: string; px: number; major: boolean;
  state: 'done' | 'now' | 'lock';
};

export function boardRows(s: GameState, skill: string): BoardRow[] {
  const lvl = levelOf(s, skill);
  const custom = s.customQuests.filter((q) => q.skill === skill);
  const base = BOARDS[skill] || [];
  const rows: BoardRow[] = base.map(([name, px], ix) => ({
    ix, name, px, major: (MAJOR[skill] || []).includes(ix),
    state: ix < lvl ? 'done' : ix === lvl ? 'now' : 'lock'
  }));
  custom.forEach((q, i) =>
    rows.push({ ix: base.length + i, name: q.name, px: q.px, major: false, state: q.done ? 'done' : 'now' })
  );
  return rows;
}

/** Prochaine quête à valider sur une compétence. */
export function currentQuest(s: GameState, skill: string) {
  return boardRows(s, skill).find((r) => r.state === 'now') || null;
}

/** Quête du jour : la compétence la plus avancée qui a encore un palier ouvert. */
export function todayQuest(s: GameState) {
  const ranked = [...SKILLS].sort((a, b) => pxOf(s, b.id) - pxOf(s, a.id));
  for (const sk of ranked) {
    const q = currentQuest(s, sk.id);
    if (q) return { skill: sk.id, quest: q };
  }
  return null;
}

export function palierPct(s: GameState, skill: string) {
  const sk = skillById(skill);
  return Math.min(100, Math.round((pxOf(s, skill) / sk.cap) * 100));
}

export const palierName = (s: GameState) => PALIERS[s.pal][0];
export const palierColor = (s: GameState) => PALIERS[s.pal][1];
export const divLabel = (s: GameState) => 'DIV ' + DIVW[s.div];
export const eloLabel = (s: GameState) => PSHORT[s.pal] + ' ' + DIVW[s.div];

/** Progression LP dans la division courante (0..100). */
export const lpPct = (s: GameState) => Math.min(100, Math.round((s.lp / 100) * 100));

export const totalPx = (s: GameState) =>
  Object.values(s.progress).reduce((a, p) => a + p.px, 0);

export const questsDone = (s: GameState) =>
  s.stats.questsDone + Object.keys(s.progress).reduce((a, k) => a + (s.progress[k].done || 0), 0);

export const badgeUnlocked = (s: GameState, skill: string, ix: number) => s.badges.includes(skill + ':' + ix);

export const ownedObjects = (s: GameState) => s.owned.atelier.filter(Boolean).length;

export const rankOf = (rows: [string, string, string, number, number][]) =>
  rows.findIndex((r) => r[0] === 'camille');
