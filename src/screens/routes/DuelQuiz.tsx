import React, { useEffect, useMemo, useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { QBANK } from '../../data/quiz';
import { skillById } from '../../data/skills';
import AvatarCut from '../../components/avatar/AvatarCut';
import { Tap } from '../../components/ui';
import { buzz } from '../../lib/haptics';
import { sfx } from '../../lib/sound';
import type { Nav } from '../../App';

const CLOCK = 10;

export default function DuelQuiz({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const q = nav.route?.data || {};
  const skill = q.skill || 'couture';
  const questions = useMemo(() => (QBANK[skill] || QBANK.couture).slice(0, 4), [skill]);

  const [ix, setIx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(CLOCK);
  const [over, setOver] = useState(false);
  const their = useMemo(() => 1 + Math.floor(Math.random() * 3), []);

  const cur = questions[ix];

  useEffect(() => {
    if (over || picked !== null) return;
    if (left <= 0) { answer(-1); return; }
    const id = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, picked, over]);

  const answer = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    const ok = n === cur[2];
    if (ok) { setScore((v) => v + 1); buzz('success'); sfx.validate(); } else { buzz('error'); sfx.error(); }
    window.setTimeout(() => {
      if (ix + 1 >= questions.length) { setOver(true); }
      else { setIx(ix + 1); setPicked(null); setLeft(CLOCK); }
    }, 900);
  };

  useEffect(() => {
    if (!over) return;
    const win = score >= their;
    d({ t: 'DUEL', id: q.id || 'flash', win, my: score, their });
    const id = window.setTimeout(() => nav.back(), 400);
    return () => window.clearTimeout(id);
  }, [over]);

  return (
    <div style={{ padding: '10px 22px 30px', minHeight: '80dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
        <span style={{ width: 44, height: 44, borderRadius: 14, overflow: 'hidden', flex: 'none' }}><AvatarCut who={q.who || 'lea'} crop="face" /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: `500 9px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(255,255,255,.45)' }}>DUEL · {skillById(skill).name}</span>
          <span style={{ display: 'block', font: `800 20px ${F.display}`, color: '#fff', letterSpacing: '-.01em', marginTop: 2 }}>{q.name || 'Léa Fontaine'}</span>
        </span>
        <Tap onTap={nav.back} style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.5)', padding: '12px', minHeight: 44, display: 'flex', alignItems: 'center' }}>QUITTER</Tap>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
        <span style={{ font: `800 15px ${F.mono}`, color: C.lime }}>{score}</span>
        <span style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: ((ix + (picked !== null ? 1 : 0)) / questions.length) * 100 + '%', background: C.lime, transition: 'width .3s ease' }} />
        </span>
        <span style={{ font: `700 15px ${F.mono}`, color: left <= 3 ? C.coral : '#fff', minWidth: 24, textAlign: 'right' }}>{left}</span>
      </div>

      {!over && cur ? (
        <>
          <div style={{ background: C.paper, borderRadius: 26, padding: '22px 20px', marginTop: 18 }}>
            <div style={{ font: `500 9.5px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(11,11,12,.5)' }}>QUESTION {ix + 1}/{questions.length}</div>
            <div style={{ font: `800 23px/1.2 ${F.display}`, color: C.ink, letterSpacing: '-.02em', marginTop: 10, textWrap: 'pretty' }}>{cur[0]}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
            {cur[1].map((opt: string, n: number) => {
              const isRight = n === cur[2];
              const show = picked !== null;
              const bg = show ? (isRight ? C.lime : n === picked ? C.coral : 'rgba(255,255,255,.06)') : 'rgba(255,255,255,.06)';
              const col = show && (isRight || n === picked) ? C.ink : '#fff';
              return (
                <Tap key={opt} onTap={() => answer(n)} sound={false} style={{ background: bg, color: col, borderRadius: 18, padding: '17px 18px', font: `700 14px ${F.body}`, minHeight: 58, display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,.08)' }}>
                  {opt}
                </Tap>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{ font: `800 34px ${F.display}`, color: '#fff', letterSpacing: '-.02em' }}>{score} — {their}</div>
          <div style={{ font: `400 13px ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 8 }}>Résultat enregistré…</div>
        </div>
      )}
    </div>
  );
}
