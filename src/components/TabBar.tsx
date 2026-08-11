import React from 'react';
import { C, F } from '../theme';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';

export type Page = 'home' | 'quests' | 'profile';

const TABS: { id: Page; label: string; icon: JSX.Element }[] = [
  { id: 'home', label: 'Accueil', icon: <path d="M4 11.5L12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /> as any },
  { id: 'quests', label: 'Quêtes', icon: <path d="M5 4h11l3 3v13H5z M9 9h6M9 13h6M9 17h4" /> as any },
  { id: 'profile', label: 'Profil', icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.6-3.4 4.3-5 7.5-5s5.9 1.6 7.5 5" /> as any }
];

export default function TabBar({ page, onGo, badge }: { page: Page; onGo: (p: Page) => void; badge?: Partial<Record<Page, number>> }) {
  const ref = React.useRef<HTMLElement | null>(null);

  /**
   * Le dock est fixe : on publie sa hauteur RÉELLE dans --dock-h plutôt que
   * de la recalculer à partir de --nav-h et env(safe-area-inset-bottom).
   * En PWA installée sur iOS, ces valeurs théoriques ne correspondaient pas à
   * la hauteur rendue et le bas de page passait sous le dock.
   */
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h > 0) document.documentElement.style.setProperty('--dock-h', h + 'px');
    };
    publish();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null;
    ro?.observe(el);
    window.addEventListener('resize', publish);
    window.addEventListener('orientationchange', publish);
    // iOS met à jour les safe areas après la bascule en plein écran.
    const t1 = window.setTimeout(publish, 300);
    const t2 = window.setTimeout(publish, 1200);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', publish);
      window.removeEventListener('orientationchange', publish);
      window.clearTimeout(t1); window.clearTimeout(t2);
    };
  }, []);

  return (
    <nav
      ref={ref as any}
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
        paddingBottom: 'max(var(--safe-bottom), 10px)', paddingTop: 9,
        background: 'rgba(10,10,12,.9)', backdropFilter: 'blur(20px) saturate(1.3)', WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
        borderTop: '1px solid rgba(255,255,255,.07)',
        display: 'grid', gridTemplateColumns: `repeat(${TABS.length},1fr)`, gap: 2
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
                width: 46, height: 28, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? C.lime : 'transparent', transition: 'background .18s ease',
                boxShadow: on ? `0 6px 18px -8px ${C.lime}` : 'none'
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
