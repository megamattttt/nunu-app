import React, { useState } from 'react';
import { C, F } from '../../theme';
import { useGame } from '../../state/store';
import { SKILLS } from '../../data/skills';
import AvatarCut from '../../components/avatar/AvatarCut';
import { RouteHead, Tap } from '../../components/ui';
import type { Nav } from '../../App';

export default function Feed({ nav }: { nav: Nav }) {
  const { s, d } = useGame();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [tag, setTag] = useState(0);
  const [cmt, setCmt] = useState<Record<string, string>>({});

  const publish = () => {
    if (!draft.trim()) return;
    d({ t: 'PUBLISH', text: draft.trim(), tag: SKILLS[tag].name, tagC: SKILLS[tag].c });
    setDraft(''); setOpen(false);
  };

  return (
    <div style={{ padding: '10px 22px 30px' }}>
      <RouteHead
        title="LE MUR"
        sub={s.feed.length + ' publications'}
        onBack={nav.back}
        right={
          <Tap onTap={() => setOpen((o) => !o)} style={{ font: `700 10px ${F.mono}`, letterSpacing: '.08em', color: open ? 'rgba(255,255,255,.6)' : C.ink, background: open ? 'rgba(255,255,255,.1)' : C.lime, padding: '13px 14px', borderRadius: 99, flex: 'none', minHeight: 44, display: 'flex', alignItems: 'center' }}>
            {open ? 'FERMER' : 'PUBLIER'}
          </Tap>
        }
      />

      {open ? (
        <div style={{ background: C.night, borderRadius: 24, padding: '16px 18px', marginTop: 16, animation: 'nuPop .3s cubic-bezier(.2,1.2,.3,1)' }}>
          <div style={{ font: `500 9.5px ${F.mono}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.14em' }}>NOUVELLE PUBLICATION</div>
          <textarea
            value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Raconte ta session…" autoFocus
            style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: '13px 14px', color: '#fff', font: `400 16px/1.45 ${F.body}`, minHeight: 86, resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {SKILLS.map((k, i) => (
              <Tap key={k.id} onTap={() => setTag(i)} haptic="soft" style={{ font: `700 10px ${F.mono}`, padding: '9px 11px', borderRadius: 10, minHeight: 38, display: 'flex', alignItems: 'center', background: tag === i ? k.c : 'rgba(255,255,255,.07)', color: tag === i ? k.txt : 'rgba(255,255,255,.6)' }}>{k.name}</Tap>
            ))}
          </div>
          <Tap onTap={publish} haptic="success" style={{ background: C.lime, borderRadius: 16, padding: 16, textAlign: 'center', marginTop: 12, font: `800 15px ${F.display}`, color: C.ink, minHeight: 52 }}>PUBLIER · +40 PX</Tap>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {s.feed.map((p) => (
          <article key={p.id} style={{ background: C.night, borderRadius: 26, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}>
                <AvatarCut who={p.who === 'camille' ? undefined : p.who} av={p.who === 'camille' ? s.profile.av : undefined} crop="face" />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: `700 13.5px ${F.body}`, color: '#fff' }}>{p.name}</span>
                <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{p.when}</span>
              </span>
              <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: C.ink, background: p.tagC, padding: '5px 8px', borderRadius: 7, flex: 'none' }}>{p.tag}</span>
            </div>

            <div style={{ font: `400 13.5px/1.5 ${F.body}`, color: 'rgba(255,255,255,.82)', marginTop: 13, textWrap: 'pretty' }}>{p.text}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
              <Tap onTap={() => d({ t: 'LIKE', id: p.id })} haptic="soft" style={{ font: `700 11.5px ${F.body}`, color: p.liked ? C.lime : 'rgba(255,255,255,.55)', minHeight: 40, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={p.liked ? C.lime : 'none'} stroke={p.liked ? C.lime : 'rgba(255,255,255,.55)'} strokeWidth="2"><path d="M12 20s-7-4.6-7-9.4A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.6C19 15.4 12 20 12 20z" /></svg>
                {p.likes}
              </Tap>
              <span style={{ font: `500 11.5px ${F.body}`, color: 'rgba(255,255,255,.45)' }}>{p.comments.length} commentaire{p.comments.length > 1 ? 's' : ''}</span>
              <span style={{ marginLeft: 'auto', font: `700 10px ${F.mono}`, color: C.lime, letterSpacing: '.08em' }}>{p.px}</span>
            </div>

            {p.comments.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14, paddingTop: 13, borderTop: '1px solid rgba(255,255,255,.08)' }}>
                {p.comments.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flex: 'none' }}>
                      <AvatarCut who={c.who === 'camille' ? undefined : c.who} av={c.who === 'camille' ? s.profile.av : undefined} crop="face" />
                    </span>
                    <span style={{ font: `400 12px/1.4 ${F.body}`, color: 'rgba(255,255,255,.68)' }}>
                      <b style={{ fontWeight: 700, color: '#fff' }}>{c.name}</b> {c.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <form
              onSubmit={(e) => { e.preventDefault(); const v = (cmt[p.id] || '').trim(); if (!v) return; d({ t: 'COMMENT', id: p.id, text: v }); setCmt((m) => ({ ...m, [p.id]: '' })); }}
              style={{ display: 'flex', gap: 8, marginTop: 12 }}
            >
              <input
                value={cmt[p.id] || ''} onChange={(e) => setCmt((m) => ({ ...m, [p.id]: e.target.value }))}
                placeholder="Répondre…"
                style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '11px 13px', color: '#fff', font: `400 16px ${F.body}`, minHeight: 44 }}
              />
              <button type="submit" style={{ font: `700 10px ${F.mono}`, color: C.ink, background: 'rgba(255,255,255,.85)', padding: '0 14px', borderRadius: 14, minHeight: 44 }}>OK</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
