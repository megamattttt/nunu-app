import React, { useEffect, useRef, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { skillById } from '../data/skills';
import { TIER_ICONS } from '../data/rankIcons';
import { skillRank } from '../state/selectors';
import type { Rank } from '../data/ranks';
import { TIERS } from '../data/ranks';
import { Tap } from './ui';

const LOGO = import.meta.env.BASE_URL + 'icons/logo-mark.png';
const W = 1080, H = 1350;

const loadImg = (src: string) =>
  new Promise<HTMLImageElement | null>((res) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });

function roundRect(x: any, l: number, t: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(l + r, t);
  x.arcTo(l + w, t, l + w, t + h, r);
  x.arcTo(l + w, t + h, l, t + h, r);
  x.arcTo(l, t + h, l, t, r);
  x.arcTo(l, t, l + w, t, r);
  x.closePath();
}

/** Icône de palier dessinée sur le canvas — même géométrie que <RankIcon />. */
function drawRankIcon(x: any, rank: Rank, cx: number, cy: number, size: number, bg: string) {
  const paths = TIER_ICONS[rank.tier] || TIER_ICONS[0];
  x.save();
  x.translate(cx - size / 2, cy - size / 2);
  x.scale(size / 24, size / 24);
  x.lineJoin = 'round'; x.lineCap = 'round';
  paths.forEach((p) => {
    const path = new Path2D(p.d);
    if (p.mode === 'fill') { x.fillStyle = rank.c; x.fill(path); }
    else if (p.mode === 'knock' && p.fill) { x.fillStyle = bg; x.fill(path); }
    else { x.strokeStyle = p.mode === 'knock' ? bg : rank.c; x.lineWidth = p.sw || 1.8; x.stroke(path); }
  });
  x.restore();

  // Indicatif de stade : segments remplis sous l'icône.
  const divs = TIERS[rank.tier].divs;
  if (divs > 1) {
    const w = size * 0.14, gap = size * 0.07;
    const total = divs * w + (divs - 1) * gap;
    let px = cx - total / 2;
    const py = cy + size / 2 + size * 0.13;
    for (let i = 0; i < divs; i++) {
      x.beginPath();
      x.arc(px + w / 2, py, w / 2, 0, Math.PI * 2);
      if (i <= rank.div) { x.fillStyle = rank.c; x.fill(); }
      else { x.strokeStyle = rank.c; x.globalAlpha = 0.45; x.lineWidth = size * 0.02; x.stroke(); x.globalAlpha = 1; }
      px += w + gap;
    }
  }
}

/**
 * Carte de palier exportable : générée sur canvas aux couleurs de l'app,
 * téléchargeable et partageable (Web Share API si disponible).
 */
export default function ShareCard() {
  const { s, d } = useGame();
  const data = s.share;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) { setUrl(null); return; }
    let alive = true;

    (async () => {
      const logo = await loadImg(LOGO);
      const cv = canvasRef.current;
      if (!cv || !alive) return;
      const x = cv.getContext('2d')!;
      const sk = skillById(data.skill);
      const rank = skillRank(s, data.skill);

      x.fillStyle = C.ink; x.fillRect(0, 0, W, H);

      // Halo de la compétence
      const g = x.createRadialGradient(W * 0.5, H * 0.34, 40, W * 0.5, H * 0.34, 620);
      g.addColorStop(0, sk.c + 'cc'); g.addColorStop(1, C.ink + '00');
      x.fillStyle = g; x.fillRect(0, 0, W, H);

      // Cartouche
      x.fillStyle = 'rgba(11,11,12,.34)';
      roundRect(x, 70, 250, W - 140, 830, 64); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 3; x.stroke();

      if (logo) x.drawImage(logo, W / 2 - 54, 96, 108, 108);

      x.textAlign = 'center';
      x.fillStyle = 'rgba(255,255,255,.55)';
      x.font = `500 26px ${F.mono}`;
      x.fillText(data.kind === 'rang' ? 'NOUVEAU RANG' : 'PALIER VALIDÉ', W / 2, 350);

      // Titre (retour à la ligne simple)
      x.fillStyle = '#fff';
      const words = data.title.toUpperCase().split(' ');
      const lines: string[] = []; let line = '';
      x.font = `800 82px ${F.display}`;
      words.forEach((wd) => {
        const test = line ? line + ' ' + wd : wd;
        if (x.measureText(test).width > W - 260 && line) { lines.push(line); line = wd; } else line = test;
      });
      if (line) lines.push(line);
      lines.slice(0, 3).forEach((l, i) => x.fillText(l, W / 2, 470 + i * 92));

      const baseY = 470 + Math.min(3, lines.length) * 92;

      // Icône de palier — même jeu d'icônes que dans l'app
      drawRankIcon(x, rank, W / 2, baseY + 60, 150, C.ink);

      // Pastille de rang
      x.fillStyle = sk.c;
      const rw = Math.max(360, x.measureText(data.rank).width);
      roundRect(x, W / 2 - rw / 2, baseY + 160, rw, 108, 54); x.fill();
      x.fillStyle = sk.txt;
      x.font = `800 54px ${F.display}`;
      x.fillText(data.rank, W / 2, baseY + 234);

      x.fillStyle = 'rgba(255,255,255,.62)';
      x.font = `500 30px ${F.mono}`;
      x.fillText(sk.name + ' · +' + data.px + ' PX', W / 2, baseY + 320);

      // Gamertag
      x.fillStyle = '#fff';
      x.font = `800 46px ${F.display}`;
      x.fillText('@' + (s.profile.gamertag || 'nunu'), W / 2, H - 190);
      x.fillStyle = 'rgba(255,255,255,.4)';
      x.font = `500 24px ${F.mono}`;
      x.fillText('NUNU · PROGRESSE POUR DE VRAI', W / 2, H - 130);

      cv.toBlob((b) => { if (b && alive) setUrl(URL.createObjectURL(b)); }, 'image/png');
    })();

    return () => { alive = false; };
  }, [data]);

  if (!data) return null;

  const filename = 'nunu-' + data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '.png';

  const download = () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
  };

  const share = async () => {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], filename, { type: 'image/png' });
      const navAny = navigator as any;
      if (navAny.canShare?.({ files: [file] })) {
        await navAny.share({ files: [file], title: 'NUNU', text: data.title });
        return;
      }
    } catch { /* l'utilisateur a annulé */ }
    download();
  };

  const canShare = typeof (navigator as any).canShare === 'function';

  return (
    <div
      onClick={() => d({ t: 'SHARE', data: null })}
      style={{
        position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(11,11,12,.92)', backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: 'calc(var(--safe-top) + 20px) 24px calc(var(--safe-bottom) + 24px)'
      }}
    >
      <canvas ref={canvasRef} width={W} height={H} style={{ display: 'none' }} />
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {url ? (
          <img src={url} alt="Carte de palier" style={{ width: '100%', borderRadius: 26, display: 'block', boxShadow: '0 30px 60px -30px rgba(0,0,0,.9)' }} />
        ) : (
          <div style={{ aspectRatio: '4 / 5', borderRadius: 26, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `500 11px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.14em' }}>
            GÉNÉRATION…
          </div>
        )}
        <div style={{ display: 'flex', gap: 9 }}>
          <Tap onTap={share} haptic="success" style={{ flex: 1, background: C.lime, color: C.ink, borderRadius: 18, minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 15px ${F.display}` }}>
            {canShare ? 'PARTAGER' : 'TÉLÉCHARGER'}
          </Tap>
          {canShare ? (
            <Tap onTap={download} style={{ flex: 'none', width: 54, background: 'rgba(255,255,255,.1)', borderRadius: 18, minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
            </Tap>
          ) : null}
        </div>
        <Tap onTap={() => d({ t: 'SHARE', data: null })} style={{ textAlign: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(255,255,255,.45)', padding: 12, minHeight: 44 }}>
          FERMER
        </Tap>
      </div>
    </div>
  );
}
