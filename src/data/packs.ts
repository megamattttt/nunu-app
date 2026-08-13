import type { QuestPack } from '../state/types';

/**
 * Packs de quêtes prêts à l'emploi pour l'espace perso : une liste courante,
 * posée d'un seul geste. L'utilisateur peut en créer d'autres, gardés en mémoire.
 */
export const PACKS: QuestPack[] = [
  { id: 'maison', icon: 'drawer-inbox', name: 'Entretien maison', items: ['Nettoyer le sol', 'Faire les vitres', 'Faire la vaisselle', 'Changer les draps', 'Sortir les poubelles'] },
  { id: 'admin', icon: 'key', name: 'Administratif', items: ['Trier le courrier', 'Payer les factures', 'Ranger les papiers', 'Prendre un rendez-vous'] },
  { id: 'courses', icon: 'checking-order', name: 'Courses', items: ['Faire la liste', 'Passer au marché', 'Ranger les courses'] },
  { id: 'soin', icon: 'backpack', name: 'Prendre soin', items: ['Boire 1,5 L d’eau', 'Marcher 20 minutes', 'Étirements du soir', 'Se coucher avant 23 h'] },
  { id: 'semaine', icon: 'date-time-setting', name: 'Début de semaine', items: ['Vider la boîte mail', 'Planifier les repas', 'Préparer le sac de sport'] }
];
