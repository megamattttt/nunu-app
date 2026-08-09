import React from 'react';
import { DIO_FLOORS, DIO_LIGHTS, DIO_OBJ, DIO_SHAPES, DIO_WALLS, type DioObj } from '../data/diorama';
import { css } from '../lib/css';
import { useGame } from '../state/store';
import { DONE0 } from '../data/skills';

type Props = {
  height?: number;
  editable?: boolean;
  onPick?: (o: DioObj) => void;
  dragging?: string | null;
  onDragStart?: (o: DioObj, e: React.PointerEvent) => void;
};

/** Scène papier découpé. En mode édition, les objets se déplacent au doigt. */
export default function DioramaScene({ height = 240, editable, onPick, dragging, onDragStart }: Props) {
  const { s } = useGame();
  const wall = DIO_WALLS[s.dio.wall], floor = DIO_FLOORS[s.dio.floor], light = DIO_LIGHTS[s.dio.light];

  const owned = (o: DioObj) =>
    o.cat === 'atelier' ? !!s.owned.atelier[o.ai!] : (DONE0[o.sk] + (s.progress[o.sk]?.done || 0)) > 0;

  return (
    <div
      data-diorama
      style={{
        position: 'relative', height, borderRadius: 22, overflow: 'hidden',
        background: wall[1], backgroundImage: wall[2], touchAction: dragging ? 'none' : 'auto'
      }}
    >
      {/* Sol */}
      <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', background: floor[1], backgroundImage: `repeating-linear-gradient(90deg, ${floor[2]} 0 1px, transparent 1px 22px)` }} />
      <span style={{ position: 'absolute', left: 0, right: 0, bottom: '38%', height: 3, background: 'rgba(90,60,40,.16)' }} />

      {DIO_OBJ.filter((o) => owned(o) && !s.dio.out[o.id]).map((o) => {
        const p = s.dio.pos[o.id] || { x: o.x, y: o.y };
        const layers = DIO_SHAPES[o.id] || [];
        return (
          <span
            key={o.id}
            onPointerDown={(e) => editable && onDragStart?.(o, e)}
            onClick={() => onPick?.(o)}
            style={{
              position: 'absolute', left: p.x + '%', top: p.y + '%', width: o.w, height: o.h,
              marginLeft: -o.w / 2, marginTop: -o.h,
              cursor: editable ? 'grab' : 'pointer',
              filter: 'drop-shadow(2px 4px 3px rgba(70,45,25,.28))',
              transform: dragging === o.id ? 'scale(1.06)' : 'none',
              transition: dragging === o.id ? 'none' : 'transform .16s ease',
              zIndex: Math.round(p.y)
            }}
          >
            {layers.map((l, i) => <span key={i} style={{ position: 'absolute', ...css(l) }} />)}
          </span>
        );
      })}

      {/* Lumière, grain, vignette */}
      <span style={{ position: 'absolute', inset: 0, background: light[1], pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .16, mixBlendMode: 'multiply', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")", backgroundSize: '120px 120px' }} />
      <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 60px rgba(60,40,25,.28)' }} />
    </div>
  );
}
