import React, { useMemo, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { DISCOVER, RARITY, rollRarity, type Rarity } from '../../data/quests';
import { SKILLS, skillById } from '../../data/skills';
import { useSwipe } from '../../lib/useSwipe';
import { buzz } from '../../lib/haptics';
import { sfx } from '../../lib/sound';
import { RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

type Card = { skill: string; name: string; px: number; desc: string; rarity: Rarity };

function buildPool(): Card[] {
  const all: Card[] = [];
  Object.keys(DISCOVER).forEach((skill) => {
    DISCOVER[skill].forEach(([name, px, desc]) => {
      const rarity = rollRarity();
      all.push({ skill, name, px: Math.round(px * RARITY[rarity].mult), desc, rarity });
    });
  });
  // Mélange
  for (let i = all.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [all[i], all[j]] = [all[j], all[i]]; }
  return all;
}

export default function Discover({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [pool] = useState<Card[]>(() => buildPool().filter((c) => !s.pioched.includes(c.name)));
  const [ix, setIx] = useState(0);
  const [added, setAdded] = useState(0);
  const card = pool[ix];

  const next = (keep: boolean) => {
    if (!card) return;
    if (keep) {
      d({ t: 'ADD_QUEST', skill: card.skill, name: card.name, px: card.px, desc: card.desc, rarity: card.rarity });
      setAdded((n) => n + 1);
      sfx.add(); buzz('success');
      // Surprise : une pioche sur six offre des pièces.
      if (Math.random() < 0.17) d({ t: 'EVENT', event: { kind: 'surprise', title: 'BONUS DE PIOCHE', sub: 'Une petite récompense au passage', coins: 25 } });
    } else { sfx.swipe(); }
    d({ t: 'DRAW_USED' });
    setIx((n) => n + 1);
  };

  const { handlers, dx, fling } = useSwipe({ onRight: () => next(true), onLeft: () => next(false) });

  const sk = card ? skillById(card.skill) : null;
  const rar = card ? RARITY[card.rarity] : null;
  const rot = dx / 22;
  const intent = Math.abs(dx) > 96 ? (dx > 0 ? 'add' : 'skip') : null;

  return (
    <div style={{ padding: '10px 22px 30px', minHeight: '70dvh', display: 'flex', flexDirection: 'column' }}>
      <RouteHead
        title="PIOCHE"
        sub={card ? `${pool.length - ix} quêtes à trier · ${added} ajoutées` : 'Pioche terminée'}
        onBack={nav.back}
      />

      {card && sk && rar ? (
        <>
          <div style={{ marginTop: 26, position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 14, right: 14, top: -12, height: 90, borderRadius: 28, background: 'rgba(255,255,255,.07)' }} />
            <span style={{ position: 'absolute', left: 7, right: 7, top: -6, height: 90, borderRadius: 28, background: 'rgba(255,255,255,.12)' }} />
            <div
              {...handlers}
              style={{
                position: 'relative', background: rar.c, borderRadius: 28, padding: '20px 22px 24px', minHeight: 330,
                transform: `translateX(${dx}px) rotate(${rot}deg)`,
                transition: dx === 0 ? 'transform .26s cubic-bezier(.2,1.2,.3,1)' : 'none',
                touchAction: 'pan-y', userSelect: 'none',
                boxShadow: '0 30px 60px -30px rgba(0,0,0,.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <span style={{ font: `700 9.5px ${F.mono}`, letterSpacing: '.14em', color: C.ink, background: sk.c, padding: '6px 10px', borderRadius: 8 }}>{sk.name}</span>
                <span style={{ font: `700 12px ${F.mono}`, color: C.ink, background: 'rgba(11,11,12,.12)', padding: '6px 10px', borderRadius: 8 }}>+{card.px} PX</span>
              </div>

              {card.rarity !== 'commune' ? (
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, font: `700 9px ${F.mono}`, letterSpacing: '.16em', color: C.ink, background: 'rgba(11,11,12,.14)', padding: '6px 10px', borderRadius: 99 }}>
                  ★ QUÊTE {rar.label}
                </div>
              ) : null}

              <div style={{ font: `800 33px/1.02 ${F.display}`, color: C.ink, letterSpacing: '-.028em', marginTop: 18 }}>{card.name}</div>
              <div style={{ font: `400 13.5px/1.5 ${F.body}`, color: 'rgba(11,11,12,.66)', marginTop: 14, textWrap: 'pretty' }}>{card.desc}</div>

              <div style={{ display: 'flex', gap: 7, marginTop: 22, flexWrap: 'wrap' }}>
                <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(11,11,12,.6)', background: 'rgba(11,11,12,.09)', padding: '6px 11px', borderRadius: 99, letterSpacing: '.08em' }}>4 ÉTAPES</span>
                <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(11,11,12,.6)', background: 'rgba(11,11,12,.09)', padding: '6px 11px', borderRadius: 99, letterSpacing: '.08em' }}>PREUVE PHOTO</span>
              </div>

              {intent ? (
                <span
                  style={{
                    position: 'absolute', top: 20, [intent === 'add' ? 'left' : 'right']: 22,
                    font: `800 22px ${F.display}`, letterSpacing: '-.02em',
                    color: intent === 'add' ? C.ink : 'rgba(11,11,12,.5)',
                    border: '3px solid ' + (intent === 'add' ? C.ink : 'rgba(11,11,12,.4)'),
                    padding: '4px 10px', borderRadius: 10, transform: `rotate(${intent === 'add' ? -12 : 12}deg)`
                  } as React.CSSProperties}
                >
                  {intent === 'add' ? 'AU PLATEAU' : 'PASSER'}
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.4)', textAlign: 'center', marginTop: 18 }}>
            Glisse à droite pour ajouter, à gauche pour passer.
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Tap onTap={() => fling(-1)} style={{ flex: 1, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 22, padding: 18, textAlign: 'center', font: `700 14px ${F.body}`, color: 'rgba(255,255,255,.7)', minHeight: 58 }}>PASSER</Tap>
            <Tap onTap={() => fling(1)} haptic="success" style={{ flex: 1.4, background: C.lime, borderRadius: 22, padding: 18, textAlign: 'center', font: `800 17px ${F.display}`, color: C.ink, letterSpacing: '-.01em', minHeight: 58 }}>AJOUTER AU PLATEAU</Tap>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(198,242,78,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.4"><path d="M4 12.5l5 5L20 6.5" /></svg>
          </div>
          <div style={{ font: `800 24px ${F.display}`, color: '#fff', letterSpacing: '-.02em', marginTop: 20 }}>PIOCHE TERMINÉE</div>
          <div style={{ font: `400 13px/1.5 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 10, maxWidth: 260, marginInline: 'auto' }}>
            {added ? added + ' quête' + (added > 1 ? 's' : '') + ' ajoutée' + (added > 1 ? 's' : '') + ' à ton plateau. La prochaine fournée arrive demain.' : 'Rien retenu cette fois. Reviens demain pour une nouvelle fournée.'}
          </div>
          <Tap onTap={() => nav.back()} style={{ display: 'inline-flex', font: `700 13px ${F.body}`, color: C.ink, background: C.lime, padding: '16px 28px', borderRadius: 99, marginTop: 24, minHeight: 50, alignItems: 'center' }}>RETOUR AU PLATEAU</Tap>
        </div>
      )}
    </div>
  );
}
