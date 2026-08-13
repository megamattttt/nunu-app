import React, { useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import {
  FACES, SCALE_LABELS, SUGGESTED_TAGS, dayKey, emptyCheckin, faceLabel, faceOf, moodColor, moodSrc,
  type DayCheckin as Entry, type Scale
} from '../data/checkin';
import { Tap } from './ui';
import BorderGlow from './BorderGlow';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';

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
    <div style={{ display: 'flex', gap: 7 }}>
      {([1, 2, 3, 4, 5] as Scale[]).map((v) => {
        const on = value >= v;
        return (
          <Tap
            key={v} onTap={() => onPick(value === v ? 0 : v)} haptic="soft"
            aria-label={SCALE_LABELS[v]}
            style={{
              flex: 1, minHeight: 44, borderRadius: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: 7, background: on ? color : 'rgba(255,255,255,.06)',
              border: `1px solid ${on ? color : 'rgba(255,255,255,.08)'}`, transition: 'background .15s ease'
            }}
          >
            <span style={{ font: `700 10px ${F.mono}`, color: on ? C.ink : 'rgba(255,255,255,.4)' }}>{v}</span>
          </Tap>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.45)' }}>{label}</span>
        {hint ? <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.35)' }}>{hint}</span> : null}
      </span>
      {children}
    </div>
  );
}

const INPUT: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 13,
  padding: '12px 13px', color: '#fff', font: `500 14px ${F.body}`, outline: 'none', minHeight: 46
};

/**
 * Feuille du point du jour : elle monte du bas, se remplit en une minute et
 * alimente le code couleur des calendriers de rétrospective.
 */
export default function DayCheckin({ day = dayKey(), onClose }: { day?: string; onClose: () => void }) {
  const { s, d } = useGame();
  const saved: Entry | undefined = (s as any).checkins?.[day];
  const [e, setE] = useState<Entry>(saved ? { ...saved } : emptyCheckin(day));
  const [idea, setIdea] = useState('');
  const [tag, setTag] = useState('');

  const set = (patch: Partial<Entry>) => setE((v) => ({ ...v, ...patch }));
  const acc = e.mood ? moodColor(e.mood) : C.lime;

  const addIdea = () => {
    const v = idea.trim();
    if (!v) return;
    set({ ideas: [...e.ideas, v] }); setIdea(''); buzz('soft');
  };
  const toggleTag = (t: string) =>
    set({ tags: e.tags.includes(t) ? e.tags.filter((x) => x !== t) : [...e.tags, t] });

  const save = () => {
    d({ t: 'CHECKIN_SAVE', entry: { ...e, at: Date.now() } });
    buzz('success'); sfx.tap();
    onClose();
  };

  const dateLabel = new Date(day + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div
      role="dialog" aria-label="Point du jour"
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <Tap onTap={onClose} aria-label="Fermer" style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,8,.68)', animation: 'nuRise .2s ease both' }} />

      <div
        style={{
          position: 'relative', background: C.ink, borderRadius: '30px 30px 0 0', maxHeight: '92vh', overflowY: 'auto',
          padding: '10px 20px calc(22px + env(safe-area-inset-bottom))',
          border: `1px solid ${C.line}`, borderBottom: 'none',
          boxShadow: `0 -30px 60px -30px rgba(0,0,0,.9)`,
          animation: 'nuRise .34s cubic-bezier(.2,1,.3,1) both'
        }}
      >
        <span style={{ display: 'block', width: 42, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.18)', margin: '4px auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(255,255,255,.42)' }}>LE POINT DU JOUR</span>
            <span style={{ display: 'block', font: `800 21px/1.1 ${F.display}`, color: '#fff', letterSpacing: '-.025em', marginTop: 5 }}>
              {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
            </span>
          </span>
          <MoodFace v={e.mood} face={e.face} size={40} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 18 }}>
          <Field label="HUMEUR" hint={e.face || e.mood ? faceLabel(e) : undefined}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
              {FACES.map((f) => {
                const on = e.face === f.id;
                return (
                  <Tap
                    key={f.id} onTap={() => set(on ? { mood: 0, face: undefined } : { mood: f.v, face: f.id })}
                    haptic="soft" aria-label={f.label}
                    style={{
                      aspectRatio: '1', minHeight: 46, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: on ? `${moodColor(f.v)}2E` : 'rgba(255,255,255,.04)',
                      border: `1.5px solid ${on ? moodColor(f.v) : 'transparent'}`,
                      opacity: e.face && !on ? .5 : 1, transition: 'opacity .15s ease, background .15s ease'
                    }}
                  >
                    <MoodFace v={f.v} face={f.id} size={30} />
                  </Tap>
                );
              })}
            </div>
          </Field>

          <Field label="MOTIVATION" hint={SCALE_LABELS[e.motivation]}>
            <ScaleRow value={e.motivation} color={C.azur} onPick={(v) => set({ motivation: v })} />
          </Field>

          <Field label="ÉNERGIE" hint={SCALE_LABELS[e.energie]}>
            <ScaleRow value={e.energie} color={C.teal} onPick={(v) => set({ energie: v })} />
          </Field>

          <Field label="SOMMEIL" hint={e.sleep != null ? e.sleep + ' h' : 'non renseigné'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {([5, 6, 7, 8, 9] as number[]).map((h) => {
                const on = e.sleep === h;
                return (
                  <Tap
                    key={h} onTap={() => set({ sleep: on ? null : h })} haptic="soft"
                    style={{
                      flex: 1, minHeight: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: on ? C.iris : 'rgba(255,255,255,.05)', border: `1px solid ${on ? C.iris : 'rgba(255,255,255,.08)'}`
                    }}
                  >
                    <span style={{ font: `700 11px ${F.mono}`, color: on ? C.ink : 'rgba(255,255,255,.5)' }}>{h === 5 ? '≤5' : h === 9 ? '9+' : h} h</span>
                  </Tap>
                );
              })}
            </div>
          </Field>

          <Field label="PENSÉES">
            <textarea
              value={e.note} onChange={(ev) => set({ note: ev.target.value })} rows={3}
              placeholder="Ce que tu retiens d’aujourd’hui."
              style={{ ...INPUT, font: `500 14px/1.5 ${F.body}`, resize: 'vertical' }}
            />
          </Field>

          <Field label="IDÉES" hint={e.ideas.length ? e.ideas.length + '' : undefined}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {e.ideas.map((it, i) => (
                <div key={it + i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '10px 12px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.honey, flex: 'none' }} />
                  <span style={{ flex: 1, font: `500 13px ${F.body}`, color: 'rgba(255,255,255,.82)', textWrap: 'pretty' }}>{it}</span>
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
                  style={{ width: 46, minHeight: 46, borderRadius: 13, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                </Tap>
              </div>
            </div>
          </Field>

          <Field label="MOTS-CLÉS">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {[...SUGGESTED_TAGS, ...e.tags.filter((t) => !SUGGESTED_TAGS.includes(t))].map((t) => {
                const on = e.tags.includes(t);
                return (
                  <Tap
                    key={t} onTap={() => toggleTag(t)} haptic="soft"
                    style={{
                      minHeight: 36, padding: '0 12px', borderRadius: 99, display: 'flex', alignItems: 'center',
                      background: on ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.05)',
                      border: `1px solid ${on ? 'transparent' : 'rgba(255,255,255,.1)'}`
                    }}
                  >
                    <span style={{ font: `700 11px ${F.body}`, color: on ? C.ink : 'rgba(255,255,255,.6)' }}>{t}</span>
                  </Tap>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
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
                style={{ ...INPUT, flex: 1, font: `500 13px ${F.body}` }}
              />
            </div>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 9, marginTop: 20, position: 'sticky', bottom: 0, paddingTop: 4, background: C.ink }}>
          <Tap
            onTap={onClose}
            style={{ flex: 'none', minHeight: 52, padding: '0 18px', borderRadius: 16, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.55)' }}
          >
            ANNULER
          </Tap>
          <BorderGlow borderRadius={16} glowRadius={26} glowIntensity={0.85} colors={[acc, C.honey, C.teal]} backgroundColor={acc} style={{ flex: 1 }}>
            <Tap
              onTap={save} haptic="success"
              style={{ minHeight: 52, borderRadius: 16, background: acc, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 14px ${F.display}`, letterSpacing: '-.01em' }}
            >
              ENREGISTRER
            </Tap>
          </BorderGlow>
        </div>
      </div>
    </div>
  );
}
