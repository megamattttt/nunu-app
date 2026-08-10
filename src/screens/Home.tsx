import React from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { SKILLS, skillById } from '../data/skills';
import { boardRows, globalLevel, globalPct, levelOf, skillRank, pxOf, todayQuest, totalPx } from '../state/selectors';
import { isInstant } from '../data/quests';
import AvatarCut from '../components/avatar/AvatarCut';
import { Chevron, Kicker, Tap } from '../components/ui';
import type { Nav } from '../App';

const PULSE = [
  ['lea', 'Léa', 'a remporté un duel contre Karim'],
  ['ines', 'Inès', 'passe Or III en couture'],
  ['tom', 'Tom', 'a validé trois quêtes ce matin']
];

/**
 * Jauge pilule du HUD : libellé et valeur vivent dans la barre elle-même,
 * comme une barre de statut de personnage.
 */
function Gauge({ label, value, pct, c, ink = C.ink }: { label: string; value: string; pct: number; c: string; ink?: string }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <span
      style={{
        display: 'block', position: 'relative', height: 42, borderRadius: 14, overflow: 'hidden',
        background: 'rgba(11,11,12,.42)', border: '1px solid rgba(255,255,255,.12)'
      }}
    >
      <span
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: p + '%', background: c,
          transformOrigin: 'left', animation: 'nuStat .9s cubic-bezier(.2,1,.3,1) both',
          transition: 'width .8s cubic-bezier(.2,1,.3,1)'
        }}
      />
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
        <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: p > 26 ? ink : 'rgba(255,255,255,.6)', mixBlendMode: p > 26 ? 'normal' : 'normal' }}>{label}</span>
        <span style={{ font: `700 11px ${F.mono}`, color: p > 82 ? ink : '#fff' }}>{value}</span>
      </span>
    </span>
  );
}

export default function Home({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const today = todayQuest(s);
  const lvl = globalLevel(s);
  const firstName = (s.profile.firstName || 'toi').toUpperCase();
  const mainSkill = s.startSkill || SKILLS[0].id;
  const mainRank = skillRank(s, mainSkill);
  const mainSk = skillById(mainSkill);

  const validate = () => {
    if (!today) return;
    const q = today.quest;
    if (isInstant(q.rarity)) d({ t: 'VALIDATE', skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
    else nav.open('validate', { skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
  };

  /** Apparition décalée, identique sur toutes les cases de la page. */
  const rise = (i: number): React.CSSProperties => ({ animation: `nuRise .5s cubic-bezier(.2,1,.3,1) ${0.05 + i * 0.06}s both` });

  return (
    <div>
      {/* Fiche de personnage */}
      <header style={{ background: C.violet, padding: '16px 20px 22px', borderRadius: '0 0 34px 34px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: -60, top: -70, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.13)', animation: 'nuHalo 9s ease-in-out infinite' }} />
        <span style={{ position: 'absolute', left: -50, bottom: -80, width: 170, height: 170, borderRadius: '50%', background: s.onFire ? 'rgba(255,92,66,.42)' : 'rgba(198,242,78,.3)', animation: 'nuDrift 11s ease-in-out infinite' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ font: `800 32px/.96 ${F.display}`, color: '#fff', letterSpacing: '-.03em', minWidth: 0 }}>
            SALUT,<br />{firstName}
          </div>
          <Tap
            onTap={() => nav.go('profile')}
            style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.7)', letterSpacing: '.1em', flex: 'none', minHeight: 32, display: 'flex', alignItems: 'center' }}
          >
            @{s.profile.gamertag}
          </Tap>
        </div>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '132px 1fr', gap: 12, marginTop: 14 }}>
          {/* Avatar en pied, encadré comme une fiche */}
          <Tap
            onTap={() => nav.open('avatar')}
            style={{
              position: 'relative', height: 196, borderRadius: 22, overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(11,11,12,.5), rgba(11,11,12,.85))',
              border: '1px solid rgba(255,255,255,.16)'
            }}
          >
            <span style={{ position: 'absolute', inset: 0 }}>
              <AvatarCut av={s.profile.av} crop="full" />
            </span>
            <span
              style={{
                position: 'absolute', left: 10, top: 10, background: C.ink, color: '#fff', borderRadius: 12,
                padding: '5px 9px', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              <span style={{ font: `500 6.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.55)' }}>NIV</span>
              <span style={{ font: `800 17px/1 ${F.display}`, letterSpacing: '-.02em' }}>{lvl}</span>
            </span>
            <span
              style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 10px 9px',
                background: 'linear-gradient(180deg,transparent,rgba(11,11,12,.9))',
                font: `500 8.5px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(255,255,255,.65)', textAlign: 'center'
              }}
            >
              STUDIO AVATAR
            </span>
          </Tap>

          {/* Statuts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <Gauge label="EXPÉRIENCE" value={`${globalPct(s)} %`} pct={globalPct(s)} c={C.lime} />
            <Gauge
              label={s.onFire ? 'ÉNERGIE · ×2' : 'ÉNERGIE'}
              value={s.energy + ' %'} pct={s.energy}
              c={s.onFire ? C.coral : C.honey}
              ink={s.onFire ? '#fff' : C.ink}
            />

            <div
              style={{
                flex: 1, background: 'rgba(11,11,12,.3)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16,
                padding: '11px 13px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: mainSk.c, flex: 'none' }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.5)' }}>RANG · {mainSk.name}</span>
                  <span style={{ display: 'block', font: `800 15px ${F.display}`, color: '#fff', letterSpacing: '-.01em', marginTop: 2 }}>{mainRank.label}</span>
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.honey, flex: 'none' }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.5)' }}>PIÈCES</span>
                  <span style={{ display: 'block', font: `800 15px ${F.display}`, color: '#fff', letterSpacing: '-.01em', marginTop: 2 }}>{s.coins}</span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: '16px 22px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Quête du jour */}
        {today ? (
          <Tap
            onTap={validate}
            haptic="soft"
            style={{
              borderRadius: 26, padding: '17px 20px', position: 'relative', overflow: 'hidden',
              background: `linear-gradient(115deg, ${C.lime}, #E4FF9A, ${C.lime})`,
              backgroundSize: '220% 100%', animation: `nuRise .5s cubic-bezier(.2,1,.3,1) .05s both, nuGrad 9s ease-in-out infinite`
            }}
          >
            <span style={{ position: 'absolute', top: 0, bottom: 0, width: 70, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent)', animation: 'nuShine 4.5s ease-in-out infinite' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <Kicker dark>QUÊTE DU JOUR</Kicker>
              <span style={{ font: `700 11px ${F.mono}`, color: C.ink, background: 'rgba(11,11,12,.12)', padding: '4px 9px', borderRadius: 99 }}>
                +{s.onFire ? today.quest.px * 2 : today.quest.px} PX
              </span>
            </div>
            <div style={{ font: `800 25px/1.05 ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 10, position: 'relative' }}>{today.quest.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, position: 'relative', gap: 10 }}>
              <span style={{ font: `500 12px ${F.body}`, color: 'rgba(11,11,12,.62)' }}>
                {skillById(today.skill).name} · {isInstant(today.quest.rarity) ? 'un tap suffit' : 'preuve requise'}
              </span>
              <span style={{ font: `700 12px ${F.body}`, color: C.lime, background: C.ink, padding: '12px 22px', borderRadius: 99, minHeight: 44, display: 'flex', alignItems: 'center', flex: 'none' }}>VALIDER</span>
            </div>
          </Tap>
        ) : null}

        {/* Raccourcis */}
        <div style={{ display: 'flex', gap: 10, ...rise(1) }}>
          {([
            ['journal', C.sand, 'JOURNAL', s.journal.length + ' entrées', <path d="M6 4h9l3 3v13H6z M9 10h7M9 14h5" />],
            ['discover', C.coral, 'DÉCOUVRIR', s.freeDraws + ' pioches', <path d="M12 5v14M5 12h14" />]
          ] as const).map(([route, col, title, sub, icon]) => (
            <Tap key={route} onTap={() => nav.open(route)} style={{ flex: 1, background: C.night, borderRadius: 22, padding: '14px 16px', border: '1px solid rgba(255,255,255,.08)', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', left: -20, top: -30, width: 100, height: 100, borderRadius: '50%', background: col, opacity: .16, animation: 'nuHalo 8s ease-in-out infinite' }} />
              <span style={{ position: 'relative', width: 32, height: 32, borderRadius: 11, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </span>
              <div style={{ font: `800 15px ${F.display}`, color: '#fff', marginTop: 12, letterSpacing: '-.01em', position: 'relative' }}>{title}</div>
              <div style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 3, position: 'relative' }}>{sub}</div>
            </Tap>
          ))}
        </div>

        {/* Compétences et leurs rangs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, ...rise(2) }}>
          <Kicker>RANGS PAR COMPÉTENCE</Kicker>
          <span style={{ font: `500 11px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>{SKILLS.length} compétences</span>
        </div>
        {SKILLS.map((sk, i) => {
          const r = skillRank(s, sk.id);
          const rows = boardRows(s, sk.id);
          const lv = levelOf(s, sk.id);
          return (
            <Tap key={sk.id} onTap={() => nav.open('path', { skill: sk.id })} style={{ background: sk.c, borderRadius: 22, padding: '15px 17px', color: sk.txt, position: 'relative', overflow: 'hidden', ...rise(3 + i) }}>
              <span style={{ position: 'absolute', right: -40, top: -50, width: 130, height: 130, borderRadius: '50%', background: sk.txt === '#FFFFFF' ? 'rgba(255,255,255,.14)' : 'rgba(11,11,12,.1)', animation: `nuHalo ${7 + i}s ease-in-out infinite` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, position: 'relative' }}>
                <span style={{ font: `800 19px ${F.display}`, letterSpacing: '-.01em' }}>{sk.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ font: `700 10px ${F.mono}`, letterSpacing: '.08em', background: 'rgba(11,11,12,.16)', padding: '5px 9px', borderRadius: 99 }}>{r.label}</span>
                  <Chevron c={sk.txt === '#FFFFFF' ? 'rgba(255,255,255,.6)' : 'rgba(11,11,12,.4)'} />
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'rgba(11,11,12,.18)', marginTop: 11, overflow: 'hidden', position: 'relative' }}>
                <span style={{ display: 'block', height: '100%', width: r.pct + '%', background: sk.txt === '#FFFFFF' ? '#fff' : C.ink, borderRadius: 99, transformOrigin: 'left', animation: 'nuStat .9s cubic-bezier(.2,1,.3,1) both', transition: 'width .7s cubic-bezier(.2,1,.3,1)' }} />
              </div>
              <div style={{ font: `400 11.5px ${F.body}`, opacity: .62, marginTop: 8, position: 'relative' }}>
                {pxOf(s, sk.id)} PX · {rows.find((r2) => r2.state === 'now')?.name || 'Plateau terminé'} · {lv}/{rows.length} paliers
              </div>
            </Tap>
          );
        })}

        {/* Pulse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          <Kicker>ACTIVITÉ DES AMIS</Kicker>
          {PULSE.map(([who, name, what]) => (
            <Tap key={who} onTap={() => nav.open('feed')} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}><AvatarCut who={who} crop="face" /></span>
              <span style={{ font: `400 12.5px/1.3 ${F.body}`, color: 'rgba(255,255,255,.78)' }}>
                <b style={{ fontWeight: 700, color: '#fff' }}>{name}</b> {what}
              </span>
            </Tap>
          ))}
        </div>
      </div>
    </div>
  );
}
