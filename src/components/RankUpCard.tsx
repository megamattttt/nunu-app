import React, { useEffect, useRef, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { TIERS } from '../data/ranks';
import { TIER_TIPS } from '../data/tips';
import { skillById } from '../data/skills';
import { RankIcon } from './RankIcon';
import JournalEditor from './JournalEditor';
import { Tap } from './ui';
import { confetti } from '../lib/confetti';
import type { RewardEvent } from '../state/store';

/**
 * Carte de déblocage de rang : tilt/parallax au doigt, reflet qui traverse,
 * grande icône de palier en pièce centrale. Réservée aux montées de rang.
 */
export default function RankUpCard({ e, onClose }: { e: RewardEvent; onClose: () => void }) {
  const { s, d } = useGame();
  const rank = e.rank!;
  const sk = e.skill ? skillById(e.skill) : null;
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [doc, setDoc] = useState<string | null>(null);
  const entry = doc ? s.journal.find((x) => x.id === doc) : null;
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (s.prefs.confetti) window.setTimeout(() => confetti(120), 260);
  }, []);

  const move = (cx: number, cy: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({ x: ((cx - r.left) / r.width - 0.5) * 2, y: ((cy - r.top) / r.height - 0.5) * 2 });
  };

  const next = TIERS[rank.tier + 1];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(11,11,12,.9)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, perspective: 900
      }}
    >
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }} onClick={(ev) => ev.stopPropagation()}>
        <div
          ref={box}
          onPointerMove={(ev) => move(ev.clientX, ev.clientY)}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          style={{
            position: 'relative', borderRadius: 30, overflow: 'hidden', padding: '30px 24px 26px', textAlign: 'center',
            background: `radial-gradient(120% 90% at 50% 0%, ${rank.c}38, ${C.night} 62%), ${C.night}`,
            border: `1px solid ${rank.c}55`,
            boxShadow: `0 40px 80px -40px ${rank.c}, 0 0 0 1px rgba(255,255,255,.04) inset`,
            transform: `rotateY(${tilt.x * 9}deg) rotateX(${-tilt.y * 9}deg)`,
            transition: 'transform .18s cubic-bezier(.2,1,.3,1)',
            transformStyle: 'preserve-3d',
            animation: 'nuRankIn .72s cubic-bezier(.16,1.1,.3,1) both'
          }}
        >
          {/* Reflet qui traverse la carte */}
          <span
            aria-hidden
            style={{
              position: 'absolute', top: -40, bottom: -40, width: 130, pointerEvents: 'none',
              background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.16),transparent)',
              animation: 'nuGlare 2.6s cubic-bezier(.3,0,.3,1) .35s infinite'
            }}
          />
          {/* Halo qui suit le doigt */}
          <span
            aria-hidden
            style={{
              position: 'absolute', width: 300, height: 300, borderRadius: '50%', top: '18%', left: '50%',
              marginLeft: -150, marginTop: -150, pointerEvents: 'none',
              background: `radial-gradient(circle, ${rank.c}40, transparent 66%)`,
              transform: `translate3d(${tilt.x * 22}px, ${tilt.y * 18}px, 0)`, transition: 'transform .2s ease'
            }}
          />

          <div style={{ position: 'relative', font: `500 9.5px ${F.mono}`, letterSpacing: '.24em', color: 'rgba(255,255,255,.5)' }}>
            NOUVEAU RANG{sk ? ' · ' + sk.name : ''}
          </div>

          <div
            style={{
              position: 'relative', marginTop: 20, display: 'flex', justifyContent: 'center',
              transform: `translate3d(${tilt.x * -14}px, ${tilt.y * -10}px, 40px)`, transition: 'transform .2s ease',
              animation: 'nuRankIco .8s .12s cubic-bezier(.16,1.3,.3,1) both'
            }}
          >
            <RankIcon rank={rank} size={126} bg={C.night} pips={false} />
          </div>

          <div style={{ position: 'relative', font: `800 40px/1 ${F.display}`, color: rank.c, letterSpacing: '-.035em', marginTop: 22 }}>
            {rank.label}
          </div>

          {TIERS[rank.tier].divs > 1 ? (
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <span style={{ display: 'flex', gap: 7 }}>
                {Array.from({ length: TIERS[rank.tier].divs }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 26, height: 5, borderRadius: 99,
                      background: i <= rank.div ? rank.c : 'rgba(255,255,255,.14)'
                    }}
                  />
                ))}
              </span>
            </div>
          ) : null}

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            {e.px ? <span style={{ font: `700 11px ${F.mono}`, background: C.lime, color: C.ink, padding: '8px 12px', borderRadius: 99 }}>+{e.px} PX</span> : null}
            {e.coins ? <span style={{ font: `700 11px ${F.mono}`, background: C.honey, color: C.ink, padding: '8px 12px', borderRadius: 99 }}>+{e.coins} PIÈCES</span> : null}
            {e.combo && e.combo > 1 ? <span style={{ font: `700 11px ${F.mono}`, background: 'rgba(255,255,255,.1)', color: '#fff', padding: '8px 12px', borderRadius: 99 }}>COMBO ×{e.combo}</span> : null}
          </div>

          <div style={{ position: 'relative', font: `400 12.5px/1.5 ${F.body}`, color: 'rgba(255,255,255,.6)', marginTop: 18, textWrap: 'pretty' }}>
            {TIER_TIPS[rank.tier]}
          </div>

          {e.object ? (
            <div style={{ position: 'relative', marginTop: 16, background: 'rgba(255,255,255,.06)', borderRadius: 16, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left' }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: C.honey, flex: 'none' }} />
              <span>
                <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(255,255,255,.45)' }}>OBJET AJOUTÉ AU DIORAMA</span>
                <span style={{ display: 'block', font: `700 13px ${F.body}`, color: '#fff', marginTop: 3 }}>{e.object}</span>
              </span>
            </div>
          ) : null}

          {next ? (
            <div style={{ position: 'relative', font: `500 9px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.35)', marginTop: 16 }}>
              PALIER SUIVANT · {next.name}
            </div>
          ) : null}
        </div>

        {e.journalId ? (
          <Tap
            onTap={() => setDoc(e.journalId!)} haptic="soft"
            style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', color: '#fff', borderRadius: 99, minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinejoin="round">
              <path d="M3 8.5h3.2L8 6h8l1.8 2.5H21V19H3z" /><circle cx="12" cy="13.2" r="3.4" />
            </svg>
            <span style={{ font: `800 15px ${F.display}`, letterSpacing: '-.01em' }}>DOCUMENTER CE PALIER</span>
          </Tap>
        ) : null}

        {e.share ? (
          <Tap
            onTap={() => { const data = e.share!; d({ t: 'EVENT', event: null }); d({ t: 'SHARE', data }); }}
            haptic="soft"
            style={{ background: rank.c, color: TIERS[rank.tier].txt, borderRadius: 99, minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 15px ${F.display}`, letterSpacing: '-.01em' }}
          >
            CRÉER MA CARTE
          </Tap>
        ) : null}

        <Tap
          onTap={onClose}
          style={{ background: C.paper, color: C.ink, borderRadius: 99, minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 16px ${F.display}`, letterSpacing: '-.01em' }}
        >
          CONTINUER
        </Tap>
      </div>

      {entry ? <JournalEditor entry={entry} onClose={() => setDoc(null)} /> : null}
    </div>
  );
}
