import { diffOfPx, type Difficulty } from './quests';

/**
 * Catalogue complet des quêtes, par compétence.
 * Remplace la fusion BOARDS (plateau séquentiel) + DISCOVER (pioche) + MAJOR (index).
 * Plus aucun verrouillage : tout est visible et ajoutable à tout moment.
 */
export type CatalogQuest = {
  /** Identifiant stable : 'couture.ourlet-invisible'. Sert de clé partout (actives, validées). */
  id: string;
  name: string;
  px: number;
  diff: Difficulty;
  description: string;
  /** Ancien palier majeur : mise en scène renforcée, récompense objet, preuve obligatoire. */
  major?: boolean;
  /** Thèmes — carburant du moteur de suggestion (continuité et anti-répétition). */
  tags?: string[];
  /** Enchaînements logiques : ids qui gagnent des points de score une fois cette quête validée. */
  next?: string[];
};

/** Nombre maximum de quêtes actives simultanées, par compétence. */
export const MAX_ACTIVE_QUESTS = 5;

const q = (
  id: string, name: string, px: number, description: string,
  tags: string[] = [], extra: Partial<CatalogQuest> = {}
): CatalogQuest => ({ id, name, px, diff: diffOfPx(px, extra.major), description, tags, ...extra });

/* ------------------------------------------------------------------ */
/* COUTURE — lot 1 (107 quêtes)                                       */
/* ------------------------------------------------------------------ */

const couture: CatalogQuest[] = [
  /* --- Facile : gestes de base, entretien, petites réparations --- */
  q('couture.enfiler-aiguille', 'Enfiler l’aiguille', 8, 'Fil coupé net, passé du premier coup.', ['main']),
  q('couture.point-droit-regulier', 'Point droit régulier', 10, 'Deux mètres de piqûre sans quitter le guide.', ['machine'], { next: ['couture.point-arret-propre', 'couture.pique-nervure'] }),
  q('couture.point-arret-propre', 'Point d’arrêt propre', 20, 'Début et fin bloqués, sans paquet de fil au dos.', ['machine', 'finition'], { next: ['couture.ourlet-invisible', 'couture.surfilage-zigzag'] }),
  q('couture.canette-sans-bourrage', 'Canette sans bourrage', 12, 'Bobiner et enfiler sans un nœud dessous.', ['machine']),
  q('couture.tension-du-fil', 'Tension du fil réglée', 15, 'Même point dessus et dessous, vérifié sur une chute.', ['machine']),
  q('couture.changer-aiguille', 'Changer l’aiguille', 8, 'Aiguille neuve, taille choisie pour le tissu du moment.', ['machine', 'atelier']),
  q('couture.surfilage-zigzag', 'Surfilage au zigzag', 15, 'Un bord net qui ne s’effiloche plus au lavage.', ['finition'], { next: ['couture.couture-anglaise', 'couture.surjeteuse-reglee'] }),
  q('couture.bouton-quatre-trous', 'Bouton quatre trous', 12, 'Deux croix identiques, avec le jeu d’une épaisseur.', ['main', 'reparation']),
  q('couture.bouton-a-queue', 'Bouton à queue', 15, 'Une tige de fil qui laisse respirer le boutonnage.', ['main']),
  q('couture.pression-posee', 'Pression posée', 15, 'Deux parties alignées, clic franc à la fermeture.', ['finition']),
  q('couture.ourlet-simple-repasse', 'Ourlet simple repassé', 15, 'Deux rentrés égaux, piqués à un demi-centimètre.', ['ourlet'], { next: ['couture.ourlet-invisible'] }),
  q('couture.ourlet-point-glisse', 'Ourlet au point glissé', 20, 'Invisible sur l’endroit, souple sous les doigts.', ['ourlet', 'main']),
  q('couture.raccourcir-un-pantalon', 'Raccourcir un pantalon', 20, 'Même longueur aux deux jambes, ourlet d’origine gardé.', ['ourlet', 'reparation']),
  q('couture.recoudre-une-couture', 'Recoudre une couture ouverte', 12, 'La piqûre reprend deux centimètres avant le trou.', ['reparation']),
  q('couture.point-de-bati', 'Point de bâti', 10, 'Grands points réguliers, retirés sans rien accrocher.', ['main']),
  q('couture.epingler-droit-fil', 'Épingler dans le droit-fil', 12, 'Épingles perpendiculaires, tissu posé bien à plat.', ['coupe']),
  q('couture.reperer-endroit-tissu', 'Repérer l’endroit du tissu', 8, 'À la lumière rasante, avant le premier coup de ciseaux.', ['tissu']),
  q('couture.prelaver-le-coupon', 'Prélaver le coupon', 10, 'Le retrait est passé avant la coupe, séché à plat.', ['tissu']),
  q('couture.repasser-les-coutures', 'Repasser les coutures', 12, 'Chaque couture ouverte au fer avant la suivante.', ['repassage', 'finition']),
  q('couture.pattemouille', 'Pattemouille', 15, 'Un pli marqué sur la laine sans la lustrer.', ['repassage']),
  q('couture.decoupe-aux-ciseaux', 'Découpe aux ciseaux longs', 12, 'Un trait continu, lame posée sur la table.', ['coupe']),
  q('couture.cranter-un-arrondi', 'Cranter un arrondi', 15, 'Des crans réguliers qui laissent le bord à plat.', ['finition']),
  q('couture.degarnir-une-couture', 'Dégarnir une couture', 15, 'Épaisseurs décalées, plus de bourrelet au bord.', ['finition']),
  q('couture.pique-nervure', 'Piqûre nervure', 18, 'À deux millimètres du bord, sans une ondulation.', ['machine', 'finition']),
  q('couture.surpiqure-ton-sur-ton', 'Surpiqûre ton sur ton', 18, 'Une ligne droite qui ne se voit qu’au toucher.', ['machine']),
  q('couture.coudre-une-etiquette', 'Coudre une étiquette', 10, 'Nom lisible, quatre angles rentrés.', ['main']),
  q('couture.reprise-sur-maille', 'Reprise sur maille', 20, 'Une échelle de tricot remontée au crochet.', ['reparation']),
  q('couture.rentraire-un-accroc', 'Rentraire un accroc', 20, 'Les fils du tissu remis dans leur alignement.', ['reparation']),
  q('couture.rapiecage-visible', 'Rapiéçage visible', 18, 'Un carré assumé, cousu droit, coins arrêtés.', ['reparation']),
  q('couture.elastique-en-ceinture', 'Élastique en ceinture', 20, 'Tendu régulièrement, sans vrille au repos.', ['finition']),
  q('couture.couper-un-biais', 'Couper un biais', 18, 'Des bandes à quarante-cinq degrés, largeur constante.', ['coupe'], { next: ['couture.poser-un-biais'] }),
  q('couture.ranger-la-boite', 'Ranger la boîte à couture', 10, 'Fils par teinte, aiguilles piquées, chutes triées.', ['atelier']),
  q('couture.huiler-la-machine', 'Huiler la machine', 12, 'Peluches ôtées, une goutte au bon endroit.', ['machine', 'atelier']),
  q('couture.carnet-essais-points', 'Carnet d’essais de points', 15, 'Dix points cousus, chacun noté avec son réglage.', ['atelier']),
  q('couture.prendre-ses-mesures', 'Prendre ses mesures', 15, 'Sept mesures notées, mètre bien à plat.', ['patron'], { next: ['couture.decalquer-un-patron', 'couture.ajuster-un-patron'] }),
  q('couture.decalquer-un-patron', 'Décalquer un patron', 20, 'Tous les repères reportés, taille choisie sans hésiter.', ['patron']),
  q('couture.chouchou', 'Chouchou', 15, 'Un tube retourné, élastique noué bien à plat.', ['projet']),

  /* --- Moyen : assemblage, finitions courantes, premiers projets --- */
  q('couture.ourlet-invisible', 'Ourlet invisible', 25, 'Invisible sur l’endroit, sur toute la circonférence.', ['ourlet'], { next: ['couture.ourlet-robe-en-biais'] }),
  q('couture.fermeture-invisible', 'Fermeture éclair invisible', 30, 'Aucune dent visible, glissière fluide de bout en bout.', ['fermeture'], { next: ['couture.jupe-droite-doublee', 'couture.robe-cintree'] }),
  q('couture.boutonniere-machine', 'Boutonnière machine', 35, 'Quatre boutonnières identiques, ouvertes au découd-vite.', ['machine', 'finition'], { next: ['couture.boutonniere-main', 'couture.chemisier-double'] }),
  q('couture.doublure-sans-faux-pli', 'Doublure sans faux pli', 45, 'Une doublure qui tombe droit, avec son pli d’aisance.', ['doublure'], { next: ['couture.doublure-montee-au-sac'] }),
  q('couture.passant-de-ceinture', 'Passant de ceinture', 40, 'Trois passants réguliers, cousus dans le droit-fil.', ['finition']),
  q('couture.poche-plaquee-invisible', 'Poche plaquée invisible', 35, 'Une poche posée d’aplomb, coutures cachées.', ['poche'], { next: ['couture.poche-passepoilee'] }),
  q('couture.reprise-de-jean', 'Reprise de jean', 30, 'Réparer un genou usé sans que ça se voie.', ['reparation']),
  q('couture.couture-anglaise', 'Couture anglaise', 35, 'Deux piqûres, aucun bord brut à l’intérieur.', ['finition'], { next: ['couture.veste-non-doublee'] }),
  q('couture.couture-rabattue', 'Couture rabattue', 35, 'Une couture plate façon jean, double piqûre parallèle.', ['finition'], { next: ['couture.jean-brut-complet'] }),
  q('couture.fermeture-simple-posee', 'Fermeture simple posée', 28, 'Une glissière droite, arrêtée en haut et en bas.', ['fermeture']),
  q('couture.fermeture-separable', 'Fermeture séparable', 40, 'Un blouson qui ferme sans décaler les deux bords.', ['fermeture']),
  q('couture.ceinture-a-coulisse', 'Ceinture à coulisse', 30, 'Un cordon qui circule sans se retourner.', ['finition']),
  q('couture.taille-elastiquee', 'Taille élastiquée', 30, 'Trois coulisses régulières, fronces réparties.', ['finition']),
  q('couture.pince-poitrine', 'Pince poitrine', 30, 'Une pince qui meurt en pointe, sans capiton.', ['coupe']),
  q('couture.pinces-dos', 'Pinces de dos', 28, 'Deux pinces symétriques, repassées vers le centre.', ['coupe']),
  q('couture.fronces-regulieres', 'Fronces régulières', 30, 'Deux fils tirés, fronces réparties au millimètre.', ['coupe']),
  q('couture.plis-plats', 'Plis plats', 35, 'Cinq plis de même profondeur, marqués au fer.', ['coupe']),
  q('couture.pli-creux', 'Pli creux', 32, 'Un pli creux centré, aligné sur la couture du milieu.', ['coupe']),
  q('couture.parementure-encolure', 'Parementure d’encolure', 35, 'Une encolure nette, tenue par une sous-piqûre.', ['col', 'finition'], { next: ['couture.col-mao', 'couture.col-claudine-double'] }),
  q('couture.col-mao', 'Col mao', 40, 'Un col droit qui tient sans plisser au montage.', ['col']),
  q('couture.poser-un-biais', 'Poser un biais', 30, 'Un biais qui suit l’arrondi sans tirer.', ['finition']),
  q('couture.poche-italienne', 'Poche italienne', 40, 'Une entrée de poche qui ne bâille pas.', ['poche']),
  q('couture.poche-passepoilee', 'Poche passepoilée', 50, 'Deux lèvres de même largeur, angles nets.', ['poche'], { next: ['couture.poche-passepoilee-rabat'] }),
  q('couture.poche-cargo', 'Poche cargo', 35, 'Un soufflet et un rabat, piqûres arrêtées.', ['poche']),
  q('couture.manche-montee', 'Manche montée', 45, 'Une tête de manche sans faux pli, embu réparti.', ['montage'], { next: ['couture.patron-de-manche', 'couture.chemisier-double'] }),
  q('couture.manche-raglan', 'Manche raglan', 40, 'Une couture diagonale qui suit l’épaule.', ['montage']),
  q('couture.coudre-du-jersey', 'Coudre du jersey', 35, 'Un point extensible qui ne casse pas à l’étirement.', ['tissu', 'machine'], { next: ['couture.t-shirt-jersey'] }),
  q('couture.coudre-de-la-viscose', 'Coudre de la viscose', 40, 'Une matière fuyante piquée droit, sans vague.', ['tissu']),
  q('couture.coudre-une-toile-epaisse', 'Coudre une toile épaisse', 40, 'Trois épaisseurs de coton lourd, aiguille adaptée.', ['tissu']),
  q('couture.thermocollant-pose', 'Thermocollant posé', 28, 'Un entoilage sans bulle ni auréole.', ['finition', 'repassage']),
  q('couture.taie-portefeuille', 'Taie portefeuille', 25, 'Un rabat de vingt centimètres, angles carrés.', ['projet']),
  q('couture.sac-a-vrac', 'Sac à vrac', 25, 'Coulisse, fond renforcé, coutures surfilées.', ['projet']),
  q('couture.trousse-doublee', 'Trousse doublée', 40, 'Une glissière entre deux tissus, sans pli au coin.', ['projet']),
  q('couture.jupe-droite-doublee', 'Jupe droite doublée', 50, 'Une jupe qui tombe d’aplomb, zip invisible.', ['projet']),
  q('couture.t-shirt-jersey', 'T-shirt en jersey', 45, 'Encolure en bord-côte, épaules soutenues.', ['projet']),
  q('couture.short-taille-elastiquee', 'Short à taille élastiquée', 40, 'Deux poches, une coulisse, ourlets égaux.', ['projet']),
  q('couture.housse-de-coussin-zippee', 'Housse de coussin zippée', 30, 'Une glissière cachée dans la couture du bas.', ['projet']),
  q('couture.retoucher-une-doublure', 'Retoucher une doublure', 35, 'Une doublure de veste remplacée à l’identique.', ['reparation', 'doublure']),
  q('couture.remonter-des-epaules', 'Remonter des épaules', 45, 'Une veste reprise aux épaules, emmanchures conservées.', ['reparation']),
  q('couture.ajuster-un-patron', 'Ajuster un patron à sa taille', 45, 'Un patron modifié aux hanches, lignes redessinées.', ['patron'], { next: ['couture.toile-de-patron'] }),

  /* --- Difficile : pièces techniques et vêtements complets --- */
  q('couture.col-claudine-double', 'Col claudine doublé', 55, 'Un col rond symétrique, sans surépaisseur.', ['col']),
  q('couture.col-chemise-pied', 'Col de chemise à pied rapporté', 70, 'Pointes égales, pied qui suit exactement l’encolure.', ['col'], { next: ['couture.chemise-complete'] }),
  q('couture.poignet-fente-capucin', 'Poignet à fente capucin', 65, 'Une fente nette, patte en pointe, sans un pli.', ['finition'], { next: ['couture.chemise-complete'] }),
  q('couture.braguette-zippee', 'Braguette zippée', 70, 'Une braguette qui ferme droit, sous-patte comprise.', ['fermeture'], { next: ['couture.pantalon-classique'] }),
  q('couture.poche-passepoilee-rabat', 'Poche passepoilée à rabat', 75, 'Deux lèvres, un rabat, aucun angle qui bâille.', ['poche']),
  q('couture.doublure-montee-au-sac', 'Doublure montée au sac', 70, 'Une veste retournée par l’ouverture de manche.', ['doublure'], { next: ['couture.veste-doublee-structuree'] }),
  q('couture.fente-de-dos-doublee', 'Fente de dos doublée', 65, 'Une fente qui reste fermée quand on marche.', ['finition']),
  q('couture.boutonniere-main', 'Boutonnière à la main', 60, 'Une boutonnière brodée à la soie, bords fermes.', ['main', 'finition']),
  q('couture.ourlet-robe-en-biais', 'Ourlet de robe en biais', 60, 'Un bas régulier après vingt-quatre heures de suspension.', ['ourlet']),
  q('couture.ceinture-montee', 'Ceinture montée', 60, 'Une ceinture rapportée, alignée sur les passants.', ['finition']),
  q('couture.toile-de-patron', 'Toile de patron', 60, 'Une toile d’essai annotée, corrections reportées au papier.', ['patron'], { next: ['couture.ajustement-buste', 'couture.patron-sur-mesure'] }),
  q('couture.ajustement-buste', 'Ajustement de buste', 80, 'Un buste ajusté à ses mesures, pinces recalculées.', ['patron']),
  q('couture.gradation-une-taille', 'Gradation d’une taille', 75, 'Un patron gradué proprement d’une taille entière.', ['patron']),
  q('couture.patron-de-manche', 'Patron de manche redessiné', 70, 'Une tête de manche redessinée pour l’aisance voulue.', ['patron']),
  q('couture.surjeteuse-reglee', 'Surjeteuse réglée', 55, 'Quatre fils équilibrés sur trois matières différentes.', ['machine']),
  q('couture.point-de-recouvrement', 'Point de recouvrement', 60, 'Un ourlet façon industriel, deux lignes parallèles.', ['machine']),
  q('couture.pantalon-classique', 'Pantalon classique', 90, 'Deux jambes identiques, poches et ceinture montées.', ['projet']),
  q('couture.chemisier-double', 'Chemisier doublé', 85, 'Col, poignets et patte de boutonnage alignés.', ['projet']),
  q('couture.robe-cintree', 'Robe cintrée', 90, 'Fermeture invisible, doublure, ourlet suspendu.', ['projet']),
  q('couture.veste-non-doublee', 'Veste non doublée', 85, 'Coutures anglaises partout, emmanchures propres.', ['projet']),
  q('couture.sac-a-main-structure', 'Sac à main structuré', 70, 'Fond renforcé, anses piquées, glissière posée droit.', ['projet']),

  /* --- Légendaire : les gros morceaux --- */
  q('couture.chemise-complete', 'Chemise complète', 120, 'Col, poignets, boutonnières : la chemise entière, portable.', ['projet'], { major: true }),
  q('couture.patron-sur-mesure', 'Patron sur mesure', 150, 'Un patron créé de zéro, validé sur toile.', ['patron'], { major: true }),
  q('couture.veste-doublee-structuree', 'Veste doublée structurée', 180, 'Épaulettes, doublure, boutonnières : une veste montée.', ['projet']),
  q('couture.manteau-d-hiver', 'Manteau d’hiver', 200, 'Laine, doublure ouatinée, col monté à la main.', ['projet']),
  q('couture.robe-de-ceremonie', 'Robe de cérémonie', 190, 'Doublure, fermeture invisible, ourlet fait main.', ['projet']),
  q('couture.jean-brut-complet', 'Jean brut complet', 160, 'Cinq poches, rivets posés, coutures rabattues.', ['projet']),
  q('couture.corset-a-baleines', 'Corset à baleines', 170, 'Baleines gainées, œillets alignés, laçage régulier.', ['projet']),
  q('couture.garde-robe-capsule', 'Garde-robe capsule', 220, 'Cinq pièces cousues qui se portent ensemble.', ['projet']),
  q('couture.tenue-pour-quelqu-un', 'Tenue pour quelqu’un d’autre', 140, 'Mesures prises, essayage, retouches livrées.', ['projet']),
  q('couture.vetement-zero-dechet', 'Vêtement zéro déchet', 130, 'Un vêtement coupé sans une chute jetée.', ['projet', 'coupe'])
];

/* ------------------------------------------------------------------ */
/* Autres compétences — reprise de l'existant, lots à venir           */
/* ------------------------------------------------------------------ */

const course: CatalogQuest[] = [
  q('course.sortie-20-min', 'Sortie de 20 minutes', 15, 'Vingt minutes en aisance respiratoire, sans montre.', ['endurance']),
  q('course.5-km-sans-marcher', '5 km sans marcher', 30, 'Cinq kilomètres d’affilée, allure libre.', ['endurance'], { next: ['course.10-km-continus'] }),
  q('course.fractionne-30-30', 'Fractionné 30/30', 35, 'Dix répétitions, récupération en trottinant.', ['vitesse']),
  q('course.cotes-courtes', 'Côtes courtes', 40, 'Huit montées franches, retour en marchant.', ['force']),
  q('course.sortie-a-jeun', 'Sortie à jeun', 35, '40 minutes en endurance douce, au réveil.', ['endurance']),
  q('course.escalier-x10', 'Escalier ×10', 45, 'Dix montées d’escalier, récupération en marchant.', ['force']),
  q('course.sortie-longue-12-km', 'Sortie longue 12 km', 80, 'Allure conversation, sans arrêt montre.', ['endurance']),
  q('course.10-km-continus', '10 km continus', 90, 'Dix kilomètres sans coupure, allure tenue.', ['endurance'], { major: true })
];

const photo: CatalogQuest[] = [
  q('photo.regler-en-manuel', 'Régler en manuel', 20, 'Une image correcte sans automatisme.', ['technique']),
  q('photo.portrait-a-l-ombre', 'Portrait à l’ombre', 25, 'Une lumière douce, regard net.', ['portrait']),
  q('photo.serie-de-3-images', 'Série de 3 images', 35, 'Trois images qui se répondent.', ['serie']),
  q('photo.lumiere-rasante', 'Lumière rasante', 45, 'Une matière révélée par l’angle du soleil.', ['lumiere']),
  q('photo.portrait-au-flash', 'Portrait au flash', 45, 'Un flash direct assumé, sujet net.', ['portrait', 'lumiere']),
  q('photo.heure-bleue', 'Heure bleue', 40, 'Une image après le coucher du soleil, trépied.', ['lumiere']),
  q('photo.serie-de-rue', 'Série de rue', 55, 'Cinq images cohérentes en une heure.', ['serie']),
  q('photo.tirage-papier', 'Tirage papier', 70, 'Une image imprimée, contraste vérifié.', ['tirage'], { major: true })
];

const cuisine: CatalogQuest[] = [
  q('cuisine.pate-brisee-maison', 'Pâte brisée maison', 20, 'Une pâte sablée du bout des doigts, reposée au frais.', ['pate']),
  q('cuisine.decoupe-reguliere', 'Découpe régulière', 25, 'Des dés de même taille, sans se presser.', ['technique']),
  q('cuisine.sauce-emulsionnee', 'Sauce émulsionnée', 35, 'Une émulsion qui tient jusqu’au service.', ['sauce']),
  q('cuisine.bouillon-clair', 'Bouillon clair', 40, 'Un fond filtré, sans trouble.', ['base']),
  q('cuisine.fermentation-courte', 'Fermentation courte', 45, 'Un légume lacto-fermenté en cinq jours.', ['conservation']),
  q('cuisine.pain-au-levain', 'Pain au levain', 60, 'Une mie alvéolée, croûte chantante.', ['pate', 'levain'], { major: true }),
  q('cuisine.pate-feuilletee', 'Pâte feuilletée', 85, 'Six tours, repos respectés.', ['pate']),
  q('cuisine.menu-3-services', 'Menu 3 services', 110, 'Trois plats servis chauds à l’heure dite.', ['service'], { major: true })
];

const jardin: CatalogQuest[] = [
  q('jardin.semis-en-godet', 'Semis en godet', 15, 'Une levée régulière, terreau juste tassé.', ['semis']),
  q('jardin.bouture-reussie', 'Bouture réussie', 25, 'Des racines visibles au bout de trois semaines.', ['bouture']),
  q('jardin.paillage-complet', 'Paillage complet', 30, 'Couvrir les planches avant l’été.', ['entretien']),
  q('jardin.compost-equilibre', 'Compost équilibré', 35, 'Brun et vert alternés, odeur de sous-bois.', ['sol']),
  q('jardin.recolte-de-graines', 'Récolte de graines', 35, 'Sécher et étiqueter trois variétés.', ['graines']),
  q('jardin.taille-de-printemps', 'Taille de printemps', 45, 'Une coupe nette au-dessus d’un œil.', ['taille']),
  q('jardin.greffe-en-ecusson', 'Greffe en écusson', 60, 'Une greffe qui reprend au printemps.', ['taille']),
  q('jardin.potager-en-carres', 'Potager en carrés', 80, 'Quatre carrés plantés, allées dégagées.', ['projet'], { major: true })
];

const perso: CatalogQuest[] = [
  q('perso.appeler-mamie', 'Appeler mamie', 15, 'Vingt minutes, sans regarder l’heure.', ['liens']),
  q('perso.vider-la-boite-mail', 'Vider la boîte mail', 20, 'Zéro message en attente ce soir.', ['administratif']),
  q('perso.trier-le-placard', 'Trier le placard', 25, 'Un sac à donner, un sac à jeter.', ['rangement']),
  q('perso.papiers-a-jour', 'Papiers à jour', 35, 'Une pile classée, rien qui traîne.', ['administratif'])
];

export const CATALOG: Record<string, CatalogQuest[]> = { couture, course, photo, cuisine, jardin, perso };

/* ------------------------------------------------------------------ */
/* Accès                                                              */
/* ------------------------------------------------------------------ */

export const catalogOf = (skill: string): CatalogQuest[] => CATALOG[skill] || [];

const INDEX: Record<string, CatalogQuest> = {};
Object.keys(CATALOG).forEach((k) => CATALOG[k].forEach((qq) => { INDEX[qq.id] = qq; }));

export const questById = (id: string): CatalogQuest | undefined => INDEX[id];

/** Index d'une quête dans le catalogue de sa compétence — sert de clé au journal. */
export const indexOf = (skill: string, id: string) => catalogOf(skill).findIndex((qq) => qq.id === id);

/** Compétence d'un id de quête ('couture.ourlet-invisible' → 'couture'). */
export const skillOfQuest = (id: string) => id.split('.')[0];

export const majorsOf = (skill: string) => catalogOf(skill).filter((qq) => qq.major);
