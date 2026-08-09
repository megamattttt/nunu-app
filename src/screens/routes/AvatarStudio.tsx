import React, { useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { AV_CATS, AV_FRAME, AV_GROUPS, AV_L, AV_LOCKS, AV_SIG, AV_TITLES } from '../../data/avatar';
import { levelOf } from '../../state/selectors';
import { skillById } from '../../data/skills';
import AvatarCut from '../../components/avatar/AvatarCut';
import { css } from '../../lib/css';
import { BackBtn, Tap } from '../../components/ui';
import { buzz } from '../../lib/haptics';
import type { Nav } from '../../App';

export default function AvatarStudio({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [group, setGroup] = useState(0);
  const [cat, setCat] = useState('skin');
  const av = s.profile.av;
  const cats = AV_CATS.filter((c) => c.g === group);
  const current = AV_CATS.find((c) => c.k === cat) || AV_CATS[0];
  const isIdent = group === 5;

  const locked = (key: string, i: number) => {
    const lock = AV_LOCKS[key]?.[i];
    if (!lock) return null;
    return levelOf(s, lock[0]) >= lock[1] ? null : lock;
  };

  const pick = (key: string, i: number) => {
    const lock = locked(key, i);
    if (lock) { buzz('error'); d({ t: 'TOAST', msg: skillById(lock[0]).name + ' niveau ' + lock[1] + ' pour débloquer' }); return; }
    d({ t: 'SET_AV', patch: { [key]: i } });
  };

  const randomize = () => {
    const patch: Record<string, number> = {};
    AV_CATS.forEach((c) => {
      const n = c.kind === 'c' ? (c.pal?.length || 1) : c.kind === 'f' ? AV_FRAME.length : (AV_L[c.k]?.length || 1);
      let tries = 0, v = 0;
      do { v = Math.floor(Math.random() * n); tries++; } while (locked(c.k, v) && tries < 12);
      if (!locked(c.k, v)) patch[c.k] = v;
    });
    d({ t: 'SET_AV', patch });
    buzz('success');
  };

  const options = current.kind === 'c' ? (current.pal || []) : current.kind === 'f' ? AV_FRAME.map((f) => f.n) : (AV_L[current.k] || []);

  return (
    <div style={{ position: 'relative', minHeight: '86dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px 0' }}>
        <BackBtn onTap={nav.back} />
        <span style={{ flex: 1 }} />
        <Tap onTap={randomize} style={{ font: `700 10px ${F.mono}`, color: '#fff', background: 'rgba(255,255,255,.1)', padding: '13px 14px', borderRadius: 99, letterSpacing: '.08em', minHeight: 44, display: 'flex', alignItems: 'center' }}>HASARD</Tap>
        <Tap onTap={() => { d({ t: 'TOAST', msg: 'Avatar enregistré' }); nav.back(); }} haptic="success" style={{ font: `700 10px ${F.mono}`, color: C.ink, background: C.lime, padding: '13px 14px', borderRadius: 99, letterSpacing: '.08em', minHeight: 44, display: 'flex', alignItems: 'center' }}>ENREGISTRER</Tap>
      </div>

      {/* Scène */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '18px 20px 6px' }}>
        <span style={{ width: 190, height: 190, borderRadius: 34, overflow: 'hidden', display: 'block', ...css(AV_FRAME[av.frame % AV_FRAME.length].s) }}>
          <span style={{ width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', display: 'block', background: C.ink }}>
            <AvatarCut av={av} crop={current.crop || 'bust'} />
          </span>
        </span>
        <span style={{ font: `800 24px ${F.display}`, color: '#fff', letterSpacing: '-.02em' }}>@{s.profile.gamertag}</span>
        <span style={{ font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: AV_SIG[s.profile.sig], padding: '6px 12px', borderRadius: 99 }}>
          {AV_TITLES[s.profile.titleIx][0].toUpperCase()}
        </span>
      </div>

      {/* Panneau */}
      <div style={{ background: C.night, borderRadius: '28px 28px 0 0', marginTop: 12, padding: '14px 18px 26px', flex: 1, borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4 }}>
          {AV_GROUPS.map((g, i) => (
            <Tap
              key={g} onTap={() => { setGroup(i); const first = AV_CATS.find((c) => c.g === i); if (first) setCat(first.k); }} haptic="soft"
              style={{ flex: 'none', font: `700 9.5px ${F.mono}`, letterSpacing: '.08em', padding: '11px 12px', borderRadius: 11, minHeight: 40, display: 'flex', alignItems: 'center', background: group === i ? C.lime : 'rgba(255,255,255,.07)', color: group === i ? C.ink : 'rgba(255,255,255,.6)' }}
            >
              {g}
            </Tap>
          ))}
        </div>

        {isIdent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 14 }}>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '12px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>GAMERTAG</div>
              <input value={s.profile.gamertag} onChange={(e) => d({ t: 'SET_PROFILE', patch: { gamertag: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 16) } })} style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '6px 0 0' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '12px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>NOM D’ATELIER</div>
              <input value={s.profile.atelier} onChange={(e) => d({ t: 'SET_PROFILE', patch: { atelier: e.target.value } })} style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '6px 0 0' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>TITRE GAGNÉ</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 11 }}>
                {AV_TITLES.map(([label, skill, need], i) => {
                  const ok = levelOf(s, skill) >= need;
                  const on = s.profile.titleIx === i;
                  return (
                    <Tap
                      key={label}
                      onTap={() => ok ? d({ t: 'SET_PROFILE', patch: { titleIx: i } }) : d({ t: 'TOAST', msg: skillById(skill).name + ' niveau ' + need + ' requis' })}
                      style={{ font: `700 11px ${F.body}`, padding: '10px 12px', borderRadius: 11, minHeight: 40, display: 'flex', alignItems: 'center', opacity: ok ? 1 : .4, background: on ? C.lime : 'rgba(255,255,255,.07)', color: on ? C.ink : 'rgba(255,255,255,.7)' }}
                    >
                      {label}
                    </Tap>
                  );
                })}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>COULEUR SIGNATURE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                {AV_SIG.map((c, i) => (
                  <Tap key={c} onTap={() => d({ t: 'SET_PROFILE', patch: { sig: i } })} haptic="soft" style={{ width: 44, height: 44, borderRadius: 14, background: c, border: s.profile.sig === i ? '3px solid #fff' : '3px solid transparent' }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {cats.map((c) => (
                <Tap key={c.k} onTap={() => setCat(c.k)} haptic="soft" style={{ flex: 'none', font: `700 10.5px ${F.body}`, padding: '10px 12px', borderRadius: 11, minHeight: 40, display: 'flex', alignItems: 'center', background: cat === c.k ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.05)', color: cat === c.k ? '#fff' : 'rgba(255,255,255,.55)' }}>{c.n}</Tap>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 15 }}>
              <span style={{ font: `500 9.5px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.14em' }}>{current.n.toUpperCase()}</span>
              <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.3)' }}>{(av[current.k] || 0) + 1} / {options.length}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 12 }}>
              {options.map((opt: string, i: number) => {
                const on = (av[current.k] || 0) === i;
                const lock = locked(current.k, i);
                const isColor = current.kind === 'c';
                return (
                  <Tap
                    key={current.k + i} onTap={() => pick(current.k, i)} haptic="soft"
                    style={{
                      position: 'relative', width: isColor ? 46 : 66, minHeight: isColor ? 46 : 66, borderRadius: 15, overflow: 'hidden',
                      border: on ? '3px solid ' + C.lime : '3px solid transparent',
                      background: isColor ? opt : 'rgba(255,255,255,.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isColor ? 0 : 4,
                      opacity: lock ? .45 : 1
                    }}
                  >
                    {isColor ? null : current.kind === 'f' ? (
                      <span style={{ width: 34, height: 34, borderRadius: 10, ...css(AV_FRAME[i].s), background: (AV_FRAME[i].s ? undefined : 'rgba(255,255,255,.12)') }} />
                    ) : (
                      <span style={{ font: `600 9px ${F.body}`, color: on ? '#fff' : 'rgba(255,255,255,.6)', lineHeight: 1.25 }}>{opt}</span>
                    )}
                    {lock ? (
                      <span style={{ position: 'absolute', inset: 0, background: 'rgba(11,11,12,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 8px ${F.mono}`, color: '#fff', letterSpacing: '.04em', padding: 3 }}>
                        NIV {lock[1]}
                      </span>
                    ) : null}
                  </Tap>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
