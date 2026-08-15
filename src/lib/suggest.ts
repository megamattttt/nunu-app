import { CATALOG, catalogOf, questById, type CatalogQuest } from '../data/catalog';
import { DIFFS, DIFF_LIST, type Difficulty } from '../data/quests';
import { skillById, SKILLS } from '../data/skills';

/**
 * Moteur de suggestion — fonction pure, aucun appel réseau.
 * Entrée : ce que la personne a validé, ce qu'elle a en cours, ses PX.
 * Sortie : des quêtes du catalogue, ordonnées, avec la raison de leur présence.
 */

export type Suggestion = {
  quest: CatalogQuest;
  skill: string;
  score: number;
  /** Phrase affichée sous la carte : « Parce que tu as validé Ourlet invisible ». */
  why: string;
  /** Quête inventée par le générateur de secours (catalogue épuisé). */
  generated?: boolean;
};

export type SuggestInput = {
  skill: string;
  /** Ids validés, du plus ancien au plus récent. */
  done: string[];
  /** Ids déjà en cours (exclus des suggestions). */
  active: string[];
  /** PX cumulés sur la compétence — donne le stade. */
  px: number;
  /** Graine : la même graine donne les mêmes suggestions (pas de sautillement au render). */
  seed?: number;
  n?: number;
};

/* ---------------- Stade et difficulté cible ---------------- */

/** Stade 0 (débutant) → 3 (avancé), déduit des PX de la compétence. */
export function stageOf(px: number): 0 | 1 | 2 | 3 {
  if (px >= 900) return 3;
  if (px >= 350) return 2;
  if (px >= 100) return 1;
  return 0;
}

/** Poids de chaque difficulté selon le stade : jamais de légendaire à un débutant. */
const MIX: Record<number, Record<Difficulty, number>> = {
  0: { facile: 40, moyen: 22, difficile: 4, legendaire: 0 },
  1: { facile: 26, moyen: 40, difficile: 16, legendaire: 3 },
  2: { facile: 12, moyen: 32, difficile: 40, legendaire: 16 },
  3: { facile: 6, moyen: 20, difficile: 34, legendaire: 40 }
};

/** Difficulté la mieux placée pour ce stade. */
export const targetDiff = (px: number): Difficulty =>
  DIFF_LIST.reduce((a, b) => (MIX[stageOf(px)][b] > MIX[stageOf(px)][a] ? b : a));

/* ---------------- Générateur pseudo-aléatoire seedé ---------------- */

function prng(seed: number) {
  let x = (seed || 1) >>> 0;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
}

/* ---------------- Scoring ---------------- */

const TAG_WEIGHT = 1;

function tagCounts(ids: string[]): Map<string, number> {
  const m = new Map<string, number>();
  ids.forEach((id) => (questById(id)?.tags || []).forEach((t) => m.set(t, (m.get(t) || 0) + TAG_WEIGHT)));
  return m;
}

type Scored = Suggestion & { reasons: string[] };

function scoreCandidate(c: CatalogQuest, input: SuggestInput, counts: Map<string, number>, recent: CatalogQuest[]): Scored {
  const reasons: string[] = [];
  let score = 0;

  // 1. Adéquation de difficulté (0 → 40)
  score += MIX[stageOf(input.px)][c.diff];

  // 2. Continuité : la quête est annoncée par une validée (champ `next`)
  const opener = recent.find((r) => (r.next || []).includes(c.id));
  if (opener) { score += 30; reasons.push(`Parce que tu as validé ${opener.name}`); }

  // 3. Thème déjà touché récemment : on enchaîne
  const shared = (c.tags || []).filter((t) => recent.some((r) => (r.tags || []).includes(t)));
  if (!opener && shared.length) { score += 14; reasons.push(`Dans la suite de ce que tu travailles (${shared[0]})`); }

  // 4. Anti-répétition : tous ses thèmes déjà largement couverts
  const covered = (c.tags || []).length > 0 && (c.tags || []).every((t) => (counts.get(t) || 0) >= 2);
  if (covered) { score -= 20; }

  // 5. Thème encore jamais abordé : un peu de nouveauté
  const fresh = (c.tags || []).filter((t) => !counts.has(t));
  if (fresh.length) { score += 8; if (!reasons.length) reasons.push(`Un terrain que tu n’as pas encore touché (${fresh[0]})`); }

  // 6. Palier majeur : valorisé seulement si le niveau suit
  if (c.major) score += stageOf(input.px) >= 2 ? 10 : -25;

  if (!reasons.length) {
    reasons.push(
      stageOf(input.px) >= 2
        ? `Au niveau de ${DIFFS[c.diff].label.toLowerCase()} où tu en es`
        : `Une ${DIFFS[c.diff].label.toLowerCase()} pour asseoir les bases`
    );
  }

  return { quest: c, skill: input.skill, score, why: reasons[0], reasons };
}

/* ---------------- Générateur de secours ---------------- */

/** Gabarits par compétence : [verbe/objet, contrainte]. Combinés quand le catalogue est épuisé. */
const TEMPLATES: Record<string, { obj: string[]; cons: string[] }> = {
  couture: {
    obj: ['Ourlet sur maille', 'Poche intérieure', 'Ceinture rapportée', 'Doublure de manche', 'Boutonnage caché', 'Empiècement d’épaule', 'Fente de manche', 'Col rapporté'],
    cons: ['sans une reprise', 'du premier coup', 'sur un tissu fluide', 'à la main', 'en moins d’une heure', 'sur une chute de lin']
  },
  course: {
    obj: ['Sortie en côte', 'Bloc de seuil', 'Sortie longue', 'Fractionné court', 'Sortie de récupération', 'Tempo continu'],
    cons: ['sans regarder la montre', 'au réveil', 'en négatif split', 'sur terrain souple', 'par temps froid', 'en respirant par le nez']
  },
  photo: {
    obj: ['Série au même endroit', 'Portrait en contre-jour', 'Détail de matière', 'Nature morte', 'Scène de nuit', 'Autoportrait'],
    cons: ['en douze images maximum', 'à une seule focale', 'sans recadrage', 'en lumière naturelle', 'en dix minutes', 'au trépied']
  },
  cuisine: {
    obj: ['Sauce montée', 'Pâte levée', 'Légume rôti', 'Bouillon corsé', 'Dessert de saison', 'Conserve maison'],
    cons: ['sans recette écrite', 'avec trois ingrédients', 'servi chaud à l’heure dite', 'en une seule casserole', 'goûté à chaque étape']
  },
  jardin: {
    obj: ['Semis en pleine terre', 'Bouture d’aromatique', 'Rotation de planche', 'Arrosage réglé', 'Purin maison', 'Récolte étalée'],
    cons: ['sur trois semaines', 'sans arrosage forcé', 'noté au carnet', 'avant la première gelée', 'à la lune descendante']
  },
  perso: {
    obj: ['Papier à classer', 'Placard à vider', 'Appel à passer', 'Rendez-vous à prendre', 'Liste à finir'],
    cons: ['avant ce soir', 'en une seule fois', 'sans écran à côté', 'en vingt minutes']
  }
};

/** PX au milieu de la bande de difficulté. */
const PX_OF_DIFF: Record<Difficulty, number> = { facile: 15, moyen: 35, difficile: 70, legendaire: 120 };

export function generateQuest(skill: string, diff: Difficulty, seed: number): CatalogQuest {
  const t = TEMPLATES[skill] || TEMPLATES.perso;
  const r = prng(seed);
  const obj = t.obj[Math.floor(r() * t.obj.length)];
  const cons = t.cons[Math.floor(r() * t.cons.length)];
  const px = PX_OF_DIFF[diff] + Math.floor(r() * 6) * (diff === 'legendaire' ? 10 : 2);
  return {
    id: `${skill}.gen-${seed}-${diff}`,
    name: obj,
    px,
    diff,
    description: `${obj}, ${cons}.`,
    tags: ['genere']
  };
}

/* ---------------- Sortie ---------------- */

export function suggest(input: SuggestInput): Suggestion[] {
  const n = input.n ?? 3;
  const done = new Set(input.done);
  const active = new Set(input.active);
  const counts = tagCounts(input.done);
  const recent = input.done.slice(-6).map(questById).filter(Boolean) as CatalogQuest[];

  const pool = catalogOf(input.skill)
    .filter((c) => !done.has(c.id) && !active.has(c.id))
    .map((c) => scoreCandidate(c, input, counts, recent))
    .sort((a, b) => b.score - a.score || a.quest.px - b.quest.px);

  // Diversité : une seule suggestion par thème dominant dans le lot.
  const out: Suggestion[] = [];
  const taken = new Set<string>();
  for (const cand of pool) {
    const key = (cand.quest.tags || ['-'])[0];
    if (taken.has(key) && out.length < n) continue;
    taken.add(key);
    out.push(cand);
    if (out.length >= n) break;
  }
  // Si la contrainte de diversité a trop réduit le lot, on complète.
  if (out.length < n) for (const cand of pool) {
    if (!out.includes(cand)) out.push(cand);
    if (out.length >= n) break;
  }

  // Catalogue épuisé : on invente, de façon déterministe pour cette graine.
  const seed = input.seed ?? input.done.length + input.px;
  let k = 0;
  while (out.length < n) {
    const quest = generateQuest(input.skill, targetDiff(input.px), seed + k * 977);
    out.push({
      quest, skill: input.skill, score: 0, generated: true,
      why: 'Tu as fait le tour du catalogue — celle-ci est composée pour toi'
    });
    k++;
  }

  return out.slice(0, n);
}

/**
 * Suggestion inter-compétences : à un stade élevé, propose aussi une compétence voisine.
 * Utilisée par l'écran Découvrir.
 */
export function suggestWide(inputs: Record<string, SuggestInput>, n = 6): Suggestion[] {
  const all: Suggestion[] = [];
  SKILLS.forEach((sk) => {
    const inp = inputs[sk.id];
    if (!inp || !CATALOG[sk.id]) return;
    suggest({ ...inp, n: 2 }).forEach((sg) => all.push(sg));
  });
  return all.sort((a, b) => b.score - a.score).slice(0, n);
}

export const skillLabel = (id: string) => skillById(id).name;
