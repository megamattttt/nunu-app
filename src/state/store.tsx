import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { GameState } from './types';
import { initialState } from './initial';
import { adapter } from './persistence';
import { BOARDS, MAJOR, OBJ, skillById } from '../data/skills';
import { levelOf } from './selectors';
import { buzz, setHaptics } from '../lib/haptics';
import { sfx, setSound } from '../lib/sound';
import { confetti } from '../lib/confetti';

export type RewardEvent = {
  kind: 'quest' | 'palier' | 'rare' | 'buy' | 'duel' | 'streak' | 'surprise';
  title: string; sub?: string; px?: number; coins?: number; lp?: number; energy?: number;
  color?: string; object?: string;
};

type Action =
  | { t: 'HYDRATE'; state: Partial<GameState> }
  | { t: 'LOGIN' } | { t: 'LOGOUT' } | { t: 'RESET' }
  | { t: 'VALIDATE'; skill: string; ix: number; name: string; px: number; witness?: string | null }
  | { t: 'ADD_QUEST'; skill: string; name: string; px: number; desc?: string; rarity?: any; when?: number }
  | { t: 'DRAW_USED' }
  | { t: 'TOGGLE_TASK'; id: string }
  | { t: 'ADD_TASK'; label: string; px: number }
  | { t: 'DEL_TASK'; id: string }
  | { t: 'BUY'; cat: 'acc' | 'atelier' | 'cadre'; ix: number; price: number; name: string }
  | { t: 'SET_AV'; patch: Record<string, number> }
  | { t: 'SET_PROFILE'; patch: Record<string, any> }
  | { t: 'DIO'; patch: Record<string, any> }
  | { t: 'DIO_MOVE'; id: string; x: number; y: number }
  | { t: 'DIO_TAKE'; id: string } | { t: 'DIO_PUT'; id: string } | { t: 'DIO_RESET' }
  | { t: 'LIKE'; id: string }
  | { t: 'PUBLISH'; text: string; tag: string; tagC: string }
  | { t: 'COMMENT'; id: string; text: string }
  | { t: 'ACCEPT_INVIT'; ix: number; who: string; name: string; skill: string }
  | { t: 'DUEL'; id: string; win: boolean; my: number; their: number }
  | { t: 'LP'; delta: number }
  | { t: 'BANNER'; patch: Record<string, any> }
  | { t: 'PREF'; key: 'sound' | 'haptics' | 'confetti'; value: boolean }
  | { t: 'EVENT'; event: RewardEvent | null }
  | { t: 'TOAST'; msg: string | null };

type Runtime = { event: RewardEvent | null; toast: string | null; hydrated: boolean };
type Store = GameState & Runtime;

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

function bumpStreak(s: Store): Partial<Store> {
  const d = today();
  if (s.lastDay === d) return {};
  const streak = s.lastDay === yesterday() ? s.streak + 1 : 1;
  return { lastDay: d, streak };
}

function reducer(s: Store, a: Action): Store {
  switch (a.t) {
    case 'HYDRATE':
      return { ...s, ...a.state, hydrated: true } as Store;

    case 'LOGIN': return { ...s, logged: true };
    case 'LOGOUT': return { ...s, logged: false };
    case 'RESET': return { ...initialState, logged: true, hydrated: true, event: null, toast: 'Progression remise à zéro' } as Store;

    case 'VALIDATE': {
      const base = (BOARDS[a.skill] || []).length;
      const isBase = a.ix < base;
      const bonus = a.witness ? Math.round(a.px * 0.2) : 0;
      const px = a.px + bonus;
      const prog = s.progress[a.skill] || { px: 0, done: 0 };
      const major = isBase && (MAJOR[a.skill] || []).includes(a.ix);
      const badgeIx = Math.min(5, levelOf(s, a.skill));
      const badge = a.skill + ':' + badgeIx;

      return {
        ...s,
        ...bumpStreak(s),
        progress: { ...s.progress, [a.skill]: { px: prog.px + px, done: prog.done + (isBase ? 1 : 0) } },
        customQuests: isBase ? s.customQuests : s.customQuests.map((q) => (q.name === a.name ? { ...q, done: true } : q)),
        coins: s.coins + (major ? 60 : 15),
        energy: a.skill === 'perso' ? Math.min(100, s.energy + 8) : s.energy,
        badges: s.badges.includes(badge) ? s.badges : [...s.badges, badge],
        stats: { ...s.stats, questsDone: s.stats.questsDone + 1, totalPx: s.stats.totalPx + px },
        log: [{ name: a.name, tag: skillById(a.skill).name, val: '+' + px + ' PX', when: 'à l’instant' }, ...s.log].slice(0, 20),
        event: {
          kind: major ? 'palier' : 'quest',
          title: major ? 'PALIER MAJEUR' : 'QUÊTE VALIDÉE',
          sub: a.name, px, coins: major ? 60 : 15,
          color: skillById(a.skill).c,
          object: major ? OBJ[a.skill] : undefined
        }
      };
    }

    case 'ADD_QUEST': {
      const q = { id: uid(), skill: a.skill, name: a.name, px: a.px, when: a.when ?? 0, desc: a.desc, rarity: a.rarity, done: false };
      return {
        ...s,
        customQuests: [...s.customQuests, q],
        pioched: [...s.pioched, a.name],
        toast: '« ' + a.name + ' » ajoutée au plateau'
      };
    }

    case 'DRAW_USED': return { ...s, freeDraws: Math.max(0, s.freeDraws - 1) };

    case 'TOGGLE_TASK': {
      const task = s.tasks.find((t) => t.id === a.id);
      if (!task) return s;
      const on = !task.done;
      return {
        ...s,
        ...(on ? bumpStreak(s) : {}),
        tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, done: on } : t)),
        energy: Math.max(0, Math.min(100, s.energy + (on ? task.px : -task.px))),
        progress: { ...s.progress, perso: { ...s.progress.perso, px: Math.max(0, s.progress.perso.px + (on ? task.px : -task.px)) } },
        toast: on ? '+' + task.px + ' ⚡ énergie' : 'Tâche décochée'
      };
    }

    case 'ADD_TASK':
      return { ...s, tasks: [...s.tasks, { id: uid(), label: a.label, px: a.px, done: false }], toast: 'Tâche ajoutée' };
    case 'DEL_TASK':
      return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };

    case 'BUY': {
      if (s.coins < a.price) return { ...s, toast: 'Il te manque ' + (a.price - s.coins) + ' pièces' };
      const arr = [...s.owned[a.cat]]; arr[a.ix] = true;
      return {
        ...s, coins: s.coins - a.price, owned: { ...s.owned, [a.cat]: arr },
        event: { kind: 'buy', title: 'DÉBLOQUÉ', sub: a.name, coins: -a.price }
      };
    }

    case 'SET_AV': return { ...s, profile: { ...s.profile, av: { ...s.profile.av, ...a.patch } } };
    case 'SET_PROFILE': return { ...s, profile: { ...s.profile, ...a.patch } };

    case 'DIO': return { ...s, dio: { ...s.dio, ...a.patch } };
    case 'DIO_MOVE': return { ...s, dio: { ...s.dio, pos: { ...s.dio.pos, [a.id]: { x: a.x, y: a.y } } } };
    case 'DIO_TAKE': return { ...s, dio: { ...s.dio, out: { ...s.dio.out, [a.id]: true } }, toast: 'Objet rangé dans l’inventaire' };
    case 'DIO_PUT': { const out = { ...s.dio.out }; delete out[a.id]; return { ...s, dio: { ...s.dio, out }, toast: 'Objet reposé dans la scène' }; }
    case 'DIO_RESET': return { ...s, dio: { ...s.dio, pos: {}, out: {} }, toast: 'Agencement d’origine rétabli' };

    case 'LIKE':
      return { ...s, feed: s.feed.map((p) => (p.id === a.id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)) };

    case 'COMMENT':
      return {
        ...s,
        feed: s.feed.map((p) => (p.id === a.id
          ? { ...p, comments: [...p.comments, { who: 'camille', name: s.profile.pseudo.split(' ')[0], text: a.text }] }
          : p))
      };

    case 'PUBLISH': {
      const post = {
        id: uid(), who: 'camille', name: s.profile.pseudo, when: 'à l’instant',
        tag: a.tag, tagC: a.tagC, text: a.text, px: '+40 PX', likes: 0, liked: false, comments: []
      };
      return {
        ...s, feed: [post, ...s.feed], coins: s.coins + 10,
        stats: { ...s.stats, postsSent: s.stats.postsSent + 1, totalPx: s.stats.totalPx + 40 },
        event: { kind: 'quest', title: 'PUBLIÉ SUR LE MUR', sub: 'Tes amis peuvent te confirmer', px: 40, coins: 10 }
      };
    }

    case 'ACCEPT_INVIT':
      return {
        ...s,
        invitsOpen: s.invitsOpen.filter((i) => i !== a.ix),
        duels: [...s.duels, { id: uid(), who: a.who, name: a.name, skill: a.skill, stake: 40, status: 'en cours', deadline: '3 j 00 h' }],
        toast: 'Duel accepté contre ' + a.name.split(' ')[0]
      };

    case 'DUEL': {
      const lp = a.win ? 25 : -12;
      return {
        ...s,
        lp: Math.max(0, s.lp + lp),
        duels: s.duels.map((d) => (d.id === a.id ? { ...d, status: a.win ? 'gagné' : 'perdu', myScore: a.my, theirScore: a.their } : d)),
        stats: { ...s.stats, duelsWon: s.stats.duelsWon + (a.win ? 1 : 0) },
        coins: s.coins + (a.win ? 40 : 0),
        log: [{ name: a.win ? 'Duel gagné' : 'Duel perdu', tag: 'DÉFI', val: (lp > 0 ? '+' : '') + lp + ' LP', when: 'à l’instant' }, ...s.log].slice(0, 20),
        event: {
          kind: 'duel', title: a.win ? 'DUEL GAGNÉ' : 'DUEL PERDU',
          sub: a.my + ' — ' + a.their, lp, coins: a.win ? 40 : 0
        }
      };
    }

    case 'LP': {
      let { lp, div, pal } = s;
      lp += a.delta;
      let event: RewardEvent | null = null;
      while (lp >= 100) { lp -= 100; if (div > 1) div--; else if (pal < 4) { pal++; div = 4; } else lp = 100; event = { kind: 'palier', title: 'DIVISION SUPÉRIEURE', sub: 'Tu montes d’un cran', lp: a.delta }; }
      while (lp < 0) { if (div < 4) { div++; lp += 100; } else if (pal > 0) { pal--; div = 1; lp += 100; } else lp = 0; }
      return { ...s, lp, div, pal, event: event || s.event };
    }

    case 'BANNER': return { ...s, banner: { ...s.banner, ...a.patch } };
    case 'PREF': return { ...s, prefs: { ...s.prefs, [a.key]: a.value } };
    case 'EVENT': return { ...s, event: a.event };
    case 'TOAST': return { ...s, toast: a.msg };
    default: return s;
  }
}

const Ctx = createContext<{ s: Store; d: React.Dispatch<Action> }>(null as any);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [s, d] = useReducer(reducer, { ...initialState, event: null, toast: null, hydrated: false } as Store);
  const first = useRef(true);

  useEffect(() => {
    adapter.load().then((saved) => {
      d({ t: 'HYDRATE', state: (saved || {}) as Partial<GameState> });
    });
  }, []);

  // Sauvegarde automatique (débouncée) dès que l'état de jeu change.
  useEffect(() => {
    if (!s.hydrated) return;
    if (first.current) { first.current = false; }
    const { event, toast, hydrated, ...game } = s as any;
    const id = window.setTimeout(() => { adapter.save(game); }, 220);
    return () => window.clearTimeout(id);
  }, [s]);

  useEffect(() => { setHaptics(s.prefs.haptics); setSound(s.prefs.sound); }, [s.prefs.haptics, s.prefs.sound]);

  // Effets sensoriels attachés aux récompenses.
  useEffect(() => {
    if (!s.event) return;
    const e = s.event;
    if (e.kind === 'palier') { buzz('levelup'); sfx.levelup(); if (s.prefs.confetti) confetti(130); }
    else if (e.kind === 'duel') { buzz(e.lp && e.lp > 0 ? 'success' : 'error'); e.lp && e.lp > 0 ? sfx.levelup() : sfx.error(); if (s.prefs.confetti && (e.lp || 0) > 0) confetti(90); }
    else if (e.kind === 'rare' || e.kind === 'surprise') { buzz('success'); sfx.rare(); if (s.prefs.confetti) confetti(70); }
    else { buzz('success'); sfx.validate(); if (s.prefs.confetti) confetti(70); }
  }, [s.event]);

  // Le toast s'efface tout seul.
  useEffect(() => {
    if (!s.toast) return;
    const id = window.setTimeout(() => d({ t: 'TOAST', msg: null }), 2000);
    return () => window.clearTimeout(id);
  }, [s.toast]);

  const value = useMemo(() => ({ s, d }), [s]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useGame = () => useContext(Ctx);
export type { Action };
