import React from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { skillById } from '../../data/skills';
import { weekStats, globalLevel, skillRank } from '../../state/selectors';
import WeekStrip from '../../components/WeekStrip';
import { RankIcon } from '../../components/RankIcon';
import { Kicker, RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

const D = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Bilan de la semaine glissée : lecture, statistiques et carte à partager. */
export default function Week({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const w = weekStats(s);
  const topSk = w.top ? skillById(w.top.skill) : null;
  const from = D.format(new Date(w.days[0].t));
  const to = D.format(new Date(w.days[w.days.length - 1].t));

  const share = async () => {
    const text =
      `Ma semaine sur Nunu — ${w.px} PX, ${w.n} validations, ${w.active}/7 jours actifs` +
      (topSk ? `, surtout en ${topSk.name.toLowerCase()}.` : '.');
    try {
      if (navigator.share) await navigator.share({ title: 'Ma semaine', text });
      else { await navigator.clipboard.writeText(text); d({ t: 'TOAST', msg: 'Bilan copié' }); }
    } catch { /* partage annulé */ }
  };

  const Stat = ({ k, v, sub, c }: { k: string; v: string; sub?: string; c?: string }) => (
    <div style={{ flex: 1, minWidth: 0, background: C.slate, border: `1px solid ${C.line}`, borderRadius: 20, padding: '14px 15px' }}>
      <div style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)' }}>{k}</div>
      <div style={{ font: `800 24px ${F.display}`, color: c || '#fff', letterSpacing: '-.02em', marginTop: 6 }}>{v}</div>
      {sub ? <div style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{sub}</div> : null}
    </div>
  );

  return (
    <div style={{ padding: '10px 22px 26px' }}>
      <RouteHead title="MA SEMAINE" sub={`${from} → ${to}`} onBack={nav.back} />

      {/* Carte partageable */}
      <section
        style={{
          background: `linear-gradient(150deg, ${C.slate}, ${C.night} 62%)`,
          border: `1px solid ${C.line}`, borderRadius: 28, padding: '20px 20px 22px', marginTop: 20,
          position: 'relative', overflow: 'hidden'
        }}
      >
        <span style={{ position: 'absolute', right: -70, top: -90, width: 220, height: 220, borderRadius: '50%', background: C.azur, opacity: .12, animation: 'nuHalo 9s ease-in-out infinite' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', position: 'relative' }}>
          <Kicker>BILAN HEBDOMADAIRE</Kicker>
          <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(255,255,255,.4)' }}>NIVEAU {globalLevel(s)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 14, position: 'relative' }}>
          <span style={{ font: `800 52px/.86 ${F.display}`, color: C.lime, letterSpacing: '-.045em' }}>{w.px}</span>
          <span style={{ font: `500 10px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.45)', paddingBottom: 7 }}>
            PX CETTE SEMAINE
          </span>
        </div>
        {w.delta !== null ? (
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, position: 'relative',
              background: w.delta >= 0 ? 'rgba(185,222,100,.14)' : 'rgba(226,104,90,.14)',
              border: `1px solid ${w.delta >= 0 ? C.lime : C.coral}44`,
              borderRadius: 99, padding: '5px 11px'
            }}
          >
            <span style={{ font: `700 10px ${F.mono}`, color: w.delta >= 0 ? C.lime : C.coral }}>
              {w.delta >= 0 ? '+' : ''}{w.delta} %
            </span>
            <span style={{ font: `400 10.5px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>vs semaine dernière</span>
          </div>
        ) : null}

        <div style={{ marginTop: 20, position: 'relative' }}>
          <WeekStrip days={w.days} h={62} />
        </div>

        <Tap
          onTap={share}
          style={{
            marginTop: 20, minHeight: 50, borderRadius: 16, background: C.lime, color: C.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, position: 'relative'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M8 8l4-4 4 4M5 14v5h14v-5" />
          </svg>
          <span style={{ font: `800 13px ${F.display}`, letterSpacing: '-.01em' }}>PARTAGER MA SEMAINE</span>
        </Tap>
      </section>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <Stat k="VALIDATIONS" v={String(w.n)} sub={w.n ? 'quêtes et tâches' : 'rien encore'} />
        <Stat k="JOURS ACTIFS" v={`${w.active}/7`} sub={w.streak ? `série de ${w.streak}` : 'série à lancer'} c={C.azur} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <Stat k="MEILLEUR JOUR" v={w.best?.px ? `${w.best.px} PX` : '—'} sub={w.best?.px ? D.format(new Date(w.best.t)) : undefined} c={C.honey} />
        <Stat k="MOYENNE / JOUR" v={`${Math.round(w.px / 7)} PX`} />
      </div>

      {topSk ? (
        <Tap
          onTap={() => nav.open('path', { skill: topSk.id })}
          style={{
            display: 'flex', alignItems: 'center', gap: 13, marginTop: 14,
            background: C.slate, border: `1px solid ${C.line}`, borderRadius: 22, padding: '16px 17px'
          }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 13, background: topSk.c, color: topSk.txt, font: `800 13px ${F.display}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            {topSk.short}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)' }}>COMPÉTENCE LA PLUS ACTIVE</span>
            <span style={{ display: 'block', font: `800 17px ${F.display}`, color: '#fff', letterSpacing: '-.01em', marginTop: 4 }}>
              {topSk.name} · {w.top!.px} PX
            </span>
          </span>
          <RankIcon rank={skillRank(s, topSk.id)} size={26} bg={C.slate} />
        </Tap>
      ) : null}

      <Kicker style={{ display: 'block', marginTop: 24 }}>JOUR PAR JOUR</Kicker>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {[...w.days].reverse().map((day) => {
          const rows = (s.history || []).filter((h) => h.t >= day.t && h.t < day.t + 864e5);
          return (
            <div key={day.t} style={{ background: C.night, border: `1px solid ${C.lineSoft}`, borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <span style={{ font: `700 13px ${F.body}`, color: day.px ? '#fff' : 'rgba(255,255,255,.45)' }}>
                  {day.today ? 'Aujourd’hui' : D.format(new Date(day.t))}
                </span>
                <span style={{ font: `700 11px ${F.mono}`, color: day.px ? C.lime : 'rgba(255,255,255,.28)' }}>
                  {day.px ? '+' + day.px + ' PX' : '—'}
                </span>
              </div>
              {rows.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {rows.slice(0, 6).map((r, i) => (
                    <span
                      key={i}
                      style={{
                        font: `500 10.5px ${F.body}`, color: 'rgba(255,255,255,.7)',
                        background: 'rgba(255,255,255,.06)', borderRadius: 8, padding: '5px 9px',
                        maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}
                    >
                      {r.name}
                    </span>
                  ))}
                  {rows.length > 6 ? (
                    <span style={{ font: `500 10.5px ${F.mono}`, color: 'rgba(255,255,255,.35)', padding: '5px 4px' }}>+{rows.length - 6}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
