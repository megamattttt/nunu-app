/** Retour haptique — Vibration API (Android/Chrome). Silencieux là où l'API manque (iOS Safari). */
type Pattern = 'tap' | 'soft' | 'success' | 'levelup' | 'error' | 'swipe';

const P: Record<Pattern, number | number[]> = {
  tap: 12,
  soft: 8,
  swipe: [6, 14, 6],
  success: [18, 40, 26],
  levelup: [24, 40, 24, 40, 60],
  error: [40, 60, 40]
};

let enabled = true;
export const setHaptics = (v: boolean) => { enabled = v; };

export function buzz(kind: Pattern = 'tap') {
  if (!enabled) return;
  try { navigator.vibrate?.(P[kind] as any); } catch { /* ignoré */ }
}
