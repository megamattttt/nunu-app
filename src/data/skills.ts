export type Skill = {
  id: string; name: string; soft: string; short: string; c: string; txt: string;
  total: number; title: string; elo: string | null; next: string | null; cap: number; lvl: number; solo?: boolean;
};

export const SKILLS: Skill[] = [
  { id:'couture', name:'COUTURE', soft:'la couture', short:'CO', c:'#E2685A', txt:'#FFFFFF', total:53, title:'Petite main affirmée', elo:'ARG II', next:'OR III', cap:1700, lvl:14 },
  { id:'course', name:'COURSE', soft:'la course', short:'CR', c:'#B9DE64', txt:'#0A0A0C', total:31, title:'Coureuse régulière', elo:'BRZ I', next:'ARG III', cap:1000, lvl:6 },
  { id:'photo', name:'PHOTO', soft:'la photo', short:'PH', c:'#DED6C6', txt:'#0A0A0C', total:24, title:'Œil curieux', elo:'FER III', next:'FER II', cap:500, lvl:2 },
  { id:'cuisine', name:'CUISINE', soft:'la cuisine', short:'CU', c:'#E8B863', txt:'#0A0A0C', total:40, title:'Bonne pâte', elo:'BRZ III', next:'BRZ II', cap:800, lvl:8 },
  { id:'jardin', name:'JARDINAGE', soft:'le jardinage', short:'JA', c:'#93C169', txt:'#0A0A0C', total:22, title:'Main verte', elo:'FER I', next:'BRZ III', cap:400, lvl:3 },
  { id:'perso', name:'PERSO', soft:'ton quotidien', short:'PE', c:'#EDE9E1', txt:'#0A0A0C', total:18, title:'Journée tenue', elo:null, next:null, cap:600, lvl:5, solo:true }
];

export const skillById = (id: string) => SKILLS.find((s) => s.id === id) || SKILLS[0];

/** Paliers du plateau : [nom, PX]. L'index vaut le niveau du palier. */
export const BOARDS: Record<string, [string, number][]> = {
  couture: [['Point d’arrêt propre',20],['Ourlet invisible',25],['Fermeture éclair invisible',30],['Boutonnière machine',35],['Doublure sans faux pli',45],['Chemise complète',120],['Patron sur mesure',150]],
  course: [['Sortie de 20 minutes',15],['5 km sans marcher',30],['Fractionné 30/30',35],['Côtes courtes',40],['10 km continus',90]],
  photo: [['Régler en manuel',20],['Portrait à l’ombre',25],['Série de 3 images',35],['Lumière rasante',45],['Tirage papier',70]],
  cuisine: [['Pâte brisée maison',20],['Découpe régulière',25],['Sauce émulsionnée',35],['Pain au levain',60],['Menu 3 services',110]],
  jardin: [['Semis en godet',15],['Bouture réussie',25],['Compost équilibré',35],['Taille de printemps',45],['Potager en carrés',80]],
  perso: [['Ranger mon appart',15],['Finir le livre',20],['Devoirs à jour',15],['Fleurs pour ma mère',25]]
};

/** Paliers majeurs (mise en scène renforcée + récompense objet). */
export const MAJOR: Record<string, number[]> = {
  couture: [5, 6], course: [4], photo: [4], cuisine: [3, 4], jardin: [4], perso: [3]
};

export const DONE0: Record<string, number> = { couture:2, course:1, photo:1, cuisine:2, jardin:1, perso:1 };

export const STEPS: Record<string, string[]> = {
  couture: ['Préparer le tissu et repasser','Bâtir à la main','Piquer la version finale','Vérifier l’endroit à la lumière'],
  course: ['Échauffement 8 minutes','Bloc principal','Retour au calme','Noter les sensations'],
  photo: ['Choisir la lumière','Cadrer et régler','Faire 12 prises','Sélectionner la meilleure'],
  cuisine: ['Peser les ingrédients','Réaliser la base','Cuisson et contrôle','Goûter et ajuster'],
  jardin: ['Préparer le substrat','Réaliser le geste','Arroser et étiqueter','Photographier le résultat'],
  perso: ['Sortir la tâche de la tête','La découper en deux gestes','Faire le premier geste','Cocher et souffler']
};

export const OBJ: Record<string, string> = {
  couture:'Ciseaux cranteurs', course:'Chrono de poche', photo:'Trépied pliant',
  cuisine:'Balance de précision', jardin:'Sécateur laiton', perso:'Carnet à listes'
};

export const TITLES: Record<string, [string, string][]> = {
  couture: [['Première maille','Valider 1 quête'],['Petite main affirmée','10 quêtes couture'],['Faiseuse de patrons','Débloquer Patronage'],['Atelier complet','53 quêtes']],
  course: [['Premier kilomètre','Valider 1 quête'],['Coureuse régulière','7 sorties'],['Fractionneuse','Bloc 30/30'],['Dix bornes','10 km continus']],
  photo: [['Premier déclic','Valider 1 quête'],['Œil curieux','4 quêtes photo'],['Série cohérente','3 images liées'],['Tireuse','Premier tirage']],
  cuisine: [['Premier service','Valider 1 quête'],['Bonne pâte','8 quêtes cuisine'],['Sauce sûre','Émulsion réussie'],['Chef de maison','Menu complet']],
  jardin: [['Première pousse','Valider 1 quête'],['Main verte','5 quêtes jardin'],['Bouturière','3 boutures'],['Potager vivant','Carrés plantés']],
  perso: [['Première case cochée','Cocher 1 tâche'],['Journée tenue','5 tâches en un jour'],['Semaine claire','7 jours d’affilée'],['Tête légère','30 tâches au total']]
};

export const BADGES: Record<string, [string, string][]> = {
  couture: [['Régularité','R'],['Finitions','F'],['Machine','M'],['Patron','P'],['Duel gagné','D'],['Série 10 j','S']],
  course: [['Souffle','S'],['Cadence','C'],['Côtes','K'],['Distance','D'],['Matin','M'],['Série 20 j','20']],
  photo: [['Manuel','M'],['Portrait','P'],['Lumière','L'],['Série','S'],['Tirage','T'],['Curiosité','C']],
  cuisine: [['Pâte','P'],['Découpe','D'],['Émulsion','É'],['Levain','L'],['Service','S'],['Partage','∞']],
  jardin: [['Semis','S'],['Bouture','B'],['Compost','C'],['Taille','T'],['Récolte','R'],['Patience','P']],
  perso: [['Rangement','R'],['Lecture','L'],['Devoirs','D'],['Attention','A'],['Courses','C'],['Régularité','∞']]
};

export const BADGE_C = ['#E2685A','#E8B863','#B9DE64','#5CBFAE','#6FA5D8','#DED6C6'];

export const PERSO_TASKS: [string, string][] = [
  ['Ranger mon appart','+12 ⚡'], ['Sortir le vélo','+8 ⚡'], ['Appeler ma sœur','+6 ⚡'],
  ['Boire 1,5 L d’eau','+5 ⚡'], ['Dix minutes de lecture','+7 ⚡']
];
