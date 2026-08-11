/** Cadres de la carte de profil — indépendants du style d'avatar. */
export const AV_FRAME = [
  { n:'Aucun', s:'' },
  { n:'Lime', s:'padding:4px;background:#B9DE64' },
  { n:'Papier', s:'padding:6px;background:#F4F2ED' },
  { n:'Doré', s:'padding:4px;background:#E8B863' },
  { n:'Pointillé', s:'padding:5px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.55)' },
  { n:'Double', s:'padding:6px;background:#0A0A0C;box-shadow:0 0 0 2px #B9DE64' },
  { n:'Coutures', s:'padding:5px;background:#1C1C23;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.32)' },
  { n:'Corail', s:'padding:4px;background:#E2685A' }
];

/** Couleurs de signature du profil. */
export const AV_SIG = ['#B9DE64','#E2685A','#E8B863','#DED6C6','#6FA5D8','#9C8AD6','#5CBFAE','#F4F2ED'];

export const AV_TITLES: [string, string, number][] = [
  ['Reine de la maille','couture',12], ['Petite main affirmée','couture',6], ['Coureuse régulière','course',5],
  ['Œil curieux','photo',2], ['Bonne pâte','cuisine',6], ['Main verte','jardin',3],
  ['Journée tenue','perso',5], ['Touche-à-tout','perso',14], ['Marathonienne','course',12]
];

/** Cadres verrouillés : index -> [compétence, niveau requis]. */
export const AV_FRAME_LOCKS: Record<number, [string, number]> = {
  4: ['cuisine', 8],
  5: ['course', 10]
};
