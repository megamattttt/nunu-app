import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { GameState, ShareData, JournalEntry } from './types';
import { initialState } from './initial';
import { adapter } from './persistence';
import { OBJ, skillById } from '../data/skills';
import { MAX_ACTIVE_QUESTS, questById, catalogOf } from '../data/catalog';
import { rankOf, type Rank } from '../data/ranks';
import type { Rarity, Difficulty } from '../data/quests';
import { DIFF_LIST } from '../data/quests';
import { IMPS, type Importance } from '../data/importance';
import { scheduleReminders, DEFAULT_NOTIF, type NotifPrefs } from '../lib/notify';
import { ensureConfig, randomConfig } from '../lib/dicebear';
import type { DayCheckin } from '../data/checkin';
import { dueBucket } from '../lib/nlq';
import { levelOf } from './selectors';
import { buzz, setHaptics } from '../lib/haptics';
import { sfx, setSound } from '../lib/sound';
import { confetti } from '../lib/confetti';

export type RewardEvent = {
  kind: 'quest' | 'palier' | 'rang' | 'rare' | 'buy' | 'duel' | 'fire' | 'surprise';
  title: string; sub?: string; px?: number; coins?: number; energy?: number;
  color?: string; object?: string; share?: ShareData; fire?: boolean;
  combo?: number; comboStep?: boolean;
  /** Rang atteint — renseigné uniquement pour kind: 'rang'. */
  rank?: Rank;
  /** Complément d'information pour la carte de rang. */
  skill?: string;
  /** Entrée de journal ouverte automatiquement par cette validation. */
  journalId?: string;
};

type Action =
  | { t: 'HYDRATE'; state: Partial<GameState> }
  | { t: 'IDENTITY'; firstName: string; gamertag: string }
  | { t: 'LOGOUT' } | { t: 'RESET' }
  | { t: 'START_SKILL'; skill: string }
  | { t: 'FLOW'; step: number }
  | { t: 'FINISH_FLOW' }
  | { t: 'JOURNAL_SAVE'; entry: JournalEntry }
  | { t: 'JOURNAL_DEL'; id: string }
  | { t: 'CHECKIN_SAVE'; entry: DayCheckin }
  | { t: 'VALIDATE'; skill: string; ix: number; name: string; px: number; rarity?: Rarity; witness?: string | null; qid?: string }
  | { t: 'ADD_ACTIVE_QUEST'; skill: string; id: string }
  | { t: 'REMOVE_ACTIVE_QUEST'; skill: string; id: string }
  | { t: 'SWAP_ACTIVE_QUEST'; skill: string; out: string; in: string }
  | { t: 'ADD_QUEST'; skill: string; name: string; px: number; desc?: string; rarity?: Rarity; when?: number; diff?: Difficulty; link?: string; due?: number | null; timed?: boolean; imp?: Importance }
  | { t: 'EDIT_QUEST'; id: string; patch: Partial<{ name: string; due: number | null; timed: boolean; imp: Importance; px: number }> }
  | { t: 'PACK_ADD'; items: string[] }
  | { t: 'PACK_SAVE'; pack: { id?: string; name: string; items: string[]; icon?: string } }
  | { t: 'PACK_DEL'; id: string }
  | { t: 'NOTIF'; patch: Partial<NotifPrefs> }
  | { t: 'MOVE_QUEST'; skill: string; from: number; to: number }
  | { t: 'SORT_QUESTS'; skill: string }
  | { t: 'DEL_QUEST'; id: string }
  | { t: 'DRAW_USED' }
  | { t: 'TOGGLE_TASK'; id: string }
  | { t: 'ADD_TASK'; label: string; px: number }
  | { t: 'DEL_TASK'; id: string }
  | { t: 'BUY'; cat: 'acc' | 'atelier' | 'cadre'; ix: number; price: number; name: string }
  | { t: 'SET_AV'; patch: Record<string, string> }
  | { t: 'SET_PROFILE'; patch: Record<string, any> }
  | { t: 'DIO'; patch: Record<string, any> }
  | { t: 'DIO_MOVE'; id: string; x: number; y: number }
  | { t: 'DIO_TAKE'; id: string } | { t: 'DIO_PUT'; id: string } | { t: 'DIO_RESET' }
  | { t: 'LIKE'; id: string }
  | { t: 'PUBLISH'; text: string; tag: string; tagC: string }
  | { t: 'COMMENT'; id: string; text: string }
  | { t: 'ACCEPT_INVIT'; ix: number; who: string; name: string; skill: string }
  | { t: 'DUEL'; id: string; win: boolean; my: number; their: number }
  | { t: 'BANNER'; patch: Record<string, any> }
  | { t: 'PREF'; key: 'sound' | 'haptics' | 'confetti'; value: boolean }
  | { t: 'SEEN'; key: 'onboarding' | 'questHelp' | 'guide' }
  | { t: 'EVENT'; event: RewardEvent | null }
  | { t: 'SHARE'; data: ShareData | null }
  | { t: 'TOAST'; msg: string | null };

type Runtime = { event: RewardEvent | null; share: ShareData | null; toast: string | null; hydrated: boolean };
/** Points du jour, indexés par clé de jour ('AAAA-MM-JJ'). Persistés avec le reste. */
type Journalling = { checkins?: Record<string, DayCheckin> };
type Store = GameState & Runtime & Journalling;

const uid = () => Math.random().toString(36).slice(2, 9);

/** Historique borné : 90 jours, 400 lignes au plus. */
const pushHistory = (h: GameState['history'], row: GameState['history'][number]) =>
  [row, ...(h || [])].filter((x) => Date.now() - x.t < 90 * 864e5).slice(0, 400);

/** Multiplicateur appliqué aux PX quand la jauge est pleine (« en feu »). */
export const FIRE_MULT = 2;
const DAY = 864e5;
/** Fenêtre pendant laquelle deux validations s'enchaînent en combo. */
export const COMBO_WINDOW = 30 * 60e3;
/** Paliers de combo qui déclenchent une célébration renforcée. */
export const COMBO_STEPS = [3, 5, 10, 20];
/** Bonus de PX accordé par le combo en cours. */
export const comboBonus = (n: number) => (n >= 20 ? 0.4 : n >= 10 ? 0.3 : n >= 5 ? 0.2 : n >= 3 ? 0.1 : 0);
/** L'énergie retombe après 24 h sans quête validée. */
const DECAY_MS = DAY;
/** Énergie dépensée par quête quand l'état « en feu » est actif. */
const FIRE_COST = 25;

function decayed(s: Store): Pick<Store, 'energy' | 'onFire'> {
  if (s.lastQuestAt && Date.now() - s.lastQuestAt > DECAY_MS) return { energy: 0, onFire: false };
  return { energy: s.energy, onFire: s.onFire };
}

/** Énergie gagnée par une quête : proportionnelle à sa taille, plafonnée. */
const energyGain = (px: number) => Math.min(34, 10 + Math.round(px / 4));

function reducer(s: Store, a: Action): Store {
  switch (a.t) {
    case 'HYDRATE': {
      const next = { ...s, ...a.state, hydrated: true } as Store;
      // L'ancien moteur d'avatar stockait des index : on migre vers Big Ears.
      next.profile = { ...next.profile, av: ensureConfig(next.profile?.av) };
      return { ...next, ...decayed(next) };
    }

    case 'IDENTITY':
      return {
        ...s, logged: true, flow: 0,
        profile: { ...s.profile, firstName: a.firstName, gamertag: a.gamertag, av: randomConfig() }
      };

    case 'LOGOUT': return { ...s, logged: false };
    case 'RESET': return { ...initialState, hydrated: true, event: null, share: null, toast: 'Progression remise à zéro' } as Store;

    case 'START_SKILL': {
      const sk = skillById(a.skill);
      // Les trois premières quêtes faciles du catalogue deviennent les quêtes en cours.
      const firsts = catalogOf(a.skill).filter((c) => c.diff === 'facile').slice(0, 3);
      return {
        ...s,
        startSkill: a.skill,
        activeQuests: { ...(s.activeQuests || {}), [a.skill]: firsts.map((c) => c.id) },
        banner: { ...s.banner, pins: [a.skill, 'perso'] },
        flow: 3,
        toast: firsts.length
          ? firsts.length + ' quêtes ajoutées sur ' + sk.name.toLowerCase()
          : 'Compétence ' + sk.name.toLowerCase() + ' ouverte'
      };
    }

    case 'FLOW': return { ...s, flow: a.step };
    case 'FINISH_FLOW': return { ...s, seen: { ...s.seen, onboarding: true, guide: true } };

    case 'JOURNAL_SAVE': {
      const exists = s.journal.some((e) => e.id === a.entry.id);
      return {
        ...s,
        journal: exists ? s.journal.map((e) => (e.id === a.entry.id ? a.entry : e)) : [a.entry, ...s.journal],
        toast: exists ? 'Entrée mise à jour' : 'Entrée ajoutée au journal'
      };
    }
    case 'JOURNAL_DEL':
      return { ...s, journal: s.journal.filter((e) => e.id !== a.id), toast: 'Entrée supprimée' };

    case 'CHECKIN_SAVE':
      // Un seul point par jour : il écrase le précédent et alimente le code
      // couleur des calendriers de rétrospective.
      return {
        ...s,
        checkins: { ...(s.checkins || {}), [a.entry.day]: a.entry },
        toast: 'Point du jour enregistré'
      };

    case 'ADD_ACTIVE_QUEST': {
      const cur = (s.activeQuests || {})[a.skill] || [];
      if (cur.includes(a.id)) return s;
      if (cur.length >= MAX_ACTIVE_QUESTS) {
        return { ...s, toast: `Déjà ${MAX_ACTIVE_QUESTS} quêtes en cours — remplaces-en une` };
      }
      return {
        ...s,
        activeQuests: { ...(s.activeQuests || {}), [a.skill]: [...cur, a.id] },
        toast: 'Ajoutée à tes quêtes en cours'
      };
    }

    case 'REMOVE_ACTIVE_QUEST': {
      const cur = (s.activeQuests || {})[a.skill] || [];
      return {
        ...s,
        activeQuests: { ...(s.activeQuests || {}), [a.skill]: cur.filter((id) => id !== a.id) },
        toast: 'Retirée des quêtes en cours'
      };
    }

    case 'SWAP_ACTIVE_QUEST': {
      const cur = (s.activeQuests || {})[a.skill] || [];
      const next = cur.map((id) => (id === a.out ? a.in : id));
      return {
        ...s,
        activeQuests: { ...(s.activeQuests || {}), [a.skill]: next.includes(a.in) ? next : [...next, a.in] },
        toast: 'Quête remplacée'
      };
    }

    case 'VALIDATE': {
      // Une quête du catalogue porte un id ; les quêtes perso n'en ont pas.
      const qid = a.qid;
      const isBase = !!qid;
      const eng = decayed(s);
      const witnessBonus = a.witness ? 0.2 : 0;
      const mult = eng.onFire ? FIRE_MULT : 1;

      // Combo : deux validations à moins de 30 min s'enchaînent.
      const chain = s.combo.last && Date.now() - s.combo.last < COMBO_WINDOW ? s.combo.n + 1 : 1;
      const comboStep = COMBO_STEPS.includes(chain);
      const px = Math.round(a.px * mult * (1 + witnessBonus + comboBonus(chain)));
      const jId = uid();

      const prog = s.progress[a.skill] || { px: 0, done: 0 };
      const major = !!(qid && questById(qid)?.major);

      const before = rankOf(prog.px);
      const after = rankOf(prog.px + px);
      const rankUp = after.step > before.step;

      // Jauge d'énergie inversée : chaque quête la remplit ; en feu, elle se vide.
      let energy = eng.energy, onFire = eng.onFire;
      if (onFire) {
        energy = Math.max(0, energy - FIRE_COST);
        if (energy === 0) onFire = false;
      } else {
        energy = Math.min(100, energy + energyGain(a.px));
        if (energy >= 100) onFire = true;
      }

      const badgeIx = Math.min(5, levelOf(s, a.skill));
      const badge = a.skill + ':' + badgeIx;
      const coins = major ? 60 : 15;

      const share: ShareData | undefined = (major || rankUp)
        ? { kind: rankUp ? 'rang' : 'palier', title: rankUp ? after.label : a.name, skill: a.skill, rank: after.label, px }
        : undefined;

      return {
        ...s,
        energy, onFire, lastQuestAt: Date.now(),
        // Chaque palier validé ouvre automatiquement une entrée de journal,
        // vide, que l'on peut enrichir (photos, note, ressenti) quand on veut.
        journal: [
          {
            id: jId, skill: a.skill, ix: a.ix, title: a.name,
            note: '', mood: -1, diff: -1, minutes: 0, photos: [], when: Date.now(), auto: true
          },
          ...s.journal
        ],
        combo: { n: chain, best: Math.max(s.combo.best, chain), last: Date.now() },
        history: pushHistory(s.history, { t: Date.now(), px, skill: a.skill, name: a.name, kind: 'quete' }),
        progress: { ...s.progress, [a.skill]: { px: prog.px + px, done: prog.done + (isBase ? 1 : 0) } },
        // Le catalogue enregistre l'id validé et libère une place dans les quêtes en cours.
        doneQuests: qid
          ? { ...(s.doneQuests || {}), [a.skill]: [...((s.doneQuests || {})[a.skill] || []), qid] }
          : (s.doneQuests || {}),
        activeQuests: qid
          ? { ...(s.activeQuests || {}), [a.skill]: ((s.activeQuests || {})[a.skill] || []).filter((id) => id !== qid) }
          : (s.activeQuests || {}),
        customQuests: isBase ? s.customQuests : s.customQuests.map((q) => (q.name === a.name ? { ...q, done: true } : q)),
        px: s.px + px,
        coins: s.coins + coins,
        badges: s.badges.includes(badge) ? s.badges : [...s.badges, badge],
        stats: { ...s.stats, questsDone: s.stats.questsDone + 1, totalPx: s.stats.totalPx + px },
        log: [{ name: a.name, tag: skillById(a.skill).name, val: '+' + px + ' PX', when: 'à l’instant' }, ...s.log].slice(0, 20),
        event: {
          kind: rankUp ? 'rang' : major ? 'palier' : 'quest',
          title: rankUp ? 'NOUVEAU RANG' : major ? 'PALIER MAJEUR' : 'QUÊTE VALIDÉE',
          sub: rankUp ? after.label : a.name, px, coins,
          color: skillById(a.skill).c,
          rank: rankUp ? after : undefined,
          skill: a.skill,
          object: major ? OBJ[a.skill] : undefined,
          fire: onFire && !eng.onFire,
          combo: chain, comboStep,
          journalId: jId,
          share
        }
      };
    }

    case 'ADD_QUEST': {
      const q = { id: uid(), skill: a.skill, name: a.name, px: a.px, when: a.when ?? 0, desc: a.desc, rarity: a.rarity, diff: a.diff, link: a.link, due: a.due ?? null, timed: a.timed, imp: a.imp, done: false };
      return {
        ...s,
        customQuests: [...s.customQuests, q],
        pioched: [...s.pioched, a.name],
        toast: '« ' + a.name + ' » ajoutée au plateau'
      };
    }

    case 'EDIT_QUEST':
      return { ...s, customQuests: s.customQuests.map((q) => (q.id === a.id ? { ...q, ...a.patch } : q)) };

    case 'PACK_ADD': {
      // Un pack pose toutes ses tâches d'un coup dans l'espace perso.
      const items = a.items.filter((n) => n.trim());
      if (!items.length) return s;
      const quests = items.map((name) => ({
        id: uid(), skill: 'perso', name, px: 10, when: 0,
        rarity: 'commune' as Rarity, diff: 'facile' as Difficulty,
        due: null, timed: false, imp: 'normal' as Importance, done: false
      }));
      return {
        ...s,
        customQuests: [...s.customQuests, ...quests],
        toast: items.length + ' quête' + (items.length > 1 ? 's' : '') + ' ajoutée' + (items.length > 1 ? 's' : '')
      };
    }

    case 'PACK_SAVE': {
      const list = s.packs || [];
      const id = a.pack.id || uid();
      const exists = list.some((p) => p.id === id);
      return {
        ...s,
        packs: exists ? list.map((p) => (p.id === id ? { ...p, ...a.pack, id } : p)) : [...list, { ...a.pack, id, mine: true }],
        toast: 'Pack enregistré'
      };
    }

    case 'PACK_DEL':
      return { ...s, packs: (s.packs || []).filter((p) => p.id !== a.id), toast: 'Pack supprimé' };

    case 'NOTIF':
      return { ...s, notif: { ...(s.notif || DEFAULT_NOTIF), ...a.patch } };

    case 'DRAW_USED': return { ...s, freeDraws: Math.max(0, s.freeDraws - 1) };

    case 'MOVE_QUEST': {
      // Le glisser-déposer ne réordonne que les quêtes de la compétence affichée :
      // on déplace dans le sous-tableau, puis on réinjecte à la même place globale.
      const mine = s.customQuests.filter((q) => q.skill === a.skill);
      if (a.from === a.to || !mine[a.from]) return s;
      const moved = mine.slice();
      moved.splice(a.to, 0, moved.splice(a.from, 1)[0]);
      let i = 0;
      return { ...s, customQuests: s.customQuests.map((q) => (q.skill === a.skill ? moved[i++] : q)) };
    }

    case 'SORT_QUESTS': {
      // Perso : échéance d'abord, l'importance départage. Ailleurs : difficulté puis effort.
      const perso = a.skill === 'perso';
      const mine = s.customQuests.filter((q) => q.skill === a.skill).slice()
        .sort((x, y) => perso
          ? dueBucket(x.due ?? null) - dueBucket(y.due ?? null)
            || (x.due ?? Infinity) - (y.due ?? Infinity)
            || IMPS[x.imp || 'normal'].order - IMPS[y.imp || 'normal'].order
          : DIFF_LIST.indexOf(x.diff || 'moyen') - DIFF_LIST.indexOf(y.diff || 'moyen') || x.px - y.px);
      let j = 0;
      return {
        ...s,
        customQuests: s.customQuests.map((q) => (q.skill === a.skill ? mine[j++] : q)),
        toast: perso ? 'Triées par urgence' : 'Triées par difficulté'
      };
    }

    case 'DEL_QUEST':
      return { ...s, customQuests: s.customQuests.filter((q) => q.id !== a.id), toast: 'Quête retirée du plateau' };

    case 'TOGGLE_TASK': {
      const task = s.tasks.find((t) => t.id === a.id);
      if (!task) return s;
      const on = !task.done;
      const eng = decayed(s);
      const chain = on && s.combo.last && Date.now() - s.combo.last < COMBO_WINDOW ? s.combo.n + 1 : 1;
      const mult = on && eng.onFire ? FIRE_MULT : 1;
      const px = task.px * mult;
      return {
        ...s,
        tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, done: on } : t)),
        px: Math.max(0, s.px + (on ? px : -px)),
        progress: { ...s.progress, perso: { ...(s.progress.perso || { px: 0, done: 0 }), px: Math.max(0, (s.progress.perso?.px || 0) + (on ? px : -px)) } },
        energy: on ? Math.min(100, eng.energy + Math.round(task.px / 2)) : eng.energy,
        onFire: on ? eng.onFire || eng.energy + Math.round(task.px / 2) >= 100 : eng.onFire,
        lastQuestAt: on ? Date.now() : s.lastQuestAt,
        combo: on ? { n: chain, best: Math.max(s.combo.best, chain), last: Date.now() } : s.combo,
        history: on ? pushHistory(s.history, { t: Date.now(), px, skill: 'perso', name: task.label, kind: 'tache' }) : s.history,
        toast: on ? '+' + px + ' PX' : 'Tâche décochée'
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
          ? { ...p, comments: [...p.comments, { who: 'moi', name: s.profile.firstName || 'Moi', text: a.text }] }
          : p))
      };

    case 'PUBLISH': {
      const post = {
        id: uid(), who: 'moi', name: s.profile.gamertag || s.profile.firstName, when: 'à l’instant',
        tag: a.tag, tagC: a.tagC, text: a.text, px: '+40 PX', likes: 0, liked: false, comments: []
      };
      return {
        ...s, feed: [post, ...s.feed], coins: s.coins + 10, px: s.px + 40,
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
      // Les duels se jouent désormais sur les deux monnaies : PX et pièces.
      const duel = s.duels.find((x) => x.id === a.id);
      const stake = duel?.stake ?? 40;
      const skill = duel?.skill || 'perso';
      const px = a.win ? stake : Math.round(stake * 0.25);
      const coins = a.win ? 40 : 0;
      const prog = s.progress[skill] || { px: 0, done: 0 };
      return {
        ...s,
        px: s.px + px,
        coins: s.coins + coins,
        progress: { ...s.progress, [skill]: { ...prog, px: prog.px + px } },
        duels: s.duels.map((d) => (d.id === a.id ? { ...d, status: a.win ? 'gagné' : 'perdu', myScore: a.my, theirScore: a.their } : d)),
        stats: { ...s.stats, duelsWon: s.stats.duelsWon + (a.win ? 1 : 0), totalPx: s.stats.totalPx + px },
        log: [{ name: a.win ? 'Duel gagné' : 'Duel perdu', tag: 'DÉFI', val: '+' + px + ' PX', when: 'à l’instant' }, ...s.log].slice(0, 20),
        event: {
          kind: 'duel', title: a.win ? 'DUEL GAGNÉ' : 'DUEL PERDU',
          sub: a.my + ' — ' + a.their, px, coins
        }
      };
    }

    case 'BANNER': return { ...s, banner: { ...s.banner, ...a.patch } };
    case 'PREF': return { ...s, prefs: { ...s.prefs, [a.key]: a.value } };
    case 'SEEN': return { ...s, seen: { ...s.seen, [a.key]: true } };
    case 'EVENT': return { ...s, event: a.event };
    case 'SHARE': return { ...s, share: a.data };
    case 'TOAST': return { ...s, toast: a.msg };
    default: return s;
  }
}

const Ctx = createContext<{ s: Store; d: React.Dispatch<Action> }>(null as any);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [s, d] = useReducer(reducer, { ...initialState, event: null, share: null, toast: null, hydrated: false } as Store);
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
    const { event, share, toast, hydrated, ...game } = s as any;
    const id = window.setTimeout(() => { adapter.save(game); }, 220);
    return () => window.clearTimeout(id);
  }, [s]);

  useEffect(() => { setHaptics(s.prefs.haptics); setSound(s.prefs.sound); }, [s.prefs.haptics, s.prefs.sound]);

  // Rappels : les minuteries sont réarmées dès qu'une quête datée ou un réglage change.
  useEffect(() => {
    if (!s.hydrated) return;
    scheduleReminders(s.customQuests.filter((q) => q.due), s.notif || DEFAULT_NOTIF);
  }, [s.customQuests, s.notif, s.hydrated]);

  // Effets sensoriels attachés aux récompenses.
  useEffect(() => {
    if (!s.event) return;
    const e = s.event;
    if (e.comboStep) { buzz('milestone'); sfx.streak(); if (s.prefs.confetti) confetti(110); }
    else if (e.combo && e.combo > 1) { buzz('combo'); sfx.combo(e.combo); }
    if (e.kind === 'palier') { buzz('levelup'); sfx.levelup(); if (s.prefs.confetti) confetti(130); }
    else if (e.kind === 'rang') { buzz('levelup'); sfx.levelup(); if (s.prefs.confetti) { confetti(160); window.setTimeout(() => confetti(90), 420); } }
    else if (e.kind === 'duel') { buzz(e.px && e.coins ? 'success' : 'error'); e.coins ? sfx.levelup() : sfx.error(); if (s.prefs.confetti && e.coins) confetti(90); }
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
