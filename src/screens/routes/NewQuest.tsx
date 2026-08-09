import React, { useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { NQ_PX, NQ_WHEN } from '../../data/quests';
import { SKILLS } from '../../data/skills';
import { RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

export default function NewQuest({ nav }: { nav: Nav }) {
  const { d } = useGame();
  const preset = nav.route?.data?.skill || 'couture';
  const [skill, setSkill] = useState(preset);
  const [name, setName] = useState('');
  const [energy, setEnergy] = useState(1);
  const [when, setWhen] = useState(0);
  const px = NQ_PX[energy] * 5;

  const create = () => {
    if (!name.trim()) return;
    d({ t: 'ADD_QUEST', skill, name: name.trim(), px, when, rarity: 'commune' });
    nav.back();
  };

  return (
    <div style={{ padding: '10px 22px 30px' }}>
      <RouteHead title="NOUVELLE QUÊTE" sub="Elle s’ajoute à la fin de ton plateau" onBack={nav.back} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
        <div style={{ background: C.night, borderRadius: 20, padding: '14px 16px' }}>
          <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>NOM DE LA QUÊTE</div>
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Réparer la fermeture du sac"
            autoFocus
            style={{ width: '100%', color: '#fff', font: `700 17px ${F.body}`, padding: '8px 0 0' }}
          />
        </div>

        <div style={{ background: C.night, borderRadius: 20, padding: '14px 16px' }}>
          <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>COMPÉTENCE</div>
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

        <div style={{ background: C.night, borderRadius: 20, padding: '14px 16px' }}>
          <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>ÉNERGIE DEMANDÉE</div>
          <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
            {['Légère', 'Moyenne', 'Grosse'].map((lbl, i) => (
              <Tap key={lbl} onTap={() => setEnergy(i)} haptic="soft" style={{ flex: 1, textAlign: 'center', font: `700 11.5px ${F.body}`, padding: '12px 6px', borderRadius: 12, minHeight: 44, background: energy === i ? C.lime : 'rgba(255,255,255,.07)', color: energy === i ? C.ink : 'rgba(255,255,255,.7)' }}>{lbl}</Tap>
            ))}
          </div>
          <div style={{ font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 10 }}>Récompense estimée : <b style={{ color: C.lime }}>+{px} PX</b></div>
        </div>

        <div style={{ background: C.night, borderRadius: 20, padding: '14px 16px' }}>
          <div style={{ font: `500 9px ${F.mono}`, color: 'rgba(255,255,255,.45)', letterSpacing: '.14em' }}>MOMENT DE LA JOURNÉE</div>
          <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
            {NQ_WHEN.map((lbl, i) => (
              <Tap key={lbl} onTap={() => setWhen(i)} haptic="soft" style={{ flex: 1, textAlign: 'center', font: `700 11.5px ${F.body}`, padding: '12px 6px', borderRadius: 12, minHeight: 44, background: when === i ? C.sky : 'rgba(255,255,255,.07)', color: when === i ? C.ink : 'rgba(255,255,255,.7)' }}>{lbl}</Tap>
            ))}
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
