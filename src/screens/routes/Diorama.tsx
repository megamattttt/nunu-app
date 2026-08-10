import React, { useRef, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { DIO_FLOORS, DIO_LIGHTS, DIO_OBJ, DIO_RARE, DIO_WALLS, type DioObj } from '../../data/diorama';
import DioramaScene from '../../components/DioramaScene';
import { Kicker, RouteHead, Tap } from '../../components/ui';
import { buzz } from '../../lib/haptics';
import type { Nav } from '../../App';

export default function Diorama({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [drag, setDrag] = useState<string | null>(null);
  const [pick, setPick] = useState<DioObj | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const onDragStart = (o: DioObj, e: React.PointerEvent) => {
    setDrag(o.id); buzz('soft');
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const el = box.current?.querySelector('[data-diorama]') as HTMLElement;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(20, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    d({ t: 'DIO_MOVE', id: drag, x, y });
  };

  const out = DIO_OBJ.filter((o) => s.dio.out[o.id]);

  return (
    <div style={{ padding: '10px 22px', paddingBottom: 'var(--dock-space)' }} ref={box} onPointerMove={onMove} onPointerUp={() => { if (drag) { buzz('tap'); setDrag(null); } }}>
      <RouteHead title="DIORAMA" sub="Déplace les objets au doigt" onBack={nav.back} />

      <div style={{ background: '#EADFC9', borderRadius: 26, padding: 9, marginTop: 16 }}>
        <DioramaScene height={280} editable dragging={drag} onDragStart={onDragStart} onPick={(o) => !drag && setPick(o)} />
      </div>

      {pick ? (
        <div style={{ background: C.night, border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '15px 16px', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Kicker>PIÈCE DE COLLECTION</Kicker>
            <span style={{ font: `700 9px ${F.mono}`, color: C.ink, background: DIO_RARE[pick.rare][1], padding: '5px 8px', borderRadius: 7 }}>{DIO_RARE[pick.rare][0].toUpperCase()}</span>
          </div>
          <div style={{ font: `800 20px ${F.display}`, color: '#fff', marginTop: 8, letterSpacing: '-.01em' }}>{pick.name}</div>
          <div style={{ font: `400 12px/1.45 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 6 }}>Débloqué le {pick.date} · {pick.sk}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Tap onTap={() => { d({ t: 'DIO_TAKE', id: pick.id }); setPick(null); }} style={{ flex: 1, textAlign: 'center', font: `700 10.5px ${F.mono}`, letterSpacing: '.08em', background: 'rgba(255,255,255,.08)', color: '#fff', padding: '13px', borderRadius: 13, minHeight: 44 }}>RANGER</Tap>
            <Tap onTap={() => setPick(null)} style={{ flex: 1, textAlign: 'center', font: `700 10.5px ${F.mono}`, letterSpacing: '.08em', background: C.lime, color: C.ink, padding: '13px', borderRadius: 13, minHeight: 44 }}>FERMER</Tap>
          </div>
        </div>
      ) : null}

      {[['MUR', DIO_WALLS, 'wall'], ['SOL', DIO_FLOORS, 'floor'], ['LUMIÈRE', DIO_LIGHTS, 'light']].map(([label, list, key]: any) => (
        <div key={key} style={{ marginTop: 16 }}>
          <Kicker>{label}</Kicker>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {list.map((item: any, i: number) => (
              <Tap
                key={item[0]} onTap={() => d({ t: 'DIO', patch: { [key]: i } })} haptic="soft"
                style={{ flex: 'none', padding: '11px 14px', borderRadius: 13, minHeight: 44, display: 'flex', alignItems: 'center', font: `700 11px ${F.body}`, background: s.dio[key] === i ? C.lime : 'rgba(255,255,255,.07)', color: s.dio[key] === i ? C.ink : 'rgba(255,255,255,.65)' }}
              >
                {item[0]}
              </Tap>
            ))}
          </div>
        </div>
      ))}

      {out.length ? (
        <div style={{ marginTop: 18 }}>
          <Kicker>INVENTAIRE ({out.length})</Kicker>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {out.map((o) => (
              <Tap key={o.id} onTap={() => d({ t: 'DIO_PUT', id: o.id })} style={{ font: `700 11px ${F.body}`, background: 'rgba(255,255,255,.07)', color: '#fff', padding: '12px 14px', borderRadius: 13, minHeight: 44, display: 'flex', alignItems: 'center' }}>+ {o.name}</Tap>
            ))}
          </div>
        </div>
      ) : null}

      <Tap onTap={() => d({ t: 'DIO_RESET' })} style={{ marginTop: 18, textAlign: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', padding: 14, minHeight: 44 }}>
        REMETTRE L’AGENCEMENT D’ORIGINE
      </Tap>
    </div>
  );
}
