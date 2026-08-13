/**
 * Icônes de packs de quêtes — sélection du jeu « Stickies color » de Streamline
 * (CC BY 4.0), servi par Iconify. Vingt-quatre motifs qui couvrent ce qu'on met
 * vraiment dans un pack perso : la maison, l'administratif, le sport, les
 * études, la musique, les voyages, l'argent, la famille.
 */

export const PACK_ICON_SET = 'streamline-stickies-color';

/** Une icône = un nom Iconify + un libellé lisible pour l'accessibilité. */
export const PACK_ICONS: { id: string; label: string }[] = [
  { id: 'drawer-inbox', label: 'Rangement' },
  { id: 'checking-order', label: 'Courses' },
  { id: 'key', label: 'Administratif' },
  { id: 'construction-area', label: 'Bricolage' },
  { id: 'backpack', label: 'Sport' },
  { id: 'compass-1', label: 'Aventure' },
  { id: 'book-library', label: 'Lecture' },
  { id: 'education-degree', label: 'Études' },
  { id: 'coding', label: 'Code' },
  { id: 'globe-1', label: 'Langues' },
  { id: 'graph-bar', label: 'Finances' },
  { id: 'graph-pie', label: 'Budget' },
  { id: 'lab-tools', label: 'Projets' },
  { id: '3d', label: 'Création' },
  { id: 'filming-movie', label: 'Vidéo' },
  { id: 'instruments-piano', label: 'Musique' },
  { id: 'guitar-amplifier', label: 'Répétition' },
  { id: 'earpod-connected', label: 'Écoute' },
  { id: 'boarding-pass', label: 'Voyage' },
  { id: 'airport-railroad', label: 'Déplacements' },
  { id: 'baby', label: 'Enfants' },
  { id: 'gift-reciept', label: 'Cadeaux' },
  { id: 'date-time-setting', label: 'Routine' },
  { id: 'bug', label: 'Jardin' }
];

/** Icône par défaut d'un pack sans choix explicite. */
export const DEFAULT_PACK_ICON = 'drawer-inbox';

export const packIconLabel = (id?: string) =>
  PACK_ICONS.find((i) => i.id === id)?.label || 'Pack';

/** URL du SVG couleur, taille demandée pour éviter un rendu flou. */
export const packIconSrc = (id: string, size = 64) =>
  `https://api.iconify.design/${PACK_ICON_SET}:${id}.svg?height=${size}`;
