import type { GameState } from './types';
import { SAVE_VERSION } from './initial';

/**
 * Couche de données isolée : l'app ne parle qu'à cette interface.
 * Aujourd'hui localStorage ; demain, brancher Supabase/une API revient à
 * fournir un autre adaptateur (mêmes signatures, async déjà en place).
 */
export interface DataAdapter {
  load(): Promise<Partial<GameState> | null>;
  save(state: GameState): Promise<void>;
  clear(): Promise<void>;
}

const KEY = 'nunu.save.v3';
const LEGACY = ['nunu.save.v1', 'nunu.save.v2'];

export class LocalAdapter implements DataAdapter {
  async load() {
    // La structure d'état a changé (deux monnaies, rangs par compétence) :
    // les anciennes sauvegardes sont effacées plutôt que migrées de force.
    LEGACY.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignoré */ } });
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<GameState>;
      if (parsed.version !== SAVE_VERSION) { localStorage.removeItem(KEY); return null; }
      return parsed;
    } catch { return null; }
  }
  async save(state: GameState) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  }
  async clear() {
    try { localStorage.removeItem(KEY); } catch { /* ignoré */ }
  }
}

/* Exemple de futur adaptateur distant — laissé volontairement en commentaire.
export class ApiAdapter implements DataAdapter {
  constructor(private baseUrl: string, private token: string) {}
  async load() { const r = await fetch(this.baseUrl + '/state', { headers: { Authorization: 'Bearer ' + this.token } }); return r.ok ? r.json() : null; }
  async save(s: GameState) { await fetch(this.baseUrl + '/state', { method: 'PUT', body: JSON.stringify(s), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + this.token } }); }
  async clear() { await fetch(this.baseUrl + '/state', { method: 'DELETE' }); }
}
*/

export const adapter: DataAdapter = new LocalAdapter();
