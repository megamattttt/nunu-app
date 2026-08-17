import type { DioItem } from '../lib/dio';

/** Réactions qu'on peut laisser dans l'atelier d'une autre personne. */
export const DIO_REACTS: [string, string, string][] = [
  ['coeur','♥','#E2685A'],
  ['fleur','✿','#7E8F6B'],
  ['soleil','☀','#E0A85C'],
  ['etoile','★','#6FA5D8'],
  ['aiguille','✎','#8B7BA8']
];

export type DioVisit = { who: string; name: string; react: number; when: string; word?: string };

/** Réactions reçues (état initial). */
export const DIO_VISITS0: DioVisit[] = [
  { who:'lea', name:'Léa Fontaine', react:0, when:'hier', word:'Le mannequin près de la fenêtre, très juste.' },
  { who:'karim', name:'Karim Belhadj', react:3, when:'il y a 3 j' },
  { who:'ines', name:'Inès Moreau', react:1, when:'la semaine dernière', word:'J’ai copié ton coin bocaux.' }
];

export type FriendDio = {
  who: string; name: string; title: string; wall: number; floor: number; light: number;
  items: Record<string, DioItem>;
};

/** Ateliers visitables. Les objets sont ceux du catalogue commun. */
export const FRIEND_DIOS: FriendDio[] = [
  { who:'lea', name:'Léa Fontaine', title:'L’atelier du dimanche', wall:6, floor:1, light:3,
    items: {
      tapis:{ s:'floor', x:44, y:80, cw:3 }, table:{ s:'floor', x:38, y:56, cw:1 },
      machine:{ s:'floor', x:36, y:50 }, mannequin:{ s:'floor', x:70, y:66, cw:2 },
      tissus:{ s:'wb', x:46, y:38, cw:3 }, bobines:{ s:'wb', x:8, y:56 },
      portant:{ s:'floor', x:82, y:56 }, croquis:{ s:'wb', x:26, y:14 },
      fauteuil:{ s:'floor', x:20, y:86, cw:3 }, patrons:{ s:'wl', x:42, y:34 },
      lampadaire:{ s:'floor', x:90, y:64 }, tasse:{ s:'floor', x:44, y:47 }
    } },
  { who:'karim', name:'Karim Belhadj', title:'Le garage', wall:7, floor:6, light:1,
    items: {
      tapis:{ s:'floor', x:50, y:84, cw:2 }, commode:{ s:'floor', x:76, y:46, cw:2 },
      chrono:{ s:'floor', x:54, y:40 }, chaussures:{ s:'floor', x:86, y:92 },
      dossards:{ s:'wl', x:58, y:50 }, medaille:{ s:'wb', x:72, y:24 },
      'affiche-course':{ s:'wb', x:50, y:20 }, trophee:{ s:'floor', x:62, y:36 },
      'tapis-etir':{ s:'floor', x:64, y:94, cw:2 }, 'sac-sport':{ s:'floor', x:18, y:88, cw:2 },
      roller:{ s:'floor', x:74, y:70 }, horloge:{ s:'wb', x:60, y:10 }
    } },
  { who:'ines', name:'Inès Moreau', title:'Cuisine et pots', wall:2, floor:5, light:2,
    items: {
      tapis:{ s:'floor', x:48, y:82, cw:1 }, etabli:{ s:'floor', x:24, y:58 },
      balance:{ s:'floor', x:46, y:44 }, bocaux:{ s:'wb', x:28, y:50 },
      cuivres:{ s:'wb', x:62, y:46 }, levain:{ s:'floor', x:58, y:40 },
      herbes:{ s:'wb', x:14, y:16 }, cocotte:{ s:'floor', x:66, y:54, cw:0 },
      legumes:{ s:'floor', x:26, y:84 }, monstera:{ s:'floor', x:84, y:62 },
      tablier:{ s:'wl', x:68, y:44, cw:4 }, jardiniere:{ s:'wb', x:44, y:60 }
    } }
];
