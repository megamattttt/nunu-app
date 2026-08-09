import React from 'react';
import { C, F } from '../theme';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';

export type Page = 'home' | 'quests' | 'duels' | 'league' | 'profile';

const TABS: { id: Page; label: string; icon: JSX.Element }[] = [
  { id: 'home', label: 'Accueil', icon: <path d="M4 11.5L12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /> as any },
  { id: 'quests', label: 'Quêtes', icon: <path d="M5 4h11l3 3v13H5z M9 9h6M9 13h6M9 17h4" /> as any },
  { id: 'duels', label: 'Défis', icon: <path d="M13 3L5 14h6l-1 7 8-11h-6z" /> as any },
  { id: 'league', label: 'Ligue', icon: <path d="M12 2.8l2.85 5.8 6.4.9-4.62 4.5 1.09 6.36L12 17.35l-5.72 3.01 1.09-6.36L2.75 9.5l6.4-.9z" /> as any },
  { id: 'profile', label: 'Profil', icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.6-3.4 4.3-5 7.5-5s5.9 1.6 7.5 5" /> as any }
];

export default function TabBar({ page, onGo, badge }: { page: Page; onGo: (p: Page) => void; badge?: Partial<Record<Page, number>> }) {
  return (
    <nav
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
        paddingBottom: 'calc(var(--safe-bottom) + 6px)', paddingTop: 8,
        background: 'rgba(11,11,12,.86)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderTop: '1px solid rgba(255,255,255,.08)',
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2
      }}
    >
      {TABS.map((t) => {
        const on = page === t.id;
        return (
          <button
            key={t.id}
            aria-label={t.label}
            aria-current={on ? 'page' : undefined}
            onClick={() => { buzz('tap'); sfx.tap(); onGo(t.id); }}
            style={{
              minHeight: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: 'none', position: 'relative'
            }}
          >
            <span
              style={{
                width: 40, height: 26, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? C.lime : 'transparent', transition: 'background .18s ease'
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={on ? C.ink : 'rgba(255,255,255,.6)'} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
                {t.icon}
              </svg>
            </span>
            <span style={{ font: `${on ? 700 : 500} 9.5px ${F.mono}`, letterSpacing: '.06em', color: on ? '#fff' : 'rgba(255,255,255,.45)' }}>
              {t.label.toUpperCase()}
            </span>
            {badge?.[t.id] ? (
              <span style={{ position: 'absolute', top: 4, right: '50%', marginRight: -20, minWidth: 16, height: 16, borderRadius: 99, background: C.coral, color: '#fff', font: `700 9px ${F.mono}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                {badge[t.id]}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
