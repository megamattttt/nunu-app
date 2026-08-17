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
  /** Ancien champ sommeil : conservé pour les points déjà notés, plus demandé. */
  sleep?: number | null;
  note: string;
  ideas: string[];
  tags: string[];
  /** Photo du jour (dataURL JPEG compressé, gardée sur l'appareil). */
  photo?: string;
  /** Les personnes vues dans la journée. */
  who?: string[];
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
  !!c && (c.mood > 0 || c.motivation > 0 || c.energie > 0 || !!c.note.trim()
    || c.ideas.length > 0 || c.tags.length > 0 || !!c.photo || !!(c.who && c.who.length));

/** Moyenne des valeurs renseignées, arrondie au dixième. 0 si rien. */
export function avgOf(values: number[]): number {
  const v = values.filter((x) => x > 0);
  if (!v.length) return 0;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
}

/* ---------------- Restitution ----------------
 * Tout ce qui se lit après coup : la courbe, ce que les mots-clés disent des
 * bons jours, le bilan de semaine écrit tout seul, la recherche.
 * Fonctions pures : elles prennent le dictionnaire des points et rien d'autre.
 */

export type Book = Record<string, DayCheckin>;

export type Point = { day: string; mood: number; energie: number; motivation: number };

/** Les n derniers jours en points de courbe (0 = jour non noté). */
export const series = (book: Book, n = 30, from: number = Date.now()): Point[] =>
  lastDays(n, from).map((day) => ({
    day,
    mood: book[day]?.mood || 0,
    energie: book[day]?.energie || 0,
    motivation: book[day]?.motivation || 0
  }));

const notedList = (book: Book) => Object.values(book).filter((c) => c && c.mood > 0);

/** Humeur moyenne de référence, toutes périodes confondues. */
export const moodBase = (book: Book) => avgOf(notedList(book).map((c) => c.mood));

export type TagStat = { tag: string; n: number; avg: number; delta: number };

/**
 * Ce que chaque mot-clé fait à l'humeur : moyenne des jours qui le portent,
 * et écart à l'humeur habituelle. Les mots-clés vus moins de `min` fois sont
 * écartés — deux jours ne font pas une tendance.
 */
export function tagStats(book: Book, min = 3): TagStat[] {
  const all = notedList(book);
  const base = avgOf(all.map((c) => c.mood));
  const map: Record<string, number[]> = {};
  all.forEach((c) => (c.tags || []).forEach((t) => { (map[t] = map[t] || []).push(c.mood); }));
  return Object.entries(map)
    .map(([tag, v]) => ({ tag, n: v.length, avg: avgOf(v), delta: Math.round((avgOf(v) - base) * 10) / 10 }))
    .filter((t) => t.n >= min)
    .sort((a, b) => b.delta - a.delta || b.n - a.n);
}

/** Les personnes déjà citées, les plus fréquentes d'abord. */
export function knownWho(book: Book, limit = 12): string[] {
  const map: Record<string, number> = {};
  Object.values(book).forEach((c) => (c?.who || []).forEach((w) => { map[w] = (map[w] || 0) + 1; }));
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([w]) => w).slice(0, limit);
}

const dayName = (k: string) =>
  new Date(k + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long' });

const nOf = (n: number, one: string, many = one + 's') => `${n} ${n > 1 ? many : one}`;

export type Review = {
  title: string;
  /** Bornes de la semaine, pour la navigation. */
  from: string; to: string;
  noted: number;
  avg: number;
  /** Phrases écrites à partir des points de la semaine. */
  lines: string[];
};

/**
 * Bilan de la semaine, écrit tout seul : combien de jours notés, l'humeur
 * dominante, le meilleur et le plus dur, ce qui revient, ce qui a été gardé.
 * `offset` recule de semaine en semaine (0 = semaine en cours).
 */
export function weekReview(book: Book, offset = 0): Review {
  const start = weekStart(Date.now() + offset * 7 * 864e5);
  const keys = weekGrid(start).filter((k) => keyToDate(k).getTime() <= Date.now());
  const days = keys.map((k) => book[k]).filter((c) => filled(c)) as DayCheckin[];
  const moods = days.map((c) => c.mood).filter((v) => v > 0);
  const avg = avgOf(moods);
  const last = keys[keys.length - 1] || keys[0];
  const title = `${start.getDate()} – ${keyToDate(last).getDate()} ${MONTHS[keyToDate(last).getMonth()]}`;
  const out: Review = { title, from: keys[0], to: last, noted: days.length, avg, lines: [] };

  if (!days.length) {
    out.lines.push('Aucun point noté cette semaine. Le bilan s’écrira dès le premier.');
    return out;
  }

  out.lines.push(
    days.length >= 6 ? `Semaine notée presque tous les jours — ${nOf(days.length, 'jour')} sur 7.`
    : days.length >= 3 ? `${nOf(days.length, 'jour')} notés sur 7.`
    : `${nOf(days.length, 'jour')} noté${days.length > 1 ? 's' : ''} seulement, la semaine reste floue.`
  );

  if (avg) {
    const best = days.filter((c) => c.mood > 0).reduce((a, b) => (b.mood > a.mood ? b : a));
    const hard = days.filter((c) => c.mood > 0).reduce((a, b) => (b.mood < a.mood ? b : a));
    out.lines.push(`Humeur moyenne ${avg.toFixed(1).replace('.', ',')} sur 5 — ${moodLabel(Math.round(avg) as Scale).toLowerCase()}.`);
    if (best.mood > hard.mood) {
      out.lines.push(`Le plus lumineux : ${dayName(best.day)} (${faceLabel(best).toLowerCase()}). Le plus dur : ${dayName(hard.day)} (${faceLabel(hard).toLowerCase()}).`);
    }
  }

  const en = avgOf(days.map((c) => c.energie));
  const mo = avgOf(days.map((c) => c.motivation));
  if (en && mo) {
    out.lines.push(
      Math.abs(en - mo) < 0.6 ? `Élan régulier : motivation et énergie autour de ${mo.toFixed(1).replace('.', ',')} sur 5.`
      : mo > en ? `L’envie était là (${mo.toFixed(1).replace('.', ',')}/5) plus que le corps (${en.toFixed(1).replace('.', ',')}/5).`
      : `Le corps suivait (${en.toFixed(1).replace('.', ',')}/5) plus que l’envie (${mo.toFixed(1).replace('.', ',')}/5).`
    );
  }

  const tags: Record<string, number> = {};
  days.forEach((c) => (c.tags || []).forEach((t) => { tags[t] = (tags[t] || 0) + 1; }));
  const top = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 3).filter(([, n]) => n > 1);
  if (top.length) out.lines.push(`Ce qui revient : ${top.map(([t, n]) => `${t} (${n})`).join(', ')}.`);

  const people = Array.from(new Set(days.flatMap((c) => c.who || [])));
  if (people.length) out.lines.push(`Vu ${people.slice(0, 4).join(', ')}${people.length > 4 ? ` et ${people.length - 4} autres` : ''}.`);

  const ideas = days.flatMap((c) => c.ideas || []);
  if (ideas.length) out.lines.push(`${nOf(ideas.length, 'idée')} gardée${ideas.length > 1 ? 's' : ''} — la dernière : « ${ideas[ideas.length - 1]} ».`);

  const photos = days.filter((c) => c.photo).length;
  if (photos) out.lines.push(`${nOf(photos, 'photo')} au passage.`);

  return out;
}

export type Hit = { day: string; field: 'pensée' | 'idée' | 'mot-clé' | 'personne'; text: string };

/** Recherche plein texte dans les pensées, idées, mots-clés et personnes. */
export function searchCheckins(book: Book, q: string, limit = 40): Hit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const out: Hit[] = [];
  Object.values(book)
    .sort((a, b) => (b?.day || '').localeCompare(a?.day || ''))
    .forEach((c) => {
      if (!c) return;
      if (c.note && c.note.toLowerCase().includes(needle)) out.push({ day: c.day, field: 'pensée', text: c.note });
      (c.ideas || []).forEach((i) => { if (i.toLowerCase().includes(needle)) out.push({ day: c.day, field: 'idée', text: i }); });
      (c.tags || []).forEach((t) => { if (t.toLowerCase().includes(needle)) out.push({ day: c.day, field: 'mot-clé', text: t }); });
      (c.who || []).forEach((w) => { if (w.toLowerCase().includes(needle)) out.push({ day: c.day, field: 'personne', text: w }); });
    });
  return out.slice(0, limit);
}

/** Toutes les idées gardées, la plus récente d'abord. */
export const allIdeas = (book: Book): { day: string; text: string }[] =>
  Object.values(book)
    .sort((a, b) => (b?.day || '').localeCompare(a?.day || ''))
    .flatMap((c) => (c?.ideas || []).map((text) => ({ day: c.day, text })));
