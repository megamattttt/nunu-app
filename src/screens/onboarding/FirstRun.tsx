import React from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import AvatarStudio from '../routes/AvatarStudio';
import Onboarding from '../Onboarding';
import Guide from './Guide';
import FirstQuest from './FirstQuest';

const STEPS = ['AVATAR', 'GUIDE', 'COMPÉTENCE', 'PREMIÈRE QUÊTE'];

/** Fil d'Ariane fin, commun aux étapes qui n'ont pas leur propre progression. */
function Steps({ i }: { i: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'calc(var(--safe-top) + 14px) 22px 0' }}>
      <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.18em', color: 'rgba(255,255,255,.4)', flex: 'none' }}>
        ÉTAPE {i + 1}/4 · {STEPS[i]}
      </span>
      <span style={{ flex: 1, display: 'flex', gap: 4 }}>
        {STEPS.map((_, n) => (
          <span key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= i ? C.lime : 'rgba(255,255,255,.14)', transition: 'background .3s ease' }} />
        ))}
      </span>
    </div>
  );
}

/**
 * Parcours obligatoire de première connexion, joué une seule fois :
 * avatar → guide → première compétence → première quête réelle.
 */
export default function FirstRun() {
  const { s, d } = useGame();
  const step = Math.max(0, Math.min(3, s.flow));

  if (step === 1) return <Guide onDone={() => d({ t: 'FLOW', step: 2 })} />;
  // L'écran de choix de compétence est repris tel quel, en plein écran.
  if (step === 2) return <Onboarding />;
  if (step === 3) return <FirstQuest onDone={() => d({ t: 'FINISH_FLOW' })} />;

  return (
    <div style={{ minHeight: '100dvh', background: C.ink, display: 'flex', flexDirection: 'column', ['--dock-space' as any]: 'calc(var(--safe-bottom) + 14px)' }}>
      <Steps i={step} />
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ font: `800 30px/1.04 ${F.display}`, color: '#fff', letterSpacing: '-.03em' }}>
          COMPOSE TON<br />PERSONNAGE.
        </div>
        <div style={{ font: `400 13px/1.5 ${F.body}`, color: 'rgba(255,255,255,.55)', marginTop: 10, maxWidth: 340, textWrap: 'pretty' }}>
          Il te suivra partout dans l’app. Tout reste modifiable plus tard depuis le Studio Avatar.
        </div>
      </div>
      <AvatarStudio onDone={() => d({ t: 'FLOW', step: 1 })} ctaLabel="CONTINUER" hideBack />
    </div>
  );
}
