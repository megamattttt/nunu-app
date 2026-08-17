import React, { useMemo, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import {
  DEFAULT_FACE, MONTHS, WEEKDAYS, avgOf, dayBg, dayKey, faceLabel, filled, moodColor, moodSrc,
  monthGrid, weekGrid, weekStart, type DayCheckin as Entry, type Scale
} from '../data/checkin';
import { MoodFace } from './DayCheckin';
import { Kicker, Tap } from './ui';

type Period = 'week' | 'month';

/** Une case du calendrier : fond = humeur, visage = humeur, points = quêtes validées. */
function Cell({ day, mood, face, quests, dark, sel, onTap }: {
  day: string | null; mood: Scale; face?: string; quests: number; dark: boolean; sel: boolean; onTap: () => void;
}) {
  if (!day) return <span />;
  const today = day === dayKey();
  const n = Number(day.slice(8));
  const tx = dark ? '#fff' : C.ink;
  const noted = !!(mood || face);
  return (
    <Tap
      onTap={onTap} haptic="soft" aria-label={`${n} — ${faceLabel({ mood, face })}`}
      style={{
        position: 'relative', aspectRatio: '1', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 34, overflow: 'hidden',
        background: dayBg(mood, dark),
        border: sel ? `2px solid ${tx}` : today ? `1px solid ${dark ? 'rgba(255,255,255,.5)' : 'rgba(11,11,12,.45)'}` : '1px solid transparent'
      }}
    >
      {noted ? (
        <span style={{ position: 'absolute', inset: '15%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={moodSrc(face || DEFAULT_FACE[mood])} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'transparent' }}
          />
        </span>
      ) : null}
      <span
        style={{
          position: noted ? 'absolute' : 'relative', top: noted ? 1 : undefined, left: noted ? 3 : undefined,
          font: `700 ${noted ? 8 : 11}px ${F.mono}`,
          color: noted ? tx : dark ? 'rgba(255,255,255,.4)' : 'rgba(11,11,12,.4)',
          textShadow: noted ? (dark ? '0 1px 2px rgba(0,0,0,.65)' : '0 1px 2px rgba(255,255,255,.7)') : 'none'
        }}
      >
        {n}
      </span>
      <span style={{ position: 'absolute', bottom: 2, display: 'flex', gap: 2, height: 4 }}>
        {Array.from({ length: Math.min(3, quests) }, (_, i) => (
          <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: C.lime, boxShadow: '0 0 0 1px rgba(10,10,12,.35)' }} />
        ))}
      </span>
    </Tap>
  );
}

function Stat({ label, value, sub, col, dark }: { label: string; value: string; sub?: string; col: string; dark: boolean }) {
  return (
    <div style={{ background: dark ? 'rgba(255,255,255,.05)' : 'rgba(11,11,12,.04)', borderRadius: 14, padding: '11px 12px' }}>
      <span style={{ display: 'block', font: `500 7.5px ${F.mono}`, letterSpacing: '.16em', color: dark ? 'rgba(255,255,255,.42)' : 'rgba(11,11,12,.45)' }}>{label}</span>
      <span style={{ display: 'block', font: `800 19px/1 ${F.display}`, color: col, letterSpacing: '-.025em', marginTop: 6 }}>{value}</span>
      {sub ? (
        <span style={{ display: 'block', font: `500 10px ${F.body}`, color: dark ? 'rgba(255,255,255,.4)' : 'rgba(11,11,12,.45)', marginTop: 4 }}>{sub}</span>
      ) : null}
    </div>
  );
}

/**
 * Calendrier du mois (ou de la semaine) et rétrospective de la période, pour
 * une compétence donnée : ce qui a été validé, et l'humeur notée en fond.
 */
export default function RetroCalendar({ skill, dark = true }: { skill: string; dark?: boolean }) {
  const { s } = useGame();
  const [period, setPeriod] = useState<Period>('month');
  const [offset, setOffset] = useState(0);
  const [sel, setSel] = useState<string | null>(null);

  const checkins: Record<string, Entry> = (s as any).checkins || {};
  const history = s.history || [];

  /* Fenêtre courante : semaine décalée de `offset`, ou mois décalé de `offset`. */
  const { days, title, from, to } = useMemo(() => {
    if (period === 'week') {
      const start = weekStart(Date.now() + offset * 7 * 864e5);
      const end = new Date(start.getTime() + 7 * 864e5);
      const g = weekGrid(start);
      return {
        days: g as (string | null)[], from: start.getTime(), to: end.getTime(),
        title: `${start.getDate()} – ${new Date(end.getTime() - 864e5).getDate()} ${MONTHS[new Date(end.getTime() - 864e5).getMonth()]}`
      };
    }
    const base = new Date();
    const dt = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    const y = dt.getFullYear(), m = dt.getMonth();
    return {
      days: monthGrid(y, m), from: dt.getTime(), to: new Date(y, m + 1, 1).getTime(),
      title: `${MONTHS[m]} ${y}`
    };
  }, [period, offset]);

  /** Quêtes validées par jour, pour cette compétence. */
  const byDay = useMemo(() => {
    const map: Record<string, { n: number; px: number }> = {};
    history.filter((h) => h.skill === skill).forEach((h) => {
      const k = dayKey(h.t);
      const cur = map[k] || { n: 0, px: 0 };
      map[k] = { n: cur.n + 1, px: cur.px + h.px };
    });
    return map;
  }, [history, skill]);

  const rows = history.filter((h) => h.skill === skill && h.t >= from && h.t < to);
  const span = to - from;
  const prev = history.filter((h) => h.skill === skill && h.t >= from - span && h.t < from);
  const delta = rows.length - prev.length;

  const keys = (days.filter(Boolean) as string[]);
  const moodAvg = avgOf(keys.map((k) => checkins[k]?.mood || 0));
  const noted = keys.filter((k) => filled(checkins[k])).length;

  /** Jour le plus productif de la période. */
  const best = keys.reduce<{ k: string; px: number }>((acc, k) => {
    const px = byDay[k]?.px || 0;
    return px > acc.px ? { k, px } : acc;
  }, { k: '', px: 0 });

  const tx = dark ? '#fff' : C.ink;
  const sub = dark ? 'rgba(255,255,255,.5)' : 'rgba(11,11,12,.5)';
  const card = dark ? C.night : '#fff';
  const line = dark ? C.line : 'rgba(11,11,12,.07)';
  const soft = dark ? 'rgba(255,255,255,.06)' : 'rgba(11,11,12,.05)';

  const selEntry = sel ? checkins[sel] : undefined;
  const selQuests = sel ? history.filter((h) => h.skill === skill && dayKey(h.t) === sel) : [];

  const nav = (dir: -1 | 1) => setOffset((v) => Math.min(0, v + dir));

  return (
    <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 20, padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <Kicker dark={!dark}>RÉTROSPECTIVE</Kicker>
        <div style={{ display: 'flex', gap: 5 }}>
          {([['week', 'SEMAINE'], ['month', 'MOIS']] as const).map(([k, label]) => (
            <Tap
              key={k} onTap={() => { setPeriod(k); setOffset(0); setSel(null); }} haptic="soft"
              style={{
                minHeight: 32, padding: '0 11px', borderRadius: 9, display: 'flex', alignItems: 'center',
                font: `700 9px ${F.mono}`, letterSpacing: '.1em',
                background: period === k ? (dark ? C.lime : C.ink) : soft,
                color: period === k ? (dark ? C.ink : C.paper) : sub
              }}
            >
              {label}
            </Tap>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Tap onTap={() => nav(-1)} aria-label="Période précédente" style={{ width: 34, height: 34, borderRadius: 10, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tx} strokeWidth="2.6" strokeLinecap="round"><path d="M14 6l-6 6 6 6" /></svg>
        </Tap>
        <span style={{ font: `800 15px ${F.display}`, color: tx, letterSpacing: '-.02em', textTransform: 'capitalize' }}>{title}</span>
        <Tap
          onTap={() => nav(1)} aria-label="Période suivante"
          style={{ width: 34, height: 34, borderRadius: 10, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', opacity: offset >= 0 ? .3 : 1 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tx} strokeWidth="2.6" strokeLinecap="round"><path d="M10 6l6 6-6 6" /></svg>
        </Tap>
      </div>

      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5, marginBottom: 6 }}>
          {WEEKDAYS.map((w, i) => (
            <span key={i} style={{ textAlign: 'center', font: `500 8.5px ${F.mono}`, letterSpacing: '.1em', color: sub }}>{w}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
          {days.map((k, i) => (
            <Cell
              key={k || 'x' + i} day={k}
              mood={(k ? checkins[k]?.mood : 0) || 0}
              face={k ? checkins[k]?.face : undefined}
              quests={k ? byDay[k]?.n || 0 : 0}
              dark={dark} sel={!!k && sel === k}
              onTap={() => setSel(sel === k ? null : k)}
            />
          ))}
        </div>
      </div>

      {/* Légende du code couleur */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
        <span style={{ font: `500 8px ${F.mono}`, letterSpacing: '.14em', color: sub }}>HUMEUR</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {([1, 2, 3, 4, 5] as Scale[]).map((v) => (
            <span
              key={v}
              style={{
                width: 20, height: 20, borderRadius: 6, background: dayBg(v, dark),
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <img src={moodSrc(DEFAULT_FACE[v])} alt="" style={{ width: 14, height: 14, background: 'transparent' }} />
            </span>
          ))}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 4 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.lime }} />
          <span style={{ font: `500 8px ${F.mono}`, letterSpacing: '.14em', color: sub }}>QUÊTE VALIDÉE</span>
        </span>
      </div>

      {/* Détail du jour choisi */}
      {sel ? (
        <div style={{ background: soft, borderRadius: 14, padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MoodFace v={(selEntry?.mood || 0) as Scale} face={selEntry?.face} size={28} color={sub} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: `700 12.5px ${F.body}`, color: tx }}>
                {new Date(sel + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
              <span style={{ display: 'block', font: `500 10.5px ${F.body}`, color: sub, marginTop: 2 }}>
                {selEntry?.mood || selEntry?.face ? faceLabel(selEntry) : 'Humeur non notée'} · {selQuests.length} validation{selQuests.length > 1 ? 's' : ''}
              </span>
            </span>
            {byDay[sel]?.px ? <span style={{ font: `700 11px ${F.mono}`, color: dark ? C.lime : C.ink, flex: 'none' }}>+{byDay[sel].px} PX</span> : null}
          </div>
          {selEntry?.note ? (
            <span style={{ font: `400 11.5px/1.5 ${F.body}`, color: sub, textWrap: 'pretty' }}>{selEntry.note}</span>
          ) : null}
          {selEntry?.photo ? (
            <img src={selEntry.photo} alt="" style={{ display: 'block', width: '100%', height: 104, objectFit: 'cover', borderRadius: 11 }} />
          ) : null}
          {selEntry?.who?.length ? (
            <span style={{ font: `500 11px ${F.body}`, color: sub }}>Vu {selEntry.who.join(', ')}</span>
          ) : null}
          {selQuests.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selQuests.slice(0, 4).map((h, i) => (
                <span key={i} style={{ display: 'flex', gap: 7, font: `500 11.5px ${F.body}`, color: tx }}>
                  <span style={{ color: sub }}>·</span>{h.name}
                </span>
              ))}
            </div>
          ) : null}
          {selEntry?.tags?.length ? (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {selEntry.tags.map((t) => (
                <span key={t} style={{ font: `700 9px ${F.mono}`, color: sub, border: `1px solid ${line}`, borderRadius: 99, padding: '3px 8px' }}>{t}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Bilan de la période */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        <Stat
          label={period === 'week' ? 'QUÊTES · SEMAINE' : 'QUÊTES · MOIS'} col={tx} dark={dark}
          value={String(rows.length)} sub={rows.reduce((n, h) => n + h.px, 0) + ' PX'}
        />
        <Stat
          label="VS PÉRIODE PRÉCÉDENTE" dark={dark}
          col={delta > 0 ? (dark ? C.lime : C.teal) : delta < 0 ? C.coral : sub}
          value={(delta > 0 ? '+' : '') + delta} sub={prev.length + ' avant'}
        />
        <Stat
          label="HUMEUR MOYENNE" dark={dark}
          col={moodAvg ? moodColor(Math.round(moodAvg) as Scale) : sub}
          value={moodAvg ? moodAvg.toFixed(1).replace('.', ',') + '/5' : '—'}
          sub={noted ? noted + ' jour' + (noted > 1 ? 's' : '') + ' noté' + (noted > 1 ? 's' : '') : 'rien noté'}
        />
        <Stat
          label="JOUR LE PLUS PRODUCTIF" col={tx} dark={dark}
          value={best.px ? new Date(best.k + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
          sub={best.px ? '+' + best.px + ' PX' : 'aucune validation'}
        />
      </div>
    </div>
  );
}
