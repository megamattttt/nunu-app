/** Banque de questions des duels éclair. [question, options, index de la bonne réponse] */
export const QBANK: Record<string, [string, string[], number][]> = {
  couture: [
    ['Quel point sert à finir un ourlet invisible ?',['Point de bourdon','Point glissé','Point arrière','Surjet'],1],
    ['À quoi sert le droit-fil ?',['Décorer','Aligner la coupe sur le tissage','Éviter le repassage','Renforcer'],1],
    ['Que fait une aiguille jersey ?',['Coupe','Pointe boule qui écarte les mailles','Perce le cuir','Double piqûre'],1],
    ['Que signifie « bâtir » ?',['Coudre définitivement','Assembler provisoirement','Repasser','Surfiler'],1]
  ],
  course: [
    ['Un 30/30, c’est…',['30 min lent, 30 rapide','30 s rapide, 30 s lent','30 km','3 × 30 min'],1],
    ['La zone 2, c’est…',['Sprint maximal','Endurance conversationnelle','Seuil','Récupération totale'],1],
    ['La cadence se mesure en…',['km/h','Pas par minute','Watts','Battements'],1],
    ['Après une sortie longue, on privilégie…',['Un sprint','Un retour au calme','Un bain glacé obligatoire','Rien'],1]
  ],
  photo: [
    ['Grande ouverture veut dire…',['f/16','f/1.8','Vitesse lente','ISO haut'],1],
    ['Pour figer un mouvement, on augmente…',['L’ISO','La vitesse d’obturation','L’ouverture','La focale'],1],
    ['La lumière rasante arrive…',['À midi','En début et fin de journée','Par flash direct','Au zénith'],1],
    ['Le RAW garde…',['Moins d’infos','Toute la donnée du capteur','Un JPEG compressé','Les métadonnées seules'],1]
  ],
  cuisine: [
    ['Une émulsion tient grâce à…',['La chaleur seule','Un émulsifiant comme le jaune','Le sel','Le froid'],1],
    ['Le levain est une culture de…',['Levure sèche','Levures et bactéries lactiques','Bicarbonate','Enzymes seules'],1],
    ['Saisir une viande sert à…',['La cuire à cœur','Créer la réaction de Maillard','Réduire le gras','La saler'],1],
    ['Une pâte brisée demande un beurre…',['Fondu','Froid en morceaux','Mou et fouetté','Clarifié'],1]
  ],
  jardin: [
    ['Une bouture prend mieux avec…',['Plein soleil direct','Chaleur douce et humidité','Sol sec','Engrais fort'],1],
    ['Le compost a besoin de…',['Que du vert','Un équilibre carbone/azote','Que du carton','Eau stagnante'],1],
    ['On taille les arbres fruitiers…',['En pleine sève d’été','Hors gel, au repos','Sous la pluie','Jamais'],1],
    ['Le paillage sert surtout à…',['Décorer','Garder l’humidité et limiter les herbes','Fertiliser vite','Aérer'],1]
  ],
  perso: [
    ['Une tâche qui traîne se règle mieux…',['En y pensant souvent','En la découpant en deux gestes','En la reportant','En la notant dix fois'],1],
    ['La règle des deux minutes dit…',['Tout reporter','Faire tout de suite ce qui prend deux minutes','Ne rien planifier','Tout déléguer'],1],
    ['Une série se tient surtout par…',['La motivation','Un rendez-vous fixe','La chance','Les rappels'],1],
    ['Une journée tenue, c’est…',['Tout finir','Cocher l’essentiel','Ne rien faire','Faire des listes'],1]
  ]
};

export const SHOP = {
  acc: [['Lunettes rondes',120,'glasses'],['Casquette d’atelier',180,'cap'],['Bandeau lime',150,'band']] as [string, number, string][],
  atelier: [['Machine à coudre',300],['Mannequin de tailleur',420],['Mur de tissus',260],['Lampe d’architecte',180],['Étagère à bobines',220],['Tapis chiné',140]] as [string, number][],
  cadre: [['Cadre lime',200],['Cadre doré',240],['Cadre coutures',480],['Cadre corail',900]] as [string, number][]
};

export const SHOP_CATS: [string, string][] = [['acc','ACCESSOIRES'],['atelier','ATELIER'],['cadre','CADRES']];
export const SHOP_INTRO: Record<string, string> = {
  acc: 'Des pièces qui s’ajoutent directement à ton avatar.',
  atelier: 'Du mobilier posé dans ton diorama papier découpé.',
  cadre: 'Le cadre de ta carte de profil et de ta bannière.'
};
export const CADRE_C = ['#C6F24E','#FFC24B','#FF4D3D','#E6DFD1'];
export const SHOP_ACC_PATCH: Record<string, Record<string, number>> = { glasses:{ glasses:1 }, cap:{ hat:3 }, band:{ hat:10 } };
export const SHOP_FRAME_IX = [1, 3, 6, 7];
