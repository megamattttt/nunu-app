// Jetons de design repris 1:1 du prototype NUNU v13.
export const C = {
  ink: '#0B0B0C',
  night: '#17171A',
  paper: '#F6F4EF',
  sand: '#E6DFD1',
  lime: '#C6F24E',
  violet: '#6C63FF',
  coral: '#FF5C42',
  honey: '#FFC93C',
  sky: '#A8D8FF',
  purple: '#B06FF0',
  mint: '#2FA88A',
  logo: '#2F2BC9',
  wood: '#3A2A1C',
  woodPaper: '#F4E7D3'
};

export const F = {
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace"
};

/** Raccourcis typo (font shorthand) utilisés partout dans les écrans. */
export const T = {
  kicker: `500 9.5px ${F.mono}`,
  mono: `700 11px ${F.mono}`,
  h1: `800 42px/1 ${F.display}`,
  h2: `800 28px/1 ${F.display}`,
  h3: `800 21px ${F.display}`,
  body: `400 13px/1.45 ${F.body}`,
  strong: `700 13.5px ${F.body}`
};

export const RADIUS = { card: 26, tile: 22, chip: 16, pill: 99 };
export const ease = 'cubic-bezier(.2,1.2,.3,1)';
