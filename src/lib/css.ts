import type { CSSProperties } from 'react';

const camel = (k: string) => k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Convertit une chaîne CSS ("left:4px;top:0") en objet de style React.
 *  Les formes du diorama et des décors sont stockées comme chaînes (portées du prototype). */
export function css(str: string): CSSProperties {
  const out: any = {};
  if (!str) return out;
  str.split(';').forEach((part) => {
    const ix = part.indexOf(':');
    if (ix < 0) return;
    const k = camel(part.slice(0, ix));
    if (k) out[k] = part.slice(ix + 1).trim();
  });
  return out;
}

/** Applique une palette aux jetons @soft / @mid / @line des décors de compétence. */
export function tint(str: string, pal: { soft: string; mid: string; line: string }) {
  return str.split('@soft').join(pal.soft).split('@mid').join(pal.mid).split('@line').join(pal.line);
}
