import type { GameState } from './types';

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

const KEY = 'nunu.save.v1';

export class LocalAdapter implements DataAdapter {
  async load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Partial<GameState>) : null;
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
