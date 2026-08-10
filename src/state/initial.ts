import type { GameState } from './types';
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
    av: {
      skin: 2, face: 0, eyes: 0, eyeC: 0, lash: 2, brow: 1, nose: 0, mouth: 2, mark: 1, makeup: 1,
      hair: 23, hairC: 2, streak: 0, beard: 0, top: 0, topC: 0, hat: 0, glasses: 0, jewel: 1,
      bottom: 0, bottomC: 0, shoes: 0, bgPal: 0, bgStyle: 4, scene: 0, aura: 1, frame: 1
    }
  },

  progress: Object.fromEntries(SKILLS.map((s) => [s.id, { px: 0, done: 0 }])),
  customQuests: [],
  pioched: [],
  tasks: [],

  startSkill: null,
  flow: 0,
  combo: { n: 0, best: 0, last: null },
  journal: [],

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
  seen: { onboarding: false, questHelp: false, guide: false }
};
