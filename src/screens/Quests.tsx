import React, { useEffect, useState } from 'react';
import { C, F } from '../theme';
import { useGame, COMBO_WINDOW, COMBO_STEPS, comboBonus } from '../state/store';
import { BADGES, BADGE_C, SKILLS, TITLES, skillById } from '../data/skills';
import { RARITY, isInstant } from '../data/quests';
import { boardRows, levelOf, pxOf, skillRank, skillNextRank } from '../state/selectors';
import { FRIENDS_RANK } from '../data/social';
import AvatarCut from '../components/avatar/AvatarCut';
import SkillWheel from '../components/SkillWheel';
import JournalCard from '../components/JournalCard';
import JournalEditor, { newEntry } from '../components/JournalEditor';
import type { JournalEntry } from '../state/types';
import { Bar, Check, Kicker, Star, Tap } from '../components/ui';
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

  return (
    <div
      style={{
        background: hot ? C.ink : '#fff', borderRadius: 20, padding: '14px 16px', position: 'relative', overflow: 'hidden',
        border: hot ? 'none' : '1px solid rgba(11,11,12,.08)'
      }}
    >
      {hot ? <span style={{ position: 'absolute', right: -50, top: -60, width: 160, height: 160, borderRadius: '50%', background: C.lime, opacity: .18, animation: 'nuHalo 4s ease-in-out infinite' }} /> : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
        <span
          key={n}
          style={{
            font: `800 26px/1 ${F.display}`, letterSpacing: '-.03em', color: hot ? C.lime : C.ink, flex: 'none',
            animation: 'nuComboIn .42s cubic-bezier(.2,1.2,.3,1)'
          }}
        >
          ×{n}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: hot ? 'rgba(255,255,255,.5)' : 'rgba(11,11,12,.45)' }}>
            COMBO EN COURS
          </span>
          <span style={{ display: 'block', font: `700 12px ${F.body}`, color: hot ? '#fff' : C.ink, marginTop: 3 }}>
            {bonus ? `+${bonus} % de PX` : 'Enchaîne pour déclencher le bonus'}
            {nextStep ? ` · ×${nextStep} au prochain palier` : ''}
          </span>
        </span>
        <span style={{ font: `700 10px ${F.mono}`, color: hot ? 'rgba(255,255,255,.55)' : 'rgba(11,11,12,.4)', flex: 'none' }}>{mins} MIN</span>
      </div>
      <span style={{ display: 'block', height: 5, borderRadius: 99, background: hot ? 'rgba(255,255,255,.14)' : 'rgba(11,11,12,.08)', overflow: 'hidden', marginTop: 11, position: 'relative' }}>
        <span style={{ display: 'block', height: '100%', width: pct + '%', borderRadius: 99, background: hot ? C.lime : C.ink, transition: 'width 1s linear' }} />
      </span>
      {best > 1 ? (
        <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.12em', color: hot ? 'rgba(255,255,255,.35)' : 'rgba(11,11,12,.35)', marginTop: 9, position: 'relative' }}>
          MEILLEURE CHAÎNE · ×{best}
        </span>
      ) : null}
    </div>
  );
}

type Sub = 'board' | 'journal' | 'perso' | 'coll' | 'amis';
const SUBS: [Sub, string][] = [['board', 'PLATEAU'], ['journal', 'JOURNAL'], ['perso', 'PERSO'], ['coll', 'COLL.'], ['amis', 'AMIS']];

export default function Quests({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  // La compétence en cours ouvre toujours la roue.
  const startId = s.startSkill || SKILLS[0].id;
  const [skillId, setSkillId] = useState(startId);
  const [sub, setSub] = useState<Sub>('board');
  const [newTask, setNewTask] = useState('');
  const [help, setHelp] = useState(false);
  const [flash, setFlash] = useState<{ ix: number; px: number } | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const sk = skillById(skillId);
  const rows = boardRows(s, sk.id);
  const lvl = levelOf(s, sk.id);
  const rank = skillRank(s, sk.id);
  const next = skillNextRank(s, sk.id);
  const now = rows.find((r) => r.state === 'now');

  const friends = FRIENDS_RANK.filter((f) => f[0] !== 'moi').slice(0, 5);

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
          <div style={{ font: `400 13px ${F.body}`, color: 'rgba(255,255,255,.6)' }}>{rank.label} · {pxOf(s, sk.id)} PX</div>
          <div style={{ display: 'inline-flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Tap onTap={() => nav.open('path', { skill: sk.id })} style={{ font: `700 10px ${F.mono}`, color: C.ink, background: sk.c, padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em', minHeight: 36, display: 'flex', alignItems: 'center' }}>
              VOIR LE CHEMIN
            </Tap>
            {s.onFire ? (
              <span style={{ font: `700 10px ${F.mono}`, color: '#fff', background: C.coral, padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em' }}>EN FEU · PX ×2</span>
            ) : (
              <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.16)', padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em' }}>ÉNERGIE {s.energy}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Feuille claire */}
      <div style={{ background: C.paper, borderRadius: '34px 34px 0 0', marginTop: 18, padding: '20px 22px', paddingBottom: sub === 'board' && now ? 86 : 26, minHeight: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {SUBS.map(([k, label]) => (
            <Tap
              key={k} onTap={() => setSub(k)} haptic="soft"
              style={{
                flex: 1, textAlign: 'center', font: `700 9.5px ${F.mono}`, letterSpacing: '.08em', padding: '11px 6px', borderRadius: 13, minHeight: 40,
                background: sub === k ? C.ink : 'rgba(11,11,12,.06)', color: sub === k ? C.paper : 'rgba(11,11,12,.55)'
              }}
            >
              {label}
            </Tap>
          ))}
        </div>

        {sub === 'board' && (
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
            <div style={{ background: '#fff', borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Kicker dark>RANG · {rank.label}</Kicker>
                <span style={{ font: `700 11px ${F.mono}`, color: C.ink }}>{isFinite(rank.pxNeed) ? `${rank.pxIn} / ${rank.pxNeed} PX` : 'MAX'}</span>
              </div>
              <div style={{ display: 'flex', marginTop: 10 }}><Bar pct={rank.pct} c={sk.c} h={10} track="rgba(11,11,12,.09)" /></div>
              <div style={{ font: `400 11.5px ${F.body}`, color: 'rgba(11,11,12,.55)', marginTop: 8 }}>
                {next ? `Prochain rang : ${next.label}` : 'Rang maximal'} · {lvl}/{rows.length} paliers validés
              </div>
            </div>

            <div>
              {rows.map((r, i) => {
                const done = r.state === 'done', isNow = r.state === 'now';
                const hit = flash?.ix === r.ix;
                const rar = RARITY[r.rarity];
                return (
                  <Tap
                    key={r.name + i}
                    onTap={() => act(r)}
                    sound={isNow}
                    haptic={isNow && isInstant(r.rarity) ? 'levelup' : 'tap'}
                    style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: 10, opacity: r.state === 'lock' ? .55 : 1 }}
                  >
                    {i < rows.length - 1 ? (
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
                        <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: rar.c, padding: '4px 8px', borderRadius: 7 }}>{rar.label}</span>
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
              <div style={{ background: '#fff', borderRadius: 20, padding: '15px 17px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Kicker dark>JOURNAL · {sk.name.toUpperCase()}</Kicker>
                  <span style={{ font: `700 11px ${F.mono}`, color: C.ink }}>{list.length} ENTRÉES</span>
                </div>
                <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(11,11,12,.58)', marginTop: 9, textWrap: 'pretty' }}>
                  Chaque palier validé ouvre une entrée à compléter : photos, note, ressenti, durée. {photos ? `${photos} photos enregistrées.` : 'Tout reste sur cet appareil.'}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Tap
                    onTap={() => setEntry(newEntry(sk.id))} haptic="soft"
                    style={{ flex: 1, minHeight: 46, borderRadius: 14, background: C.ink, color: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                    <span style={{ font: `800 13px ${F.display}`, letterSpacing: '-.01em' }}>NOUVELLE ENTRÉE</span>
                  </Tap>
                  <Tap
                    onTap={() => nav.open('journal')}
                    style={{ flex: 'none', minHeight: 46, padding: '0 16px', borderRadius: 14, background: 'rgba(11,11,12,.06)', display: 'flex', alignItems: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.6)' }}
                  >
                    TOUT VOIR
                  </Tap>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {list.map((e) => <JournalCard key={e.id} e={e} onTap={() => setEntry(e)} />)}
                {!list.length ? (
                  <div style={{ font: `400 12.5px/1.5 ${F.body}`, color: 'rgba(11,11,12,.5)', padding: '4px 2px', textWrap: 'pretty' }}>
                    Rien pour l’instant sur {sk.name.toLowerCase()}. Valide un palier, ou crée une entrée libre.
                  </div>
                ) : null}
              </div>
            </>
          );
        })()}

        {sub === 'perso' && (
          <>
            <div style={{ background: '#fff', borderRadius: 22, padding: '15px 17px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Kicker dark>ÉNERGIE</Kicker>
                <span style={{ font: `700 12px ${F.mono}`, color: s.onFire ? C.coral : C.ink }}>{s.energy}%</span>
              </div>
              <div style={{ display: 'flex', marginTop: 11 }}><Bar pct={s.energy} c={s.onFire ? C.coral : C.lime} h={14} track="rgba(11,11,12,.08)" /></div>
              <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(11,11,12,.58)', marginTop: 10, textWrap: 'pretty' }}>
                Chaque quête et chaque tâche cochée remplit la jauge. Pleine, tu passes en feu : PX doublés jusqu’à ce qu’elle se vide. Sans rien valider pendant 24 h, elle retombe à zéro.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.tasks.map((t) => (
                <Tap
                  key={t.id} onTap={() => d({ t: 'TOGGLE_TASK', id: t.id })} haptic={t.done ? 'soft' : 'success'}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, background: t.done ? 'rgba(11,11,12,.05)' : '#fff', borderRadius: 18, padding: '14px 15px', minHeight: 56 }}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 9, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.done ? C.lime : 'transparent', border: t.done ? 'none' : '2px solid rgba(11,11,12,.2)', animation: t.done ? 'nuTick .3s ease' : undefined }}>
                    {t.done ? <Check size={14} w={3.6} /> : null}
                  </span>
                  <span style={{ flex: 1, font: `${t.done ? 400 : 700} 13.5px ${F.body}`, color: t.done ? 'rgba(11,11,12,.42)' : C.ink, textDecoration: t.done ? 'line-through' : 'none' }}>{t.label}</span>
                  <span style={{ font: `700 11px ${F.mono}`, color: t.done ? 'rgba(11,11,12,.35)' : C.ink }}>+{t.px} PX</span>
                </Tap>
              ))}
              {!s.tasks.length ? (
                <div style={{ font: `400 12.5px/1.5 ${F.body}`, color: 'rgba(11,11,12,.5)', padding: '4px 2px' }}>
                  Rien pour l’instant. Ajoute une tâche du quotidien : elle compte comme une quête commune.
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); if (!newTask.trim()) return; d({ t: 'ADD_TASK', label: newTask.trim(), px: 8 }); setNewTask(''); }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Ajout rapide…"
                style={{ flex: 1, background: '#fff', border: '1px solid rgba(11,11,12,.12)', borderRadius: 16, padding: '14px', color: C.ink, font: `400 16px ${F.body}`, minHeight: 50 }}
              />
              <button type="submit" style={{ font: `700 11px ${F.mono}`, color: C.paper, background: C.ink, padding: '0 18px', borderRadius: 16, letterSpacing: '.08em', minHeight: 50 }}>AJOUTER</button>
            </form>
          </>
        )}

        {sub === 'coll' && (
          <>
            <Kicker dark>TITRES</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(TITLES[sk.id] || []).map(([name, req], i) => {
                const got = i <= Math.min(3, Math.floor(lvl / 2)) && lvl > 0;
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: got ? '#fff' : 'rgba(11,11,12,.04)', borderRadius: 18, padding: '13px 15px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: got ? sk.c : 'rgba(11,11,12,.2)', flex: 'none' }} />
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: got ? C.ink : 'rgba(11,11,12,.45)' }}>{name}</span>
                      <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(11,11,12,.45)', marginTop: 2 }}>{req}</span>
                    </span>
                    <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: got ? C.ink : 'rgba(11,11,12,.4)', background: got ? C.lime : 'rgba(11,11,12,.07)', padding: '5px 9px', borderRadius: 8 }}>{got ? 'OBTENU' : 'À FAIRE'}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
              <Kicker dark>BADGES</Kicker>
              <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(11,11,12,.4)' }}>{s.badges.filter((b) => b.startsWith(sk.id)).length}/6</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {(BADGES[sk.id] || []).map(([label, glyph], i) => {
                const got = s.badges.includes(sk.id + ':' + i);
                return (
                  <div key={label} style={{ background: got ? BADGE_C[i] : 'rgba(11,11,12,.05)', borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', font: `800 22px ${F.display}`, color: got ? C.ink : 'rgba(11,11,12,.25)' }}>{glyph}</span>
                    <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.06em', color: got ? 'rgba(11,11,12,.7)' : 'rgba(11,11,12,.3)', marginTop: 6 }}>{label.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {sub === 'amis' && (
          <>
            <div style={{ font: `400 12.5px/1.4 ${F.body}`, color: 'rgba(11,11,12,.6)' }}>
              Progression sur <b style={{ fontWeight: 700, color: C.ink }}>{sk.soft}</b> chez tes amis. Défie-les : l’enjeu est en PX.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {friends.map((f) => (
                <div key={f[0]} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: '12px 14px' }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}><AvatarCut who={f[0]} crop="face" /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ font: `700 13px ${F.body}`, color: C.ink }}>{f[1]}</span>
                      <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(11,11,12,.55)' }}>{f[2]}</span>
                    </span>
                    <span style={{ display: 'block', height: 8, borderRadius: 99, background: 'rgba(11,11,12,.08)', marginTop: 7, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: f[4] + '%', background: sk.c, borderRadius: 99 }} />
                    </span>
                  </span>
                  <Tap onTap={() => nav.open('quiz', { who: f[0], name: f[1], skill: sk.id })} style={{ font: `700 9px ${F.mono}`, letterSpacing: '.08em', color: C.ink, background: C.lime, padding: '10px 11px', borderRadius: 10, flex: 'none', minHeight: 40, display: 'flex', alignItems: 'center' }}>DÉFIER</Tap>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action au pouce */}
      {sub === 'board' && now ? (
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
