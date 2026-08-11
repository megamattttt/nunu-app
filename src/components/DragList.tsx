import React from 'react';

type Props = {
  count: number;
  onMove: (from: number, to: number) => void;
  /** Rend une ligne : `handle` se pose sur la poignée de glissement. */
  children: (i: number, handle: { onPointerDown: (e: React.PointerEvent) => void }, dragging: boolean) => React.ReactNode;
  gap?: number;
};

/**
 * Liste réordonnable au doigt. La poignée démarre le geste, les autres lignes
 * s'écartent pendant le glissement, l'ordre n'est publié qu'au relâchement.
 */
export default function DragList({ count, onMove, children, gap = 8 }: Props) {
  const refs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [drag, setDrag] = React.useState<{ i: number; dy: number; to: number } | null>(null);
  const geom = React.useRef<{ y: number; tops: number[]; hs: number[] }>({ y: 0, tops: [], hs: [] });

  const begin = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const els = refs.current.slice(0, count);
    geom.current = {
      y: e.clientY,
      tops: els.map((el) => el?.offsetTop || 0),
      hs: els.map((el) => (el?.offsetHeight || 0) + gap)
    };
    setDrag({ i, dy: 0, to: i });
  };

  React.useEffect(() => {
    if (!drag) return;
    const { y, tops, hs } = geom.current;

    const move = (e: PointerEvent) => {
      const dy = e.clientY - y;
      const center = tops[drag.i] + dy + hs[drag.i] / 2;
      let to = drag.i;
      for (let k = 0; k < count; k++) {
        const mid = tops[k] + hs[k] / 2;
        if (k < drag.i && center < mid) { to = k; break; }
        if (k > drag.i && center > mid) to = k;
      }
      setDrag((cur) => (cur ? { ...cur, dy, to } : cur));
    };
    const end = () => {
      setDrag((cur) => {
        if (cur && cur.to !== cur.i) onMove(cur.i, cur.to);
        return null;
      });
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    const prev = document.body.style.touchAction;
    document.body.style.touchAction = 'none';
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.body.style.touchAction = prev;
    };
  }, [drag?.i, count, onMove]);

  const shift = (k: number) => {
    if (!drag || drag.i === k) return 0;
    const h = geom.current.hs[drag.i] || 0;
    if (drag.i < drag.to && k > drag.i && k <= drag.to) return -h;
    if (drag.to < drag.i && k >= drag.to && k < drag.i) return h;
    return 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, k) => {
        const on = drag?.i === k;
        return (
          <div
            key={k}
            ref={(el) => { refs.current[k] = el; }}
            style={{
              position: 'relative',
              transform: `translateY(${on ? drag!.dy : shift(k)}px)`,
              transition: on ? 'none' : 'transform .18s cubic-bezier(.2,1,.3,1)',
              zIndex: on ? 5 : 1,
              scale: on ? '1.02' : '1',
              filter: on ? 'drop-shadow(0 18px 26px rgba(0,0,0,.45))' : 'none'
            }}
          >
            {children(k, { onPointerDown: begin(k) }, on)}
          </div>
        );
      })}
    </div>
  );
}
