import React, { useRef, useState } from 'react';
import { C, F } from '../../theme';
import { Tap } from '../../components/ui';
import Logo from '../../components/Logo';
import { buzz } from '../../lib/haptics';
import { sfx } from '../../lib/sound';

type Slide = {
  kicker: string; title: string; text: string; accent: string; ink: string;
  art: React.ReactNode;
};

const bar = (pct: number, c: string, track = 'rgba(11,11,12,.16)') => (
  <span style={{ display: 'block', height: 10, borderRadius: 99, background: track, overflow: 'hidden' }}>
    <span style={{ display: 'block', height: '100%', width: pct + '%', borderRadius: 99, background: c }} />
  </span>
);

const SLIDES: Slide[] = [
  {
    kicker: 'LE PRINCIPE',
    title: 'TU FAIS,\nTU VALIDES,\nTU MONTES.',
    text: 'NUNU ne note pas tes intentions. Chaque chose réellement faite se valide en un tap et rapporte des PX. C’est la seule monnaie de progression.',
    accent: C.lime, ink: C.ink,
    art: (
      <span style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {[['Couper le patron', '+12'], ['Première couture', '+18'], ['Finitions', '+25']].map(([n, px], i) => (
          <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, background: i === 0 ? '#fff' : 'rgba(255,255,255,.45)', borderRadius: 16, padding: '12px 14px' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? C.ink : 'rgba(11,11,12,.14)', flex: 'none' }} />
            <span style={{ flex: 1, font: `700 13px ${F.body}`, color: C.ink, opacity: i === 0 ? 1 : .5 }}>{n}</span>
            <span style={{ font: `700 11px ${F.mono}`, color: C.ink, opacity: i === 0 ? 1 : .4 }}>{px}</span>
          </span>
        ))}
      </span>
    )
  },
  {
    kicker: 'LES RANGS',
    title: 'CHAQUE\nCOMPÉTENCE\nA SON RANG.',
    text: 'Fer, Bronze, Argent, Or, Platine, Diamant, Maître, Challenger. Quatre divisions par rang. Tes PX dans une compétence décident du rang de cette compétence — pas des autres.',
    accent: C.honey, ink: C.ink,
    art: (
      <span style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {[['COUTURE', 'ARGENT II', 68, C.coral], ['COURSE', 'BRONZE IV', 31, C.violet], ['PHOTO', 'FER I', 12, C.sky]].map(([n, r, p, col]: any) => (
          <span key={n} style={{ display: 'block', background: 'rgba(255,255,255,.5)', borderRadius: 16, padding: '12px 14px' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
              <span style={{ font: `700 11px ${F.mono}`, color: C.ink, letterSpacing: '.1em' }}>{n}</span>
              <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(11,11,12,.55)' }}>{r}</span>
            </span>
            {bar(p, col)}
          </span>
        ))}
      </span>
    )
  },
  {
    kicker: 'LA JAUGE',
    title: 'REMPLIS\nLA JAUGE,\nPASSE EN FEU.',
    text: 'Ici la jauge ne se vide pas quand tu joues : elle se remplit. Pleine, tu passes en feu et tes PX sont doublés. Sans rien valider pendant 24 h, elle retombe à zéro.',
    accent: C.coral, ink: '#fff',
    art: (
      <span style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
        <span style={{ display: 'block', background: 'rgba(11,11,12,.28)', borderRadius: 18, padding: '14px 16px' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.6)', letterSpacing: '.16em' }}>ÉNERGIE</span>
            <span style={{ font: `700 10px ${F.mono}`, color: '#fff' }}>100 %</span>
          </span>
          {bar(100, C.honey, 'rgba(255,255,255,.2)')}
        </span>
        <span style={{ alignSelf: 'flex-start', font: `800 15px ${F.display}`, color: C.coral, background: '#fff', padding: '11px 18px', borderRadius: 99, letterSpacing: '-.01em' }}>EN FEU · PX ×2</span>
      </span>
    )
  },
  {
    kicker: 'LE COMBO',
    title: 'ENCHAÎNE\nDANS LA\nMÊME HEURE.',
    text: 'Deux validations à moins de trente minutes d’écart démarrent un combo. Plus la chaîne est longue, plus le bonus de PX grimpe. Elle se coupe si tu t’arrêtes.',
    accent: C.violet, ink: '#fff',
    art: (
      <span style={{ display: 'flex', alignItems: 'flex-end', gap: 9, width: '100%' }}>
        {[1, 2, 3, 5, 10].map((n, i) => (
          <span key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.75)' }}>×{n}</span>
            <span style={{ width: '100%', height: 22 + i * 20, borderRadius: 12, background: i > 1 ? C.lime : 'rgba(255,255,255,.28)' }} />
          </span>
        ))}
      </span>
    )
  },
  {
    kicker: 'LES CARTES',
    title: 'GARDE UNE\nTRACE DE\nCE QUE TU FAIS.',
    text: 'Chaque palier majeur et chaque montée de rang génère une carte à ton nom, prête à être enregistrée ou envoyée. C’est la preuve, pas le trophée.',
    accent: C.sky, ink: C.ink,
    art: (
      <span style={{ display: 'block', width: '100%', background: C.ink, borderRadius: 22, padding: '22px 20px' }}>
        <Logo size={26} />
        <span style={{ display: 'block', font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.18em', marginTop: 18 }}>NOUVEAU RANG</span>
        <span style={{ display: 'block', font: `800 30px/1 ${F.display}`, color: '#fff', letterSpacing: '-.03em', marginTop: 7 }}>ARGENT II</span>
        <span style={{ display: 'block', font: `700 11px ${F.mono}`, color: C.lime, marginTop: 12 }}>@toi · COUTURE</span>
      </span>
    )
  }
];

/**
 * Guide de démarrage : plusieurs slides, navigation au swipe ou aux boutons.
 * Utilisé dans le parcours de première connexion, et rejouable depuis le profil.
 */
export default function Guide({ onDone, onQuit }: { onDone: () => void; onQuit?: () => void }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const x0 = useRef<number | null>(null);
  const sl = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const move = (n: number) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, n));
    if (next === i) return;
    setDir(next > i ? 1 : -1);
    setI(next);
    buzz('swipe'); sfx.swipe();
  };

  return (
    <div
      style={{ minHeight: '100dvh', background: C.ink, display: 'flex', flexDirection: 'column', padding: 'calc(var(--safe-top) + 16px) 22px calc(var(--safe-bottom) + 20px)', overflow: 'hidden' }}
      onPointerDown={(e) => { x0.current = e.clientX; }}
      onPointerUp={(e) => {
        if (x0.current === null) return;
        const dx = e.clientX - x0.current;
        x0.current = null;
        if (Math.abs(dx) > 46) move(i + (dx < 0 ? 1 : -1));
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Logo size={26} />
        <span style={{ flex: 1, display: 'flex', gap: 5 }}>
          {SLIDES.map((_, n) => (
            <span key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= i ? sl.accent : 'rgba(255,255,255,.16)', transition: 'background .3s ease' }} />
          ))}
        </span>
        {onQuit ? (
          <Tap onTap={onQuit} style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em', minHeight: 44, display: 'flex', alignItems: 'center' }}>FERMER</Tap>
        ) : null}
      </div>

      <div
        key={i}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', marginTop: 20,
          animation: `nuSlide${dir > 0 ? 'L' : 'R'} .38s cubic-bezier(.2,1,.3,1)`
        }}
      >
        <div style={{ background: sl.accent, borderRadius: 30, padding: '24px 22px', display: 'flex', alignItems: 'center', minHeight: 214 }}>
          {sl.art}
        </div>

        <div style={{ font: `500 9.5px ${F.mono}`, letterSpacing: '.22em', color: sl.accent, marginTop: 26 }}>{sl.kicker}</div>
        <div style={{ font: `800 34px/1.02 ${F.display}`, color: '#fff', letterSpacing: '-.032em', marginTop: 10, whiteSpace: 'pre-line' }}>{sl.title}</div>
        <div style={{ font: `400 13.5px/1.55 ${F.body}`, color: 'rgba(255,255,255,.6)', marginTop: 14, maxWidth: 380, textWrap: 'pretty' }}>{sl.text}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18 }}>
        <Tap
          onTap={() => move(i - 1)} haptic="soft"
          style={{ width: 56, minHeight: 56, borderRadius: 20, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.08)', opacity: i === 0 ? .3 : 1, pointerEvents: i === 0 ? 'none' : 'auto' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8"><path d="M19 12H6M12 5l-7 7 7 7" /></svg>
        </Tap>
        <Tap
          onTap={() => (last ? onDone() : move(i + 1))} haptic={last ? 'success' : 'tap'}
          style={{ flex: 1, background: last ? C.lime : '#fff', color: C.ink, borderRadius: 20, minHeight: 56, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span style={{ font: `800 16px ${F.display}`, letterSpacing: '-.01em' }}>{last ? 'J’AI COMPRIS' : 'SUIVANT'}</span>
          <span style={{ font: `700 10px ${F.mono}`, opacity: .5 }}>{i + 1}/{SLIDES.length}</span>
        </Tap>
      </div>
    </div>
  );
}
