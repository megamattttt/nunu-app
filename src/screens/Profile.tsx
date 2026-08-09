import React from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { SKILLS, skillById, PSHORT, DIVW } from '../data/skills';
import { QUOTES, CHALLENGES } from '../data/quests';
import { ownedObjects, questsDone, totalPx } from '../state/selectors';
import { DIO_OBJ } from '../data/diorama';
import AvatarCut from '../components/avatar/AvatarCut';
import DioramaScene from '../components/DioramaScene';
import { CADRE_C } from '../data/quiz';
import { Kicker, Star, Tap } from '../components/ui';
import type { Nav } from '../App';

export default function Profile({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const sig = ['#C6F24E','#FF5C42','#6C63FF','#FFC93C','#A8D8FF','#B06FF0','#2FA88A','#F8A79F'][s.profile.sig];
  const quote = QUOTES[s.banner.quote % QUOTES.length];
  const chall = CHALLENGES[s.banner.chall % CHALLENGES.length];

  return (
    <div>
      <header style={{ background: C.sky, padding: '20px 22px 24px', borderRadius: '0 0 34px 34px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: -60, top: -70, width: 210, height: 210, borderRadius: '50%', background: sig, opacity: .45 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <Tap onTap={() => nav.open('avatar')} style={{ width: 92, height: 92, borderRadius: 30, padding: 4, background: CADRE_C[s.profile.cadre], flex: 'none' }}>
            <span style={{ width: '100%', height: '100%', borderRadius: 26, overflow: 'hidden', display: 'block', background: C.ink }}>
              <AvatarCut av={s.profile.av} crop="bust" />
            </span>
          </Tap>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `800 32px/1 ${F.display}`, color: C.ink, letterSpacing: '-.025em' }}>{s.profile.pseudo}</span>
            <span style={{ display: 'block', font: `400 12.5px ${F.body}`, color: 'rgba(11,11,12,.62)', marginTop: 6 }}>{s.profile.atelier}</span>
            <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
              <span style={{ font: `700 10px ${F.mono}`, color: C.paper, background: C.ink, padding: '5px 10px', borderRadius: 99, letterSpacing: '.1em' }}>{PSHORT[s.pal]} {DIVW[s.div]}</span>
              <span style={{ font: `700 10px ${F.mono}`, color: C.ink, background: sig, padding: '5px 10px', borderRadius: 99, letterSpacing: '.06em' }}>SÉRIE {s.streak} J</span>
            </span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, position: 'relative' }}>
          {[['PX TOTAL', totalPx(s).toLocaleString('fr-FR')], ['QUÊTES', String(questsDone(s))], ['PIÈCES', String(s.coins)]].map(([k, v]) => (
            <div key={k} style={{ flex: 1, background: 'rgba(255,255,255,.62)', borderRadius: 16, padding: '10px 12px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(11,11,12,.55)', letterSpacing: '.12em' }}>{k}</div>
              <div style={{ font: `800 19px ${F.display}`, color: C.ink, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ padding: '18px 22px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Diorama */}
        <div style={{ background: '#EADFC9', borderRadius: 26, padding: 9 }}>
          <DioramaScene height={230} onPick={() => nav.open('diorama')} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, padding: '13px 9px 5px' }}>
            <span>
              <span style={{ display: 'block', font: `500 9px ${F.mono}`, color: 'rgba(60,42,28,.55)', letterSpacing: '.16em' }}>DIORAMA · PAPIER DÉCOUPÉ</span>
              <span style={{ display: 'block', font: `800 21px ${F.display}`, color: '#3A2A1C', letterSpacing: '-.02em', marginTop: 3 }}>ATELIER COUTURE</span>
              <span style={{ display: 'block', font: `400 10.5px ${F.body}`, color: 'rgba(60,42,28,.55)', marginTop: 3 }}>{DIO_OBJ.length - Object.keys(s.dio.out).length} pièces posées</span>
            </span>
            <Tap onTap={() => nav.open('diorama')} style={{ font: `700 9.5px ${F.mono}`, color: '#F4E7D3', background: '#3A2A1C', padding: '12px 14px', borderRadius: 99, letterSpacing: '.08em', flex: 'none', minHeight: 44, display: 'flex', alignItems: 'center' }}>PERSONNALISER</Tap>
          </div>
        </div>

        {/* Bannière */}
        <section style={{ background: C.paper, borderRadius: 26, padding: '18px 20px 20px', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', right: -60, top: -80, width: 200, height: 200, borderRadius: '50%', background: sig, opacity: .18 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', gap: 10 }}>
            <Kicker dark>BANNIÈRE DE COMPÉTENCES</Kicker>
            <Tap onTap={() => nav.open('banner')} style={{ font: `700 9.5px ${F.mono}`, color: C.paper, background: C.ink, padding: '10px 12px', borderRadius: 99, letterSpacing: '.08em', flex: 'none', minHeight: 40, display: 'flex', alignItems: 'center' }}>PERSONNALISER</Tap>
          </div>
          <div style={{ font: `800 27px/1.05 ${F.display}`, color: C.ink, letterSpacing: '-.028em', marginTop: 12, position: 'relative' }}>{s.banner.title}</div>
          <div style={{ display: 'flex', gap: 11, marginTop: 13, position: 'relative' }}>
            <span style={{ width: 3, borderRadius: 99, background: C.ink, flex: 'none' }} />
            <span>
              <span style={{ display: 'block', font: `400 13px/1.45 ${F.body}`, color: 'rgba(11,11,12,.8)', textWrap: 'pretty' }}>{quote[0]}</span>
              <span style={{ display: 'block', font: `500 9px ${F.mono}`, color: 'rgba(11,11,12,.42)', letterSpacing: '.12em', marginTop: 6 }}>CITATION DÉBLOQUÉE · {quote[1]}</span>
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 15, position: 'relative' }}>
            {s.banner.pins.map((p) => {
              const sk = skillById(p);
              return (
                <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', borderRadius: 99, padding: '7px 12px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: sk.c }} />
                  <span style={{ font: `700 11px ${F.body}`, color: C.ink }}>{sk.name}</span>
                  <span style={{ font: `700 9px ${F.mono}`, color: 'rgba(11,11,12,.45)' }}>{sk.elo || 'SOLO'}</span>
                </span>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.ink, borderRadius: 18, padding: '12px 14px', marginTop: 15, position: 'relative' }}>
            <span style={{ width: 34, height: 34, borderRadius: 12, background: C.honey, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Star size={17} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.14em' }}>DÉFI ÉPINGLÉ</span>
              <span style={{ display: 'block', font: `700 14px ${F.body}`, color: '#fff', marginTop: 3 }}>{chall[0]}</span>
            </span>
            <span style={{ font: `500 9.5px ${F.mono}`, color: 'rgba(255,255,255,.5)', flex: 'none', letterSpacing: '.08em' }}>{chall[1]}</span>
          </div>
          <div style={{ font: `400 12.5px/1.45 ${F.body}`, color: 'rgba(11,11,12,.6)', marginTop: 14, position: 'relative', textWrap: 'pretty' }}>{s.banner.msg}</div>
        </section>

        {/* Journal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>JOURNAL</Kicker>
          <span style={{ font: `500 11px ${F.body}`, color: 'rgba(255,255,255,.45)' }}>Tout ce que tu valides</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {s.log.slice(0, 8).map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, background: C.night, border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: '12px 14px' }}>
              <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: (SKILLS.find((k) => k.name === l.tag)?.c) || C.sand, padding: '5px 8px', borderRadius: 7, flex: 'none' }}>{l.tag}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: `700 13px ${F.body}`, color: '#fff' }}>{l.name}</span>
                <span style={{ display: 'block', font: `400 10.5px ${F.body}`, color: 'rgba(255,255,255,.42)', marginTop: 2 }}>{l.when}</span>
              </span>
              <span style={{ font: `700 10.5px ${F.mono}`, color: C.lime, flex: 'none', whiteSpace: 'nowrap' }}>{l.val}</span>
            </div>
          ))}
        </div>

        <Tap onTap={() => nav.open('avatar')} style={{ background: C.lime, borderRadius: 22, padding: '17px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 68 }}>
          <span>
            <span style={{ display: 'block', font: `800 18px ${F.display}`, color: C.ink, letterSpacing: '-.01em' }}>STUDIO AVATAR</span>
            <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(11,11,12,.6)', marginTop: 3 }}>Coupe · couleur · accessoires</span>
          </span>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.6"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </span>
        </Tap>

        <Tap onTap={() => nav.open('shop')} style={{ background: C.night, border: '1px solid rgba(255,255,255,.1)', borderRadius: 22, padding: '17px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 68 }}>
          <span>
            <span style={{ display: 'block', font: `800 18px ${F.display}`, color: '#fff', letterSpacing: '-.01em' }}>BOUTIQUE</span>
            <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 3 }}>{s.coins} pièces · {ownedObjects(s)} objets posés</span>
          </span>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: C.honey, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.6"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </span>
        </Tap>

        {/* Réglages */}
        <Kicker>RÉGLAGES</Kicker>
        <div style={{ background: C.night, border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, padding: '6px 16px' }}>
          {([['haptics', 'Vibrations'], ['sound', 'Sons'], ['confetti', 'Confettis']] as const).map(([k, label]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: k === 'confetti' ? 'none' : '1px solid rgba(255,255,255,.07)' }}>
              <span style={{ font: `500 13.5px ${F.body}`, color: 'rgba(255,255,255,.85)' }}>{label}</span>
              <Tap
                onTap={() => d({ t: 'PREF', key: k, value: !s.prefs[k] })}
                style={{ width: 52, height: 30, borderRadius: 99, background: s.prefs[k] ? C.lime : 'rgba(255,255,255,.14)', padding: 3, display: 'flex', justifyContent: s.prefs[k] ? 'flex-end' : 'flex-start' }}
              >
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: s.prefs[k] ? C.ink : 'rgba(255,255,255,.6)', transition: 'all .18s ease' }} />
              </Tap>
            </div>
          ))}
        </div>
        <Tap onTap={() => { if (confirm('Effacer toute ta progression locale ?')) d({ t: 'RESET' }); }} style={{ textAlign: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', padding: '14px', minHeight: 44 }}>
          RÉINITIALISER MA PROGRESSION
        </Tap>
      </div>
    </div>
  );
}
