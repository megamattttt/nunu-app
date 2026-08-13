import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, F } from '../theme';
import { useGame } from '../state/store';
import { IMPS, nextImp, type Importance } from '../data/importance';
import { PACKS } from '../data/packs';
import { DEFAULT_PACK_ICON, PACK_ICONS, packIconLabel } from '../data/packIcons';
import PackIcon from './PackIcon';
import { parseQuest, dueLabel, dueBucket, BUCKETS } from '../lib/nlq';
import { askNotif, notifState, notifSupported } from '../lib/notify';
import { Check, Kicker, Tap } from './ui';
import { buzz } from '../lib/haptics';
import { sfx } from '../lib/sound';
import type { CustomQuest, QuestPack } from '../state/types';

const impOf = (q: CustomQuest): Importance => q.imp || 'normal';

/** Deux-points clignotant : la ligne d'échéance respire quand c'est pour maintenant. */
const LIVE = { animation: 'nuHalo 2.4s ease-in-out infinite' } as const;

/** Surfaces sombres de l'espace perso — même vocabulaire que l'accueil. */
const CARD = { background: C.night, border: `1px solid ${C.line}`, borderRadius: 20 } as const;

function Pill({ c, txt, children }: { c: string; txt: string; children: React.ReactNode }) {
  return (
    <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: txt, background: c, padding: '4px 8px', borderRadius: 7, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

/** Un pack : icône, nom, aperçu du contenu, ajout en un clic, contenu dépliable. */
function PackCard({ pack, open, onOpen, onAddAll, onAddOne, onEdit, onDelete }: {
  pack: QuestPack; open: boolean; onOpen: () => void; onAddAll: () => void;
  onAddOne: (name: string) => void; onEdit?: () => void; onDelete?: () => void;
}) {
  return (
    <div style={{ ...CARD, padding: '13px 14px', borderColor: open ? `${C.iris}66` : C.line }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Tap onTap={onOpen} haptic="soft" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11 }}>
          <PackIcon id={pack.icon} size={30} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `700 13px ${F.body}`, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pack.name}</span>
            <span style={{ display: 'block', font: `400 10.5px ${F.body}`, color: 'rgba(255,255,255,.42)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pack.items.length} tâches · {pack.items.slice(0, 2).join(', ')}…
            </span>
          </span>
        </Tap>
        <Tap
          onTap={onAddAll} haptic="success" aria-label={'Ajouter ' + pack.name}
          style={{ flex: 'none', minHeight: 38, padding: '0 13px', borderRadius: 12, background: C.lime, color: C.ink, display: 'flex', alignItems: 'center', font: `700 9.5px ${F.mono}`, letterSpacing: '.08em' }}
        >
          TOUT
        </Tap>
      </div>

      {open ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.line}` }}>
          {pack.items.map((it) => (
            <Tap
              key={it} onTap={() => onAddOne(it)} haptic="soft"
              style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, padding: '0 4px' }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 8, flex: 'none', background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span style={{ flex: 1, font: `500 12.5px ${F.body}`, color: 'rgba(255,255,255,.8)' }}>{it}</span>
            </Tap>
          ))}
          {onEdit ? (
            <Tap onTap={onEdit} haptic="soft" style={{ marginTop: 2, minHeight: 36, display: 'flex', alignItems: 'center', font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.lime }}>
              MODIFIER CE PACK
            </Tap>
          ) : null}
          {onDelete ? (
            <Tap onTap={onDelete} style={{ minHeight: 36, display: 'flex', alignItems: 'center', font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.coral }}>
              SUPPRIMER CE PACK
            </Tap>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Espace perso en mode rappels : une seule ligne de saisie qui comprend
 * le français, un tri automatique par échéance puis importance, des packs
 * de tâches prêts à poser, et des notifications locales réglées au profil.
 */
export default function PersoBoard({ onSettings }: { onSettings: () => void }) {
  const { s, d } = useGame();
  const [raw, setRaw] = useState('');
  const [impOverride, setImpOverride] = useState<Importance | null>(null);
  const [doneOpen, setDoneOpen] = useState(false);
  const [openPack, setOpenPack] = useState<string | null>(null);
  const [newPack, setNewPack] = useState<{ id?: string; name: string; items: string; icon: string } | null>(null);
  const [perm, setPerm] = useState(notifState());
  const [, tick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Les libellés « dans 10 minutes » restent justes sans recharger l'écran.
  useEffect(() => {
    const id = window.setInterval(() => tick((v) => v + 1), 30e3);
    return () => window.clearInterval(id);
  }, []);

  const parsed = useMemo(() => (raw.trim() ? parseQuest(raw) : null), [raw]);
  const imp: Importance = impOverride || parsed?.imp || 'normal';

  const all = s.customQuests.filter((q) => q.skill === 'perso');
  const open = all.filter((q) => !q.done);
  const done = all.filter((q) => q.done);
  const packs: QuestPack[] = [...PACKS, ...(s.packs || [])];

  const sorted = useMemo(
    () => open.slice().sort((x, y) =>
      dueBucket(x.due ?? null) - dueBucket(y.due ?? null)
      || (x.due ?? Infinity) - (y.due ?? Infinity)
      || IMPS[impOf(x)].order - IMPS[impOf(y)].order),
    [open, Math.floor(Date.now() / 6e4)]
  );

  const late = sorted.filter((q) => q.due && q.due < Date.now()).length;
  const dated = open.filter((q) => q.due).length;

  const add = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!parsed || !parsed.name) return;
    d({
      t: 'ADD_QUEST', skill: 'perso', name: parsed.name, px: IMPS[imp].px,
      due: parsed.due, timed: parsed.timed, imp, rarity: 'commune', diff: 'facile'
    });
    buzz('success'); sfx.tap();
    setRaw(''); setImpOverride(null);
    inputRef.current?.focus();
  };

  const validate = (q: CustomQuest, i: number) => {
    buzz('success'); sfx.check();
    d({ t: 'VALIDATE', skill: 'perso', ix: 1000 + i, name: q.name, px: q.px, rarity: 'commune' });
  };

  const saveNewPack = () => {
    if (!newPack) return;
    const items = newPack.items.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
    if (!newPack.name.trim() || !items.length) return;
    d({ t: 'PACK_SAVE', pack: { id: newPack.id, name: newPack.name.trim(), items, icon: newPack.icon } });
    setNewPack(null);
  };

  const editPack = (p: QuestPack) => {
    setNewPack({ id: p.id, name: p.name, items: p.items.join('\n'), icon: p.icon || DEFAULT_PACK_ICON });
    setOpenPack(null);
  };

  const askPerm = async () => { setPerm(await askNotif()); d({ t: 'NOTIF', patch: { on: true } }); };

  /* Regroupement par urgence : les intertitres rendent le tri lisible. */
  const groups: { label: string; rows: CustomQuest[] }[] = [];
  sorted.forEach((q) => {
    const label = BUCKETS[dueBucket(q.due ?? null)];
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.rows.push(q);
    else groups.push({ label, rows: [q] });
  });

  return (
    <>
      {/* Barre de saisie — le cœur de l'écran */}
      <form
        onSubmit={add}
        style={{
          background: C.night, borderRadius: 22, padding: 13,
          border: `1px solid ${raw ? IMPS[imp].c : C.line}`,
          boxShadow: raw ? `0 18px 40px -30px ${IMPS[imp].c}` : 'none',
          transition: 'border-color .2s ease'
        }}
      >
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <span
            style={{
              width: 34, height: 34, borderRadius: 11, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: IMPS[imp].c, transition: 'background .2s ease'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={IMPS[imp].txt} strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <input
            ref={inputRef} value={raw} onChange={(e) => { setRaw(e.target.value); setImpOverride(null); }}
            placeholder="Dentiste mardi 14h important"
            enterKeyHint="done"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#fff', font: `500 16px ${F.body}`, minHeight: 34 }}
          />
          {raw ? (
            <button type="submit" style={{ font: `700 10px ${F.mono}`, letterSpacing: '.08em', color: C.ink, background: C.lime, padding: '0 14px', borderRadius: 12, minHeight: 38, flex: 'none' }}>
              AJOUTER
            </button>
          ) : null}
        </div>

        {/* Lecture de la saisie : ce que l'application a compris, modifiable d'un tap */}
        {parsed ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 11, paddingTop: 11, borderTop: `1px solid ${C.line}` }}>
            <span style={{ font: `700 12.5px ${F.body}`, color: '#fff', marginRight: 2 }}>{parsed.name || '…'}</span>
            <Pill c="rgba(255,255,255,.08)" txt="rgba(255,255,255,.62)">
              {parsed.due ? dueLabel(parsed.due, parsed.timed).toUpperCase() : 'SANS DATE'}
            </Pill>
            <Tap
              onTap={() => setImpOverride(nextImp(imp))} haptic="soft"
              aria-label="Changer l’importance"
              style={{ display: 'inline-flex' }}
            >
              <Pill c={IMPS[imp].c} txt={IMPS[imp].txt}>{IMPS[imp].label}</Pill>
            </Tap>
            <Pill c="rgba(255,255,255,.08)" txt="rgba(255,255,255,.62)">+{IMPS[imp].px} PX</Pill>
          </div>
        ) : (
          <div style={{ font: `400 11.5px/1.45 ${F.body}`, color: 'rgba(255,255,255,.45)', marginTop: 9, textWrap: 'pretty' }}>
            Écris comme tu parles : <b style={{ fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>demain 9h</b>, <b style={{ fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>vendredi</b>, <b style={{ fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>dans 3 jours</b>, <b style={{ fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>urgent</b>. La date et l’importance se remplissent toutes seules.
          </div>
        )}
      </form>

      {/* Rappels : état de la permission, réglage détaillé dans le profil */}
      {notifSupported() && (perm !== 'granted' || !s.notif?.on) ? (
        <Tap
          onTap={askPerm} haptic="soft"
          style={{ display: 'flex', alignItems: 'center', gap: 11, background: C.slate, border: `1px solid ${C.line}`, borderRadius: 18, padding: '13px 15px', minHeight: 56 }}
        >
          <span style={{ width: 28, height: 28, borderRadius: 10, background: C.honey, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: `700 13px ${F.body}`, color: '#fff' }}>Activer les rappels</span>
            <span style={{ display: 'block', font: `400 11px ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
              {perm === 'denied' ? 'Bloqué par le navigateur — à réautoriser dans ses réglages' : 'À l’heure, 10 min avant, et le résumé du matin'}
            </span>
          </span>
          <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.honey, flex: 'none' }}>{perm === 'denied' ? 'BLOQUÉ' : 'AUTORISER'}</span>
        </Tap>
      ) : (
        <Tap
          onTap={onSettings} haptic="soft"
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(92,191,174,.1)', border: `1px solid ${C.teal}44`, borderRadius: 16, padding: '11px 14px', minHeight: 46 }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal, flex: 'none', ...LIVE }} />
          <span style={{ flex: 1, font: `500 11.5px ${F.body}`, color: 'rgba(255,255,255,.7)' }}>
            Rappels actifs sur {dated} quête{dated > 1 ? 's' : ''} datée{dated > 1 ? 's' : ''}
          </span>
          <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', flex: 'none' }}>RÉGLER</span>
        </Tap>
      )}

      {/* En-tête de liste */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <Kicker>À FAIRE · {open.length}</Kicker>
        {late ? (
          <span style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: '#fff', background: C.coral, padding: '5px 9px', borderRadius: 8 }}>
            {late} EN RETARD
          </span>
        ) : (
          <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.1em', color: 'rgba(255,255,255,.4)' }}>TRI AUTOMATIQUE</span>
        )}
      </div>

      {!open.length ? (
        <div style={{ ...CARD, padding: '26px 20px', textAlign: 'center' }}>
          <div style={{ font: `800 17px ${F.display}`, color: '#fff', letterSpacing: '-.01em' }}>Rien en attente</div>
          <div style={{ font: `400 12px/1.5 ${F.body}`, color: 'rgba(255,255,255,.5)', marginTop: 6, textWrap: 'pretty' }}>
            Sors une tâche de ta tête : tape-la ci-dessus, elle se range toute seule.
          </div>
        </div>
      ) : null}

      {groups.map((g) => (
        <div key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: `500 9px ${F.mono}`, letterSpacing: '.16em', color: g.label === 'EN RETARD' ? C.coral : 'rgba(255,255,255,.4)', marginTop: 4 }}>
            {g.label}
          </span>
          {g.rows.map((q) => {
            const i = all.indexOf(q);
            const ip = IMPS[impOf(q)];
            const overdue = !!q.due && q.due < Date.now();
            return (
              <div
                key={q.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, background: C.night, borderRadius: 18, padding: '13px 14px',
                  border: `1px solid ${C.line}`, borderLeft: `4px solid ${ip.c}`,
                  boxShadow: overdue ? `0 14px 32px -28px ${C.coral}` : 'none'
                }}
              >
                <Tap
                  onTap={() => validate(q, i)} haptic="success" aria-label="Fait"
                  style={{
                    width: 28, height: 28, borderRadius: 10, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${ip.c}`, background: 'transparent'
                  }}
                />
                <Tap onTap={() => validate(q, i)} style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: `700 14px ${F.body}`, color: '#fff', textWrap: 'pretty' }}>{q.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ font: `500 11px ${F.body}`, color: overdue ? C.coral : 'rgba(255,255,255,.5)' }}>
                      {dueLabel(q.due ?? null, q.timed !== false)}
                    </span>
                    <span style={{ font: `700 8.5px ${F.mono}`, letterSpacing: '.1em', color: ip.c }}>{ip.label}</span>
                    <span style={{ font: `700 10px ${F.mono}`, color: 'rgba(255,255,255,.4)' }}>+{s.onFire ? q.px * 2 : q.px}</span>
                  </span>
                </Tap>
                <Tap
                  onTap={() => d({ t: 'EDIT_QUEST', id: q.id, patch: { imp: nextImp(impOf(q)) } })}
                  haptic="soft" aria-label="Changer l’importance"
                  style={{ width: 30, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
                >
                  <span style={{ font: `800 13px ${F.display}`, color: ip.c, letterSpacing: '.02em' }}>{ip.short}</span>
                </Tap>
                <Tap
                  onTap={() => d({ t: 'DEL_QUEST', id: q.id })} aria-label="Supprimer"
                  style={{ width: 28, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </Tap>
              </div>
            );
          })}
        </div>
      ))}

      {/* Packs : des listes toutes prêtes, posées d'un geste */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Kicker>PACKS DE QUÊTES</Kicker>
        <Tap
          onTap={() => setNewPack(newPack ? null : { name: '', items: '', icon: DEFAULT_PACK_ICON })} haptic="soft"
          style={{ font: `700 9px ${F.mono}`, letterSpacing: '.1em', color: C.lime, minHeight: 32, display: 'flex', alignItems: 'center' }}
        >
          {newPack ? 'ANNULER' : '+ CRÉER'}
        </Tap>
      </div>

      {newPack ? (
        <div style={{ ...CARD, padding: '14px 15px', borderColor: `${C.lime}44` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 44, height: 44, borderRadius: 14, flex: 'none', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PackIcon id={newPack.icon} size={28} />
            </span>
            <input
              value={newPack.name} onChange={(e) => setNewPack({ ...newPack, name: e.target.value.slice(0, 28) })}
              placeholder="Nom du pack (ex. Entretien maison)"
              style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '11px 12px', color: '#fff', font: `700 14px ${F.body}`, minHeight: 44, border: 'none', outline: 'none' }}
            />
          </div>

          {/* Choix de l'icône : la vignette du pack dans la liste */}
          <span style={{ display: 'block', font: `500 8.5px ${F.mono}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.42)', marginTop: 13 }}>
            ICÔNE · {packIconLabel(newPack.icon).toUpperCase()}
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 9 }}>
            {PACK_ICONS.map((ic) => {
              const on = newPack.icon === ic.id;
              return (
                <Tap
                  key={ic.id} onTap={() => setNewPack({ ...newPack, icon: ic.id })} haptic="soft" aria-label={ic.label}
                  style={{
                    aspectRatio: '1', minHeight: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: on ? 'rgba(185,222,100,.14)' : 'rgba(255,255,255,.04)',
                    border: `1.5px solid ${on ? C.lime : 'transparent'}`,
                    opacity: on ? 1 : .78, transition: 'opacity .15s ease, background .15s ease'
                  }}
                >
                  <PackIcon id={ic.id} size={24} />
                </Tap>
              );
            })}
          </div>

          <textarea
            value={newPack.items} onChange={(e) => setNewPack({ ...newPack, items: e.target.value })}
            placeholder="Une tâche par ligne&#10;Nettoyer le sol&#10;Faire les vitres"
            rows={4}
            style={{ width: '100%', background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '11px 12px', color: '#fff', font: `500 13px/1.5 ${F.body}`, marginTop: 13, border: 'none', outline: 'none', resize: 'vertical' }}
          />
          <Tap
            onTap={saveNewPack} haptic="success"
            style={{ marginTop: 10, minHeight: 46, borderRadius: 14, background: C.lime, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 13px ${F.display}` }}
          >
            {newPack.id ? 'ENREGISTRER LES MODIFICATIONS' : 'ENREGISTRER LE PACK'}
          </Tap>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {packs.map((p) => (
          <PackCard
            key={p.id}
            pack={p}
            open={openPack === p.id}
            onOpen={() => setOpenPack(openPack === p.id ? null : p.id)}
            onAddAll={() => d({ t: 'PACK_ADD', items: p.items })}
            onAddOne={(name) => d({ t: 'PACK_ADD', items: [name] })}
            onEdit={p.mine ? () => editPack(p) : undefined}
            onDelete={p.mine ? () => d({ t: 'PACK_DEL', id: p.id }) : undefined}
          />
        ))}
      </div>

      {/* Terminé — replié, effaçable d'un geste */}
      {done.length ? (
        <div style={{ marginTop: 6 }}>
          <Tap
            onTap={() => setDoneOpen((v) => !v)} haptic="soft"
            style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 44 }}
          >
            <span style={{ width: 20, height: 20, borderRadius: 7, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Check size={11} w={3.4} />
            </span>
            <span style={{ flex: 1, font: `500 9.5px ${F.mono}`, letterSpacing: '.14em', color: 'rgba(255,255,255,.45)' }}>TERMINÉ · {done.length}</span>
            <span style={{ font: `500 10px ${F.mono}`, color: 'rgba(255,255,255,.35)' }}>{doneOpen ? 'MASQUER' : 'AFFICHER'}</span>
          </Tap>
          {doneOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {done.map((q) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(255,255,255,.04)', borderRadius: 14, padding: '11px 13px' }}>
                  <span style={{ flex: 1, font: `400 13px ${F.body}`, color: 'rgba(255,255,255,.42)', textDecoration: 'line-through' }}>{q.name}</span>
                  <Tap onTap={() => d({ t: 'DEL_QUEST', id: q.id })} aria-label="Supprimer" style={{ width: 28, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </Tap>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
