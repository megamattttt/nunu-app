import React, { useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { CADRE_C, SHOP, SHOP_CATS, SHOP_FRAME_IX, SHOP_INTRO } from '../../data/quiz';
import { lastOption } from '../../lib/dicebear';
import { RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

export default function Shop({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [cat, setCat] = useState<'acc' | 'atelier' | 'cadre'>('acc');
  const items: any[] = (SHOP as any)[cat];

  const buy = (ix: number, price: number, name: string) => {
    if (s.owned[cat][ix]) return;
    d({ t: 'BUY', cat, ix, price, name });
    if (s.coins >= price) {
      if (cat === 'acc') d({ t: 'SET_AV', patch: lastOption(SHOP.acc[ix][2]) });
      if (cat === 'cadre') d({ t: 'SET_PROFILE', patch: { cadre: ix } });
    }
  };

  return (
    <div style={{ padding: '10px 22px 30px' }}>
      <RouteHead
        title="BOUTIQUE"
        onBack={nav.back}
        right={
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.honey, padding: '10px 13px', borderRadius: 99, flex: 'none' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: C.ink }} />
            <span style={{ font: `800 15px ${F.display}`, color: C.ink }}>{s.coins}</span>
          </span>
        }
      />

      <div style={{ display: 'flex', gap: 7, marginTop: 18 }}>
        {SHOP_CATS.map(([k, label]) => (
          <Tap key={k} onTap={() => setCat(k as any)} haptic="soft" style={{ flex: 1, textAlign: 'center', font: `700 10px ${F.mono}`, letterSpacing: '.1em', padding: '13px 6px', borderRadius: 13, minHeight: 44, background: cat === k ? C.lime : 'rgba(255,255,255,.07)', color: cat === k ? C.ink : 'rgba(255,255,255,.6)' }}>{label}</Tap>
        ))}
      </div>

      <div style={{ font: `400 12.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 16 }}>{SHOP_INTRO[cat]}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {items.map((it: any, ix: number) => {
          const [name, price] = it;
          const owned = s.owned[cat][ix];
          const can = s.coins >= price;
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 13, background: C.night, border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '13px 15px' }}>
              <span style={{ width: 44, height: 44, borderRadius: 14, flex: 'none', background: cat === 'cadre' ? CADRE_C[ix] : cat === 'acc' ? C.sky : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 16px ${F.display}`, color: C.ink }}>
                {name.slice(0, 1)}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: `700 14px ${F.body}`, color: '#fff' }}>{name}</span>
                <span style={{ display: 'block', font: `400 11.5px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{owned ? 'Déjà à toi' : price + ' pièces'}</span>
              </span>
              <Tap
                onTap={() => buy(ix, price, name)}
                haptic={owned ? 'soft' : can ? 'success' : 'error'}
                style={{
                  font: `700 10.5px ${F.mono}`, letterSpacing: '.08em', padding: '12px 14px', borderRadius: 12, flex: 'none', minHeight: 44, display: 'flex', alignItems: 'center',
                  background: owned ? 'rgba(255,255,255,.08)' : can ? C.lime : 'rgba(255,255,255,.06)',
                  color: owned ? 'rgba(255,255,255,.45)' : can ? C.ink : 'rgba(255,255,255,.3)'
                }}
              >
                {owned ? 'OBTENU' : 'ACHETER'}
              </Tap>
            </div>
          );
        })}
      </div>
    </div>
  );
}
