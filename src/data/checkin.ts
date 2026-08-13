/**
 * Point du jour — humeur, motivation, énergie, pensées, idées, tags.
 *
 * Fichier de données autonome : les échelles, le code couleur, les visages
 * d'humeur et les petits utilitaires de calendrier vivent ici. Aucune
 * dépendance au thème ni au store, pour que le calendrier de rétrospective,
 * l'accueil et la feuille de saisie partagent exactement les mêmes couleurs.
 */

export type Scale = 0 | 1 | 2 | 3 | 4 | 5;

export type DayCheckin = {
  /** Clé du jour, 'AAAA-MM-JJ' en heure locale. */
  day: string;
  /** Valence 1..5 — sert au code couleur et aux moyennes. */
  mood: Scale;
  /** Visage choisi (identifiant de FACES). Absent sur les points anciens. */
  face?: string;
  motivation: Scale;
  energie: Scale;
  /** Heures de sommeil, null si non renseigné. */
  sleep: number | null;
  note: string;
  ideas: string[];
  tags: string[];
  at: number;
};

/** Les 5 niveaux de valence : le code couleur des calendriers. */
export const MOODS: { v: Scale; label: string; c: string }[] = [
  { v: 1, label: 'Difficile', c: '#E8654F' },
  { v: 2, label: 'Mitigé',    c: '#E9A13B' },
  { v: 3, label: 'Neutre',    c: '#C7C2B4' },
  { v: 4, label: 'Bien',      c: '#7EC4B0' },
  { v: 5, label: 'Excellent', c: '#B9DE64' }
];

/** Dossier des visages peints, servis depuis `public/moods/`. */
const FACE_DIR = import.meta.env.BASE_URL + 'moods/';

export const moodSrc = (id: string) => FACE_DIR + id + '.png';

/**
 * Les onze visages, du plus dur au plus lumineux. `v` est la valence : elle
 * décide de la couleur de la case de calendrier et entre dans les moyennes.
 */
export const FACES: { id: string; label: string; v: Scale }[] = [
  { id: 'colere',    label: 'Colère',    v: 1 },
  { id: 'peur',      label: 'Peur',      v: 1 },
  { id: 'triste',    label: 'Triste',    v: 1 },
  { id: 'mecontent', label: 'Mécontent', v: 2 },
  { id: 'malade',    label: 'Malade',    v: 2 },
  { id: 'perdu',     label: 'Perdu',     v: 2 },
  { id: 'gene',      label: 'Gêné',      v: 3 },
  { id: 'timide',    label: 'Timide',    v: 3 },
  { id: 'content',   label: 'Content',   v: 4 },
  { id: 'zen',       label: 'Zen',       v: 5 },
  { id: 'heureux',   label: 'Heureux',   v: 5 }
];

/** Visage par défaut d'une valence, pour les points notés avant les visages. */
export const DEFAULT_FACE: Record<number, string> = {
  1: 'triste', 2: 'mecontent', 3: 'timide', 4: 'content', 5: 'heureux'
};

export const faceById = (id?: string | null) => FACES.find((f) => f.id === id);

/** Visage d'un point du jour : celui choisi, sinon celui de sa valence. */
export function faceOf(c?: { mood?: number; face?: string } | null) {
  if (!c) return undefined;
  return faceById(c.face) || (c.mood ? faceById(DEFAULT_FACE[c.mood]) : undefined);
}

export const moodOf = (v: Scale) => MOODS.find((m) => m.v === v);
export const moodColor = (v: Scale) => moodOf(v)?.c || '';
export const moodLabel = (v: Scale) => moodOf(v)?.label || 'Non noté';

/** Libellé affiché : le nom du visage si on en a un, sinon la valence. */
export const faceLabel = (c?: { mood?: number; face?: string } | null) =>
  faceOf(c)?.label || moodLabel((c?.mood || 0) as Scale);

/** Hex + alpha → rgba(), pour teinter une case de calendrier sans la délaver. */
export function hexA(hex: string, a: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Opacité de la case selon l'humeur : plus c'est haut, plus c'est franc. */
export const MOOD_ALPHA: Record<number, number> = { 1: .34, 2: .38, 3: .34, 4: .46, 5: .58 };

/** Fond d'une case de calendrier pour une humeur donnée. */
export const dayBg = (v: Scale, dark: boolean) =>
  v ? hexA(moodColor(v), MOOD_ALPHA[v]) : dark ? 'rgba(255,255,255,.05)' : 'rgba(11,11,12,.05)';

export const SCALE_LABELS = ['—', 'Très bas', 'Bas', 'Moyen', 'Haut', 'Très haut'];

/** Tags proposés ; on peut en écrire d'autres. */
export const SUGGESTED_TAGS = ['sport', 'travail', 'famille', 'repos', 'sortie', 'stress', 'créatif', 'nature', 'écrans', 'social'];

/* ---------------- Dates ---------------- */

const p2 = (n: number) => String(n).padStart(2, '0');

/** Clé locale d'un instant : 'AAAA-MM-JJ'. */
export const dayKey = (t: number | Date = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
};

export const keyToDate = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Les n derniers jours, du plus ancien au plus récent. */
export const lastDays = (n: number, from: number = Date.now()): string[] =>
  Array.from({ length: n }, (_, i) => dayKey(from - (n - 1 - i) * 864e5));

/** Lundi 0 h de la semaine contenant t. */
export function weekStart(t: number = Date.now()): Date {
  const d = new Date(t); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export const monthStart = (y: number, m: number) => new Date(y, m, 1);
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/**
 * Grille d'un mois, semaines commençant lundi. Les cases vides du début
 * valent null pour aligner le 1ᵉʳ sur le bon jour.
 */
export function monthGrid(y: number, m: number): (string | null)[] {
  const pad = (monthStart(y, m).getDay() + 6) % 7;
  const n = daysInMonth(y, m);
  return [
    ...Array.from({ length: pad }, () => null),
    ...Array.from({ length: n }, (_, i) => `${y}-${p2(m + 1)}-${p2(i + 1)}`)
  ];
}

/** Les 7 jours d'une semaine à partir de son lundi. */
export const weekGrid = (start: Date): string[] =>
  Array.from({ length: 7 }, (_, i) => dayKey(start.getTime() + i * 864e5));

export const emptyCheckin = (day = dayKey()): DayCheckin =>
  ({ day, mood: 0, motivation: 0, energie: 0, sleep: null, note: '', ideas: [], tags: [], at: Date.now() });

/** Un point est « rempli » dès qu'il porte une note ou une valeur. */
export const filled = (c?: DayCheckin | null) =>
  !!c && (c.mood > 0 || c.motivation > 0 || c.energie > 0 || !!c.note.trim() || c.ideas.length > 0 || c.tags.length > 0);

/** Moyenne des valeurs renseignées, arrondie au dixième. 0 si rien. */
export function avgOf(values: number[]): number {
  const v = values.filter((x) => x > 0);
  if (!v.length) return 0;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
}
