import type { GameState } from './types';
import { PERSO_TASKS } from '../data/skills';
import { FEED0, LOG0 } from '../data/social';

export const initialState: GameState = {
  version: 1,
  logged: false,
  createdAt: Date.now(),

  profile: {
    pseudo: 'Camille R.',
    atelier: 'Atelier Fil Vert',
    titleIx: 1,
    sig: 0,
    cadre: 0,
    av: {
      skin: 2, face: 0, eyes: 0, eyeC: 0, lash: 2, brow: 1, nose: 0, mouth: 2, mark: 1, makeup: 1,
      hair: 23, hairC: 2, streak: 0, beard: 0, top: 0, topC: 0, hat: 0, glasses: 0, jewel: 1,
      bottom: 0, bottomC: 0, shoes: 0, bgPal: 0, bgStyle: 4, scene: 0, aura: 1, frame: 1
    }
  },

  progress: {
    couture: { px: 1418, done: 0 },
    course: { px: 812, done: 0 },
    photo: { px: 340, done: 0 },
    cuisine: { px: 604, done: 0 },
    jardin: { px: 210, done: 0 },
    perso: { px: 184, done: 0 }
  },
  customQuests: [],
  pioched: [],
  tasks: PERSO_TASKS.map((t, i) => ({ id: 't' + i, label: t[0], px: Number(String(t[1]).replace(/\D/g, '')) || 8, done: false })),

  energy: 58,
  coins: 480,
  lp: 64,
  pal: 2,
  div: 2,
  streak: 12,
  lastDay: null,
  freeDraws: 5,

  owned: {
    acc: [false, false, false],
    atelier: [true, true, true, false, false, false],
    cadre: [true, false, false, false]
  },

  banner: {
    title: 'L’ATELIER DU MARDI',
    quote: 1,
    pins: ['couture', 'course', 'photo'],
    chall: 0,
    msg: 'Je couds le soir, je cours le matin. Je préfère finir proprement que finir vite.'
  },

  feed: FEED0.map((p) => ({ ...p })),
  log: LOG0.map(([name, tag, val, when]) => ({ name, tag, val, when })),
  invitsOpen: [0, 1, 2],
  duels: [
    { id: 'd1', who: 'nina', name: 'Nina Costa', skill: 'couture', stake: 60, status: 'en cours', deadline: '2 j 04 h' }
  ],
  badges: ['couture:0', 'couture:1', 'course:0', 'photo:0', 'cuisine:0', 'perso:0'],

  dio: { wall: 0, floor: 0, light: 0, pos: {}, out: {} },

  stats: { questsDone: 138, totalPx: 3568, duelsWon: 7, postsSent: 3 },
  prefs: { sound: false, haptics: true, confetti: true },
  seen: { onboarding: false }
};
