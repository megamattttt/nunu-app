import React from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { INVITS } from '../data/social';
import { skillById } from '../data/skills';
import AvatarCut from '../components/avatar/AvatarCut';
import { Empty, Kicker, Tap } from '../components/ui';
import type { Nav } from '../App';

export default function Duels({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const live = s.duels.filter((x) => x.status === 'en cours');
  const past = s.duels.filter((x) => x.status !== 'en cours');

  return (
    <div>
      <header style={{ background: C.honey, padding: '20px 22px 24px', borderRadius: '0 0 34px 34px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: -50, bottom: -70, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,92,66,.4)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
          <div style={{ font: `800 46px/.92 ${F.display}`, color: C.ink, letterSpacing: '-.03em' }}>DÉFIS</div>
          <div style={{ font: `500 10px ${F.mono}`, color: 'rgba(11,11,12,.6)', letterSpacing: '.12em', paddingBottom: 6 }}>{live.length} EN COURS</div>
        </div>
      </header>

      <div style={{ padding: '20px 22px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {live.map((duel) => (
          <div key={duel.id} style={{ position: 'relative', paddingTop: 22 }}>
            <span style={{ position: 'absolute', left: 16, right: 16, top: 0, height: 60, borderRadius: 24, background: '#3A3A42' }} />
            <span style={{ position: 'absolute', left: 8, right: 8, top: 11, height: 60, borderRadius: 24, background: '#5B5B66' }} />
            <div style={{ position: 'relative', background: C.paper, borderRadius: 26, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 52, height: 52, borderRadius: 18, overflow: 'hidden', flex: 'none' }}><AvatarCut who={duel.who} crop="face" /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <Kicker dark>DUEL EN COURS</Kicker>
                  <span style={{ display: 'block', font: `800 21px ${F.display}`, color: C.ink, letterSpacing: '-.01em', marginTop: 3 }}>{duel.name.toUpperCase()}</span>
                </span>
                <span style={{ font: `700 10px ${F.mono}`, color: C.ink, background: C.lime, padding: '6px 9px', borderRadius: 8, flex: 'none' }}>{duel.stake} PX</span>
              </div>
              <div style={{ font: `400 13px/1.4 ${F.body}`, color: 'rgba(11,11,12,.72)', marginTop: 14, textWrap: 'pretty' }}>
                {skillById(duel.skill).name.toLowerCase()} — quatre questions, dix secondes chacune. Le meilleur score prend l’enjeu.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 10 }}>
                <span style={{ font: `700 15px ${F.mono}`, color: C.ink }}>{duel.deadline}</span>
                <Tap
                  onTap={() => nav.open('quiz', { id: duel.id, who: duel.who, name: duel.name, skill: duel.skill })}
                  haptic="soft"
                  style={{ font: `700 12px ${F.body}`, color: C.paper, background: C.ink, padding: '13px 20px', borderRadius: 99, minHeight: 46, display: 'flex', alignItems: 'center' }}
                >
                  JOUER MA MANCHE
                </Tap>
              </div>
            </div>
          </div>
        ))}

        {!live.length ? <Empty title="AUCUN DUEL EN COURS" text="Accepte une invitation ou lance un duel éclair pour remettre des PX en jeu." /> : null}

        <Tap
          onTap={() => nav.open('quiz', { who: 'lea', name: 'Léa Fontaine', skill: 'couture', flash: true })}
          style={{ background: C.violet, borderRadius: 26, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: 84 }}
        >
          <span style={{ position: 'absolute', right: -30, top: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(198,242,78,.28)' }} />
          <span style={{ position: 'relative' }}>
            <span style={{ display: 'block', font: `800 26px/1 ${F.display}`, color: '#fff', letterSpacing: '-.02em' }}>DUEL ÉCLAIR</span>
            <span style={{ display: 'block', font: `400 12px ${F.body}`, color: 'rgba(255,255,255,.75)', marginTop: 6 }}>Quatre questions contre un ami au hasard</span>
          </span>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', position: 'relative' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.6"><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" /></svg>
          </span>
        </Tap>

        <Kicker>INVITATIONS REÇUES</Kicker>
        {s.invitsOpen.map((i) => {
          const iv = INVITS[i];
          return (
            <div key={i} style={{ background: C.night, borderRadius: 20, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: 14, overflow: 'hidden', flex: 'none' }}><AvatarCut who={iv.who} crop="face" /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: '#fff' }}>{iv.name}</span>
                <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{iv.sub}</span>
              </span>
              <Tap
                onTap={() => d({ t: 'ACCEPT_INVIT', ix: i, who: iv.who, name: iv.name, skill: iv.skill })}
                haptic="success"
                style={{ font: `700 11px ${F.body}`, color: C.ink, background: C.lime, padding: '11px 14px', borderRadius: 99, flex: 'none', minHeight: 44, display: 'flex', alignItems: 'center' }}
              >
                ACCEPTER
              </Tap>
            </div>
          );
        })}
        {!s.invitsOpen.length ? <Empty title="TOUT EST ACCEPTÉ" text="Les prochaines invitations arrivent demain matin." /> : null}

        {past.length ? (
          <>
            <Kicker>HISTORIQUE</Kicker>
            {past.map((duel) => (
              <div key={duel.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.night, border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: '12px 14px' }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}><AvatarCut who={duel.who} crop="face" /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', font: `700 13px ${F.body}`, color: '#fff' }}>{duel.name}</span>
                  <span style={{ display: 'block', font: `400 10.5px ${F.body}`, color: 'rgba(255,255,255,.42)', marginTop: 2 }}>{duel.myScore} — {duel.theirScore}</span>
                </span>
                <span style={{ font: `700 10px ${F.mono}`, letterSpacing: '.08em', color: duel.status === 'gagné' ? C.lime : C.coral }}>{duel.status.toUpperCase()}</span>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
