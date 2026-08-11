import React, { useEffect, useRef, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { skillById } from '../data/skills';
import type { JournalEntry } from '../state/types';
import { compressPhoto } from '../lib/photo';
import { Tap, Check } from './ui';

export const MOODS: [string, string][] = [
  ['Rude', C.coral], ['Mitigé', '#F08A5D'], ['Correct', C.honey], ['Bien', C.sky], ['Excellent', C.lime]
];
const DURATIONS = [15, 30, 45, 60, 90, 120];
const MAX_PHOTOS = 4;

export const newEntry = (skill: string, ix: number | null = null, title = ''): JournalEntry => ({
  id: Math.random().toString(36).slice(2, 9),
  skill, ix, title, note: '', mood: -1, diff: -1, minutes: 0, photos: [], when: Date.now()
});

/** Modale d'édition d'une entrée de journal : photos, note, ressenti, difficulté, durée. */
export default function JournalEditor({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const { s, d } = useGame();
  const [e, setE] = useState<JournalEntry>(entry);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement | null>(null);
  const sk = skillById(e.skill);
  const set = (patch: Partial<JournalEntry>) => setE((v) => ({ ...v, ...patch }));

  // Tant que la feuille est ouverte : Échap ferme, la page derrière ne défile plus.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const addPhotos = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      const room = MAX_PHOTOS - e.photos.length;
      const picked = Array.from(list).slice(0, Math.max(0, room));
      const out = await Promise.all(picked.map(compressPhoto));
      set({ photos: [...e.photos, ...out] });
    } catch {
      d({ t: 'TOAST', msg: 'Photo illisible' });
    } finally {
      setBusy(false);
      if (file.current) file.current.value = '';
    }
  };

  const save = () => {
    const clean = { ...e, title: e.title.trim() || (e.ix !== null ? 'Palier ' + (e.ix + 1) : 'Note libre'), auto: false };
    d({ t: 'JOURNAL_SAVE', entry: clean });
    onClose();
  };

  const label: React.CSSProperties = { display: 'block', font: `500 9px ${F.mono}`, color: 'rgba(11,11,12,.45)', letterSpacing: '.16em', marginBottom: 9 };
  const card: React.CSSProperties = { background: '#fff', borderRadius: 20, padding: '15px 16px' };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 82, background: 'rgba(10,10,12,.84)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460, maxHeight: '88dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: C.paper,
          borderRadius: '30px 30px 0 0', padding: '10px 20px calc(var(--dock-space) + 10px)', animation: 'nuSheet .34s cubic-bezier(.2,1,.3,1)'
        }}
      >
        <Tap
          onTap={onClose} haptic="soft" aria-label="Fermer"
          style={{ display: 'block', width: 52, height: 22, margin: '0 auto 10px' }}
        >
          <span style={{ display: 'block', width: 42, height: 4, borderRadius: 99, background: 'rgba(10,10,12,.22)', margin: '9px auto 0' }} />
        </Tap>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 10, background: sk.c, color: sk.txt, font: `800 12px ${F.display}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{sk.short}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(11,11,12,.45)' }}>
              {e.ix !== null ? 'PALIER ' + (e.ix + 1) : 'ENTRÉE LIBRE'} · {sk.name}
            </span>
            <span style={{ display: 'block', font: `800 22px/1.1 ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 3 }}>
              {e.title || 'Nouvelle entrée'}
            </span>
          </span>
          {/* Fermeture explicite : la feuille couvre presque tout l'écran. */}
          <Tap
            onTap={onClose} haptic="soft" aria-label="Fermer"
            style={{ width: 44, height: 44, borderRadius: 99, flex: 'none', background: 'rgba(11,11,12,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </Tap>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {e.ix === null ? (
            <label style={card}>
              <span style={label}>TITRE</span>
              <input
                value={e.title} onChange={(ev) => set({ title: ev.target.value })} placeholder="Ce que j’ai fait"
                style={{ width: '100%', font: `700 16px ${F.body}`, color: C.ink }}
              />
            </label>
          ) : null}

          {/* Photos */}
          <div style={card}>
            <span style={label}>PHOTOS · {e.photos.length}/{MAX_PHOTOS}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
              {e.photos.map((p, i) => (
                <span key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'rgba(11,11,12,.06)' }}>
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <Tap
                    onTap={() => set({ photos: e.photos.filter((_, n) => n !== i) })} aria-label="Retirer la photo"
                    style={{ position: 'absolute', top: 3, right: 3, width: 22, height: 22, borderRadius: 99, background: 'rgba(11,11,12,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </Tap>
                </span>
              ))}
              {e.photos.length < MAX_PHOTOS ? (
                <Tap
                  onTap={() => file.current?.click()} haptic="soft"
                  style={{ aspectRatio: '1', borderRadius: 12, border: '1.5px dashed rgba(11,11,12,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: busy ? .5 : 1 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="1.9" strokeLinejoin="round">
                    <path d="M3 8.5h3.2L8 6h8l1.8 2.5H21V19H3z" /><circle cx="12" cy="13.2" r="3.4" />
                  </svg>
                </Tap>
              ) : null}
            </div>
            <input
              ref={file} type="file" accept="image/*" capture="environment" multiple hidden
              onChange={(ev) => addPhotos(ev.target.files)}
            />
            <div style={{ font: `400 10.5px/1.4 ${F.body}`, color: 'rgba(11,11,12,.45)', marginTop: 10 }}>
              Les photos sont compressées et gardées sur cet appareil uniquement.
            </div>
          </div>

          {/* Note */}
          <div style={card}>
            <span style={label}>NOTE</span>
            <textarea
              value={e.note} onChange={(ev) => set({ note: ev.target.value })} rows={4}
              placeholder="Ce qui a marché, ce qui a coincé, ce que tu retiens…"
              style={{ width: '100%', font: `400 15px/1.5 ${F.body}`, color: C.ink, resize: 'vertical', minHeight: 92 }}
            />
          </div>

          {/* Ressenti */}
          <div style={card}>
            <span style={label}>RESSENTI</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {MOODS.map(([name, col], i) => {
                const on = e.mood === i;
                return (
                  <Tap
                    key={name} onTap={() => set({ mood: on ? -1 : i })} haptic="soft"
                    style={{ flex: 1, minHeight: 62, borderRadius: 14, background: on ? col : 'rgba(11,11,12,.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .18s ease' }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: on ? C.ink : col, opacity: on ? 1 : .55 }} />
                    <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.04em', color: on ? C.ink : 'rgba(11,11,12,.5)' }}>{name.toUpperCase()}</span>
                  </Tap>
                );
              })}
            </div>
          </div>

          {/* Difficulté */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={label}>DIFFICULTÉ</span>
              <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(11,11,12,.45)' }}>{e.diff < 0 ? '—' : `${e.diff + 1}/5`}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const on = e.diff >= i;
                return (
                  <Tap
                    key={i} onTap={() => set({ diff: e.diff === i ? -1 : i })} haptic="soft"
                    style={{ flex: 1, minHeight: 44, borderRadius: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 6, background: 'rgba(11,11,12,.05)' }}
                  >
                    <span style={{ width: '100%', height: 8 + i * 6, borderRadius: 6, background: on ? sk.c : 'rgba(11,11,12,.14)', transition: 'background .16s ease' }} />
                  </Tap>
                );
              })}
            </div>
          </div>

          {/* Durée */}
          <div style={card}>
            <span style={label}>DURÉE</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DURATIONS.map((m) => {
                const on = e.minutes === m;
                return (
                  <Tap
                    key={m} onTap={() => set({ minutes: on ? 0 : m })} haptic="soft"
                    style={{ minHeight: 44, padding: '0 15px', display: 'flex', alignItems: 'center', borderRadius: 12, background: on ? C.ink : 'rgba(11,11,12,.05)', font: `700 12px ${F.mono}`, color: on ? C.paper : 'rgba(11,11,12,.6)' }}
                  >
                    {m < 60 ? m + ' MIN' : m / 60 + ' H'}
                  </Tap>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
          {s.journal.some((x) => x.id === e.id) ? (
            <Tap
              onTap={() => { d({ t: 'JOURNAL_DEL', id: e.id }); onClose(); }} haptic="error"
              style={{ flex: 'none', minWidth: 56, minHeight: 56, borderRadius: 18, background: 'rgba(11,11,12,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Supprimer l’entrée"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.coral} strokeWidth="2.2" strokeLinejoin="round"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" /></svg>
            </Tap>
          ) : null}
          <Tap
            onTap={save} haptic="success"
            style={{ flex: 1, minHeight: 56, borderRadius: 18, background: C.ink, color: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <Check size={17} c={C.lime} />
            <span style={{ font: `800 16px ${F.display}`, letterSpacing: '-.01em' }}>ENREGISTRER</span>
          </Tap>
        </div>
      </div>
    </div>
  );
}
