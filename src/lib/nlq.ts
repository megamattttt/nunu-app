import { type Importance } from '../data/importance';

/**
 * Analyse d'une saisie libre en français : « Dentiste mardi 14h important ».
 * Tout est local et déterministe — aucun appel distant.
 * Les fragments reconnus sont retirés du nom, ce qui laisse un libellé propre.
 */

export type Parsed = {
  /** Libellé nettoyé de ses marqueurs de date, d'heure et d'importance. */
  name: string;
  /** Échéance en horodatage, ou null si la saisie n'en contient pas. */
  due: number | null;
  /** L'heure a-t-elle été précisée (sinon l'échéance vaut « dans la journée ») ? */
  timed: boolean;
  imp: Importance;
  /** Fragments reconnus, affichés en retour à l'utilisateur. */
  hits: { kind: 'date' | 'heure' | 'importance'; text: string }[];
};

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const fold = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Applique une expression : renvoie la capture et retire le fragment du texte. */
function take(text: string, re: RegExp): { text: string; m: RegExpMatchArray | null } {
  const m = text.match(re);
  if (!m) return { text, m: null };
  return { text: text.slice(0, m.index!) + ' ' + text.slice(m.index! + m[0].length), m };
}

const atMidnight = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

export function parseQuest(input: string, now: Date = new Date()): Parsed {
  let rest = ' ' + input + ' ';
  const hits: Parsed['hits'] = [];
  let imp: Importance = 'normal';
  let day: Date | null = null;
  let hour: number | null = null;
  let min = 0;

  /* --- Importance --- */
  const impRules: [RegExp, Importance][] = [
    [/(?:^|\s)(critique|urgent|urgente|prioritaire|tr[eè]s important[e]?)(?=\s|$)|!{3}/i, 'critique'],
    [/(?:^|\s)(important|importante)(?=\s|$)|!{2}/i, 'important'],
    [/(?:^|\s)(normal|normale|tranquille|pas press[eé]|quand je peux)(?=\s|$)/i, 'normal']
  ];
  for (const [re, level] of impRules) {
    const r = take(rest, re);
    if (r.m) { rest = r.text; imp = level; hits.push({ kind: 'importance', text: r.m[0].trim() }); break; }
  }

  /* --- Dates relatives --- */
  let r = take(rest, /(?:^|\s)apr[eè]s[-\s]demain(?=\s|$)/i);
  if (r.m) { rest = r.text; day = atMidnight(now); day.setDate(day.getDate() + 2); hits.push({ kind: 'date', text: 'après-demain' }); }

  if (!day) {
    r = take(rest, /(?:^|\s)demain(?=\s|$)/i);
    if (r.m) { rest = r.text; day = atMidnight(now); day.setDate(day.getDate() + 1); hits.push({ kind: 'date', text: 'demain' }); }
  }

  if (!day) {
    r = take(rest, /(?:^|\s)(aujourd[’']hui|ce soir|ce matin|ce midi|cet apr[eè]s[-\s]midi|cette nuit)(?=\s|$)/i);
    if (r.m) {
      rest = r.text;
      day = atMidnight(now);
      const f = fold(r.m[1]);
      if (f === 'ce soir') hour = 19;
      else if (f === 'ce matin') hour = 9;
      else if (f === 'ce midi') hour = 12;
      else if (f.startsWith('cet apres')) hour = 14;
      else if (f === 'cette nuit') hour = 22;
      hits.push({ kind: 'date', text: r.m[1] });
    }
  }

  if (!day) {
    r = take(rest, /(?:^|\s)dans\s+(\d{1,3})\s*(jours?|semaines?|mois|heures?|h|minutes?|min)(?=\s|$)/i);
    if (r.m) {
      rest = r.text;
      const n = parseInt(r.m[1], 10);
      const unit = fold(r.m[2]);
      const d = new Date(now);
      if (unit.startsWith('jour')) { d.setDate(d.getDate() + n); day = atMidnight(d); }
      else if (unit.startsWith('semaine')) { d.setDate(d.getDate() + n * 7); day = atMidnight(d); }
      else if (unit.startsWith('mois')) { d.setMonth(d.getMonth() + n); day = atMidnight(d); }
      else if (unit.startsWith('h')) { d.setHours(d.getHours() + n); day = atMidnight(d); hour = d.getHours(); min = d.getMinutes(); }
      else { d.setMinutes(d.getMinutes() + n); day = atMidnight(d); hour = d.getHours(); min = d.getMinutes(); }
      hits.push({ kind: 'date', text: r.m[0].trim() });
    }
  }

  /* --- Jour de la semaine --- */
  if (!day) {
    r = take(rest, /(?:^|\s)(?:(?:ce|le)\s+)?(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?:\s+prochain)?(?=\s|$)/i);
    if (r.m) {
      rest = r.text;
      const want = DAYS.indexOf(fold(r.m[1]));
      const d = atMidnight(now);
      let delta = (want - d.getDay() + 7) % 7;
      if (delta === 0 || /prochain/i.test(r.m[0])) delta = delta === 0 ? 7 : delta;
      d.setDate(d.getDate() + delta);
      day = d;
      hits.push({ kind: 'date', text: r.m[0].trim() });
    }
  }

  /* --- Date numérique ou littérale --- */
  if (!day) {
    r = take(rest, /(?:^|\s)(?:le\s+)?(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?(?=\s|$)/);
    if (r.m) {
      rest = r.text;
      const d = atMidnight(now);
      const yr = r.m[3] ? (r.m[3].length === 2 ? 2000 + +r.m[3] : +r.m[3]) : d.getFullYear();
      d.setFullYear(yr, +r.m[2] - 1, +r.m[1]);
      if (!r.m[3] && d.getTime() < atMidnight(now).getTime()) d.setFullYear(yr + 1);
      day = d;
      hits.push({ kind: 'date', text: r.m[0].trim() });
    }
  }

  if (!day) {
    r = take(rest, /(?:^|\s)(?:le\s+)?(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)(?=\s|$)/i);
    if (r.m) {
      rest = r.text;
      const mi = MONTHS.findIndex((m) => fold(m) === fold(r.m![2]));
      const d = atMidnight(now);
      d.setMonth(mi, +r.m[1]);
      if (d.getTime() < atMidnight(now).getTime()) d.setFullYear(d.getFullYear() + 1);
      day = d;
      hits.push({ kind: 'date', text: r.m[0].trim() });
    }
  }

  /* --- Heure --- */
  if (hour === null) {
    r = take(rest, /(?:^|\s)(?:[àa]\s*)?midi(?=\s|$)/i);
    if (r.m) { rest = r.text; hour = 12; hits.push({ kind: 'heure', text: 'midi' }); }
  }
  if (hour === null) {
    r = take(rest, /(?:^|\s)(?:[àa]\s*)?minuit(?=\s|$)/i);
    if (r.m) { rest = r.text; hour = 0; hits.push({ kind: 'heure', text: 'minuit' }); }
  }
  if (hour === null) {
    r = take(rest, /(?:^|\s)(?:[àa]\s+)?(\d{1,2})\s*(?:h|:)\s*([0-5]\d)?(?=\s|$)/i);
    if (r.m) {
      const h = +r.m[1];
      if (h <= 23) {
        rest = r.text; hour = h; min = r.m[2] ? +r.m[2] : 0;
        hits.push({ kind: 'heure', text: `${hour}h${min ? String(min).padStart(2, '0') : ''}` });
      }
    }
  }

  /* --- Assemblage --- */
  const timed = hour !== null;
  let due: number | null = null;
  if (day || timed) {
    const d = day ? new Date(day) : atMidnight(now);
    d.setHours(hour ?? 9, min, 0, 0);
    // Une heure seule, déjà passée, bascule au lendemain.
    if (!day && d.getTime() < now.getTime()) d.setDate(d.getDate() + 1);
    due = d.getTime();
  }

  const name = rest.replace(/\s{2,}/g, ' ').replace(/\s*[,;]\s*$/, '').trim();
  return { name: name.charAt(0).toUpperCase() + name.slice(1), due, timed, imp, hits };
}

/* ---------------- Affichage ---------------- */

const H = (t: number) => {
  const d = new Date(t);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Étiquette courte d'une échéance : « Aujourd'hui · 14h00 », « Mar. 12 mars ». */
export function dueLabel(due: number | null, timed = true, now = Date.now()): string {
  if (!due) return 'Sans date';
  const d = new Date(due);
  const t0 = new Date(now); t0.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(due).setHours(0, 0, 0, 0) - t0.getTime()) / 864e5);
  const clock = timed ? ' · ' + H(due) : '';
  if (days < 0) return (days === -1 ? 'Hier' : `Il y a ${-days} jours`) + clock;
  if (days === 0) return 'Aujourd’hui' + clock;
  if (days === 1) return 'Demain' + clock;
  if (days < 7) return DAYS[d.getDay()].replace(/^./, (c) => c.toUpperCase()) + clock;
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 4)}${clock}`;
}

/** Groupe de tri : le plus urgent en premier. */
export function dueBucket(due: number | null, now = Date.now()): number {
  if (!due) return 5;
  const t0 = new Date(now); t0.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(due).setHours(0, 0, 0, 0) - t0.getTime()) / 864e5);
  if (due < now) return 0;
  if (days === 0) return 1;
  if (days === 1) return 2;
  if (days < 7) return 3;
  return 4;
}

export const BUCKETS = ['EN RETARD', 'AUJOURD’HUI', 'DEMAIN', 'CETTE SEMAINE', 'PLUS TARD', 'SANS DATE'];
