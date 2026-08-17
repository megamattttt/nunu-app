import React, { useState } from 'react';
import { C, F, SIG } from '../theme';
import { useGame } from '../state/store';
import { SKILLS, skillById } from '../data/skills';
import { QUOTES, CHALLENGES } from '../data/quests';
import { globalLevel, globalPct, ownedObjects, questsDone, skillRank, pxOf, totalPx, weekStats } from '../state/selectors';
import { placed } from '../lib/dio';
import AvatarCut from '../components/avatar/AvatarCut';
import AvatarFrame from '../components/AvatarFrame';
import { RankIcon, RankBadge } from '../components/RankIcon';
import { TIER_TIPS } from '../data/tips';
import DioramaScene from '../components/DioramaScene';
import Logo from '../components/Logo';
import ProfileEdit from '../components/ProfileEdit';
import WeekStrip from '../components/WeekStrip';
import { CADRE_C } from '../data/quiz';
import { Kicker, Star, Tap } from '../components/ui';
import { askNotif, notifState } from '../lib/notify';
import type { Nav } from '../App';

export default function Profile({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [edit, setEdit] = useState(false);
  const [settings, setSettings] = useState(false);
  const [notifPerm, setNotifPerm] = useState(notifState());
  const mainSkill = s.startSkill || SKILLS[0].id;
  const mainSk = skillById(mainSkill);
  const mainRank = skillRank(s, mainSkill);
  const sig = SIG[s.profile.sig] || SIG[0];
  const w = weekStats(s);
  const quote = QUOTES[s.banner.quote % QUOTES.length];
  const chall = CHALLENGES[s.banner.chall % CHALLENGES.length];

  return (
    <div>
      <header style={{ background: C.sky, padding: '20px 22px 24px', borderRadius: '0 0 34px 34px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: -60, top: -70, width: 210, height: 210, borderRadius: '50%', background: sig, opacity: .45 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '128px 1fr', gap: 16, position: 'relative' }}>
          {/* Portrait Big Ears — cadre carré, comme une carte de joueur */}
          <AvatarFrame
            av={s.profile.av}
            crop="bust"
            size="100%"
            accent={CADRE_C[s.profile.cadre]}
            label="STUDIO AVATAR"
            onTap={() => nav.open('avatar')}
          />
          <span style={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: `800 26px/1 ${F.display}`, color: C.ink, letterSpacing: '-.025em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>@{s.profile.gamertag}</span>
              <Tap
                onTap={() => setEdit(true)} aria-label="Modifier le profil"
                style={{ width: 34, height: 34, borderRadius: 99, flex: 'none', background: 'rgba(11,11,12,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinejoin="round"><path d="M4 20h4L20 8l-4-4L4 16z" /></svg>
              </Tap>
            </span>
            <span style={{ display: 'block', font: `400 12.5px ${F.body}`, color: 'rgba(11,11,12,.62)', marginTop: 6 }}>{s.profile.firstName} · {s.profile.atelier}</span>
            <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
              <span style={{ font: `700 10px ${F.mono}`, color: C.paper, background: C.ink, padding: '5px 10px', borderRadius: 99, letterSpacing: '.1em' }}>NIVEAU {globalLevel(s)}</span>
              {s.onFire ? (
                <span style={{ font: `700 10px ${F.mono}`, color: '#fff', background: C.coral, padding: '5px 10px', borderRadius: 99, letterSpacing: '.06em' }}>EN FEU · PX ×2</span>
              ) : (
                <span style={{ font: `700 10px ${F.mono}`, color: C.ink, background: sig, padding: '5px 10px', borderRadius: 99, letterSpacing: '.06em' }}>ÉNERGIE {s.energy}%</span>
              )}
            </span>
            <span style={{ display: 'block', marginTop: 11 }}>
              <RankBadge rank={mainRank} skillName={mainSk.name} size="md" bg={C.ink} onTap={() => nav.open('path', { skill: mainSkill })} />
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
        {/* Niveau global */}
        <section style={{ background: C.paper, borderRadius: 26, padding: '16px 18px 17px', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', right: -70, top: -80, width: 200, height: 200, borderRadius: '50%', background: sig, opacity: .18, animation: 'nuHalo 7s ease-in-out infinite' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'relative' }}>
            <Kicker dark>NIVEAU DE PERSONNAGE</Kicker>
            <Logo size={20} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 15, marginTop: 10, position: 'relative' }}>
            <span style={{ font: `800 54px/.84 ${F.display}`, color: C.ink, letterSpacing: '-.05em', flex: 'none' }}>{globalLevel(s)}</span>
            <span style={{ flex: 1, minWidth: 0, paddingBottom: 3 }}>
              {/* Jauge pilule : le pourcentage vit dans la barre. */}
              <span style={{ display: 'block', position: 'relative', height: 26, borderRadius: 99, background: 'rgba(11,11,12,.09)', overflow: 'hidden' }}>
                <span
                  style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.max(2, globalPct(s)) + '%', borderRadius: 99,
                    background: C.ink, transition: 'width .8s cubic-bezier(.2,1,.3,1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10
                  }}
                >
                  {globalPct(s) >= 24 ? (
                    <span style={{ font: `700 10.5px ${F.mono}`, color: C.lime, letterSpacing: '.04em' }}>{globalPct(s)}%</span>
                  ) : null}
                </span>
                {globalPct(s) < 24 ? (
                  <span style={{ position: 'absolute', right: 11, top: 0, bottom: 0, display: 'flex', alignItems: 'center', font: `700 10.5px ${F.mono}`, color: 'rgba(11,11,12,.5)' }}>{globalPct(s)}%</span>
                ) : null}
              </span>
              <span style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, font: `500 9.5px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.45)' }}>
                <span>{totalPx(s).toLocaleString('fr-FR')} PX CUMULÉS</span>
                <span>NIVEAU {globalLevel(s) + 1}</span>
              </span>
            </span>
          </div>
        </section>

        {/* Ma semaine */}
        <Tap
          onTap={() => nav.open('week')}
          style={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 26, padding: '17px 19px 15px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <Kicker>MA SEMAINE</Kicker>
            <span style={{ font: `700 11px ${F.mono}`, color: C.lime }}>{w.px} PX</span>
          </div>
          <div style={{ marginTop: 14 }}><WeekStrip days={w.days} h={40} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 13, gap: 10 }}>
            <span style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>
              {w.n} validations · {w.active}/7 jours actifs
            </span>
            <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.azur }}>BILAN COMPLET →</span>
          </div>
        </Tap>

        {/* Défis — l'onglet a rejoint le profil */}
        <Tap
          onTap={() => nav.open('duels')}
          style={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 22, padding: '17px 20px', display: 'flex', alignItems: 'center', gap: 14, minHeight: 68 }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 13, background: C.honey, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={C.ink}><path d="M13 3L5 14h6l-1 7 8-11h-6z" /></svg>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `800 18px ${F.display}`, color: '#fff', letterSpacing: '-.01em' }}>DÉFIS</span>
            <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>
              {s.duels.filter((x) => x.status === 'en cours').length} en cours · {s.invitsOpen.length} invitations
            </span>
          </span>
          {s.invitsOpen.length ? (
            <span style={{ minWidth: 22, height: 22, borderRadius: 99, background: C.coral, color: '#fff', font: `700 10px ${F.mono}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', padding: '0 6px' }}>
              {s.invitsOpen.length}
            </span>
          ) : null}
        </Tap>

        {/* Rangs par compétence */}
        <section style={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 26, padding: '16px 18px' }}>
          <Kicker>PROGRESSION PAR COMPÉTENCE</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {SKILLS.map((sk) => {
              const r = skillRank(s, sk.id);
              // Compétence solo : aucune échelle de rang, juste ce qui a été fait.
              if (sk.solo) {
                const n = s.customQuests.filter((q) => q.skill === sk.id).length;
                const done = s.customQuests.filter((q) => q.skill === sk.id && q.done).length;
                return (
                  <Tap key={sk.id} onTap={() => nav.open('path', { skill: sk.id })} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 10, background: sk.c, color: sk.txt, font: `800 12px ${F.display}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{sk.short}</span>
                    <span style={{ width: 24, display: 'flex', justifyContent: 'center', flex: 'none' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: sk.c, opacity: .7 }} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ font: `700 12.5px ${F.body}`, color: 'rgba(255,255,255,.82)' }}>{(s.profile as any).persoName || 'Perso'}</span>
                        <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.45)' }}>{pxOf(s, sk.id)} PX</span>
                      </span>
                      <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 5 }}>
                        {done} faite{done > 1 ? 's' : ''} · {Math.max(0, n - done)} en attente
                      </span>
                    </span>
                  </Tap>
                );
              }
              return (
                <Tap key={sk.id} onTap={() => nav.open('path', { skill: sk.id })} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 10, background: sk.c, color: sk.txt, font: `800 12px ${F.display}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{sk.short}</span>
                  <RankIcon rank={r} size={24} bg={C.night} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ font: `700 12.5px ${F.body}`, color: '#fff' }}>{r.label}</span>
                      <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.45)' }}>{pxOf(s, sk.id)} PX</span>
                    </span>
                    <span style={{ display: 'block', height: 6, borderRadius: 99, background: 'rgba(255,255,255,.1)', marginTop: 6, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: r.pct + '%', background: sk.c, borderRadius: 99 }} />
                    </span>
                  </span>
                </Tap>
              );
            })}
          </div>
          {/* Conseil de palier pour la compétence principale */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, background: 'rgba(255,255,255,.05)', borderRadius: 16, padding: '12px 13px' }}>
            <span style={{ width: 3, borderRadius: 99, background: mainRank.c, flex: 'none' }} />
            <span>
              <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)' }}>PASSER À L’ÉTAGE SUIVANT · {mainSk.name}</span>
              <span style={{ display: 'block', font: `400 12px/1.45 ${F.body}`, color: 'rgba(255,255,255,.72)', marginTop: 6, textWrap: 'pretty' }}>{TIER_TIPS[mainRank.tier]}</span>
            </span>
          </div>
        </section>

        {/* Diorama */}
        <div style={{ background: '#EADFC9', borderRadius: 26, padding: 9 }}>
          <DioramaScene height={230} onPick={() => nav.open('diorama')} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, padding: '13px 9px 5px' }}>
            <span>
              <span style={{ display: 'block', font: `500 9px ${F.mono}`, color: 'rgba(60,42,28,.55)', letterSpacing: '.16em' }}>DIORAMA · PAPIER DÉCOUPÉ</span>
              <span style={{ display: 'block', font: `800 21px ${F.display}`, color: '#3A2A1C', letterSpacing: '-.02em', marginTop: 3 }}>{(s.dio.name || 'Atelier').toUpperCase()}</span>
              <span style={{ display: 'block', font: `400 10.5px ${F.body}`, color: 'rgba(60,42,28,.55)', marginTop: 3 }}>{placed(s).length} pièces posées · {(s.dio.visits || []).length} réactions reçues</span>
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
                  <RankIcon rank={skillRank(s, p)} size={16} bg="#fff" pips={false} />
                  <span style={{ font: `700 9px ${F.mono}`, color: 'rgba(11,11,12,.45)' }}>{skillRank(s, p).short}</span>
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

        {/* Dernières validations */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>DERNIÈRES VALIDATIONS</Kicker>
          <Tap onTap={() => nav.open('journal')} style={{ font: `700 10px ${F.mono}`, color: C.lime, letterSpacing: '.1em', minHeight: 32, display: 'flex', alignItems: 'center' }}>
            OUVRIR LE JOURNAL
          </Tap>
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

        {/* Réglages — accordéon, fermé par défaut */}
        <div style={{ background: C.night, border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, overflow: 'hidden' }}>
          <Tap
            onTap={() => setSettings((v) => !v)} haptic="soft"
            aria-expanded={settings}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '17px 16px', minHeight: 58 }}
          >
            <span style={{ flex: 1, font: `500 9.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.55)' }}>RÉGLAGES</span>
            <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.35)' }}>
              {settings ? 'MASQUER' : 'AFFICHER'}
            </span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.6"
              style={{ flex: 'none', transform: settings ? 'rotate(180deg)' : 'none', transition: 'transform .22s cubic-bezier(.2,1,.3,1)' }}
            >
              <path d="M5 9l7 7 7-7" />
            </svg>
          </Tap>

          <div style={{ display: 'grid', gridTemplateRows: settings ? '1fr' : '0fr', transition: 'grid-template-rows .28s cubic-bezier(.2,1,.3,1)' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0 16px 8px' }}>
                {([['haptics', 'Vibrations'], ['sound', 'Sons'], ['confetti', 'Confettis']] as const).map(([k, label]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid rgba(255,255,255,.07)' }}>
                    <span style={{ font: `500 13.5px ${F.body}`, color: 'rgba(255,255,255,.85)' }}>{label}</span>
                    <Tap
                      onTap={() => d({ t: 'PREF', key: k, value: !s.prefs[k] })}
                      style={{ width: 52, height: 30, borderRadius: 99, background: s.prefs[k] ? C.lime : 'rgba(255,255,255,.14)', padding: 3, display: 'flex', justifyContent: s.prefs[k] ? 'flex-end' : 'flex-start' }}
                    >
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: s.prefs[k] ? C.ink : 'rgba(255,255,255,.6)', transition: 'all .18s ease' }} />
                    </Tap>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 13, marginTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', font: `500 13.5px ${F.body}`, color: 'rgba(255,255,255,.85)' }}>Rappels</span>
                      <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.42)', marginTop: 2 }}>
                        {notifPerm === 'denied'
                          ? 'Bloqués par le navigateur'
                          : notifPerm === 'unsupported'
                            ? 'Non pris en charge sur cet appareil'
                            : 'Notifications locales sur les quêtes datées'}
                      </span>
                    </span>
                    <Tap
                      onTap={async () => {
                        const on = !s.notif?.on;
                        if (on) setNotifPerm(await askNotif());
                        d({ t: 'NOTIF', patch: { on } });
                      }}
                      style={{ width: 52, height: 30, borderRadius: 99, flex: 'none', background: s.notif?.on ? C.lime : 'rgba(255,255,255,.14)', padding: 3, display: 'flex', justifyContent: s.notif?.on ? 'flex-end' : 'flex-start' }}
                    >
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: s.notif?.on ? C.ink : 'rgba(255,255,255,.6)', transition: 'all .18s ease' }} />
                    </Tap>
                  </div>

                  <div style={{ display: 'grid', gridTemplateRows: s.notif?.on ? '1fr' : '0fr', transition: 'grid-template-rows .28s cubic-bezier(.2,1,.3,1)' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '12px 0 2px' }}>
                        {([['at', 'À L’HEURE'], ['before', '10 MIN AVANT'], ['digest', 'RÉSUMÉ DU MATIN']] as const).map(([k, label]) => {
                          const on = !!s.notif?.[k];
                          return (
                            <Tap
                              key={k} onTap={() => d({ t: 'NOTIF', patch: { [k]: !on } })} haptic="soft"
                              style={{
                                font: `700 9px ${F.mono}`, letterSpacing: '.1em', padding: '9px 12px', borderRadius: 99, minHeight: 36,
                                display: 'flex', alignItems: 'center',
                                color: on ? C.ink : 'rgba(255,255,255,.5)',
                                background: on ? C.lime : 'transparent',
                                border: `1px solid ${on ? C.lime : 'rgba(255,255,255,.16)'}`
                              }}
                            >
                              {label}
                            </Tap>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {([
                  ['Modifier le profil', 'Prénom et gamertag', () => setEdit(true)],
                  ['Journal de progression', 'Notes, photos et ressentis', () => nav.open('journal')],
                  ['Revoir le guide de démarrage', 'Les règles du jeu en cinq écrans', () => nav.open('guide')]
                ] as const).map(([label, sub, act]) => (
                  <Tap key={label} onTap={act} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: '1px solid rgba(255,255,255,.07)', minHeight: 56 }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', font: `500 13.5px ${F.body}`, color: 'rgba(255,255,255,.85)' }}>{label}</span>
                      <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.42)', marginTop: 2 }}>{sub}</span>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2.6" style={{ flex: 'none' }}><path d="M9 5l7 7-7 7" /></svg>
                  </Tap>
                ))}

                <Tap
                  onTap={() => { if (confirm('Effacer toute ta progression locale ?')) d({ t: 'RESET' }); }}
                  style={{ display: 'block', textAlign: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.1em', color: C.coral, padding: '16px 0 10px', minHeight: 44, borderTop: '1px solid rgba(255,255,255,.07)' }}
                >
                  RÉINITIALISER MA PROGRESSION
                </Tap>
              </div>
            </div>
          </div>
        </div>
      </div>

      {edit ? <ProfileEdit onClose={() => setEdit(false)} /> : null}
    </div>
  );
}
