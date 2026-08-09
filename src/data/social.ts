export const FRIENDS: [string, string][] = [
  ['camille','Camille (toi)'], ['lea','Léa Fontaine'], ['karim','Karim Belhadj'],
  ['ines','Inès Moreau'], ['nina','Nina Costa']
];

export type LeagueRow = [string, string, string, number, number];

export const LEAGUES: Record<string, LeagueRow[]> = {
  amis: [['camille','Camille (toi)','ARG II',1418,92],['lea','Léa Fontaine','ARG I',1402,88],['karim','Karim Belhadj','OR III',1361,81],['ines','Inès Moreau','ARG III',1288,76],['nina','Nina Costa','BRZ I',1180,72],['tom','Tom Lefèvre','BRZ I',1098,69]],
  locale: [['lea','Léa Fontaine','ARG I',1402,94],['camille','Camille (toi)','ARG II',1418,92],['hugo','Hugo Meyer','OR I',1520,90],['rina','Rina Osei','ARG II',1415,84],['sofia','Sofia Bianchi','ARG I',1390,79],['alex','Alex Duval','BRZ II',1210,71]],
  monde: [['hugo','Hugo Meyer','OR I',1520,99],['sofia','Sofia Bianchi','ARG I',1390,97],['rina','Rina Osei','ARG II',1415,95],['camille','Camille (toi)','ARG II',1418,92],['alex','Alex Duval','BRZ II',1210,88],['tom','Tom Lefèvre','BRZ I',1098,85]]
};

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
  { id:'f1', who:'lea', name:'Léa Fontaine', when:'il y a 40 min', tag:'COUTURE', tagC:'#FF5C42',
    text:'Doublure posée sans un faux pli. Il m’a fallu trois essais et un thé froid.', px:'+45 PX',
    likes:12, liked:false, comments:[{ who:'karim', name:'Karim', text:'La photo du dessous, please.' }] },
  { id:'f2', who:'karim', name:'Karim Belhadj', when:'il y a 2 h', tag:'COURSE', tagC:'#6C63FF',
    text:'Fractionné du mardi tenu jusqu’au bout. Neuvième jour d’affilée.', px:'+35 PX',
    likes:8, liked:false, comments:[] },
  { id:'f3', who:'ines', name:'Inès Moreau', when:'hier', tag:'CUISINE', tagC:'#FFC93C',
    text:'Levain enfin stable. Deux pains, une croûte qui claque.', px:'+60 PX',
    likes:21, liked:false, comments:[{ who:'nina', name:'Nina', text:'Recette ?' }, { who:'lea', name:'Léa', text:'Bravo !' }] }
];

export const LOG0: [string, string, string, string][] = [
  ['Doublure sans faux pli','COUTURE','+45 PX','hier · 21 h 10'],
  ['Fractionné 30/30','COURSE','+35 PX','hier · 07 h 40'],
  ['Duel gagné contre Karim','DÉFI','+12 LP','dimanche'],
  ['Série de 3 images','PHOTO','+35 PX','dimanche'],
  ['Ranger mon appart','PERSO','+12 ⚡','samedi']
];
