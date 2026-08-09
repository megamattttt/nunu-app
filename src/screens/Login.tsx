import React, { useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { Tap } from '../components/ui';
import Logo from '../components/Logo';

const clean = (v: string) => v.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 16);

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
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 18, padding: '13px 16px', display: 'block'
  };
  const label: React.CSSProperties = { font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.16em' };
  const input: React.CSSProperties = { width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '5px 0 0' };

  return (
    <div style={{ minHeight: '100dvh', background: C.ink, display: 'flex', flexDirection: 'column', padding: 'calc(var(--safe-top) + 28px) 26px calc(var(--safe-bottom) + 28px)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <Logo size={64} style={{ alignSelf: 'flex-start' }} />
        <div style={{ font: `800 44px/1 ${F.display}`, color: '#fff', letterSpacing: '-.035em', marginTop: 22 }}>NUNU</div>
        <div style={{ font: `400 14px/1.5 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 10, maxWidth: 300, textWrap: 'pretty' }}>
          Deux informations suffisent pour commencer. Tout reste sur cet appareil.
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 30 }}
        >
          <label style={field}>
            <span style={label}>PRÉNOM</span>
            <input
              value={firstName} onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name" placeholder="Camille" style={input}
            />
          </label>
          <label style={field}>
            <span style={label}>NOM D’UTILISATEUR</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ font: `700 17px ${F.body}`, color: 'rgba(255,255,255,.35)' }}>@</span>
              <input
                value={tag} onChange={(e) => setTag(clean(e.target.value))}
                autoCapitalize="none" autoCorrect="off" placeholder="camille" style={input}
              />
            </span>
          </label>
          <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.4)', padding: '2px 2px 0' }}>
            Ton nom d’utilisateur devient ton gamertag, affiché sur ton profil et tes cartes de palier.
          </div>

          <Tap
            onTap={submit} haptic="success"
            style={{
              background: ready ? C.lime : 'rgba(255,255,255,.08)',
              color: ready ? C.ink : 'rgba(255,255,255,.35)',
              borderRadius: 20, padding: '18px 22px', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, minHeight: 56
            }}
          >
            <span style={{ font: `800 17px ${F.display}`, letterSpacing: '-.01em' }}>COMMENCER</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ready ? C.ink : 'rgba(255,255,255,.35)'} strokeWidth="2.8"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </Tap>
        </form>
      </div>
    </div>
  );
}
