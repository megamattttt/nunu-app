import React, { useMemo, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { SKILLS } from '../../data/skills';
import JournalCard from '../../components/JournalCard';
import JournalEditor, { newEntry } from '../../components/JournalEditor';
import type { JournalEntry } from '../../state/types';
import { Empty, Kicker, RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

/** Journal complet : toutes les entrées, groupées par mois, filtrables par compétence. */
export default function Journal({ nav }: { nav: Nav }) {
  const { s } = useGame();
  const [filter, setFilter] = useState<string>('all');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<JournalEntry | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return s.journal
      .filter((e) => filter === 'all' || e.skill === filter)
      .filter((e) => !needle || (e.title + ' ' + e.note).toLowerCase().includes(needle))
      .slice()
      .sort((a, b) => b.when - a.when);
  }, [s.journal, filter, q]);

  const groups = useMemo(() => {
    const out: [string, JournalEntry[]][] = [];
    list.forEach((e) => {
      const key = MONTH.format(new Date(e.when));
      const last = out[out.length - 1];
      if (last && last[0] === key) last[1].push(e);
      else out.push([key, [e]]);
    });
    return out;
  }, [list]);

  const photos = s.journal.reduce((n, e) => n + e.photos.length, 0);
  const notes = s.journal.filter((e) => e.note).length;

  return (
    <div style={{ padding: '10px 22px' }}>
      <RouteHead
        title="JOURNAL"
        sub={`${s.journal.length} entrées · ${photos} photos · ${notes} notes`}
        onBack={nav.back}
        right={
          <Tap
            onTap={() => setEdit(newEntry(filter === 'all' ? (s.startSkill || SKILLS[0].id) : filter))}
            haptic="soft"
            style={{ width: 44, height: 44, borderRadius: 99, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
            aria-label="Nouvelle entrée"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
          </Tap>
        }
      />

      {/* Recherche dans les titres et les notes */}
      <div style={{ position: 'relative', marginTop: 18 }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.2"
          style={{ position: 'absolute', left: 15, top: '50%', marginTop: -8 }}
        >
          <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" />
        </svg>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans le journal…"
          style={{
            width: '100%', minHeight: 48, borderRadius: 16, padding: '0 42px 0 42px',
            background: C.night, border: `1px solid ${C.line}`, color: '#fff', font: `400 15px ${F.body}`
          }}
        />
        {q ? (
          <Tap
            onTap={() => setQ('')} aria-label="Effacer"
            style={{ position: 'absolute', right: 6, top: 4, width: 40, height: 40, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </Tap>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', margin: '12px -22px 0', padding: '0 22px' }}>
        {([['all', 'TOUT'], ...SKILLS.map((k) => [k.id, k.short] as [string, string])]).map(([id, label]) => (
          <Tap
            key={id} onTap={() => setFilter(id)} haptic="soft"
            style={{
              flex: 'none', minHeight: 40, padding: '0 15px', display: 'flex', alignItems: 'center', borderRadius: 12,
              font: `700 10px ${F.mono}`, letterSpacing: '.1em',
              background: filter === id ? C.lime : 'rgba(255,255,255,.07)',
              color: filter === id ? C.ink : 'rgba(255,255,255,.6)'
            }}
          >
            {label}
          </Tap>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, paddingBottom: 20 }}>
        {groups.map(([month, items]) => (
          <React.Fragment key={month}>
            <Kicker style={{ marginTop: 6 }}>{month.toUpperCase()}</Kicker>
            {items.map((e) => <JournalCard key={e.id} e={e} showSkill={filter === 'all'} onTap={() => setEdit(e)} />)}
          </React.Fragment>
        ))}
        {!list.length ? (
          <Empty
            title={q ? 'Aucun résultat' : 'Journal vide'}
            text={q ? `Rien ne correspond à « ${q} » dans les titres et les notes.` : 'Chaque palier validé ouvre une entrée à compléter. Tu peux aussi en créer une quand tu veux.'}
          />
        ) : null}
      </div>

      {edit ? <JournalEditor entry={edit} onClose={() => setEdit(null)} /> : null}
    </div>
  );
}
