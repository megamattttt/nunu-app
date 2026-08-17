import React, { useMemo, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import {
  MOODS, allIdeas, dayBg, filled, moodColor, searchCheckins, series, tagStats, weekReview,
  type Book, type Point, type Scale
} from '../data/checkin';
import { MoodFace } from './DayCheckin';
import { Tap } from './ui';
import { buzz } from '../lib/haptics';

const shortDate = (k: string) =>
  new Date(k + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

/** Segments continus d'une courbe : un trou = un jour non noté. */
function runs(pts: Point[], pick: (p: Point) => number): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = [];
  let cur: { x: number; y: number }[] = [];
  pts.forEach((p, i) => {
    const v = pick(p);
    if (!v) { if (cur.length) out.push(cur); cur = []; return; }
    cur.push({ x: (i / Math.max(1, pts.length - 1)) * 300, y: 84 - ((v - 1) / 4) * 68 });
  });
  if (cur.length) out.push(cur);
  return out;
}

const path = (r: { x: number; y: number }[]) =>
  r.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

/** Courbe humeur / énergie sur les n derniers jours. */
function Curve({ pts }: { pts: Point[] }) {
  const mood = runs(pts, (p) => p.mood);
  const nrg = runs(pts, (p) => p.energie);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 300 96" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 118 }}>
        {[1, 3, 5].map((v) => (
          <line
            key={v} x1="0" x2="300" y1={84 - ((v - 1) / 4) * 68} y2={84 - ((v - 1) / 4) * 68}
            stroke="rgba(255,255,255,.07)" strokeWidth="1" vectorEffect="non-scaling-stroke"
          />
        ))}
        {nrg.map((r, i) => (
          <path
            key={'e' + i} d={path(r)} fill="none" stroke={C.teal} strokeWidth="1.6" strokeLinejoin="round"
            strokeLinecap="round" opacity=".75" vectorEffect="non-scaling-stroke"
          />
        ))}
        {mood.map((r, i) => (
          <path
            key={'m' + i} d={path(r)} fill="none" stroke={C.honey} strokeWidth="2.2" strokeLinejoin="round"
            strokeLinecap="round" vectorEffect="non-scaling-stroke"
          />
        ))}
        {mood.flat().map((p, i) => (
          <circle key={'p' + i} cx={p.x} cy={p.y} r="1.6" fill={C.honey} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ font: `500 8.5px ${F.mono}`, color: 'rgba(255,255,255,.3)' }}>{shortDate(pts[0].day)}</span>
        <span style={{ font: `500 8.5px ${F.mono}`, color: 'rgba(255,255,255,.3)' }}>{shortDate(pts[pts.length - 1].day)}</span>
      </div>
    </div>
  );
}

function Card({ kicker, right, children }: { kicker: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 22, padding: '15px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, minHeight: 22 }}>
        <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(255,255,255,.4)' }}>{kicker}</span>
        {right}
      </div>
      <div style={{ marginTop: 13 }}>{children}</div>
    </div>
  );
}

/**
 * Tendances : la partie « à quoi ça sert ». Courbe du mois, bilan de semaine
 * écrit tout seul, ce que les mots-clés disent des bons jours, recherche dans
 * les pensées et les idées gardées.
 */
export default function CheckinInsights({ onClose }: { onClose: () => void }) {
  const { s, d } = useGame();
  const book: Book = (s as any).checkins || {};
  const [span, setSpan] = useState(30);
  const [week, setWeek] = useState(0);
  const [q, setQ] = useState('');

  const pts = useMemo(() => series(book, span), [book, span]);
  const review = useMemo(() => weekReview(book, week), [book, week]);
  const tags = useMemo(() => tagStats(book, 2), [book]);
  const hits = useMemo(() => searchCheckins(book, q), [book, q]);
  const ideas = useMemo(() => allIdeas(book).slice(0, 12), [book]);

  const notedDays = pts.filter((p) => p.mood > 0);
  const avg = notedDays.length ? Math.round((notedDays.reduce((a, b) => a + b.mood, 0) / notedDays.length) * 10) / 10 : 0;
  const total = Object.values(book).filter((c) => filled(c)).length;

  const toQuest = (text: string) => {
    d({ t: 'ADD_QUEST', skill: s.startSkill || 'perso', name: text, px: 15, rarity: 'commune', desc: 'Née d’une idée du point du jour.' });
    buzz('success');
  };

  return (
    <div
      role="dialog" aria-label="Tendances du point du jour"
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <Tap onTap={onClose} aria-label="Fermer" style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,8,.72)', animation: 'nuRise .2s ease both' }} />

      <div
        style={{
          position: 'relative', background: C.ink, borderRadius: '30px 30px 0 0', maxHeight: '92vh', overflowY: 'auto',
          padding: '10px 20px calc(24px + env(safe-area-inset-bottom))', border: `1px solid ${C.line}`, borderBottom: 'none',
          boxShadow: '0 -30px 60px -30px rgba(0,0,0,.9)', animation: 'nuRise .34s cubic-bezier(.2,1,.3,1) both'
        }}
      >
        <span style={{ display: 'block', width: 42, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.16)', margin: '4px auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(255,255,255,.38)' }}>MES TENDANCES</span>
            <span style={{ display: 'block', font: `800 21px/1.1 ${F.display}`, color: '#fff', letterSpacing: '-.03em', marginTop: 5 }}>
              {total ? `${total} jour${total > 1 ? 's' : ''} noté${total > 1 ? 's' : ''}` : 'Rien de noté encore'}
            </span>
          </span>
          <Tap
            onTap={onClose} aria-label="Fermer"
            style={{ width: 40, height: 40, borderRadius: 99, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </Tap>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {/* Courbe */}
          <Card
            kicker="HUMEUR ET ÉNERGIE"
            right={
              <div style={{ display: 'flex', gap: 5 }}>
                {[14, 30, 90].map((n) => (
                  <Tap
                    key={n} onTap={() => setSpan(n)} haptic="soft"
                    style={{
                      minHeight: 30, padding: '0 10px', borderRadius: 9, display: 'flex', alignItems: 'center',
                      background: span === n ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.05)',
                      font: `700 9px ${F.mono}`, color: span === n ? C.ink : 'rgba(255,255,255,.45)'
                    }}
                  >
                    {n} J
                  </Tap>
                ))}
              </div>
            }
          >
            {notedDays.length > 1 ? (
              <>
                <Curve pts={pts} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                  {([['HUMEUR', C.honey], ['ÉNERGIE', C.teal]] as const).map(([label, col]) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 14, height: 2, borderRadius: 99, background: col }} />
                      <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(255,255,255,.42)' }}>{label}</span>
                    </span>
                  ))}
                  <span style={{ marginLeft: 'auto', font: `700 10px ${F.mono}`, color: avg ? moodColor(Math.round(avg) as Scale) : 'rgba(255,255,255,.4)' }}>
                    {avg ? `moy. ${avg.toFixed(1).replace('.', ',')}/5` : '—'}
                  </span>
                </div>
              </>
            ) : (
              <span style={{ display: 'block', font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.42)' }}>
                Il faut deux jours notés pour dessiner une courbe.
              </span>
            )}
          </Card>

          {/* Bilan de semaine */}
          <Card
            kicker="BILAN DE SEMAINE"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tap onTap={() => setWeek((v) => v - 1)} aria-label="Semaine précédente" style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2.6" strokeLinecap="round"><path d="M14 6l-6 6 6 6" /></svg>
                </Tap>
                <span style={{ font: `700 9.5px ${F.mono}`, color: 'rgba(255,255,255,.55)', minWidth: 74, textAlign: 'center' }}>{review.title}</span>
                <Tap
                  onTap={() => setWeek((v) => Math.min(0, v + 1))} aria-label="Semaine suivante"
                  style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: week >= 0 ? .3 : 1 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2.6" strokeLinecap="round"><path d="M10 6l6 6-6 6" /></svg>
                </Tap>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {review.lines.map((l, i) => (
                <span key={i} style={{ display: 'flex', gap: 9, font: `400 12.5px/1.55 ${F.body}`, color: i === 0 ? '#fff' : 'rgba(255,255,255,.68)', textWrap: 'pretty' }}>
                  <span style={{ color: 'rgba(255,255,255,.25)', flex: 'none' }}>—</span>{l}
                </span>
              ))}
            </div>
          </Card>

          {/* Corrélations */}
          <Card kicker="CE QUE FONT TES MOTS-CLÉS">
            {tags.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tags.slice(0, 8).map((t) => {
                  const up = t.delta > 0;
                  const w = Math.min(100, Math.abs(t.delta) * 50);
                  return (
                    <div key={t.tag} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 74, flex: 'none', font: `500 12px ${F.body}`, color: 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tag}</span>
                      <span style={{ flex: 1, display: 'flex', alignItems: 'center', height: 12 }}>
                        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          {!up ? <span style={{ width: `${w}%`, height: 6, borderRadius: 99, background: C.coral, opacity: .8 }} /> : null}
                        </span>
                        <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,.14)', flex: 'none' }} />
                        <span style={{ flex: 1 }}>
                          {up ? <span style={{ display: 'block', width: `${w}%`, height: 6, borderRadius: 99, background: C.lime, opacity: .85 }} /> : null}
                        </span>
                      </span>
                      <span style={{ width: 58, flex: 'none', textAlign: 'right', font: `700 10px ${F.mono}`, color: t.delta > 0 ? C.lime : t.delta < 0 ? C.coral : 'rgba(255,255,255,.4)' }}>
                        {t.delta > 0 ? '+' : ''}{t.delta.toFixed(1).replace('.', ',')} · {t.n}
                      </span>
                    </div>
                  );
                })}
                <span style={{ font: `400 11px/1.5 ${F.body}`, color: 'rgba(255,255,255,.38)', marginTop: 3, textWrap: 'pretty' }}>
                  Écart à ton humeur habituelle, et nombre de jours concernés.
                </span>
              </div>
            ) : (
              <span style={{ display: 'block', font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.42)' }}>
                Pose des mots-clés sur quelques jours : leur effet apparaîtra ici.
              </span>
            )}
          </Card>

          {/* Recherche */}
          <Card kicker="RETROUVER">
            <input
              value={q} onChange={(ev) => setQ(ev.target.value)}
              placeholder="Chercher dans mes pensées, idées, prénoms"
              style={{
                width: '100%', background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 14, padding: '13px 14px', color: '#fff', font: `500 13px ${F.body}`, outline: 'none', minHeight: 48
              }}
            />
            {q.trim().length >= 2 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 11 }}>
                {hits.length ? hits.slice(0, 12).map((h, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 13, padding: '11px 12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MoodFace v={(book[h.day]?.mood || 0) as Scale} face={book[h.day]?.face} size={16} color="rgba(255,255,255,.25)" />
                      <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)' }}>{shortDate(h.day).toUpperCase()}</span>
                      <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.28)' }}>{h.field.toUpperCase()}</span>
                    </span>
                    <span style={{ display: 'block', font: `400 12.5px/1.5 ${F.body}`, color: 'rgba(255,255,255,.78)', marginTop: 6, textWrap: 'pretty' }}>{h.text}</span>
                  </div>
                )) : (
                  <span style={{ font: `400 12px ${F.body}`, color: 'rgba(255,255,255,.4)' }}>Rien trouvé.</span>
                )}
              </div>
            ) : null}
          </Card>

          {/* Idées gardées */}
          {ideas.length ? (
            <Card kicker="IDÉES GARDÉES">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {ideas.map((it, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.04)', borderRadius: 13, padding: '10px 10px 10px 13px' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.honey, flex: 'none' }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', font: `500 12.5px/1.4 ${F.body}`, color: 'rgba(255,255,255,.82)', textWrap: 'pretty' }}>{it.text}</span>
                      <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.08em', color: 'rgba(255,255,255,.3)', marginTop: 3 }}>{shortDate(it.day).toUpperCase()}</span>
                    </span>
                    <Tap
                      onTap={() => toQuest(it.text)} aria-label="Transformer en quête"
                      style={{ flex: 'none', minHeight: 34, padding: '0 11px', borderRadius: 99, background: 'rgba(185,222,100,.14)', border: `1px solid ${C.lime}55`, display: 'flex', alignItems: 'center' }}
                    >
                      <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.lime }}>→ QUÊTE</span>
                    </Tap>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Légende du code couleur, la même que les calendriers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '2px 4px 0' }}>
            {MOODS.map((m) => (
              <span key={m.v} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 14, height: 14, borderRadius: 5, background: dayBg(m.v, true) }} />
                <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.35)' }}>{m.label.toUpperCase()}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
