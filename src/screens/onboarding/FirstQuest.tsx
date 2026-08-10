import React from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { skillById } from '../../data/skills';
import { RARITY } from '../../data/quests';
import { currentQuest } from '../../state/selectors';
import { Tap, Check } from '../../components/ui';
import Logo from '../../components/Logo';

/**
 * Dernière étape du parcours : la vraie première quête générée par le choix
 * de compétence. Aucun contenu fictif — on lit le plateau réel.
 */
export default function FirstQuest({ onDone }: { onDone: () => void }) {
  const { s, d } = useGame();
  const skill = s.startSkill || 'perso';
  const q = currentQuest(s, skill);
  const sk = skillById(skill);

  if (!q) { onDone(); return null; }
  const rar = RARITY[q.rarity];

  const validate = () => {
    d({ t: 'VALIDATE', skill, ix: q.ix, name: q.name, px: q.px, rarity: q.rarity });
    onDone();
  };

  return (
    <div style={{ minHeight: '100dvh', background: C.ink, display: 'flex', flexDirection: 'column', padding: 'calc(var(--safe-top) + 18px) 22px calc(var(--safe-bottom) + 20px)' }}>
      <Logo size={26} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <div style={{ font: `500 9.5px ${F.mono}`, letterSpacing: '.22em', color: sk.c }}>DERNIÈRE ÉTAPE</div>
        <div style={{ font: `800 34px/1.02 ${F.display}`, color: '#fff', letterSpacing: '-.032em', marginTop: 10 }}>
          VOICI TA<br />PREMIÈRE QUÊTE.
        </div>
        <div style={{ font: `400 13.5px/1.55 ${F.body}`, color: 'rgba(255,255,255,.6)', marginTop: 12, textWrap: 'pretty' }}>
          Elle tient en une session. Valide-la quand c’est fait — ou tout de suite si tu l’as déjà faite aujourd’hui.
        </div>

        <div style={{ background: sk.c, borderRadius: 28, padding: '20px 22px 22px', marginTop: 24, color: sk.txt, position: 'relative', overflow: 'hidden', animation: 'nuPop .5s cubic-bezier(.2,1.2,.3,1)' }}>
          <span style={{ position: 'absolute', top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)', animation: 'nuShine 4s ease-in-out infinite' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.12em', color: C.ink, background: rar.c, padding: '5px 9px', borderRadius: 8 }}>{rar.label}</span>
            <span style={{ font: `700 12px ${F.mono}`, background: 'rgba(11,11,12,.16)', padding: '5px 11px', borderRadius: 99 }}>+{q.px} PX</span>
          </div>
          <div style={{ font: `800 26px/1.06 ${F.display}`, letterSpacing: '-.024em', marginTop: 14, position: 'relative' }}>{q.name}</div>
          <div style={{ font: `500 12px ${F.body}`, opacity: .62, marginTop: 10, position: 'relative' }}>{sk.name} · palier 1 du chemin</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
          {[
            'Un tap suffit : les PX tombent immédiatement.',
            'La jauge d’énergie se remplit à chaque validation.',
            'Les paliers suivants s’ouvrent au fur et à mesure.'
          ].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Check size={12} c={C.lime} w={3.4} />
              </span>
              <span style={{ font: `400 12.5px/1.4 ${F.body}`, color: 'rgba(255,255,255,.65)' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <Tap
        onTap={validate} haptic="levelup"
        style={{ background: C.lime, color: C.ink, borderRadius: 22, minHeight: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}
      >
        <span style={{ font: `800 17px ${F.display}`, letterSpacing: '-.01em' }}>VALIDER MA PREMIÈRE QUÊTE</span>
        <Check size={20} w={3.6} />
      </Tap>
      <Tap
        onTap={onDone} sound={false}
        style={{ textAlign: 'center', font: `700 10.5px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', padding: 14, minHeight: 44 }}
      >
        JE LA VALIDERAI PLUS TARD
      </Tap>
    </div>
  );
}
