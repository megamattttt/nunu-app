import React, { useMemo, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { RARITY, rarityOfBoard } from '../../data/quests';
import { MAX_ACTIVE_QUESTS } from '../../data/catalog';
import { SKILLS, skillById } from '../../data/skills';
import { activeIds, doneIds, pxOf } from '../../state/selectors';
import { suggest, stageOf, type Suggestion } from '../../lib/suggest';
import DiffBadge from '../../components/DiffBadge';
import { useSwipe } from '../../lib/useSwipe';
import { buzz } from '../../lib/haptics';
import { sfx } from '../../lib/sound';
import { Kicker, RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

const STAGE_LABEL = ['DÉBUT', 'EN ROUTE', 'CONFIRMÉE', 'AVANCÉE'];

/**
 * Découvrir : la vue détaillée du moteur de suggestion.
 * Une compétence à la fois, les raisons visibles, repioche à la demande.
 */
export default function Discover({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [skill, setSkill] = useState<string>(() => (nav.route?.data?.skill as string) || s.startSkill || SKILLS[0].id);
  const [seed, setSeed] = useState(1);
  const [ix, setIx] = useState(0);
  const [added, setAdded] = useState(0);

  const sk = skillById(skill);
  const px = pxOf(s, skill);
  const active = activeIds(s, skill);
  const done = doneIds(s, skill);
  const full = active.length >= MAX_ACTIVE_QUESTS;

  const list: Suggestion[] = useMemo(
    () => suggest({ skill, done, active, px, seed, n: 8 }),
    [skill, done.length, active.length, px, seed]
  );

  const sg = list[ix];
  const card = sg?.quest;
  const rar = card ? RARITY[rarityOfBoard(card.px, !!card.major)] : null;

  const next = (keep: boolean) => {
    if (!sg) return;
    if (keep) {
      if (sg.generated) {
        // Quête composée : elle n'existe pas au catalogue, on la crée en quête perso.
        d({ t: 'ADD_QUEST', skill, name: sg.quest.name, px: sg.quest.px, desc: sg.quest.description, diff: sg.quest.diff });
      } else {
        d({ t: 'ADD_ACTIVE_QUEST', skill, id: sg.quest.id });
      }
      setAdded((n) => n + 1);
      sfx.add(); buzz('success');
    } else { sfx.swipe(); }
    setIx((n) => n + 1);
  };

  const { handlers, dx, fling } = useSwipe({ onRight: () => next(true), onLeft: () => next(false) });
  const rot = dx / 22;
  const intent = Math.abs(dx) > 96 ? (dx > 0 ? 'add' : 'skip') : null;

  const refresh = () => { setSeed((v) => v + 1); setIx(0); };

  return (
    <div style={{ padding: '10px 22px 30px', minHeight: '70dvh', display: 'flex', flexDirection: 'column' }}>
      <RouteHead
        title="SUGGESTIONS"
        sub={card ? `${list.length - ix} propositions · ${added} ajoutée${added > 1 ? 's' : ''}` : 'Fin des propositions'}
        onBack={nav.back}
      />

      {/* Compétence */}
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 16, paddingBottom: 4 }}>
        {SKILLS.map((k) => (
          <Tap
            key={k.id} onTap={() => { setSkill(k.id); setIx(0); }} haptic="soft"
            style={{
              flex: 'none', font: `700 9.5px ${F.mono}`, letterSpacing: '.1em', padding: '9px 13px', borderRadius: 99, minHeight: 36,
              display: 'flex', alignItems: 'center',
              background: k.id === skill ? k.c : 'rgba(255,255,255,.07)',
              color: k.id === skill ? k.txt : 'rgba(255,255,255,.6)'
            }}
          >
            {k.name}
          </Tap>
        ))}
      </div>

      {/* Lecture du profil : ce sur quoi le moteur s'appuie */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', borderRadius: 16, padding: '12px 14px', marginTop: 12 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <Kicker>CE QUE JE REGARDE</Kicker>
          <span style={{ display: 'block', font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.6)', marginTop: 6, textWrap: 'pretty' }}>
            {done.length} quête{done.length > 1 ? 's' : ''} validée{done.length > 1 ? 's' : ''} · {px} PX · stade {STAGE_LABEL[stageOf(px)]} · {active.length}/{MAX_ACTIVE_QUESTS} en cours
          </span>
        </span>
        <Tap
          onTap={refresh} haptic="soft" aria-label="Repiocher"
          style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.4" strokeLinecap="round"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" /></svg>
        </Tap>
      </div>

      {card && rar ? (
        <>
          <div style={{ marginTop: 20, position: 'relative', flex: 1 }}>
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
                <span style={{ font: `700 9.5px ${F.mono}`, letterSpacing: '.14em', color: sk.txt, background: sk.c, padding: '6px 10px', borderRadius: 8 }}>{sk.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <DiffBadge diff={card.diff} size="sm" />
                  <span style={{ font: `700 12px ${F.mono}`, color: C.ink, background: 'rgba(11,11,12,.12)', padding: '6px 10px', borderRadius: 8 }}>+{card.px} PX</span>
                </span>
              </div>

              {card.major ? (
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, font: `700 9px ${F.mono}`, letterSpacing: '.16em', color: C.ink, background: 'rgba(11,11,12,.14)', padding: '6px 10px', borderRadius: 99 }}>
                  ★ PALIER MAJEUR
                </div>
              ) : sg.generated ? (
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, font: `700 9px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(11,11,12,.6)', border: '1px dashed rgba(11,11,12,.3)', padding: '6px 10px', borderRadius: 99 }}>
                  COMPOSÉE POUR TOI
                </div>
              ) : null}

              <div style={{ font: `800 31px/1.05 ${F.display}`, color: C.ink, letterSpacing: '-.028em', marginTop: 18, textWrap: 'pretty' }}>{card.name}</div>
              <div style={{ font: `400 13.5px/1.5 ${F.body}`, color: 'rgba(11,11,12,.66)', marginTop: 14, textWrap: 'pretty' }}>{card.description}</div>

              {/* Le pourquoi de la suggestion */}
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 18, background: 'rgba(11,11,12,.09)', borderRadius: 14, padding: '12px 13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" style={{ flex: 'none', marginTop: 1, opacity: .55 }}><path d="M12 3l2.2 6.2H21l-5.4 4 2 6.3L12 15.8 6.4 19.5l2-6.3L3 9.2h6.8z" /></svg>
                <span style={{ font: `400 12px/1.45 ${F.body}`, color: 'rgba(11,11,12,.7)', textWrap: 'pretty' }}>{sg.why}</span>
              </div>

              {(card.tags || []).length ? (
                <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
                  {(card.tags || []).map((t) => (
                    <span key={t} style={{ font: `500 10px ${F.mono}`, color: 'rgba(11,11,12,.55)', background: 'rgba(11,11,12,.07)', padding: '6px 11px', borderRadius: 99, letterSpacing: '.08em' }}>{t.toUpperCase()}</span>
                  ))}
                </div>
              ) : null}

              {intent ? (
                <span
                  style={{
                    position: 'absolute', top: 20, [intent === 'add' ? 'left' : 'right']: 22,
                    font: `800 20px ${F.display}`, letterSpacing: '-.02em',
                    color: intent === 'add' ? C.ink : 'rgba(11,11,12,.5)',
                    border: '3px solid ' + (intent === 'add' ? C.ink : 'rgba(11,11,12,.4)'),
                    padding: '4px 10px', borderRadius: 10, transform: `rotate(${intent === 'add' ? -12 : 12}deg)`
                  } as React.CSSProperties}
                >
                  {intent === 'add' ? 'EN COURS' : 'PASSER'}
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.4)', textAlign: 'center', marginTop: 18 }}>
            {full ? `Tes ${MAX_ACTIVE_QUESTS} places sont prises — libère-en une depuis l’écran Quêtes.` : 'Glisse à droite pour la mettre en cours, à gauche pour passer.'}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Tap onTap={() => fling(-1)} style={{ flex: 1, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 22, padding: 18, textAlign: 'center', font: `700 14px ${F.body}`, color: 'rgba(255,255,255,.7)', minHeight: 58 }}>PASSER</Tap>
            <Tap onTap={() => fling(1)} haptic="success" style={{ flex: 1.4, background: C.lime, borderRadius: 22, padding: 18, textAlign: 'center', font: `800 16px ${F.display}`, color: C.ink, letterSpacing: '-.01em', minHeight: 58 }}>METTRE EN COURS</Tap>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 50, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(185,222,100,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.4"><path d="M4 12.5l5 5L20 6.5" /></svg>
          </div>
          <div style={{ font: `800 24px ${F.display}`, color: '#fff', letterSpacing: '-.02em', marginTop: 20 }}>TU AS TOUT VU</div>
          <div style={{ font: `400 13px/1.5 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 10, maxWidth: 280, marginInline: 'auto', textWrap: 'pretty' }}>
            {added
              ? added + ' quête' + (added > 1 ? 's' : '') + ' mise' + (added > 1 ? 's' : '') + ' en cours. Repioche pour d’autres propositions, ou change de compétence.'
              : 'Repioche pour d’autres propositions, ou change de compétence.'}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Tap onTap={refresh} style={{ display: 'inline-flex', font: `700 13px ${F.body}`, color: C.ink, background: C.lime, padding: '16px 24px', borderRadius: 99, minHeight: 50, alignItems: 'center' }}>REPIOCHER</Tap>
            <Tap onTap={() => nav.back()} style={{ display: 'inline-flex', font: `700 13px ${F.body}`, color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.16)', padding: '16px 24px', borderRadius: 99, minHeight: 50, alignItems: 'center' }}>RETOUR</Tap>
          </div>
        </div>
      )}
    </div>
  );
}
