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

/** Jauge fine : le libellé vit au-dessus, la valeur à droite. */
function Gauge({ label, value, pct, c }: { label: string; value: string; pct: number; c: string }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <span style={{ display: 'block', flex: 1, minWidth: 0 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)' }}>{label}</span>
        <span style={{ font: `700 10px ${F.mono}`, color: c }}>{value}</span>
      </span>
      <span style={{ display: 'block', height: 6, borderRadius: 99, background: 'rgba(255,255,255,.09)', overflow: 'hidden', marginTop: 7 }}>
        <span
          style={{
            display: 'block', height: '100%', width: p + '%', background: c, borderRadius: 99,
            transformOrigin: 'left', animation: 'nuStat .8s cubic-bezier(.2,1,.3,1) both',
            transition: 'width .8s cubic-bezier(.2,1,.3,1)'
          }}
        />
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

  const validate = () => {
    if (!today) return;
    const q = today.quest;
    if (isInstant(q.rarity)) d({ t: 'VALIDATE', skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
    else nav.open('validate', { skill: today.skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
  };

  const rise = (i: number): React.CSSProperties => ({ animation: `nuRise .5s cubic-bezier(.2,1,.3,1) ${0.05 + i * 0.06}s both` });

  return (
    <div>
      {/* En-tête compact : identité, rang, deux jauges */}
      <header
        style={{
          background: `linear-gradient(155deg, ${C.slate}, ${C.night} 70%)`,
          borderBottom: `1px solid ${C.line}`,
          borderRadius: '0 0 30px 30px', padding: '16px 22px 20px', position: 'relative', overflow: 'hidden'
        }}
      >
        <span style={{ position: 'absolute', right: -70, top: -90, width: 210, height: 210, borderRadius: '50%', background: s.onFire ? C.coral : mainSk.c, opacity: .13, animation: 'nuHalo 10s ease-in-out infinite' }} />

        {/* Bandeau de marque */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
          <Logo size={19} word wordSize={14} color="rgba(255,255,255,.8)" />
          <span
            style={{
              font: `700 8.5px ${F.mono}`, letterSpacing: '.14em',
              color: s.onFire ? C.coral : 'rgba(255,255,255,.4)',
              border: `1px solid ${s.onFire ? C.coral + '66' : C.line}`, borderRadius: 99, padding: '5px 10px'
            }}
          >
            {s.onFire ? 'EN FEU · PX ×2' : `ÉNERGIE ${s.energy}%`}
          </span>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13 }}>
          <AvatarFrame
            av={s.profile.av}
            crop="face"
            size={62}
            accent={mainRank.c}
            onTap={() => nav.open('avatar')}
          />

          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `800 22px/1 ${F.display}`, color: '#fff', letterSpacing: '-.025em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              SALUT, {firstName}
            </span>
            <Tap
              onTap={() => nav.go('profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}
            >
              <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: C.lime, borderRadius: 99, padding: '3px 8px' }}>NIV {lvl}</span>
              <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{s.profile.gamertag}</span>
            </Tap>
          </span>

          <span style={{ flex: 'none' }}>
            <RankBadge rank={mainRank} skillName={mainSk.name} size="md" bg="rgba(255,255,255,.05)" onTap={() => nav.open('path', { skill: mainSkill })} />
          </span>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 16, marginTop: 18 }}>
          <Gauge label="EXPÉRIENCE" value={`${globalPct(s)} %`} pct={globalPct(s)} c={C.lime} />
          <Gauge
            label={s.onFire ? 'ÉNERGIE · ×2' : 'ÉNERGIE'}
            value={s.energy + ' %'} pct={s.energy}
            c={s.onFire ? C.coral : C.honey}
          />
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
              borderRadius: 26, padding: focus ? '26px 22px 22px' : '18px 20px', position: 'relative', overflow: 'hidden',
              background: `linear-gradient(118deg, ${C.lime}, #D6EE93, ${C.lime})`,
              backgroundSize: '220% 100%', animation: `nuRise .5s cubic-bezier(.2,1,.3,1) .05s both, nuGrad 10s ease-in-out infinite`,
              boxShadow: `0 24px 48px -32px ${C.lime}`
            }}
          >
            <span style={{ position: 'absolute', top: 0, bottom: 0, width: 70, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)', animation: 'nuShine 5s ease-in-out infinite' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', gap: 10 }}>
              <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(10,10,12,.5)' }}>
                {skillById(today.skill).name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: DIFFS[today.quest.diff].txt, background: DIFFS[today.quest.diff].c, padding: '4px 8px', borderRadius: 7 }}>
                  {DIFFS[today.quest.diff].label}
                </span>
                <span style={{ font: `700 11px ${F.mono}`, color: C.ink, background: 'rgba(10,10,12,.12)', padding: '4px 9px', borderRadius: 99 }}>
                  +{s.onFire ? today.quest.px * 2 : today.quest.px} PX
                </span>
              </span>
            </div>
            <div style={{ font: `800 ${focus ? 32 : 26}px/1.04 ${F.display}`, color: C.ink, letterSpacing: '-.025em', marginTop: focus ? 16 : 12, position: 'relative', textWrap: 'pretty' }}>
              {today.quest.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: focus ? 22 : 16, position: 'relative', gap: 10 }}>
              <span style={{ font: `500 12px ${F.body}`, color: 'rgba(10,10,12,.6)' }}>
                {isInstant(today.quest.rarity) ? 'Un tap suffit' : 'Preuve requise'}
              </span>
              <span style={{ font: `700 12px ${F.body}`, color: C.lime, background: C.ink, padding: '13px 24px', borderRadius: 99, minHeight: 46, display: 'flex', alignItems: 'center', flex: 'none' }}>VALIDER</span>
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
