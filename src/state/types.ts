import type { FeedPost } from '../data/social';
import type { Rarity } from '../data/quests';

export type Progress = { px: number; done: number };

export type CustomQuest = {
  id: string; skill: string; name: string; px: number; when: number;
  desc?: string; rarity?: Rarity; done?: boolean;
};

export type Task = { id: string; label: string; px: number; done: boolean };

export type LogRow = { name: string; tag: string; val: string; when: string };

export type Duel = {
  id: string; who: string; name: string; skill: string; stake: number;
  status: 'en cours' | 'gagné' | 'perdu'; myScore?: number; theirScore?: number; deadline: string;
};

export type AvatarConfig = Record<string, number>;

/** Charge utile d'une carte de palier partageable. */
export type ShareData = {
  kind: 'palier' | 'rang';
  title: string;      // nom du palier ou du rang atteint
  skill: string;      // id de compétence
  rank: string;       // « OR III »
  px: number;
};

export type GameState = {
  version: number;
  logged: boolean;
  createdAt: number;

  profile: {
    firstName: string; gamertag: string; atelier: string; titleIx: number; sig: number;
    av: AvatarConfig; cadre: number;
  };

  progress: Record<string, Progress>;
  customQuests: CustomQuest[];
  pioched: string[];
  tasks: Task[];

  /** Compétence choisie à l'onboarding. */
  startSkill: string | null;

  /** Étape du parcours de première connexion : 0 avatar · 1 guide · 2 compétence · 3 première quête. */
  flow: number;

  /** Combo de validations rapprochées (fenêtre de 30 min). */
  combo: { n: number; best: number; last: number | null };

  /* --- Deux monnaies seulement --- */
  px: number;                 // PX cumulés (niveau global du personnage)
  coins: number;              // monnaie cosmétique

  /* --- Jauge d'énergie inversée --- */
  energy: number;             // 0..100, se remplit à chaque quête validée
  onFire: boolean;            // jauge pleine = bonus ×2 PX
  lastQuestAt: number | null; // horodatage de la dernière validation (décroissance 24 h)

  freeDraws: number;

  owned: { acc: boolean[]; atelier: boolean[]; cadre: boolean[] };
  banner: { title: string; quote: number; pins: string[]; chall: number; msg: string };

  feed: FeedPost[];
  log: LogRow[];
  invitsOpen: number[];
  duels: Duel[];
  badges: string[];

  dio: { wall: number; floor: number; light: number; pos: Record<string, { x: number; y: number }>; out: Record<string, boolean> };

  stats: { questsDone: number; totalPx: number; duelsWon: number; postsSent: number };
  prefs: { sound: boolean; haptics: boolean; confetti: boolean };
  seen: { onboarding: boolean; questHelp: boolean; guide: boolean };
};
