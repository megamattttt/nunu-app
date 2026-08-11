import React, { useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { Tap } from '../components/ui';
import Logo from '../components/Logo';
import AvatarCut from '../components/avatar/AvatarCut';

const clean = (v: string) => v.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 16);

/** Bulles d'avatars flottantes, reprises du visuel de référence. */
const BUBBLES: { who: string; size: number; x: number; y: number; bg: string; delay: number }[] = [
  { who: 'lea', size: 108, x: 12, y: 16, bg: '#F8D7E3', delay: 0 },
  { who: 'ines', size: 78, x: 63, y: 6, bg: '#CFE6FF', delay: .9 },
  { who: 'tom', size: 92, x: 41, y: 44, bg: '#D7F0C7', delay: 1.7 }
];

export default function Login() {
  const { d } = useGame();
  const [firstName, setFirstName] = useState('');
  const [tag, setTag] = useState('');

  const ready = firstName.trim().length > 1 && tag.length > 2;

  const submit = () => {
    if (!ready) return;
    d({ t: 'IDENTITY', firstName: firstName.trim(), gamertag: tag });
  };

  const field: React.CSSProperties = {
    background: 'rgba(11,11,12,.05)', border: '1px solid rgba(11,11,12,.09)',
    borderRadius: 18, padding: '12px 16px', display: 'block'
  };
  const label: React.CSSProperties = { font: `500 9px ${F.mono}`, color: 'rgba(11,11,12,.45)', letterSpacing: '.16em' };
  const input: React.CSSProperties = { width: '100%', color: C.ink, font: `700 17px ${F.body}`, padding: '4px 0 0' };

  return (
    <div style={{ minHeight: '100dvh', background: C.violet, display: 'flex', flexDirection: 'column' }}>
      {/* Scène haute */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: 'calc(var(--safe-top) + 20px) 26px 30px', flex: '1 0 auto' }}>
        <span style={{ position: 'absolute', right: -70, top: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
        <span style={{ position: 'absolute', left: -60, top: 120, width: 150, height: 150, borderRadius: '50%', background: 'rgba(185,222,100,.24)', animation: 'nuDrift 9s ease-in-out infinite' }} />
        <span style={{ position: 'absolute', right: 30, bottom: 60, width: 14, height: 14, borderRadius: '50%', background: C.honey }} />
        <span style={{ position: 'absolute', left: 34, bottom: 24, width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,.55)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={30} word wordSize={21} />
          <span style={{ font: `500 9.5px ${F.mono}`, color: 'rgba(255,255,255,.6)', letterSpacing: '.2em' }}>PROGRESSE POUR DE VRAI</span>
        </div>

        {/* Bulles d'avatars */}
        <div style={{ position: 'relative', height: 210, marginTop: 18 }}>
          {BUBBLES.map((b) => (
            <span
              key={b.who}
              style={{
                position: 'absolute', left: b.x + '%', top: b.y + '%', width: b.size, height: b.size,
                borderRadius: '50%', overflow: 'hidden', background: b.bg,
                boxShadow: '0 22px 44px -20px rgba(0,0,0,.6)',
                animation: `nuFloat 5.4s ease-in-out ${b.delay}s infinite`
              }}
            >
              <AvatarCut who={b.who} crop="face" />
            </span>
          ))}
          <span
            style={{
              position: 'absolute', right: '6%', top: '34%', background: 'rgba(11,11,12,.6)',
              backdropFilter: 'blur(8px)', borderRadius: 99, padding: '9px 18px',
              font: `800 17px ${F.display}`, color: '#fff', letterSpacing: '-.01em',
              animation: 'nuFloat 6.2s ease-in-out .4s infinite'
            }}
          >
            +214 PX
          </span>
        </div>

        <div style={{ position: 'relative', font: `800 40px/.98 ${F.display}`, color: '#fff', letterSpacing: '-.035em', marginTop: 14, textWrap: 'balance' }}>
          ON COMMENCE<br />PAR TON NOM.
        </div>
      </div>

      {/* Feuille de saisie */}
      <div
        style={{
          background: C.paper, borderRadius: '34px 34px 0 0',
          padding: '24px 26px calc(var(--safe-bottom) + 24px)',
          boxShadow: '0 -30px 60px -30px rgba(0,0,0,.6)', flex: 'none'
        }}
      >
        <div style={{ font: `400 13px/1.45 ${F.body}`, color: 'rgba(11,11,12,.6)', textWrap: 'pretty' }}>
          Deux informations suffisent. Pas de mot de passe, pas de compte : tout reste sur cet appareil.
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
          <label style={field}>
            <span style={label}>PRÉNOM</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="Camille" style={input} />
          </label>
          <label style={field}>
            <span style={label}>NOM D’UTILISATEUR</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ font: `700 17px ${F.body}`, color: 'rgba(11,11,12,.3)' }}>@</span>
              <input value={tag} onChange={(e) => setTag(clean(e.target.value))} autoCapitalize="none" autoCorrect="off" placeholder="camille" style={input} />
            </span>
          </label>

          <Tap
            onTap={submit} haptic="success"
            style={{
              background: ready ? C.ink : 'rgba(11,11,12,.09)',
              color: ready ? C.lime : 'rgba(11,11,12,.3)',
              borderRadius: 20, padding: '0 22px', width: '100%', minHeight: 58,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5
            }}
          >
            <span style={{ font: `800 17px ${F.display}`, letterSpacing: '-.01em' }}>COMMENCER</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ready ? C.lime : 'rgba(11,11,12,.3)'} strokeWidth="2.8"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </Tap>
          <div style={{ font: `400 11px/1.45 ${F.body}`, color: 'rgba(11,11,12,.45)', textAlign: 'center', padding: '4px 10px 0' }}>
            Ton nom d’utilisateur devient ton gamertag, affiché sur ton profil et tes cartes de palier.
          </div>
        </form>
      </div>
    </div>
  );
}
