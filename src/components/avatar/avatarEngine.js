/* eslint-disable */
// Généré depuis le prototype NUNU (AvatarCut.dc.html) — moteur d'avatar papier découpé.
// Fonction pure : props -> listes de tracés SVG. Ne pas réécrire à la main, régénérer depuis la source.

const hx = (h) => { let c = String(h || '#000').replace('#',''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)]; };
const sh = (h, p) => { const [r,g,b] = hx(h); const f = (v) => Math.max(0, Math.min(255, Math.round(p < 0 ? v * (1 + p) : v + (255 - v) * p))); return '#' + [f(r),f(g),f(b)].map(v => v.toString(16).padStart(2,'0')).join(''); };
const lum = (h) => { const [r,g,b] = hx(h); return (r * .299 + g * .587 + b * .114) / 255; };
const RNG = (s) => () => { s = s + 0x6D2B79F5 | 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const M = 'translate(100,0) scale(-1,1)';
const ell = (cx, cy, rx, ry) => 'M' + (cx - rx) + ',' + cy + 'a' + rx + ',' + ry + ' 0 1,0 ' + (rx * 2) + ',0a' + rx + ',' + ry + ' 0 1,0 ' + (-rx * 2) + ',0';

const SKIN = ['#F9E2CC','#F3D2B5','#E9BF9C','#DFAC84','#CE9A6E','#BA845A','#A36F48','#8C5B39','#75492D','#5F3B25','#4B2E1D','#36211A'];
const HAIRC = ['#1E1815','#332721','#4B342A','#6B4227','#8E5A2B','#B07C35','#CFAE58','#E6D9BC','#B84A34','#D9603F','#8E5BC8','#3F6FB8','#2C8C73','#A9D63F','#9A9AA0','#E8E6E2'];
const EYEC = ['#42302A','#5C4230','#7A5636','#8E6B3C','#3E6B57','#41708C','#525C99','#6E4A72','#2C2C31','#7E8288'];
const TOPC = ['#C6F24E','#FF5C42','#6C63FF','#FFC93C','#A8D8FF','#F6F4EF','#B06FF0','#2FA88A','#E8DCC0','#17171A','#F8A79F','#3C6E8F'];
const STREAKC = ['#17171A','#CFAE58','#D9603F','#8E5BC8','#3F6FB8','#2C8C73','#A9D63F','#E8E6E2'];
const BGPAL = [
  ['#E9DFCB','#C9B893'],['#F0E6D2','#E4B896'],['#F2C8B4','#D9603F'],['#BFD9E8','#5E8FB0'],
  ['#D6E8B0','#8FB05E'],['#F5DFA0','#D9A83F'],['#C9E3D2','#5E9E86'],['#EFCBD6','#C2718F'],
  ['#C7C6EC','#7A78C4'],['#1C1B1A','#3A3835'],['#0B0B0C','#C6F24E'],['#17171A','#FF5C42'],
  ['#F6F4EF','#0B0B0C'],['#2C3A42','#A8D8FF']
];

// ---------- faces
const FACE = [
  {n:'Ovale', d:'M50,18C61,18 70,25.5 70.5,38C71,50.5 62,70 50,70C38,70 29,50.5 29.5,38C30,25.5 39,18 50,18Z', w:41},
  {n:'Rond', d:'M50,18.5C63,18.5 71.5,28 71.5,42C71.5,58 62,70.5 50,70.5C38,70.5 28.5,58 28.5,42C28.5,28 37,18.5 50,18.5Z', w:43},
  {n:'Carré', d:'M36,18.5H64C69,18.5 71.5,22 71.5,28V50C71.5,62 62,70.5 50,70.5C38,70.5 28.5,62 28.5,50V28C28.5,22 31,18.5 36,18.5Z', w:43},
  {n:'Cœur', d:'M38,18H62C68,18 71.5,23 71.5,33C71.5,49 60,70.5 50,70.5C40,70.5 28.5,49 28.5,33C28.5,23 32,18 38,18Z', w:43},
  {n:'Allongé', d:'M50,17.5C61,17.5 68.5,24 69,36C69.5,50 61,71.5 50,71.5C39,71.5 30.5,50 31,36C31.5,24 39,17.5 50,17.5Z', w:38},
  {n:'Diamant', d:'M50,17.5C58,17.5 66,26 69,42C71,53 60,70.5 50,70.5C40,70.5 29,53 31,42C34,26 42,17.5 50,17.5Z', w:38},
  {n:'Mâchoire carrée', d:'M37,18.5H63C69,18.5 72,23 72,30V48C72,60 64,69.5 50,69.5C36,69.5 28,60 28,48V30C28,23 31,18.5 37,18.5Z', w:44},
  {n:'Poire', d:'M40,18.5H60C67,18.5 69,24 69.5,33C70,44 72.5,54 70.5,60C68,68 60,70.5 50,70.5C40,70.5 32,68 29.5,60C27.5,54 30,44 30.5,33C31,24 33,18.5 40,18.5Z', w:41},
  {n:'Triangle', d:'M36,18H64C70,18 72,23 71,32C69,48 58,70.5 50,70.5C42,70.5 31,48 29,32C28,23 30,18 36,18Z', w:43},
  {n:'Rectangle', d:'M35,19H65C70,19 71,23 71,29V52C71,63 62,70 50,70C38,70 29,63 29,52V29C29,23 30,19 35,19Z', w:42}
];

// ---------- hair parts
const CR_R = 'M28.5,46C28.5,28 37,18.5 50,18.5C63,18.5 71.5,28 71.5,46C68,35 60,30.5 50,30.5C40,30.5 32,35 28.5,46Z';
const CR_LOW = 'M30,45C30,30.5 38,24 50,24C62,24 70,30.5 70,45C67,36 60,32.5 50,32.5C40,32.5 33,36 30,45Z';
const CR_FLAT = 'M29,46V27.5C29,24 32,22 36,22H64C68,22 71,24 71,27.5V46C68,35.5 60,31 50,31C40,31 32,35.5 29,46Z';
const CR_UNDER = 'M31,46C30,32 35,24 45,21.5C56,18.5 68,22 70.5,31.5C71.5,35 71,40 70,43.5C66.5,34 57,29.5 46.5,32.5C39,34.5 33.5,39.5 31,46Z';
const CR_BOWL = 'M27.5,44C27.5,25 36,16.5 50,16.5C64,16.5 72.5,25 72.5,44C72.5,44 63,47.5 50,47.5C37,47.5 27.5,44 27.5,44Z';
const FRINGE = 'M29,29.5H71V39.5C63,36 37,36 29,39.5Z';
const CURTAIN = 'M50,28.5C40,29.5 33,35.5 30.5,45.5C30,36 37.5,30 50,28.5Z';
const SIDEP = 'M29.5,46C29.5,27 38,18.5 50.5,18.5C62.5,18.5 71,26.5 71.5,40.5C66,32 52,29.5 43,34.5C37,37.5 32,41 29.5,46Z';
const BOB = 'M27,46C27,26 36.5,16.5 50,16.5C63.5,16.5 73,26 73,46V63C73,66 70,67 68.5,64C66.5,58.5 65.5,52.5 65,47H35C34.5,52.5 33.5,58.5 31.5,64C30,67 27,66 27,63Z';
const LOB = 'M25.5,46C25.5,25 35.5,15 50,15C64.5,15 74.5,25 74.5,46V78C74.5,81 71,81.5 69.5,78C67,71 66,58 65.5,49H34.5C34,58 33,71 30.5,78C29,81.5 25.5,81 25.5,78Z';
const LONG = 'M24,46C24,24 35,14 50,14C65,14 76,24 76,46V102C76,105 72,105.5 70.5,102C67,92 66.5,68 66,55H34C33.5,68 33,92 29.5,102C28,105.5 24,105 24,102Z';
const LONG_W = 'M24,46C24,24 35,14 50,14C65,14 76,24 76,46C76,60 78,72 74,86C71,96 67,102 65,96C68,84 67,66 66,55H34C33,66 32,84 35,96C33,102 29,96 26,86C22,72 24,60 24,46Z';
const CURLY = 'M23,44C23,24 34,14.5 50,14.5C66,14.5 77,24 77,44C77,52 79,60 76,68C73,74 68,72 68,66C68,60 67,56 66,52H34C33,56 32,60 32,66C32,72 27,74 24,68C21,60 23,52 23,44Z';
const AFRO = 'M50,8.5C68,8.5 79.5,21 79.5,38C79.5,53 70,61 50,61C30,61 20.5,53 20.5,38C20.5,21 32,8.5 50,8.5Z';
const AFRO_S = 'M50,14C64.5,14 74,23 74,36C74,47 66,53.5 50,53.5C34,53.5 26,47 26,36C26,23 35.5,14 50,14Z';
const PONY_H = 'M62,26C74,25 81,35 80,49C79,63 75,74 71,80C68,84 63.5,82 65,76C70,64 72,52 69,42C67,35 63,30.5 60,28.5Z';
const PONY_L = 'M61,50C72,54 77,71 75,90C74.5,98 67,98.5 67,91C68,76 64.5,63 57.5,55.5Z';
const BRAID = 'M62,48C71,52 74,62 73.5,74C73,84 72,92 71,95C70,98 65,98 64.5,95C64,92 65,84 65,74C65,63 62,55 58,51Z';
const BRAID_TICK = ['M64.6,58q4.6,1.6 7.4,3.4', 'M64.9,66q4.4,1.4 7.6,3', 'M65,74q4.4,1.4 7.8,2.8', 'M65,82q4.4,1.2 7.6,2.6'];
const PUFF = 'M23,24.5C29.5,24.5 34,29.5 34,36C34,42.5 29.5,47 23,47C16.5,47 12,42.5 12,36C12,29.5 16.5,24.5 23,24.5Z';
const BUN_H = 'M50,5.5C57.5,5.5 63,10.5 63,17.5C63,24.5 57.5,29 50,29C42.5,29 37,24.5 37,17.5C37,10.5 42.5,5.5 50,5.5Z';
const BUN_L = 'M74,52C81,52 86,57 86,64C86,71 81,76 74,76C67,76 62,71 62,64C62,57 67,52 74,52Z';
const LOCK = (x, w, y2) => 'M' + x + ',44H' + (x + w) + 'V' + (y2 - 3) + 'C' + (x + w) + ',' + y2 + ' ' + x + ',' + y2 + ' ' + x + ',' + (y2 - 3) + 'Z';
const CREST = 'M44,46C44,28 47,15 50,12.5C53,15 56,28 56,46Z';
const MULLET = 'M26,46C26,26 36,16 50,16C64,16 74,26 74,46V52C71.5,49.5 69.5,47.5 68.5,45.5C69.5,62 71.5,77 74.5,89C68.5,87 62.5,77 60.5,64.5H39.5C37.5,77 31.5,87 25.5,89C28.5,77 30.5,62 31.5,45.5C30.5,47.5 28.5,49.5 26,52Z';

const HAIR = [
  {n:'Rasé', f:[CR_LOW], flat:1},
  {n:'Court dégradé', f:[CR_R]},
  {n:'Brosse', f:[CR_FLAT]},
  {n:'Undercut', f:[CR_UNDER]},
  {n:'Crête', f:[CREST]},
  {n:'Coupe au bol', b:[CR_BOWL], f:['M28,38.5C28,24 37,16.5 50,16.5C63,16.5 72,24 72,38.5C60,42 40,42 28,38.5Z']},
  {n:'Frange droite', f:[CR_R, FRINGE]},
  {n:'Frange rideau', f:[CR_R, CURTAIN, CURTAIN + '|M']},
  {n:'Raie sur le côté', f:[SIDEP]},
  {n:'Carré', b:[BOB], f:[CR_R, FRINGE], side:1},
  {n:'Carré long', b:[LOB], f:[CR_R, CURTAIN, CURTAIN + '|M'], side:1},
  {n:'Longs lisses', b:[LONG], f:[CR_R], side:1},
  {n:'Longs ondulés', b:[LONG_W], f:[CR_R, CURTAIN, CURTAIN + '|M'], side:1},
  {n:'Boucles épaules', b:[CURLY], f:[CR_R], side:1},
  {n:'Afro', b:[AFRO], f:['M29,45C31,34 39,29.5 50,29.5C61,29.5 69,34 71,45C67,37.5 60,33.5 50,33.5C40,33.5 33,37.5 29,45Z']},
  {n:'Afro court', b:[AFRO_S], f:['M30,45C32,35 39,31 50,31C61,31 68,35 70,45C66,38 59,34.5 50,34.5C41,34.5 34,38 30,45Z']},
  {n:'Locks', b:[CR_R, LOCK(26,6,90), LOCK(34,6,82), LOCK(60,6,84), LOCK(68,6,92)], f:[CR_R]},
  {n:'Tresses fines', b:[CR_R, LOCK(25,4,96), LOCK(31,4,88), LOCK(37,4,80), LOCK(59,4,80), LOCK(65,4,88), LOCK(71,4,96)], f:[CR_R]},
  {n:'Tresse', b:[BRAID], f:[CR_R], ticks:1},
  {n:'Deux tresses', b:[BRAID, BRAID + '|M'], f:[CR_R, FRINGE], ticks:2},
  {n:'Couettes', b:[PUFF, PUFF + '|M'], f:[CR_R]},
  {n:'Queue haute', b:[PONY_H], f:[CR_R]},
  {n:'Queue basse', b:[PONY_L], f:[SIDEP]},
  {n:'Chignon haut', b:[BUN_H], f:[CR_R, 'M38,23.5C42,20.5 58,20.5 62,23.5C58,26.5 42,26.5 38,23.5Z']},
  {n:'Chignon bas', b:[BUN_L], f:[CR_R]},
  {n:'Mulet', b:[MULLET], f:[CR_R, FRINGE]}
];

// ---------- eyes / brows / nose / mouth
const EYES = [
  {n:'Amande', w:6, h:4.2, ct:2.1, cb:1.7},
  {n:'Ronds', w:5.4, h:5.2, ct:2.3, cb:2.3},
  {n:'Grands', w:6.4, h:5.6, ct:2.2, cb:2.2},
  {n:'Petits', w:4.6, h:3.6, ct:2.2, cb:2},
  {n:'Mi-clos', w:5.8, h:3, ct:2.4, cb:1.6, lid:1},
  {n:'Relevés', w:6, h:4.2, ct:2.1, cb:1.8, tilt:8},
  {n:'Tombants', w:6, h:4.2, ct:2.1, cb:1.8, tilt:-8},
  {n:'Bridés', w:6.2, h:3.4, ct:2.2, cb:1.6, fold:1},
  {n:'Ovales', w:5, h:5, ct:2.2, cb:2.2},
  {n:'Larges', w:6.8, h:4, ct:2.1, cb:1.8},
  {n:'Rieurs', arc:1},
  {n:'Fins', w:6, h:2.4, ct:2.4, cb:1.7}
];
const LASH = ['Aucun','Court','Fourni','Long','Bas'];
const BROW = [
  {n:'Droit', d:'M36.5,35.6C41,34.7 45.5,34.7 49,35.4V38C45.5,37.2 41,37.2 36.5,38.2Z'},
  {n:'Arqué', d:'M36.5,37.8C40,33.6 46,33.4 49,35.8V38.4C45.5,36.2 40.5,36.4 37,40Z'},
  {n:'Épais', d:'M36,35C41,33.8 45.5,33.9 49,34.8V38.9C45.5,37.7 41,37.6 36,39.1Z'},
  {n:'Fin', d:'M37,36.2C41,35.4 45.5,35.4 48.5,36V37.5C45.5,36.9 41,36.9 37,37.8Z'},
  {n:'Cassé', d:'M36.5,39.3L42,34.9L49,36.1V38.2L42.6,37.1L37.2,41Z'},
  {n:'Broussailleux', d:'M36,35.2C40,33.4 44,34.6 46.4,34.2C48,34 49,34.6 49.2,35.6C49.4,37 48.4,38.2 47,38C44,37.5 40,37.5 36.2,39.2Z'},
  {n:'Relevé', d:'M36.5,38.8C40.5,35.6 45,34 49,33.6V36C45.5,36.6 41,38 37,41.2Z'},
  {n:'Tombant', d:'M36.5,34.4C40.5,34.8 45,36.4 49,38.6V41C45,38.6 40.5,37 36.5,36.6Z'}
];
const NOSE = [
  {n:'Fin', d:'M50,45.5C50,45.5 51.6,50.8 52.4,53C52.9,54.4 51.6,55 50,55'},
  {n:'Petit', d:'M50,48.5C50,48.5 51.2,52 51.6,53.4C52,54.6 51,55 50,55'},
  {n:'Droit', d:'M50,44.5V53.4C50,54.6 51.4,54.8 52.4,54.4'},
  {n:'Arrondi', d:'M50,47C50,47 52.4,51.6 52.6,53.4C52.8,55.2 51.4,56 50,55.8'},
  {n:'Aquilin', d:'M50,44C50,44 53.2,49.4 52.6,52.4C52.2,54.6 51,55.4 50,55.2'},
  {n:'Large', d:'M50,47.4C50,47.4 53.4,51.6 53.6,53.6C53.8,55.6 51.8,56.4 50,56.2'},
  {n:'Retroussé', d:'M50,46.4C50,46.4 52.4,51 52.2,53.2C52,55 50.8,55.2 49.6,54.6'},
  {n:'Bouton', d:'M50,49.4C50,49.4 52,52 52,53.6C52,55.2 51,55.6 50,55.4'}
];
const MOUTH = [
  {n:'Neutre', p:[['M44.6,58.8C47,60.4 53,60.4 55.4,58.8', 's', 1.9]]},
  {n:'Fine ligne', p:[['M45,59.4H55', 's', 1.6]]},
  {n:'Sourire', p:[['M44,58.2C46.6,62.6 53.4,62.6 56,58.2', 's', 2.1]]},
  {n:'Sourire ouvert', p:[['M44,57.6C45,62.8 55,62.8 56,57.6Z', 'f', '#8A3A34'], ['M45.6,58.4C48,57.6 52,57.6 54.4,58.4C54.4,58.4 52.6,59.4 50,59.4C47.4,59.4 45.6,58.4 45.6,58.4Z', 'f', '#FFF6EC']]},
  {n:'Rire', p:[['M43.4,57C44.6,64 55.4,64 56.6,57Z', 'f', '#8A3A34'], ['M45,57.8C47.6,57 52.4,57 55,57.8C55,57.8 53,59 50,59C47,59 45,57.8 45,57.8Z', 'f', '#FFF6EC'], ['M46.6,62.2C48.8,63.2 51.2,63.2 53.4,62.2C52.6,63.4 47.4,63.4 46.6,62.2Z', 'f', '#C9605C']]},
  {n:'Lèvres pleines', p:[['M44,58.6C46,56.8 48,58 50,58C52,58 54,56.8 56,58.6C54.4,61.8 45.6,61.8 44,58.6Z', 'f', '#B0564E']]},
  {n:'Moue', p:[['M46.6,58.4C48,57.4 52,57.4 53.4,58.4C52.6,61.4 47.4,61.4 46.6,58.4Z', 'f', '#A85049']]},
  {n:'Sourire en coin', p:[['M44.6,58.4C47.4,61.8 53.4,61.2 55.4,57.6', 's', 2]]},
  {n:'Serrée', p:[['M45.4,59.2C48,58.6 52,58.6 54.6,59.2', 's', 1.8]]},
  {n:'Contrariée', p:[['M45,61.4C47.4,59.6 52.6,59.6 55,61.4', 's', 1.9]]}
];
const MOOD_MOUTH = {joie:3, deception:9, focus:8};

const BEARD = [
  {n:'Rasé'},
  {n:'Naissante', d:'M31.5,48C31.5,62 39,71 50,71C61,71 68.5,62 68.5,48C70,60 66,75.5 50,75.5C34,75.5 30,60 31.5,48Z', op:.3},
  {n:'Moustache', d:'M43,53.4C46,51.8 54,51.8 57,53.4C54.4,55.6 45.6,55.6 43,53.4Z'},
  {n:'Bouc', d:'M46,63.5C48,62.6 52,62.6 54,63.5C53.4,68.6 51.8,70.5 50,70.5C48.2,70.5 46.6,68.6 46,63.5Z'},
  {n:'Moustache + bouc', d:'M43,53.4C46,51.8 54,51.8 57,53.4C54.4,55.6 45.6,55.6 43,53.4Z', d2:'M45.6,62.8C47.8,61.8 52.2,61.8 54.4,62.8C53.6,68.4 52,70.8 50,70.8C48,70.8 46.4,68.4 45.6,62.8Z'},
  {n:'Barbe courte', d:'M31,48C31,63 38.5,72.5 50,72.5C61.5,72.5 69,63 69,48C70.5,61 66,77 50,77C34,77 29.5,61 31,48Z', d2:'M43,53C46,51.4 54,51.4 57,53C54.4,55.4 45.6,55.4 43,53Z'},
  {n:'Barbe pleine', d:'M29.5,45C29.5,64 37.5,76 50,76C62.5,76 70.5,64 70.5,45C73,60 70,82 50,82C30,82 27,60 29.5,45Z', d2:'M42.6,52.4C46,50.6 54,50.6 57.4,52.4C54.4,55.2 45.6,55.2 42.6,52.4Z'},
  {n:'Barbe longue', d:'M29,44C29,64 37,78 50,78C63,78 71,64 71,44C74,62 74,92 50,92C26,92 26,62 29,44Z', d2:'M42.4,52C46,50.2 54,50.2 57.6,52C54.4,55 45.6,55 42.4,52Z'},
  {n:'Favoris', d:'M31,42C33,42 34.6,42.8 35,44.6C35.6,48 35.6,54 35,58C34.6,60.6 31.4,60.6 31,58C30.4,54 30.4,46 31,42Z', mirror:1},
  {n:'Chevron', d:'M42,52.6C46,50.2 54,50.2 58,52.6C56,56 44,56 42,52.6Z'}
];
const GLASSES = [
  {n:'Rondes', d:ell(40.5,46,7.4,7.4) + ell(59.5,46,7.4,7.4), sw:2, c:'#221A14'},
  {n:'Carrées', d:'M32.8,39.6H48.2V52.4H32.8ZM51.8,39.6H67.2V52.4H51.8Z', sw:2.4, c:'#221A14'},
  {n:'Rectangulaires', d:'M32.6,41.4H48.4V50.6H32.6ZM51.6,41.4H67.4V50.6H51.6Z', sw:1.6, c:'#5E5B57'},
  {n:'Aviateur', d:'M33,40.4H48.4C48.4,49 44.4,53 40.7,53C37,53 33.4,49 33,40.4ZM67,40.4H51.6C51.6,49 55.6,53 59.3,53C63,53 66.6,49 67,40.4Z', sw:1.6, c:'#B8A87A'},
  {n:'Cat-eye', d:'M32.6,42.4C36,39 44,38.6 48.4,41.6C48,49 44,52.6 40.4,52.6C36,52.6 32.6,48.6 32.6,42.4ZM67.4,42.4C64,39 56,38.6 51.6,41.6C52,49 56,52.6 59.6,52.6C64,52.6 67.4,48.6 67.4,42.4Z', sw:2, c:'#221A14'},
  {n:'Sport', d:'M31.6,40.4H68.4C69.4,46 66.4,52 60,52.6C55,53 45,53 40,52.6C33.6,52 30.6,46 31.6,40.4Z', sw:2, c:'#2F6F8F', fill:'#A8D8FF', op:.5},
  {n:'Soleil', d:'M32.6,40H48.4V52.4H32.6ZM51.6,40H67.4V52.4H51.6Z', sw:2.2, c:'#17171A', fill:'#17171A', op:.85},
  {n:'Demi-lune', d:'M32.8,45H48.2C48,50.6 44.6,53 40.5,53C36.4,53 33,50.6 32.8,45ZM67.2,45H51.8C52,50.6 55.4,53 59.5,53C63.6,53 67,50.6 67.2,45Z', sw:1.6, c:'#B8A87A'}
];
const HAT = [
  {n:'Aucun'},
  {n:'Bonnet', dy:-8, p:[['M27.5,42C27.5,25 37,17 50,17C63,17 72.5,25 72.5,42C63,45.5 37,45.5 27.5,42Z', '#8E5BC8', 1], ['M25.5,39.5C36,44 64,44 74.5,39.5V45C74.5,47 72,48.5 68,48.8C58,49.6 42,49.6 32,48.8C28,48.5 25.5,47 25.5,45Z', '#A177DC']]},
  {n:'Bonnet à pompon', dy:-8, p:[['M27.5,42C27.5,25 37,17 50,17C63,17 72.5,25 72.5,42C63,45.5 37,45.5 27.5,42Z', '#17171A', 1], ['M25.5,39.5C36,44 64,44 74.5,39.5V45C74.5,47 72,48.5 68,48.8C58,49.6 42,49.6 32,48.8C28,48.5 25.5,47 25.5,45Z', '#2A2A2E'], [ell(50,20,4.6,4.6), '#C6F24E']]},
  {n:'Casquette', dy:-9, p:[['M28,42C28,24 37,16.5 50,16.5C63,16.5 72,24 72,42C63,45 37,45 28,42Z', '#FF5C42', 1], ['M50,41.5C60,41.5 68,41 72,39.5C80,40.5 86,44 86,48C78,50.5 62,49.5 50,47.5Z', '#E0442E'], ['M40,17.5C46,15.5 54,15.5 60,17.5C57,20 43,20 40,17.5Z', '#E0442E']]},
  {n:'Casquette plate', dy:-9, p:[['M29,40C29,28 37,22 50,22C61,22 69,27 70.5,37C71,40 70,42 68,42.5C58,44 40,44 30.5,42.5C29.5,42 29,41 29,40Z', '#7A8A6A', 1], ['M29,40C40,43 60,43 70.5,39.5C76,40 79,42 79.5,44.5C68,47.5 38,47 29,44.5Z', '#6B7A5C']]},
  {n:'Bucket', dy:-12, p:[['M31,38C31,25 39,19 50,19C61,19 69,25 69,38C60,41 40,41 31,38Z', '#3C6E8F', 1], ['M22,40C34,45 66,45 78,40C79,44 76,48 68,49.5C57,51.5 43,51.5 32,49.5C24,48 21,44 22,40Z', '#4C7E9F']]},
  {n:'Béret', dy:-7, p:[['M28,40C28,26 37,20 50,20C64,20 71,27 71,36C71,41 68,44 60,44.5C51,45 38,45 32,44C29.5,43.5 28,42 28,40Z', '#C2718F', 1], ['M62,22C67,20 70,22 68.5,25C67.5,27 64,27.5 62,26Z', '#C2718F']]},
  {n:'Panama', dy:-13, p:[['M20,42C34,48 66,48 80,42C81,46 77,50 68,51.5C57,53.5 43,53.5 32,51.5C23,50 19,46 20,42Z', '#E8DCC0', 1], ['M30,42C30,26 38,19.5 50,19.5C62,19.5 70,26 70,42C60,45 40,45 30,42Z', '#F0E6D2'], ['M30,40C40,43.5 60,43.5 70,40V43C60,46 40,46 30,43Z', '#A36F48']]},
  {n:'Bandana', dy:-5, p:[['M28.5,38C28.5,26 37,19.5 50,19.5C63,19.5 71.5,26 71.5,38C71.5,40 70,41 67,41.4C58,42.4 42,42.4 33,41.4C30,41 28.5,40 28.5,38Z', '#D9603F', 1], ['M28.5,38C38,41.5 62,41.5 71.5,38C71.5,40.5 70,42 66,42.6C57,43.8 43,43.8 34,42.6C30,42 28.5,40.5 28.5,38Z', '#C24E31'], ['M69,40C75,42 78,46 77,50C73.5,47 71,43.5 69,41Z', '#D9603F']]},
  {n:'Capuche', back:1, p:[['M16,50C16,20 31,7 50,7C69,7 84,20 84,50C84,58 78,63 69,63.6C58,64.4 42,64.4 31,63.6C22,63 16,58 16,50Z', '#2FA88A', 1], ['M23,49C23,25 34,14.5 50,14.5C66,14.5 77,25 77,49C65,53 35,53 23,49Z', '#0B0B0C', 0, .16]]},
  {n:'Serre-tête', p:[['M29,44C29,44 28.5,29 34,25.5C34,25.5 36,28 35.5,32C35,36 33.5,40 33.5,44Z', '#FFC93C'], ['M34,25.5C39,21.5 61,21.5 66,25.5C61,28.5 39,28.5 34,25.5Z', '#FFC93C'], ['M71,44C71,44 71.5,29 66,25.5C66,25.5 64,28 64.5,32C65,36 66.5,40 66.5,44Z', '#FFC93C']]},
  {n:'Casque audio', p:[['M27,46C27,46 25.5,30 32,24', '#17171A', 0, 1, 3.2], ['M73,46C73,46 74.5,30 68,24', '#17171A', 0, 1, 3.2], ['M32,24C40,18 60,18 68,24', '#17171A', 0, 1, 3.4], ['M23.5,40H29C30.6,40 31.5,41 31.5,42.6V52C31.5,53.6 30.6,54.6 29,54.6H23.5C22,54.6 21,53.6 21,52V42.6C21,41 22,40 23.5,40Z', '#C6F24E'], ['M71,40H76.5C78,40 79,41 79,42.6V52C79,53.6 78,54.6 76.5,54.6H71C69.4,54.6 68.5,53.6 68.5,52V42.6C68.5,41 69.4,40 71,40Z', '#C6F24E']]}
];
const JEWEL = [
  {n:'Aucun'},
  {n:'Clous', d:(x, y) => [ell(x, y + 1, 1.7, 1.7)], c:'#FFC93C'},
  {n:'Créoles', d:(x, y) => ['M' + (x - 3.4) + ',' + (y + 1) + 'a3.4,3.4 0 1,0 6.8,0a3.4,3.4 0 1,0 -6.8,0M' + (x - 2) + ',' + (y + 1) + 'a2,2 0 1,1 4,0a2,2 0 1,1 -4,0'], c:'#FFC93C'},
  {n:'Pendantes', d:(x, y) => ['M' + (x - .6) + ',' + y + 'h1.2v4h-1.2Z', ell(x, y + 6, 2.2, 2.6)], c:'#FFC93C'},
  {n:'Piercing nez', fixed:[ell(46.6,53.4,1.2,1.2)], c:'#E8E6E2'},
  {n:'Piercing sourcil', fixed:['M45.5,33.4h1.2v5h-1.2Z'], c:'#E8E6E2'},
  {n:'Collier', fixed:['M40.5,70C43.5,74.5 56.5,74.5 59.5,70C58,76 42,76 40.5,70Z'], c:'#FFC93C'},
  {n:'Chaîne + clous', fixed:['M40,70C43.5,75.5 56.5,75.5 60,70C58.5,77.5 41.5,77.5 40,70Z'], d:(x, y) => [ell(x, y + 1, 1.7, 1.7)], c:'#E8E6E2'}
];
const TOP = [
  {n:'T-shirt col rond', p:[['collar', 'M41,79C44,84.5 56,84.5 59,79C58,88 42,88 41,79Z', 'skin']]},
  {n:'T-shirt col V', p:[['collar', 'M42.5,79C44,86 50,93 50,93C50,93 56,86 57.5,79C56,88 50,96 50,96C50,96 44,88 42.5,79Z', 'skin']]},
  {n:'Chemise', p:[['piece', 'M41,79L50,86L59,79L61,82L50,90L39,82Z', 'topD'], ['piece', 'M48.6,88H51.4V136H48.6Z', 'topD'], ['dot', ell(50,102,1.5,1.5), 'topD'], ['dot', ell(50,116,1.5,1.5), 'topD']]},
  {n:'Chemise ouverte', p:[['piece', 'M41,79L46,90L44,136H33L34,92Z', 'topD'], ['piece', 'M59,79L54,90L56,136H67L66,92Z', 'topD'], ['piece', 'M44,86C46,92 54,92 56,86C56,98 44,98 44,86Z', 'skinD']]},
  {n:'Pull col rond', p:[['collar', 'M40.5,78.5C44,85.5 56,85.5 59.5,78.5C58.5,89 41.5,89 40.5,78.5Z', 'topD'], ['line', 'M31,128C40,131 60,131 69,128', 'topD']]},
  {n:'Col roulé', p:[['piece', 'M41,75.5H59C60,75.5 60.5,76.5 60.5,78L60,88C55,90 45,90 40,88L39.5,78C39.5,76.5 40,75.5 41,75.5Z', 'topD']]},
  {n:'Sweat à capuche', p:[['piece', 'M41,79C44,90 50,98 50,98C50,98 56,90 59,79C62,82 58,96 50,104C42,96 38,82 41,79Z', 'topL'], ['piece', 'M36,96C36,96 32,110 34,124H66C68,110 64,96 64,96C58,104 42,104 36,96Z', 'topD', .45], ['line', 'M44,100C46,104 54,104 56,100', 'topD']]},
  {n:'Veste', p:[['piece', 'M41,79L47,88L42,136H30L33,92Z', 'topD'], ['piece', 'M59,79L53,88L58,136H70L67,92Z', 'topD'], ['piece', 'M47,88H53L52,136H48Z', 'skinD', .35]]},
  {n:'Blazer', p:[['piece', 'M41,79L50,94L38,136H29L33,90Z', 'topD'], ['piece', 'M59,79L50,94L62,136H71L67,90Z', 'topD'], ['piece', 'M44,80L50,92L56,80C56,80 52,86 50,86C48,86 44,80 44,80Z', 'topL']]},
  {n:'Débardeur', p:[['piece', 'M41,79C44,86 56,86 59,79C64,82 66,90 66,96H34C34,90 36,82 41,79Z', 'skin'], ['piece', 'M38,79H43V96H38ZM57,79H62V96H57Z', 'topD', .5]]},
  {n:'Salopette', p:[['collar', 'M41,79C44,84.5 56,84.5 59,79C58,88 42,88 41,79Z', 'skin'], ['piece', 'M36,92H64V136H36Z', 'topD', .55], ['piece', 'M36,92L40,79H44L40,92ZM64,92L60,79H56L60,92Z', 'topD', .8], ['dot', ell(41,96,1.6,1.6), 'topL'], ['dot', ell(59,96,1.6,1.6), 'topL']]},
  {n:'Sweat zippé', p:[['piece', 'M48.8,79H51.2V136H48.8Z', 'topL'], ['piece', 'M41,79L48,86L48,136H37L37,88Z', 'topD', .4], ['piece', 'M59,79L52,86L52,136H63L63,88Z', 'topD', .4]]}
];
const PATT = [
  {n:'Uni'},
  {n:'Rayures', w:8, h:8, parts:[['M0,0h3.4v8H0Z']]},
  {n:'Carreaux', w:10, h:10, parts:[['M0,0h10v3.2H0Z', .85], ['M0,0h3.2v10H0Z', .85]]},
  {n:'Pois', w:9, h:9, parts:[[ell(4.5,4.5,1.9,1.9)]]},
  {n:'Chevrons', w:12, h:9, parts:[['M0,7L6,2L12,7V9L6,4L0,9Z']]},
  {n:'Losanges', w:11, h:11, parts:[['M5.5,1L9,5.5L5.5,10L2,5.5Z']]}
];
const MARK = [
  {n:'Aucune'},
  {n:'Taches de rousseur', c:[[40,50],[43,53],[37,53.5],[60,50],[57,53],[63,53.5],[45,49],[55,49]], r:.9, tone:-.18},
  {n:'Grain de beauté', c:[[60,58]], r:1.3, tone:-.4},
  {n:'Cicatrice', d:'M63,38L65.4,47', sw:1.3, tone:-.22},
  {n:'Vitiligo', d:'M60,38C68,42 69,52 66,58C63,64 57,62 56,56C55,49 57,41 60,38Z', tone:.2},
  {n:'Fossettes', d:'M42,58.6C41.2,60 41.2,61.4 42,62.6M58,58.6C58.8,60 58.8,61.4 58,62.6', sw:1.2, tone:-.3}
];
const MAKEUP = [
  {n:'Aucun'},
  {n:'Lèvres', lips:'#D24A62'},
  {n:'Blush', blush:'#FF6050'},
  {n:'Eyeliner', liner:1},
  {n:'Fard à paupières', shadow:'#8E5BC8'},
  {n:'Complet', lips:'#C2364F', blush:'#FF6050', liner:1, shadow:'#B06FF0'}
];
const AURA = ['Aucune','Anneau','Rayons','Éclats','Double anneau','Prestige'];
const BOTC = ['#3C5A80','#17171A','#8A7A5C','#5E5B57','#E8DCC0','#6C4A2E','#2FA88A','#B0564E'];
const LEG = 'M36.6,124H48.6V176C48.6,179.4 46,181 42.6,181C39.2,181 36.6,179.4 36.6,176Z';
const BOTTOM = [
  {n:'Jean', d:'M34,120H66V176C66,179.2 63.4,181 60,181C56.6,181 54,179.2 54,176V148H46V176C46,179.2 43.4,181 40,181C36.6,181 34,179.2 34,176Z', x:[['M34,132H66', 'line']]},
  {n:'Jean large', d:'M33,120H67V176C67,179.4 63.6,181.4 59.6,181.4C55.6,181.4 52.6,179.4 53.2,176L54,148H46L46.8,176C47.4,179.4 44.4,181.4 40.4,181.4C36.4,181.4 33,179.4 33,176Z'},
  {n:'Chino', d:'M35,120H65V174C65,177 62.6,178.6 59.4,178.6C56.2,178.6 53.8,177 53.8,174V150H46.2V174C46.2,177 43.8,178.6 40.6,178.6C37.4,178.6 35,177 35,174Z', x:[['M46.2,150H53.8', 'line']]},
  {n:'Short', d:'M34,120H66V150C66,153.2 63.2,155 59.8,155C56.4,155 53.6,153.2 53.6,150V143H46.4V150C46.4,153.2 43.6,155 40.2,155C36.8,155 34,153.2 34,150Z'},
  {n:'Jupe', d:'M35,120H65L70,157C70,160.4 60,162.4 50,162.4C40,162.4 30,160.4 30,157Z'},
  {n:'Jupe longue', d:'M35,120H65L72,175C72,178.4 62,180.6 50,180.6C38,180.6 28,178.4 28,175Z'},
  {n:'Jupe plissée', d:'M35,120H65L69,156L64,158L60,150L56,158L52,150L48,158L44,150L40,158L35,156Z'},
  {n:'Jogging', d:'M34,120H66V172C66,175.4 63.4,177 60,177C56.6,177 54,175.4 54,172V148H46V172C46,175.4 43.4,177 40,177C36.6,177 34,175.4 34,172Z', x:[['M34,166H46V174H34ZM54,166H66V174H54Z', 'piece']]},
  {n:'Cargo', d:'M33.5,120H66.5V176C66.5,179.2 63.8,181 60.2,181C56.6,181 54,179.2 54,176V148H46V176C46,179.2 43.4,181 39.8,181C36.2,181 33.5,179.2 33.5,176Z', x:[['M34.5,140H43V153H34.5ZM57,140H65.5V153H57Z', 'piece']]},
  {n:'Legging', d:'M36,120H64V178C64,180.8 62,182.2 59.4,182.2C56.8,182.2 54.8,180.8 54.8,178V150H45.2V178C45.2,180.8 43.2,182.2 40.6,182.2C38,182.2 36,180.8 36,178Z'}
];
const SHOES = [
  {n:'Baskets', c:'#F6F4EF', d:'M36,174H48.8V184C48.8,186.6 46.8,188 43.6,188H31C28.6,188 27,186.6 27,184.6C27,182 29,180 32,178.4C34,177.4 35.6,175.8 36,174Z', d2:'M27.4,185H48.8V188H31C28.8,188 27.4,187 27.4,185Z', c2:'#17171A'},
  {n:'Baskets montantes', c:'#C6F24E', d:'M36,168H48.8V184C48.8,186.6 46.8,188 43.6,188H31C28.6,188 27,186.6 27,184.6C27,182 29,180 32,178.4C34.6,177 36,173 36,168Z', d2:'M27.4,185H48.8V188H31C28.8,188 27.4,187 27.4,185Z', c2:'#17171A'},
  {n:'Bottes', c:'#6C4A2E', d:'M35,164H48.8V182C48.8,185 46.8,186.6 43.6,186.6H30C27.6,186.6 26,185 26,183C26,180 28,178 31,176.4C33.6,175 35,170 35,164Z', d2:'M26.2,183.4H48.8V186.6H30C27.8,186.6 26.4,185.4 26.2,183.4Z', c2:'#3A2B22'},
  {n:'Bottines', c:'#17171A', d:'M36,170H48.8V181.4C48.8,184.4 46.8,186 43.6,186H31C28.6,186 27.2,184.4 27.2,182.4C27.2,180 29,178.4 32,177C34.6,175.6 36,173 36,170Z'},
  {n:'Mocassins', c:'#8C5B39', d:'M37,176H48.6V183C48.6,185 46.6,186 44,186H32C30,186 28.6,185 28.6,183.4C28.6,181.6 30.6,180 33,179C35,178.4 36.6,177.4 37,176Z', d2:'M37,178C40,180 45,180 48.6,178.6', c2:'#5E3A26', line:1},
  {n:'Sandales', c:'#B07C35', d:'M37,179H48.6V182.4C48.6,184 47,185 44.6,185H32C30.4,185 29.4,184 29.4,182.6C29.4,181.4 30.6,180.4 33,179.8Z', d2:'M36.4,175.4H48.8V178.4H36.4Z', c2:'#B07C35'},
  {n:'Claquettes', c:'#3C6E8F', d:'M35,180.4H48.8V183.4C48.8,185 47.2,186 44.8,186H33C31,186 30,185 30,183.6C30,182.4 31.4,181.4 33,180.8Z', d2:'M38,176C41,178.4 45.6,178.4 48,176', c2:'#3C6E8F', line:1},
  {n:'Chaussures de sport', c:'#17171A', d:'M36,174H48.8V184C48.8,186.6 46.8,188 43.6,188H31C28.6,188 27,186.6 27,184.6C27,182 29,180 32,178.4C34,177.4 35.6,175.8 36,174Z', d2:'M28,181C34,182.6 42,183 48.8,182.6', c2:'#FF5C42', line:1}
];
const SCENE = [
  {n:'Aucune'},
  {n:'Atelier', p:[['M-14,150H114V160H-14Z', '#8A5A38'], ['M2,160H10V200H2ZM90,160H98V200H90Z', '#70452C'], ['M6,58H36V64H6Z', '#A36F48'], ['M12,40H22V58H12Z', '#C2718F'], ['M25,44H33V58H25Z', '#9BC7B0'], ['M76,20H94L86,44H84L86,20', '#FFC93C'], ['M84,20H86V6H84Z', '#5E5B57'], ['M56,138H92V150H56Z', '#E8DCC0']]},
  {n:'Podium', p:[['M-14,-14H114V200H-14Z', '#1C1B1A', .0], ['M2,180H32V200H2Z', '#B07C35'], ['M34,172H66V200H34Z', '#FFC93C'], ['M68,186H98V200H68Z', '#C2718F'], ['M18,6H82V24H18Z', '#C6F24E'], ['M18,24L26,32L34,24Z', '#A9D63F']]},
  {n:'Studio', p:[['M-14,-14H114V116C82,130 18,130 -14,116Z', '#E4E0D6'], ['M80,60H83V152H80Z', '#5E5B57'], ['M70,50H94L88,62H76Z', '#F5DFA0'], ['M8,150H30V200H8Z', '#C9BFAE']]},
  {n:'Bibliothèque', p:[['M-14,56H114V62H-14Z', '#8A5A38'], ['M-14,108H114V114H-14Z', '#8A5A38'], ['M2,36H8V56H2ZM10,40H16V56H10ZM18,32H24V56H18ZM78,34H84V56H78ZM86,40H92V56H86Z', '#B0564E'], ['M4,88H10V108H4ZM12,84H18V108H12ZM82,86H88V108H82ZM90,90H96V108H90Z', '#3C6E8F'], ['M-14,150H114V200H-14Z', '#C9BFAE', .5]]},
  {n:'Terrasse', p:[['M-14,124H114V130H-14Z', '#E8DCC0'], ['M2,130H6V172H2ZM94,130H98V172H94Z', '#E8DCC0'], ['M4,112H26V140H4Z', '#B0564E'], ['M8,110C16,92 20,74 15,58C10,74 4,92 8,110Z', '#2C8C73'], ['M18,110C24,96 28,86 26,74C22,86 16,98 18,110Z', '#3FA080'], ['M76,120H96V142H76Z', '#C2718F'], ['M80,118C86,104 90,94 88,84C84,94 78,106 80,118Z', '#2C8C73']]},
  {n:'Salle de sport', p:[['M-14,140H114V200H-14Z', '#C9BFAE', .55], ['M2,56H98V62H2Z', '#5E5B57'], ['M2,80H98V86H2Z', '#5E5B57'], ['M4,150H30V158H4Z', '#17171A'], ['M0,144H8V164H0ZM26,144H34V164H26Z', '#2A2A2E'], ['M70,150H96V158H70Z', '#17171A'], ['M66,144H74V164H66ZM92,144H100V164H92Z', '#2A2A2E']]},
  {n:'Concert', p:[['M-14,-14H114V200H-14Z', '#17171A'], ['M-8,-10L34,120H10L-14,-10Z', '#FFC93C', .35], ['M108,-10L66,120H90L114,-10Z', '#A8D8FF', .32], ['M-10,104H16V190H-10ZM84,104H110V190H84Z', '#2A2A2E'], [ell(3,124,7,7) + ell(97,124,7,7), '#5E5B57'], [ell(3,160,7,7) + ell(97,160,7,7), '#5E5B57']]},
  {n:'Espace', p:[['M-14,-14H114V200H-14Z', '#1C2340'], [ell(84,26,15,15), '#C2718F'], ['M60,26H108V30H60Z', '#E8DCC0', .8], [ell(12,20,4,4), '#F5DFA0'], [ell(24,44,2.4,2.4), '#E8E6E2'], [ell(8,70,3,3), '#E8E6E2'], [ell(92,80,2.6,2.6), '#F5DFA0'], ['M-14,168C20,150 80,150 114,168V200H-14Z', '#3A4468']]}
];
const DEF = {skin:2, face:0, eyes:0, eyeC:0, lash:1, brow:0, nose:0, mouth:0, hair:1, hairC:1, streak:0, beard:0, mark:0, makeup:0, glasses:0, hat:0, jewel:0, top:0, topC:0, pattern:0, bottom:0, bottomC:0, shoes:0, bgPal:0, bgStyle:0, scene:0, aura:0};
const PRESET_EXTRA = {
  camille:{bottom:0, bottomC:0, shoes:0, scene:1}, lea:{bottom:4, bottomC:1, shoes:4, scene:5},
  karim:{bottom:2, bottomC:2, shoes:2, scene:1}, ines:{bottom:5, bottomC:7, shoes:5, scene:4},
  nina:{bottom:8, bottomC:1, shoes:1, scene:7}, tom:{bottom:3, bottomC:2, shoes:0, scene:6},
  rina:{bottom:6, bottomC:4, shoes:3, scene:2}, alex:{bottom:2, bottomC:3, shoes:4, scene:3},
  hugo:{bottom:0, bottomC:0, shoes:2, scene:4}, sofia:{bottom:5, bottomC:1, shoes:6, scene:2}
};
const PRESET = {
  camille:{skin:2, face:0, eyes:0, eyeC:0, brow:1, nose:0, mouth:2, hair:23, hairC:2, top:0, topC:0, bgPal:0, bgStyle:4, lash:2, mark:1},
  lea:{skin:1, face:4, eyes:2, eyeC:4, brow:0, nose:1, mouth:3, hair:12, hairC:6, top:5, topC:5, bgPal:3, bgStyle:5, lash:1},
  karim:{skin:6, face:2, eyes:0, eyeC:0, brow:2, nose:5, mouth:0, hair:1, hairC:0, beard:6, top:2, topC:2, bgPal:6, bgStyle:1},
  ines:{skin:8, face:1, eyes:2, eyeC:1, brow:1, nose:3, mouth:2, hair:14, hairC:0, top:10, topC:3, bgPal:7, bgStyle:6, lash:2, jewel:2},
  nina:{skin:1, face:1, eyes:10, eyeC:2, brow:3, nose:6, mouth:3, hair:9, hairC:9, glasses:1, top:0, topC:9, bgPal:10, bgStyle:11, mark:1},
  tom:{skin:3, face:6, eyes:3, eyeC:5, brow:0, nose:2, mouth:8, hair:3, hairC:1, hat:3, top:6, topC:1, bgPal:4, bgStyle:2},
  rina:{skin:9, face:0, eyes:0, eyeC:0, brow:2, nose:7, mouth:5, hair:17, hairC:0, top:8, topC:4, bgPal:8, bgStyle:13, jewel:3, makeup:1},
  alex:{skin:2, face:5, eyes:6, eyeC:6, brow:4, nose:2, mouth:0, hair:3, hairC:10, glasses:2, top:11, topC:2, bgPal:9, bgStyle:8, aura:2},
  hugo:{skin:4, face:6, eyes:7, eyeC:1, brow:2, nose:5, mouth:1, hair:0, hairC:1, beard:7, top:2, topC:8, bgPal:1, bgStyle:9, mark:3},
  sofia:{skin:7, face:3, eyes:5, eyeC:7, brow:1, nose:0, mouth:5, hair:13, hairC:0, top:9, topC:9, bgPal:13, bgStyle:15, lash:3, makeup:5}
};

class AvatarLogic {
  constructor(p){ this.props = p || {}; this.uid = 'c' + Math.random().toString(36).slice(2,7); }
  renderVals(){
    const q = this.props;
    const A = Object.assign({}, DEF, PRESET[q.who] || {}, PRESET_EXTRA[q.who] || {}, q.av || {});
    if (typeof q.aura === 'number') A.aura = q.aura;
    const mood = q.mood || 'calme';
    const rnd = RNG(1337);
    const at = (k, n) => { const v = A[k]; return typeof v === 'number' && v >= 0 ? Math.floor(v) % n : 0; };
    const F = 'url(#' + this.uid + 'sh)';
    const P = (d, fill, o) => Object.assign({d, t:'', fill:fill || 'none', stroke:'none', sw:0, op:1, f:'none'}, o || {});
    const S = (d, stroke, sw, o) => Object.assign({d, t:'', fill:'none', stroke, sw, op:1, f:'none'}, o || {});

    const skin = SKIN[at('skin', SKIN.length)], skinD = sh(skin, -.15), skinL = sh(skin, .15), skinDD = sh(skin, -.32);
    const hair = HAIRC[at('hairC', HAIRC.length)], hairD = sh(hair, -.24), hairL = sh(hair, .16);
    const stIx = at('streak', STREAKC.length), streak = stIx > 0 ? STREAKC[stIx] : null;
    const topC = TOPC[at('topC', TOPC.length)], dark = lum(topC) > .5;
    const topD = sh(topC, dark ? -.16 : .26), topL = sh(topC, dark ? -.07 : .14);
    const ink = '#221A14';
    const crop = q.crop || 'bust';
    const vb = crop === 'full' ? '-2,2,104,196' : crop === 'half' ? '2,4,96,128' : crop === 'face' ? '24,16,52,52' : crop === 'head' ? '18,8,64,68' : '4,6,92,104';
    const CV = {skin, skinD, skinL, skinDD, topC, topD, topL, hair, hairD, hairL};

    const fc = FACE[at('face', FACE.length)], fw = fc.w, hsx = fw / 42;
    const hairT = 'translate(50,44) scale(' + hsx.toFixed(3) + ',1) translate(-50,-44)';
    const HP = (d, fill, o) => { const mir = d.indexOf('|M') > 0; const p = P(mir ? d.slice(0, d.indexOf('|M')) : d, fill, o); p.t = hairT + (mir ? ' ' + M : ''); return p; };
    const earX = 50 + fw / 2 - 1;

    // ---------------- background
    const pal = BGPAL[at('bgPal', BGPAL.length)], c0 = pal[0], c1 = pal[1];
    const bgs = at('bgStyle', 16), bgp = [];
    if (bgs === 1) for (let i = -3; i < 11; i++) bgp.push(P('M' + (i * 14) + ',-60h7V240h-7Z', c1, {op:.9}));
    if (bgs === 2) for (let i = -6; i < 14; i++) bgp.push(P('M' + (i * 16) + ',-60h8V240h-8Z', c1, {op:.85, t:'rotate(-22 50 60)'}));
    if (bgs === 3) for (let r = -2; r < 14; r++) for (let cc = -2; cc < 10; cc++) { if ((r + cc) % 2) continue; bgp.push(P('M' + (cc * 14) + ',' + (r * 14) + 'h14v14h-14Z', c1, {op:.8})); }
    if (bgs === 4) bgp.push(P('M20,240V64C20,38 33,24 50,24C67,24 80,38 80,64V240Z', c1));
    if (bgs === 5) bgp.push(P(ell(50,46,34,34), c1));
    if (bgs === 6) for (let i = 0; i < 14; i++) bgp.push(P('M50,46L160,20L160,72Z', c1, {op:.55, t:'rotate(' + i * 25.7 + ' 50 46)'}));
    if (bgs === 7) for (let i = 0; i < 20; i++) { const x = -20 + rnd() * 140, y = -20 + rnd() * 200, s = 2.4 + rnd() * 3; bgp.push(P('M' + x + ',' + y + 'h' + s + 'v' + s * 1.8 + 'h-' + s + 'Z', c1, {op:.9, t:'rotate(' + Math.round(rnd() * 90) + ' ' + x + ' ' + y + ')'})); }
    if (bgs === 8) { for (let i = -2; i < 11; i++) bgp.push(P('M' + (i * 16) + ',-60h2.6V240h-2.6Z', c1, {op:.75})); for (let i = -3; i < 15; i++) bgp.push(P('M-60,' + (i * 16) + 'h220v2.6h-220Z', c1, {op:.75})); }
    if (bgs === 9) bgp.push(P('M-60,74H160V240H-60Z', c1), P(ell(50,40,20,20), sh(c1, .28)));
    if (bgs === 10) bgp.push(P('M-60,-60H160V240H-60Z', 'url(#' + this.uid + 'dot)', {op:.55}));
    if (bgs === 11) bgp.push(P('M100,-60V56L-4,-60Z', c1), P('M-60,240V150L46,240Z', c1, {op:.7}));
    if (bgs === 12) bgp.push(P('M8,6H92V128H8ZM14,12V122H86V12Z', c1), P('M18,16H82V118H18ZM22,20V114H78V20Z', c1, {op:.5}));
    if (bgs === 13) for (let i = 0; i < 6; i++) bgp.push(P('M-60,' + (i * 34 - 30) + 'C-10,' + (i * 34 - 46) + ' 40,' + (i * 34 - 14) + ' 160,' + (i * 34 - 30) + 'V' + (i * 34 - 12) + 'C40,' + (i * 34 + 4) + ' -10,' + (i * 34 - 28) + ' -60,' + (i * 34 - 12) + 'Z', c1, {op:.6}));
    if (bgs === 14) for (let i = -2; i < 8; i++) bgp.push(P('M' + (i * 20) + ',240L' + (i * 20 + 10) + ',150L' + (i * 20 + 20) + ',240Z', c1, {op:.85}));
    if (bgs === 15) bgp.push(P('M-60,-60H160V40C120,60 -20,60 -60,40Z', c1), P(ell(50,140,42,42), c1, {op:.55}));
    const scn = SCENE[at('scene', SCENE.length)];
    if (scn.p) scn.p.forEach(s => { if (s[2] === 0) return; bgp.push(P(s[0], s[1], {op:s[2] === undefined ? 1 : s[2]})); });

    // ---------------- aura
    const au = at('aura', AURA.length), spin = [], pulse = [], acc = ['#C6F24E','#C6F24E','#FFC93C','#B06FF0','#A8D8FF','#FFC93C'][au];
    if (au === 1 || au === 4 || au === 5) pulse.push(P(ell(50,46,40,40) + ell(50,46,33,33), acc, {op:.9}));
    if (au === 2 || au === 5) for (let i = 0; i < 12; i++) spin.push(P('M50,46L98,38L98,54Z', acc, {op:.32, t:'rotate(' + i * 30 + ' 50 46)'}));
    if (au === 3 || au === 5) for (let i = 0; i < 8; i++) spin.push(P('M50,3L53.4,8L50,13L46.6,8Z', acc, {op:.95, t:'rotate(' + i * 45 + ' 50 46)'}));
    if (au === 4 || au === 5) pulse.push(P(ell(50,46,47,47) + ell(50,46,43,43), '#FFFFFF', {op:.34}));

    // ---------------- body
    const pt = PATT[at('pattern', PATT.length)];
    const cloth = pt.parts ? 'url(#' + this.uid + 'pat)' : topC;
    const body = [];
    const bc = BOTC[at('bottomC', BOTC.length)], bcD = sh(bc, lum(bc) > .5 ? -.16 : .22);
    body.push(P(LEG, skin, {f:F}), P(LEG, skin, {f:F, t:M}));
    const bt = BOTTOM[at('bottom', BOTTOM.length)];
    body.push(P(bt.d, bc, {f:F}));
    (bt.x || []).forEach(x => body.push(x[1] === 'line' ? S(x[0], bcD, 1.4, {op:.8}) : P(x[0], bcD, {op:.7})));
    const sho = SHOES[at('shoes', SHOES.length)];
    body.push(P(sho.d, sho.c, {f:F}), P(sho.d, sho.c, {f:F, t:M}));
    if (sho.d2) { const mk2 = sho.line ? S(sho.d2, sho.c2, 1.4) : P(sho.d2, sho.c2); body.push(mk2, Object.assign({}, mk2, {t:M})); }
    body.push(P('M43.5,55H56.5C57.5,55 58,56 58.2,58L59,80H41L41.8,58C42,56 42.5,55 43.5,55Z', skinD, {f:F}));
    body.push(P('M29,136C29,112 31,96 36,86C39,80.5 44,78 50,78C56,78 61,80.5 64,86C69,96 71,112 71,136Z', cloth, {f:F}));
    TOP[at('top', TOP.length)].p.forEach(t => {
      const fill = t[2] === 'skin' ? skin : t[2] === 'skinD' ? skinD : CV[t[2]] || t[2];
      if (t[0] === 'line') body.push(S(t[1], fill, 1.8, {op:t[3] || 1}));
      else body.push(P(t[1], fill, {op:t[3] === undefined ? 1 : t[3]}));
    });
    const sleeve = 'M37,84C31,89 28.6,100 28.6,112C28.6,118 29.4,122.4 30.4,124.6C32.6,126 36,125 36.6,122.6C35.6,112 35.6,96 38.6,88Z';
    body.push(P(sleeve, cloth, {f:F}), P(sleeve, cloth, {f:F, t:M}));
    body.push(P(ell(32.6,128.6,4.6,5), skin, {f:F}), P(ell(67.4,128.6,4.6,5), skin, {f:F}));

    // ---------------- head, back plane
    const head = [], hs = HAIR[at('hair', HAIR.length)];
    (hs.b || []).forEach(d => head.push(HP(d, hair, {f:F})));
    if (hs.ticks) { BRAID_TICK.forEach(d => head.push(HP(d, 'none', {stroke:hairD, sw:1.2}))); if (hs.ticks === 2) BRAID_TICK.forEach(d => head.push(HP(d + '|M', 'none', {stroke:hairD, sw:1.2}))); }
    const ear = 'M' + earX + ',41.5C' + (earX + 5.4) + ',41 ' + (earX + 6) + ',48 ' + (earX + 3.4) + ',51.5C' + (earX + 1.6) + ',54 ' + earX + ',53 ' + earX + ',51Z';
    head.push(P(ear, skin, {f:F}), P(ear, skin, {f:F, t:M}));
    head.push(S('M' + (earX + 1.4) + ',44.4C' + (earX + 3.6) + ',45 ' + (earX + 3) + ',48.4 ' + (earX + 1.6) + ',49.4', skinDD, 1, {op:.6}));
    head.push(S('M' + (earX + 1.4) + ',44.4C' + (earX + 3.6) + ',45 ' + (earX + 3) + ',48.4 ' + (earX + 1.6) + ',49.4', skinDD, 1, {op:.6, t:M}));
    head.push(P(fc.d, skin, {f:F}));
    head.push(P('M' + (50 - fw / 2) + ',40C' + (50 - fw / 2 + 3) + ',26 ' + (50 - fw / 2 + 8) + ',20 ' + (50 - fw / 2 + 14) + ',19C' + (50 - fw / 2 + 8) + ',34 ' + (50 - fw / 2 + 7) + ',52 ' + (50 - fw / 2 + 10) + ',66C' + (50 - fw / 2 + 3) + ',60 ' + (50 - fw / 2 - 1) + ',50 ' + (50 - fw / 2) + ',40Z', skinL, {op:.3}));
    head.push(P('M' + (50 + fw / 2 - 10) + ',20C' + (50 + fw / 2) + ',26 ' + (50 + fw / 2) + ',40 ' + (50 + fw / 2 - 2) + ',54C' + (50 + fw / 2 - 6) + ',64 ' + (50 + fw / 2 - 12) + ',68 ' + (50 + fw / 2 - 14) + ',68C' + (50 + fw / 2 - 6) + ',54 ' + (50 + fw / 2 - 6) + ',34 ' + (50 + fw / 2 - 10) + ',20Z', skinDD, {op:.14}));

    // marks
    const mkI = at('mark', MARK.length), mk = MARK[mkI];
    if (mk.c) mk.c.forEach(c => head.push(P(ell(c[0], c[1], mk.r, mk.r), sh(skin, mk.tone), {op:.85})));
    if (mk.d && mk.sw) head.push(S(mk.d, sh(skin, mk.tone), mk.sw, {op:.65}));
    else if (mk.d) head.push(P(mk.d, sh(skin, mk.tone), {op:.8}));
    const mu = MAKEUP[at('makeup', MAKEUP.length)];
    if (mu.blush) head.push(P(ell(36.5,52.5,5.4,3.2), mu.blush, {op:.26}), P(ell(63.5,52.5,5.4,3.2), mu.blush, {op:.26}));
    if (mu.shadow) head.push(P('M35.6,42.4C39,38.8 46,38.6 49.4,41.6C46,40.6 39.5,41.4 36.6,44.6Z', mu.shadow, {op:.55}), P('M64.4,42.4C61,38.8 54,38.6 50.6,41.6C54,40.6 60.5,41.4 63.4,44.6Z', mu.shadow, {op:.55}));

    // brows
    const brD = BROW[at('brow', BROW.length)].d;
    const brT = mood === 'joie' ? 'translate(0,-1.2)' : mood === 'focus' ? 'translate(0,1.4)' : mood === 'deception' ? 'rotate(-6 44 37)' : '';
    const brS = 'translate(0,36.5) scale(1,0.82) translate(0,-36.5)';
    head.push(P(brD, hairD, {t:brS + (brT ? ' ' + brT : '')}), P(brD, hairD, {t:M + ' ' + brS + (brT ? ' ' + brT : '')}));

    // ---------------- eyes
    const ey = EYES[at('eyes', EYES.length)], eyeC = EYEC[at('eyeC', EYEC.length)], eyes = [];
    const lashI = at('lash', LASH.length), cx = 58.5, cy = 46;
    const both = (p) => { eyes.push(p); const c = Object.assign({}, p); c.t = c.t ? M + ' ' + c.t : M; eyes.push(c); };
    const tilt = ey.tilt ? 'rotate(' + -ey.tilt + ' ' + cx + ' ' + cy + ')' : '';
    if (ey.arc || mood === 'joie') {
      both(S('M' + (cx - 5.6) + ',' + (cy + 1.8) + 'C' + (cx - 2) + ',' + (cy - 3.4) + ' ' + (cx + 2) + ',' + (cy - 3.4) + ' ' + (cx + 5.6) + ',' + (cy + 1.8), ink, 2.4, {t:tilt}));
    } else {
      const w = ey.w * .8, h = ey.h * .76;
      const sc = 'M' + (cx - w) + ',' + cy + 'C' + (cx - w * .55) + ',' + (cy - h * ey.ct) + ' ' + (cx + w * .55) + ',' + (cy - h * ey.ct) + ' ' + (cx + w) + ',' + cy + 'C' + (cx + w * .55) + ',' + (cy + h * ey.cb) + ' ' + (cx - w * .55) + ',' + (cy + h * ey.cb) + ' ' + (cx - w) + ',' + cy + 'Z';
      both(P(sc, '#FBF3E6', {t:tilt}));
      const ir = Math.min(2.3, h * .78), px = cx + (mood === 'focus' ? 1 : 0);
      both(P(ell(px, cy + .3, ir, ir), eyeC, {t:tilt}));
      both(P(ell(px, cy + .4, ir * .42, ir * .42), ink, {t:tilt}));
      both(P(ell(px - ir * .42, cy - ir * .42, ir * .26, ir * .26), '#FFFFFF', {op:.85, t:tilt}));
      both(S(sc, sh(skin, -.3), .5, {op:.32, t:tilt}));
      if (ey.lid) both(S('M' + (cx - w) + ',' + (cy - 1) + 'C' + (cx - w * .5) + ',' + (cy - h * 1.9) + ' ' + (cx + w * .5) + ',' + (cy - h * 1.9) + ' ' + (cx + w) + ',' + (cy - 1), ink, 1.4, {t:tilt}));
      if (ey.fold) both(S('M' + (cx - w) + ',' + (cy - h * 1.5) + 'C' + (cx - w * .4) + ',' + (cy - h * 2.5) + ' ' + (cx + w * .6) + ',' + (cy - h * 2.2) + ' ' + (cx + w) + ',' + (cy - h * 1.2), skinDD, .9, {op:.5, t:tilt}));
      if (mu.liner) both(S('M' + (cx - w - .6) + ',' + (cy - .4) + 'C' + (cx - w * .5) + ',' + (cy - h * ey.ct - .8) + ' ' + (cx + w * .5) + ',' + (cy - h * ey.ct - .8) + ' ' + (cx + w + 1.8) + ',' + (cy - 1.6), ink, 1.4, {t:tilt}));
      if (lashI === 1) both(S('M' + (cx + w * .7) + ',' + (cy - h * 1.5) + 'l2,-1.4', ink, 1.2, {t:tilt}));
      if (lashI === 2) both(S('M' + (cx + w * .2) + ',' + (cy - h * 2) + 'l.6,-2.2M' + (cx + w * .7) + ',' + (cy - h * 1.7) + 'l1.8,-1.8M' + (cx + w) + ',' + (cy - h * .6) + 'l2.4,-1.4', ink, 1.2, {t:tilt}));
      if (lashI === 3) both(S('M' + (cx - w) + ',' + (cy - h * 1.2) + 'C' + (cx - w * .5) + ',' + (cy - h * 2.6) + ' ' + (cx + w * .5) + ',' + (cy - h * 2.6) + ' ' + (cx + w + 2.4) + ',' + (cy - h * 1.4), ink, 2, {t:tilt}));
      if (lashI === 4) both(S('M' + (cx - w * .6) + ',' + (cy + h * 1.8) + 'h' + (w * 1.2), ink, 1, {op:.7, t:tilt}));
    }

    // ---------------- front plane
    const front = [];
    front.push(S(NOSE[at('nose', NOSE.length)].d, skinDD, 1.5, {op:.8}));
    const bdI = at('beard', BEARD.length), bd = BEARD[bdI];
    if (bd.d) { front.push(P(bd.d, hair, {op:bd.op || 1, f:bd.op ? 'none' : F})); if (bd.mirror) front.push(P(bd.d, hair, {t:M})); }
    const mI = MOOD_MOUTH[mood] !== undefined ? MOOD_MOUTH[mood] : at('mouth', MOUTH.length);
    MOUTH[mI].p.forEach(m => front.push(m[1] === 's' ? S(m[0], mu.lips || ink, m[2]) : P(m[0], m[2] === '#8A3A34' && mu.lips ? sh(mu.lips, -.4) : m[2])));
    if (mu.lips && MOUTH[mI].p[0][1] === 's') front.push(P('M44.4,58.2C46.6,56.6 53.4,56.6 55.6,58.2C53.6,61.4 46.4,61.4 44.4,58.2Z', mu.lips, {op:.95}));

    if (bd.d2) front.push(P(bd.d2, hair));

    (hs.f || []).forEach(d => front.push(HP(d, hair, {f:F})));
    if (!hs.flat) front.push(HP('M35,31C39,25.5 43.5,22.5 48,21.5C44.5,25.5 41,28.5 38,33.5Z', hairL, {op:.2}));
    if (streak) front.push(HP('M57,26C65,29 70,36 71,46C69,37 63,31 55,29Z', streak));

    const gl = GLASSES[at('glasses', GLASSES.length + 1) === 0 ? 0 : at('glasses', GLASSES.length + 1) - 1];
    if (at('glasses', GLASSES.length + 1) > 0) {
      if (gl.fill) front.push(P(gl.d, gl.fill, {op:gl.op}));
      front.push(S(gl.d, gl.c, gl.sw), S('M48.4,45.4h3.2', gl.c, gl.sw), S('M32.7,42.6L' + (earX + 1) + ',41.4', gl.c, gl.sw), S('M67.3,42.6L' + (100 - earX - 1) + ',41.4', gl.c, gl.sw));
    }

    const ht = HAT[at('hat', HAT.length)];
    if (ht.p) ht.p.forEach(h => { const filt = h[2] ? F : 'none'; const hp = h[4] ? HP(h[0], 'none', {stroke:h[1], sw:h[4]}) : HP(h[0], h[1], {f:filt, op:h[3] === undefined ? 1 : h[3]}); if (ht.dy) hp.t = 'translate(0,' + ht.dy + ') ' + hp.t; if (ht.back) head.unshift(hp); else front.push(hp); });

    const jwI = at('jewel', JEWEL.length), jw = JEWEL[jwI];
    if (jw.d) { jw.d(earX + 2.6, 50).forEach(d => front.push(P(d, jw.c))); jw.d(earX + 2.6, 50).forEach(d => front.push(P(d, jw.c, {t:M}))); }
    if (jw.fixed) jw.fixed.forEach(d => front.push(P(d, jw.c)));

    const tex = [];
    tex.push(P('M' + (50 - fw / 2) + ',54C' + (50 - fw / 4) + ',52 ' + (50 + fw / 4) + ',50 ' + (50 + fw / 2) + ',49L' + (50 + fw / 2) + ',52C' + (50 + fw / 4) + ',53 ' + (50 - fw / 4) + ',55 ' + (50 - fw / 2) + ',57Z', '#2B1C12', {op:.05}));

    const an = q.anim === false ? false : true;
    return {
      aBob: an ? 'animation:nuCBob 4.8s ease-in-out infinite' : '',
      aBreath: an ? 'animation:nuCBreath 4.8s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 96%' : '',
      aBlink: an ? 'animation:nuCBlink 7.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center' : '',
      aSpin: an ? 'animation:nuCSpin 46s linear infinite;transform-box:fill-box;transform-origin:50% 46%' : '',
      aPulse: an ? 'animation:nuCPulse 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%' : '',
      vb, shId:this.uid + 'sh', grId:this.uid + 'gr', patId:this.uid + 'pat', dotId:this.uid + 'dot',
      bg: q.bg || c0, bgAcc:c1, bgParts:bgp, topC,
      patW: pt.parts ? pt.w : 8, patH: pt.parts ? pt.h : 8,
      patBase: pt.parts ? 'M0,0h' + pt.w + 'v' + pt.h + 'H0Z' : 'M0,0h8v8H0Z',
      patParts: pt.parts ? pt.parts.map(x => P(x[0], topD, {op:x[1] === undefined ? 1 : x[1]})) : [],
      auraSpin:spin, auraPulse:pulse,
      headT: mood === 'focus' ? 'rotate(-2.5 50 70)' : mood === 'deception' ? 'rotate(2 50 70) translate(0,1.4)' : '',
      bodyParts:body, headParts:head, eyeParts:eyes, frontParts:front, texParts:tex
    };
  }
}

/** Calcule tous les tracés de l'avatar pour un jeu de props { av, who, crop, mood, aura }. */
export function computeAvatar(props) {
  return new AvatarLogic(props).renderVals();
}
export { AvatarLogic };
