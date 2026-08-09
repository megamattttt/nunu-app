import React, { useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { SKILLS, BOARDS } from '../data/skills';
import { Tap } from '../components/ui';
import Logo from '../components/Logo';

/**
 * Onboarding : un seul écran, une seule décision — la compétence de départ.
 * PERSO reste actif quoi qu'il arrive. Un premier palier court est créé
 * automatiquement pour garantir une victoire dès la première session.
 */
export default function Onboarding() {
  const { s, d } = useGame();
  const [pick, setPick] = useState<string | null>(null);
  const choices = SKILLS.filter((k) => !k.solo);
  const first = pick ? (BOARDS[pick] || [])[0] : null;

  return (
    <div style={{ minHeight: '100dvh', background: C.ink, display: 'flex', flexDirection: 'column', padding: 'calc(var(--safe-top) + 22px) 22px calc(var(--safe-bottom) + 22px)' }}>
      <Logo size={38} />
      <div style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.24em', marginTop: 24 }}>
        BIENVENUE {s.profile.firstName.toUpperCase()}
      </div>
      <div style={{ font: `800 36px/1.02 ${F.display}`, color: '#fff', letterSpacing: '-.03em', marginTop: 10 }}>
        PAR QUOI<br />TU COMMENCES ?
      </div>
      <div style={{ font: `400 13px/1.5 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 12, maxWidth: 320, textWrap: 'pretty' }}>
        Choisis une compétence. Elle ouvre ton premier palier, court, faisable aujourd’hui.
        Les autres se débloquent quand tu veux. PERSO reste toujours actif.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 9, marginTop: 22 }}>
        {choices.map((k) => {
          const on = pick === k.id;
          return (
            <Tap
              key={k.id} onTap={() => setPick(k.id)} haptic="soft"
              style={{
                background: on ? k.c : 'rgba(255,255,255,.05)',
                border: '1px solid ' + (on ? 'transparent' : 'rgba(255,255,255,.1)'),
                borderRadius: 22, padding: '16px 16px 18px', minHeight: 104,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transform: on ? 'translateY(-3px)' : 'none', transition: 'all .2s cubic-bezier(.2,1,.3,1)'
              }}
            >
              <span style={{ font: `800 22px ${F.display}`, color: on ? k.txt : '#fff', letterSpacing: '-.02em' }}>{k.short}</span>
              <span>
                <span style={{ display: 'block', font: `700 13px ${F.body}`, color: on ? k.txt : '#fff' }}>{k.name}</span>
                <span style={{ display: 'block', font: `400 11px ${F.body}`, color: on ? k.txt : 'rgba(255,255,255,.45)', opacity: on ? .7 : 1, marginTop: 3 }}>{k.soft}</span>
              </span>
            </Tap>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 16 }} />

      {first ? (
        <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ font: `500 9px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.45)' }}>TON PREMIER PALIER</div>
          <div style={{ font: `700 14px ${F.body}`, color: '#fff', marginTop: 6 }}>Première session : {first[0].toLowerCase()}</div>
          <div style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 4 }}>Commune · +15 PX · validation en un tap</div>
        </div>
      ) : null}

      <Tap
        onTap={() => pick && d({ t: 'START_SKILL', skill: pick })}
        haptic="success"
        style={{
          background: pick ? C.lime : 'rgba(255,255,255,.08)',
          color: pick ? C.ink : 'rgba(255,255,255,.35)',
          borderRadius: 20, padding: '18px 22px', minHeight: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}
      >
        <span style={{ font: `800 17px ${F.display}`, letterSpacing: '-.01em' }}>OUVRIR MON PLATEAU</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={pick ? C.ink : 'rgba(255,255,255,.35)'} strokeWidth="2.8"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
      </Tap>
    </div>
  );
}
