import React from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { skillById } from '../../data/skills';
import { RARITY, isInstant } from '../../data/quests';
import { boardRows, skillRank, skillNextRank, pxOf } from '../../state/selectors';
import { Bar, Check, Kicker, RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

/**
 * Chemin de progression d'une compétence : où j'en suis (rang + PX),
 * et la suite des paliers à venir, sur une ligne de nœuds.
 */
export default function Path({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const skill = nav.route?.data?.skill || s.startSkill || 'perso';
  const sk = skillById(skill);
  const rows = boardRows(s, skill);
  const r = skillRank(s, skill);
  const next = skillNextRank(s, skill);

  const act = (row: (typeof rows)[number]) => {
    if (row.state !== 'now') return;
    if (isInstant(row.rarity)) d({ t: 'VALIDATE', skill, ix: row.ix, name: row.name, px: row.px, rarity: row.rarity });
    else nav.open('validate', { skill, ix: row.ix, name: row.name, px: row.px, rarity: row.rarity });
  };

  return (
    <div style={{ padding: '10px 22px 30px' }}>
      <RouteHead title={sk.name} sub="Chemin de progression" onBack={nav.back} />

      {/* Rang courant */}
      <section style={{ background: sk.c, color: sk.txt, borderRadius: 26, padding: '18px 20px', marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>
            <Kicker dark={sk.txt !== '#FFFFFF'}>RANG ACTUEL</Kicker>
            <span style={{ display: 'block', font: `800 34px/1 ${F.display}`, letterSpacing: '-.03em', marginTop: 6 }}>{r.label}</span>
          </span>
          <span style={{ font: `700 11px ${F.mono}`, background: 'rgba(11,11,12,.16)', padding: '8px 12px', borderRadius: 99, flex: 'none' }}>{pxOf(s, skill)} PX</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <Bar pct={r.pct} c={sk.txt === '#FFFFFF' ? '#fff' : C.ink} h={10} track="rgba(11,11,12,.16)" />
          <span style={{ font: `700 10px ${F.mono}`, opacity: .7, flex: 'none' }}>
            {isFinite(r.pxNeed) ? `${r.pxIn}/${r.pxNeed}` : 'MAX'}
          </span>
        </div>
        <div style={{ font: `400 11.5px ${F.body}`, opacity: .7, marginTop: 8 }}>
          {next ? `Encore ${r.pxNeed - r.pxIn} PX avant ${next.label}.` : 'Sommet de l’échelle atteint.'}
        </div>
      </section>

      {/* Ligne de paliers */}
      <div style={{ marginTop: 20 }}>
        <Kicker>LES PALIERS, DANS L’ORDRE</Kicker>
        <div style={{ marginTop: 12 }}>
          {rows.map((row, i) => {
            const done = row.state === 'done', now = row.state === 'now';
            const rar = RARITY[row.rarity];
            return (
              <Tap
                key={row.name + i} onTap={() => act(row)} sound={now}
                style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: 12, opacity: row.state === 'lock' ? .5 : 1 }}
              >
                {i < rows.length - 1 ? (
                  <span style={{ position: 'absolute', left: 21, top: 46, bottom: 0, width: 2, background: done ? sk.c : 'rgba(255,255,255,.16)' }} />
                ) : null}
                <span
                  style={{
                    width: 44, height: 44, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? sk.c : now ? C.lime : 'rgba(255,255,255,.08)',
                    border: now ? '2px solid #fff' : 'none',
                    animation: now ? 'nuPulse 2.6s ease-out infinite' : undefined
                  }}
                >
                  {done ? <Check /> : now ? <svg width="15" height="15" viewBox="0 0 24 24" fill={C.ink}><path d="M7 4l13 8-13 8z" /></svg>
                    : <span style={{ font: `700 12px ${F.mono}`, color: 'rgba(255,255,255,.45)' }}>{i + 1}</span>}
                </span>
                <span style={{ flex: 1, background: now ? 'rgba(255,255,255,.07)' : 'transparent', border: now ? '1px solid rgba(255,255,255,.14)' : 'none', borderRadius: 18, padding: now ? '13px 15px' : '10px 0' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ font: `${now ? 800 : 700} ${now ? 16 : 14}px ${now ? F.display : F.body}`, color: done ? 'rgba(255,255,255,.55)' : '#fff', textDecoration: done ? 'line-through' : 'none' }}>{row.name}</span>
                    <span style={{ font: `700 11px ${F.mono}`, color: done ? 'rgba(255,255,255,.35)' : C.lime, whiteSpace: 'nowrap' }}>+{row.px}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 7 }}>
                    <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: rar.c, padding: '4px 8px', borderRadius: 7 }}>{rar.label}</span>
                    <span style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.45)' }}>
                      {done ? 'Validé' : now ? (isInstant(row.rarity) ? 'Un tap suffit' : 'Preuve requise') : 'À venir'}
                    </span>
                  </span>
                </span>
              </Tap>
            );
          })}
        </div>
      </div>
    </div>
  );
}
