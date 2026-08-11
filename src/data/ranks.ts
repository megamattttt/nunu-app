/**
 * Échelle de rang par compétence (nomenclature type LoL).
 * Fer → Challenger. Les sept premiers paliers ont 4 divisions (IV → I),
 * les trois derniers sont des paliers uniques.
 */
export type Tier = { name: string; short: string; c: string; txt: string; divs: number; cost: number };

export const TIERS: Tier[] = [
  { name: 'FER',          short: 'FER', c: '#9AA0A6', txt: '#0B0B0C', divs: 4, cost: 100 },
  { name: 'BRONZE',       short: 'BRZ', c: '#C08552', txt: '#0B0B0C', divs: 4, cost: 160 },
  { name: 'ARGENT',       short: 'ARG', c: '#C9CCD1', txt: '#0B0B0C', divs: 4, cost: 220 },
  { name: 'OR',           short: 'OR',  c: '#F0C64F', txt: '#0B0B0C', divs: 4, cost: 280 },
  { name: 'PLATINE',      short: 'PLA', c: '#EE5A82', txt: '#0B0B0C', divs: 4, cost: 340 },
  { name: 'ÉMERAUDE',     short: 'EME', c: '#7FB25C', txt: '#0B0B0C', divs: 4, cost: 400 },
  { name: 'DIAMANT',      short: 'DIA', c: '#A8CDEF', txt: '#0B0B0C', divs: 4, cost: 460 },
  { name: 'MAÎTRE',       short: 'MAI', c: '#F2879B', txt: '#FFFFFF', divs: 1, cost: 2000 },
  { name: 'GRAND MAÎTRE', short: 'GM',  c: '#E8734F', txt: '#FFFFFF', divs: 1, cost: 3000 },
  { name: 'CHALLENGER',   short: 'CHA', c: '#F3B563', txt: '#0B0B0C', divs: 1, cost: Infinity }
];

export const DIV_LABEL = ['IV', 'III', 'II', 'I'];

export type Rank = {
  step: number;        // index absolu dans l'échelle (0 = Fer IV)
  tier: number;        // index dans TIERS
  div: number;         // 0..3 (IV → I), -1 si palier sans division
  label: string;       // « OR III », « MAÎTRE »
  short: string;       // « OR III » version courte
  c: string; txt: string;
  pxIn: number;        // PX acquis dans la marche courante
  pxNeed: number;      // PX nécessaires pour finir la marche (Infinity au sommet)
  pct: number;         // 0..100
};

/** Liste des marches [tierIx, divIx, coût] dans l'ordre. */
export const STEPS: [number, number, number][] = TIERS.flatMap((t, ti) =>
  Array.from({ length: t.divs }, (_, di) => [ti, t.divs > 1 ? di : -1, t.cost] as [number, number, number])
);

export function rankOf(px: number): Rank {
  let left = Math.max(0, px);
  for (let i = 0; i < STEPS.length; i++) {
    const [ti, di, cost] = STEPS[i];
    if (left < cost || !isFinite(cost)) {
      const t = TIERS[ti];
      const label = di >= 0 ? `${t.name} ${DIV_LABEL[di]}` : t.name;
      return {
        step: i, tier: ti, div: di, label,
        short: di >= 0 ? `${t.short} ${DIV_LABEL[di]}` : t.short,
        c: t.c, txt: t.txt,
        pxIn: left, pxNeed: cost, pct: isFinite(cost) ? Math.min(100, Math.round((left / cost) * 100)) : 100
      };
    }
    left -= cost;
  }
  const t = TIERS[TIERS.length - 1];
  return { step: STEPS.length - 1, tier: TIERS.length - 1, div: -1, label: t.name, short: t.short, c: t.c, txt: t.txt, pxIn: left, pxNeed: Infinity, pct: 100 };
}

/** PX cumulés nécessaires pour atteindre la marche n. */
export function pxAtStep(n: number): number {
  let sum = 0;
  for (let i = 0; i < Math.min(n, STEPS.length); i++) sum += STEPS[i][2];
  return sum;
}

/** Prochaine marche (pour l'affichage « quoi ensuite »). */
export function nextRank(px: number): Rank | null {
  const r = rankOf(px);
  if (!isFinite(r.pxNeed)) return null;
  return rankOf(pxAtStep(r.step + 1));
}

/* ---- Niveau global du personnage : 1 → 999, courbe qui s'aplatit ---- */

const K = 50, P = 1.35;

/** PX cumulés nécessaires pour atteindre le niveau n. */
export const pxForLevel = (n: number) => Math.round(K * Math.pow(Math.max(1, n) - 1, P));

export function levelFromPx(px: number): number {
  const n = Math.floor(Math.pow(Math.max(0, px) / K, 1 / P)) + 1;
  return Math.max(1, Math.min(999, n));
}

/** Progression 0..100 dans le niveau courant. */
export function levelPct(px: number): number {
  const lvl = levelFromPx(px);
  if (lvl >= 999) return 100;
  const a = pxForLevel(lvl), b = pxForLevel(lvl + 1);
  return Math.max(0, Math.min(100, Math.round(((px - a) / Math.max(1, b - a)) * 100)));
}
