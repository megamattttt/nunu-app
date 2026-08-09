import React, { useMemo, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { BADGES, BADGE_C, SKILLS, TITLES, skillById } from '../data/skills';
import { boardRows, levelOf, palierPct, pxOf } from '../state/selectors';
import { LEAGUES } from '../data/social';
import AvatarCut from '../components/avatar/AvatarCut';
import { Bar, Check, Kicker, Star, Tap, Bolt } from '../components/ui';
import type { Nav } from '../App';

type Sub = 'board' | 'perso' | 'coll' | 'amis';
const SUBS: [Sub, string][] = [['board', 'PLATEAU'], ['perso', 'PERSO'], ['coll', 'COLLECTION'], ['amis', 'AMIS']];

export default function Quests({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [ix, setIx] = useState(0);
  const [sub, setSub] = useState<Sub>('board');
  const [newTask, setNewTask] = useState('');
  const sk = SKILLS[ix];
  const rows = boardRows(s, sk.id);
  const lvl = levelOf(s, sk.id);
  const pct = palierPct(s, sk.id);
  const now = rows.find((r) => r.state === 'now');

  const friends = useMemo(() => LEAGUES.amis.slice(0, 5), []);

  return (
    <div>
      {/* Sélecteur de compétence */}
      <div style={{ padding: '16px 0 0' }}>
        <div style={{ padding: '0 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>MES COMPÉTENCES</Kicker>
          <Tap onTap={() => nav.open('discover')} style={{ font: `700 10px ${F.mono}`, color: C.lime, letterSpacing: '.1em', minHeight: 32, display: 'flex', alignItems: 'center' }}>+ DÉCOUVRIR</Tap>
        </div>

        <div style={{ display: 'flex', gap: 9, overflowX: 'auto', padding: '14px 22px 4px', scrollSnapType: 'x mandatory' }}>
          {SKILLS.map((k, i) => {
            const on = i === ix;
            return (
              <Tap
                key={k.id} onTap={() => setIx(i)} haptic="soft"
                style={{
                  flex: 'none', scrollSnapAlign: 'center', minWidth: 78, minHeight: 78, borderRadius: 22,
                  background: on ? k.c : 'rgba(255,255,255,.06)',
                  border: '1px solid ' + (on ? 'transparent' : 'rgba(255,255,255,.1)'),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  transform: on ? 'translateY(-4px)' : 'none', transition: 'all .22s cubic-bezier(.2,1,.3,1)'
                }}
              >
                <span style={{ font: `800 20px ${F.display}`, color: on ? k.txt : '#fff', letterSpacing: '-.02em' }}>{k.short}</span>
                <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.1em', color: on ? k.txt : 'rgba(255,255,255,.45)', opacity: on ? .7 : 1 }}>
                  NIV {levelOf(s, k.id)}
                </span>
              </Tap>
            );
          })}
        </div>

        <div style={{ padding: '10px 22px 0', textAlign: 'center' }}>
          <div style={{ font: `800 40px/1 ${F.display}`, color: sk.c, letterSpacing: '-.03em' }}>{sk.name}</div>
          <div style={{ font: `400 13px ${F.body}`, color: 'rgba(255,255,255,.6)', marginTop: 8 }}>{sk.title} · {pxOf(s, sk.id)} PX</div>
          <div style={{ display: 'inline-flex', gap: 8, marginTop: 12 }}>
            {sk.elo ? <span style={{ font: `700 10px ${F.mono}`, color: C.ink, background: sk.c, padding: '7px 13px', borderRadius: 99, letterSpacing: '.08em' }}>{sk.elo}</span> : null}
            <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.16)', padding: '7px 13px', borderRadius: 99, letterSpacing: '.1em' }}>SÉRIE {s.streak} J</span>
          </div>
        </div>
      </div>

      {/* Feuille claire */}
      <div style={{ background: C.paper, borderRadius: '34px 34px 0 0', marginTop: 18, padding: '20px 22px 30px', minHeight: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            <div style={{ background: '#fff', borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Kicker dark>PALIER EN COURS</Kicker>
                <span style={{ font: `700 11px ${F.mono}`, color: C.ink }}>{pxOf(s, sk.id)} / {sk.cap} PX</span>
              </div>
              <div style={{ display: 'flex', marginTop: 10 }}><Bar pct={pct} c={sk.c} h={10} track="rgba(11,11,12,.09)" /></div>
              <div style={{ font: `400 11.5px ${F.body}`, color: 'rgba(11,11,12,.55)', marginTop: 8 }}>
                {lvl} paliers validés sur {rows.length} · niveau {lvl}
              </div>
            </div>

            <div>
              {rows.map((r, i) => {
                const done = r.state === 'done', isNow = r.state === 'now';
                return (
                  <Tap
                    key={r.name + i}
                    onTap={() => { if (isNow) nav.open('validate', { skill: sk.id, ix: r.ix, name: r.name, px: r.px }); }}
                    sound={isNow}
                    style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: 10, opacity: r.state === 'lock' ? .55 : 1 }}
                  >
                    {i < rows.length - 1 ? (
                      <span style={{ position: 'absolute', left: 22, top: 48, bottom: 0, width: 2, background: 'repeating-linear-gradient(180deg,rgba(11,11,12,.22) 0 4px,transparent 4px 9px)' }} />
                    ) : null}
                    <span
                      style={{
                        width: 44, height: 44, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? sk.c : isNow ? C.lime : 'rgba(11,11,12,.08)',
                        border: isNow ? '2px solid ' + C.ink : 'none',
                        animation: isNow ? 'nuPulse 2.6s ease-out infinite' : undefined
                      }}
                    >
                      {done ? <Check /> : isNow ? (r.major ? <Star /> : <svg width="15" height="15" viewBox="0 0 24 24" fill={C.ink}><path d="M7 4l13 8-13 8z" /></svg>)
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(11,11,12,.45)" strokeWidth="2.2"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" /></svg>}
                    </span>
                    <span style={{ flex: 1, background: isNow ? '#fff' : 'transparent', borderRadius: 18, padding: isNow ? '13px 15px' : '10px 0', boxShadow: isNow ? '0 10px 24px -18px rgba(11,11,12,.9)' : 'none' }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ font: `${isNow ? 800 : 700} ${isNow ? 16 : 14}px ${isNow ? F.display : F.body}`, color: C.ink, letterSpacing: isNow ? '-.01em' : 0, textDecoration: done ? 'line-through' : 'none' }}>{r.name}</span>
                        <span style={{ font: `700 11px ${F.mono}`, color: done ? 'rgba(11,11,12,.4)' : C.ink, whiteSpace: 'nowrap' }}>+{r.px}</span>
                      </span>
                      <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(11,11,12,.5)', marginTop: 3 }}>
                        {done ? 'Validé' : isNow ? 'À valider maintenant' : 'Se débloque au palier ' + (r.ix)}
                      </span>
                      {r.major ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: `700 8.5px ${F.mono}`, letterSpacing: '.12em', color: C.ink, background: C.honey, padding: '4px 8px', borderRadius: 7, marginTop: 8 }}>★ PALIER MAJEUR</span>
                      ) : null}
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
                <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Nom, énergie, moment de la journée</span>
              </span>
            </Tap>
          </>
        )}

        {sub === 'perso' && (
          <>
            <div style={{ background: '#fff', borderRadius: 22, padding: '15px 17px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Kicker dark>ÉNERGIE DU JOUR</Kicker>
                <span style={{ font: `700 12px ${F.mono}`, color: C.ink }}>{s.energy}%</span>
              </div>
              <div style={{ display: 'flex', marginTop: 11 }}><Bar pct={s.energy} c={C.lime} h={14} track="rgba(11,11,12,.08)" /></div>
              <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(11,11,12,.58)', marginTop: 10, textWrap: 'pretty' }}>
                Chaque tâche cochée recharge ta barre de vie sur l’accueil. Ici, pas d’élo, pas de ligue, pas de comparaison.
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
                  <span style={{ font: `700 11px ${F.mono}`, color: t.done ? 'rgba(11,11,12,.35)' : C.ink }}>+{t.px} ⚡</span>
                </Tap>
              ))}
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
                const got = i <= Math.min(3, Math.floor(lvl / 2));
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
              Progression sur <b style={{ fontWeight: 700, color: C.ink }}>{sk.soft}</b> cette saison.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {friends.map((f) => (
                <div key={f[0]} style={{ display: 'flex', alignItems: 'center', gap: 12, background: f[0] === 'camille' ? C.ink : '#fff', borderRadius: 18, padding: '12px 14px' }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}><AvatarCut who={f[0] === 'camille' ? undefined : f[0]} av={f[0] === 'camille' ? s.profile.av : undefined} crop="face" /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ font: `700 13px ${F.body}`, color: f[0] === 'camille' ? '#fff' : C.ink }}>{f[1]}</span>
                      <span style={{ font: `700 11px ${F.mono}`, color: f[0] === 'camille' ? 'rgba(255,255,255,.6)' : 'rgba(11,11,12,.65)' }}>{f[4]}%</span>
                    </span>
                    <span style={{ display: 'block', height: 8, borderRadius: 99, background: f[0] === 'camille' ? 'rgba(255,255,255,.14)' : 'rgba(11,11,12,.08)', marginTop: 7, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: f[4] + '%', background: sk.c, borderRadius: 99 }} />
                    </span>
                  </span>
                  {f[0] !== 'camille' ? (
                    <Tap onTap={() => nav.open('quiz', { who: f[0], name: f[1], skill: sk.id })} style={{ font: `700 9px ${F.mono}`, letterSpacing: '.08em', color: C.ink, background: C.lime, padding: '10px 11px', borderRadius: 10, flex: 'none', minHeight: 40, display: 'flex', alignItems: 'center' }}>DÉFIER</Tap>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action au pouce */}
      {sub === 'board' && now ? (
        <Tap
          onTap={() => nav.open('validate', { skill: sk.id, ix: now.ix, name: now.name, px: now.px })}
          haptic="soft"
          style={{
            position: 'fixed', left: 18, right: 18, bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 12px)', zIndex: 30,
            background: C.lime, color: C.ink, borderRadius: 20, padding: '15px 18px', minHeight: 58,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 20px 40px -18px rgba(0,0,0,.8)'
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.14em', opacity: .6 }}>PROCHAIN PALIER</span>
            <span style={{ display: 'block', font: `800 17px ${F.display}`, letterSpacing: '-.01em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{now.name}</span>
          </span>
          <span style={{ font: `700 12px ${F.body}`, background: C.ink, color: C.lime, padding: '12px 18px', borderRadius: 99, flex: 'none' }}>VALIDER</span>
        </Tap>
      ) : null}
    </div>
  );
}
