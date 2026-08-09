/** Pioche : quêtes suggérées par compétence. [nom, px, description] */
export const DISCOVER: Record<string, [string, number, string][]> = {
  couture: [['Passant de ceinture',40,'Trois passants réguliers, cousus dans le droit-fil.'],['Col claudine doublé',55,'Un col rond symétrique, sans surépaisseur.'],['Poche plaquée invisible',35,'Une poche posée d’aplomb, coutures cachées.'],['Reprise de jean',30,'Réparer un genou usé sans que ça se voie.']],
  course: [['Sortie à jeun',35,'40 minutes en endurance douce, au réveil.'],['Escalier ×10',45,'Dix montées d’escalier, récupération en marchant.'],['Sortie longue 12 km',80,'Allure conversation, sans arrêt montre.']],
  photo: [['Portrait au flash',45,'Un flash direct assumé, sujet net.'],['Heure bleue',40,'Une image après le coucher du soleil, trépied.'],['Série de rue',55,'Cinq images cohérentes en une heure.']],
  cuisine: [['Bouillon clair',40,'Un fond filtré, sans trouble.'],['Pâte feuilletée',85,'Six tours, repos respectés.'],['Fermentation courte',45,'Un légume lacto-fermenté en 5 jours.']],
  jardin: [['Greffe en écusson',60,'Une greffe qui reprend au printemps.'],['Paillage complet',30,'Couvrir les planches avant l’été.'],['Récolte de graines',35,'Sécher et étiqueter trois variétés.']],
  perso: [['Vider la boîte mail',20,'Zéro message en attente ce soir.'],['Appeler mamie',15,'Vingt minutes, sans regarder l’heure.'],['Trier le placard',25,'Un sac à donner, un sac à jeter.']]
};

/** Rareté d'une quête piochée — pondère PX et mise en scène. */
export type Rarity = 'commune' | 'rare' | 'legendaire';
export const RARITY: Record<Rarity, { label: string; c: string; mult: number; weight: number }> = {
  commune:    { label: 'COMMUNE',    c: '#E6DFD1', mult: 1,   weight: 74 },
  rare:       { label: 'RARE',       c: '#A8D8FF', mult: 1.5, weight: 21 },
  legendaire: { label: 'LÉGENDAIRE', c: '#FFC93C', mult: 2.5, weight: 5 }
};

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
