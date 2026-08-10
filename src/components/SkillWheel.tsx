import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { SKILLS, type Skill } from '../data/skills';
import { skillRank, levelOf, boardRows } from '../state/selectors';
import { RankIcon } from './RankIcon';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';

/** Écart angulaire entre deux dossiers voisins. */
const STEP_DEG = 26;
/** Rayon virtuel : le centre de rotation vit loin sous l'écran. */
const PIVOT = 430;
/** Distance de glissement qui vaut un cran. */
const DRAG_STEP = 62;

const TICKS = 41;

/** Couleur du dossier. « perso » est le seul dossier blanc. */
const folderColor = (sk: Skill) => (sk.id === 'perso' ? '#FFFFFF' : sk.c);

/**
 * Sélecteur de compétences en roue : trois dossiers en arc de cercle,
 * pilotés par le doigt sur l'arc de graduations.
 * La roue boucle à l'infini : la position est un index continu non borné,
 * les dossiers sont piochés modulo le nombre de compétences.
 */
export default function SkillWheel({
  currentId, value, onChange
}: { currentId: string; value: string; onChange: (id: string) => void }) {
  const { s } = useGame();

  // La compétence en cours passe en tête, les autres suivent dans l'ordre.
  const order = useMemo(() => {
    const first = SKILLS.find((k) => k.id === currentId) || SKILLS[0];
    return [first, ...SKILLS.filter((k) => k.id !== first.id)];
  }, [currentId]);

  const n = order.length;
  const at = (i: number) => order[((i % n) + n) % n];

  /** Position continue sur la roue (non bornée). */
  const [pos, setPos] = useState(() => Math.max(0, order.findIndex((k) => k.id === value)));
  const posRef = useRef(pos);
  const raf = useRef(0);
  const dragging = useRef(false);
  const start = useRef<{ x: number; pos: number } | null>(null);
  const lastSel = useRef(Math.round(pos));

  const setPosition = (p: number) => { posRef.current = p; setPos(p); };

  /** Cran sélectionné : notifié dès que l'arrondi change. */
  useEffect(() => {
    const sel = Math.round(pos);
    if (sel === lastSel.current) return;
    lastSel.current = sel;
    const id = at(sel).id;
    buzz('soft'); sfx.tap();
    if (id !== value) onChange(id);
  }, [pos]);

  /** Retour souple vers le cran le plus proche (easing exponentiel). */
  const settle = (target: number) => {
    window.cancelAnimationFrame(raf.current);
    const loop = () => {
      const p = posRef.current;
      const diff = target - p;
      if (Math.abs(diff) < 0.0015) { setPosition(target); return; }
      setPosition(p + diff * 0.16);
      raf.current = window.requestAnimationFrame(loop);
    };
    raf.current = window.requestAnimationFrame(loop);
  };

  useEffect(() => () => window.cancelAnimationFrame(raf.current), []);

  // Sélection changée depuis l'extérieur : la roue tourne dans le sens le plus court.
  useEffect(() => {
    if (dragging.current) return;
    const want = order.findIndex((k) => k.id === value);
    if (want < 0) return;
    const cur = Math.round(posRef.current);
    if (((cur % n) + n) % n === want) return;
    let delta = want - (((cur % n) + n) % n);
    if (delta > n / 2) delta -= n;
    if (delta < -n / 2) delta += n;
    lastSel.current = cur + delta;
    settle(cur + delta);
  }, [value, order]);

  const onDown = (e: React.PointerEvent) => {
    window.cancelAnimationFrame(raf.current);
    dragging.current = true;
    start.current = { x: e.clientX, pos: posRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    setPosition(start.current.pos - (e.clientX - start.current.x) / DRAG_STEP);
  };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    dragging.current = false;
    settle(Math.round(posRef.current));
  };

  const sel = at(Math.round(pos));
  const rows = boardRows(s, sel.id);
  const doneCount = levelOf(s, sel.id);
  const rank = skillRank(s, sel.id);

  // Graduations de l'arc.
  const ticks = useMemo(
    () => Array.from({ length: TICKS }, (_, i) => {
      const t = i / (TICKS - 1);
      const a = (-52 + t * 104) * (Math.PI / 180);
      const near = 1 - Math.abs(t - 0.5) * 2;
      return { a, near };
    }),
    []
  );

  const base = Math.round(pos);
  const frac = pos - base;

  return (
    <div style={{ position: 'relative', paddingTop: 8, userSelect: 'none' }}>
      {/* Dossiers en arc — trois voisins de part et d'autre, en boucle */}
      <div style={{ position: 'relative', height: 214, overflow: 'hidden' }}>
        {[-2, -1, 0, 1, 2].map((k) => {
          const idx = base + k;
          const item = at(idx);
          const off = idx - pos;
          if (Math.abs(off) > 1.8) return null;
          const rot = off * STEP_DEG;
          const near = 1 - Math.min(1, Math.abs(off));
          const col = folderColor(item);
          const r = skillRank(s, item.id);
          const isSel = Math.abs(off) < 0.5;

          return (
            <div
              key={idx}
              onClick={() => { if (!isSel) { lastSel.current = idx; settle(idx); } }}
              style={{
                position: 'absolute', left: '50%', top: 26, width: 190, marginLeft: -95,
                transformOrigin: `50% ${PIVOT}px`,
                transform: `rotate(${rot}deg) scale(${0.74 + near * 0.26})`,
                opacity: 0.3 + near * 0.7,
                zIndex: isSel ? 3 : 1,
                cursor: 'pointer'
              }}
            >
              {/* Contenu qui dépasse du dossier, comme des feuilles rangées dedans */}
              <div style={{ position: 'relative', height: 46, marginBottom: -18 }}>
                <span style={{ position: 'absolute', left: 16, bottom: 0, width: 54, height: 66, borderRadius: 10, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.18)', transform: 'rotate(-7deg)' }} />
                <span style={{ position: 'absolute', right: 18, bottom: 0, width: 62, height: 74, borderRadius: 10, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.16)', transform: 'rotate(6deg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                  <RankIcon rank={r} size={22} bg={C.ink} pips={false} />
                </span>
                <span style={{ position: 'absolute', left: '50%', marginLeft: -30, bottom: 4, width: 60, height: 78, borderRadius: 10, background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.24)' }} />
              </div>

              {/* Onglet du dossier */}
              <div style={{ width: 84, height: 15, borderRadius: '10px 10px 0 0', background: col, marginLeft: 14 }} />
              {/* Corps du dossier */}
              <div
                style={{
                  height: 122, borderRadius: '14px 18px 18px 18px', background: col,
                  boxShadow: isSel ? '0 26px 50px -22px rgba(0,0,0,.9)' : 'none',
                  padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ font: `800 26px/1 ${F.display}`, color: item.txt, letterSpacing: '-.03em' }}>{item.short}</span>
                  <RankIcon rank={r} size={20} bg={col} />
                </span>
                <span style={{ display: 'block' }}>
                  <span style={{ display: 'block', height: 6, borderRadius: 99, background: 'rgba(11,11,12,.18)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: r.pct + '%', borderRadius: 99, background: item.txt === '#FFFFFF' ? '#fff' : C.ink }} />
                  </span>
                  <span style={{ display: 'block', font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: item.txt, opacity: .62, marginTop: 7 }}>{r.short}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arc de graduations — surface de rotation */}
      <div
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ position: 'relative', height: 96, marginTop: -6, touchAction: 'pan-y', cursor: 'grab' }}
        aria-label="Faire tourner la roue des compétences"
      >
        <span style={{ position: 'absolute', left: '50%', top: -2, marginLeft: -1, width: 2, height: 15, background: 'rgba(255,255,255,.75)', borderRadius: 99 }} />
        <svg viewBox="0 0 340 110" preserveAspectRatio="xMidYMin slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* L'arc suit le doigt en continu : il glisse d'un cran puis se répète. */}
          <g transform={`rotate(${-frac * STEP_DEG} 170 360)`}>
            {ticks.map((t, i) => {
              const cx = 170, cy = 360, r0 = 292, r1 = 292 + 10 + t.near * 12;
              const x0 = cx + Math.sin(t.a) * r0, y0 = cy - Math.cos(t.a) * r0;
              const x1 = cx + Math.sin(t.a) * r1, y1 = cy - Math.cos(t.a) * r1;
              return (
                <line
                  key={i} x1={x0} y1={y0} x2={x1} y2={y1}
                  stroke={t.near > 0.9 ? C.lime : '#fff'} strokeWidth={t.near > 0.9 ? 2.4 : 1.4}
                  opacity={0.14 + t.near * 0.62} strokeLinecap="round"
                />
              );
            })}
          </g>
        </svg>
        <span style={{ position: 'absolute', left: '50%', top: 40, marginLeft: -1, width: 2, height: 13, background: C.lime, borderRadius: 99 }} />
      </div>

      {/* Fiche de la compétence sélectionnée */}
      <div style={{ textAlign: 'center', padding: '0 22px', marginTop: -14 }}>
        <div key={sel.id} style={{ font: `800 44px/1 ${F.display}`, color: folderColor(sel), letterSpacing: '-.04em', animation: 'nuRise .35s cubic-bezier(.2,1,.3,1)' }}>
          {sel.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 10, font: `500 12px ${F.body}`, color: 'rgba(255,255,255,.62)' }}>
          <span>{doneCount} paliers</span>
          <span>{rows.length - doneCount} à venir</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: rank.c }}>
            <RankIcon rank={rank} size={16} bg={C.ink} pips={false} />
            {rank.short}
          </span>
        </div>
        <div style={{ font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.42)', marginTop: 10, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto', textWrap: 'pretty' }}>
          Fais tourner la molette : la roue boucle sans fin.
        </div>
      </div>
    </div>
  );
}
