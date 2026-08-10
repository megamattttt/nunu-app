/** Retour haptique — Vibration API (Android/Chrome). Silencieux là où l'API manque (iOS Safari). */
type Pattern = 'tap' | 'soft' | 'success' | 'levelup' | 'error' | 'swipe' | 'combo' | 'milestone';

const P: Record<Pattern, number | number[]> = {
  tap: 12,
  soft: 8,
  swipe: [6, 14, 6],
  success: [18, 40, 26],
  levelup: [24, 40, 24, 40, 60],
  error: [40, 60, 40],
  // Deux coups secs et rapprochés : le combo se sent avant de se lire.
  combo: [10, 26, 10, 26, 18],
  // Roulement long réservé aux paliers de streak et aux montées de rang.
  milestone: [30, 30, 20, 30, 20, 30, 90]
};

let enabled = true;
export const setHaptics = (v: boolean) => { enabled = v; };

export function buzz(kind: Pattern = 'tap') {
  if (!enabled) return;
  try { navigator.vibrate?.(P[kind] as any); } catch { /* ignoré */ }
}
