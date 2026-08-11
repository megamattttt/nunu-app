/**
 * Importance — remplace la difficulté sur la compétence « perso ».
 * Elle code l'urgence ressentie, pas l'effort : c'est elle qui donne
 * la couleur de la ligne et qui départage deux quêtes à échéance égale.
 */
export type Importance = 'critique' | 'important' | 'normal';

export const IMPS: Record<Importance, { label: string; short: string; c: string; txt: string; order: number; px: number }> = {
  critique:  { label: 'CRITIQUE',  short: '!!!', c: '#E2685A', txt: '#FFFFFF', order: 0, px: 20 },
  important: { label: 'IMPORTANT', short: '!!',  c: '#E8B863', txt: '#0A0A0C', order: 1, px: 14 },
  normal:    { label: 'NORMAL',    short: '!',   c: '#6FA5D8', txt: '#0A0A0C', order: 2, px: 10 }
};

export const IMP_LIST: Importance[] = ['critique', 'important', 'normal'];

/** Cran suivant dans le cycle critique → important → normal → critique. */
export const nextImp = (i: Importance): Importance => IMP_LIST[(IMP_LIST.indexOf(i) + 1) % IMP_LIST.length];
