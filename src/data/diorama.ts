/**
 * Diorama papier découpé — boîte isométrique (mur du fond + mur gauche + sol).
 *
 * Chaque objet est une pile de calques plats, décrits en tuples compacts :
 *   [x, y, largeur, hauteur, rayon (-1 = cercle), couleur, rotation°?]
 * La couleur est un index de la palette `P`, ou -1 pour « teinte de l'objet »
 * (c'est ce qui permet les variantes de couleur choisies par la joueuse).
 *
 * Les coordonnées de placement sont exprimées en pourcentage de surface :
 *   sol   → x 0..100 (vers le mur droit), y 0..100 (vers le mur gauche)
 *   mur   → x 0..100 (depuis l'angle du fond), y 0..100 (haut→bas du pan)
 * `wb` désigne le mur droit, `wl` le mur gauche. La projection est faite dans `lib/dio.ts`.
 */

export const PAPER = { cream:'#F4E7D3', tan:'#E3CBA9', caramel:'#C99A6E', brown:'#8C5A3C', terra:'#D9694B', sage:'#7E8F6B', slate:'#4A5A6A', off:'#EFE0C8' };

/** Palette papier. Les calques la référencent par index. */
export const P = [
  '#F4E7D3', // 0  crème
  '#EFE0C8', // 1  écru
  '#E3CBA9', // 2  sable
  '#C99A6E', // 3  caramel
  '#8C5A3C', // 4  noisette
  '#5A3B28', // 5  brun foncé
  '#D9694B', // 6  terracotta
  '#E0A85C', // 7  miel
  '#7E8F6B', // 8  sauge
  '#4A5A6A', // 9  ardoise
  '#B0868F', // 10 vieux rose
  '#8B7BA8', // 11 lilas
  '#D9CFC0', // 12 gris papier
  '#3A2A1C', // 13 bois foncé
  '#FBF6EC'  // 14 papier blanc
];

export type Layer = [number, number, number, number, number, number] | [number, number, number, number, number, number, number];

export type DioSurf = 'floor' | 'wb' | 'wl';
export type DioSrc = 'base' | 'quest' | 'rank' | 'shop';

export type DioObj = {
  id: string;
  name: string;
  /** Compétence d'origine ('atelier' = mobilier neutre). */
  sk: string;
  rare: number;                 // 0 commun · 1 peu commun · 2 rare · 3 légendaire
  surf: DioSurf;
  w: number; h: number;
  x: number; y: number;         // placement par défaut
  src: DioSrc;
  /** Condition de déblocage : nombre de quêtes validées ou PX de la compétence. */
  req?: { sk: string; done?: number; px?: number };
  /** Index dans la boutique (SHOP.atelier) pour les objets achetables. */
  sid?: number;
  /** Variantes de couleur proposées (calques de couleur -1). */
  tint: string[];
  /** Surface posable : [x local en %, y local en px] — un objet peut y être aimanté. */
  top?: [number, number];
  /** Série : compléter la série donne un bonus de pièces. */
  set?: string;
  note?: string;
  sh: Layer[];
};

export const DIO_RARE: [string, string][] = [['Commun','#D9CFC0'],['Peu commun','#9DBD93'],['Rare','#7FA9D9'],['Légendaire','#E0A85C']];

/* ---------------------------------------------------------------- Pièce --- */

/** Géométrie de la pièce, en px de scène. Isométrie vraie : l'angle du fond est au centre. */
export const ROOM = {
  w: 1200, h: 860,
  /** Abscisse de l'angle du fond. */
  cx: 600,
  /** Ordonnée de l'angle du fond, au niveau du sol. */
  top: 300,
  /** Demi-largeur et demi-hauteur du losange de sol (rapport 2:1). */
  hw: 540, hh: 270,
  /** Hauteur des murs à l'écran. */
  wallH: 250,
  /** Épaisseur du plancher, visible à l'avant. */
  slab: 22,
  /** Épaisseur du haut des murs. */
  rim: 13,
  /** Fenêtre, en coordonnées du mur droit. */
  win: { wx: 54, wy: 14, w: 240, h: 196 }
};

export const DIO_WALLS: [string, string, string][] = [
  ['Écru rayé','#EFE2CD','repeating-linear-gradient(90deg,rgba(140,90,60,.09) 0 2px,transparent 2px 13px)'],
  ['Terracotta','#E8C3AC','radial-gradient(circle at 6px 6px,rgba(140,90,60,.14) 1.6px,transparent 2px) 0 0/16px 16px'],
  ['Sauge','#D7E0C9','repeating-linear-gradient(0deg,rgba(74,90,60,.08) 0 1px,transparent 1px 12px)'],
  ['Nuit douce','#C8C5DE','radial-gradient(circle at 8px 8px,rgba(60,55,90,.12) 1.8px,transparent 2px) 0 0/18px 18px'],
  ['Plâtre nu','#E9E2D6','radial-gradient(circle at 3px 7px,rgba(90,70,50,.07) 1.2px,transparent 1.6px) 0 0/11px 11px'],
  ['Carreaux crème','#EFE4D2','repeating-linear-gradient(90deg,rgba(140,90,60,.10) 0 1px,transparent 1px 26px),repeating-linear-gradient(0deg,rgba(140,90,60,.10) 0 1px,transparent 1px 26px)'],
  ['Vieux rose','#E7CFCF','repeating-linear-gradient(90deg,rgba(150,90,95,.09) 0 3px,transparent 3px 15px)'],
  ['Bleu atelier','#CBD8DE','repeating-linear-gradient(0deg,rgba(50,75,90,.09) 0 2px,transparent 2px 14px)']
];

export const DIO_FLOORS: [string, string, string][] = [
  ['Chêne clair','#DEC49E','#C9A87E'], ['Noyer','#B98A63','#9C6F4B'],
  ['Lin gris','#D2CCC0','#B9B1A2'], ['Damier','#E7DAC3','#C9B694'],
  ['Béton ciré','#CFC9BE','#BAB3A6'], ['Tomettes','#D08A6A','#B4735A'],
  ['Parquet foncé','#8E6A4C','#79573D'], ['Sisal','#D8C9A6','#C2B08C']
];

/** Lumières. `hours` sert au mode automatique (lumière liée à l'heure réelle). */
export const DIO_LIGHTS: { name: string; grad: string; tint: string; hours: [number, number] }[] = [
  { name:'Aube', grad:'radial-gradient(130% 90% at 74% 2%,rgba(255,196,170,.36),transparent 62%)', tint:'rgba(180,140,150,.10)', hours:[5,8] },
  { name:'Matin clair', grad:'radial-gradient(120% 90% at 78% 4%,rgba(215,235,255,.34),transparent 60%)', tint:'rgba(200,220,240,.06)', hours:[8,11] },
  { name:'Plein midi', grad:'radial-gradient(110% 80% at 50% 0%,rgba(255,244,214,.40),transparent 58%)', tint:'rgba(255,250,230,.05)', hours:[11,15] },
  { name:'Après-midi doré', grad:'radial-gradient(120% 90% at 18% 6%,rgba(255,206,130,.36),transparent 62%)', tint:'rgba(230,180,110,.09)', hours:[15,18] },
  { name:'Fin de jour', grad:'radial-gradient(120% 95% at 50% 100%,rgba(150,110,190,.32),transparent 62%)', tint:'rgba(120,95,150,.12)', hours:[18,21] },
  { name:'Nuit d’atelier', grad:'radial-gradient(90% 70% at 30% 30%,rgba(255,214,138,.30),transparent 58%)', tint:'rgba(30,35,60,.30)', hours:[21,5] }
];

/** Météo : agit sur la lumière de la fenêtre et sur les particules. */
export const DIO_WEATHER: { name: string; veil: string; part: 'none' | 'rain' | 'dust' | 'wind' }[] = [
  { name:'Clair', veil:'transparent', part:'dust' },
  { name:'Couvert', veil:'rgba(120,130,145,.16)', part:'none' },
  { name:'Pluie', veil:'rgba(90,110,130,.22)', part:'rain' },
  { name:'Grand vent', veil:'rgba(150,150,130,.10)', part:'wind' }
];

/** Saison déduite du mois réel : teinte de fenêtre + particule d'ambiance. */
export const DIO_SEASONS: { name: string; sky: string; part: 'pollen' | 'heat' | 'leaf' | 'snow' }[] = [
  { name:'Printemps', sky:'#CBE0C4', part:'pollen' },
  { name:'Été', sky:'#F2DEA8', part:'heat' },
  { name:'Automne', sky:'#E2C09A', part:'leaf' },
  { name:'Hiver', sky:'#CFD9E2', part:'snow' }
];

/* -------------------------------------------------------------- Objets --- */

const T = {
  wood: ['#C99A6E','#8C5A3C','#3A2A1C','#D9CFC0'],
  fab: ['#D9694B','#7E8F6B','#4A5A6A','#B0868F','#E0A85C','#8B7BA8'],
  metal: ['#D9CFC0','#E0A85C','#4A5A6A','#8C5A3C'],
  soft: ['#EFE0C8','#E3CBA9','#B0868F','#8B7BA8']
};

export const DIO_OBJ: DioObj[] = [
  /* ---- Mobilier neutre : la structure de la pièce ---- */
  { id:'tapis', name:'Tapis chiné', sk:'atelier', rare:0, surf:'floor', w:170, h:56, x:46, y:78, src:'shop', sid:0, tint:T.fab, note:'Le premier achat de presque tous les ateliers.',
    sh:[[0,0,170,56,-1,-1],[14,8,142,40,-1,14],[46,18,78,20,-1,-1]] },
  { id:'table', name:'Grande table de travail', sk:'atelier', rare:1, surf:'floor', w:190, h:104, x:40, y:55, src:'shop', sid:1, tint:T.wood, top:[50,10],
    sh:[[0,0,190,18,4,-1],[8,18,12,86,3,4],[170,18,12,86,3,4],[14,30,162,8,2,5],[0,14,190,6,3,5]] },
  { id:'tabouret', name:'Tabouret d’atelier', sk:'atelier', rare:0, surf:'floor', w:58, h:74, x:62, y:72, src:'base', tint:T.wood,
    sh:[[0,0,58,14,5,-1],[8,14,7,60,3,4],[43,14,7,60,3,4],[12,40,34,6,2,5]] },
  { id:'etagere', name:'Étagère murale', sk:'atelier', rare:1, surf:'wb', w:170, h:120, x:12, y:34, src:'shop', sid:2, tint:T.wood,
    sh:[[0,0,170,120,4,-1],[6,6,158,46,2,1],[6,60,158,46,2,1],[14,12,26,34,3,6],[46,16,22,30,3,8],[78,14,24,32,3,9],[112,66,26,34,3,7]] },
  { id:'commode', name:'Commode à tiroirs', sk:'atelier', rare:1, surf:'floor', w:120, h:96, x:74, y:48, src:'base', tint:T.wood, top:[50,6],
    sh:[[0,0,120,96,5,-1],[8,10,104,24,3,1],[8,40,104,24,3,1],[8,70,104,20,3,1],[54,20,14,4,2,4],[54,50,14,4,2,4]] },
  { id:'paravent', name:'Paravent de tissu', sk:'atelier', rare:2, surf:'floor', w:132, h:168, x:16, y:44, src:'shop', sid:3, tint:T.fab,
    sh:[[0,4,42,164,4,-1],[46,0,42,168,4,1],[92,6,40,162,4,-1],[4,20,34,3,2,4],[50,16,34,3,2,4]] },
  { id:'lampadaire', name:'Lampadaire de coin', sk:'atelier', rare:1, surf:'floor', w:62, h:172, x:88, y:66, src:'shop', sid:4, tint:T.metal,
    sh:[[16,162,30,10,4,4],[28,40,6,124,3,4],[10,0,42,40,6,-1],[12,36,38,14,-1,7]] },
  { id:'fauteuil', name:'Fauteuil rapiécé', sk:'atelier', rare:2, surf:'floor', w:112, h:116, x:24, y:84, src:'shop', sid:5, tint:T.fab,
    sh:[[0,30,112,60,10,-1],[6,0,100,36,9,1],[0,26,20,50,8,-1],[92,26,20,50,8,-1],[14,86,10,30,3,4],[86,86,10,30,3,4]] },
  { id:'horloge', name:'Horloge d’usine', sk:'atelier', rare:1, surf:'wb', w:64, h:64, x:56, y:12, src:'base', tint:T.metal,
    sh:[[0,0,64,64,-1,-1],[7,7,50,50,-1,14],[30,16,3,18,2,13],[31,30,16,3,2,6]] },
  { id:'cadres', name:'Mur de cadres', sk:'atelier', rare:0, surf:'wb', w:130, h:96, x:26, y:44, src:'base', tint:T.wood,
    sh:[[0,0,54,68,3,-1],[6,6,42,56,2,14],[62,14,60,44,3,-1],[68,20,48,32,2,1],[16,74,40,20,3,-1]] },
  { id:'livres', name:'Pile de livres', sk:'atelier', rare:0, surf:'floor', w:64, h:46, x:56, y:66, src:'base', tint:T.fab,
    sh:[[0,32,64,14,3,-1],[4,20,56,13,3,8],[8,10,50,11,3,9],[12,0,44,11,3,7]] },
  { id:'panier', name:'Panier en osier', sk:'atelier', rare:0, surf:'floor', w:74, h:62, x:34, y:90, src:'base', tint:T.wood,
    sh:[[0,10,74,52,10,-1],[0,4,74,12,6,3],[10,22,54,3,2,4],[10,34,54,3,2,4]] },
  { id:'suspension', name:'Suspension papier', sk:'atelier', rare:2, surf:'wb', w:76, h:120, x:38, y:0, src:'shop', sid:6, tint:T.soft,
    sh:[[36,0,4,58,2,4],[0,52,76,44,8,-1],[10,92,56,10,-1,7]] },
  { id:'plante-h', name:'Plante suspendue', sk:'atelier', rare:1, surf:'wb', w:70, h:118, x:26, y:6, src:'base', tint:['#7E8F6B','#5CBFAE','#8C5A3C'],
    sh:[[33,0,4,40,2,4],[16,36,38,26,8,3],[6,56,20,52,10,-1],[44,54,20,58,10,-1],[26,60,18,44,9,-1]] },

  /* ---- Couture ---- */
  { id:'machine', name:'Machine à coudre', sk:'couture', rare:2, surf:'floor', w:96, h:74, x:40, y:52, src:'quest', req:{ sk:'couture', done:1 }, tint:T.metal, set:'atelier-couture', note:'Obtenue à la première quête couture validée.',
    sh:[[0,56,96,18,5,3],[8,22,70,36,9,0],[10,8,16,18,4,1],[10,2,58,10,4,1],[58,26,24,24,-1,-1],[26,44,34,5,2,4]] },
  { id:'mannequin', name:'Mannequin de tailleur', sk:'couture', rare:3, surf:'floor', w:56, h:96, x:68, y:64, src:'quest', req:{ sk:'couture', done:4 }, tint:T.soft, set:'atelier-couture',
    sh:[[24,58,7,32,3,4],[10,88,36,8,4,3],[8,10,40,52,20,-1],[20,0,16,14,-1,2],[8,34,40,5,0,6]] },
  { id:'tissus', name:'Mur de coupons', sk:'couture', rare:1, surf:'wb', w:150, h:110, x:44, y:40, src:'shop', sid:7, tint:T.fab, set:'atelier-couture',
    sh:[[0,84,150,26,6,3],[6,40,64,44,10,-1],[76,32,66,52,11,8],[26,0,64,38,9,9],[92,4,50,30,8,7]] },
  { id:'bobines', name:'Étagère à bobines', sk:'couture', rare:2, surf:'wb', w:120, h:74, x:6, y:56, src:'shop', sid:8, tint:T.wood, set:'atelier-couture',
    sh:[[0,60,120,14,4,-1],[8,20,18,40,4,6],[34,14,18,46,4,8],[60,22,18,38,4,9],[86,16,18,44,4,7]] },
  { id:'planche', name:'Planche à repasser', sk:'couture', rare:1, surf:'floor', w:132, h:88, x:58, y:80, src:'quest', req:{ sk:'couture', done:7 }, tint:T.soft,
    sh:[[0,0,132,26,13,-1],[20,24,8,64,3,4],[96,24,8,64,3,4],[100,2,26,18,6,6]] },
  { id:'ciseaux', name:'Ciseaux cranteurs', sk:'couture', rare:1, surf:'floor', w:54, h:48, x:44, y:44, src:'quest', req:{ sk:'couture', done:2 }, tint:T.metal,
    sh:[[8,0,6,32,3,2,20],[32,0,6,32,3,2,-20],[4,30,18,16,8,-1],[30,30,18,16,8,-1],[22,22,9,9,-1,4]] },
  { id:'boite-couture', name:'Boîte à couture', sk:'couture', rare:0, surf:'floor', w:70, h:48, x:30, y:60, src:'base', tint:T.wood,
    sh:[[0,12,70,36,5,-1],[0,4,70,12,4,3],[26,0,18,8,4,4],[8,22,54,3,2,1]] },
  { id:'portant', name:'Portant de pièces finies', sk:'couture', rare:2, surf:'floor', w:150, h:170, x:80, y:58, src:'shop', sid:9, tint:T.metal,
    sh:[[8,10,134,7,4,-1],[16,14,7,150,3,4],[128,14,7,150,3,4],[26,16,34,80,6,6],[68,16,34,92,6,8],[108,16,30,76,6,9]] },
  { id:'coupon-lin', name:'Coupon de lin brut', sk:'couture', rare:0, surf:'floor', w:80, h:34, x:50, y:40, src:'base', tint:T.soft,
    sh:[[0,10,80,24,6,-1],[6,4,66,12,5,1],[14,0,48,8,4,2]] },
  { id:'rubans', name:'Pelote de rubans', sk:'couture', rare:1, surf:'floor', w:56, h:40, x:64, y:46, src:'base', tint:T.fab,
    sh:[[0,10,56,30,-1,-1],[10,16,36,18,-1,1],[24,0,8,16,3,6]] },
  { id:'patrons', name:'Patrons épinglés', sk:'couture', rare:1, surf:'wl', w:96, h:120, x:40, y:34, src:'quest', req:{ sk:'couture', done:10 }, tint:T.soft,
    sh:[[0,0,54,74,3,-1,-4],[40,18,54,86,3,14,5],[10,84,44,34,3,1,-2]] },
  { id:'surjeteuse', name:'Surjeteuse', sk:'couture', rare:3, surf:'floor', w:84, h:64, x:52, y:46, src:'rank', req:{ sk:'couture', px:900 }, tint:T.metal,
    sh:[[0,44,84,20,5,3],[6,14,62,32,8,-1],[52,18,24,22,-1,6],[10,4,20,12,4,1],[16,34,32,5,2,4]] },
  { id:'epingles', name:'Coussin d’épingles', sk:'couture', rare:0, surf:'floor', w:40, h:30, x:36, y:42, src:'base', tint:T.fab,
    sh:[[0,8,40,22,-1,-1],[8,2,10,12,3,12],[22,0,8,14,3,12]] },
  { id:'buste', name:'Buste ancien', sk:'couture', rare:3, surf:'floor', w:60, h:104, x:12, y:70, src:'rank', req:{ sk:'couture', px:1400 }, tint:['#B0868F','#E3CBA9','#4A5A6A'],
    sh:[[26,62,8,34,3,13],[10,94,40,10,4,13],[8,8,44,56,22,-1],[20,0,20,12,6,2],[8,30,44,4,0,4],[18,44,24,4,0,4]] },
  { id:'machine-vintage', name:'Singer de grand-mère', sk:'couture', rare:3, surf:'floor', w:110, h:118, x:26, y:60, src:'rank', req:{ sk:'couture', px:2000 }, tint:['#3A2A1C','#4A5A6A','#8C5A3C'],
    sh:[[0,72,110,12,4,13],[8,84,14,34,3,13],[88,84,14,34,3,13],[10,58,90,16,4,3],[16,22,64,36,8,-1],[62,26,22,22,-1,7],[24,10,14,14,4,1]] },
  { id:'rouleaux', name:'Rouleaux de tissu debout', sk:'couture', rare:1, surf:'floor', w:86, h:132, x:8, y:52, src:'base', tint:T.fab,
    sh:[[0,14,24,118,10,-1],[28,0,24,132,10,8],[56,20,24,112,10,9]] },
  { id:'croquis', name:'Tableau de croquis', sk:'couture', rare:1, surf:'wb', w:118, h:88, x:24, y:16, src:'quest', req:{ sk:'couture', done:14 }, tint:T.wood,
    sh:[[0,0,118,88,4,-1],[6,6,106,76,2,14],[16,18,44,3,2,12],[16,30,62,3,2,12],[70,40,30,34,3,6],[16,44,40,26,3,1]] },
  { id:'chutes', name:'Corbeille à chutes', sk:'couture', rare:0, surf:'floor', w:58, h:52, x:70, y:88, src:'base', tint:T.wood,
    sh:[[0,10,58,42,8,-1],[8,0,18,14,6,6],[26,2,20,12,6,8]] },

  /* ---- Course ---- */
  { id:'chrono', name:'Chrono de poche', sk:'course', rare:1, surf:'floor', w:44, h:48, x:52, y:38, src:'quest', req:{ sk:'course', done:1 }, tint:T.metal, set:'course',
    sh:[[0,8,44,40,-1,-1],[6,14,32,28,-1,14],[18,0,8,10,3,4],[21,20,2,12,1,6]] },
  { id:'chaussures', name:'Chaussures fatiguées', sk:'course', rare:0, surf:'floor', w:76, h:40, x:88, y:90, src:'quest', req:{ sk:'course', done:2 }, tint:T.fab, set:'course',
    sh:[[0,18,44,22,8,-1],[32,14,44,26,9,1],[4,12,30,10,5,14],[38,8,30,10,5,14]] },
  { id:'dossards', name:'Dossards épinglés', sk:'course', rare:1, surf:'wl', w:90, h:96, x:56, y:52, src:'quest', req:{ sk:'course', done:5 }, tint:T.soft, set:'course',
    sh:[[0,0,46,44,3,-1,-5],[38,26,48,46,3,14,4],[8,56,40,38,3,1,-3]] },
  { id:'medaille', name:'Médaille de course', sk:'course', rare:2, surf:'wb', w:44, h:96, x:34, y:26, src:'rank', req:{ sk:'course', px:700 }, tint:['#E0A85C','#D9CFC0','#D9694B'],
    sh:[[12,0,8,56,3,6],[24,0,8,56,3,6],[4,52,36,36,-1,-1],[13,61,18,18,-1,1]] },
  { id:'gourde', name:'Gourde bosselée', sk:'course', rare:0, surf:'floor', w:32, h:58, x:46, y:44, src:'base', tint:T.metal,
    sh:[[0,10,32,48,8,-1],[9,0,14,12,4,4],[4,22,24,4,2,1]] },
  { id:'tapis-etir', name:'Tapis d’étirement', sk:'course', rare:0, surf:'floor', w:120, h:44, x:66, y:92, src:'base', tint:T.fab,
    sh:[[0,0,120,44,8,-1],[8,8,104,28,6,1],[52,14,16,16,-1,-1]] },
  { id:'sac-sport', name:'Sac de sport avachi', sk:'course', rare:0, surf:'floor', w:82, h:52, x:20, y:88, src:'base', tint:T.fab,
    sh:[[0,14,82,38,12,-1],[24,4,34,14,7,1],[10,24,62,4,2,4]] },
  { id:'roller', name:'Rouleau de massage', sk:'course', rare:1, surf:'floor', w:66, h:26, x:76, y:70, src:'quest', req:{ sk:'course', done:8 }, tint:T.metal,
    sh:[[0,0,66,26,13,-1],[8,6,50,14,7,1],[26,8,14,10,5,9]] },
  { id:'affiche-course', name:'Affiche de dénivelé', sk:'course', rare:1, surf:'wb', w:96, h:118, x:52, y:22, src:'quest', req:{ sk:'course', done:11 }, tint:T.soft,
    sh:[[0,0,96,118,4,-1],[8,8,80,64,3,14],[12,52,72,3,2,6],[20,40,16,14,2,8],[46,28,20,26,2,8],[12,84,52,4,2,12],[12,96,36,4,2,12]] },
  { id:'trophee', name:'Trophée de club', sk:'course', rare:3, surf:'floor', w:50, h:78, x:60, y:36, src:'rank', req:{ sk:'course', px:1500 }, tint:['#E0A85C','#D9CFC0','#8C5A3C'],
    sh:[[10,60,30,18,4,13],[14,44,22,18,3,-1],[6,4,38,42,10,-1],[0,10,10,20,5,-1],[40,10,10,20,5,-1]] },
  { id:'montre-gps', name:'Montre GPS', sk:'course', rare:1, surf:'floor', w:34,h:30, x:38, y:36, src:'base', tint:T.metal,
    sh:[[0,6,34,20,7,-1],[6,10,22,12,4,9],[10,0,14,10,4,-1]] },
  { id:'casquette', name:'Casquette de sortie', sk:'course', rare:0, surf:'floor', w:52, h:28, x:30, y:52, src:'base', tint:T.fab,
    sh:[[0,8,38,20,10,-1],[24,16,28,10,5,1]] },

  /* ---- Cuisine ---- */
  { id:'balance', name:'Balance de précision', sk:'cuisine', rare:2, surf:'floor', w:64, h:42, x:48, y:42, src:'quest', req:{ sk:'cuisine', done:1 }, tint:T.metal, set:'cuisine',
    sh:[[0,16,64,26,7,-1],[8,0,48,16,5,1],[38,22,18,10,3,9]] },
  { id:'planche-bois', name:'Planche de découpe', sk:'cuisine', rare:0, surf:'floor', w:88, h:40, x:36, y:48, src:'base', tint:T.wood, set:'cuisine',
    sh:[[0,8,88,32,6,-1],[74,14,12,12,-1,1],[10,18,42,4,2,4]] },
  { id:'bocaux', name:'Rangée de bocaux', sk:'cuisine', rare:1, surf:'wb', w:110, h:70, x:30, y:52, src:'quest', req:{ sk:'cuisine', done:4 }, tint:T.wood, set:'cuisine',
    sh:[[0,56,110,14,4,-1],[8,18,26,38,6,1],[42,14,26,42,6,7],[76,20,26,36,6,8],[8,12,26,8,3,3],[42,8,26,8,3,3],[76,14,26,8,3,3]] },
  { id:'cuivres', name:'Casseroles en cuivre', sk:'cuisine', rare:2, surf:'wb', w:126, h:78, x:60, y:48, src:'shop', sid:10, tint:['#C99A6E','#D9CFC0','#4A5A6A'], set:'cuisine',
    sh:[[0,0,126,7,4,4],[8,10,40,40,-1,-1],[54,14,34,34,-1,-1],[92,8,32,44,-1,-1],[24,48,6,26,3,13],[68,46,6,22,3,13]] },
  { id:'levain', name:'Pot de levain', sk:'cuisine', rare:2, surf:'floor', w:40, h:50, x:58, y:40, src:'quest', req:{ sk:'cuisine', done:9 }, tint:T.soft,
    sh:[[0,10,40,40,7,-1],[4,16,32,10,4,1],[2,4,36,10,4,12]] },
  { id:'mortier', name:'Mortier de pierre', sk:'cuisine', rare:1, surf:'floor', w:48, h:40, x:42, y:52, src:'base', tint:['#D9CFC0','#4A5A6A','#8C5A3C'],
    sh:[[0,12,48,28,10,-1],[6,6,36,10,5,12],[30,0,7,22,3,4,18]] },
  { id:'herbes', name:'Herbes en séchage', sk:'cuisine', rare:1, surf:'wb', w:80, h:96, x:16, y:18, src:'base', tint:['#7E8F6B','#8C5A3C','#E0A85C'],
    sh:[[0,0,80,5,2,4],[10,4,10,54,5,-1],[30,4,10,68,5,-1],[52,4,10,46,5,-1],[66,4,10,60,5,-1]] },
  { id:'moulin', name:'Moulin à poivre', sk:'cuisine', rare:0, surf:'floor', w:26, h:58, x:52, y:36, src:'base', tint:T.wood,
    sh:[[0,10,26,48,5,-1],[7,0,12,12,4,4],[0,26,26,5,2,5]] },
  { id:'cocotte', name:'Cocotte en fonte', sk:'cuisine', rare:2, surf:'floor', w:70, h:52, x:64, y:52, src:'shop', sid:11, tint:['#D9694B','#4A5A6A','#E0A85C'],
    sh:[[0,14,70,38,10,-1],[2,6,66,12,6,1],[28,0,14,8,4,9]] },
  { id:'recettes', name:'Carnet de recettes taché', sk:'cuisine', rare:0, surf:'floor', w:54, h:36, x:34, y:44, src:'base', tint:T.soft,
    sh:[[0,4,54,32,4,-1,-4],[6,12,34,3,2,3],[6,20,26,3,2,3],[38,0,14,12,3,6]] },
  { id:'legumes', name:'Cagette de légumes', sk:'cuisine', rare:1, surf:'floor', w:76, h:52, x:26, y:82, src:'base', tint:T.wood,
    sh:[[0,16,76,36,4,-1],[6,6,20,16,-1,8],[28,2,22,18,-1,6],[52,8,20,14,-1,7],[6,26,64,3,2,3]] },
  { id:'tablier', name:'Tablier accroché', sk:'cuisine', rare:0, surf:'wl', w:56, h:104, x:70, y:44, src:'base', tint:T.fab,
    sh:[[22,0,12,18,5,4],[8,14,40,54,8,-1],[0,60,56,44,7,-1]] },

  /* ---- Jardin ---- */
  { id:'secateur', name:'Sécateur laiton', sk:'jardin', rare:1, surf:'floor', w:54, h:48, x:56, y:42, src:'quest', req:{ sk:'jardin', done:1 }, tint:['#E0A85C','#D9CFC0','#4A5A6A'], set:'jardin',
    sh:[[8,0,6,32,3,-1,20],[32,0,6,32,3,-1,-20],[4,30,18,16,8,6],[30,30,18,16,8,6],[22,22,9,9,-1,4]] },
  { id:'arrosoir', name:'Arrosoir en zinc', sk:'jardin', rare:1, surf:'floor', w:76, h:64, x:38, y:70, src:'quest', req:{ sk:'jardin', done:3 }, tint:T.metal, set:'jardin',
    sh:[[0,16,52,48,8,-1],[46,10,30,8,4,-1],[68,4,10,16,4,-1],[6,4,26,14,7,12],[10,26,34,4,2,1]] },
  { id:'monstera', name:'Monstera généreuse', sk:'jardin', rare:2, surf:'floor', w:110, h:158, x:82, y:60, src:'shop', sid:12, tint:['#7E8F6B','#5CBFAE','#4A5A6A'], set:'jardin',
    sh:[[34,120,42,38,7,3],[52,60,6,64,3,4],[0,34,52,44,20,-1],[54,20,54,46,20,-1],[24,0,50,40,18,-1],[68,62,40,36,16,-1],[8,74,40,32,14,-1]] },
  { id:'semis', name:'Caisse de semis', sk:'jardin', rare:1, surf:'floor', w:92, h:48, x:44, y:62, src:'quest', req:{ sk:'jardin', done:6 }, tint:T.wood,
    sh:[[0,16,92,32,4,-1],[8,20,76,20,3,5],[16,6,10,16,4,8],[38,2,10,20,4,8],[60,8,10,14,4,8]] },
  { id:'etabli', name:'Établi de rempotage', sk:'jardin', rare:2, surf:'floor', w:150, h:110, x:20, y:56, src:'shop', sid:13, tint:T.wood, top:[50,8],
    sh:[[0,0,150,16,4,-1],[10,16,10,94,3,4],[130,16,10,94,3,4],[14,48,122,8,3,5],[0,12,150,6,3,5]] },
  { id:'pots', name:'Pots en terre empilés', sk:'jardin', rare:0, surf:'floor', w:70, h:56, x:70, y:86, src:'base', tint:['#C99A6E','#D9694B','#D9CFC0'],
    sh:[[0,18,44,38,7,-1],[36,26,34,30,6,1],[6,10,32,12,5,3]] },
  { id:'cactus', name:'Cactus obstiné', sk:'jardin', rare:0, surf:'floor', w:44, h:72, x:50, y:40, src:'base', tint:['#7E8F6B','#5CBFAE'],
    sh:[[8,52,28,20,5,3],[14,10,16,44,8,-1],[0,24,12,20,6,-1],[32,18,12,24,6,-1]] },
  { id:'brouette', name:'Brouette miniature', sk:'jardin', rare:1, surf:'floor', w:88, h:60, x:14, y:92, src:'base', tint:T.metal,
    sh:[[0,10,64,30,6,-1],[56,26,10,26,4,4],[0,38,20,20,-1,13],[10,4,44,10,4,8]] },
  { id:'graines', name:'Sachets de graines', sk:'jardin', rare:0, surf:'wb', w:86, h:66, x:22, y:56, src:'base', tint:T.soft,
    sh:[[0,52,86,14,4,3],[8,16,22,36,3,-1],[34,12,22,40,3,14],[60,18,22,34,3,1]] },
  { id:'rateau', name:'Râteau à main', sk:'jardin', rare:0, surf:'wl', w:36, h:110, x:26, y:40, src:'base', tint:T.metal,
    sh:[[14,0,7,84,3,4],[4,78,28,10,3,-1],[6,86,4,14,2,-1],[16,86,4,14,2,-1],[26,86,4,14,2,-1]] },
  { id:'jardiniere', name:'Jardinière de fenêtre', sk:'jardin', rare:1, surf:'wb', w:120, h:56, x:44, y:60, src:'quest', req:{ sk:'jardin', done:10 }, tint:T.wood,
    sh:[[0,24,120,32,5,-1],[10,6,22,22,10,8],[40,0,24,26,11,8],[74,8,22,20,9,8],[96,4,20,22,10,6]] },
  { id:'terrarium', name:'Terrarium de mousse', sk:'jardin', rare:3, surf:'floor', w:56, h:62, x:64, y:44, src:'rank', req:{ sk:'jardin', px:900 }, tint:['#7E8F6B','#5CBFAE','#D9CFC0'],
    sh:[[0,10,56,52,10,12],[6,34,44,24,8,-1],[14,40,12,10,-1,8],[30,38,14,12,-1,8],[16,0,24,12,5,3]] },

  /* ---- Photo ---- */
  { id:'trepied', name:'Trépied pliant', sk:'photo', rare:1, surf:'floor', w:64, h:104, x:60, y:76, src:'quest', req:{ sk:'photo', done:1 }, tint:T.metal, set:'photo',
    sh:[[28,14,7,74,3,-1],[8,42,7,62,3,-1,18],[48,42,7,62,3,-1,-18],[12,2,40,16,5,9],[44,6,14,10,3,1]] },
  { id:'appareil', name:'Appareil argentique', sk:'photo', rare:2, surf:'floor', w:62, h:44, x:44, y:40, src:'quest', req:{ sk:'photo', done:3 }, tint:['#4A5A6A','#3A2A1C','#D9CFC0'], set:'photo',
    sh:[[0,10,62,34,6,-1],[34,14,26,26,-1,13],[39,19,16,16,-1,9],[6,4,20,10,4,-1],[8,16,16,8,3,1]] },
  { id:'tirages', name:'Tirages à la pince', sk:'photo', rare:1, surf:'wl', w:110, h:82, x:48, y:34, src:'quest', req:{ sk:'photo', done:5 }, tint:T.soft, set:'photo',
    sh:[[0,0,110,3,2,4],[8,4,34,44,2,14],[50,4,30,40,2,1],[86,4,22,34,2,14],[14,50,30,28,2,1]] },
  { id:'lampe-studio', name:'Lampe de studio', sk:'photo', rare:2, surf:'floor', w:76, h:150, x:22, y:66, src:'shop', sid:14, tint:T.metal,
    sh:[[24,138,32,12,4,13],[36,52,6,90,3,4],[6,0,64,54,8,-1],[12,48,52,14,-1,7]] },
  { id:'bac', name:'Bac de révélateur', sk:'photo', rare:1, surf:'floor', w:86, h:40, x:38, y:52, src:'quest', req:{ sk:'photo', done:8 }, tint:['#4A5A6A','#D9CFC0','#7E8F6B'],
    sh:[[0,8,86,32,5,-1],[6,14,74,20,4,9],[20,18,40,12,3,12]] },
  { id:'fil-tirages', name:'Fil de séchage', sk:'photo', rare:0, surf:'wb', w:150, h:64, x:20, y:14, src:'base', tint:T.soft,
    sh:[[0,0,150,3,2,4],[12,2,28,40,2,14,-3],[52,2,26,36,2,1,2],[92,2,30,44,2,14,-2]] },
  { id:'objectifs', name:'Objectifs alignés', sk:'photo', rare:1, surf:'floor', w:78, h:44, x:66, y:44, src:'base', tint:['#3A2A1C','#4A5A6A','#D9CFC0'],
    sh:[[0,10,34,34,8,-1],[38,16,28,28,7,-1],[6,16,22,22,-1,9],[43,21,18,18,-1,9]] },
  { id:'projecteur', name:'Projecteur à diapos', sk:'photo', rare:3, surf:'floor', w:92, h:60, x:52, y:48, src:'rank', req:{ sk:'photo', px:800 }, tint:['#D9CFC0','#3A2A1C','#E0A85C'],
    sh:[[0,20,74,40,6,-1],[66,28,26,20,5,9],[14,4,34,18,5,1],[8,30,26,8,3,13]] },
  { id:'planches', name:'Cartons de planches', sk:'photo', rare:0, surf:'floor', w:80, h:56, x:28, y:84, src:'base', tint:T.wood,
    sh:[[0,20,80,36,3,-1,-3],[6,12,68,14,3,1,-3],[10,4,60,10,3,14,-2]] },
  { id:'reflecteur', name:'Réflecteur pliant', sk:'photo', rare:1, surf:'floor', w:66, h:96, x:86, y:70, src:'base', tint:['#FBF6EC','#E0A85C','#D9CFC0'],
    sh:[[0,0,60,86,30,-1],[8,10,44,66,22,1],[52,60,12,36,4,13]] },

  /* ---- Perso ---- */
  { id:'carnet', name:'Carnet à listes', sk:'perso', rare:0, surf:'floor', w:58, h:42, x:40, y:40, src:'quest', req:{ sk:'perso', done:1 }, tint:T.fab, set:'perso',
    sh:[[0,6,58,36,4,-1,-4],[8,16,36,3,2,14],[8,24,28,3,2,14],[40,0,14,14,3,7]] },
  { id:'tasse', name:'Tasse jamais froide', sk:'perso', rare:0, surf:'floor', w:38, h:34, x:48, y:38, src:'base', tint:T.soft, set:'perso',
    sh:[[0,6,30,28,6,-1],[26,12,12,12,6,-1],[4,10,22,5,2,1]] },
  { id:'courrier', name:'Pile de courrier', sk:'perso', rare:0, surf:'floor', w:62, h:30, x:32, y:46, src:'base', tint:T.soft,
    sh:[[0,18,62,12,3,-1,-2],[4,10,54,10,3,14,2],[8,2,46,10,3,1,-3]] },
  { id:'calendrier', name:'Calendrier annoté', sk:'perso', rare:1, surf:'wb', w:96, h:84, x:36, y:26, src:'quest', req:{ sk:'perso', done:5 }, tint:T.soft,
    sh:[[0,0,96,84,4,-1],[6,6,84,18,3,-1],[6,28,84,50,3,14],[14,36,14,12,2,8],[36,36,14,12,2,12],[58,36,14,12,2,6],[14,54,14,12,2,12]] },
  { id:'reveil', name:'Réveil à sonnerie', sk:'perso', rare:0, surf:'floor', w:42, h:44, x:56, y:36, src:'base', tint:T.metal,
    sh:[[0,10,42,34,-1,-1],[6,16,30,22,-1,14],[4,4,12,10,5,-1],[26,4,12,10,5,-1],[20,22,2,10,1,6]] },
  { id:'plaid', name:'Plaid en boule', sk:'perso', rare:0, surf:'floor', w:78, h:44, x:24, y:82, src:'base', tint:T.fab,
    sh:[[0,10,78,34,14,-1],[10,4,44,18,9,1],[34,16,34,20,10,-1]] },
  { id:'bougie', name:'Bougie de fin de journée', sk:'perso', rare:1, surf:'floor', w:30, h:44, x:44, y:34, src:'base', tint:T.soft,
    sh:[[0,14,30,30,5,-1],[13,4,4,12,2,4],[10,0,10,12,5,7]] },
  { id:'biblio', name:'Petite bibliothèque', sk:'perso', rare:2, surf:'floor', w:120, h:140, x:12, y:52, src:'rank', req:{ sk:'perso', px:700 }, tint:T.wood,
    sh:[[0,0,120,140,4,-1],[8,8,104,38,2,5],[8,54,104,38,2,5],[8,100,104,32,2,5],[14,12,12,30,2,6],[30,14,10,28,2,8],[46,12,14,30,2,9],[14,58,12,30,2,7],[32,60,12,28,2,11],[52,104,16,24,2,6]] }
];

/** Séries : compléter une série donne un bonus de pièces. */
export const DIO_SETS: Record<string, { name: string; bonus: number }> = {
  'atelier-couture': { name:'Atelier de couture', bonus:150 },
  course: { name:'Coin course', bonus:120 },
  cuisine: { name:'Coin cuisine', bonus:120 },
  jardin: { name:'Coin jardin', bonus:120 },
  photo: { name:'Coin photo', bonus:120 },
  perso: { name:'Coin à soi', bonus:80 }
};

/** Traces d'activité : apparaissent quand la compétence a bougé récemment. */
export const DIO_TRACES: { id: string; sk: string; days: number; label: string; surf: DioSurf; x: number; y: number; w: number; h: number; sh: Layer[] }[] = [
  { id:'tr-tissu', sk:'couture', days:4, label:'Tissu en cours sur la table', surf:'floor', x:44, y:47, w:96, h:30,
    sh:[[0,10,96,20,6,6],[10,2,64,12,5,0],[30,14,44,4,2,4]] },
  { id:'tr-chauss', sk:'course', days:3, label:'Chaussures encore boueuses', surf:'floor', x:92, y:96, w:70, h:34,
    sh:[[0,14,40,20,8,9],[30,12,40,22,8,4],[4,26,60,6,3,3]] },
  { id:'tr-farine', sk:'cuisine', days:3, label:'Un peu de farine restée là', surf:'floor', x:38, y:60, w:80, h:22,
    sh:[[0,8,80,14,7,1],[16,2,40,12,6,14]] },
  { id:'tr-terre', sk:'jardin', days:4, label:'Terre renversée près des pots', surf:'floor', x:70, y:92, w:70, h:20,
    sh:[[0,6,70,14,7,5],[12,0,40,12,6,4]] },
  { id:'tr-pellic', sk:'photo', days:5, label:'Pellicule à développer', surf:'floor', x:34, y:42, w:56, h:22,
    sh:[[0,8,56,14,4,13],[8,2,16,16,4,12],[34,4,14,14,4,12]] },
  { id:'tr-liste', sk:'perso', days:2, label:'Liste du jour, à moitié cochée', surf:'floor', x:52, y:44, w:46, h:26,
    sh:[[0,4,46,22,3,14,-4],[6,10,26,3,2,12],[6,17,18,3,2,12]] }
];
