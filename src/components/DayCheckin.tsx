import React, { useRef, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import {
  FACES, SCALE_LABELS, SUGGESTED_TAGS, dayKey, emptyCheckin, faceLabel, faceOf, knownWho, moodColor, moodSrc,
  type DayCheckin as Entry, type Scale
} from '../data/checkin';
import { Tap } from './ui';
import BorderGlow from './BorderGlow';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';
import { compressPhoto } from '../lib/photo';

/**
 * Visage d'humeur : le sticker peint, sur fond transparent, sans cadre. Si le
 * jour n'est pas noté, on garde un contour vide plutôt qu'un visage arbitraire.
 */
export function MoodFace({ v, face, size = 26, color }: { v: Scale; face?: string; size?: number; color?: string }) {
  const f = faceOf({ mood: v, face });
  if (!f) {
    const c = color || 'rgba(255,255,255,.3)';
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flex: 'none' }}>
        <circle cx="12" cy="12" r="9.5" stroke={c} strokeWidth="1.5" strokeDasharray="3 3.4" />
      </svg>
    );
  }
  return (
    <img
      src={moodSrc(f.id)} alt={f.label} width={size} height={size}
      style={{ width: size, height: size, display: 'block', flex: 'none', background: 'transparent' }}
    />
  );
}

/** Rangée 1→5 réutilisée pour la motivation et l'énergie. */
function ScaleRow({ value, color, onPick }: { value: Scale; color: string; onPick: (v: Scale) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {([1, 2, 3, 4, 5] as Scale[]).map((v) => {
        const on = value >= v;
        return (
          <Tap
            key={v} onTap={() => onPick(value === v ? 0 : v)} haptic="soft"
            aria-label={SCALE_LABELS[v]}
            style={{
              flex: 1, minHeight: 52, borderRadius: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: 8, background: on ? color : 'rgba(255,255,255,.05)',
              border: `1px solid ${on ? color : 'rgba(255,255,255,.07)'}`, transition: 'background .18s ease'
            }}
          >
            <span style={{ font: `700 10px ${F.mono}`, color: on ? C.ink : 'rgba(255,255,255,.34)' }}>{v}</span>
          </Tap>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.4)' }}>{label}</span>
        {hint ? <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.32)' }}>{hint}</span> : null}
      </span>
      {children}
    </div>
  );
}

const INPUT: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14,
  padding: '13px 14px', color: '#fff', font: `500 14px ${F.body}`, outline: 'none', minHeight: 48
};

/** Chip générique : mots-clés, personnes. */
function Chip({ label, on, onTap }: { label: string; on: boolean; onTap: () => void }) {
  return (
    <Tap
      onTap={onTap} haptic="soft"
      style={{
        minHeight: 38, padding: '0 13px', borderRadius: 99, display: 'flex', alignItems: 'center',
        background: on ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.045)',
        border: `1px solid ${on ? 'transparent' : 'rgba(255,255,255,.09)'}`, transition: 'background .15s ease'
      }}
    >
      <span style={{ font: `${on ? 700 : 500} 12px ${F.body}`, color: on ? C.ink : 'rgba(255,255,255,.58)' }}>{label}</span>
    </Tap>
  );
}

/** Les quatre temps du rituel : une question par écran, dans cet ordre. */
const STEPS = [
  { k: 'humeur', kicker: 'PREMIER TEMPS', q: 'Comment va aujourd’hui ?', sub: 'Choisis le visage le plus proche.' },
  { k: 'elan',   kicker: 'DEUXIÈME TEMPS', q: 'Et ton élan ?', sub: 'L’envie d’un côté, le corps de l’autre.' },
  { k: 'jour',   kicker: 'TROISIÈME TEMPS', q: 'Qu’est-ce qui restera ?', sub: 'Quelques mots, une photo, les gens croisés.' },
  { k: 'garder', kicker: 'DERNIER TEMPS', q: 'Quelque chose à garder ?', sub: 'Une idée à ne pas perdre, deux mots-clés.' }
] as const;

/**
 * Le point du jour, en rituel : quatre écrans qui défilent, une question par
 * écran, tout est facultatif et l'enregistrement est possible dès le premier
 * visage choisi. Alimente le code couleur des calendriers de rétrospective.
 */
export default function DayCheckin({ day = dayKey(), onClose }: { day?: string; onClose: () => void }) {
  const { s, d } = useGame();
  const book = (s as any).checkins || {};
  const saved: Entry | undefined = book[day];
  const [e, setE] = useState<Entry>(saved ? { ...saved } : emptyCheckin(day));
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState('');
  const [tag, setTag] = useState('');
  const [who, setWho] = useState('');
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);

  const set = (patch: Partial<Entry>) => setE((v) => ({ ...v, ...patch }));
  const acc = e.mood ? moodColor(e.mood) : C.lime;
  const suggestions = knownWho(book).filter((w) => !(e.who || []).includes(w)).slice(0, 6);

  React.useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const go = (n: number) => { setStep(Math.max(0, Math.min(STEPS.length - 1, n))); buzz('soft'); };

  /** Le visage choisi fait avancer tout seul : un tap, et le rituel continue. */
  const pickFace = (f: { id: string; v: Scale }) => {
    const on = e.face === f.id;
    set(on ? { mood: 0, face: undefined } : { mood: f.v, face: f.id });
    buzz('soft');
    if (timer.current) window.clearTimeout(timer.current);
    if (!on && step === 0) timer.current = window.setTimeout(() => setStep(1), 320);
  };

  const addIdea = () => {
    const v = idea.trim();
    if (!v) return;
    set({ ideas: [...e.ideas, v] }); setIdea(''); buzz('soft');
  };
  const addWho = () => {
    const v = who.trim();
    if (!v) return;
    if (!(e.who || []).includes(v)) set({ who: [...(e.who || []), v] });
    setWho(''); buzz('soft');
  };
  const toggleTag = (t: string) =>
    set({ tags: e.tags.includes(t) ? e.tags.filter((x) => x !== t) : [...e.tags, t] });

  const pickPhoto = async (list: FileList | null) => {
    if (!list || !list[0]) return;
    setBusy(true);
    try { set({ photo: await compressPhoto(list[0]) }); buzz('soft'); } catch { /* photo ignorée */ }
    setBusy(false);
  };

  /** Une idée gardée peut partir directement en quête sur la compétence perso. */
  const toQuest = (text: string) => {
    d({ t: 'ADD_QUEST', skill: s.startSkill || 'perso', name: text, px: 15, rarity: 'commune', desc: 'Née d’une idée du point du jour.' });
    buzz('success');
  };

  const save = () => {
    d({ t: 'CHECKIN_SAVE', entry: { ...e, at: Date.now() } });
    buzz('success'); sfx.tap();
    onClose();
  };

  const dateLabel = new Date(day + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const st = STEPS[step];
  const last = step === STEPS.length - 1;
  const something = !!(e.mood || e.motivation || e.energie || e.note.trim() || e.ideas.length || e.tags.length || e.photo || (e.who || []).length);

  return (
    <div
      role="dialog" aria-label="Point du jour"
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <Tap onTap={onClose} aria-label="Fermer" style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,8,.72)', animation: 'nuRise .2s ease both' }} />

      <div
        style={{
          position: 'relative', background: C.ink, borderRadius: '30px 30px 0 0', maxHeight: '92vh', overflowY: 'auto',
          padding: '10px 20px calc(20px + env(safe-area-inset-bottom))',
          border: `1px solid ${C.line}`, borderBottom: 'none',
          boxShadow: '0 -30px 60px -30px rgba(0,0,0,.9)',
          animation: 'nuRise .34s cubic-bezier(.2,1,.3,1) both'
        }}
      >
        <span style={{ display: 'block', width: 42, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.16)', margin: '4px auto 14px' }} />

        {/* En-tête calme : la date, le visage déjà choisi, l'avancée du rituel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(255,255,255,.38)' }}>LE POINT DU JOUR</span>
            <span style={{ display: 'block', font: `800 20px/1.1 ${F.display}`, color: '#fff', letterSpacing: '-.025em', marginTop: 5 }}>
              {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
            </span>
          </span>
          <MoodFace v={e.mood} face={e.face} size={38} />
        </div>

        <div style={{ display: 'flex', gap: 5, marginTop: 15 }}>
          {STEPS.map((x, i) => (
            <Tap
              key={x.k} onTap={() => go(i)} aria-label={x.q}
              style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center' }}
            >
              <span style={{
                display: 'block', width: '100%', height: 3, borderRadius: 99,
                background: i <= step ? acc : 'rgba(255,255,255,.1)',
                opacity: i === step ? 1 : i < step ? .55 : 1, transition: 'background .25s ease'
              }} />
            </Tap>
          ))}
        </div>

        {/* La question du temps en cours */}
        <div key={st.k} style={{ marginTop: 6, animation: 'nuRise .3s cubic-bezier(.2,1,.3,1) both' }}>
          <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.2em', color: 'rgba(255,255,255,.32)' }}>{st.kicker}</span>
          <span style={{ display: 'block', font: `800 23px/1.15 ${F.display}`, color: '#fff', letterSpacing: '-.03em', marginTop: 7, textWrap: 'pretty' }}>{st.q}</span>
          <span style={{ display: 'block', font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.42)', marginTop: 6, textWrap: 'pretty' }}>{st.sub}</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
            {step === 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9 }}>
                {FACES.map((f) => {
                  const on = e.face === f.id;
                  return (
                    <Tap
                      key={f.id} onTap={() => pickFace(f)} aria-label={f.label}
                      style={{
                        minHeight: 74, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', gap: 5, padding: '9px 4px',
                        background: on ? `${moodColor(f.v)}2E` : 'rgba(255,255,255,.035)',
                        border: `1.5px solid ${on ? moodColor(f.v) : 'transparent'}`,
                        opacity: e.face && !on ? .45 : 1, transition: 'opacity .18s ease, background .18s ease'
                      }}
                    >
                      <MoodFace v={f.v} face={f.id} size={34} />
                      <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.04em', color: on ? '#fff' : 'rgba(255,255,255,.4)' }}>{f.label}</span>
                    </Tap>
                  );
                })}
              </div>
            ) : null}

            {step === 1 ? (
              <>
                <Field label="MOTIVATION" hint={SCALE_LABELS[e.motivation]}>
                  <ScaleRow value={e.motivation} color={C.azur} onPick={(v) => set({ motivation: v })} />
                </Field>
                <Field label="ÉNERGIE" hint={SCALE_LABELS[e.energie]}>
                  <ScaleRow value={e.energie} color={C.teal} onPick={(v) => set({ energie: v })} />
                </Field>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Field label="PENSÉES">
                  <textarea
                    value={e.note} onChange={(ev) => set({ note: ev.target.value })} rows={4}
                    placeholder="Ce que tu retiens d’aujourd’hui."
                    style={{ ...INPUT, font: `500 14px/1.55 ${F.body}`, resize: 'vertical' }}
                  />
                </Field>

                <Field label="PHOTO DU JOUR" hint={e.photo ? 'gardée sur l’appareil' : busy ? 'traitement…' : 'facultative'}>
                  <input
                    ref={file} type="file" accept="image/*" hidden
                    onChange={(ev) => { pickPhoto(ev.target.files); ev.target.value = ''; }}
                  />
                  {e.photo ? (
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                      <img src={e.photo} alt="Photo du jour" style={{ display: 'block', width: '100%', maxHeight: 190, objectFit: 'cover' }} />
                      <Tap
                        onTap={() => set({ photo: undefined })} aria-label="Retirer la photo"
                        style={{ position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 99, background: 'rgba(6,6,8,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </Tap>
                    </div>
                  ) : (
                    <Tap
                      onTap={() => file.current?.click()} haptic="soft"
                      style={{
                        minHeight: 62, borderRadius: 16, border: '1px dashed rgba(255,255,255,.16)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: 'rgba(255,255,255,.02)'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13.5" r="3.2" />
                      </svg>
                      <span style={{ font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.5)' }}>AJOUTER UNE PHOTO</span>
                    </Tap>
                  )}
                </Field>

                <Field label="QUI J’AI VU" hint={(e.who || []).length ? String((e.who || []).length) : undefined}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {(e.who || []).map((w) => (
                      <Chip key={w} label={w} on onTap={() => set({ who: (e.who || []).filter((x) => x !== w) })} />
                    ))}
                    {suggestions.map((w) => (
                      <Chip key={w} label={w} on={false} onTap={() => set({ who: [...(e.who || []), w] })} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={who} onChange={(ev) => setWho(ev.target.value.slice(0, 22))}
                      onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); addWho(); } }}
                      placeholder="Un prénom, puis Entrée"
                      style={{ ...INPUT, flex: 1, font: `500 13px ${F.body}` }}
                    />
                  </div>
                </Field>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Field label="IDÉES" hint={e.ideas.length ? String(e.ideas.length) : undefined}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {e.ideas.map((it, i) => (
                      <div key={it + i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.045)', borderRadius: 13, padding: '10px 10px 10px 13px' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.honey, flex: 'none' }} />
                        <span style={{ flex: 1, font: `500 13px ${F.body}`, color: 'rgba(255,255,255,.82)', textWrap: 'pretty' }}>{it}</span>
                        <Tap
                          onTap={() => toQuest(it)} aria-label="Transformer en quête"
                          style={{ flex: 'none', minHeight: 32, padding: '0 10px', borderRadius: 99, background: 'rgba(185,222,100,.14)', border: `1px solid ${C.lime}55`, display: 'flex', alignItems: 'center' }}
                        >
                          <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.lime }}>→ QUÊTE</span>
                        </Tap>
                        <Tap
                          onTap={() => set({ ideas: e.ideas.filter((_, j) => j !== i) })} aria-label="Retirer"
                          style={{ width: 28, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </Tap>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={idea} onChange={(ev) => setIdea(ev.target.value)}
                        onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); addIdea(); } }}
                        placeholder="Une idée à ne pas perdre"
                        style={{ ...INPUT, flex: 1 }}
                      />
                      <Tap
                        onTap={addIdea} haptic="soft" aria-label="Ajouter l’idée"
                        style={{ width: 48, minHeight: 48, borderRadius: 14, background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                      </Tap>
                    </div>
                  </div>
                </Field>

                <Field label="MOTS-CLÉS">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {[...SUGGESTED_TAGS, ...e.tags.filter((t) => !SUGGESTED_TAGS.includes(t))].map((t) => (
                      <Chip key={t} label={t} on={e.tags.includes(t)} onTap={() => toggleTag(t)} />
                    ))}
                  </div>
                  <input
                    value={tag} onChange={(ev) => setTag(ev.target.value.slice(0, 18))}
                    onKeyDown={(ev) => {
                      if (ev.key !== 'Enter') return;
                      ev.preventDefault();
                      const v = tag.trim().toLowerCase();
                      if (v && !e.tags.includes(v)) set({ tags: [...e.tags, v] });
                      setTag('');
                    }}
                    placeholder="Autre mot-clé, puis Entrée"
                    style={{ ...INPUT, font: `500 13px ${F.body}` }}
                  />
                </Field>
              </>
            ) : null}
          </div>
        </div>

        {/* Pied : reculer, passer, avancer — et enregistrer dès qu'il y a quelque chose */}
        <div style={{ display: 'flex', gap: 8, marginTop: 22, position: 'sticky', bottom: 0, paddingTop: 6, paddingBottom: 2, background: C.ink }}>
          <Tap
            onTap={() => (step === 0 ? onClose() : go(step - 1))}
            aria-label={step === 0 ? 'Fermer' : 'Revenir'}
            style={{ flex: 'none', width: 52, minHeight: 52, borderRadius: 16, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {step === 0 ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.6" strokeLinecap="round"><path d="M14 6l-6 6 6 6" /></svg>
            )}
          </Tap>

          {!last ? (
            <>
              <Tap
                onTap={() => go(step + 1)}
                style={{ flex: 'none', padding: '0 16px', minHeight: 52, borderRadius: 16, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.5)' }}
              >
                PASSER
              </Tap>
              {something ? (
                <Tap
                  onTap={save} haptic="success"
                  style={{ flex: 1, minHeight: 52, borderRadius: 16, background: 'rgba(255,255,255,.07)', border: `1px solid ${acc}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11px ${F.mono}`, letterSpacing: '.1em', color: acc }}
                >
                  ENREGISTRER
                </Tap>
              ) : null}
              <Tap
                onTap={() => go(step + 1)} haptic="soft"
                style={{ flex: something ? 'none' : 1, padding: something ? '0 20px' : 0, minHeight: 52, borderRadius: 16, background: acc, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 13.5px ${F.display}`, letterSpacing: '-.01em' }}
              >
                {something ? 'SUITE' : 'CONTINUER'}
              </Tap>
            </>
          ) : (
            <BorderGlow borderRadius={16} glowRadius={22} glowIntensity={0.6} colors={[acc, C.honey, C.teal]} backgroundColor={acc} style={{ flex: 1 }}>
              <Tap
                onTap={save} haptic="success"
                style={{ minHeight: 52, borderRadius: 16, background: acc, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 14px ${F.display}`, letterSpacing: '-.01em' }}
              >
                ENREGISTRER
              </Tap>
            </BorderGlow>
          )}
        </div>
      </div>
    </div>
  );
}
