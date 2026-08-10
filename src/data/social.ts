export const FRIENDS: [string, string][] = [
  ['lea','Léa Fontaine'], ['karim','Karim Belhadj'],
  ['ines','Inès Moreau'], ['nina','Nina Costa']
];

export type FriendRow = [string, string, string, number, number];

/** Progression des amis (comparaison simple, sans ligue ni classement mondial). */
export const FRIENDS_RANK: FriendRow[] = [
  ['moi','Moi','—',0,0],['lea','Léa Fontaine','ARGENT I',1402,88],['karim','Karim Belhadj','OR III',1361,81],
  ['ines','Inès Moreau','ARGENT III',1288,76],['nina','Nina Costa','BRONZE I',1180,72],['tom','Tom Lefèvre','BRONZE I',1098,69]
];

export const INVITS = [
  { who:'karim', name:'Karim Belhadj', sub:'Course · 5 km ce week-end', skill:'course' },
  { who:'tom', name:'Tom Lefèvre', sub:'Couture · boutonnière machine', skill:'couture' },
  { who:'rina', name:'Rina Osei', sub:'Photo · série de 3 portraits', skill:'photo' }
];

export const CARDS: Record<string, [string, string, string, string]> = {
  lea:['ARG I','1 402','18 j','Couture · doublure et cols'],
  karim:['OR III','1 361','9 j','Course · fractionné du mardi'],
  ines:['ARG III','1 288','24 j','Cuisine · pains au levain'],
  nina:['BRZ I','1 204','5 j','Photo · portraits à l’ombre'],
  tom:['BRZ II','1 118','7 j','Couture · boutonnières'],
  rina:['ARG IV','1 296','11 j','Photo · séries de rue'],
  camille:['ARG II','1 418','12 j','Couture, course, photo']
};

export const RANK_WORDS = ['1re','2e','3e','4e','5e','6e'];

export type FeedPost = {
  id: string; who: string; name: string; when: string; tag: string; tagC: string;
  text: string; px: string; likes: number; liked: boolean;
  comments: { who: string; name: string; text: string }[];
};

export const FEED0: FeedPost[] = [
  { id:'f1', who:'lea', name:'Léa Fontaine', when:'il y a 40 min', tag:'COUTURE', tagC:'#FF4D3D',
    text:'Doublure posée sans un faux pli. Il m’a fallu trois essais et un thé froid.', px:'+45 PX',
    likes:12, liked:false, comments:[{ who:'karim', name:'Karim', text:'La photo du dessous, please.' }] },
  { id:'f2', who:'karim', name:'Karim Belhadj', when:'il y a 2 h', tag:'COURSE', tagC:'#A9D94B',
    text:'Fractionné du mardi tenu jusqu’au bout. Neuvième jour d’affilée.', px:'+35 PX',
    likes:8, liked:false, comments:[] },
  { id:'f3', who:'ines', name:'Inès Moreau', when:'hier', tag:'CUISINE', tagC:'#FFC24B',
    text:'Levain enfin stable. Deux pains, une croûte qui claque.', px:'+60 PX',
    likes:21, liked:false, comments:[{ who:'nina', name:'Nina', text:'Recette ?' }, { who:'lea', name:'Léa', text:'Bravo !' }] }
];

export const LOG0: [string, string, string, string][] = [];
