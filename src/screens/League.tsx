import React, { useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { LEAGUES } from '../data/social';
import { PALIERS, DIVW } from '../data/skills';
import AvatarCut from '../components/avatar/AvatarCut';
import { Bar, Tap } from '../components/ui';
import type { Nav } from '../App';

const TABS: [string, string][] = [['amis', 'AMIS'], ['locale', 'LOCALE'], ['monde', 'MONDIALE']];

export default function League({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [tab, setTab] = useState('amis');
  const rows = LEAGUES[tab];
  const top = rows[0];
  const pal = PALIERS[s.pal];

  return (
    <div style={{ background: C.paper, minHeight: '100dvh' }}>
      <div style={{ padding: '18px 22px 0', position: 'relative' }}>
        <span style={{ position: 'absolute', left: -40, top: 120, width: 150, height: 150, borderRadius: '50%', background: 'rgba(168,216,255,.5)' }} />
        <span style={{ position: 'absolute', right: -30, top: 40, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,201,60,.45)' }} />

        <div style={{ font: `800 42px/1 ${F.display}`, color: C.ink, letterSpacing: '-.03em', position: 'relative' }}>LIGUE</div>

        <div style={{ position: 'relative', background: C.ink, borderRadius: 26, padding: '16px 18px', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              <span style={{ display: 'block', font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.14em' }}>TON PALIER</span>
              <span style={{ display: 'block', font: `800 26px ${F.display}`, color: '#fff', letterSpacing: '-.02em', marginTop: 4 }}>{pal[0]}</span>
            </span>
            <span style={{ font: `700 11px ${F.mono}`, color: C.ink, background: pal[1], padding: '8px 13px', borderRadius: 99, letterSpacing: '.08em' }}>DIV {DIVW[s.div]}</span>
          </div>
          <div style={{ display: 'flex', marginTop: 14 }}><Bar pct={s.lp} c={pal[1]} h={12} track="rgba(255,255,255,.12)" /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 9 }}>
            <span style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.55)' }}>{s.lp} / 100 LP</span>
            <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em' }}>S4 · J-9</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, marginTop: 14, position: 'relative' }}>
          {TABS.map(([k, label]) => (
            <Tap
              key={k} onTap={() => setTab(k)} haptic="soft"
              style={{
                flex: 1, textAlign: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', padding: '12px 6px', borderRadius: 13, minHeight: 44,
                background: tab === k ? C.ink : 'rgba(11,11,12,.07)', color: tab === k ? C.paper : 'rgba(11,11,12,.55)'
              }}
            >
              {label}
            </Tap>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div style={{ textAlign: 'center', padding: '18px 22px 12px', position: 'relative' }}>
        <div style={{ position: 'relative', display: 'inline-block', animation: 'nuFloat 4s ease-in-out infinite' }}>
          <svg width="42" height="27" viewBox="0 0 46 30" style={{ position: 'absolute', left: '50%', top: -13, marginLeft: -21, zIndex: 2 }}>
            <path d="M3 26L1 5l11 8L23 2l11 11 11-8-2 21z" fill={C.honey} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span style={{ width: 106, height: 106, borderRadius: '50%', display: 'block', overflow: 'hidden', border: '4px solid ' + C.ink }}>
            <AvatarCut who={top[0] === 'camille' ? undefined : top[0]} av={top[0] === 'camille' ? s.profile.av : undefined} crop="face" />
          </span>
          <span style={{ position: 'absolute', left: '50%', bottom: -11, marginLeft: -15, width: 30, height: 30, borderRadius: '50%', background: C.honey, border: '3px solid ' + C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 13px ${F.display}`, color: C.ink }}>1</span>
        </div>
        <div style={{ font: `800 27px ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 16 }}>{top[1]}</div>
        <div style={{ display: 'inline-flex', gap: 7, marginTop: 10 }}>
          <span style={{ font: `700 11.5px ${F.body}`, color: C.ink, background: C.lime, padding: '8px 16px', borderRadius: 99 }}>{top[4]}%</span>
          <span style={{ font: `700 11px ${F.mono}`, color: C.ink, background: 'rgba(255,255,255,.8)', padding: '8px 14px', borderRadius: 99 }}>{top[3].toLocaleString('fr-FR')} PTS</span>
        </div>
      </div>

      <div style={{ padding: '0 22px 26px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
        {rows.map((r, i) => {
          const me = r[0] === 'camille';
          return (
            <Tap
              key={r[0]} onTap={() => { if (!me) nav.open('quiz', { who: r[0], name: r[1], skill: 'couture' }); }}
              sound={!me}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: me ? C.ink : '#fff', borderRadius: 20, padding: '12px 14px', border: me ? '2px solid ' + C.lime : '1px solid rgba(11,11,12,.06)' }}
            >
              <span style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}>
                <AvatarCut who={me ? undefined : r[0]} av={me ? s.profile.av : undefined} crop="face" />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: `700 14px ${F.body}`, color: me ? '#fff' : C.ink }}>{r[1]}</span>
                <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: me ? 'rgba(255,255,255,.5)' : 'rgba(11,11,12,.5)', marginTop: 1 }}>{r[2]} · {r[3].toLocaleString('fr-FR')} pts</span>
              </span>
              <span style={{ font: `800 15px ${F.display}`, color: me ? C.lime : 'rgba(11,11,12,.35)', flex: 'none' }}>{i + 1}</span>
            </Tap>
          );
        })}

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Tap onTap={() => d({ t: 'LP', delta: 30 })} haptic="success" style={{ flex: 1, textAlign: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.08em', color: C.paper, background: C.ink, padding: '15px', borderRadius: 16, minHeight: 48 }}>+30 LP</Tap>
          <Tap onTap={() => d({ t: 'LP', delta: -20 })} style={{ flex: 1, textAlign: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.08em', color: 'rgba(11,11,12,.6)', background: 'rgba(255,255,255,.7)', padding: '15px', borderRadius: 16, minHeight: 48 }}>−20 LP</Tap>
        </div>
        <div style={{ font: `400 11px/1.5 ${F.body}`, color: 'rgba(11,11,12,.45)', textAlign: 'center' }}>
          Les LP montent avec les quêtes validées et les duels gagnés. Ces deux boutons simulent une journée de résultats.
        </div>
      </div>
    </div>
  );
}
