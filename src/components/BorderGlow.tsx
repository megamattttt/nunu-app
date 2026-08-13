import React, { useCallback, useEffect, useRef } from 'react';
import { C } from '../theme';
import './BorderGlow.css';

/**
 * Filet lumineux qui suit le doigt (d'après BorderGlow de React Bits), réglé
 * sur la palette de l'application : lime pour l'action, miel et teal en appui.
 * Réservé aux deux ou trois boutons qui portent vraiment l'écran.
 */

type Props = {
  children: React.ReactNode;
  /** Coin du bloc entouré — reprends celui de la carte à l'intérieur. */
  borderRadius?: number;
  /** Portée du halo extérieur, en pixels. */
  glowRadius?: number;
  glowIntensity?: number;
  edgeSensitivity?: number;
  coneSpread?: number;
  /** Teinte du halo, en composantes HSL (« teinte saturation clarté »). */
  glowColor?: string;
  backgroundColor?: string;
  colors?: string[];
  fillOpacity?: number;
  /** Balayage automatique à l'apparition : le geste n'est pas indispensable. */
  animated?: boolean;
  style?: React.CSSProperties;
};

function parseHSL(hslStr: string) {
  const m = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!m) return { h: 78, s: 65, l: 63 };
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars: Record<string, string> = {};
  opacities.forEach((o, i) => {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(o * intensity, 100)}%)`;
  });
  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]) {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInCubic = (x: number) => x * x * x;

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: {
  start?: number; end?: number; duration?: number; delay?: number;
  ease?: (x: number) => number; onUpdate: (v: number) => void; onEnd?: () => void;
}) {
  const t0 = performance.now() + delay;
  const tick = () => {
    const t = Math.min((performance.now() - t0) / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else onEnd?.();
  };
  window.setTimeout(() => requestAnimationFrame(tick), delay);
}

export default function BorderGlow({
  children,
  borderRadius = 26,
  glowRadius = 34,
  glowIntensity = 0.9,
  edgeSensitivity = 30,
  coneSpread = 25,
  glowColor = '78 65 63',
  backgroundColor = C.ink,
  colors = [C.lime, C.honey, C.teal],
  fillOpacity = 0.4,
  animated = false,
  style
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const track = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const cx = r.width / 2, cy = r.height / 2;
    const dx = e.clientX - r.left - cx, dy = e.clientY - r.top - cy;
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(2));
    card.style.setProperty('--cursor-angle', deg.toFixed(2) + 'deg');
  }, []);

  useEffect(() => {
    const card = ref.current;
    if (!animated || !card) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const a0 = 110, a1 = 465;
    card.classList.add('nu-glow-sweep');
    card.style.setProperty('--cursor-angle', a0 + 'deg');
    const angle = (v: number) => card.style.setProperty('--cursor-angle', ((a1 - a0) * (v / 100) + a0).toFixed(2) + 'deg');

    animateValue({ duration: 500, onUpdate: (v) => card.style.setProperty('--edge-proximity', v.toFixed(2)) });
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: angle });
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: angle });
    animateValue({
      ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: (v) => card.style.setProperty('--edge-proximity', v.toFixed(2)),
      onEnd: () => card.classList.remove('nu-glow-sweep')
    });
  }, [animated]);

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerDown={track}
      className="nu-glow"
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': borderRadius + 'px',
        '--glow-padding': glowRadius + 'px',
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
        ...style
      } as React.CSSProperties}
    >
      <span className="nu-glow-edge" />
      <div className="nu-glow-inner">{children}</div>
    </div>
  );
}
