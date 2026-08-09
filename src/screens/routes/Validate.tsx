import React, { useEffect, useRef, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { STEPS, skillById } from '../../data/skills';
import { FRIENDS } from '../../data/social';
import AvatarCut from '../../components/avatar/AvatarCut';
import { Bar, Check, Kicker, RouteHead, Tap } from '../../components/ui';
import { buzz } from '../../lib/haptics';
import { sfx } from '../../lib/sound';
import type { Nav } from '../../App';

const EVALQ: [string, string][] = [['diff', 'Difficulté ressentie'], ['sat', 'Satisfaction du résultat'], ['again', 'Envie de recommencer']];

export default function Validate({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const q = nav.route?.data || {};
  const sk = skillById(q.skill);
  const steps = STEPS[q.skill] || STEPS.perso;

  const [stage, setStage] = useState(0); // 0 étapes · 1 preuve · 2 ressenti · 3 témoin
  const [done, setDone] = useState<boolean[]>(steps.map(() => false));
  const [proof, setProof] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [ev, setEv] = useState<Record<string, number>>({ diff: 0, sat: 0, again: 0 });
  const [witness, setWitness] = useState<string | null>(null);
  const [chrono, setChrono] = useState(0);
  const [running, setRunning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setChrono((c) => c + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const allDone = done.every(Boolean);
  const mmss = `${String(Math.floor(chrono / 60)).padStart(2, '0')}:${String(chrono % 60).padStart(2, '0')}`;
  const bonus = witness ? Math.round(q.px * 0.2) : 0;

  const toggle = (i: number) => {
    buzz('success'); sfx.tap();
    setDone((arr) => arr.map((v, k) => (k === i ? !v : v)));
  };

  const finish = () => {
    d({ t: 'VALIDATE', skill: q.skill, ix: q.ix, name: q.name, px: q.px, witness });
    nav.back();
  };

  return (
    <div style={{ padding: '10px 22px 30px' }}>
      <RouteHead title="VALIDER" sub={sk.name + ' · +' + q.px + ' PX'} onBack={nav.back} />

      <div style={{ background: sk.c, borderRadius: 24, padding: '18px 20px', marginTop: 18, color: sk.txt }}>
        <Kicker dark={sk.txt !== '#FFFFFF'}>QUÊTE EN COURS</Kicker>
        <div style={{ font: `800 26px/1.05 ${F.display}`, letterSpacing: '-.02em', marginTop: 8 }}>{q.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <Bar pct={(done.filter(Boolean).length / steps.length) * 100} c={sk.txt === '#FFFFFF' ? '#fff' : C.ink} h={8} track="rgba(11,11,12,.16)" />
          <span style={{ font: `700 10px ${F.mono}`, opacity: .7 }}>{done.filter(Boolean).length}/{steps.length}</span>
        </div>
      </div>

      {/* Étapes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {steps.map((label, i) => (
          <Tap
            key={label} onTap={() => toggle(i)}
            style={{ display: 'flex', alignItems: 'center', gap: 13, background: done[i] ? 'rgba(198,242,78,.12)' : C.night, border: '1px solid ' + (done[i] ? 'rgba(198,242,78,.4)' : 'rgba(255,255,255,.08)'), borderRadius: 18, padding: '14px 15px', minHeight: 56 }}
          >
            <span style={{ width: 26, height: 26, borderRadius: 9, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done[i] ? C.lime : 'transparent', border: done[i] ? 'none' : '2px solid rgba(255,255,255,.2)', animation: done[i] ? 'nuTick .3s ease' : undefined }}>
              {done[i] ? <Check size={14} w={3.6} /> : null}
            </span>
            <span style={{ flex: 1, font: `${done[i] ? 400 : 700} 13.5px ${F.body}`, color: done[i] ? 'rgba(255,255,255,.5)' : '#fff', textDecoration: done[i] ? 'line-through' : 'none' }}>{label}</span>
            <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.3)' }}>{i + 1}</span>
          </Tap>
        ))}
      </div>

      {/* Chrono */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.night, borderRadius: 18, padding: '13px 15px', marginTop: 12 }}>
        <span style={{ font: `700 22px ${F.mono}`, color: '#fff', flex: 1 }}>{mmss}</span>
        <Tap onTap={() => setRunning((r) => !r)} style={{ font: `700 11px ${F.mono}`, letterSpacing: '.08em', color: running ? C.ink : '#fff', background: running ? C.lime : 'rgba(255,255,255,.1)', padding: '12px 16px', borderRadius: 99, minHeight: 44, display: 'flex', alignItems: 'center' }}>
          {running ? 'PAUSE' : 'LANCER'}
        </Tap>
        {chrono ? <Tap onTap={() => { setChrono(0); setRunning(false); }} style={{ font: `700 11px ${F.mono}`, color: 'rgba(255,255,255,.5)', padding: '12px', minHeight: 44, display: 'flex', alignItems: 'center' }}>RAZ</Tap> : null}
      </div>

      {/* Preuve */}
      <div style={{ background: C.night, borderRadius: 20, padding: '15px 16px', marginTop: 12 }}>
        <Kicker>PREUVE</Kicker>
        <input
          ref={fileRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setProof(URL.createObjectURL(f)); }}
        />
        {proof ? (
          <div style={{ marginTop: 12, position: 'relative' }}>
            <img src={proof} alt="Preuve" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 16, display: 'block' }} />
            <Tap onTap={() => setProof(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(11,11,12,.7)', color: '#fff', font: `700 10px ${F.mono}`, padding: '9px 11px', borderRadius: 99 }}>RETIRER</Tap>
          </div>
        ) : (
          <Tap onTap={() => fileRef.current?.click()} style={{ marginTop: 12, border: '1px dashed rgba(255,255,255,.22)', borderRadius: 16, padding: '22px', textAlign: 'center', font: `400 12.5px ${F.body}`, color: 'rgba(255,255,255,.55)', minHeight: 66 }}>
            Ajouter une photo du résultat
          </Tap>
        )}
        <textarea
          value={note} onChange={(e) => setNote(e.target.value)} placeholder="Une note pour toi (facultatif)…"
          style={{ width: '100%', marginTop: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '12px 13px', color: '#fff', font: `400 16px/1.45 ${F.body}`, minHeight: 70, resize: 'none' }}
        />
      </div>

      {/* Ressenti */}
      <div style={{ background: C.night, borderRadius: 20, padding: '15px 16px', marginTop: 12 }}>
        <Kicker>RESSENTI</Kicker>
        {EVALQ.map(([k, label]) => (
          <div key={k} style={{ marginTop: 13 }}>
            <div style={{ font: `400 12.5px ${F.body}`, color: 'rgba(255,255,255,.7)' }}>{label}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Tap
                  key={n} onTap={() => setEv((e) => ({ ...e, [k]: n }))} haptic="soft"
                  style={{ flex: 1, textAlign: 'center', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, font: `700 13px ${F.mono}`, background: ev[k] >= n ? C.lime : 'rgba(255,255,255,.07)', color: ev[k] >= n ? C.ink : 'rgba(255,255,255,.5)' }}
                >
                  {n}
                </Tap>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Témoin */}
      <div style={{ background: C.night, borderRadius: 20, padding: '15px 16px', marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Kicker>CONFIRMATION PAR UN TÉMOIN</Kicker>
          <span style={{ font: `700 10px ${F.mono}`, color: C.lime }}>+20 %</span>
        </div>
        <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>
          Un ami confirme que c’est fait. Le bonus s’ajoute à tes PX.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {FRIENDS.filter((f) => f[0] !== 'camille').map(([who, name]) => (
            <Tap
              key={who} onTap={() => setWitness(witness === who ? null : who)} haptic="soft"
              style={{ flex: 'none', width: 74, textAlign: 'center', padding: '10px 6px', borderRadius: 16, background: witness === who ? C.lime : 'rgba(255,255,255,.06)' }}
            >
              <span style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', display: 'block', margin: '0 auto' }}><AvatarCut who={who} crop="face" /></span>
              <span style={{ display: 'block', font: `700 10px ${F.body}`, color: witness === who ? C.ink : 'rgba(255,255,255,.7)', marginTop: 7 }}>{name.split(' ')[0]}</span>
            </Tap>
          ))}
        </div>
      </div>

      <Tap
        onTap={allDone ? finish : () => { buzz('error'); sfx.error(); }}
        haptic={allDone ? 'levelup' : 'error'}
        style={{
          marginTop: 16, borderRadius: 22, padding: '18px 20px', minHeight: 62,
          background: allDone ? C.lime : 'rgba(255,255,255,.09)',
          color: allDone ? C.ink : 'rgba(255,255,255,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}
      >
        <span style={{ font: `800 18px ${F.display}`, letterSpacing: '-.01em' }}>{allDone ? 'VALIDER LA QUÊTE' : 'COCHE TOUTES LES ÉTAPES'}</span>
        <span style={{ font: `700 12px ${F.mono}` }}>+{q.px + bonus} PX</span>
      </Tap>
    </div>
  );
}
