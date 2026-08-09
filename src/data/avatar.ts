export const AV_SKIN = ['#F9E2CC','#F3D2B5','#E9BF9C','#DFAC84','#CE9A6E','#BA845A','#A36F48','#8C5B39','#75492D','#5F3B25','#4B2E1D','#36211A'];
export const AV_HAIRC = ['#1E1815','#332721','#4B342A','#6B4227','#8E5A2B','#B07C35','#CFAE58','#E6D9BC','#B84A34','#D9603F','#8E5BC8','#3F6FB8','#2C8C73','#A9D63F','#9A9AA0','#E8E6E2'];
export const AV_EYEC = ['#42302A','#5C4230','#7A5636','#8E6B3C','#3E6B57','#41708C','#525C99','#6E4A72','#2C2C31','#7E8288'];
export const AV_TOPC = ['#C6F24E','#FF5C42','#6C63FF','#FFC93C','#A8D8FF','#F6F4EF','#B06FF0','#2FA88A','#E8DCC0','#17171A','#F8A79F','#3C6E8F'];
export const AV_BOTC = ['#3C5A80','#17171A','#8A7A5C','#5E5B57','#E8DCC0','#6C4A2E','#2FA88A','#B0564E'];
export const AV_STREAKC = ['#17171A','#CFAE58','#D9603F','#8E5BC8','#3F6FB8','#2C8C73','#A9D63F','#E8E6E2'];
export const AV_SIG = ['#C6F24E','#FF5C42','#6C63FF','#FFC93C','#A8D8FF','#B06FF0','#2FA88A','#F8A79F'];

export const AV_FRAME = [
  { n:'Aucun', s:'' },
  { n:'Lime', s:'padding:4px;background:#C6F24E' },
  { n:'Papier', s:'padding:6px;background:#F6F4EF' },
  { n:'Doré', s:'padding:4px;background:#FFC93C' },
  { n:'Pointillé', s:'padding:5px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.55)' },
  { n:'Double', s:'padding:6px;background:#0B0B0C;box-shadow:0 0 0 2px #C6F24E' },
  { n:'Coutures', s:'padding:5px;background:#17171A;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.32)' },
  { n:'Corail', s:'padding:4px;background:#FF5C42' }
];

export const AV_L: Record<string, string[]> = {
  face: ['Ovale','Rond','Carré','Cœur','Allongé','Diamant','Mâchoire carrée','Poire','Triangle','Rectangle'],
  eyes: ['Amande','Ronds','Grands','Petits','Mi-clos','Relevés','Tombants','Bridés','Ovales','Larges','Rieurs','Fins'],
  lash: ['Aucun','Court','Fourni','Long','Bas'],
  brow: ['Droit','Arqué','Épais','Fin','Cassé','Broussailleux','Relevé','Tombant'],
  nose: ['Fin','Petit','Droit','Arrondi','Aquilin','Large','Retroussé','Bouton'],
  mouth: ['Neutre','Fine ligne','Sourire','Sourire ouvert','Rire','Lèvres pleines','Moue','Sourire en coin','Serrée','Contrariée'],
  mark: ['Aucune','Rousseur','Grain de beauté','Cicatrice','Vitiligo','Fossettes'],
  makeup: ['Aucun','Lèvres','Blush','Eyeliner','Fard','Complet'],
  hair: ['Rasé','Court dégradé','Brosse','Undercut','Crête','Coupe au bol','Frange droite','Frange rideau','Raie côté','Carré','Carré long','Longs lisses','Longs ondulés','Boucles épaules','Afro','Afro court','Locks','Tresses fines','Tresse','Deux tresses','Couettes','Queue haute','Queue basse','Chignon haut','Chignon bas','Mulet'],
  streak: ['Aucune','Doré','Corail','Violet','Bleu','Vert','Lime','Crème'],
  beard: ['Rasé','Naissante','Moustache','Bouc','Moustache + bouc','Barbe courte','Barbe pleine','Barbe longue','Favoris','Chevron'],
  top: ['T-shirt col rond','T-shirt col V','Chemise','Chemise ouverte','Pull col rond','Col roulé','Sweat capuche','Veste','Blazer','Débardeur','Salopette','Sweat zippé'],
  hat: ['Aucun','Bonnet','Bonnet pompon','Casquette','Casquette plate','Bucket','Béret','Panama','Bandana','Capuche','Serre-tête','Casque audio'],
  glasses: ['Aucune','Rondes','Carrées','Rectangulaires','Aviateur','Cat-eye','Sport','Soleil','Demi-lune'],
  jewel: ['Aucun','Clous','Créoles','Pendantes','Piercing nez','Piercing sourcil','Collier','Chaîne + clous'],
  bottom: ['Jean','Jean large','Chino','Short','Jupe','Jupe longue','Jupe plissée','Jogging','Cargo','Legging'],
  shoes: ['Baskets','Baskets montantes','Bottes','Bottines','Mocassins','Sandales','Claquettes','Sport'],
  scene: ['Aucune','Atelier','Podium','Studio','Bibliothèque','Terrasse','Salle de sport','Concert','Espace'],
  aura: ['Aucune','Anneau','Rayons','Éclats','Double anneau','Prestige'],
  bgPal: ['Lin','Sable','Terracotta','Bleu ciel','Olive','Miel','Menthe','Rose ancien','Lavande','Encre','Nuit lime','Corail','Papier','Ardoise'],
  bgStyle: ['Uni','Bandes','Obliques','Damier','Arche','Cercle','Rayons','Confettis','Fines rayures','Horizon','Pointillé','Diagonale','Cadre','Vagues','Zigzag','Voûte']
};

export const AV_GROUPS = ['VISAGE','CHEVEUX','TENUE','BAS','DÉCOR','IDENTITÉ'];

export type AvCat = { k: string; g: number; n: string; kind: 'a' | 'c' | 'f'; crop?: any; pal?: string[] };

export const AV_CATS: AvCat[] = [
  { k:'skin', g:0, n:'Teint', kind:'c', pal:AV_SKIN },
  { k:'face', g:0, n:'Forme', kind:'a', crop:'face' },
  { k:'eyes', g:0, n:'Yeux', kind:'a', crop:'face' },
  { k:'eyeC', g:0, n:'Iris', kind:'c', pal:AV_EYEC },
  { k:'lash', g:0, n:'Cils', kind:'a', crop:'face' },
  { k:'brow', g:0, n:'Sourcils', kind:'a', crop:'face' },
  { k:'nose', g:0, n:'Nez', kind:'a', crop:'face' },
  { k:'mouth', g:0, n:'Bouche', kind:'a', crop:'face' },
  { k:'mark', g:0, n:'Marques', kind:'a', crop:'face' },
  { k:'makeup', g:0, n:'Maquillage', kind:'a', crop:'face' },
  { k:'hair', g:1, n:'Coupe', kind:'a', crop:'bust' },
  { k:'hairC', g:1, n:'Couleur', kind:'c', pal:AV_HAIRC },
  { k:'streak', g:1, n:'Mèche', kind:'c', pal:AV_STREAKC },
  { k:'beard', g:1, n:'Pilosité', kind:'a', crop:'face' },
  { k:'top', g:2, n:'Haut', kind:'a', crop:'bust' },
  { k:'topC', g:2, n:'Couleur', kind:'c', pal:AV_TOPC },
  { k:'hat', g:2, n:'Couvre-chef', kind:'a', crop:'bust' },
  { k:'glasses', g:2, n:'Lunettes', kind:'a', crop:'face' },
  { k:'jewel', g:2, n:'Bijoux', kind:'a', crop:'face' },
  { k:'bottom', g:3, n:'Bas', kind:'a', crop:'full' },
  { k:'bottomC', g:3, n:'Couleur', kind:'c', pal:AV_BOTC },
  { k:'shoes', g:3, n:'Chaussures', kind:'a', crop:'full' },
  { k:'bgPal', g:4, n:'Palette', kind:'a', crop:'bust' },
  { k:'bgStyle', g:4, n:'Motif', kind:'a', crop:'bust' },
  { k:'scene', g:4, n:'Scène', kind:'a', crop:'full' },
  { k:'aura', g:4, n:'Aura', kind:'a', crop:'bust' },
  { k:'frame', g:4, n:'Cadre', kind:'f' }
];

/** Options verrouillées : clé -> index -> [compétence, niveau requis]. */
export const AV_LOCKS: Record<string, Record<number, [string, number]>> = {
  hair: { 16:['couture',10], 19:['course',9], 23:['perso',6], 25:['perso',11] },
  streak: { 5:['jardin',5], 6:['jardin',8] },
  beard: { 7:['perso',9] },
  top: { 7:['couture',12], 8:['couture',18], 10:['jardin',4], 11:['cuisine',12] },
  hat: { 6:['jardin',3], 8:['course',12], 11:['cuisine',10] },
  glasses: { 5:['photo',4], 6:['course',10] },
  jewel: { 6:['perso',7], 7:['perso',12] },
  makeup: { 4:['perso',4], 5:['perso',10] },
  bottom: { 6:['couture',14], 8:['course',6] },
  shoes: { 2:['jardin',6], 5:['photo',5], 7:['course',8] },
  scene: { 4:['photo',6], 6:['course',10], 7:['perso',8], 8:['photo',12] },
  aura: { 3:['perso',6], 4:['photo',8], 5:['perso',18] },
  bgStyle: { 12:['couture',8], 13:['jardin',6], 15:['cuisine',9] },
  frame: { 4:['cuisine',8], 5:['course',10] }
};

export const AV_TITLES: [string, string, number][] = [
  ['Reine de la maille','couture',12], ['Petite main affirmée','couture',6], ['Coureuse régulière','course',5],
  ['Œil curieux','photo',2], ['Bonne pâte','cuisine',6], ['Main verte','jardin',3],
  ['Journée tenue','perso',5], ['Touche-à-tout','perso',14], ['Marathonienne','course',12]
];
