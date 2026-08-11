/**
 * Rappels — notifications locales, planifiées tant que l'application vit.
 * Rien n'est envoyé à un serveur : on programme des minuteries sur la fenêtre
 * des 24 prochaines heures, réarmées à chaque changement d'état.
 */

export type NotifPrefs = {
  /** Interrupteur général. */
  on: boolean;
  /** Au moment exact de l'échéance. */
  at: boolean;
  /** Dix minutes avant. */
  before: boolean;
  /** Résumé du matin, à 8 h. */
  digest: boolean;
};

export const DEFAULT_NOTIF: NotifPrefs = { on: false, at: true, before: true, digest: true };

type Item = { id: string; name: string; due?: number | null; done?: boolean };

const HORIZON = 24 * 3600e3;
let timers: number[] = [];

export const notifSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const notifState = (): NotificationPermission | 'unsupported' =>
  notifSupported() ? Notification.permission : 'unsupported';

export async function askNotif(): Promise<NotificationPermission | 'unsupported'> {
  if (!notifSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try { return await Notification.requestPermission(); } catch { return Notification.permission; }
}

function fire(title: string, body: string, tag: string) {
  if (notifState() !== 'granted') return;
  try { new Notification(title, { body, tag, badge: undefined }); } catch { /* onglet fermé */ }
}

/** Prochain passage à 8 h du matin. */
function nextMorning(now = Date.now()) {
  const d = new Date(now);
  d.setHours(8, 0, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/**
 * Réarme toutes les minuteries. Renvoie le nombre de rappels programmés
 * dans les 24 heures — c'est ce chiffre qu'affiche l'écran Quêtes.
 */
export function scheduleReminders(items: Item[], prefs: NotifPrefs): number {
  timers.forEach((t) => window.clearTimeout(t));
  timers = [];
  if (!prefs.on || notifState() !== 'granted') return 0;

  const now = Date.now();
  let n = 0;

  for (const q of items) {
    if (!q.due || q.done) continue;
    const slots: [number, string][] = [];
    if (prefs.at) slots.push([q.due, 'C’est le moment.']);
    if (prefs.before) slots.push([q.due - 10 * 60e3, 'Dans 10 minutes.']);
    for (const [t, body] of slots) {
      const delay = t - now;
      if (delay <= 0 || delay > HORIZON) continue;
      timers.push(window.setTimeout(() => fire(q.name, body, q.id + ':' + t), delay));
      n++;
    }
  }

  if (prefs.digest) {
    const t = nextMorning(now);
    if (t - now <= HORIZON) {
      timers.push(window.setTimeout(() => {
        const end = new Date(); end.setHours(23, 59, 59, 999);
        const today = items.filter((q) => !q.done && q.due && q.due <= end.getTime());
        fire(
          today.length ? `${today.length} quête${today.length > 1 ? 's' : ''} aujourd’hui` : 'Journée libre',
          today.length ? today.slice(0, 3).map((q) => '· ' + q.name).join('\n') : 'Rien de prévu. Ajoute ce qui compte.',
          'nunu:digest'
        );
      }, t - now));
      n++;
    }
  }

  return n;
}

export function clearReminders() {
  timers.forEach((t) => window.clearTimeout(t));
  timers = [];
}
