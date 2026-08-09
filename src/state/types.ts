import type { FeedPost } from '../data/social';

export type Progress = { px: number; done: number };

export type CustomQuest = {
  id: string; skill: string; name: string; px: number; when: number;
  desc?: string; rarity?: 'commune' | 'rare' | 'legendaire'; done?: boolean;
};

export type Task = { id: string; label: string; px: number; done: boolean };

export type LogRow = { name: string; tag: string; val: string; when: string };

export type Duel = {
  id: string; who: string; name: string; skill: string; stake: number;
  status: 'en cours' | 'gagné' | 'perdu'; myScore?: number; theirScore?: number; deadline: string;
};

export type AvatarConfig = Record<string, number>;

export type GameState = {
  version: number;
  logged: boolean;
  createdAt: number;

  profile: {
    pseudo: string; atelier: string; titleIx: number; sig: number;
    av: AvatarConfig; cadre: number;
  };

  progress: Record<string, Progress>;
  customQuests: CustomQuest[];
  pioched: string[];          // ids de quêtes ajoutées depuis la pioche
  tasks: Task[];

  energy: number;
  coins: number;
  lp: number;
  pal: number;                // palier de ligue (0..4)
  div: number;                // division (1..4)
  streak: number;
  lastDay: string | null;
  freeDraws: number;          // pioches restantes aujourd'hui

  owned: { acc: boolean[]; atelier: boolean[]; cadre: boolean[] };
  banner: { title: string; quote: number; pins: string[]; chall: number; msg: string };

  feed: FeedPost[];
  log: LogRow[];
  invitsOpen: number[];
  duels: Duel[];
  badges: string[];           // "skill:index"

  dio: { wall: number; floor: number; light: number; pos: Record<string, { x: number; y: number }>; out: Record<string, boolean> };

  stats: { questsDone: number; totalPx: number; duelsWon: number; postsSent: number };
  prefs: { sound: boolean; haptics: boolean; confetti: boolean };
  seen: { onboarding: boolean };
};
