/**
 * Vêtements DandyMTP — couche « tenue » du studio d'avatar (style Big Ears).
 *
 * Chaque pièce est une fonction (p: Palette) => string qui renvoie du SVG,
 * dessiné dans la boîte 440 × 440, calée sur la géométrie réelle du bust crop :
 * visage plein cadre, menton bas ~y438, mâchoires à x~150 / x~290. Le vêtement
 * se lit par les épaules (coins bas) et un col émergeant au ras du menton.
 *
 * La couche est composée AVANT le personnage (elle passe donc sous le menton,
 * comme le veut la tête flottante Big Ears).
 */

export type Palette = {
  base: string; shadow: string; shadow2: string; light: string; edge: string; isDark: boolean;
};

/** Dérive une palette cohérente (corps, ombres, reflet, bord) depuis un hex de base. */
export function palette(base: string): Palette {
  const n = base.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const dark = lum < 70;
  const f = (m: number) => hex(r * m, g * m, b * m);
  const mix = (m: number, t: number) => hex(r + (t - r) * m, g + (t - g) * m, b + (t - b) * m);
  return {
    base: hex(r, g, b),
    shadow: dark ? mix(.28, 0) : f(.86),
    shadow2: dark ? mix(.45, 0) : f(.76),
    light: dark ? mix(.30, 255) : mix(.34, 255),
    edge: dark ? mix(.50, 255) : f(.70),
    isDark: dark
  };
}

const RED = '#C4342E', GOLD = '#C9A24B', CREAM = '#F3EDE0';

/** Silhouette torse + manches partagée. */
function torso(p: Palette, sleeve: string = p.shadow): string {
  return `
  <path d="M60 448 C60 424 84 410 128 408 C150 430 286 430 308 408 C352 410 376 424 376 448 Z" fill="${p.base}"/>
  <path d="M96 448 C82 428 58 420 40 428 C30 436 28 444 30 448 Z" fill="${sleeve}"/>
  <path d="M340 448 C354 428 378 420 396 428 C406 436 408 444 406 448 Z" fill="${sleeve}"/>
  <path d="M60 448 C60 424 84 410 128 408 L150 448 Z" fill="${p.light}" fill-opacity=".3"/>
  <path d="M376 448 C376 424 352 410 308 408 L286 448 Z" fill="${p.shadow2}" fill-opacity=".44"/>`;
}

/** Fleur 5 pétales (logo signature DandyMTP). */
export function flower(cx: number, cy: number, r: number, fill: string): string {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 - 90) * Math.PI / 180;
    d += `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.62).toFixed(1)}" fill="${fill}"/>`;
  }
  return d + `<circle cx="${cx}" cy="${cy}" r="${(r * 0.5).toFixed(1)}" fill="${fill}"/>`;
}

/* ---------------- Les 5 pièces ---------------- */

/** 1 — Blouse col Mao asymétrique (liseré rouge, brandebourgs, script Dandy). */
export function blouse(p: Palette): string {
  return `<g>${torso(p)}
  <path d="M128 430 C120 418 120 408 126 402 L150 410 C146 420 148 428 156 434 Z" fill="${p.base}"/>
  <path d="M308 430 C316 418 316 408 310 402 L286 410 C290 420 288 428 280 434 Z" fill="${p.shadow}"/>
  <path d="M150 430 C186 424 250 424 286 430 L286 442 C250 434 186 434 150 442 Z" fill="${p.base}"/>
  <path d="M126 402 C120 414 122 426 132 434" fill="none" stroke="${RED}" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M310 402 C316 414 314 426 304 434" fill="none" stroke="${RED}" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M150 430 C186 424 250 424 286 430" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
  <path d="M154 436 C188 431 248 431 282 436" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="3.5 3.5"/>
  <path d="M218 434 C204 438 186 448 176 448 L200 448 C210 444 216 440 228 438 Z" fill="${p.shadow}" fill-opacity=".55"/>
  <g fill="${RED}"><circle cx="206" cy="443" r="4"/><path d="M199 443 h-9" stroke="${RED}" stroke-width="3" stroke-linecap="round"/></g>
  <circle cx="218" cy="437" r="3" fill="${RED}"/>
  <path d="M300 444 q5 -9 8 0 M312 440 q-2 11 3 13" fill="none" stroke="${RED}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

/** 2 — Veste workwear courte (col chemise, patch imprimé, surpiqûres, poche fleur). */
export function veste(p: Palette): string {
  const st = p.edge;
  return `<g>${torso(p, p.shadow)}
  <path d="M60 440 C160 430 280 430 376 440" fill="none" stroke="${st}" stroke-width="1.8" stroke-dasharray="6 4" opacity=".85"/>
  <path d="M218 430 V448" stroke="${p.shadow2}" stroke-width="3.4"/>
  <path d="M150 424 L214 432 L206 448 L150 440 Z" fill="${p.shadow}"/>
  <path d="M286 424 L222 432 L230 448 L286 440 Z" fill="${p.base}"/>
  <path d="M150 424 C156 414 168 408 182 407 L214 432 Z" fill="${p.shadow}"/>
  <path d="M286 424 C280 414 268 408 254 407 L222 432 Z" fill="${p.base}"/>
  <path d="M150 424 L214 432 M286 424 L222 432" fill="none" stroke="${st}" stroke-width="1.5" stroke-dasharray="4 3"/>
  <rect x="96" y="426" width="46" height="18" rx="2.5" fill="${CREAM}"/>
  <path d="M100 435 q6 -6 11 0 t11 0 t11 0" fill="none" stroke="${RED}" stroke-width="1.6"/>
  <circle cx="108" cy="431" r="2" fill="${GOLD}"/><circle cx="130" cy="439" r="2" fill="#3f6fb8"/>
  <rect x="96" y="426" width="46" height="18" rx="2.5" fill="none" stroke="${p.shadow2}" stroke-width="1"/>
  <path d="M300 426 h34 v20 h-34 z" fill="none" stroke="${st}" stroke-width="1.4" stroke-dasharray="4 3"/>
  <g transform="translate(317 436)">${flower(0, 0, 4.5, p.edge)}</g>
  </g>`;
}

/** 3 — Polo maille col ouvert souple (logo fleur à l'épaule). */
export function poloMaille(p: Palette): string {
  return `<g>${torso(p, p.shadow)}
  <path d="M198 430 C206 442 216 448 218 448 C220 448 230 442 238 430 C228 436 208 436 198 430 Z" fill="${p.shadow2}"/>
  <path d="M150 426 C160 416 176 410 194 410 L206 432 L168 442 Z" fill="${p.light}" fill-opacity=".85"/>
  <path d="M286 426 C276 416 260 410 242 410 L230 432 L268 442 Z" fill="${p.base}"/>
  <path d="M150 426 C162 416 178 410 196 411 M286 426 C274 416 258 410 240 411" fill="none" stroke="${p.edge}" stroke-width="2.4" stroke-linecap="round"/>
  <g stroke="${p.light}" stroke-width="1" opacity=".18">
    ${Array.from({ length: 11 }, (_, i) => `<path d="M${120 + i * 20} 428 V446"/>`).join('')}
  </g>
  <g transform="translate(150 420)">${flower(0, 0, 4, p.edge)}</g>
  </g>`;
}

/** 4 — Chemise habillée boutonnée (col ouvert, poignets retroussés). */
export function chemise(p: Palette): string {
  return `<g>${torso(p, p.base)}
  <path d="M30 432 C54 426 88 426 108 436 L104 448 C84 440 56 440 34 446 Z" fill="${p.light}" fill-opacity=".5"/>
  <path d="M406 432 C382 426 348 426 328 436 L332 448 C352 440 380 440 402 446 Z" fill="${p.shadow2}" fill-opacity=".5"/>
  <path d="M212 430 V448 M224 430 V448" stroke="${p.shadow2}" stroke-width="1.6" opacity=".7"/>
  <g fill="${p.edge}"><circle cx="218" cy="438" r="2.6"/><circle cx="218" cy="447" r="2.6"/></g>
  <path d="M150 424 L214 432 L206 448 L156 440 C152 434 150 428 150 424 Z" fill="${p.light}" fill-opacity=".75"/>
  <path d="M286 424 L222 432 L230 448 L280 440 C284 434 286 428 286 424 Z" fill="${p.shadow}"/>
  <path d="M150 424 C162 416 180 410 200 411 M286 424 C274 416 256 410 236 411" fill="none" stroke="${p.shadow2}" stroke-width="1.8" stroke-linecap="round"/>
  </g>`;
}

/** 5 — Débardeur côtelé (encolure ronde, script Dandy). */
export function debardeur(p: Palette): string {
  const script = p.isDark ? '#EDEDED' : p.shadow2;
  return `<g>
  <path d="M96 448 C96 424 122 410 164 408 C178 428 258 428 272 408 C314 410 340 424 340 448 Z" fill="${p.base}"/>
  <path d="M96 448 C96 424 122 410 164 408 L182 448 Z" fill="${p.light}" fill-opacity=".26"/>
  <path d="M340 448 C340 424 314 410 272 408 L254 448 Z" fill="${p.shadow2}" fill-opacity=".4"/>
  <path d="M128 410 C122 396 128 386 142 384 L156 390 C146 396 142 404 146 414 Z" fill="${p.base}"/>
  <path d="M308 410 C314 396 308 386 294 384 L280 390 C290 396 294 404 290 414 Z" fill="${p.base}"/>
  <path d="M134 410 C128 396 132 388 144 386 M302 410 C308 396 304 388 292 386" fill="none" stroke="${p.edge}" stroke-width="2" stroke-linecap="round"/>
  <path d="M164 424 C176 440 210 446 218 446 C226 446 260 440 272 424 C250 432 186 432 164 424 Z" fill="${p.shadow}"/>
  <path d="M164 424 C176 438 210 444 218 444 C226 444 260 438 272 424" fill="none" stroke="${p.edge}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M118 436 q6 -11 10 0 q2 7 -2 11 M134 430 q-3 14 4 16 M148 440 q5 -10 9 0" fill="none" stroke="${script}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

/* ---------------- Catalogue ---------------- */

export type GarmentDef = {
  id: string;
  label: string;
  draw: (p: Palette) => string;
  colors: string[]; // 5 coloris, du plus clair au plus foncé / signature
};

/** Catalogue des tenues : 5 pièces × 5 coloris. Ordre = ordre d'affichage. */
export const GARMENTS: GarmentDef[] = [
  { id: 'aucun',      label: 'Aucun',        draw: () => '', colors: [] },
  { id: 'blouse',     label: 'Blouse Mao',   draw: blouse,     colors: ['F4F2ED', 'E9DFCF', 'DCE7F0', 'E7C9C2', '1C1C23'] },
  { id: 'veste',      label: 'Veste',        draw: veste,      colors: ['151826', '2C3A2E', '5A4632', '7A2E2A', 'E7E2D6'] },
  { id: 'poloMaille', label: 'Polo maille',  draw: poloMaille, colors: ['0A0A0C', '20262E', '3A2F4A', '123A2E', '6E1E22'] },
  { id: 'chemise',    label: 'Chemise',      draw: chemise,    colors: ['CDDAED', 'F4F2ED', 'E7D9C2', 'C9D8C4', '3A4A63'] },
  { id: 'debardeur',  label: 'Débardeur',    draw: debardeur,  colors: ['0D1411', 'F3EDE0', '7A2E2A', '20304A', 'D9A73F'] }
];

const BY_ID: Record<string, GarmentDef> = Object.fromEntries(GARMENTS.map((gd) => [gd.id, gd]));

/**
 * Rend le SVG d'une tenue. `value` encode pièce + coloris sous la forme "id:HEX"
 * (ex. "veste:151826"). Renvoie '' si aucune tenue.
 */
export function garmentSvg(value: string | undefined): string {
  if (!value || value === 'aucun') return '';
  const [id, hex] = value.split(':');
  const def = BY_ID[id];
  if (!def || !def.draw) return '';
  const color = hex || def.colors[0] || '888888';
  return def.draw(palette('#' + color.replace(/^#/, '')));
}

/** Toutes les valeurs "id:HEX" disponibles (grille à plat — conservé au cas où). */
export function garmentOptions(): { id: string; label: string; value: string; color: string }[] {
  const out: { id: string; label: string; value: string; color: string }[] = [
    { id: 'aucun', label: 'Aucun', value: 'aucun', color: '' }
  ];
  for (const gd of GARMENTS) {
    if (gd.id === 'aucun') continue;
    for (const c of gd.colors) out.push({ id: gd.id, label: gd.label, value: `${gd.id}:${c}`, color: c });
  }
  return out;
}

/* ---------------- Sélection en deux temps (pièce → teinte) ---------------- */

/** Liste des pièces, pour la barre de sous-catégories du studio (1ʳᵉ étape). */
export function garmentPieces(): { id: string; label: string }[] {
  return GARMENTS.map((gd) => ({ id: gd.id, label: gd.label }));
}

/** Décompose une valeur "id:HEX" en { id, color }. 'aucun' → id 'aucun'. */
export function parseGarment(value: string | undefined): { id: string; color: string } {
  if (!value || value === 'aucun') return { id: 'aucun', color: '' };
  const [id, hex] = value.split(':');
  return { id, color: hex || '' };
}

/** Coloris disponibles pour une pièce donnée (2ᵉ étape). Vide pour 'aucun'. */
export function garmentColors(pieceId: string): string[] {
  const gd = GARMENTS.find((g) => g.id === pieceId);
  return gd ? gd.colors : [];
}

/** Construit la valeur "id:HEX" pour une pièce + teinte. */
export function garmentValue(pieceId: string, color: string): string {
  if (pieceId === 'aucun') return 'aucun';
  return `${pieceId}:${color}`;
}

/** Coloris par défaut (le premier) d'une pièce. */
export function defaultColor(pieceId: string): string {
  const cs = garmentColors(pieceId);
  return cs[0] || '';
}
