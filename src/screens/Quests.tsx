import React, { useEffect, useState } from 'react';
import { C, F } from '../theme';
import { useGame, COMBO_WINDOW, COMBO_STEPS, comboBonus } from '../state/store';
import { BADGES, BADGE_C, SKILLS, TITLES, skillById } from '../data/skills';
import { isInstant } from '../data/quests';
import { TIER_TIPS } from '../data/tips';
import { boardRows, levelOf, pxOf, skillRank, skillNextRank, baseCount } from '../state/selectors';
import SkillWheel from '../components/SkillWheel';
import DiffBadge from '../components/DiffBadge';
import DragList from '../components/DragList';
import PersoBoard from '../components/PersoBoard';
import { RankIcon, RankBadge } from '../components/RankIcon';
import JournalCard from '../components/JournalCard';
import JournalEditor, { newEntry } from '../components/JournalEditor';
import type { JournalEntry } from '../state/types';
import { Check, Kicker, Star, Tap } from '../components/ui';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';
import type { Nav } from '../App';

/** Chrono du combo : barre qui se vide, s'efface quand la chaîne expire. */
function ComboBar({ n, last, best }: { n: number; last: number | null; best: number }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!last) return;
    const id = window.setInterval(() => tick((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [last]);

  if (!last || n < 1) return null;
  const left = COMBO_WINDOW - (Date.now() - last);
  if (left <= 0) return null;

  const pct = Math.max(0, Math.min(100, (left / COMBO_WINDOW) * 100));
  const mins = Math.max(1, Math.round(left / 60e3));
  const bonus = Math.round(comboBonus(n) * 100);
  const nextStep = COMBO_STEPS.find((v) => v > n);
  const hot = n >= 3;
  const acc = hot ? C.coral : C.honey;

  return (
    <div
      style={{
        background: `linear-gradient(125deg, ${C.ink}, ${hot ? '#2A1A17' : '#1E1B18'} 55%, ${C.ink})`,
        borderRadius: 22, padding: '16px 17px', position: 'relative', overflow: 'hidden',
        border: `1px solid ${acc}66`,
        boxShadow: `0 22px 46px -30px ${acc}, inset 0 1px 0 rgba(255,255,255,.06)`
      }}
    >
      <span style={{ position: 'absolute', right: -60, top: -70, width: 180, height: 180, borderRadius: '50%', background: acc, opacity: hot ? .22 : .12, animation: `nuHalo ${hot ? 4 : 7}s ease-in-out infinite` }} />
      <span style={{ position: 'absolute', top: 0, bottom: 0, width: 90, background: `linear-gradient(90deg,transparent,${acc}22,transparent)`, animation: 'nuShine 3.6s ease-in-out infinite' }} />
      {/* Trame technique */}
      <span style={{ position: 'absolute', inset: 0, opacity: .5, backgroundImage: `repeating-linear-gradient(90deg, transparent 0 5px, rgba(255,255,255,.025) 5px 6px)` }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative' }}>
        {/* Multiplicateur dans une vignette à coins coupés */}
        <span
          key={n}
          style={{
            width: 54, height: 54, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'polygon(16% 0, 84% 0, 100% 16%, 100% 84%, 84% 100%, 16% 100%, 0 84%, 0 16%)',
            background: `linear-gradient(160deg, ${acc}, ${acc}55)`,
            animation: 'nuComboIn .42s cubic-bezier(.2,1.2,.3,1)'
          }}
        >
          <span style={{ font: `800 24px/1 ${F.display}`, letterSpacing: '-.04em', color: C.ink }}>×{n}</span>
        </span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: acc }}>
            {hot ? 'COMBO CHAUD' : 'COMBO EN COURS'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, flexWrap: 'wrap' }}>
            {bonus ? (
              <span style={{ font: `800 12px ${F.display}`, letterSpacing: '-.01em', color: C.ink, background: acc, padding: '4px 9px', borderRadius: 8 }}>
                +{bonus} % DE PX
              </span>
            ) : (
              <span style={{ font: `700 11.5px ${F.body}`, color: '#fff' }}>Enchaîne pour déclencher le bonus</span>
            )}
            {nextStep ? (
              <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)' }}>×{nextStep} AU PROCHAIN PALIER</span>
            ) : null}
          </span>
        </span>

        <span style={{ flex: 'none', textAlign: 'right' }}>
          <span style={{ display: 'block', font: `800 15px ${F.display}`, color: '#fff', letterSpacing: '-.02em' }}>{mins}</span>
          <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.4)' }}>MIN</span>
        </span>
      </div>

      <span style={{ display: 'block', height: 7, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden', marginTop: 14, position: 'relative' }}>
        <span style={{ display: 'block', height: '100%', width: pct + '%', borderRadius: 99, background: `linear-gradient(90deg,${acc},${C.honey})`, transition: 'width 1s linear' }} />
      </span>

      {best > 1 ? (
        <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(255,255,255,.35)', marginTop: 10, position: 'relative' }}>
          MEILLEURE CHAÎNE · ×{best}
        </span>
      ) : null}
    </div>
  );
}

type Sub = 'board' | 'journal' | 'coll';
const SUBS: [Sub, string][] = [['board', 'PLATEAU'], ['journal', 'JOURNAL'], ['coll', 'COLLECTION']];

export default function Quests({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  // La compétence en cours ouvre toujours la roue.
  const startId = s.startSkill || SKILLS[0].id;
  const [skillId, setSkillId] = useState(startId);
  const [sub, setSub] = useState<Sub>('board');
  const [help, setHelp] = useState(false);
  const [flash, setFlash] = useState<{ ix: number; px: number } | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const sk = skillById(skillId);
  const rows = boardRows(s, sk.id);
  const lvl = levelOf(s, sk.id);
  const rank = skillRank(s, sk.id);
  const next = skillNextRank(s, sk.id);
  const now = rows.find((r) => r.state === 'now');

  // Le plateau d'origine porte la progression ; les quêtes ajoutées se réordonnent à la main.
  const nBase = baseCount(sk.id);
  const base = rows.slice(0, nBase);
  const extras = rows.slice(nBase);
  const mine = s.customQuests.filter((q) => q.skill === sk.id);
  /** La compétence perso n'a pas de plateau : c'est une liste de rappels. */
  const isPerso = sk.id === 'perso';
  const persoName = (s.profile as any).persoName || 'Perso';

  /* L'espace perso prend le thème sombre de l'accueil ; les autres gardent la feuille claire. */
  const P = isPerso
    ? { sheet: C.ink, card: C.night, line: C.line, tx: '#fff', sub: 'rgba(255,255,255,.55)', soft: 'rgba(255,255,255,.06)', tabOn: C.lime, tabOnTx: C.ink, tabOff: 'rgba(255,255,255,.07)', tabOffTx: 'rgba(255,255,255,.55)' }
    : { sheet: C.paper, card: '#fff', line: 'transparent', tx: C.ink, sub: 'rgba(11,11,12,.55)', soft: 'rgba(11,11,12,.05)', tabOn: C.ink, tabOnTx: C.paper, tabOff: 'rgba(11,11,12,.06)', tabOffTx: 'rgba(11,11,12,.55)' };

  const act = (row: (typeof rows)[number]) => {
    if (row.state !== 'now') return;
    if (!isInstant(row.rarity)) {
      nav.open('validate', { skill: sk.id, ix: row.ix, name: row.name, px: row.px, rarity: row.rarity });
      return;
    }
    // La célébration part sur la ligne avant que l'état ne change : la coche,
    // l'onde et les PX qui s'envolent se voient, puis la récompense s'ouvre.
    const chain = s.combo.last && Date.now() - s.combo.last < COMBO_WINDOW ? s.combo.n + 1 : 1;
    setFlash({ ix: row.ix, px: Math.round(row.px * (s.onFire ? 2 : 1) * (1 + comboBonus(chain))) });
    buzz(COMBO_STEPS.includes(chain) ? 'milestone' : 'success');
    sfx.check();
    window.setTimeout(() => d({ t: 'VALIDATE', skill: sk.id, ix: row.ix, name: row.name, px: row.px, rarity: row.rarity }), 300);
    window.setTimeout(() => setFlash(null), 1100);
  };

  return (
    <div>
      {/* Sélecteur de compétence */}
      <div style={{ padding: '16px 0 0' }}>
        <div style={{ padding: '0 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>MES COMPÉTENCES</Kicker>
          <Tap onTap={() => nav.open('discover')} style={{ font: `700 10px ${F.mono}`, color: C.lime, letterSpacing: '.1em', minHeight: 32, display: 'flex', alignItems: 'center' }}>+ DÉCOUVRIR</Tap>
        </div>

        <SkillWheel currentId={startId} value={skillId} onChange={setSkillId} />

        <div style={{ padding: '14px 22px 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {isPerso ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', border: `1px solid ${sk.c}44`, borderRadius: 16, padding: '8px 12px 8px 14px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: sk.c, flex: 'none' }} />
                <span style={{ minWidth: 0, textAlign: 'left' }}>
                  <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)' }}>MON ESPACE</span>
                  <input
                    value={persoName}
                    onChange={(e) => d({ t: 'SET_PROFILE', patch: { persoName: e.target.value.slice(0, 22) } })}
                    aria-label="Nom de mon espace perso"
                    style={{ display: 'block', width: Math.max(6, persoName.length + 1) + 'ch', maxWidth: 200, background: 'transparent', border: 'none', outline: 'none', font: `800 17px/1.2 ${F.display}`, color: '#fff', letterSpacing: '-.02em', marginTop: 3, padding: 0 }}
                  />
                </span>
                <span style={{ width: 1, height: 26, background: 'rgba(255,255,255,.12)', flex: 'none' }} />
                <span style={{ font: `700 11px ${F.mono}`, color: sk.c, flex: 'none' }}>{pxOf(s, sk.id)} PX</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M4 20h4L20 8l-4-4L4 16z" /></svg>
              </span>
            ) : (
              <RankBadge rank={rank} skillName={`${sk.name} · ${pxOf(s, sk.id)} PX`} size="md" bg="rgba(255,255,255,.05)" />
            )}
          </div>
          <div style={{ display: 'inline-flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {sk.id !== 'perso' ? (
              <Tap onTap={() => nav.open('path', { skill: sk.id })} style={{ font: `700 10px ${F.mono}`, color: C.ink, background: sk.c, padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em', minHeight: 36, display: 'flex', alignItems: 'center' }}>
                VOIR LE CHEMIN
              </Tap>
            ) : (
              <Tap onTap={() => nav.open('path', { skill: sk.id })} style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.7)', border: `1px solid ${sk.c}66`, padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em', minHeight: 36, display: 'flex', alignItems: 'center' }}>
                TOUT VOIR
              </Tap>
            )}
            {s.onFire ? (
              <span style={{ font: `700 10px ${F.mono}`, color: '#fff', background: C.coral, padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em' }}>EN FEU · PX ×2</span>
            ) : (
              <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.16)', padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em' }}>ÉNERGIE {s.energy}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Feuille claire */}
      <div style={{ background: P.sheet, borderRadius: '34px 34px 0 0', marginTop: 18, padding: '20px 22px', paddingBottom: sub === 'board' && now && !isPerso ? 86 : 26, minHeight: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {SUBS.map(([k, label]) => (
            <Tap
              key={k} onTap={() => setSub(k)} haptic="soft"
              style={{
                flex: 1, textAlign: 'center', font: `700 9.5px ${F.mono}`, letterSpacing: '.08em', padding: '11px 6px', borderRadius: 13, minHeight: 40,
                background: sub === k ? P.tabOn : P.tabOff, color: sub === k ? P.tabOnTx : P.tabOffTx
              }}
            >
              {label}
            </Tap>
          ))}
        </div>

        {sub === 'board' && isPerso ? (
          <PersoBoard onSettings={() => nav.go('profile')} />
        ) : null}

        {sub === 'board' && !isPerso && (
          <>
            <ComboBar n={s.combo.n} last={s.combo.last} best={s.combo.best} />

            {/* Règle de validation */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '14px 16px' }}>
              <Tap onTap={() => { setHelp((h) => !h); if (!s.seen.questHelp) d({ t: 'SEEN', key: 'questHelp' }); }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: 99, background: C.ink, color: C.paper, font: `800 13px ${F.display}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>?</span>
                <span style={{ flex: 1, font: `700 13px ${F.body}`, color: C.ink }}>Valider une quête, ça veut dire quoi ?</span>
                <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(11,11,12,.4)' }}>{help ? '−' : '+'}</span>
              </Tap>
              {help || !s.seen.questHelp ? (
                <div style={{ font: `400 12px/1.5 ${F.body}`, color: 'rgba(11,11,12,.65)', marginTop: 10, textWrap: 'pretty' }}>
                  <b style={{ fontWeight: 700, color: C.ink }}>Quête simple (commune ou rare)</b> : tu l’as faite, tu tapes une fois. Les PX tombent tout de suite.<br />
                  <b style={{ fontWeight: 700, color: C.ink }}>Palier important (légendaire)</b> : tu coches les étapes et tu ajoutes une preuve photo. C’est ce qui déclenche une carte partageable.
                </div>
              ) : null}
            </div>

            {/* Rang de la compétence */}
            <div style={{ background: C.ink, borderRadius: 22, padding: '16px 17px', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', right: -60, top: -70, width: 180, height: 180, borderRadius: '50%', background: rank.c, opacity: .16 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative' }}>
                <RankIcon rank={rank} size={44} bg={C.ink} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(255,255,255,.45)' }}>RANG · {sk.name}</span>
                  <span style={{ display: 'block', font: `800 22px/1 ${F.display}`, color: rank.c, letterSpacing: '-.025em', marginTop: 5 }}>{rank.label}</span>
                </span>
                <span style={{ font: `700 10.5px ${F.mono}`, color: 'rgba(255,255,255,.6)', flex: 'none' }}>
                  {isFinite(rank.pxNeed) ? `${rank.pxIn}/${rank.pxNeed}` : 'MAX'}
                </span>
              </div>
              {/* Barre d'expérience segmentée */}
              <div style={{ position: 'relative', marginTop: 14, height: 12, borderRadius: 99, background: 'rgba(255,255,255,.09)', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: rank.pct + '%', borderRadius: 99, background: `linear-gradient(90deg,${rank.c}, #fff)`, transition: 'width .8s cubic-bezier(.2,1,.3,1)' }} />
                <span style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 13px, rgba(11,11,12,.55) 13px 15px)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, font: `500 9px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(255,255,255,.42)', marginTop: 10, position: 'relative' }}>
                <span>{lvl}/{nBase} PALIERS</span>
                <span>{next ? 'SUIVANT · ' + next.label : 'RANG MAXIMAL'}</span>
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 13, background: 'rgba(255,255,255,.05)', borderRadius: 14, padding: '11px 12px', position: 'relative' }}>
                <span style={{ width: 3, borderRadius: 99, background: rank.c, flex: 'none' }} />
                <span style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.7)', textWrap: 'pretty' }}>{TIER_TIPS[rank.tier]}</span>
              </div>
            </div>

            <div>
              {base.map((r, i) => {
                const done = r.state === 'done', isNow = r.state === 'now';
                const hit = flash?.ix === r.ix;
                return (
                  <Tap
                    key={r.name + i}
                    onTap={() => act(r)}
                    sound={isNow}
                    haptic={isNow && isInstant(r.rarity) ? 'levelup' : 'tap'}
                    style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: 12, opacity: r.state === 'lock' ? .5 : 1 }}
                  >
                    {i < base.length - 1 ? (
                      <span style={{ position: 'absolute', left: 22, top: 48, bottom: 0, width: 2, background: 'repeating-linear-gradient(180deg,rgba(11,11,12,.22) 0 4px,transparent 4px 9px)' }} />
                    ) : null}
                    <span
                      style={{
                        width: 44, height: 44, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        background: hit || done ? sk.c : isNow ? C.lime : 'rgba(11,11,12,.08)',
                        border: isNow ? '2px solid ' + C.ink : 'none',
                        animation: hit ? 'nuTick .4s cubic-bezier(.2,1.4,.3,1)' : isNow ? 'nuPulse 2.6s ease-out infinite' : undefined
                      }}
                    >
                      {hit ? (
                        <>
                          <span style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '3px solid ' + C.ink, animation: 'nuBurst .7s cubic-bezier(.2,1,.3,1) forwards' }} />
                          <span style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid ' + sk.c, animation: 'nuBurst .9s .12s cubic-bezier(.2,1,.3,1) forwards' }} />
                          <span style={{ position: 'absolute', left: '50%', bottom: '100%', marginLeft: -26, width: 52, textAlign: 'center', font: `800 17px ${F.display}`, color: C.ink, animation: 'nuFly 1s cubic-bezier(.2,1,.3,1) forwards', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                            +{flash!.px}
                          </span>
                        </>
                      ) : null}
                      {done || hit ? <Check /> : isNow ? (r.major ? <Star /> : <svg width="15" height="15" viewBox="0 0 24 24" fill={C.ink}><path d="M7 4l13 8-13 8z" /></svg>)
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(11,11,12,.45)" strokeWidth="2.2"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" /></svg>}
                    </span>
                    <span style={{ flex: 1, background: isNow ? '#fff' : 'transparent', borderRadius: 18, padding: isNow ? '13px 15px' : '10px 0', boxShadow: hit ? '0 0 0 2px ' + sk.c : isNow ? '0 10px 24px -18px rgba(11,11,12,.9)' : 'none', transition: 'box-shadow .25s ease' }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ position: 'relative', font: `${isNow ? 800 : 700} ${isNow ? 16 : 14}px ${isNow ? F.display : F.body}`, color: C.ink, letterSpacing: isNow ? '-.01em' : 0, textDecoration: done ? 'line-through' : 'none' }}>
                          {r.name}
                          {hit ? <span style={{ position: 'absolute', left: 0, right: 0, top: '52%', height: 2, background: C.ink, transformOrigin: 'left', animation: 'nuStrike .3s cubic-bezier(.2,1,.3,1) forwards' }} /> : null}
                        </span>
                        <span style={{ font: `700 11px ${F.mono}`, color: done ? 'rgba(11,11,12,.4)' : C.ink, whiteSpace: 'nowrap' }}>+{s.onFire && isNow ? r.px * 2 : r.px}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, flexWrap: 'wrap' }}>
                        <DiffBadge diff={r.diff} size="sm" />
                        {r.link ? (
                          <Tap
                            onTap={() => window.open(r.link!, '_blank', 'noopener')}
                            haptic="soft"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(11,11,12,.08)', borderRadius: 7, padding: '4px 8px' }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinejoin="round"><path d="M4 6h16v12H4z" /><path d="M10 9.5l5 2.5-5 2.5z" fill={C.ink} /></svg>
                            <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.ink }}>VOIR LE TUTO</span>
                          </Tap>
                        ) : null}
                        <span style={{ font: `400 11.5px ${F.body}`, color: 'rgba(11,11,12,.5)' }}>
                          {done ? 'Validé' : isNow ? (isInstant(r.rarity) ? 'Un tap suffit' : 'Preuve à l’appui') : 'Se débloque au palier ' + r.ix}
                        </span>
                        {done ? (() => {
                          const je = s.journal.find((x) => x.skill === sk.id && x.ix === r.ix);
                          const filled = je && (je.note || je.photos.length || je.mood >= 0);
                          return (
                            <Tap
                              onTap={() => setEntry(je || newEntry(sk.id, r.ix, r.name))} haptic="soft"
                              aria-label="Documenter ce palier"
                              style={{
                                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 9, padding: '5px 9px',
                                background: filled ? sk.c : 'rgba(11,11,12,.06)'
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={filled ? sk.txt : 'rgba(11,11,12,.5)'} strokeWidth="1.9" strokeLinejoin="round">
                                <path d="M3 8.5h3.2L8 6h8l1.8 2.5H21V19H3z" /><circle cx="12" cy="13.2" r="3.4" />
                              </svg>
                              {je?.photos.length ? <span style={{ font: `700 9px ${F.mono}`, color: filled ? sk.txt : 'rgba(11,11,12,.5)' }}>{je.photos.length}</span> : null}
                            </Tap>
                          );
                        })() : null}
                      </span>
                    </span>
                  </Tap>
                );
              })}
            </div>

            {/* Quêtes ajoutées : ordre libre, glisser-déposer par la poignée */}
            {extras.length ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <Kicker dark>QUÊTES AJOUTÉES · {extras.length}</Kicker>
                  <Tap
                    onTap={() => d({ t: 'SORT_QUESTS', skill: sk.id })} haptic="soft"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 32, padding: '0 10px', borderRadius: 9, background: 'rgba(10,10,12,.06)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round"><path d="M4 7h16M4 12h10M4 17h5" /></svg>
                    <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.ink }}>TRIER</span>
                  </Tap>
                </div>

                <DragList count={extras.length} onMove={(from, to) => d({ t: 'MOVE_QUEST', skill: sk.id, from, to })}>
                  {(i, handle, dragging) => {
                    const r = extras[i];
                    const done = r.state === 'done';
                    const hit = flash?.ix === r.ix;
                    return (
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 18, padding: '12px 13px',
                          border: dragging ? `1px solid ${sk.c}` : '1px solid rgba(10,10,12,.07)',
                          opacity: done ? .6 : 1
                        }}
                      >
                        <span
                          {...handle}
                          aria-label="Déplacer"
                          style={{ width: 30, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', cursor: 'grab', touchAction: 'none' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(10,10,12,.28)">
                            <circle cx="9" cy="6" r="1.7" /><circle cx="15" cy="6" r="1.7" /><circle cx="9" cy="12" r="1.7" />
                            <circle cx="15" cy="12" r="1.7" /><circle cx="9" cy="18" r="1.7" /><circle cx="15" cy="18" r="1.7" />
                          </svg>
                        </span>
                        <Tap onTap={() => act(r)} sound={!done} style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                            <span style={{ font: `700 14px ${F.body}`, color: C.ink, textDecoration: done ? 'line-through' : 'none' }}>{r.name}</span>
                            <span style={{ font: `700 11px ${F.mono}`, color: done ? 'rgba(10,10,12,.4)' : C.ink, whiteSpace: 'nowrap' }}>+{s.onFire && !done ? r.px * 2 : r.px}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7, flexWrap: 'wrap' }}>
                            <DiffBadge diff={r.diff} size="sm" />
                            {r.link ? (
                              <Tap
                                onTap={() => window.open(r.link!, '_blank', 'noopener')} haptic="soft"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(10,10,12,.07)', borderRadius: 7, padding: '4px 8px' }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinejoin="round"><path d="M4 6h16v12H4z" /><path d="M10 9.5l5 2.5-5 2.5z" fill={C.ink} /></svg>
                                <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.ink }}>TUTO</span>
                              </Tap>
                            ) : null}
                            <span style={{ font: `400 11.5px ${F.body}`, color: 'rgba(10,10,12,.5)' }}>
                              {done ? 'Validé' : isInstant(r.rarity) ? 'Un tap suffit' : 'Preuve à l’appui'}
                            </span>
                            {hit ? <span style={{ font: `700 11px ${F.mono}`, color: sk.c }}>+{flash!.px}</span> : null}
                          </span>
                        </Tap>
                        <Tap
                          onTap={() => { if (r.id && confirm('Retirer « ' + r.name + ' » du plateau ?')) d({ t: 'DEL_QUEST', id: r.id }); }}
                          aria-label="Retirer"
                          style={{ width: 34, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(10,10,12,.3)" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </Tap>
                      </div>
                    );
                  }}
                </DragList>
              </>
            ) : null}

            <Tap onTap={() => nav.open('newquest', { skill: sk.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.ink, borderRadius: 20, padding: '15px 17px', minHeight: 56 }}>
              <span style={{ width: 28, height: 28, borderRadius: 10, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: '#fff' }}>Créer une quête perso</span>
                <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Nom, effort, moment de la journée</span>
              </span>
            </Tap>
          </>
        )}

        {sub === 'journal' && (() => {
          const list = s.journal.filter((e) => e.skill === sk.id).slice().sort((a, b) => b.when - a.when);
          const photos = list.reduce((n, e) => n + e.photos.length, 0);
          return (
            <>
              <div style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: 20, padding: '15px 17px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Kicker dark={!isPerso}>JOURNAL · {(isPerso ? persoName : sk.name).toUpperCase()}</Kicker>
                  <span style={{ font: `700 11px ${F.mono}`, color: P.tx }}>{list.length} ENTRÉES</span>
                </div>
                <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: P.sub, marginTop: 9, textWrap: 'pretty' }}>
                  Chaque palier validé ouvre une entrée à compléter : photos, note, ressenti, durée. {photos ? `${photos} photos enregistrées.` : 'Tout reste sur cet appareil.'}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Tap
                    onTap={() => setEntry(newEntry(sk.id))} haptic="soft"
                    style={{ flex: 1, minHeight: 46, borderRadius: 14, background: isPerso ? C.lime : C.ink, color: isPerso ? C.ink : C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isPerso ? C.ink : C.lime} strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                    <span style={{ font: `800 13px ${F.display}`, letterSpacing: '-.01em' }}>NOUVELLE ENTRÉE</span>
                  </Tap>
                  <Tap
                    onTap={() => nav.open('journal')}
                    style={{ flex: 'none', minHeight: 46, padding: '0 16px', borderRadius: 14, background: P.soft, display: 'flex', alignItems: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: P.sub }}
                  >
                    TOUT VOIR
                  </Tap>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {list.map((e) => <JournalCard key={e.id} e={e} onTap={() => setEntry(e)} />)}
                {!list.length ? (
                  <div style={{ font: `400 12.5px/1.5 ${F.body}`, color: P.sub, padding: '4px 2px', textWrap: 'pretty' }}>
                    Rien pour l’instant sur {(isPerso ? persoName : sk.name).toLowerCase()}. Valide un palier, ou crée une entrée libre.
                  </div>
                ) : null}
              </div>
            </>
          );
        })()}

        {sub === 'coll' && (
          <>
            <Kicker dark={!isPerso}>TITRES</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(TITLES[sk.id] || []).map(([name, req], i) => {
                const got = i <= Math.min(3, Math.floor(lvl / 2)) && lvl > 0;
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: got ? P.card : P.soft, border: `1px solid ${got ? P.line : 'transparent'}`, borderRadius: 18, padding: '13px 15px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: got ? sk.c : P.soft, flex: 'none' }} />
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: got ? P.tx : P.sub }}>{name}</span>
                      <span style={{ display: 'block', font: `400 11px ${F.body}`, color: P.sub, marginTop: 2 }}>{req}</span>
                    </span>
                    <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: got ? C.ink : P.sub, background: got ? C.lime : P.soft, padding: '5px 9px', borderRadius: 8 }}>{got ? 'OBTENU' : 'À FAIRE'}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
              <Kicker dark={!isPerso}>BADGES</Kicker>
              <span style={{ font: `500 10px ${F.mono}`, color: P.sub }}>{s.badges.filter((b) => b.startsWith(sk.id)).length}/6</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {(BADGES[sk.id] || []).map(([label, glyph], i) => {
                const got = s.badges.includes(sk.id + ':' + i);
                return (
                  <div key={label} style={{ background: got ? BADGE_C[i] : P.soft, borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', font: `800 22px ${F.display}`, color: got ? C.ink : P.sub }}>{glyph}</span>
                    <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.06em', color: got ? 'rgba(11,11,12,.7)' : P.sub, marginTop: 6 }}>{label.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

              </div>

      {/* Action au pouce */}
      {sub === 'board' && !isPerso && now ? (
        <Tap
          onTap={() => act(now)}
          haptic="soft"
          style={{
            position: 'fixed', left: 18, right: 18, bottom: 'calc(var(--dock-h) + 12px)', zIndex: 30,
            background: C.lime, color: C.ink, borderRadius: 20, padding: '15px 18px', minHeight: 58,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 20px 40px -18px rgba(0,0,0,.8)'
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: `500 9px ${F.mono}`, letterSpacing: '.14em', opacity: .6 }}>
              PROCHAIN PALIER
              {s.combo.n > 1 ? <span style={{ background: C.ink, color: C.lime, borderRadius: 99, padding: '3px 7px', opacity: 1, letterSpacing: '.06em' }}>COMBO ×{s.combo.n}</span> : null}
            </span>
            <span style={{ display: 'block', font: `800 17px ${F.display}`, letterSpacing: '-.01em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{now.name}</span>
          </span>
          <span style={{ font: `700 12px ${F.body}`, background: C.ink, color: C.lime, padding: '12px 18px', borderRadius: 99, flex: 'none' }}>VALIDER</span>
        </Tap>
      ) : null}

      {entry ? <JournalEditor entry={entry} onClose={() => setEntry(null)} /> : null}
    </div>
  );
}
