import type { FeedPost } from '../data/social';
import type { Rarity, Difficulty } from '../data/quests';
import type { Importance } from '../data/importance';
import type { NotifPrefs } from '../lib/notify';
import type { DioItem } from '../lib/dio';
import type { DioVisit } from '../data/dioSocial';

export type Progress = { px: number; done: number };

export type CustomQuest = {
  id: string; skill: string; name: string; px: number; when: number;
  desc?: string; rarity?: Rarity; done?: boolean;
  /** Niveau de difficulté choisi à la création (ou suggéré). */
  diff?: Difficulty;
  /** Lien joint à la quête (tuto, vidéo, article) — sauvegardé avec elle. */
  link?: string;
  /** Échéance (horodatage). Utilisée par la compétence perso pour les rappels. */
  due?: number | null;
  /** L'heure a-t-elle été précisée ? Sinon l'échéance vaut « dans la journée ». */
  timed?: boolean;
  /** Importance — remplace la difficulté sur la compétence perso. */
  imp?: Importance;
};

export type Task = { id: string; label: string; px: number; done: boolean };

/** Pack de quêtes perso : un nom, une liste de tâches, ajouté en un clic. */
export type QuestPack = { id: string; name: string; items: string[]; icon?: string; mine?: boolean };

/** Une validation horodatée — matière première de la vue semaine et des statistiques. */
export type HistoryRow = { t: number; px: number; skill: string; name: string; kind: 'quete' | 'tache' | 'duel' };

export type LogRow = { name: string; tag: string; val: string; when: string };

export type Duel = {
  id: string; who: string; name: string; skill: string; stake: number;
  status: 'en cours' | 'gagné' | 'perdu'; myScore?: number; theirScore?: number; deadline: string;
};

/** Configuration d'avatar Big Ears : une valeur de variante par option du style. */
export type AvatarConfig = Record<string, string>;

/** Entrée du journal de progression. */
export type JournalEntry = {
  id: string;
  skill: string;
  /** Index du palier documenté, ou null pour une entrée libre. */
  ix: number | null;
  title: string;
  note: string;
  /** Ressenti 0..4, -1 si non renseigné. */
  mood: number;
  /** Difficulté ressentie 0..4, -1 si non renseignée. */
  diff: number;
  /** Durée passée en minutes, 0 si non renseignée. */
  minutes: number;
  /** Photos compressées (dataURL JPEG). */
  photos: string[];
  when: number;
  /** Créée automatiquement par la validation d'un palier. */
  auto?: boolean;
};

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
    /** Nom donné à l'espace perso (compétence solo). */
    persoName?: string;
  };

  progress: Record<string, Progress>;
  customQuests: CustomQuest[];
  /** Packs de quêtes de l'espace perso : listes prêtes à ajouter en un clic. */
  packs: QuestPack[];
  pioched: string[];
  tasks: Task[];

  /** Compétence choisie à l'onboarding. */
  startSkill: string | null;

  /** Étape du parcours de première connexion : 0 avatar · 1 guide · 2 compétence · 3 première quête. */
  flow: number;

  /** Combo de validations rapprochées (fenêtre de 30 min). */
  combo: { n: number; best: number; last: number | null };

  /** Journal de progression : une entrée par palier validé + entrées libres. */
  journal: JournalEntry[];

  /** Historique horodaté des validations (90 derniers jours). */
  history: HistoryRow[];

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

  dio: {
    /** Nom donné à l'atelier — il s'affiche sur le profil. */
    name: string;
    wall: number; floor: number; light: number;
    /** La lumière suit l'heure réelle. */
    lightAuto: boolean;
    /** Météo : 0 clair · 1 couvert · 2 pluie · 3 grand vent. */
    weather: number;
    /** Placements : rotation, échelle, calque et variante de couleur par objet. */
    items: Record<string, DioItem>;
    /** Objets rangés dans l'inventaire. */
    out: Record<string, boolean>;
    /** Agencements enregistrés. */
    presets: { name: string; wall: number; floor: number; light: number; items: Record<string, DioItem> }[];
    /** Réactions laissées par les visiteurs. */
    visits: DioVisit[];
    /** Ancien format (positions en pourcentage) — migré à l'hydratation. */
    pos?: Record<string, { x: number; y: number }>;
  };

  stats: { questsDone: number; totalPx: number; duelsWon: number; postsSent: number };
  prefs: { sound: boolean; haptics: boolean; confetti: boolean };
  /** Rappels : réglage global, appliqué à toutes les quêtes datées. */
  notif: NotifPrefs;
  seen: { onboarding: boolean; questHelp: boolean; guide: boolean };
};
