import React, { useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { Tap } from './ui';

const clean = (v: string) => v.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 16);

/** Modale d'édition du prénom et du gamertag, appelée depuis le profil. */
export default function ProfileEdit({ onClose }: { onClose: () => void }) {
  const { s, d } = useGame();
  const [firstName, setFirstName] = useState(s.profile.firstName);
  const [tag, setTag] = useState(s.profile.gamertag);
  const ready = firstName.trim().length > 1 && tag.length > 2;

  const save = () => {
    if (!ready) return;
    d({ t: 'SET_PROFILE', patch: { firstName: firstName.trim(), gamertag: tag } });
    d({ t: 'TOAST', msg: 'Profil mis à jour' });
    onClose();
  };

  const field: React.CSSProperties = {
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 18, padding: '13px 16px', display: 'block'
  };
  const label: React.CSSProperties = { font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.16em' };
  const input: React.CSSProperties = { width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '5px 0 0' };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(11,11,12,.82)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460, background: C.night, borderRadius: '30px 30px 0 0',
          border: '1px solid rgba(255,255,255,.1)', borderBottom: 'none',
          padding: '10px 22px calc(var(--dock-space) + 8px)', animation: 'nuSheet .34s cubic-bezier(.2,1,.3,1)'
        }}
      >
        <span style={{ display: 'block', width: 42, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.2)', margin: '0 auto 18px' }} />
        <div style={{ font: `800 26px ${F.display}`, color: '#fff', letterSpacing: '-.025em' }}>MODIFIER LE PROFIL</div>
        <div style={{ font: `400 12.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 8, textWrap: 'pretty' }}>
          Le gamertag apparaît sur ton profil, tes cartes de palier et le mur.
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <label style={field}>
            <span style={label}>PRÉNOM</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" style={input} />
          </label>
          <label style={field}>
            <span style={label}>NOM D’UTILISATEUR</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ font: `700 17px ${F.body}`, color: 'rgba(255,255,255,.35)' }}>@</span>
              <input value={tag} onChange={(e) => setTag(clean(e.target.value))} autoCapitalize="none" autoCorrect="off" style={input} />
            </span>
          </label>

          <div style={{ display: 'flex', gap: 9, marginTop: 6 }}>
            <Tap onTap={onClose} style={{ flex: 'none', minWidth: 108, minHeight: 56, borderRadius: 20, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.7)' }}>
              ANNULER
            </Tap>
            <Tap
              onTap={save} haptic="success"
              style={{ flex: 1, minHeight: 56, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ready ? C.lime : 'rgba(255,255,255,.08)', color: ready ? C.ink : 'rgba(255,255,255,.35)', font: `800 16px ${F.display}`, letterSpacing: '-.01em' }}
            >
              ENREGISTRER
            </Tap>
          </div>
        </form>
      </div>
    </div>
  );
}
