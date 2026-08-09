import React from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { SKILLS, skillById, PSHORT, DIVW, PALIERS } from '../data/skills';
import { boardRows, levelOf, palierPct, pxOf, todayQuest, totalPx } from '../state/selectors';
import AvatarCut from '../components/avatar/AvatarCut';
import { Bar, Chevron, Kicker, Star, Tap, Bolt } from '../components/ui';
import type { Nav } from '../App';

const PULSE = [
  ['lea', 'Léa', 'a remporté un duel contre Karim'],
  ['ines', 'Inès', 'passe en Division 4 couture'],
  ['tom', 'Tom', 'a validé trois quêtes ce matin']
];

const DAY = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Home({ nav }: { nav: Nav }) {
  const { s } = useGame();
  const today = todayQuest(s);
  const pal = PALIERS[s.pal];
  const firstName = s.profile.pseudo.split(' ')[0].toUpperCase();

  return (
    <div>
      {/* Bandeau */}
      <header style={{ background: C.violet, padding: '18px 22px 24px', borderRadius: '0 0 34px 34px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: -40, top: -30, width: 170, height: 170, borderRadius: '50%', background: 'rgba(255,255,255,.13)' }} />
        <span style={{ position: 'absolute', left: -30, bottom: -60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(198,242,78,.32)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ font: `500 10.5px ${F.mono}`, color: 'rgba(255,255,255,.72)', letterSpacing: '.16em', textTransform: 'uppercase' }}>{DAY.format(new Date())}</div>
            <div style={{ font: `800 42px/.94 ${F.display}`, color: '#fff', letterSpacing: '-.025em', marginTop: 8 }}>SALUT,<br />{firstName}</div>
          </div>
          <Tap onTap={() => nav.go('profile')} style={{ width: 56, height: 56, borderRadius: '50%', flex: 'none', border: '2px solid rgba(255,255,255,.4)', overflow: 'hidden' }}>
            <AvatarCut av={s.profile.av} crop="face" />
          </Tap>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, position: 'relative' }}>
          {[
            ['SÉRIE', s.streak + ' j', '#fff'],
            ['PIÈCES', String(s.coins), C.honey],
            ['ÉNERGIE', s.energy + '%', C.lime]
          ].map(([k, v, col]) => (
            <div key={k} style={{ flex: 1, background: 'rgba(11,11,12,.28)', borderRadius: 16, padding: '10px 12px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.62)', letterSpacing: '.12em' }}>{k}</div>
              <div style={{ font: `800 20px ${F.display}`, color: col as string, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ padding: '16px 22px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Rang */}
        <section style={{ background: C.paper, borderRadius: 26, padding: '16px 18px 15px', position: 'relative', overflow: 'hidden', animation: 'nuPop .5s cubic-bezier(.2,1.2,.3,1)' }}>
          <span style={{ position: 'absolute', right: -50, top: -60, width: 170, height: 170, borderRadius: '50%', background: pal[1], opacity: .2 }} />
          <Tap onTap={() => nav.go('league')} style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <span style={{ width: 54, height: 54, borderRadius: 18, background: pal[1], display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', position: 'relative' }}>
              <Star size={30} />
              <span style={{ position: 'absolute', bottom: -6, right: -6, background: C.ink, color: '#fff', font: `700 9px ${F.mono}`, padding: '3px 6px', borderRadius: 7 }}>{DIVW[s.div]}</span>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <Kicker dark>RANG GÉNÉRAL</Kicker>
              <span style={{ display: 'block', font: `800 24px ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 2 }}>{pal[0]} {DIVW[s.div]}</span>
              <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(11,11,12,.55)', marginTop: 4 }}>{100 - s.lp} LP avant la division supérieure</span>
            </span>
            <Chevron />
          </Tap>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 14 }}>
            <Bar pct={s.lp} c={C.ink} h={12} />
            <span style={{ font: `700 10px ${F.mono}`, color: C.paper, background: C.ink, padding: '7px 10px', borderRadius: 99, letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{s.lp} LP</span>
          </div>
          <Tap onTap={() => nav.go('quests')} style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 13, paddingTop: 13, borderTop: '1px solid rgba(11,11,12,.1)' }}>
            <span style={{ width: 26, height: 26, borderRadius: 9, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Bolt /></span>
            <Bar pct={s.energy} c={C.lime} h={9} />
            <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(11,11,12,.6)', flex: 'none' }}>VIE {s.energy}%</span>
          </Tap>
        </section>

        {/* Quête du jour */}
        {today ? (
          <Tap
            onTap={() => nav.open('validate', { skill: today.skill, ix: today.quest.ix, name: today.quest.name, px: today.quest.px })}
            haptic="soft"
            style={{ background: C.lime, borderRadius: 26, padding: '16px 20px', position: 'relative', overflow: 'hidden' }}
          >
            <span style={{ position: 'absolute', top: 0, bottom: 0, width: 70, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)', animation: 'nuShine 4.5s ease-in-out infinite' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <Kicker dark>QUÊTE DU JOUR</Kicker>
              <span style={{ font: `700 11px ${F.mono}`, color: C.ink, background: 'rgba(11,11,12,.12)', padding: '4px 9px', borderRadius: 99 }}>+{today.quest.px} PX</span>
            </div>
            <div style={{ font: `800 25px/1.05 ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 10, position: 'relative' }}>{today.quest.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, position: 'relative' }}>
              <span style={{ font: `500 12px ${F.body}`, color: 'rgba(11,11,12,.62)' }}>{skillById(today.skill).name} · palier {today.quest.ix + 1}</span>
              <span style={{ font: `700 12px ${F.body}`, color: C.lime, background: C.ink, padding: '12px 22px', borderRadius: 99, minHeight: 44, display: 'flex', alignItems: 'center' }}>VALIDER</span>
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

        {/* Compétences */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Kicker>TES COMPÉTENCES</Kicker>
          <span style={{ font: `500 11px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>{totalPx(s).toLocaleString('fr-FR')} PX</span>
        </div>
        {SKILLS.map((sk) => {
          const lvl = levelOf(s, sk.id);
          const rows = boardRows(s, sk.id);
          return (
            <Tap key={sk.id} onTap={() => nav.go('quests')} style={{ background: sk.c, borderRadius: 22, padding: '15px 17px', color: sk.txt }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: `800 19px ${F.display}`, letterSpacing: '-.01em' }}>{sk.name}</span>
                <span style={{ font: `700 10.5px ${F.mono}`, opacity: .65 }}>NIV {lvl} · {pxOf(s, sk.id)} PX</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'rgba(11,11,12,.18)', marginTop: 11, overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: palierPct(s, sk.id) + '%', background: sk.txt === '#FFFFFF' ? '#fff' : C.ink, borderRadius: 99, transition: 'width .7s cubic-bezier(.2,1,.3,1)' }} />
              </div>
              <div style={{ font: `400 11.5px ${F.body}`, opacity: .62, marginTop: 8 }}>
                {rows.find((r) => r.state === 'now')?.name || 'Plateau terminé'} · {lvl}/{rows.length} paliers
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
