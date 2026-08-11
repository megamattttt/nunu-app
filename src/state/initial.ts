import type { GameState } from './types';
import { randomConfig } from '../lib/dicebear';
import { SKILLS } from '../data/skills';
import { FEED0 } from '../data/social';

export const SAVE_VERSION = 4;

/** Un compte neuf : aucune progression pré-remplie, tout se gagne. */
export const initialState: GameState = {
  version: SAVE_VERSION,
  logged: false,
  createdAt: Date.now(),

  profile: {
    firstName: '',
    gamertag: '',
    atelier: 'Atelier NUNU',
    titleIx: 0,
    sig: 0,
    cadre: 0,
    av: randomConfig()
  },

  progress: Object.fromEntries(SKILLS.map((s) => [s.id, { px: 0, done: 0 }])),
  customQuests: [],
  pioched: [],
  tasks: [],

  startSkill: null,
  flow: 0,
  combo: { n: 0, best: 0, last: null },
  journal: [],
  history: [],

  px: 0,
  coins: 120,

  energy: 0,
  onFire: false,
  lastQuestAt: null,

  freeDraws: 5,

  owned: {
    acc: [false, false, false],
    atelier: [true, false, false, false, false, false],
    cadre: [true, false, false, false]
  },

  banner: {
    title: 'MON ATELIER',
    quote: 0,
    pins: ['couture', 'course', 'photo'],
    chall: 0,
    msg: ''
  },

  feed: FEED0.map((p) => ({ ...p })),
  log: [],
  invitsOpen: [0, 1, 2],
  duels: [],
  badges: [],

  dio: { wall: 0, floor: 0, light: 0, pos: {}, out: {} },

  stats: { questsDone: 0, totalPx: 0, duelsWon: 0, postsSent: 0 },
  prefs: { sound: false, haptics: true, confetti: true },
  notif: { on: false, at: true, before: true, digest: true },
  seen: { onboarding: false, questHelp: false, guide: false }
};
