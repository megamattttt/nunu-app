import React from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { SKILLS, skillById } from '../data/skills';
import { boardRows, globalLevel, globalPct, levelOf, skillRank, pxOf, todayQuest, totalPx } from '../state/selectors';
import { isInstant } from '../data/quests';
import AvatarCut from '../components/avatar/AvatarCut';
import Logo from '../components/Logo';
import { Bar, Chevron, Kicker, Tap, Bolt } from '../components/ui';
import type { Nav } from '../App';

const PULSE = [
  ['lea', 'Léa', 'a remporté un duel contre Karim'],
  ['ines', 'Inès', 'passe Or III en couture'],
  ['tom', 'Tom', 'a validé trois quêtes ce matin']
];

const DAY = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Home({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const today = todayQuest(s);
  const lvl = globalLevel(s);
  const firstName = (s.profile.firstName || 'toi').toUpperCase();

  const validate = () => {
    if (!today) return;
    const q = today.quest;
    if (isInstant(q.rarity)) d({ t: 'VALIDATE', skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
    else nav.open('validate', { skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
  };

  return (
    <div>
      {/* Bandeau */}
      <header style={{ background: C.violet, padding: '16px 22px 24px', borderRadius: '0 0 34px 34px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: -40, top: -30, width: 170, height: 170, borderRadius: '50%', background: 'rgba(255,255,255,.13)' }} />
        <span style={{ position: 'absolute', left: -30, bottom: -60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(198,242,78,.32)' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <Logo size={30} word wordSize={20} />
          <div style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.7)', letterSpacing: '.14em', textTransform: 'uppercase' }}>{DAY.format(new Date())}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginTop: 16 }}>
          <div>
            <div style={{ font: `800 40px/.94 ${F.display}`, color: '#fff', letterSpacing: '-.025em' }}>SALUT,<br />{firstName}</div>
            <div style={{ font: `500 11px ${F.mono}`, color: 'rgba(255,255,255,.7)', letterSpacing: '.1em', marginTop: 8 }}>@{s.profile.gamertag}</div>
          </div>
          <Tap onTap={() => nav.go('profile')} style={{ width: 56, height: 56, borderRadius: '50%', flex: 'none', border: '2px solid rgba(255,255,255,.4)', overflow: 'hidden' }}>
            <AvatarCut av={s.profile.av} crop="face" />
          </Tap>
        </div>
      </header>

      <div style={{ padding: '16px 22px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Niveau global + énergie */}
        <section style={{ background: C.paper, borderRadius: 26, padding: '16px 18px 15px', position: 'relative', overflow: 'hidden', animation: 'nuPop .5s cubic-bezier(.2,1.2,.3,1)' }}>
          <span style={{ position: 'absolute', right: -50, top: -60, width: 170, height: 170, borderRadius: '50%', background: s.onFire ? C.coral : C.violet, opacity: .18 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <span style={{ width: 58, height: 58, borderRadius: 20, background: C.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <span style={{ font: `500 7.5px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em' }}>NIV</span>
              <span style={{ font: `800 24px/1 ${F.display}`, color: '#fff' }}>{lvl}</span>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <Kicker dark>NIVEAU DE PERSONNAGE</Kicker>
              <span style={{ display: 'block', font: `800 22px ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 2 }}>{totalPx(s).toLocaleString('fr-FR')} PX</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8 }}>
                <Bar pct={globalPct(s)} c={C.ink} h={9} />
                <span style={{ font: `700 9.5px ${F.mono}`, color: 'rgba(11,11,12,.5)', flex: 'none' }}>{globalPct(s)}%</span>
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 14, paddingTop: 13, borderTop: '1px solid rgba(11,11,12,.1)' }}>
            <span style={{ width: 26, height: 26, borderRadius: 9, background: s.onFire ? C.coral : C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Bolt c={s.onFire ? '#fff' : C.ink} /></span>
            <Bar pct={s.energy} c={s.onFire ? C.coral : C.lime} h={9} />
            <span style={{ font: `700 10px ${F.mono}`, color: s.onFire ? C.coral : 'rgba(11,11,12,.6)', flex: 'none' }}>
              {s.onFire ? 'EN FEU · PX ×2' : 'ÉNERGIE ' + s.energy + '%'}
            </span>
          </div>
          <div style={{ font: `400 11px/1.4 ${F.body}`, color: 'rgba(11,11,12,.5)', marginTop: 8 }}>
            {s.onFire
              ? 'Chaque quête validée rapporte le double, et consomme un quart de la jauge.'
              : 'Chaque quête validée remplit la jauge. Pleine, elle double tes PX.'}
          </div>
        </section>

        {/* Quête du jour */}
        {today ? (
          <Tap
            onTap={validate}
            haptic="soft"
            style={{ background: C.lime, borderRadius: 26, padding: '16px 20px', position: 'relative', overflow: 'hidden' }}
          >
            <span style={{ position: 'absolute', top: 0, bottom: 0, width: 70, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)', animation: 'nuShine 4.5s ease-in-out infinite' }} />
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
        <div style={{ display: 'flex', gap: 10 }}>
          <Tap onTap={() => nav.open('discover')} style={{ flex: 1, background: C.night, borderRadius: 22, padding: '14px 16px', border: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ width: 32, height: 32, borderRadius: 11, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
            </span>
            <div style={{ font: `800 15px ${F.display}`, color: '#fff', marginTop: 12, letterSpacing: '-.01em' }}>DÉCOUVRIR</div>
            <div style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>{s.freeDraws} pioches restantes</div>
          </Tap>
          <Tap onTap={() => nav.open('feed')} style={{ flex: 1, background: C.night, borderRadius: 22, padding: '14px 16px', border: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ width: 32, height: 32, borderRadius: 11, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.4"><path d="M20 12a8 8 0 1 1-3.2-6.4" /><path d="M4 19l1.5-3.5" /></svg>
            </span>
            <div style={{ font: `800 15px ${F.display}`, color: '#fff', marginTop: 12, letterSpacing: '-.01em' }}>LE MUR</div>
            <div style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>{s.feed.length} publications</div>
          </Tap>
        </div>

        {/* Compétences et leurs rangs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Kicker>RANGS PAR COMPÉTENCE</Kicker>
          <span style={{ font: `500 11px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>{SKILLS.length} compétences</span>
        </div>
        {SKILLS.map((sk) => {
          const r = skillRank(s, sk.id);
          const rows = boardRows(s, sk.id);
          const lv = levelOf(s, sk.id);
          return (
            <Tap key={sk.id} onTap={() => nav.open('path', { skill: sk.id })} style={{ background: sk.c, borderRadius: 22, padding: '15px 17px', color: sk.txt }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <span style={{ font: `800 19px ${F.display}`, letterSpacing: '-.01em' }}>{sk.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ font: `700 10px ${F.mono}`, letterSpacing: '.08em', background: 'rgba(11,11,12,.16)', padding: '5px 9px', borderRadius: 99 }}>{r.label}</span>
                  <Chevron c={sk.txt === '#FFFFFF' ? 'rgba(255,255,255,.6)' : 'rgba(11,11,12,.4)'} />
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'rgba(11,11,12,.18)', marginTop: 11, overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: r.pct + '%', background: sk.txt === '#FFFFFF' ? '#fff' : C.ink, borderRadius: 99, transition: 'width .7s cubic-bezier(.2,1,.3,1)' }} />
              </div>
              <div style={{ font: `400 11.5px ${F.body}`, opacity: .62, marginTop: 8 }}>
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
