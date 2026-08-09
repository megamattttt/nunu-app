import { useRef, useState } from 'react';
import { buzz } from './haptics';

type Opts = { onLeft?: () => void; onRight?: () => void; threshold?: number };

/** Glisser tactile pour la pioche : suit le doigt, se valide au-delà du seuil. */
export function useSwipe({ onLeft, onRight, threshold = 96 }: Opts) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const armed = useRef(false);
  const [dx, setDx] = useState(0);
  const [flying, setFlying] = useState<0 | -1 | 1>(0);

  const reset = () => { start.current = null; armed.current = false; setDx(0); };

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (flying) return;
      start.current = { x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!start.current || flying) return;
      const d = e.clientX - start.current.x;
      if (Math.abs(d) > 6) setDx(d);
      if (!armed.current && Math.abs(d) > threshold) { armed.current = true; buzz('swipe'); }
      if (armed.current && Math.abs(d) <= threshold) armed.current = false;
    },
    onPointerUp: () => {
      if (!start.current || flying) return reset();
      const d = dx;
      if (Math.abs(d) > threshold) {
        const dir = d > 0 ? 1 : -1;
        setFlying(dir as 1 | -1);
        setDx(dir * window.innerWidth);
        window.setTimeout(() => { (dir > 0 ? onRight : onLeft)?.(); setFlying(0); reset(); }, 220);
      } else reset();
    },
    onPointerCancel: reset
  };

  const fling = (dir: 1 | -1) => {
    if (flying) return;
    setFlying(dir); setDx(dir * window.innerWidth); buzz('swipe');
    window.setTimeout(() => { (dir > 0 ? onRight : onLeft)?.(); setFlying(0); reset(); }, 220);
  };

  return { handlers, dx, flying, fling };
}
