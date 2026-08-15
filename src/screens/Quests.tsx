import React, { useEffect, useMemo, useState } from 'react';
import { C, F } from '../theme';
import { useGame, COMBO_WINDOW, COMBO_STEPS, comboBonus } from '../state/store';
import { BADGES, BADGE_C, SKILLS, TITLES, skillById } from '../data/skills';
import { isInstant, DIFFS, type Difficulty } from '../data/quests';
import { MAX_ACTIVE_QUESTS } from '../data/catalog';
import { TIER_TIPS } from '../data/tips';
import {
  sectionsOf, activeRows, activeIds, doneIds, questRows, catalogProgress, customActiveRows,
  levelOf, pxOf, skillRank, skillNextRank, type QuestRow
} from '../state/selectors';
import { suggest } from '../lib/suggest';
import SkillWheel from '../components/SkillWheel';
import DiffBadge from '../components/DiffBadge';
import PersoBoard from '../components/PersoBoard';
import RetroCalendar from '../components/RetroCalendar';
import BorderGlow from '../components/BorderGlow';
import { RankIcon, RankBadge } from '../components/RankIcon';
import JournalCard from '../components/JournalCard';
import JournalEditor, { newEntry } from '../components/JournalEditor';
import type { JournalEntry } from '../state/types';
import { Check, Kicker, Star, Tap } from '../components/ui';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';
import type { Nav } from '../App';

/** Chrono du combo : barre qui se vide, s'efface quand la chaîne expire. */
function ComboBar({ n, last, best }: { n: number; last: number | null; best: number }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!last) return;
    const id = window.setInterval(() => tick((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [last]);

  if (!last || n < 1) return null;
  const left = COMBO_WINDOW - (Date.now() - last);
  if (left <= 0) return null;

  const pct = Math.max(0, Math.min(100, (left / COMBO_WINDOW) * 100));
  const mins = Math.max(1, Math.round(left / 60e3));
  const bonus = Math.round(comboBonus(n) * 100);
  const nextStep = COMBO_STEPS.find((v) => v > n);
  const hot = n >= 3;
  const acc = hot ? C.coral : C.honey;

  return (
    <div
      style={{
        background: `linear-gradient(125deg, ${C.ink}, ${hot ? '#2A1A17' : '#1E1B18'} 55%, ${C.ink})`,
        borderRadius: 22, padding: '16px 17px', position: 'relative', overflow: 'hidden',
        border: `1px solid ${acc}66`,
        boxShadow: `0 22px 46px -30px ${acc}, inset 0 1px 0 rgba(255,255,255,.06)`
      }}
    >
      <span style={{ position: 'absolute', right: -60, top: -70, width: 180, height: 180, borderRadius: '50%', background: acc, opacity: hot ? .22 : .12, animation: `nuHalo ${hot ? 4 : 7}s ease-in-out infinite` }} />
      <span style={{ position: 'absolute', top: 0, bottom: 0, width: 90, background: `linear-gradient(90deg,transparent,${acc}22,transparent)`, animation: 'nuShine 3.6s ease-in-out infinite' }} />
      <span style={{ position: 'absolute', inset: 0, opacity: .5, backgroundImage: `repeating-linear-gradient(90deg, transparent 0 5px, rgba(255,255,255,.025) 5px 6px)` }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative' }}>
        <span
          key={n}
          style={{
            width: 54, height: 54, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'polygon(16% 0, 84% 0, 100% 16%, 100% 84%, 84% 100%, 16% 100%, 0 84%, 0 16%)',
            background: `linear-gradient(160deg, ${acc}, ${acc}55)`,
            animation: 'nuComboIn .42s cubic-bezier(.2,1.2,.3,1)'
          }}
        >
          <span style={{ font: `800 24px/1 ${F.display}`, letterSpacing: '-.04em', color: C.ink }}>×{n}</span>
        </span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: acc }}>
            {hot ? 'COMBO CHAUD' : 'COMBO EN COURS'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, flexWrap: 'wrap' }}>
            {bonus ? (
              <span style={{ font: `800 12px ${F.display}`, letterSpacing: '-.01em', color: C.ink, background: acc, padding: '4px 9px', borderRadius: 8 }}>
                +{bonus} % DE PX
              </span>
            ) : (
              <span style={{ font: `700 11.5px ${F.body}`, color: '#fff' }}>Enchaîne pour déclencher le bonus</span>
            )}
            {nextStep ? (
              <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)' }}>×{nextStep} AU PROCHAIN PALIER</span>
            ) : null}
          </span>
        </span>

        <span style={{ flex: 'none', textAlign: 'right' }}>
          <span style={{ display: 'block', font: `800 15px ${F.display}`, color: '#fff', letterSpacing: '-.02em' }}>{mins}</span>
          <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.4)' }}>MIN</span>
        </span>
      </div>

      <span style={{ display: 'block', height: 7, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden', marginTop: 14, position: 'relative' }}>
        <span style={{ display: 'block', height: '100%', width: pct + '%', borderRadius: 99, background: `linear-gradient(90deg,${acc},${C.honey})`, transition: 'width 1s linear' }} />
      </span>

      {best > 1 ? (
        <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(255,255,255,.35)', marginTop: 10, position: 'relative' }}>
          MEILLEURE CHAÎNE · ×{best}
        </span>
      ) : null}
    </div>
  );
}

type Sub = 'board' | 'journal' | 'coll';
const SUBS: [Sub, string][] = [['board', 'PLATEAU'], ['journal', 'JOURNAL'], ['coll', 'COLLECTION']];

const LAST_SKILL_KEY = 'nunu.lastSkill';

/** Compteur de PX qui monte : la quête en cours annonce son gain. */
function useCountUp(target: number, ms = 620) {
  const [v, setV] = useState(target);
  useEffect(() => {
    let raf = 0; const t0 = performance.now(); const from = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/**
 * Une quête en cours. Trois à cinq de ces cartes coexistent : la mise en scène
 * de l'ancienne quête principale, empilée, avec un retrait possible.
 */
function ActiveQuest({ row, skill, px, combo, flash, onTap, onDrop, glow }: {
  row: QuestRow;
  skill: { c: string; name: string }; px: number; combo: number;
  flash: number | null; onTap: () => void; onDrop: () => void; glow: boolean;
}) {
  const count = useCountUp(px);
  const acc = C.lime;
  const card = (
    <Tap
      onTap={onTap} sound haptic={isInstant(row.rarity) ? 'levelup' : 'tap'}
      style={{
        minWidth: 0, position: 'relative', overflow: 'hidden', borderRadius: 24,
        background: `linear-gradient(150deg, ${C.ink}, #16181A 60%, ${C.ink})`,
        border: `1px solid ${acc}55`, padding: '16px 17px 15px',
        boxShadow: `0 26px 50px -34px ${acc}, 0 14px 30px -22px rgba(0,0,0,.9)`
      }}
    >
      <span style={{ position: 'absolute', right: -70, top: -80, width: 200, height: 200, borderRadius: '50%', background: acc, opacity: .18, animation: 'nuHalo 5s ease-in-out infinite' }} />
      <span style={{ position: 'absolute', left: -50, bottom: -70, width: 150, height: 150, borderRadius: '50%', background: skill.c, opacity: .14, animation: 'nuHalo 8s ease-in-out infinite' }} />
      <span style={{ position: 'absolute', top: 0, bottom: 0, width: 90, background: `linear-gradient(90deg,transparent,${acc}1f,transparent)`, animation: 'nuShine 4.2s ease-in-out infinite' }} />

      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: acc, animation: 'nuHalo 2.2s ease-in-out infinite' }} />
          <span style={{ font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: acc }}>EN COURS</span>
        </span>
        {row.major ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.honey, border: `1px solid ${C.honey}66`, borderRadius: 7, padding: '3px 7px' }}>
            <Star /> MAJEUR
          </span>
        ) : null}
        {combo > 1 ? (
          <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.08em', color: C.ink, background: C.coral, borderRadius: 99, padding: '3px 8px' }}>COMBO ×{combo}</span>
        ) : null}
        <Tap
          onTap={onDrop} haptic="soft" aria-label="Retirer des quêtes en cours"
          style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.07)', flex: 'none' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </Tap>
      </span>

      <span style={{ position: 'relative', display: 'block', font: `800 22px/1.15 ${F.display}`, color: '#fff', letterSpacing: '-.03em', marginTop: 11, textWrap: 'pretty' }}>
        {row.name}
      </span>

      {row.description ? (
        <span style={{ position: 'relative', display: 'block', font: `400 12px/1.45 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 7, textWrap: 'pretty' }}>
          {row.description}
        </span>
      ) : null}

      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, flexWrap: 'wrap' }}>
        <DiffBadge diff={row.diff} size="sm" />
        <span style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>
          {isInstant(row.rarity) ? 'Un tap suffit' : 'Preuve à l’appui'}
        </span>
        {row.link ? (
          <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.55)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 7, padding: '4px 8px' }}>TUTO DISPO</span>
        ) : null}
      </span>

      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 15 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ font: `800 30px/1 ${F.display}`, color: acc, letterSpacing: '-.04em' }}>+{count}</span>
          <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.4)' }}>PX</span>
        </span>
        <span style={{ font: `700 12px ${F.body}`, color: C.ink, background: acc, padding: '13px 22px', borderRadius: 99, minHeight: 46, display: 'flex', alignItems: 'center', flex: 'none' }}>
          {flash ? `+${flash}` : 'VALIDER'}
        </span>
      </span>
    </Tap>
  );

  return glow ? (
    <BorderGlow borderRadius={24} glowRadius={32} glowIntensity={0.95} animated backgroundColor={C.ink} colors={[acc, C.honey, skill.c]}>
      {card}
    </BorderGlow>
  ) : card;
}

/** Carte de suggestion : la quête, la raison, un bouton d'ajout. */
function SuggestCard({ row, why, generated, onAdd, onOpen, full }: {
  row: { name: string; px: number; diff: Difficulty; description: string };
  why: string; generated?: boolean; onAdd: () => void; onOpen: () => void; full: boolean;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 9, border: '1px solid rgba(11,11,12,.06)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ font: `800 16px/1.2 ${F.display}`, color: C.ink, letterSpacing: '-.02em', textWrap: 'pretty' }}>{row.name}</span>
        <span style={{ font: `700 11px ${F.mono}`, color: C.ink, whiteSpace: 'nowrap' }}>+{row.px}</span>
      </div>
      <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(11,11,12,.6)', textWrap: 'pretty' }}>{row.description}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <DiffBadge diff={row.diff} size="sm" />
        {generated ? (
          <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.45)', border: '1px dashed rgba(11,11,12,.25)', borderRadius: 7, padding: '4px 7px' }}>COMPOSÉE</span>
        ) : null}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(11,11,12,.04)', borderRadius: 12, padding: '9px 11px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" style={{ flex: 'none', opacity: .5 }}><path d="M12 3l2.2 6.2H21l-5.4 4 2 6.3L12 15.8 6.4 19.5l2-6.3L3 9.2h6.8z" /></svg>
        <span style={{ font: `400 11px/1.4 ${F.body}`, color: 'rgba(11,11,12,.6)', textWrap: 'pretty' }}>{why}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Tap
          onTap={onAdd} haptic="soft"
          style={{ flex: 1, minHeight: 44, borderRadius: 13, background: C.ink, color: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 12px ${F.display}`, letterSpacing: '-.01em' }}
        >
          {full ? 'REMPLACER UNE QUÊTE' : 'AJOUTER'}
        </Tap>
        <Tap
          onTap={onOpen} haptic="soft"
          style={{ flex: 'none', minHeight: 44, padding: '0 14px', borderRadius: 13, background: 'rgba(11,11,12,.06)', display: 'flex', alignItems: 'center', font: `700 9.5px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.6)' }}
        >
          VOIR TOUT
        </Tap>
      </div>
    </div>
  );
}

/** Ligne du catalogue : consultable et ajoutable, jamais verrouillée. */
function CatalogLine({ row, skillC, onAdd, onRemove, full }: {
  row: QuestRow; skillC: string; onAdd: () => void; onRemove: () => void; full: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: row.done ? 'transparent' : '#fff', borderRadius: 16, border: `1px solid ${row.done ? 'rgba(11,11,12,.07)' : 'transparent'}`, opacity: row.done ? .6 : 1 }}>
      <Tap onTap={() => setOpen((v) => !v)} haptic="soft" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px' }}>
        <span
          style={{
            width: 26, height: 26, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: row.done ? skillC : row.active ? C.lime : 'rgba(11,11,12,.07)'
          }}
        >
          {row.done ? <Check /> : row.major ? <Star /> : row.active ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill={C.ink}><path d="M7 4l13 8-13 8z" /></svg>
          ) : null}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ font: `700 13.5px ${F.body}`, color: C.ink, textDecoration: row.done ? 'line-through' : 'none', textWrap: 'pretty' }}>{row.name}</span>
            <span style={{ font: `700 11px ${F.mono}`, color: row.done ? 'rgba(11,11,12,.4)' : C.ink, whiteSpace: 'nowrap' }}>+{row.px}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, flexWrap: 'wrap' }}>
            {row.major ? (
              <span style={{ font: `700 8px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: C.honey, borderRadius: 6, padding: '3px 6px' }}>MAJEUR</span>
            ) : null}
            <span style={{ font: `400 11px ${F.body}`, color: 'rgba(11,11,12,.5)' }}>
              {row.done ? 'Validé' : row.active ? 'En cours' : isInstant(row.rarity) ? 'Un tap suffit' : 'Preuve à l’appui'}
            </span>
          </span>
        </span>
      </Tap>
      {open ? (
        <div style={{ padding: '0 13px 13px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {row.description ? (
            <span style={{ font: `400 11.5px/1.5 ${F.body}`, color: 'rgba(11,11,12,.62)', textWrap: 'pretty' }}>{row.description}</span>
          ) : null}
          {!row.done ? (
            row.active ? (
              <Tap
                onTap={onRemove} haptic="soft"
                style={{ minHeight: 40, borderRadius: 12, background: 'rgba(11,11,12,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.6)' }}
              >
                RETIRER DE MES QUÊTES
              </Tap>
            ) : (
              <Tap
                onTap={onAdd} haptic="soft"
                style={{ minHeight: 40, borderRadius: 12, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 11.5px ${F.display}`, color: C.lime, letterSpacing: '-.01em' }}
              >
                {full ? 'REMPLACER UNE QUÊTE EN COURS' : 'AJOUTER À MES QUÊTES EN COURS'}
              </Tap>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function Quests({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const startId = s.startSkill || SKILLS[0].id;
  const [skillId, setSkillIdRaw] = useState<string>(() => {
    try {
      const v = localStorage.getItem(LAST_SKILL_KEY);
      if (v && (v === 'perso' || SKILLS.some((k) => k.id === v))) return v;
    } catch { /* ignoré */ }
    return 'perso';
  });
  const setSkillId = (id: string) => {
    setSkillIdRaw(id);
    try { localStorage.setItem(LAST_SKILL_KEY, id); } catch { /* ignoré */ }
  };
  const [sub, setSub] = useState<Sub>('board');
  const [help, setHelp] = useState(false);
  const [flash, setFlash] = useState<{ id: string; px: number } | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  /* Catalogue : recherche, masquage des validées, sections repliées sauf la première */
  const [query, setQuery] = useState('');
  const [hideDone, setHideDone] = useState(false);
  const [openSecs, setOpenSecs] = useState<Record<string, boolean>>({});
  /** Quête à caser alors que les cinq places sont prises. */
  const [swapIn, setSwapIn] = useState<QuestRow | null>(null);
  /** Graine des suggestions : ne change que sur repioche explicite. */
  const [seed, setSeed] = useState(1);

  const sk = skillById(skillId);
  const rank = skillRank(s, sk.id);
  const next = skillNextRank(s, sk.id);
  const isPerso = sk.id === 'perso';
  const persoName = (s.profile as any).persoName || 'Perso';

  const actives = activeRows(s, sk.id);
  const mine = customActiveRows(s, sk.id);
  const full = actives.length >= MAX_ACTIVE_QUESTS;
  const prog = catalogProgress(s, sk.id);
  const sections = sectionsOf(s, sk.id);
  const rows = questRows(s, sk.id);

  const suggestions = useMemo(
    () => suggest({ skill: sk.id, done: doneIds(s, sk.id), active: activeIds(s, sk.id), px: pxOf(s, sk.id), seed, n: 3 }),
    [sk.id, s.doneQuests, s.activeQuests, s.progress, seed]
  );

  const P = isPerso
    ? { sheet: C.ink, card: C.night, line: C.line, tx: '#fff', sub: 'rgba(255,255,255,.55)', soft: 'rgba(255,255,255,.06)', tabOn: C.lime, tabOnTx: C.ink, tabOff: 'rgba(255,255,255,.07)', tabOffTx: 'rgba(255,255,255,.55)' }
    : { sheet: C.paper, card: '#fff', line: 'transparent', tx: C.ink, sub: 'rgba(11,11,12,.55)', soft: 'rgba(11,11,12,.05)', tabOn: C.ink, tabOnTx: C.paper, tabOff: 'rgba(11,11,12,.06)', tabOffTx: 'rgba(11,11,12,.55)' };

  /* --- Actions --- */

  const add = (row: QuestRow) => {
    if (full) { setSwapIn(row); return; }
    d({ t: 'ADD_ACTIVE_QUEST', skill: sk.id, id: row.id });
    buzz('soft');
  };
  const remove = (row: QuestRow) => d({ t: 'REMOVE_ACTIVE_QUEST', skill: sk.id, id: row.id });

  const act = (row: QuestRow) => {
    if (row.done) return;
    if (!isInstant(row.rarity)) {
      nav.open('validate', { skill: sk.id, ix: row.ix, name: row.name, px: row.px, rarity: row.rarity, qid: row.custom ? undefined : row.id });
      return;
    }
    const chain = s.combo.last && Date.now() - s.combo.last < COMBO_WINDOW ? s.combo.n + 1 : 1;
    setFlash({ id: row.id, px: Math.round(row.px * (s.onFire ? 2 : 1) * (1 + comboBonus(chain))) });
    buzz(COMBO_STEPS.includes(chain) ? 'milestone' : 'success');
    sfx.check();
    window.setTimeout(() => d({
      t: 'VALIDATE', skill: sk.id, ix: row.ix, name: row.name, px: row.px,
      rarity: row.rarity, qid: row.custom ? undefined : row.id
    }), 300);
    window.setTimeout(() => setFlash(null), 1100);
  };

  /* Recherche : elle traverse toutes les sections et les déplie. */
  const q = query.trim().toLowerCase();
  const filtered = (list: QuestRow[]) => list
    .filter((r) => (hideDone ? !r.done : true))
    .filter((r) => (q ? (r.name + ' ' + r.description).toLowerCase().includes(q) : true));
  const nFound = q ? filtered(rows).length : 0;

  return (
    <div>
      <div style={{ padding: '16px 0 0' }}>
        <div style={{ padding: '0 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>MES COMPÉTENCES</Kicker>
          <Tap onTap={() => nav.open('discover')} style={{ font: `700 10px ${F.mono}`, color: C.lime, letterSpacing: '.1em', minHeight: 32, display: 'flex', alignItems: 'center' }}>+ DÉCOUVRIR</Tap>
        </div>

        <SkillWheel currentId={startId} value={skillId} onChange={setSkillId} />

        <div style={{ padding: '14px 22px 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {isPerso ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', border: `1px solid ${sk.c}44`, borderRadius: 16, padding: '8px 12px 8px 14px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: sk.c, flex: 'none' }} />
                <span style={{ minWidth: 0, textAlign: 'left' }}>
                  <span style={{ display: 'block', font: `500 8px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)' }}>MON ESPACE</span>
                  <input
                    value={persoName}
                    onChange={(e) => d({ t: 'SET_PROFILE', patch: { persoName: e.target.value.slice(0, 22) } })}
                    aria-label="Nom de mon espace perso"
                    style={{ display: 'block', width: Math.max(6, persoName.length + 1) + 'ch', maxWidth: 200, background: 'transparent', border: 'none', outline: 'none', font: `800 17px/1.2 ${F.display}`, color: '#fff', letterSpacing: '-.02em', marginTop: 3, padding: 0 }}
                  />
                </span>
                <span style={{ width: 1, height: 26, background: 'rgba(255,255,255,.12)', flex: 'none' }} />
                <span style={{ font: `700 11px ${F.mono}`, color: sk.c, flex: 'none' }}>{pxOf(s, sk.id)} PX</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M4 20h4L20 8l-4-4L4 16z" /></svg>
              </span>
            ) : (
              <RankBadge rank={rank} skillName={`${sk.name} · ${pxOf(s, sk.id)} PX`} size="md" bg="rgba(255,255,255,.05)" />
            )}
          </div>
          <div style={{ display: 'inline-flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Tap
              onTap={() => nav.open('path', { skill: sk.id })}
              style={{ font: `700 10px ${F.mono}`, color: isPerso ? 'rgba(255,255,255,.7)' : C.ink, background: isPerso ? 'transparent' : sk.c, border: isPerso ? `1px solid ${sk.c}66` : 'none', padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em', minHeight: 36, display: 'flex', alignItems: 'center' }}
            >
              {isPerso ? 'TOUT VOIR' : 'VOIR LE CHEMIN'}
            </Tap>
            {s.onFire ? (
              <span style={{ font: `700 10px ${F.mono}`, color: '#fff', background: C.coral, padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em' }}>EN FEU · PX ×2</span>
            ) : (
              <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.16)', padding: '9px 14px', borderRadius: 99, letterSpacing: '.08em' }}>ÉNERGIE {s.energy}%</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: P.sheet, borderRadius: '34px 34px 0 0', marginTop: 18, padding: '20px 22px', paddingBottom: sub === 'board' && actives.length && !isPerso ? 86 : 26, minHeight: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {SUBS.map(([k, label]) => (
            <Tap
              key={k} onTap={() => setSub(k)} haptic="soft"
              style={{
                flex: 1, textAlign: 'center', font: `700 9.5px ${F.mono}`, letterSpacing: '.08em', padding: '11px 6px', borderRadius: 13, minHeight: 40,
                background: sub === k ? P.tabOn : P.tabOff, color: sub === k ? P.tabOnTx : P.tabOffTx
              }}
            >
              {label}
            </Tap>
          ))}
        </div>

        {sub === 'board' && isPerso ? (
          <PersoBoard onSettings={() => nav.go('profile')} />
        ) : null}

        {sub === 'board' && !isPerso && (
          <>
            <ComboBar n={s.combo.n} last={s.combo.last} best={s.combo.best} />

            {/* Rang de la compétence */}
            <div style={{ background: C.ink, borderRadius: 22, padding: '16px 17px', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', right: -60, top: -70, width: 180, height: 180, borderRadius: '50%', background: rank.c, opacity: .16 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative' }}>
                <RankIcon rank={rank} size={44} bg={C.ink} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(255,255,255,.45)' }}>RANG · {sk.name}</span>
                  <span style={{ display: 'block', font: `800 22px/1 ${F.display}`, color: rank.c, letterSpacing: '-.025em', marginTop: 5 }}>{rank.label}</span>
                </span>
                <span style={{ font: `700 10.5px ${F.mono}`, color: 'rgba(255,255,255,.6)', flex: 'none' }}>
                  {isFinite(rank.pxNeed) ? `${rank.pxIn}/${rank.pxNeed}` : 'MAX'}
                </span>
              </div>
              <div style={{ position: 'relative', marginTop: 14, height: 12, borderRadius: 99, background: 'rgba(255,255,255,.09)', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: rank.pct + '%', borderRadius: 99, background: `linear-gradient(90deg,${rank.c}, #fff)`, transition: 'width .8s cubic-bezier(.2,1,.3,1)' }} />
                <span style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 13px, rgba(11,11,12,.55) 13px 15px)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, font: `500 9px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(255,255,255,.42)', marginTop: 10, position: 'relative' }}>
                <span>{prog.done}/{prog.total} QUÊTES</span>
                <span>{next ? 'SUIVANT · ' + next.label : 'RANG MAXIMAL'}</span>
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 13, background: 'rgba(255,255,255,.05)', borderRadius: 14, padding: '11px 12px', position: 'relative' }}>
                <span style={{ width: 3, borderRadius: 99, background: rank.c, flex: 'none' }} />
                <span style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.7)', textWrap: 'pretty' }}>{TIER_TIPS[rank.tier]}</span>
              </div>
            </div>

            {/* --- Quêtes en cours --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Kicker dark>QUÊTES EN COURS · {actives.length}/{MAX_ACTIVE_QUESTS}</Kicker>
              {full ? (
                <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.45)' }}>COMPLET</span>
              ) : null}
            </div>

            {actives.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {actives.map((r, i) => (
                  <ActiveQuest
                    key={r.id} row={r} skill={sk} px={s.onFire ? r.px * 2 : r.px}
                    combo={s.combo.n} glow={i === 0}
                    flash={flash?.id === r.id ? flash.px : null}
                    onTap={() => act(r)} onDrop={() => remove(r)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 20, padding: '16px 17px' }}>
                <div style={{ font: `700 13.5px ${F.body}`, color: C.ink }}>Aucune quête en cours</div>
                <div style={{ font: `400 11.5px/1.5 ${F.body}`, color: 'rgba(11,11,12,.6)', marginTop: 6, textWrap: 'pretty' }}>
                  Choisis jusqu’à {MAX_ACTIVE_QUESTS} quêtes dans le catalogue ci-dessous, ou pars d’une suggestion.
                </div>
              </div>
            )}

            {/* --- Quêtes perso ajoutées à la main : hors quota --- */}
            {mine.length ? (
              <>
                <Kicker dark>AJOUTÉES À LA MAIN · {mine.length}</Kicker>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {mine.map((r) => (
                    <ActiveQuest
                      key={r.id} row={r} skill={sk} px={s.onFire ? r.px * 2 : r.px}
                      combo={s.combo.n} glow={false}
                      flash={flash?.id === r.id ? flash.px : null}
                      onTap={() => act(r)}
                      onDrop={() => { if (confirm('Retirer « ' + r.name + ' » ?')) d({ t: 'DEL_QUEST', id: r.id }); }}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {/* --- Suggestions --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Kicker dark>SUGGESTIONS POUR TOI</Kicker>
              <Tap
                onTap={() => setSeed((v) => v + 1)} haptic="soft"
                style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 32, padding: '0 10px', borderRadius: 9, background: 'rgba(11,11,12,.06)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" /></svg>
                <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.ink }}>REPIOCHER</span>
              </Tap>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {suggestions.map((sg) => (
                <SuggestCard
                  key={sg.quest.id} row={sg.quest} why={sg.why} generated={sg.generated} full={full}
                  onAdd={() => {
                    const row = rows.find((r) => r.id === sg.quest.id);
                    if (row) add(row);
                    else d({ t: 'ADD_QUEST', skill: sk.id, name: sg.quest.name, px: sg.quest.px, desc: sg.quest.description, diff: sg.quest.diff });
                  }}
                  onOpen={() => nav.open('discover', { skill: sk.id })}
                />
              ))}
            </div>

            {/* --- Catalogue complet --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Kicker dark>CATALOGUE · {prog.total}</Kicker>
              <Tap
                onTap={() => setHideDone((v) => !v)} haptic="soft"
                style={{ display: 'flex', alignItems: 'center', gap: 7, minHeight: 32, padding: '0 10px', borderRadius: 9, background: hideDone ? C.ink : 'rgba(11,11,12,.06)' }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 4, background: hideDone ? C.lime : 'transparent', border: `1.5px solid ${hideDone ? C.lime : 'rgba(11,11,12,.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  {hideDone ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg> : null}
                </span>
                <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: hideDone ? C.lime : C.ink }}>MASQUER LES VALIDÉES</span>
              </Tap>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', borderRadius: 14, padding: '0 13px', minHeight: 46 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(11,11,12,.4)" strokeWidth="2.2" style={{ flex: 'none' }}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={`Chercher dans ${prog.total} quêtes ${sk.name.toLowerCase()}`}
                aria-label="Chercher une quête"
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', font: `400 13px ${F.body}`, color: C.ink, padding: '12px 0' }}
              />
              {query ? (
                <Tap onTap={() => setQuery('')} aria-label="Effacer" style={{ width: 30, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(11,11,12,.4)" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </Tap>
              ) : null}
            </div>
            {q ? (
              <div style={{ font: `500 10px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.45)' }}>{nFound} RÉSULTAT{nFound > 1 ? 'S' : ''}</div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sections.map((sec, si) => {
                const list = filtered(sec.rows);
                if (!list.length) return null;
                const opened = q ? true : (openSecs[sec.diff] ?? si === 0);
                const dn = sec.rows.filter((r) => r.done).length;
                const D = DIFFS[sec.diff];
                return (
                  <div key={sec.diff} style={{ background: 'rgba(11,11,12,.04)', borderRadius: 20, overflow: 'hidden' }}>
                    <Tap
                      onTap={() => setOpenSecs((o) => ({ ...o, [sec.diff]: !opened }))} haptic="soft"
                      style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 15px', minHeight: 54 }}
                    >
                      <span style={{ display: 'flex', gap: 2, flex: 'none' }}>
                        {[0, 1, 2, 3].map((b) => (
                          <span key={b} style={{ width: 4, height: 14, borderRadius: 2, background: b < D.blocks ? D.c : 'rgba(11,11,12,.14)' }} />
                        ))}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', font: `800 14px ${F.display}`, color: C.ink, letterSpacing: '-.01em' }}>{D.label}</span>
                        <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(11,11,12,.45)', marginTop: 3 }}>
                          {dn}/{sec.rows.length} VALIDÉES
                        </span>
                      </span>
                      <span style={{ font: `700 14px ${F.mono}`, color: 'rgba(11,11,12,.4)', flex: 'none' }}>{opened ? '−' : '+'}</span>
                    </Tap>
                    {opened ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '0 12px 12px' }}>
                        {list.map((r) => (
                          <CatalogLine
                            key={r.id} row={r} skillC={sk.c} full={full}
                            onAdd={() => add(r)} onRemove={() => remove(r)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Règle de validation */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '14px 16px' }}>
              <Tap onTap={() => { setHelp((h) => !h); if (!s.seen.questHelp) d({ t: 'SEEN', key: 'questHelp' }); }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: 99, background: C.ink, color: C.paper, font: `800 13px ${F.display}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>?</span>
                <span style={{ flex: 1, font: `700 13px ${F.body}`, color: C.ink }}>Valider une quête, ça veut dire quoi ?</span>
                <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(11,11,12,.4)' }}>{help ? '−' : '+'}</span>
              </Tap>
              {help || !s.seen.questHelp ? (
                <div style={{ font: `400 12px/1.5 ${F.body}`, color: 'rgba(11,11,12,.65)', marginTop: 10, textWrap: 'pretty' }}>
                  <b style={{ fontWeight: 700, color: C.ink }}>Quête simple (commune ou rare)</b> : tu l’as faite, tu tapes une fois. Les PX tombent tout de suite.<br />
                  <b style={{ fontWeight: 700, color: C.ink }}>Palier important (légendaire)</b> : tu coches les étapes et tu ajoutes une preuve photo. C’est ce qui déclenche une carte partageable.<br />
                  Tu gardes {MAX_ACTIVE_QUESTS} quêtes en cours au maximum : le reste du catalogue reste consultable, sans verrou.
                </div>
              ) : null}
            </div>

            <Tap onTap={() => nav.open('newquest', { skill: sk.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.ink, borderRadius: 20, padding: '15px 17px', minHeight: 56 }}>
              <span style={{ width: 28, height: 28, borderRadius: 10, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: '#fff' }}>Créer une quête perso</span>
                <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Nom, effort, moment de la journée</span>
              </span>
            </Tap>
          </>
        )}

        {sub === 'journal' && (() => {
          const list = s.journal.filter((e) => e.skill === sk.id).slice().sort((a, b) => b.when - a.when);
          const photos = list.reduce((n, e) => n + e.photos.length, 0);
          return (
            <>
              <RetroCalendar skill={sk.id} dark={isPerso} />

              <div style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: 20, padding: '15px 17px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Kicker dark={!isPerso}>JOURNAL · {(isPerso ? persoName : sk.name).toUpperCase()}</Kicker>
                  <span style={{ font: `700 11px ${F.mono}`, color: P.tx }}>{list.length} ENTRÉES</span>
                </div>
                <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: P.sub, marginTop: 9, textWrap: 'pretty' }}>
                  Chaque quête validée ouvre une entrée à compléter : photos, note, ressenti, durée. {photos ? `${photos} photos enregistrées.` : 'Tout reste sur cet appareil.'}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Tap
                    onTap={() => setEntry(newEntry(sk.id))} haptic="soft"
                    style={{ flex: 1, minHeight: 46, borderRadius: 14, background: isPerso ? C.lime : C.ink, color: isPerso ? C.ink : C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isPerso ? C.ink : C.lime} strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                    <span style={{ font: `800 13px ${F.display}`, letterSpacing: '-.01em' }}>NOUVELLE ENTRÉE</span>
                  </Tap>
                  <Tap
                    onTap={() => nav.open('journal')}
                    style={{ flex: 'none', minHeight: 46, padding: '0 16px', borderRadius: 14, background: P.soft, display: 'flex', alignItems: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', color: P.sub }}
                  >
                    TOUT VOIR
                  </Tap>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {list.map((e) => <JournalCard key={e.id} e={e} onTap={() => setEntry(e)} />)}
                {!list.length ? (
                  <div style={{ font: `400 12.5px/1.5 ${F.body}`, color: P.sub, padding: '4px 2px', textWrap: 'pretty' }}>
                    Rien pour l’instant sur {(isPerso ? persoName : sk.name).toLowerCase()}. Valide une quête, ou crée une entrée libre.
                  </div>
                ) : null}
              </div>
            </>
          );
        })()}

        {sub === 'coll' && (
          <>
            <Kicker dark={!isPerso}>TITRES</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(TITLES[sk.id] || []).map(([name, req], i) => {
                const lvl = levelOf(s, sk.id);
                const got = i <= Math.min(3, Math.floor(lvl / 2)) && lvl > 0;
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: got ? P.card : P.soft, border: `1px solid ${got ? P.line : 'transparent'}`, borderRadius: 18, padding: '13px 15px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: got ? sk.c : P.soft, flex: 'none' }} />
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: got ? P.tx : P.sub }}>{name}</span>
                      <span style={{ display: 'block', font: `400 11px ${F.body}`, color: P.sub, marginTop: 2 }}>{req}</span>
                    </span>
                    <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: got ? C.ink : P.sub, background: got ? C.lime : P.soft, padding: '5px 9px', borderRadius: 8 }}>{got ? 'OBTENU' : 'À FAIRE'}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
              <Kicker dark={!isPerso}>BADGES</Kicker>
              <span style={{ font: `500 10px ${F.mono}`, color: P.sub }}>{s.badges.filter((b) => b.startsWith(sk.id)).length}/6</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {(BADGES[sk.id] || []).map(([label, glyph], i) => {
                const got = s.badges.includes(sk.id + ':' + i);
                return (
                  <div key={label} style={{ background: got ? BADGE_C[i] : P.soft, borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', font: `800 22px ${F.display}`, color: got ? C.ink : P.sub }}>{glyph}</span>
                    <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.06em', color: got ? 'rgba(11,11,12,.7)' : P.sub, marginTop: 6 }}>{label.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Action au pouce : la première quête en cours */}
      {sub === 'board' && !isPerso && actives.length ? (
        <Tap
          onTap={() => act(actives[0])}
          haptic="soft"
          style={{
            position: 'fixed', left: 18, right: 18, bottom: 'calc(var(--dock-h) + 12px)', zIndex: 30,
            background: C.lime, color: C.ink, borderRadius: 20, padding: '15px 18px', minHeight: 58,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 20px 40px -18px rgba(0,0,0,.8)'
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: `500 9px ${F.mono}`, letterSpacing: '.14em', opacity: .6 }}>
              EN COURS · {actives.length}/{MAX_ACTIVE_QUESTS}
              {s.combo.n > 1 ? <span style={{ background: C.ink, color: C.lime, borderRadius: 99, padding: '3px 7px', opacity: 1, letterSpacing: '.06em' }}>COMBO ×{s.combo.n}</span> : null}
            </span>
            <span style={{ display: 'block', font: `800 17px ${F.display}`, letterSpacing: '-.01em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{actives[0].name}</span>
          </span>
          <span style={{ font: `700 12px ${F.body}`, background: C.ink, color: C.lime, padding: '12px 18px', borderRadius: 99, flex: 'none' }}>VALIDER</span>
        </Tap>
      ) : null}

      {/* Remplacement : les cinq places sont prises, on choisit qui sort */}
      {swapIn ? (
        <div
          onClick={() => setSwapIn(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(6,6,8,.72)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', background: C.paper, borderRadius: '28px 28px 0 0', padding: '22px 20px calc(var(--dock-h) + 20px)', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <Kicker dark>{MAX_ACTIVE_QUESTS} QUÊTES EN COURS</Kicker>
            <div style={{ font: `800 19px/1.25 ${F.display}`, color: C.ink, letterSpacing: '-.02em', textWrap: 'pretty' }}>
              Laquelle veux-tu remplacer par « {swapIn.name} » ?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actives.map((r) => (
                <Tap
                  key={r.id}
                  onTap={() => { d({ t: 'SWAP_ACTIVE_QUEST', skill: sk.id, out: r.id, in: swapIn.id }); setSwapIn(null); }}
                  haptic="soft"
                  style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 16, padding: '13px 14px', minHeight: 54 }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: C.ink }}>{r.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
                      <DiffBadge diff={r.diff} size="sm" />
                      <span style={{ font: `400 11px ${F.body}`, color: 'rgba(11,11,12,.5)' }}>+{r.px} PX</span>
                    </span>
                  </span>
                  <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: C.lime, borderRadius: 8, padding: '6px 9px', flex: 'none' }}>REMPLACER</span>
                </Tap>
              ))}
            </div>
            <Tap
              onTap={() => setSwapIn(null)}
              style={{ minHeight: 46, borderRadius: 14, background: 'rgba(11,11,12,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.12em', color: 'rgba(11,11,12,.6)' }}
            >
              GARDER MES QUÊTES ACTUELLES
            </Tap>
          </div>
        </div>
      ) : null}

      {entry ? <JournalEditor entry={entry} onClose={() => setEntry(null)} /> : null}
    </div>
  );
}
