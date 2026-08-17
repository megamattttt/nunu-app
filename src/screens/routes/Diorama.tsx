import React, { useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import {
  DIO_FLOORS, DIO_LIGHTS, DIO_OBJ, DIO_RARE, DIO_SEASONS, DIO_SETS, DIO_WALLS, DIO_WEATHER, type DioObj
} from '../../data/diorama';
import { DIO_REACTS, FRIEND_DIOS } from '../../data/dioSocial';
import { lightForHour, owns, placed, seasonNow, unlockLabel, type DioItem } from '../../lib/dio';
import DioramaScene, { DioThumb } from '../../components/DioramaScene';
import { Kicker, RouteHead, Tap } from '../../components/ui';
import { skillById } from '../../data/skills';
import { buzz } from '../../lib/haptics';
import type { Nav } from '../../App';

const TABS = ['OBJETS', 'PIÈCE', 'AMBIANCE', 'VOISINAGE'];

const Card = ({ children, style }: any) => (
  <div style={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 20, padding: 15, ...style }}>{children}</div>
);

const Btn = ({ on, children, onTap, wide }: any) => (
  <Tap onTap={onTap} haptic="soft" style={{
    flex: wide ? 1 : 'none', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '11px 13px', borderRadius: 13, textAlign: 'center',
    font: `700 10.5px ${F.mono}`, letterSpacing: '.07em',
    background: on ? C.lime : 'rgba(255,255,255,.07)', color: on ? C.ink : 'rgba(255,255,255,.7)'
  }}>{children}</Tap>
);

export default function Diorama({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [past, setPast] = useState<Record<string, DioItem>[]>([]);
  const [future, setFuture] = useState<Record<string, DioItem>[]>([]);
  const [visit, setVisit] = useState<number | null>(null);
  const [naming, setNaming] = useState(false);
  const [draft, setDraft] = useState('');

  const items = s.dio.items || {};
  const snap = () => { setPast((p) => [...p.slice(-19), items]); setFuture([]); };
  const undo = () => {
    if (!past.length) return; buzz('soft');
    setFuture((f) => [items, ...f]); setPast((p) => p.slice(0, -1));
    d({ t: 'DIO_ITEMS', items: past[past.length - 1] });
  };
  const redo = () => {
    if (!future.length) return; buzz('soft');
    setPast((p) => [...p, items]); setFuture((f) => f.slice(1));
    d({ t: 'DIO_ITEMS', items: future[0] });
  };

  const obj = sel ? DIO_OBJ.find((o) => o.id === sel) : null;
  const it: DioItem | null = obj ? (items[obj.id] || { s: obj.surf, x: obj.x, y: obj.y }) : null;
  const tweak = (patch: Record<string, any>) => obj && d({ t: 'DIO_TWEAK', id: obj.id, patch });

  const onScene = placed(s);
  const inv = DIO_OBJ.filter((o) => owns(s, o) && s.dio.out[o.id]);
  const locked = DIO_OBJ.filter((o) => !owns(s, o));

  return (
    <div style={{ padding: '10px 22px var(--dock-space)' }}>
      <RouteHead
        title="ATELIER" sub={s.dio.name + ' · ' + onScene.length + ' pièces posées'} onBack={nav.back}
        right={
          <div style={{ display: 'flex', gap: 7 }}>
            <Tap onTap={undo} style={{ width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.07)', font: `700 15px ${F.body}`, color: past.length ? '#fff' : 'rgba(255,255,255,.25)' }}>↺</Tap>
            <Tap onTap={redo} style={{ width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.07)', font: `700 15px ${F.body}`, color: future.length ? '#fff' : 'rgba(255,255,255,.25)' }}>↻</Tap>
          </div>
        }
      />

      {/* Scène */}
      <div style={{ background: '#EADFC9', borderRadius: 26, padding: 9, marginTop: 16 }}>
        <DioramaScene
          height={300} editable sel={sel}
          onSel={(id) => { if (id && id !== sel) snap(); setSel(id); }}
          onMove={(id, sf, x, y) => d({ t: 'DIO_PLACE', id, s: sf, x, y })}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 6px 3px' }}>
          <span style={{ font: `400 10.5px ${F.body}`, color: 'rgba(60,42,28,.6)' }}>
            {sel ? 'Glisse pour déplacer · les objets s’aimantent aux murs et aux meubles' : 'Touche un objet pour le régler · fais défiler pour voir toute la pièce'}
          </span>
        </div>
      </div>

      {/* Objet sélectionné */}
      {obj && it ? (
        <Card style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <span>
              <Kicker>{obj.sk === 'atelier' ? 'MOBILIER' : skillById(obj.sk).name}</Kicker>
              <span style={{ display: 'block', font: `800 20px ${F.display}`, color: '#fff', marginTop: 5, letterSpacing: '-.01em' }}>{obj.name}</span>
              <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{unlockLabel(obj)}</span>
            </span>
            <span style={{ font: `700 9px ${F.mono}`, color: C.ink, background: DIO_RARE[obj.rare][1], padding: '6px 8px', borderRadius: 7, flex: 'none' }}>{DIO_RARE[obj.rare][0].toUpperCase()}</span>
          </div>

          <div style={{ display: 'grid', gap: 8, marginTop: 13 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.14em', width: 62, flex: 'none' }}>TOURNER</span>
              <Btn wide onTap={() => tweak({ r: Math.max(-24, (it.r || 0) - 4) })}>−4°</Btn>
              <Btn wide onTap={() => tweak({ r: 0 })}>{(it.r || 0)}°</Btn>
              <Btn wide onTap={() => tweak({ r: Math.min(24, (it.r || 0) + 4) })}>+4°</Btn>
            </div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.14em', width: 62, flex: 'none' }}>TAILLE</span>
              <Btn wide onTap={() => tweak({ sc: Math.max(0.7, +((it.sc || 1) - 0.1).toFixed(2)) })}>−</Btn>
              <Btn wide onTap={() => tweak({ sc: 1 })}>{Math.round((it.sc || 1) * 100)} %</Btn>
              <Btn wide onTap={() => tweak({ sc: Math.min(1.4, +((it.sc || 1) + 0.1).toFixed(2)) })}>+</Btn>
            </div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.14em', width: 62, flex: 'none' }}>CALQUE</span>
              <Btn wide onTap={() => tweak({ z: (it.z || 0) - 1 })}>ARRIÈRE</Btn>
              <Btn wide onTap={() => tweak({ z: (it.z || 0) + 1 })}>AVANT</Btn>
            </div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.14em', width: 62, flex: 'none' }}>COULEUR</span>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {obj.tint.map((t, i) => (
                  <Tap key={t} onTap={() => tweak({ cw: i })} haptic="soft" style={{ width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', background: (it.cw || 0) === i ? 'rgba(255,255,255,.14)' : 'transparent' }}>
                    <span style={{ width: 24, height: 24, borderRadius: 8, background: t, boxShadow: (it.cw || 0) === i ? '0 0 0 2px #fff' : 'none' }} />
                  </Tap>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
            <Btn wide onTap={() => { snap(); d({ t: 'DIO_TAKE', id: obj.id }); setSel(null); }}>RANGER</Btn>
            <Tap onTap={() => setSel(null)} style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 10.5px ${F.mono}`, letterSpacing: '.07em', background: C.lime, color: C.ink, borderRadius: 13 }}>TERMINÉ</Tap>
          </div>
        </Card>
      ) : null}

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, background: 'rgba(255,255,255,.05)', padding: 5, borderRadius: 15 }}>
        {TABS.map((t, i) => (
          <Tap key={t} onTap={() => setTab(i)} haptic="soft" style={{
            flex: 1, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 11,
            font: `700 9.5px ${F.mono}`, letterSpacing: '.06em',
            background: tab === i ? C.steel : 'transparent', color: tab === i ? '#fff' : 'rgba(255,255,255,.45)'
          }}>{t}</Tap>
        ))}
      </div>

      {/* --- OBJETS --- */}
      {tab === 0 ? (
        <div style={{ marginTop: 16, display: 'grid', gap: 18 }}>
          <div>
            <Kicker>À POSER ({inv.length})</Kicker>
            {inv.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 9, marginTop: 10 }}>
                {inv.map((o) => (
                  <Tap key={o.id} onTap={() => { snap(); d({ t: 'DIO_PUT', id: o.id }); setSel(o.id); }} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 16, padding: 9, display: 'grid', justifyItems: 'center', gap: 5 }}>
                    <DioThumb o={o} tint={o.tint[items[o.id]?.cw || 0]} size={52} />
                    <span style={{ font: `600 10px ${F.body}`, color: 'rgba(255,255,255,.75)', textAlign: 'center', lineHeight: 1.25 }}>{o.name}</span>
                  </Tap>
                ))}
              </div>
            ) : (
              <div style={{ font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 8 }}>
                Tout ce que tu possèdes est dans la pièce. Range un objet pour le retrouver ici.
              </div>
            )}
          </div>

          <div>
            <Kicker>SÉRIES</Kicker>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {Object.entries(DIO_SETS).map(([id, set]) => {
                const all = DIO_OBJ.filter((o) => o.set === id);
                const got = all.filter((o) => owns(s, o)).length;
                const full = got === all.length;
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(255,255,255,.05)', borderRadius: 15, padding: '12px 14px' }}>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', font: `700 13px ${F.body}`, color: '#fff' }}>{set.name}</span>
                      <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{got} / {all.length} pièces{full ? ' · série complète' : ''}</span>
                    </span>
                    <span style={{ font: `700 10px ${F.mono}`, color: full ? C.ink : 'rgba(255,255,255,.6)', background: full ? C.honey : 'rgba(255,255,255,.07)', padding: '7px 9px', borderRadius: 8 }}>+{set.bonus}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Kicker>À DÉBLOQUER ({locked.length})</Kicker>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {locked.map((o) => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.04)', borderRadius: 15, padding: '10px 13px' }}>
                  <span style={{ opacity: .3, filter: 'grayscale(1)', flex: 'none' }}><DioThumb o={o} size={40} /></span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', font: `700 12.5px ${F.body}`, color: 'rgba(255,255,255,.8)' }}>{o.name}</span>
                    <span style={{ display: 'block', font: `400 10.5px ${F.body}`, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{unlockLabel(o)}</span>
                  </span>
                  {o.src === 'shop' ? (
                    <Tap onTap={() => nav.open('shop')} style={{ font: `700 9.5px ${F.mono}`, letterSpacing: '.06em', background: 'rgba(255,255,255,.08)', color: '#fff', padding: '12px 11px', borderRadius: 11, minHeight: 44, display: 'flex', alignItems: 'center', flex: 'none' }}>BOUTIQUE</Tap>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* --- PIÈCE --- */}
      {tab === 1 ? (
        <div style={{ marginTop: 16, display: 'grid', gap: 18 }}>
          <div>
            <Kicker>MURS</Kicker>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(78px,1fr))', gap: 8, marginTop: 10 }}>
              {DIO_WALLS.map((w, i) => (
                <Tap key={w[0]} onTap={() => d({ t: 'DIO', patch: { wall: i } })} haptic="soft" style={{ borderRadius: 14, overflow: 'hidden', padding: 4, background: s.dio.wall === i ? C.lime : 'rgba(255,255,255,.06)' }}>
                  <span style={{ display: 'block', height: 40, borderRadius: 10, background: w[1], backgroundImage: w[2] }} />
                  <span style={{ display: 'block', font: `600 9.5px ${F.body}`, color: s.dio.wall === i ? C.ink : 'rgba(255,255,255,.6)', textAlign: 'center', padding: '5px 2px 2px' }}>{w[0]}</span>
                </Tap>
              ))}
            </div>
          </div>
          <div>
            <Kicker>SOLS</Kicker>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(78px,1fr))', gap: 8, marginTop: 10 }}>
              {DIO_FLOORS.map((f, i) => (
                <Tap key={f[0]} onTap={() => d({ t: 'DIO', patch: { floor: i } })} haptic="soft" style={{ borderRadius: 14, overflow: 'hidden', padding: 4, background: s.dio.floor === i ? C.lime : 'rgba(255,255,255,.06)' }}>
                  <span style={{ display: 'block', height: 40, borderRadius: 10, background: f[1], backgroundImage: `repeating-linear-gradient(78deg, ${f[2]} 0 1.5px, transparent 1.5px 12px)` }} />
                  <span style={{ display: 'block', font: `600 9.5px ${F.body}`, color: s.dio.floor === i ? C.ink : 'rgba(255,255,255,.6)', textAlign: 'center', padding: '5px 2px 2px' }}>{f[0]}</span>
                </Tap>
              ))}
            </div>
          </div>

          <div>
            <Kicker>NOM DE L’ATELIER</Kicker>
            {naming ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={26}
                  style={{ flex: 1, minHeight: 44, background: 'rgba(255,255,255,.07)', border: `1px solid ${C.line}`, borderRadius: 13, color: '#fff', font: `700 14px ${F.body}`, padding: '0 13px' }}
                />
                <Btn onTap={() => { d({ t: 'DIO', patch: { name: draft.trim() || s.dio.name } }); setNaming(false); }}>OK</Btn>
              </div>
            ) : (
              <Tap onTap={() => { setDraft(s.dio.name); setNaming(true); }} style={{ marginTop: 10, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.06)', borderRadius: 15, padding: '12px 15px' }}>
                <span style={{ font: `700 14px ${F.body}`, color: '#fff' }}>{s.dio.name}</span>
                <span style={{ font: `700 9.5px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.08em' }}>MODIFIER</span>
              </Tap>
            )}
          </div>

          <div>
            <Kicker>AGENCEMENTS ENREGISTRÉS</Kicker>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {(s.dio.presets || []).map((p, i) => (
                <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Tap onTap={() => { snap(); d({ t: 'DIO_PRESET_LOAD', ix: i }); }} style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.06)', borderRadius: 15, padding: '12px 15px' }}>
                    <span style={{ font: `700 13px ${F.body}`, color: '#fff' }}>{p.name}</span>
                    <span style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.4)' }}>{Object.keys(p.items).length} pièces</span>
                  </Tap>
                  <Tap onTap={() => d({ t: 'DIO_PRESET_DEL', ix: i })} style={{ width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.05)', font: `700 14px ${F.body}`, color: 'rgba(255,255,255,.4)' }}>×</Tap>
                </div>
              ))}
              <Btn wide onTap={() => d({ t: 'DIO_PRESET_SAVE', name: 'Agencement ' + ((s.dio.presets || []).length + 1) })}>ENREGISTRER L’AGENCEMENT ACTUEL</Btn>
            </div>
          </div>

          <Tap onTap={() => { snap(); d({ t: 'DIO_RESET' }); }} style={{ textAlign: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.42)', padding: 14, minHeight: 44 }}>
            REMETTRE L’AGENCEMENT D’ORIGINE
          </Tap>
        </div>
      ) : null}

      {/* --- AMBIANCE --- */}
      {tab === 2 ? (
        <div style={{ marginTop: 16, display: 'grid', gap: 18 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span>
                <span style={{ display: 'block', font: `700 14px ${F.body}`, color: '#fff' }}>Lumière liée à l’heure</span>
                <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>
                  Il est {new Date().getHours()} h : {DIO_LIGHTS[lightForHour(new Date().getHours())].name.toLowerCase()}
                </span>
              </span>
              <Tap onTap={() => d({ t: 'DIO', patch: { lightAuto: !(s.dio.lightAuto !== false) } })} style={{ width: 58, height: 44, borderRadius: 99, display: 'flex', alignItems: 'center', padding: 4, background: s.dio.lightAuto !== false ? C.lime : 'rgba(255,255,255,.1)', flex: 'none' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: s.dio.lightAuto !== false ? C.ink : 'rgba(255,255,255,.5)', marginLeft: s.dio.lightAuto !== false ? 20 : 0, transition: 'margin .2s ease' }} />
              </Tap>
            </div>
          </Card>

          {s.dio.lightAuto === false ? (
            <div>
              <Kicker>LUMIÈRE</Kicker>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {DIO_LIGHTS.map((l, i) => <Btn key={l.name} on={s.dio.light === i} onTap={() => d({ t: 'DIO', patch: { light: i } })}>{l.name.toUpperCase()}</Btn>)}
              </div>
            </div>
          ) : null}

          <div>
            <Kicker>MÉTÉO</Kicker>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {DIO_WEATHER.map((w, i) => <Btn key={w.name} on={(s.dio.weather || 0) === i} onTap={() => d({ t: 'DIO', patch: { weather: i } })}>{w.name.toUpperCase()}</Btn>)}
            </div>
          </div>

          <Card>
            <Kicker>SAISON EN COURS</Kicker>
            <div style={{ font: `800 21px ${F.display}`, color: '#fff', marginTop: 6 }}>{DIO_SEASONS[seasonNow()].name}</div>
            <div style={{ font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 5 }}>
              La saison change ce qu’on voit par la fenêtre et ce qui flotte dans la lumière. Elle suit le calendrier, tu n’as rien à régler.
            </div>
          </Card>

          <Card>
            <Kicker>TRACES D’ACTIVITÉ</Kicker>
            <div style={{ font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>
              Après une validation, la pièce garde une trace pendant quelques jours : un tissu resté sur la table, des chaussures encore boueuses, de la farine sur le plan.
            </div>
          </Card>
        </div>
      ) : null}

      {/* --- VOISINAGE --- */}
      {tab === 3 ? (
        <div style={{ marginTop: 16, display: 'grid', gap: 18 }}>
          <div>
            <Kicker>REÇU CHEZ TOI ({(s.dio.visits || []).length})</Kicker>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {(s.dio.visits || []).map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(255,255,255,.05)', borderRadius: 15, padding: '12px 14px' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 11, flex: 'none', display: 'grid', placeItems: 'center', background: DIO_REACTS[v.react][2], font: `700 16px ${F.body}`, color: C.ink }}>{DIO_REACTS[v.react][1]}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', font: `700 12.5px ${F.body}`, color: '#fff' }}>{v.name} <span style={{ color: 'rgba(255,255,255,.35)', fontWeight: 400 }}>· {v.when}</span></span>
                    {v.word ? <span style={{ display: 'block', font: `400 12px/1.45 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 3 }}>{v.word}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Kicker>ATELIERS À VISITER</Kicker>
            <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
              {FRIEND_DIOS.map((f, i) => (
                <div key={f.who} style={{ background: C.night, border: `1px solid ${C.line}`, borderRadius: 20, padding: 9 }}>
                  <div style={{ background: '#EADFC9', borderRadius: 14, padding: 6 }}>
                    <DioramaScene height={visit === i ? 240 : 150} view={f} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 6px 4px' }}>
                    <span>
                      <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: '#fff' }}>{f.name}</span>
                      <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{f.title} · {Object.keys(f.items).length} pièces</span>
                    </span>
                    <Tap onTap={() => setVisit(visit === i ? null : i)} style={{ font: `700 9.5px ${F.mono}`, letterSpacing: '.07em', background: 'rgba(255,255,255,.08)', color: '#fff', padding: '12px 12px', borderRadius: 11, minHeight: 44, display: 'flex', alignItems: 'center', flex: 'none' }}>
                      {visit === i ? 'RÉDUIRE' : 'AGRANDIR'}
                    </Tap>
                  </div>
                  <div style={{ display: 'flex', gap: 7, padding: '4px 6px 2px' }}>
                    {DIO_REACTS.map((r, ri) => (
                      <Tap key={r[0]} onTap={() => d({ t: 'DIO_REACT', who: f.who, name: f.name, icon: ri })} haptic="soft"
                        style={{ flex: 1, minHeight: 44, display: 'grid', placeItems: 'center', borderRadius: 13, background: 'rgba(255,255,255,.06)', font: `700 16px ${F.body}`, color: r[2] }}>{r[1]}</Tap>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
