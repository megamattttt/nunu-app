import React, { useMemo, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { AV_FRAME, AV_FRAME_LOCKS, AV_SIG, AV_TITLES } from '../../data/avatar';
import {
  AV_GROUPS, viewSvg, bleedSvg, ensureConfig, keysOfGroup, kindOf, labelOf,
  lockOf, optionsOf, paletteOf, patternLabel, randomConfig, thumbSvg,
  avatarSvg, garmentPieces, garmentColors, garmentValue, parseGarment, defaultColor
} from '../../lib/dicebear';
import { levelOf } from '../../state/selectors';
import { skillById } from '../../data/skills';
import { css } from '../../lib/css';
import { BackBtn, Tap } from '../../components/ui';
import { buzz } from '../../lib/haptics';
import type { Nav } from '../../App';

/** Hauteur fixe du panneau de personnalisation : l'écran ne bouge plus. */
const PANEL_H = 274;

/** Vignette d'aperçu : le rendu réel de la variante, pas une étiquette. */
function Swatch({ svg }: { svg: string }) {
  return <span style={{ display: 'block', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 12 }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Aperçu buste d'une tenue (pièce + teinte) sur l'avatar courant. */
function GarmentThumb({ value, av }: { value: string; av: any }) {
  const svg = useMemo(
    () => avatarSvg({ ...av, garment: value }, 88, { view: '120 250 220 190' }),
    [value, av]
  );
  return <span style={{ display: 'block', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 12 }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function AvatarStudio({ nav, onDone, ctaLabel = 'ENREGISTRER', hideBack }: { nav?: Nav; onDone?: () => void; ctaLabel?: string; hideBack?: boolean }) {
  const { s, d } = useGame();
  const av = useMemo(() => ensureConfig(s.profile.av), [s.profile.av]);

  const [group, setGroup] = useState(0);
  const groupKeys = keysOfGroup(group);
  const [cat, setCat] = useState<string>(() => keysOfGroup(0)[0] || '');
  const key = groupKeys.includes(cat) ? cat : groupKeys[0] || '';
  const kind = key ? kindOf(key) : 'choice';
  const isIdent = group === 5;
  const isTenue = group === 4;
  const isFrame = key === '__frame';

  // Tenue : pièce sélectionnée (1ʳᵉ étape). Déduite de la config, ou 'aucun'.
  const currentPiece = parseGarment(av.garment).id;
  const [tenuePiece, setTenuePiece] = useState<string>(currentPiece);
  const activePiece = tenuePiece || currentPiece || 'aucun';

  const preview = useMemo(() => viewSvg(av, 'bust', 320), [av]);
  const previewTop = useMemo(() => bleedSvg(av, 'bust', 320), [av]);
  const avSize = 176;

  const locked = (k: string, i: number) => {
    const lock = k === '__frame' ? AV_FRAME_LOCKS[i] : lockOf(k, i);
    if (!lock) return null;
    return levelOf(s, lock[0]) >= lock[1] ? null : lock;
  };

  const deny = (lock: [string, number]) => {
    buzz('error');
    d({ t: 'TOAST', msg: skillById(lock[0]).name + ' niveau ' + lock[1] + ' pour débloquer' });
  };

  const pick = (k: string, value: string, i: number) => {
    const lock = locked(k, i);
    if (lock) return deny(lock);
    d({ t: 'SET_AV', patch: { [k]: value } });
  };

  const randomize = () => {
    const cfg = randomConfig();
    Object.keys(cfg).forEach((k) => {
      const opts = optionsOf(k);
      const i = opts.indexOf(cfg[k]);
      if (i >= 0 && locked(k, i)) delete cfg[k];
    });
    d({ t: 'SET_AV', patch: cfg });
    buzz('success');
  };

  const save = () => {
    if (onDone) { onDone(); return; }
    d({ t: 'TOAST', msg: 'Avatar enregistré' });
    nav?.back();
  };

  /* Options de la catégorie courante, sous une forme unique. */
  const items: { value: string; i: number }[] = isTenue
    ? garmentColors(activePiece).map((c, i) => ({ value: c, i }))
    : isFrame
      ? AV_FRAME.map((f, i) => ({ value: String(i), i }))
      : kind === 'color'
        ? paletteOf(key).map((v, i) => ({ value: v, i }))
        : kind === 'toggle'
          ? [{ value: '0', i: 0 }, { value: '100', i: 1 }]
          : optionsOf(key).map((v, i) => ({ value: v, i }));

  const currentValue = isTenue
    ? parseGarment(av.garment).color
    : isFrame ? String(s.profile.cadre || 0) : av[key];
  const cats = [...groupKeys, ...(group === 3 ? ['__frame'] : [])];

  // Choix d'une pièce : applique la 1ʳᵉ teinte si on quitte 'aucun'.
  const pickPiece = (id: string) => {
    setTenuePiece(id);
    if (id === 'aucun') { d({ t: 'SET_AV', patch: { garment: 'aucun' } }); return; }
    const cur = parseGarment(av.garment);
    const color = cur.id === id && cur.color ? cur.color : defaultColor(id);
    d({ t: 'SET_AV', patch: { garment: garmentValue(id, color) } });
  };

  return (
    <div style={{ position: 'relative', minHeight: '86dvh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          position: 'sticky', top: 'var(--safe-top)', zIndex: 20,
          background: 'rgba(10,10,12,.92)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px 0' }}>
          {hideBack ? null : <BackBtn onTap={() => nav?.back()} />}
          <span style={{ flex: 1 }} />
          <Tap onTap={randomize} style={{ font: `700 10px ${F.mono}`, color: '#fff', background: 'rgba(255,255,255,.1)', padding: '13px 14px', borderRadius: 99, letterSpacing: '.08em', minHeight: 44, display: 'flex', alignItems: 'center' }}>HASARD</Tap>
        </div>

        {/* Scène */}
        <div
          style={{
            display: 'flex', alignItems: 'center', flexDirection: 'column',
            justifyContent: 'center', gap: 12, padding: '14px 20px 12px'
          }}
        >
          <span
            style={{
              position: 'relative', width: avSize, height: avSize, borderRadius: 32, display: 'block', flex: 'none',
              ...css(AV_FRAME[(s.profile.cadre || 0) % AV_FRAME.length].s)
            }}
          >
            <span
              style={{ width: '100%', height: '100%', borderRadius: 26, overflow: 'hidden', display: 'block', background: C.ink }}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
            {/* Coiffure au premier plan : elle peut dépasser du cadre. */}
            <span
              style={{ position: 'absolute', inset: 0, clipPath: 'inset(-42% -18% 0 -18%)', pointerEvents: 'none' }}
              dangerouslySetInnerHTML={{ __html: previewTop }}
            />
          </span>
          <span style={{ minWidth: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ font: `800 22px ${F.display}`, color: '#fff', letterSpacing: '-.02em' }}>@{s.profile.gamertag}</span>
            <span style={{ font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: AV_SIG[s.profile.sig], padding: '6px 12px', borderRadius: 99 }}>
              {AV_TITLES[s.profile.titleIx][0].toUpperCase()}
            </span>
          </span>
        </div>
      </div>

      {/* Panneau */}
      <div style={{ background: C.night, borderRadius: '28px 28px 0 0', marginTop: 0, padding: '14px 18px', paddingBottom: 78, flex: 1, borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4 }}>
          {AV_GROUPS.map((g, i) => (
            <Tap
              key={g} onTap={() => { setGroup(i); setCat(keysOfGroup(i)[0] || (i === 3 ? '__frame' : '')); if (i === 4) setTenuePiece(parseGarment(s.profile.av?.garment).id); }} haptic="soft"
              style={{ flex: 'none', font: `700 9.5px ${F.mono}`, letterSpacing: '.08em', padding: '11px 12px', borderRadius: 11, minHeight: 40, display: 'flex', alignItems: 'center', background: group === i ? C.lime : 'rgba(255,255,255,.07)', color: group === i ? C.ink : 'rgba(255,255,255,.6)' }}
            >
              {g}
            </Tap>
          ))}
        </div>

        <div
          style={{
            height: PANEL_H, marginTop: 12, overflowX: 'hidden',
            overflowY: isIdent ? 'auto' : 'hidden', WebkitOverflowScrolling: 'touch'
          }}
        >
        {isIdent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingBottom: 4 }}>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '12px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>GAMERTAG</div>
              <input value={s.profile.gamertag} onChange={(e) => d({ t: 'SET_PROFILE', patch: { gamertag: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 16) } })} style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '6px 0 0' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '12px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>NOM D’ATELIER</div>
              <input value={s.profile.atelier} onChange={(e) => d({ t: 'SET_PROFILE', patch: { atelier: e.target.value } })} style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '6px 0 0' }} />
            </div>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>TITRE GAGNÉ</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 11 }}>
                {AV_TITLES.map(([label, skill, need], i) => {
                  const ok = levelOf(s, skill) >= need;
                  const on = s.profile.titleIx === i;
                  return (
                    <Tap
                      key={label}
                      onTap={() => ok ? d({ t: 'SET_PROFILE', patch: { titleIx: i } }) : d({ t: 'TOAST', msg: skillById(skill).name + ' niveau ' + need + ' requis' })}
                      style={{ font: `700 11px ${F.body}`, padding: '10px 12px', borderRadius: 11, minHeight: 40, display: 'flex', alignItems: 'center', opacity: ok ? 1 : .4, background: on ? C.lime : 'rgba(255,255,255,.07)', color: on ? C.ink : 'rgba(255,255,255,.7)' }}
                    >
                      {label}
                    </Tap>
                  );
                })}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>COULEUR SIGNATURE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                {AV_SIG.map((c, i) => (
                  <Tap key={c} onTap={() => d({ t: 'SET_PROFILE', patch: { sig: i } })} haptic="soft" style={{ width: 44, height: 44, borderRadius: 14, background: c, border: s.profile.sig === i ? '3px solid #fff' : '3px solid transparent' }} />
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 20, padding: '14px 16px' }}>
              <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>GRAINE</div>
              <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 6, textWrap: 'pretty' }}>
                Elle fixe les détails que tu ne choisis pas. En changer donne un nouveau visage de base.
              </div>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginTop: 11 }}>
                <input
                  value={av.seed || ''} onChange={(e) => d({ t: 'SET_AV', patch: { seed: e.target.value.slice(0, 24) } })}
                  style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: '11px 12px', color: '#fff', font: `700 14px ${F.mono}`, minHeight: 44 }}
                />
                <Tap
                  onTap={() => d({ t: 'SET_AV', patch: { seed: Math.random().toString(36).slice(2, 10) } })} haptic="soft"
                  style={{ flex: 'none', font: `700 9.5px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: C.lime, padding: '0 14px', borderRadius: 12, minHeight: 44, display: 'flex', alignItems: 'center' }}
                >
                  TIRER
                </Tap>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {isTenue
                ? garmentPieces().map((pc) => (
                    <Tap key={pc.id} onTap={() => pickPiece(pc.id)} haptic="soft" style={{ flex: 'none', font: `700 10.5px ${F.body}`, padding: '10px 12px', borderRadius: 11, minHeight: 40, display: 'flex', alignItems: 'center', background: activePiece === pc.id ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.05)', color: activePiece === pc.id ? '#fff' : 'rgba(255,255,255,.55)' }}>
                      {pc.label}
                    </Tap>
                  ))
                : cats.map((k) => (
                    <Tap key={k} onTap={() => setCat(k)} haptic="soft" style={{ flex: 'none', font: `700 10.5px ${F.body}`, padding: '10px 12px', borderRadius: 11, minHeight: 40, display: 'flex', alignItems: 'center', background: key === k || (isFrame && k === '__frame') ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.05)', color: key === k || (isFrame && k === '__frame') ? '#fff' : 'rgba(255,255,255,.55)' }}>
                      {k === '__frame' ? 'Cadre' : labelOf(k)}
                    </Tap>
                  ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 13 }}>
              <span style={{ font: `500 9.5px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.14em' }}>
                {(isTenue ? (activePiece === 'aucun' ? 'TENUE' : 'TEINTE') : isFrame ? 'CADRE' : labelOf(key).toUpperCase())}
              </span>
              <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.3)' }}>{items.length} {isTenue ? 'TEINTES' : 'VARIANTES'}</span>
            </div>

            {isTenue && activePiece === 'aucun' ? (
              <div style={{ marginTop: 14, font: `500 11px ${F.body}`, color: 'rgba(255,255,255,.4)' }}>
                Choisis une pièce ci-dessus pour l'habiller, puis sa teinte.
              </div>
            ) : null}
            {/* Variantes en bandeau : on fait défiler du pouce, l'aperçu ne bouge plus. */}
            <div
              style={{
                display: 'flex', gap: 9, marginTop: 11, height: 108, alignItems: 'center',
                overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x proximity',
                padding: '0 2px 8px', marginLeft: -2, marginRight: -2
              }}
            >
              {items.map(({ value, i }) => {
                const on = currentValue === value;
                const lock = isTenue ? null : locked(isFrame ? '__frame' : key, i);
                const isColor = kind === 'color' && !isFrame;
                return (
                  <Tap
                    key={key + value + i}
                    onTap={() => {
                      if (isTenue) { d({ t: 'SET_AV', patch: { garment: garmentValue(activePiece, value) } }); return; }
                      if (isFrame) {
                        if (lock) return deny(lock);
                        d({ t: 'SET_PROFILE', patch: { cadre: i } });
                      } else pick(key, value, i);
                    }}
                    haptic="soft"
                    style={{
                      position: 'relative', flex: 'none', scrollSnapAlign: 'center',
                      width: isTenue ? 84 : isColor ? 62 : 84, height: isTenue ? 84 : isColor ? 62 : 84, borderRadius: 16, overflow: 'hidden',
                      border: on ? '3px solid ' + C.lime : '3px solid transparent',
                      background: isTenue ? 'rgba(255,255,255,.08)' : isColor ? (value === 'transparent' ? 'rgba(255,255,255,.08)' : '#' + value) : 'rgba(255,255,255,.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                      opacity: lock ? .45 : 1
                    }}
                  >
                    {isTenue ? (
                      <GarmentThumb value={garmentValue(activePiece, value)} av={av} />
                    ) : isColor ? (
                      value === 'transparent'
                        ? <span style={{ font: `700 8px ${F.mono}`, letterSpacing: '.06em', color: 'rgba(255,255,255,.5)' }}>SANS</span>
                        : null
                    ) : isFrame ? (
                      <span style={{ width: 40, height: 40, borderRadius: 12, ...css(AV_FRAME[i].s), background: AV_FRAME[i].s ? undefined : 'rgba(255,255,255,.12)' }} />
                    ) : kind === 'toggle' ? (
                      <span style={{ font: `700 10px ${F.mono}`, letterSpacing: '.08em', color: on ? '#fff' : 'rgba(255,255,255,.55)' }}>{value === '0' ? 'NON' : 'OUI'}</span>
                    ) : (
                      <>
                        <Swatch svg={thumbSvg(av, key, value, 88)} />
                        {key === 'pattern' ? (
                          <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(11,11,12,.62)', font: `700 7px ${F.mono}`, letterSpacing: '.06em', color: '#fff', padding: '3px 2px' }}>
                            {patternLabel(value).toUpperCase()}
                          </span>
                        ) : null}
                      </>
                    )}
                    {lock ? (
                      <span style={{ position: 'absolute', inset: 0, background: 'rgba(11,11,12,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 8px ${F.mono}`, color: '#fff', letterSpacing: '.04em', padding: 3 }}>
                        NIV {lock[1]}
                      </span>
                    ) : null}
                  </Tap>
                );
              })}
            </div>
          </>
        )}
        </div>
      </div>

      {/* Barre d'action : toujours au-dessus du dock, jamais recouverte. */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 35,
          padding: '12px 20px calc(var(--dock-space) + 4px)',
          background: 'linear-gradient(180deg,transparent,rgba(11,11,12,.9) 34%)',
          pointerEvents: 'none'
        }}
      >
        <Tap
          onTap={save} haptic="success"
          style={{
            pointerEvents: 'auto', maxWidth: 460, margin: '0 auto',
            background: C.lime, color: C.ink, borderRadius: 20, minHeight: 56, padding: '0 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 20px 40px -18px rgba(0,0,0,.85)'
          }}
        >
          <span style={{ font: `800 16px ${F.display}`, letterSpacing: '-.01em' }}>{ctaLabel}</span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.8"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
        </Tap>
        <div
          style={{
            pointerEvents: 'auto', maxWidth: 460, margin: '9px auto 0', textAlign: 'center',
            font: `400 9px ${F.body}`, color: 'rgba(255,255,255,.34)', letterSpacing: '.02em'
          }}
        >
          Avatars Big Ears par The Visual Team, licence CC BY 4.0
        </div>
      </div>
    </div>
  );
}
