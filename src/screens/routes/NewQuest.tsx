import React, { useMemo, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { NQ_WHEN, DIFFS, DIFF_LIST, suggestQuest, type Difficulty } from '../../data/quests';
import { SKILLS } from '../../data/skills';
import DiffBadge from '../../components/DiffBadge';
import { RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

/** PX proposés par difficulté — point de départ, ajustable au curseur. */
const PX_BY_DIFF: Record<Difficulty, number[]> = {
  facile: [5, 10, 15],
  moyen: [20, 30, 40],
  difficile: [50, 60, 80],
  legendaire: [100, 120, 150]
};

export default function NewQuest({ nav }: { nav: Nav }) {
  const { d } = useGame();
  const preset = nav.route?.data?.skill || 'couture';
  const [skill, setSkill] = useState(preset);
  const [name, setName] = useState('');
  const [diff, setDiff] = useState<Difficulty>('moyen');
  const [px, setPx] = useState(30);
  const [when, setWhen] = useState(0);
  const [link, setLink] = useState('');
  const [touched, setTouched] = useState(false);

  // Suggestion automatique : mots-clés du nom → difficulté et PX.
  const hint = useMemo(() => suggestQuest(name, skill), [name, skill]);
  const applied = hint && !touched && hint.diff === diff && hint.px === px;

  const applyHint = () => {
    if (!hint) return;
    setDiff(hint.diff); setPx(hint.px); setTouched(true);
  };

  const pick = (v: Difficulty) => {
    setDiff(v); setTouched(true);
    if (!PX_BY_DIFF[v].includes(px)) setPx(PX_BY_DIFF[v][1]);
  };

  const create = () => {
    if (!name.trim()) return;
    const url = link.trim();
    d({
      t: 'ADD_QUEST', skill, name: name.trim(), px, when, diff,
      rarity: diff === 'legendaire' ? 'legendaire' : diff === 'difficile' ? 'rare' : 'commune',
      link: url ? (/^https?:\/\//i.test(url) ? url : 'https://' + url) : undefined
    });
    nav.back();
  };

  const field: React.CSSProperties = { background: C.night, borderRadius: 20, padding: '14px 16px' };
  const label: React.CSSProperties = { font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' };

  return (
    <div style={{ padding: '10px 22px 30px' }}>
      <RouteHead title="NOUVELLE QUÊTE" sub="Elle s’ajoute à ton plateau, triée par difficulté" onBack={nav.back} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
        <div style={field}>
          <div style={label}>NOM DE LA QUÊTE</div>
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Réparer la fermeture du sac"
            autoFocus
            style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '8px 0 0' }}
          />
        </div>

        {/* Suggestion automatique */}
        {hint ? (
          <Tap
            onTap={applyHint} haptic="soft"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, background: applied ? 'rgba(198,242,78,.1)' : C.night,
              border: `1px solid ${applied ? C.lime + '66' : 'rgba(255,255,255,.1)'}`, borderRadius: 20, padding: '13px 15px', minHeight: 58
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', ...label }}>SUGGESTION</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
                <DiffBadge diff={hint.diff} size="sm" />
                <span style={{ font: `700 11px ${F.mono}`, color: C.lime }}>+{hint.px} PX</span>
                <span style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)' }}>{hint.why}</span>
              </span>
            </span>
            <span style={{ font: `700 9.5px ${F.mono}`, letterSpacing: '.1em', color: applied ? C.lime : 'rgba(255,255,255,.6)', flex: 'none' }}>
              {applied ? 'APPLIQUÉ' : 'APPLIQUER'}
            </span>
          </Tap>
        ) : null}

        <div style={field}>
          <div style={label}>COMPÉTENCE</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 11 }}>
            {SKILLS.map((k) => (
              <Tap
                key={k.id} onTap={() => setSkill(k.id)} haptic="soft"
                style={{ font: `700 11px ${F.body}`, padding: '10px 13px', borderRadius: 12, minHeight: 40, display: 'flex', alignItems: 'center', background: skill === k.id ? k.c : 'rgba(255,255,255,.07)', color: skill === k.id ? k.txt : 'rgba(255,255,255,.7)' }}
              >
                {k.name}
              </Tap>
            ))}
          </div>
        </div>

        <div style={field}>
          <div style={label}>DIFFICULTÉ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 7, marginTop: 11 }}>
            {DIFF_LIST.map((v) => {
              const on = diff === v;
              return (
                <Tap
                  key={v} onTap={() => pick(v)} haptic="soft"
                  style={{
                    minHeight: 52, borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
                    background: on ? DIFFS[v].c : 'rgba(255,255,255,.07)', color: on ? DIFFS[v].txt : 'rgba(255,255,255,.7)'
                  }}
                >
                  <span style={{ font: `800 13px ${F.display}`, letterSpacing: '-.01em' }}>{DIFFS[v].label}</span>
                  <span style={{ display: 'flex', gap: 3 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} style={{ width: 14, height: 3, borderRadius: 99, background: on ? DIFFS[v].txt : '#fff', opacity: i < DIFFS[v].blocks ? (on ? .9 : .5) : (on ? .25 : .15) }} />
                    ))}
                  </span>
                </Tap>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.45)' }}>Récompense</span>
            {PX_BY_DIFF[diff].map((v) => (
              <Tap
                key={v} onTap={() => { setPx(v); setTouched(true); }} haptic="soft"
                style={{ font: `700 11px ${F.mono}`, padding: '9px 12px', borderRadius: 11, minHeight: 38, display: 'flex', alignItems: 'center', background: px === v ? C.lime : 'rgba(255,255,255,.07)', color: px === v ? C.ink : 'rgba(255,255,255,.7)' }}
              >
                +{v} PX
              </Tap>
            ))}
          </div>
        </div>

        <div style={field}>
          <div style={label}>MOMENT DE LA JOURNÉE</div>
          <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
            {NQ_WHEN.map((lbl, i) => (
              <Tap key={lbl} onTap={() => setWhen(i)} haptic="soft" style={{ flex: 1, textAlign: 'center', font: `700 11.5px ${F.body}`, padding: '12px 6px', borderRadius: 12, minHeight: 44, background: when === i ? C.sand : 'rgba(255,255,255,.07)', color: when === i ? C.ink : 'rgba(255,255,255,.7)' }}>{lbl}</Tap>
            ))}
          </div>
        </div>

        <div style={field}>
          <div style={label}>LIEN OU TUTO (FACULTATIF)</div>
          <input
            value={link} onChange={(e) => setLink(e.target.value)} placeholder="youtube.com/watch?…"
            inputMode="url" autoCapitalize="off" autoCorrect="off"
            style={{ width: '100%', color: '#fff', font: `500 15px ${F.body}`, padding: '8px 0 0' }}
          />
          <div style={{ font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.4)', marginTop: 8 }}>
            Il reste attaché à la quête : un bouton « Voir le tuto » apparaît sur sa carte.
          </div>
        </div>

        <Tap
          onTap={create} haptic="success"
          style={{ background: name.trim() ? C.lime : 'rgba(255,255,255,.1)', color: name.trim() ? C.ink : 'rgba(255,255,255,.4)', borderRadius: 20, padding: '18px', textAlign: 'center', font: `800 17px ${F.display}`, letterSpacing: '-.01em', minHeight: 58 }}
        >
          AJOUTER AU PLATEAU
        </Tap>
      </div>
    </div>
  );
}
