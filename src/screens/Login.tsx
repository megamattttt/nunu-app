import React, { useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import AvatarCut from '../components/avatar/AvatarCut';
import { Tap } from '../components/ui';

const FACES = ['lea', 'karim', 'ines', 'nina'];

export default function Login() {
  const { d } = useGame();
  const [phone, setPhone] = useState('06 12 34 56 78');
  const [code, setCode] = useState('');

  return (
    <div style={{ minHeight: '100dvh', background: C.ink, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 'calc(var(--safe-top) + 24px) 26px calc(var(--safe-bottom) + 28px)' }}>
      <span style={{ position: 'absolute', left: -90, top: -70, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,99,255,.55),transparent 68%)' }} />
      <span style={{ position: 'absolute', right: -110, bottom: 60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(198,242,78,.34),transparent 66%)' }} />

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460, width: '100%', margin: '0 auto' }}>
        <div style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.28em' }}>PROGRESSE POUR DE VRAI</div>
        <div style={{ font: `800 78px/.86 ${F.display}`, color: '#fff', letterSpacing: '-.045em', marginTop: 14 }}>NUNU</div>
        <div style={{ font: `400 14.5px/1.5 ${F.body}`, color: 'rgba(255,255,255,.66)', marginTop: 16, maxWidth: 300, textWrap: 'pretty' }}>
          Tes compétences deviennent un plateau de jeu. Une quête, une preuve, un palier.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 34 }}>
          <label style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 18, padding: '12px 16px', display: 'block' }}>
            <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>TÉLÉPHONE</span>
            <input
              value={phone} onChange={(e) => setPhone(e.target.value)}
              inputMode="tel" autoComplete="tel"
              style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '4px 0 0', letterSpacing: '.02em' }}
            />
          </label>
          <label style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 18, padding: '12px 16px', display: 'block' }}>
            <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>CODE</span>
            <input
              value={code} onChange={(e) => setCode(e.target.value)} type="password" placeholder="••••"
              inputMode="numeric" autoComplete="one-time-code"
              style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '4px 0 0', letterSpacing: '.3em' }}
            />
          </label>
        </div>

        <Tap
          onTap={() => d({ t: 'LOGIN' })}
          haptic="success"
          style={{ background: C.lime, borderRadius: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, minHeight: 56 }}
        >
          <span style={{ font: `800 18px ${F.display}`, color: C.ink, letterSpacing: '-.01em' }}>ENTRER DANS L’ATELIER</span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.8"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
        </Tap>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26 }}>
          <span style={{ display: 'flex' }}>
            {FACES.map((w, i) => (
              <span key={w} style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '2px solid ' + C.ink, marginLeft: i ? -10 : 0 }}>
                <AvatarCut who={w} crop="face" />
              </span>
            ))}
          </span>
          <span style={{ font: `400 12px ${F.body}`, color: 'rgba(255,255,255,.55)' }}>Léa, Karim et 4 amis progressent cette semaine</span>
        </div>
      </div>
    </div>
  );
}
