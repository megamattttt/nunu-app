/** Pioche : quêtes suggérées par compétence. [nom, px, description] */
export const DISCOVER: Record<string, [string, number, string][]> = {
  couture: [['Passant de ceinture',40,'Trois passants réguliers, cousus dans le droit-fil.'],['Col claudine doublé',55,'Un col rond symétrique, sans surépaisseur.'],['Poche plaquée invisible',35,'Une poche posée d’aplomb, coutures cachées.'],['Reprise de jean',30,'Réparer un genou usé sans que ça se voie.']],
  course: [['Sortie à jeun',35,'40 minutes en endurance douce, au réveil.'],['Escalier ×10',45,'Dix montées d’escalier, récupération en marchant.'],['Sortie longue 12 km',80,'Allure conversation, sans arrêt montre.']],
  photo: [['Portrait au flash',45,'Un flash direct assumé, sujet net.'],['Heure bleue',40,'Une image après le coucher du soleil, trépied.'],['Série de rue',55,'Cinq images cohérentes en une heure.']],
  cuisine: [['Bouillon clair',40,'Un fond filtré, sans trouble.'],['Pâte feuilletée',85,'Six tours, repos respectés.'],['Fermentation courte',45,'Un légume lacto-fermenté en 5 jours.']],
  jardin: [['Greffe en écusson',60,'Une greffe qui reprend au printemps.'],['Paillage complet',30,'Couvrir les planches avant l’été.'],['Récolte de graines',35,'Sécher et étiqueter trois variétés.']],
  perso: [['Vider la boîte mail',20,'Zéro message en attente ce soir.'],['Appeler mamie',15,'Vingt minutes, sans regarder l’heure.'],['Trier le placard',25,'Un sac à donner, un sac à jeter.']]
};

/* ---------------- Difficulté ---------------- */

export type Difficulty = 'facile' | 'moyen' | 'difficile' | 'legendaire';

/** Ordre d'affichage, libellé court et couleur (palette resserrée). */
export const DIFFS: Record<Difficulty, { label: string; short: string; c: string; txt: string; order: number; blocks: number }> = {
  facile:     { label: 'FACILE',     short: 'F',  c: '#E6DFD1', txt: '#0B0B0C', order: 0, blocks: 1 },
  moyen:      { label: 'MOYEN',      short: 'M',  c: '#C6F24E', txt: '#0B0B0C', order: 1, blocks: 2 },
  difficile:  { label: 'DIFFICILE',  short: 'D',  c: '#FFC24B', txt: '#0B0B0C', order: 2, blocks: 3 },
  legendaire: { label: 'LÉGENDAIRE', short: 'L',  c: '#FF4D3D', txt: '#FFFFFF', order: 3, blocks: 4 }
};

export const DIFF_LIST: Difficulty[] = ['facile', 'moyen', 'difficile', 'legendaire'];

/** Difficulté déduite de l'effort (PX) quand elle n'est pas renseignée. */
export function diffOfPx(px: number, major = false): Difficulty {
  if (major || px >= 100) return 'legendaire';
  if (px >= 55) return 'difficile';
  if (px >= 25) return 'moyen';
  return 'facile';
}

/** Tri par difficulté croissante, puis par PX. */
export const byDiff = (a: { diff: Difficulty; px: number }, b: { diff: Difficulty; px: number }) =>
  DIFFS[a.diff].order - DIFFS[b.diff].order || a.px - b.px;

/**
 * Suggestions pour les quêtes perso : mots-clés → difficulté et PX proposés.
 * Mapping statique, aucune inférence distante.
 */
const RULES: [string[], Difficulty, number][] = [
  [['ranger', 'trier', 'plier', 'vaisselle', 'poubelle', 'lit', 'arroser', 'appeler', 'message', 'boire'], 'facile', 10],
  [['lire', 'marcher', 'étirer', 'etirer', 'courses', 'ménage', 'menage', 'mail', 'noter', 'photo', 'esquisse'], 'facile', 15],
  [['courir', 'sortie', 'séance', 'seance', 'entraînement', 'entrainement', 'cuisiner', 'recette', 'coudre', 'ourlet', 'semis', 'bouture', 'réviser', 'reviser'], 'moyen', 30],
  [['km', 'fractionné', 'fractionne', 'patron', 'doublure', 'levain', 'greffe', 'montage', 'série', 'serie', 'atelier', 'chapitre'], 'difficile', 60],
  [['marathon', 'chemise', 'menu', 'exposition', 'concours', 'projet', 'potager', 'tirage', 'complet', 'complète', 'complete'], 'legendaire', 110]
];

export function suggestQuest(name: string, skill?: string): { diff: Difficulty; px: number; why: string } | null {
  const n = name.toLowerCase();
  for (let i = RULES.length - 1; i >= 0; i--) {
    const [words, diff, px] = RULES[i];
    const hit = words.find((w) => n.includes(w));
    if (hit) return { diff, px, why: `« ${hit} » ressemble à une quête ${DIFFS[diff].label.toLowerCase()}` };
  }
  if (n.trim().length > 3 && skill === 'perso') return { diff: 'facile', px: 10, why: 'Quête du quotidien' };
  return null;
}

/** Rareté d'une quête piochée — pondère PX et mise en scène. */
export type Rarity = 'commune' | 'rare' | 'legendaire';
export const RARITY: Record<Rarity, { label: string; c: string; mult: number; weight: number }> = {
  commune:    { label: 'COMMUNE',    c: '#E6DFD1', mult: 1,   weight: 74 },
  rare:       { label: 'RARE',       c: '#C6F24E', mult: 1.5, weight: 21 },
  legendaire: { label: 'LÉGENDAIRE', c: '#FFC24B', mult: 2.5, weight: 5 }
};

/**
 * Rareté d'un palier de plateau.
 * Règle de validation : commune et rare se valident d'un tap,
 * légendaire demande une preuve (photo + étapes).
 */
export function rarityOfBoard(px: number, major: boolean): Rarity {
  if (major) return 'legendaire';
  return px >= 50 ? 'rare' : 'commune';
}

/** Une quête se valide-t-elle instantanément ? */
export const isInstant = (r: Rarity) => r !== 'legendaire';

export function rollRarity(rand = Math.random): Rarity {
  const r = rand() * 100;
  if (r < RARITY.legendaire.weight) return 'legendaire';
  if (r < RARITY.legendaire.weight + RARITY.rare.weight) return 'rare';
  return 'commune';
}

export const NQ_PX = [5, 10, 20];
export const NQ_WHEN = ['Matin', 'Après-midi', 'Soir'];

export const CHALLENGES: [string, string][] = [
  ['Chemise complète','COUTURE · 120 PX'], ['10 km continus','COURSE · 90 PX'],
  ['Menu 3 services','CUISINE · 110 PX'], ['Série de rue','PHOTO · 55 PX']
];

export const QUOTES: [string, string][] = [
  ['Je préfère finir proprement que finir vite.', 'PALIER 4 COUTURE'],
  ['Ce qui compte, c’est le geste répété.', 'SÉRIE 10 JOURS'],
  ['On progresse en public, on doute en privé.', 'PREMIER DUEL GAGNÉ'],
  ['Une quête par jour, c’est déjà un atelier.', 'PALIER 2 PERSO']
];
