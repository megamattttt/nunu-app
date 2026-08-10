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
  const [edit, setEdit] = useState<JournalEntry | null>(null);

  const list = useMemo(
    () => s.journal.filter((e) => filter === 'all' || e.skill === filter).slice().sort((a, b) => b.when - a.when),
    [s.journal, filter]
  );

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

      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', margin: '18px -22px 0', padding: '0 22px' }}>
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
            title="Journal vide"
            text="Chaque palier validé ouvre une entrée à compléter. Tu peux aussi en créer une quand tu veux."
          />
        ) : null}
      </div>

      {edit ? <JournalEditor entry={edit} onClose={() => setEdit(null)} /> : null}
    </div>
  );
}
