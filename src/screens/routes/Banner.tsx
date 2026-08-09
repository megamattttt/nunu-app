import React from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { CHALLENGES, QUOTES } from '../../data/quests';
import { SKILLS, skillById } from '../../data/skills';
import { Kicker, RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

export default function Banner({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const b = s.banner;

  const togglePin = (id: string) => {
    const has = b.pins.includes(id);
    const pins = has ? b.pins.filter((p) => p !== id) : [...b.pins, id].slice(-3);
    d({ t: 'BANNER', patch: { pins } });
  };

  return (
    <div style={{ padding: '10px 22px 30px' }}>
      <RouteHead title="BANNIÈRE" sub="Ce que voient tes amis" onBack={nav.back} />

      <div style={{ background: C.night, borderRadius: 20, padding: '14px 16px', marginTop: 18 }}>
        <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>TITRE</div>
        <input value={b.title} onChange={(e) => d({ t: 'BANNER', patch: { title: e.target.value } })} style={{ width: '100%', color: '#fff', font: `700 18px ${F.body}`, padding: '8px 0 0' }} />
      </div>

      <div style={{ marginTop: 14 }}>
        <Kicker>CITATION DÉBLOQUÉE</Kicker>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {QUOTES.map(([q, src], i) => (
            <Tap key={q} onTap={() => d({ t: 'BANNER', patch: { quote: i } })} haptic="soft" style={{ background: b.quote === i ? C.paper : C.night, border: '1px solid ' + (b.quote === i ? 'transparent' : 'rgba(255,255,255,.08)'), borderRadius: 18, padding: '14px 15px' }}>
              <span style={{ display: 'block', font: `400 13px/1.45 ${F.body}`, color: b.quote === i ? C.ink : 'rgba(255,255,255,.75)' }}>{q}</span>
              <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.12em', color: b.quote === i ? 'rgba(11,11,12,.45)' : 'rgba(255,255,255,.35)', marginTop: 6 }}>{src}</span>
            </Tap>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Kicker>COMPÉTENCES ÉPINGLÉES (3 MAX)</Kicker>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {SKILLS.map((k) => {
            const on = b.pins.includes(k.id);
            return (
              <Tap key={k.id} onTap={() => togglePin(k.id)} haptic="soft" style={{ font: `700 11.5px ${F.body}`, padding: '12px 14px', borderRadius: 13, minHeight: 44, display: 'flex', alignItems: 'center', background: on ? k.c : 'rgba(255,255,255,.07)', color: on ? k.txt : 'rgba(255,255,255,.65)' }}>{k.name}</Tap>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Kicker>DÉFI ÉPINGLÉ</Kicker>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {CHALLENGES.map(([name, meta], i) => (
            <Tap key={name} onTap={() => d({ t: 'BANNER', patch: { chall: i } })} haptic="soft" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: b.chall === i ? C.honey : C.night, border: '1px solid ' + (b.chall === i ? 'transparent' : 'rgba(255,255,255,.08)'), borderRadius: 18, padding: '14px 15px', minHeight: 54 }}>
              <span style={{ font: `700 13.5px ${F.body}`, color: b.chall === i ? C.ink : '#fff' }}>{name}</span>
              <span style={{ font: `500 9.5px ${F.mono}`, letterSpacing: '.08em', color: b.chall === i ? 'rgba(11,11,12,.6)' : 'rgba(255,255,255,.4)' }}>{meta}</span>
            </Tap>
          ))}
        </div>
      </div>

      <div style={{ background: C.night, borderRadius: 20, padding: '14px 16px', marginTop: 16 }}>
        <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>MESSAGE</div>
        <textarea
          value={b.msg} onChange={(e) => d({ t: 'BANNER', patch: { msg: e.target.value } })}
          style={{ width: '100%', marginTop: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '12px 13px', color: '#fff', font: `400 16px/1.45 ${F.body}`, minHeight: 90, resize: 'none' }}
        />
      </div>

      <Tap onTap={nav.back} haptic="success" style={{ background: C.lime, color: C.ink, borderRadius: 20, padding: 18, textAlign: 'center', font: `800 17px ${F.display}`, marginTop: 16, minHeight: 58 }}>ENREGISTRER</Tap>
    </div>
  );
}
