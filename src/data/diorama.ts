/** Diorama papier découpé : chaque objet est une pile de formes CSS (portées du prototype). */
export const PAPER = { cream:'#F4E7D3', tan:'#E3CBA9', caramel:'#C99A6E', brown:'#8C5A3C', terra:'#D9694B', sage:'#7E8F6B', slate:'#4A5A6A', off:'#EFE0C8' };

export const DIO_RARE: [string, string][] = [['Commun','#D9CFC0'],['Peu commun','#9DBD93'],['Rare','#7FA9D9'],['Légendaire','#E0A85C']];

export const DIO_WALLS: [string, string, string][] = [
  ['Écru rayé','#EFE2CD','repeating-linear-gradient(90deg,rgba(140,90,60,.09) 0 2px,transparent 2px 13px)'],
  ['Terracotta','#E8C3AC','radial-gradient(circle at 6px 6px,rgba(140,90,60,.14) 1.6px,transparent 2px) 0 0/16px 16px'],
  ['Sauge','#D7E0C9','repeating-linear-gradient(0deg,rgba(74,90,60,.08) 0 1px,transparent 1px 12px)'],
  ['Nuit douce','#C8C5DE','radial-gradient(circle at 8px 8px,rgba(60,55,90,.12) 1.8px,transparent 2px) 0 0/18px 18px']
];

export const DIO_FLOORS: [string, string, string][] = [
  ['Chêne clair','#DEC49E','#C9A87E'], ['Noyer','#B98A63','#9C6F4B'],
  ['Lin gris','#D2CCC0','#B9B1A2'], ['Damier','#E7DAC3','#C9B694']
];

export const DIO_LIGHTS: [string, string][] = [
  ['Après-midi','radial-gradient(120% 90% at 18% 6%,rgba(255,206,130,.34),transparent 62%)'],
  ['Matin clair','radial-gradient(120% 90% at 78% 4%,rgba(215,235,255,.34),transparent 60%)'],
  ['Fin de jour','radial-gradient(120% 95% at 50% 100%,rgba(150,110,190,.3),transparent 62%)']
];

export const DIO_SHAPES: Record<string, string[]> = {
  machine: [
    'left:0;top:42px;width:72px;height:14px;border-radius:5px;background:#C99A6E',
    'left:6px;top:16px;width:52px;height:28px;border-radius:9px 9px 4px 4px;background:#F4E7D3',
    'left:8px;top:6px;width:12px;height:14px;border-radius:4px;background:#EFE0C8',
    'left:8px;top:2px;width:44px;height:8px;border-radius:4px;background:#EFE0C8',
    'left:44px;top:20px;width:18px;height:18px;border-radius:50%;background:#D9694B',
    'left:20px;top:34px;width:26px;height:4px;border-radius:2px;background:#8C5A3C'
  ],
  mannequin: [
    'left:18px;top:44px;width:6px;height:26px;border-radius:3px;background:#8C5A3C',
    'left:8px;top:68px;width:28px;height:6px;border-radius:3px;background:#C99A6E',
    'left:6px;top:8px;width:32px;height:40px;border-radius:16px 16px 11px 11px;background:#F4E7D3',
    'left:16px;top:0;width:12px;height:12px;border-radius:6px;background:#E3CBA9',
    'left:6px;top:26px;width:32px;height:4px;background:#D9694B'
  ],
  tissus: [
    'left:0;top:34px;width:80px;height:20px;border-radius:6px;background:#E3CBA9',
    'left:4px;top:16px;width:34px;height:18px;border-radius:9px;background:#D9694B',
    'left:40px;top:12px;width:34px;height:22px;border-radius:11px;background:#7E8F6B',
    'left:14px;top:0;width:34px;height:16px;border-radius:8px;background:#4A5A6A'
  ],
  lampe: [
    'left:12px;top:64px;width:24px;height:8px;border-radius:4px;background:#C99A6E',
    'left:22px;top:22px;width:4px;height:44px;background:#8C5A3C',
    'left:22px;top:22px;width:22px;height:4px;background:#8C5A3C;transform:rotate(-26deg);transform-origin:left center',
    'left:30px;top:2px;width:18px;height:15px;border-radius:4px 4px 9px 9px;background:#EFE0C8',
    'left:29px;top:15px;width:20px;height:10px;border-radius:50%;background:rgba(255,214,138,.55)'
  ],
  etagere: [
    'left:0;top:0;width:68px;height:60px;border-radius:6px;background:#E3CBA9',
    'left:4px;top:4px;width:60px;height:23px;border-radius:3px;background:#F4E7D3',
    'left:4px;top:33px;width:60px;height:23px;border-radius:3px;background:#F4E7D3',
    'left:9px;top:8px;width:14px;height:14px;border-radius:50%;background:#D9694B',
    'left:27px;top:8px;width:14px;height:14px;border-radius:50%;background:#7E8F6B',
    'left:45px;top:37px;width:14px;height:14px;border-radius:50%;background:#4A5A6A'
  ],
  tapis: [
    'left:0;top:6px;width:112px;height:38px;border-radius:50%;background:#7E8F6B',
    'left:12px;top:12px;width:88px;height:26px;border-radius:50%;border:2px solid rgba(244,231,211,.75)',
    'left:34px;top:19px;width:44px;height:12px;border-radius:50%;background:#E3CBA9'
  ],
  chrono: [
    'left:0;top:6px;width:38px;height:34px;border-radius:50%;background:#E3CBA9',
    'left:5px;top:11px;width:28px;height:24px;border-radius:50%;background:#F4E7D3',
    'left:15px;top:0;width:8px;height:8px;border-radius:3px;background:#8C5A3C',
    'left:18px;top:16px;width:2px;height:10px;background:#D9694B'
  ],
  trepied: [
    'left:23px;top:14px;width:4px;height:44px;background:#8C5A3C',
    'left:8px;top:26px;width:4px;height:40px;background:#8C5A3C;transform:rotate(18deg)',
    'left:38px;top:26px;width:4px;height:40px;background:#8C5A3C;transform:rotate(-18deg)',
    'left:11px;top:4px;width:28px;height:12px;border-radius:4px;background:#4A5A6A',
    'left:33px;top:6px;width:12px;height:8px;border-radius:3px;background:#F4E7D3'
  ],
  balance: [
    'left:0;top:14px;width:56px;height:22px;border-radius:7px;background:#F4E7D3',
    'left:6px;top:0;width:44px;height:14px;border-radius:5px;background:#E3CBA9',
    'left:34px;top:20px;width:16px;height:9px;border-radius:3px;background:#4A5A6A'
  ],
  secateur: [
    'left:6px;top:2px;width:5px;height:30px;border-radius:3px;background:#E3CBA9;transform:rotate(20deg)',
    'left:28px;top:2px;width:5px;height:30px;border-radius:3px;background:#E3CBA9;transform:rotate(-20deg)',
    'left:4px;top:28px;width:16px;height:14px;border-radius:7px;background:#D9694B',
    'left:26px;top:28px;width:16px;height:14px;border-radius:7px;background:#D9694B',
    'left:18px;top:20px;width:8px;height:8px;border-radius:50%;background:#8C5A3C'
  ],
  carnet: [
    'left:0;top:4px;width:50px;height:34px;border-radius:4px;background:#F4E7D3;transform:rotate(-4deg)',
    'left:6px;top:12px;width:32px;height:3px;background:#C99A6E;transform:rotate(-4deg)',
    'left:6px;top:20px;width:26px;height:3px;background:#C99A6E;transform:rotate(-4deg)',
    'left:34px;top:0;width:14px;height:12px;border-radius:3px;background:#D9694B;transform:rotate(-4deg)'
  ]
};

export type DioObj = {
  id: string; name: string; sk: string; date: string; rare: number;
  cat: 'atelier' | 'quest'; ai?: number; w: number; h: number; x: number; y: number;
};

export const DIO_OBJ: DioObj[] = [
  { id:'machine', name:'Machine à coudre', sk:'couture', date:'12 mars', rare:2, cat:'atelier', ai:0, w:72, h:56, x:27, y:84 },
  { id:'mannequin', name:'Mannequin de tailleur', sk:'couture', date:'2 avril', rare:3, cat:'atelier', ai:1, w:44, h:74, x:88, y:93 },
  { id:'tissus', name:'Mur de tissus', sk:'couture', date:'19 avril', rare:1, cat:'atelier', ai:2, w:80, h:54, x:74, y:52 },
  { id:'lampe', name:'Lampe d’architecte', sk:'couture', date:'—', rare:1, cat:'atelier', ai:3, w:48, h:72, x:8, y:80 },
  { id:'etagere', name:'Étagère à bobines', sk:'couture', date:'—', rare:2, cat:'atelier', ai:4, w:68, h:60, x:38, y:48 },
  { id:'tapis', name:'Tapis chiné', sk:'couture', date:'—', rare:0, cat:'atelier', ai:5, w:112, h:44, x:50, y:99 },
  { id:'chrono', name:'Chrono de poche', sk:'course', date:'28 mars', rare:1, cat:'quest', w:38, h:40, x:66, y:78 },
  { id:'trepied', name:'Trépied pliant', sk:'photo', date:'5 avril', rare:1, cat:'quest', w:50, h:66, x:15, y:97 },
  { id:'balance', name:'Balance de précision', sk:'cuisine', date:'21 mars', rare:2, cat:'quest', w:56, h:36, x:52, y:72 },
  { id:'secateur', name:'Sécateur laiton', sk:'jardin', date:'16 avril', rare:1, cat:'quest', w:48, h:46, x:93, y:57 },
  { id:'carnet', name:'Carnet à listes', sk:'perso', date:'2 mai', rare:0, cat:'quest', w:50, h:38, x:44, y:97 }
];
