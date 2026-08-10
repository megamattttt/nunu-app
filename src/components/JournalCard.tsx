import React from 'react';
import { C, F } from '../theme';
import { skillById } from '../data/skills';
import type { JournalEntry } from '../state/types';
import { MOODS } from './JournalEditor';
import { Tap } from './ui';

const D = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Carte d'une entrée de journal, utilisée dans la page Quêtes et le journal complet. */
export default function JournalCard({ e, onTap, showSkill }: { e: JournalEntry; onTap: () => void; showSkill?: boolean }) {
  const sk = skillById(e.skill);
  const empty = !e.note && !e.photos.length && e.mood < 0 && e.diff < 0 && !e.minutes;
  const mood = e.mood >= 0 ? MOODS[e.mood] : null;

  return (
    <Tap
      onTap={onTap} haptic="soft"
      style={{
        background: '#fff', borderRadius: 20, padding: '14px 15px',
        border: empty ? '1.5px dashed rgba(11,11,12,.18)' : '1px solid rgba(11,11,12,.07)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 99, background: mood ? mood[1] : sk.c, flex: 'none' }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: `500 9px ${F.mono}`, letterSpacing: '.13em', color: 'rgba(11,11,12,.42)' }}>
            {showSkill ? <span style={{ color: C.ink, background: sk.c, padding: '3px 6px', borderRadius: 6, letterSpacing: '.08em' }}>{sk.short}</span> : null}
            <span>{e.ix !== null ? 'PALIER ' + (e.ix + 1) : 'LIBRE'}</span>
            <span>{D.format(new Date(e.when))}</span>
          </span>
          <span style={{ display: 'block', font: `800 16px/1.15 ${F.display}`, color: C.ink, letterSpacing: '-.015em', marginTop: 5 }}>{e.title}</span>
          {e.note ? (
            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', font: `400 12.5px/1.45 ${F.body}`, color: 'rgba(11,11,12,.6)', marginTop: 6 }}>
              {e.note}
            </span>
          ) : null}
          {empty ? (
            <span style={{ display: 'block', font: `400 12px ${F.body}`, color: 'rgba(11,11,12,.42)', marginTop: 6 }}>
              Rien de noté. Tape pour documenter ce palier.
            </span>
          ) : null}

          {(mood || e.diff >= 0 || e.minutes) ? (
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
              {mood ? <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.06em', color: C.ink, background: mood[1], padding: '4px 8px', borderRadius: 7 }}>{mood[0].toUpperCase()}</span> : null}
              {e.diff >= 0 ? <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.06em', color: 'rgba(11,11,12,.55)', background: 'rgba(11,11,12,.06)', padding: '4px 8px', borderRadius: 7 }}>DIFFICULTÉ {e.diff + 1}/5</span> : null}
              {e.minutes ? <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.06em', color: 'rgba(11,11,12,.55)', background: 'rgba(11,11,12,.06)', padding: '4px 8px', borderRadius: 7 }}>{e.minutes < 60 ? e.minutes + ' MIN' : e.minutes / 60 + ' H'}</span> : null}
            </span>
          ) : null}
        </span>

        {e.photos.length ? (
          <span style={{ position: 'relative', width: 58, height: 58, borderRadius: 14, overflow: 'hidden', flex: 'none' }}>
            <img src={e.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {e.photos.length > 1 ? (
              <span style={{ position: 'absolute', right: 3, bottom: 3, font: `700 9px ${F.mono}`, color: '#fff', background: 'rgba(11,11,12,.7)', padding: '2px 5px', borderRadius: 6 }}>
                {e.photos.length}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
    </Tap>
  );
}
