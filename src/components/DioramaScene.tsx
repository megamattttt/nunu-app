import React, { useMemo, useRef, useState } from 'react';
import { DIO_FLOORS, DIO_LIGHTS, DIO_SEASONS, DIO_WALLS, DIO_WEATHER, P, ROOM, type DioObj, type DioSurf, type Layer } from '../data/diorama';
import { WB_SKEW, WL_SKEW, lightForHour, objById, placed, project, seasonNow, snap, surfaceAt, traces, unproject, type DioItem } from '../lib/dio';
import { useGame } from '../state/store';
import { dayKey, moodColor, type Scale } from '../data/checkin';

const CSS = `
@keyframes dioDust { 0%{transform:translate3d(0,0,0);opacity:0} 20%{opacity:.7} 100%{transform:translate3d(28px,-90px,0);opacity:0} }
@keyframes dioRain { 0%{transform:translateY(-40px);opacity:0} 12%{opacity:.55} 100%{transform:translateY(360px);opacity:0} }
@keyframes dioFall { 0%{transform:translate3d(0,-30px,0) rotate(0deg);opacity:0} 15%{opacity:.8} 100%{transform:translate3d(-40px,340px,0) rotate(220deg);opacity:0} }
@keyframes dioSway { 0%,100%{transform:rotate(-1.2deg)} 50%{transform:rotate(1.2deg)} }
@keyframes dioSteam { 0%{transform:translateY(0) scale(.7);opacity:0} 30%{opacity:.5} 100%{transform:translateY(-38px) scale(1.5);opacity:0} }
@keyframes dioGlow { 0%,100%{opacity:.82} 50%{opacity:1} }
`;

type View = { wall: number; floor: number; light: number; items: Record<string, DioItem> };

type Props = {
  height?: number;
  editable?: boolean;
  /** Atelier d'une autre personne (lecture seule). */
  view?: View;
  sel?: string | null;
  onSel?: (id: string | null) => void;
  onMove?: (id: string, s: DioSurf, x: number, y: number, magnet: string) => void;
  onPick?: (o: DioObj) => void;
};

/** Une pile de calques papier. */
function Cut({ sh, tint }: { sh: Layer[]; tint: string }) {
  return (
    <>
      {sh.map((l, i) => (
        <span key={i} style={{
          position: 'absolute', left: l[0], top: l[1], width: l[2], height: l[3],
          borderRadius: l[4] === -1 ? '50%' : l[4],
          background: l[5] === -1 ? tint : P[l[5]],
          transform: l[6] ? `rotate(${l[6]}deg)` : undefined
        }} />
      ))}
    </>
  );
}

/** Vignette d'objet, mise à l'échelle dans un carré (inventaire, boutique). */
export function DioThumb({ o, tint, size = 56 }: { o: DioObj; tint?: string; size?: number }) {
  const k = Math.min(size / o.w, size / o.h) * 0.86;
  return (
    <span style={{ position: 'relative', display: 'block', width: size, height: size }}>
      <span style={{ position: 'absolute', left: '50%', top: '50%', width: o.w, height: o.h, transform: `translate(-50%,-50%) scale(${k})` }}>
        <Cut sh={o.sh} tint={tint || o.tint[0]} />
      </span>
    </span>
  );
}

export default function DioramaScene({ height = 240, editable, view, sel, onSel, onMove, onPick }: Props) {
  const { s } = useGame();
  const box = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const [held, setHeld] = useState(false);
  const [live, setLive] = useState<string | null>(null);

  const dio: any = view || s.dio;
  const k = height / ROOM.h;
  const wall = DIO_WALLS[dio.wall] || DIO_WALLS[0];
  const floor = DIO_FLOORS[dio.floor] || DIO_FLOORS[0];
  const auto = !view && s.dio.lightAuto !== false;
  const light = DIO_LIGHTS[auto ? lightForHour(new Date().getHours()) : (dio.light || 0)];
  const season = DIO_SEASONS[seasonNow()];
  const weather = DIO_WEATHER[(view ? 0 : s.dio.weather) || 0];

  /* L'humeur du point du jour teinte la pièce, très légèrement. */
  const todayMood = (view ? 0 : (s as any).checkins?.[dayKey()]?.mood || 0) as Scale;

  const list = useMemo(() => {
    if (!view) return placed(s);
    return Object.entries(view.items)
      .map(([id, it]) => ({ o: objById(id)!, it }))
      .filter((r) => r.o)
      .sort((a, b) => project(a.it.s, a.it.x, a.it.y).z - project(b.it.s, b.it.x, b.it.y).z);
  }, [s, view]);

  const tr = view ? [] : traces(s);

  const toScene = (e: React.PointerEvent) => {
    const r = scene.current!.getBoundingClientRect();
    return { px: (e.clientX - r.left) / k, py: (e.clientY - r.top) / k };
  };

  const down = (o: DioObj, it: DioItem) => (e: React.PointerEvent) => {
    onSel?.(o.id);
    if (!editable) return;
    const p = toScene(e);
    const a = project(it.s, it.x, it.y);
    drag.current = { id: o.id, ox: p.px - a.px, oy: p.py - a.py };
    setHeld(true);
    scene.current?.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  };

  const move = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const o = objById(g.id)!;
    const p = toScene(e);
    const px = p.px - g.ox, py = p.py - g.oy;
    const surf: DioSurf = o.surf === 'floor' ? 'floor' : (surfaceAt(px, py) === 'wl' ? 'wl' : 'wb');
    const u = unproject(surf, px, py);
    const hosts = Object.fromEntries(list.map((r) => [r.o.id, r.it]));
    const sn = snap(surf, u.x, u.y, hosts as any, g.id);
    setLive(sn.magnet || null);
    onMove?.(g.id, surf, sn.x, sn.y, sn.magnet);
  };

  const up = () => { drag.current = null; setHeld(false); setLive(null); };

  const poly = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(',')})`;

  return (
    <div ref={box} style={{ position: 'relative', height, borderRadius: 22, overflowX: 'auto', overflowY: 'hidden', isolation: 'isolate', zIndex: 0, background: '#C7B79C', WebkitOverflowScrolling: 'touch' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ width: ROOM.w * k, height: ROOM.h * k, position: 'relative' }}>
        <div
          ref={scene}
          onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          onPointerDown={() => onSel?.(null)}
          style={{
            width: ROOM.w, height: ROOM.h, position: 'absolute', top: 0, left: 0,
            transform: `scale(${k})`, transformOrigin: 'top left',
            touchAction: held ? 'none' : 'auto'
          }}
        >
          {/* Mur gauche */}
          <span style={{
            position: 'absolute', inset: 0,
            clipPath: poly([[ROOM.cx, ROOM.top], [ROOM.cx, ROOM.top - ROOM.wallH], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh - ROOM.wallH], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh]]),
            background: wall[1], backgroundImage: wall[2], filter: 'brightness(.88)'
          }} />
          {/* Mur droit */}
          <span style={{
            position: 'absolute', inset: 0,
            clipPath: poly([[ROOM.cx, ROOM.top], [ROOM.cx, ROOM.top - ROOM.wallH], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh - ROOM.wallH], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh]]),
            background: wall[1], backgroundImage: wall[2]
          }} />
          {/* Arêtes hautes des murs (épaisseur du carton) */}
          <span style={{ position: 'absolute', inset: 0, zIndex: 2, clipPath: poly([[ROOM.cx, ROOM.top - ROOM.wallH], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh - ROOM.wallH], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh - ROOM.wallH - ROOM.rim], [ROOM.cx, ROOM.top - ROOM.wallH - ROOM.rim]]), background: P[14] }} />
          <span style={{ position: 'absolute', inset: 0, zIndex: 2, clipPath: poly([[ROOM.cx, ROOM.top - ROOM.wallH], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh - ROOM.wallH], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh - ROOM.wallH - ROOM.rim], [ROOM.cx, ROOM.top - ROOM.wallH - ROOM.rim]]), background: P[12] }} />

          {/* Fenêtre du mur droit : le ciel dit la saison et la météo */}
          {(() => {
            const w = project('wb', ROOM.win.wx, ROOM.win.wy);
            return (
              <span style={{ position: 'absolute', left: w.px, top: w.py, width: ROOM.win.w, height: ROOM.win.h, zIndex: 5, transform: WB_SKEW, transformOrigin: '0 0', background: season.sky, boxShadow: 'inset 0 0 0 10px ' + P[14] + ', inset 0 0 26px rgba(90,60,40,.20)' }}>
                <span style={{ position: 'absolute', inset: 10, background: weather.veil }} />
                <span style={{ position: 'absolute', left: '50%', top: 10, bottom: 10, width: 10, background: P[14], marginLeft: -5 }} />
              </span>
            );
          })()}

          {/* Sol */}
          <span style={{
            position: 'absolute', inset: 0, zIndex: 3,
            clipPath: poly([[ROOM.cx, ROOM.top], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh], [ROOM.cx, ROOM.top + ROOM.hh * 2], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh]]),
            background: floor[1],
            backgroundImage: `repeating-linear-gradient(26.565deg, ${floor[2]} 0 1.5px, transparent 1.5px 26px)`
          }} />
          {/* Épaisseur du plancher */}
          <span style={{ position: 'absolute', inset: 0, zIndex: 4, clipPath: poly([[ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh], [ROOM.cx, ROOM.top + ROOM.hh * 2], [ROOM.cx, ROOM.top + ROOM.hh * 2 + ROOM.slab], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh + ROOM.slab]]), background: floor[2], filter: 'brightness(.78)' }} />
          <span style={{ position: 'absolute', inset: 0, zIndex: 4, clipPath: poly([[ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh], [ROOM.cx, ROOM.top + ROOM.hh * 2], [ROOM.cx, ROOM.top + ROOM.hh * 2 + ROOM.slab], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh + ROOM.slab]]), background: floor[2], filter: 'brightness(.9)' }} />
          {/* Plinthes */}
          <span style={{ position: 'absolute', inset: 0, zIndex: 6, clipPath: poly([[ROOM.cx, ROOM.top], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh], [ROOM.cx - ROOM.hw, ROOM.top + ROOM.hh - 15], [ROOM.cx, ROOM.top - 15]]), background: P[14], opacity: .9 }} />
          <span style={{ position: 'absolute', inset: 0, zIndex: 6, clipPath: poly([[ROOM.cx, ROOM.top], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh], [ROOM.cx + ROOM.hw, ROOM.top + ROOM.hh - 15], [ROOM.cx, ROOM.top - 15]]), background: P[12], opacity: .9 }} />

          {/* Objets */}
          {list.map(({ o, it }) => {
            const pr = project(it.s, it.x, it.y);
            const sc = (it.sc || 1) * (it.s === 'floor' ? pr.scale : 1);
            const tint = o.tint[it.cw || 0] || o.tint[0];
            const on = sel === o.id;
            return (
              <span
                key={o.id}
                onPointerDown={down(o, it)}
                onClick={(e) => { e.stopPropagation(); onPick?.(o); }}
                style={{
                  position: 'absolute', left: pr.px, top: pr.py, width: o.w, height: o.h,
                  transform: [
                    it.s === 'floor' ? 'translate(-50%,-100%)' : 'translate(0,0)',
                    `scale(${sc})`, it.r ? `rotate(${it.r}deg)` : '',
                    it.s === 'wl' ? WL_SKEW : it.s === 'wb' ? WB_SKEW : ''
                  ].filter(Boolean).join(' '),
                  transformOrigin: it.s === 'floor' ? '50% 100%' : '0 0',
                  zIndex: pr.z + (it.z || 0) * 40,
                  filter: `drop-shadow(3px 6px 4px rgba(70,45,25,.30))`,
                  cursor: editable ? 'grab' : 'pointer',
                  animation: o.id === 'suspension' || o.id === 'plante-h' || o.id === 'tablier' ? 'dioSway 6s ease-in-out infinite' : undefined,
                  transformBox: 'border-box'
                }}
              >
                <Cut sh={o.sh} tint={tint} />
                {on ? <span style={{ position: 'absolute', inset: -8, border: '2px dashed rgba(255,255,255,.9)', borderRadius: 10, filter: 'drop-shadow(0 0 2px rgba(0,0,0,.5))' }} /> : null}
              </span>
            );
          })}

          {/* Traces d'activité récente */}
          {tr.map((t) => {
            const pr = project(t.surf, t.x, t.y);
            return (
              <span key={t.id} title={t.label} style={{
                position: 'absolute', left: pr.px, top: pr.py, width: t.w, height: t.h,
                transform: `translate(-50%,-100%) scale(${pr.scale})`, transformOrigin: '50% 100%',
                zIndex: pr.z + 6, filter: 'drop-shadow(2px 4px 3px rgba(70,45,25,.24))', opacity: .96
              }}>
                <Cut sh={t.sh} tint={P[6]} />
              </span>
            );
          })}

          {/* Vapeur au-dessus de la tasse, si elle est posée */}
          {list.some((r) => r.o.id === 'tasse') ? (() => {
            const it = list.find((r) => r.o.id === 'tasse')!.it;
            const pr = project(it.s, it.x, it.y);
            return [0, 1, 2].map((i) => (
              <span key={'st' + i} style={{
                position: 'absolute', left: pr.px - 6 + i * 5, top: pr.py - 40, width: 7, height: 7, borderRadius: '50%',
                background: 'rgba(255,255,255,.55)', zIndex: pr.z + 8,
                animation: `dioSteam ${3 + i * 0.6}s ease-out ${i * 0.7}s infinite`
              }} />
            ));
          })() : null}

          {/* Lumière, saison, météo */}
          <span style={{ position: 'absolute', inset: 0, background: light.grad, pointerEvents: 'none', zIndex: 900 }} />
          <span style={{ position: 'absolute', inset: 0, background: light.tint, pointerEvents: 'none', zIndex: 901, mixBlendMode: 'multiply' }} />
          <span style={{ position: 'absolute', inset: 0, background: weather.veil, pointerEvents: 'none', zIndex: 902 }} />
          {/* Humeur du jour : un voile de la couleur du point du jour */}
          {todayMood ? (
            <span style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 902,
              background: `radial-gradient(120% 90% at 50% 105%, ${moodColor(todayMood)}2E, transparent 72%)`,
              mixBlendMode: 'soft-light'
            }} />
          ) : null}
          {/* Particules d'ambiance */}
          <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 903, overflow: 'hidden' }}>
            {Array.from({ length: 16 }).map((_, i) => {
              const kind = weather.part === 'rain' ? 'rain' : weather.part === 'none' ? 'dust' : season.part;
              const base = { position: 'absolute' as const, left: `${(i * 61) % 100}%`, top: `${(i * 37) % 70}%` };
              if (kind === 'rain') return <span key={i} style={{ ...base, width: 2, height: 16, background: 'rgba(220,235,245,.6)', animation: `dioRain ${1 + (i % 5) * .2}s linear ${i * .13}s infinite` }} />;
              if (kind === 'leaf' || kind === 'snow') return <span key={i} style={{ ...base, width: kind === 'snow' ? 5 : 8, height: kind === 'snow' ? 5 : 6, borderRadius: kind === 'snow' ? '50%' : 4, background: kind === 'snow' ? 'rgba(255,255,255,.8)' : 'rgba(200,120,60,.55)', animation: `dioFall ${6 + (i % 5)}s linear ${i * .5}s infinite` }} />;
              return <span key={i} style={{ ...base, width: 4, height: 4, borderRadius: '50%', background: kind === 'pollen' ? 'rgba(235,230,150,.6)' : 'rgba(255,240,210,.5)', animation: `dioDust ${7 + (i % 6)}s linear ${i * .6}s infinite` }} />;
            })}
          </span>

          {/* Grain papier et vignette */}
          <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 904, opacity: .15, mixBlendMode: 'multiply', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")", backgroundSize: '120px 120px' }} />
          <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 905, boxShadow: 'inset 0 0 80px rgba(60,40,25,.3)' }} />
        </div>
      </div>

      {live ? (
        <span style={{ position: 'absolute', left: 10, top: 10, zIndex: 20, font: "700 9.5px 'JetBrains Mono', monospace", letterSpacing: '.08em', background: 'rgba(10,10,12,.78)', color: '#fff', padding: '7px 9px', borderRadius: 8 }}>
          {live.toUpperCase()}
        </span>
      ) : null}
    </div>
  );
}
