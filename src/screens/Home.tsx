import React from 'react';
import { C, F } from '../theme';
import { useGame, COMBO_WINDOW, comboBonus } from '../state/store';
import { SKILLS, skillById } from '../data/skills';
import { globalLevel, globalPct, skillRank, todayQuest, weekStats } from '../state/selectors';
import { isInstant, DIFFS } from '../data/quests';
import AvatarFrame from '../components/AvatarFrame';
import Logo from '../components/Logo';
import WeekStrip from '../components/WeekStrip';
import { RankBadge } from '../components/RankIcon';
import { Kicker, Tap } from '../components/ui';
import type { Nav } from '../App';

const PULSE = [
  ['lea', 'Léa', 'a remporté un duel contre Karim'],
  ['ines', 'Inès', 'passe Or III en couture'],
  ['tom', 'Tom', 'a validé trois quêtes ce matin']
];

const FOCUS_KEY = 'nunu.focus';

export default function Home({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const today = todayQuest(s);
  const lvl = globalLevel(s);
  const firstName = (s.profile.firstName || 'toi').toUpperCase();
  const mainSkill = s.startSkill || SKILLS[0].id;
  const mainRank = skillRank(s, mainSkill);
  const mainSk = skillById(mainSkill);
  const w = weekStats(s);

  const [focus, setFocus] = React.useState(() => {
    try { return localStorage.getItem(FOCUS_KEY) === '1'; } catch { return false; }
  });
  const toggleFocus = () => setFocus((v) => {
    const next = !v;
    try { localStorage.setItem(FOCUS_KEY, next ? '1' : '0'); } catch { /* ignoré */ }
    return next;
  });

  const comboLive = s.combo.n > 1 && s.combo.last && Date.now() - s.combo.last < COMBO_WINDOW;

  /** Ambiance claire du HUD : elle suit l'heure de la journée. */
  const hour = new Date().getHours();
  const amb =
    hour < 6 ? { k: 'NUIT', g: `linear-gradient(152deg, #EDEFF4, #DCE0EA 72%, #E6E9F0)`, a: C.teal, hello: 'ENCORE DEBOUT' }
    : hour < 11 ? { k: 'MATIN', g: `linear-gradient(152deg, #FCF6E7, #F2E7D2 72%, #F7EFDF)`, a: C.honey, hello: 'BONJOUR' }
    : hour < 18 ? { k: 'JOURNÉE', g: `linear-gradient(152deg, #F7F5F0, #E6EDF3 72%, #F1F3F2)`, a: C.azur, hello: 'SALUT' }
    : hour < 22 ? { k: 'SOIRÉE', g: `linear-gradient(152deg, #F5F0F8, #E3DDEF 72%, #EDE8F4)`, a: C.iris, hello: 'BONSOIR' }
    : { k: 'NUIT', g: `linear-gradient(152deg, #EDEFF4, #DCE0EA 72%, #E6E9F0)`, a: C.teal, hello: 'BONNE NUIT' };

  const validate = () => {
    if (!today) return;
    const q = today.quest;
    if (isInstant(q.rarity)) d({ t: 'VALIDATE', skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
    else nav.open('validate', { skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
  };

  const rise = (i: number): React.CSSProperties => ({ animation: `nuRise .5s cubic-bezier(.2,1,.3,1) ${0.05 + i * 0.06}s both` });

  return (
    <div>
      {/* HUD clair : buste, identité, expérience, constantes du jour */}
      <header
        style={{
          background: amb.g, borderRadius: '0 0 34px 34px', padding: '14px 20px 18px',
          position: 'relative', overflow: 'hidden', boxShadow: '0 26px 54px -44px rgba(0,0,0,.95)'
        }}
      >
        <span style={{ position: 'absolute', right: -80, top: -110, width: 260, height: 260, borderRadius: '50%', background: s.onFire ? C.coral : amb.a, opacity: .2, animation: 'nuHalo 11s ease-in-out infinite' }} />
        <span style={{ position: 'absolute', left: -60, bottom: -90, width: 190, height: 190, borderRadius: '50%', background: mainSk.c, opacity: .14, animation: 'nuHalo 14s ease-in-out infinite' }} />
        <span style={{ position: 'absolute', inset: 0, opacity: .5, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 7px, rgba(10,10,12,.022) 7px 8px)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <Logo size={19} word wordSize={14} color={C.ink} />
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(10,10,12,.38)' }}>{amb.k}</span>
              <span
                style={{
                  font: `700 8.5px ${F.mono}`, letterSpacing: '.12em',
                  color: s.onFire ? '#fff' : 'rgba(10,10,12,.6)',
                  background: s.onFire ? C.coral : 'rgba(255,255,255,.65)',
                  border: `1px solid ${s.onFire ? C.coral : 'rgba(10,10,12,.1)'}`,
                  borderRadius: 99, padding: '5px 10px'
                }}
              >
                {s.onFire ? 'EN FEU · PX ×2' : `ÉNERGIE ${s.energy}%`}
              </span>
            </span>

            {/* Le niveau du personnage : une seule mention, bien visible. */}
            <Tap
              onTap={() => nav.go('profile')} haptic="soft"
              style={{
                display: 'flex', alignItems: 'center', gap: 9, background: C.ink, borderRadius: 15,
                padding: '8px 13px 8px 12px', boxShadow: '0 14px 26px -20px rgba(0,0,0,.9)'
              }}
            >
              <span style={{ font: `500 8px ${F.mono}`, letterSpacing: '.2em', color: 'rgba(255,255,255,.5)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>NIVEAU</span>
              <span style={{ font: `800 30px/1 ${F.display}`, color: C.lime, letterSpacing: '-.04em' }}>{lvl}</span>
            </Tap>
          </span>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 15, marginTop: 10 }}>
          <AvatarFrame
            av={s.profile.av}
            crop="bust"
            size={116}
            accent={mainRank.c}
            onTap={() => nav.open('avatar')}
            style={{ animation: 'nuRise .5s cubic-bezier(.2,1,.3,1) both' }}
          />

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.2em', color: 'rgba(10,10,12,.4)' }}>{amb.hello}</span>
              <span style={{ display: 'block', font: `800 27px/1 ${F.display}`, color: C.ink, letterSpacing: '-.035em', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {firstName}
              </span>
              <Tap onTap={() => nav.go('profile')} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
                <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(10,10,12,.45)', letterSpacing: '.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{s.profile.gamertag}</span>
              </Tap>
            </div>

            <span style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <RankBadge rank={mainRank} skillName={mainSk.name} size="md" bg="rgba(255,255,255,.6)" onLight onTap={() => nav.open('path', { skill: mainSkill })} />
            </span>
          </div>
        </div>

        {/* Expérience : la barre se remplit à chaque ouverture */}
        <div style={{ position: 'relative', marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={{ font: `500 8px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(10,10,12,.42)' }}>EXPÉRIENCE</span>
            <span style={{ font: `700 10px ${F.mono}`, color: C.ink }}>{globalPct(s)} %</span>
          </div>
          <span style={{ display: 'block', height: 10, borderRadius: 99, background: 'rgba(10,10,12,.09)', overflow: 'hidden', marginTop: 8, position: 'relative' }}>
            <span
              style={{
                display: 'block', height: '100%', width: globalPct(s) + '%', borderRadius: 99,
                background: `linear-gradient(90deg, ${C.lime}, ${amb.a})`,
                transformOrigin: 'left', animation: 'nuStat 1.1s cubic-bezier(.2,1,.3,1) both',
                transition: 'width .9s cubic-bezier(.2,1,.3,1)'
              }}
            />
            <span style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 15px, rgba(244,242,237,.75) 15px 17px)' }} />
          </span>
        </div>

        {/* Constantes du jour */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
          {([
            ['SÉRIE', w.streak > 1 ? w.streak + ' j' : w.streak === 1 ? '1 j' : '—', w.streak > 1 ? C.honey : 'rgba(10,10,12,.35)'],
            ['SEMAINE', w.px + ' PX', C.ink],
            [comboLive ? 'COMBO' : 'ÉNERGIE', comboLive ? '×' + s.combo.n : s.energy + ' %', comboLive ? C.coral : s.onFire ? C.coral : C.ink]
          ] as const).map(([label, value, col]) => (
            <Tap
              key={label} onTap={() => nav.open('week')} haptic="soft"
              style={{
                background: 'rgba(255,255,255,.62)', border: '1px solid rgba(10,10,12,.07)', borderRadius: 14,
                padding: '10px 11px', minHeight: 54, display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}
            >
              <span style={{ font: `500 7.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(10,10,12,.4)' }}>{label}</span>
              <span style={{ font: `800 17px/1 ${F.display}`, color: col, letterSpacing: '-.02em', marginTop: 5 }}>{value}</span>
            </Tap>
          ))}
        </div>
      </header>

      <div style={{ padding: '20px 22px 30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Une seule chose à faire */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...rise(0) }}>
          <Kicker>{focus ? 'UNE SEULE CHOSE' : 'QUÊTE DU JOUR'}</Kicker>
          <Tap
            onTap={toggleFocus}
            haptic="soft"
            style={{
              display: 'flex', alignItems: 'center', gap: 7, minHeight: 34, padding: '0 11px', borderRadius: 99,
              border: `1px solid ${focus ? C.lime : C.line}`, background: focus ? 'rgba(185,222,100,.12)' : 'transparent'
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: focus ? C.lime : 'rgba(255,255,255,.3)' }} />
            <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: focus ? C.lime : 'rgba(255,255,255,.45)' }}>MODE FOCUS</span>
          </Tap>
        </div>

        {today ? (
          <Tap
            onTap={validate}
            haptic="soft"
            style={{
              borderRadius: 26, padding: focus ? '24px 22px 22px' : '18px 20px', position: 'relative', overflow: 'hidden',
              background: `linear-gradient(152deg, rgba(185,222,100,.13), rgba(255,255,255,.035) 58%, rgba(185,222,100,.07))`,
              border: '1px solid rgba(185,222,100,.26)',
              boxShadow: '0 22px 46px -38px rgba(0,0,0,.95)',
              animation: 'nuRise .5s cubic-bezier(.2,1,.3,1) .05s both'
            }}
          >
            <span style={{ position: 'absolute', right: -70, top: -90, width: 210, height: 210, borderRadius: '50%', background: C.lime, opacity: .1, animation: 'nuHalo 12s ease-in-out infinite' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, flex: 'none' }} />
                <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {skillById(today.skill).name}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 'none' }}>
                <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', border: `1px solid ${DIFFS[today.quest.diff].c}55`, padding: '4px 8px', borderRadius: 7 }}>
                  {DIFFS[today.quest.diff].label}
                </span>
                <span style={{ font: `700 11px ${F.mono}`, color: C.lime, background: 'rgba(185,222,100,.12)', padding: '4px 9px', borderRadius: 99 }}>
                  +{s.onFire ? today.quest.px * 2 : today.quest.px} PX
                </span>
              </span>
            </div>
            <div style={{ font: `800 ${focus ? 30 : 25}px/1.06 ${F.display}`, color: '#fff', letterSpacing: '-.025em', marginTop: focus ? 16 : 12, position: 'relative', textWrap: 'pretty' }}>
              {today.quest.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: focus ? 20 : 16, position: 'relative', gap: 10 }}>
              <span style={{ font: `400 12px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>
                {isInstant(today.quest.rarity) ? 'Un tap suffit' : 'Preuve requise'}
              </span>
              <span style={{ font: `700 12px ${F.body}`, color: C.ink, background: C.lime, padding: '13px 24px', borderRadius: 99, minHeight: 46, display: 'flex', alignItems: 'center', flex: 'none' }}>VALIDER</span>
            </div>
          </Tap>
        ) : null}

        {/* Combo en cours — remonté de l'écran Quêtes */}
        {comboLive ? (
          <Tap
            onTap={() => nav.go('quests')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, borderRadius: 18, padding: '13px 16px',
              background: s.combo.n >= 3 ? `linear-gradient(120deg, ${C.slate}, #2A1E1C)` : C.night,
              border: `1px solid ${s.combo.n >= 3 ? C.coral + '55' : C.line}`, ...rise(1)
            }}
          >
            <span style={{ font: `800 24px/1 ${F.display}`, color: s.combo.n >= 3 ? C.coral : '#fff', letterSpacing: '-.03em', flex: 'none' }}>×{s.combo.n}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)' }}>COMBO EN COURS</span>
              <span style={{ display: 'block', font: `700 12px ${F.body}`, color: '#fff', marginTop: 3 }}>
                {comboBonus(s.combo.n) ? `+${Math.round(comboBonus(s.combo.n) * 100)} % de PX tant que tu enchaînes` : 'Enchaîne pour déclencher le bonus'}
              </span>
            </span>
            <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.4)', flex: 'none' }}>
              {Math.max(1, Math.round((COMBO_WINDOW - (Date.now() - (s.combo.last || 0))) / 60e3))} MIN
            </span>
          </Tap>
        ) : null}

        {!focus ? (
          <>
            {/* Ma semaine */}
            <Tap
              onTap={() => nav.open('week')}
              style={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 24, padding: '17px 19px 15px', ...rise(2) }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <Kicker>MA SEMAINE</Kicker>
                <span style={{ font: `700 11px ${F.mono}`, color: C.lime }}>{w.px} PX</span>
              </div>
              <div style={{ marginTop: 14 }}><WeekStrip days={w.days} h={40} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 13, gap: 10 }}>
                <span style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>
                  {w.streak > 1 ? `Série de ${w.streak} jours` : w.n ? `${w.n} validations` : 'Rien validé cette semaine'}
                </span>
                <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.azur }}>VOIR LE BILAN →</span>
              </div>
            </Tap>

            {/* Raccourcis */}
            <div style={{ display: 'flex', gap: 12, ...rise(3) }}>
              {([
                ['journal', C.azur, 'JOURNAL', s.journal.length + ' entrées', <path d="M6 4h9l3 3v13H6z M9 10h7M9 14h5" />],
                ['discover', C.iris, 'DÉCOUVRIR', s.freeDraws + ' pioches', <path d="M12 5v14M5 12h14" />]
              ] as const).map(([route, col, title, sub, icon]) => (
                <Tap key={route} onTap={() => nav.open(route)} style={{ flex: 1, background: C.night, borderRadius: 22, padding: '15px 17px', border: `1px solid ${C.line}`, position: 'relative', overflow: 'hidden' }}>
                  <span style={{ position: 'absolute', left: -20, top: -30, width: 100, height: 100, borderRadius: '50%', background: col, opacity: .14, animation: 'nuHalo 8s ease-in-out infinite' }} />
                  <span style={{ position: 'relative', width: 34, height: 34, borderRadius: 12, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </span>
                  <div style={{ font: `800 15px ${F.display}`, color: '#fff', marginTop: 13, letterSpacing: '-.01em', position: 'relative' }}>{title}</div>
                  <div style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 4, position: 'relative' }}>{sub}</div>
                </Tap>
              ))}
            </div>

            {/* Activité des amis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8, ...rise(4) }}>
              <Kicker>ACTIVITÉ DES AMIS</Kicker>
              {PULSE.map(([who, name, what]) => (
                <Tap key={who} onTap={() => nav.open('feed')} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AvatarFrame who={who} crop="face" size={40} accent={C.azur} />
                  <span style={{ font: `400 12.5px/1.35 ${F.body}`, color: 'rgba(255,255,255,.75)' }}>
                    <b style={{ fontWeight: 700, color: '#fff' }}>{name}</b> {what}
                  </span>
                </Tap>
              ))}
            </div>
          </>
        ) : (
          <Tap
            onTap={toggleFocus}
            style={{ textAlign: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(255,255,255,.4)', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            AFFICHER TOUT L’ACCUEIL
          </Tap>
        )}
      </div>
    </div>
  );
}
