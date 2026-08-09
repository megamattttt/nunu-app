type Piece = { x: number; y: number; vx: number; vy: number; r: number; s: number; c: string; sh: number };

const COLORS = ['#C6F24E', '#FF5C42', '#FFC93C', '#6C63FF', '#A8D8FF', '#F6F4EF'];

/** Confettis canvas, plein écran, auto-nettoyés. count 0 = désactivé. */
export function confetti(count = 90, origin: { x?: number; y?: number } = {}) {
  if (!count || typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const cv = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  Object.assign(cv.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '999'
  } as CSSStyleDeclaration);
  document.body.appendChild(cv);

  const g = cv.getContext('2d')!;
  g.scale(dpr, dpr);
  const ox = origin.x ?? w / 2, oy = origin.y ?? h * 0.42;

  const parts: Piece[] = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 9;
    return {
      x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4,
      r: Math.random() * Math.PI, s: 4 + Math.random() * 6,
      c: COLORS[(Math.random() * COLORS.length) | 0], sh: Math.random() < 0.4 ? 1 : 0
    };
  });

  let frames = 0;
  const step = () => {
    frames++;
    g.clearRect(0, 0, w, h);
    parts.forEach((p) => {
      p.vy += 0.19; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += 0.12;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
      if (p.sh) { g.beginPath(); g.arc(0, 0, p.s / 2, 0, 7); g.fill(); }
      else g.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
      g.restore();
    });
    if (frames < 170) requestAnimationFrame(step);
    else cv.remove();
  };
  requestAnimationFrame(step);
}
