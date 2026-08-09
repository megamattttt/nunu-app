/** Sons de validation synthétisés (WebAudio) — aucun asset à charger, désactivable. */
let ctx: AudioContext | null = null;
let on = false;

export const setSound = (v: boolean) => { on = v; };
export const soundOn = () => on;

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.06, delay = 0) {
  if (!on) return;
  try {
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  } catch { /* ignoré */ }
}

export const sfx = {
  tap: () => tone(520, 0.06, 'triangle', 0.035),
  swipe: () => tone(340, 0.09, 'sine', 0.03),
  add: () => { tone(600, 0.1, 'triangle'); tone(900, 0.12, 'triangle', 0.05, 0.06); },
  validate: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.16, 'triangle', 0.055, i * 0.07)); },
  levelup: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'sine', 0.06, i * 0.09)); },
  rare: () => { [880, 1174, 1567].forEach((f, i) => tone(f, 0.2, 'sine', 0.05, i * 0.08)); },
  error: () => tone(180, 0.18, 'sawtooth', 0.03)
};
