// Visual directions for a project with no design system yet: each direction is a complete, small system (colour, type,
// spacing and density, shape and depth) that can be checked, rendered side by side on a specimen page, and committed
// as the project's own token file plus DESIGN.md. Decision: ADR 0007 (inspired by impeccable's new-work flow).

export const REQUIRED_COLORS = ['bg', 'surface', 'ink', 'ink-muted', 'primary', 'on-primary', 'border', 'control', 'focus', 'danger'];
// display faces AI-generated UI reaches for by default (from impeccable's calibration); a warning, never a ban
export const OVERUSED_DISPLAY = ['Fraunces', 'Playfair Display', 'Cormorant', 'Cormorant Garamond', 'Lora', 'Crimson', 'Crimson Pro', 'Crimson Text', 'Newsreader', 'Syne', 'Space Grotesk', 'Space Mono', 'IBM Plex', 'DM Sans', 'DM Serif', 'Outfit', 'Plus Jakarta Sans', 'Instrument Sans', 'Inter'];
const DENSITY = { compact: [1, 2, 3, 4, 6, 8], balanced: [1, 2, 4, 6, 8, 12], airy: [2, 3, 5, 8, 12, 16] };
const SPACE_NAMES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
const TEXT_STEPS = [['xs', -2], ['sm', -1], ['base', 0], ['lg', 1], ['xl', 2], ['2xl', 3], ['3xl', 4]];
const BREAKPOINTS = { sm: '390px', md: '768px', lg: '1280px' };
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

import { page, esc } from './page.mjs';

const rem = (px) => `${+(px / 16).toFixed(4)}rem`;

function rgb(hex) {
  let h = hex.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
const lum = (hex) => { const [r, g, b] = rgb(hex).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

/** WCAG contrast ratio of two hex colours. */
export function contrast(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

/** Hue (0-360), saturation and lightness (0-1) of a hex colour. */
function hsl(hex) {
  const [r, g, b] = rgb(hex).map((v) => v / 255); const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const isSerif = (face) => !!face?.serif || /(^|,\s*)serif\b/.test(face?.fallback || '');

// the pairs a direction must pass, with the WCAG 2.2 criterion behind each
const PAIRS = [
  ['ink', 'bg', 4.5, '1.4.3'], ['ink', 'surface', 4.5, '1.4.3'], ['ink-muted', 'bg', 4.5, '1.4.3'], ['ink-muted', 'surface', 4.5, '1.4.3'],
  ['on-primary', 'primary', 4.5, '1.4.3'], ['danger', 'bg', 4.5, '1.4.3'], ['danger', 'surface', 4.5, '1.4.3'],
  ['primary', 'bg', 3, '1.4.11'], ['control', 'bg', 3, '1.4.11'], ['control', 'surface', 3, '1.4.11'], ['focus', 'bg', 3, '1.4.11'], ['focus', 'surface', 3, '1.4.11'],
];

/** Check one direction: errors break WCAG or leave it incomplete; warnings flag the looks AI-generated UI defaults to. */
export function validateDirection(d) {
  const errors = []; const warnings = []; const c = d.colors || {};
  for (const k of REQUIRED_COLORS) if (!c[k]) errors.push(`colors.${k} is missing.`);
  for (const [k, v] of Object.entries(c)) if (!HEX.test(v)) errors.push(`colors.${k} is "${v}": use a hex value such as #1d4e89.`);
  const ok = (k) => HEX.test(c[k] || '');
  const table = [];
  for (const [fg, bg, need, sc] of PAIRS) {
    if (!ok(fg) || !ok(bg)) continue;
    const ratio = Math.round(contrast(c[fg], c[bg]) * 100) / 100;
    table.push({ pair: `${fg} on ${bg}`, ratio, need, ok: ratio >= need, sc });
    if (ratio < need) errors.push(`${fg} on ${bg} is ${ratio}:1; needs ${need}:1 (WCAG 2.2 SC ${sc}).`);
  }
  if (!d.type?.display?.family || !d.type?.body?.family) errors.push('type.display.family and type.body.family are required.');
  if ((d.space?.target ?? 0) < 24) errors.push(`space.target is ${d.space?.target ?? 'missing'}px; needs at least 24px (WCAG 2.2 SC 2.5.8).`);
  if (d.space?.density && !DENSITY[d.space.density]) errors.push(`space.density is "${d.space.density}": use compact, balanced or airy.`);
  if ((d.type?.base ?? 16) < 16) warnings.push({ kind: 'small-text', message: `Body text is ${d.type.base}px. 16px keeps mobile browsers from zooming on focus and reads better (a Default).` });

  const display = d.type?.display?.family || '';
  const over = OVERUSED_DISPLAY.find((f) => display === f || display.startsWith(`${f} `));
  if (over) warnings.push({ kind: 'overused-font', message: `${display} is one of the display faces AI-generated UI reaches for by default. Keep it only for a reason no other face could satisfy.` });

  if (ok('bg') && ok('primary')) {
    const bg = hsl(c.bg); const pr = hsl(c.primary);
    const cream = bg.l > 0.88 && bg.h >= 25 && bg.h <= 65 && bg.s >= 0.12;
    if (cream && isSerif(d.type?.display)) warnings.push({ kind: 'ai-look', message: `Cream ground with a serif display${pr.h <= 35 && pr.s > 0.4 ? ' and a terracotta accent' : ''}: one of the looks AI-generated UI clusters around. Fine if the brief asks for it; otherwise derive the palette from the audience's own world.` });
    const neon = bg.l < 0.12 && pr.s > 0.8 && pr.l > 0.45 && pr.l < 0.8 && ((pr.h >= 70 && pr.h <= 200) || (pr.h >= 280 && pr.h <= 330));
    if (neon) warnings.push({ kind: 'ai-look', message: 'Near-black with one neon accent: one of the looks AI-generated UI clusters around.' });
  }
  const neutrals = ['bg', 'surface-sunken', 'border'].filter((k) => ok(k) && !/^#f{3}(f{3})?$|^#0{3}(0{3})?$/i.test(c[k]));
  if (neutrals.length >= 2 && neutrals.every((k) => hsl(c[k]).s < 0.05)) warnings.push({ kind: 'untinted-neutrals', message: 'The neutrals are pure grey. A slight tint toward the primary hue reads as chosen rather than default.' });
  return { id: d.id, errors, warnings, contrast: table };
}

/** Pairs of directions too alike to be a real choice. */
export function compareDirections(dirs) {
  const out = [];
  for (let i = 0; i < dirs.length; i++) for (let j = i + 1; j < dirs.length; j++) {
    const a = dirs[i]; const b = dirs[j]; let score = 0;
    if (a.type?.display?.family === b.type?.display?.family) score++;
    if (HEX.test(a.colors?.primary) && HEX.test(b.colors?.primary) && hueGap(hsl(a.colors.primary).h, hsl(b.colors.primary).h) < 25) score++;
    if (HEX.test(a.colors?.bg) && HEX.test(b.colors?.bg) && Math.abs(hsl(a.colors.bg).l - hsl(b.colors.bg).l) < 0.1) score++;
    if (a.shape?.depth === b.shape?.depth && a.shape?.radius?.md === b.shape?.radius?.md) score++;
    if (score >= 3) out.push({ kind: 'too-similar', message: `${a.name} and ${b.name} are too alike to be a real choice (display face, primary hue, ground and shape). Make one of them a different idea.` });
  }
  return out;
}

const familyCss = (f) => (f ? `"${f.family}", ${f.fallback || 'system-ui, sans-serif'}` : null);
function shadows(d) {
  const [r, g, b] = rgb(HEX.test(d.colors.ink) ? d.colors.ink : '#000000');
  const a = (x) => `rgb(${r} ${g} ${b} / ${x})`;
  switch (d.shape?.depth) {
    case 'flat': return { sm: 'none', md: 'none' };
    case 'layered': return { sm: `0 1px 2px ${a(0.12)}, 0 2px 6px ${a(0.08)}`, md: `0 2px 4px ${a(0.1)}, 0 12px 32px ${a(0.16)}` };
    default: return { sm: `0 1px 2px ${a(0.08)}`, md: `0 4px 16px ${a(0.1)}` };
  }
}

/** Google Fonts stylesheet URL for the faces a set of directions uses, or null. */
export function googleFontsUrl(dirs) {
  const fams = new Map();
  for (const d of dirs) for (const f of [d.type?.display, d.type?.body, d.type?.mono]) if (f?.google && f.family) { const s = fams.get(f.family) || new Set(); s.add(f.weight || 400); if (f === d.type.body) s.add(600); fams.set(f.family, s); }
  if (!fams.size) return null;
  return `https://fonts.googleapis.com/css2?${[...fams].map(([fam, w]) => `family=${fam.replace(/ /g, '+')}:wght@${[...w].sort((x, y) => x - y).join(';')}`).join('&')}&display=swap`;
}

/** Every custom property of a direction, in order: [name, value]. */
export function tokenEntries(d) {
  const t = d.type || {}; const base = t.base || 16; const ratio = t.ratio || 1.25; const unit = d.space?.unit || 4;
  const out = [];
  for (const [k, v] of Object.entries(d.colors || {})) out.push([`--color-${k}`, v]);
  for (const role of ['display', 'body', 'mono']) if (t[role]) { out.push([`--font-${role}`, familyCss(t[role])]); out.push([`--weight-${role}`, String(t[role].weight || 400)]); }
  for (const [name, step] of TEXT_STEPS) out.push([`--text-${name}`, rem(base * ratio ** step)]);
  out.push(['--leading-body', String(t.lineHeight || 1.5)], ['--leading-tight', '1.2']);
  (DENSITY[d.space?.density] || DENSITY.balanced).forEach((m, i) => out.push([`--space-${SPACE_NAMES[i]}`, rem(m * unit)]));
  out.push(['--space-size-24', rem(24)], ['--space-size-target', rem(d.space?.target || 44)]);
  for (const [k, v] of Object.entries(BREAKPOINTS)) out.push([`--space-breakpoint-${k}`, v]);
  for (const [k, v] of Object.entries(d.shape?.radius || {})) out.push([`--radius-${k}`, rem(v)]);
  out.push(['--radius-full', '999px'], ['--border-width', `${d.shape?.border ?? 1}px`]);
  for (const [k, v] of Object.entries(shadows(d))) out.push([`--shadow-${k}`, v]);
  return out;
}

/** The project's token file for a direction. */
export function tokensCss(d) {
  const url = googleFontsUrl([d]);
  return `/* Design tokens: ${d.name}. ${d.thesis || ''}
   Written by reax from the chosen direction; this file owns the values, DESIGN.md describes them.${url ? `\n   Fonts: load ${url}\n   (a <link> in the HTML head, or self-host the same faces).` : ''} */
:root {
${tokenEntries(d).map(([k, v]) => `  ${k}: ${v};`).join('\n')}
}
`;
}

/** A draft for the DESIGN.md writer (lib/write.mjs) whose tokens point at the real custom properties in the token file. */
export function designDraft(d, { tokenFile, componentsDir = 'src/components', product } = {}) {
  const css = tokensCss(d); const lines = css.split('\n');
  const lineOf = (name) => lines.findIndex((l) => l.trimStart().startsWith(`${name}:`)) + 1;
  const val = Object.fromEntries(tokenEntries(d));
  const tokens = { colors: { ...d.colors }, typography: {}, spacing: {}, rounded: {} };
  const sources = {}; const src = (p, name) => { sources[p] = { file: tokenFile, line: lineOf(name), css: name }; };
  for (const k of Object.keys(d.colors)) src(`colors.${k}`, `--color-${k}`);
  for (const role of ['display', 'body', 'mono']) {
    const f = d.type?.[role]; if (!f) continue;
    tokens.typography[role] = { fontFamily: val[`--font-${role}`], fontWeight: f.weight || 400, ...(role === 'body' ? { fontSize: val['--text-base'], lineHeight: d.type.lineHeight || 1.5 } : {}) };
    src(`typography.${role}`, `--font-${role}`);
  }
  for (const [name] of TEXT_STEPS) { tokens.typography[`size-${name}`] = { fontSize: val[`--text-${name}`] }; src(`typography.size-${name}`, `--text-${name}`); }
  for (const n of SPACE_NAMES) { tokens.spacing[n] = val[`--space-${n}`]; src(`spacing.${n}`, `--space-${n}`); }
  tokens.spacing.size = { 24: val['--space-size-24'], target: val['--space-size-target'] }; src('spacing.size.24', '--space-size-24'); src('spacing.size.target', '--space-size-target');
  tokens.spacing.breakpoint = { ...BREAKPOINTS }; for (const k of Object.keys(BREAKPOINTS)) src(`spacing.breakpoint.${k}`, `--space-breakpoint-${k}`);
  for (const k of Object.keys(d.shape?.radius || {})) { tokens.rounded[k] = val[`--radius-${k}`]; src(`rounded.${k}`, `--radius-${k}`); }
  tokens.rounded.full = '999px'; src('rounded.full', '--radius-full');
  const { screen, ...record } = d;
  return {
    name: product || d.name, description: d.thesis,
    prose: {
      overview: [d.thesis, d.scene, d.references?.length ? `Sits beside ${d.references.join(' and ')}.` : ''].filter(Boolean).join(' '),
      doDont: [
        `- Do keep to the ${d.space?.density || 'balanced'} spacing scale and the ${Object.keys(d.shape?.radius || {}).length} radii.`,
        `- Do use \`primary\` for the one main action on a screen; ${d.shape?.depth === 'flat' ? 'separate surfaces with borders and tints, not shadows' : `use ${d.shape?.depth || 'soft'} shadows only to lift surfaces above the page`}.`,
        '- Don\'t add a colour, size or radius that is not a token: add the token first.',
        '- Don\'t put muted text on a tinted surface without checking it still meets 4.5:1.',
      ].join('\n'),
    },
    tokens,
    gaps: ['Dark theme: not designed yet.', 'Motion: not part of the direction; respect prefers-reduced-motion and keep transitions short.'],
    scan: { tokenFiles: [tokenFile], componentsDir },
    sidecar: { language: { framework: 'react', styling: 'css-vars' }, inventory: [], tokenSources: sources, shadows: shadows(d), themes: [], direction: record },
  };
}

const SPECIMEN_CSS = `
.sp { background: var(--color-bg); color: var(--color-ink); font-family: var(--font-body); font-weight: var(--weight-body); font-size: var(--text-base); line-height: var(--leading-body); padding-block: var(--space-xl); padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); border-top: 1px solid var(--color-border); }
.sp-inner { max-width: 1120px; margin: 0 auto; display: grid; gap: var(--space-xl); }
.sp h2, .sp h3, .sp .sp-display { font-family: var(--font-display); font-weight: var(--weight-display); line-height: var(--leading-tight); margin: 0; text-wrap: balance; }
.sp h2 { font-size: var(--text-3xl); } .sp h3 { font-size: var(--text-lg); }
.sp p { margin: 0; max-width: 65ch; } .sp-muted { color: var(--color-ink-muted); }
.sp-head { display: grid; gap: var(--space-sm); }
.sp-grid { display: grid; gap: var(--space-lg); grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); align-items: start; }
.sp-panel { background: var(--color-surface); border: var(--border-width) solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); display: grid; gap: var(--space-md); min-width: 0; box-shadow: var(--shadow-sm); }
.sp-screen { background: var(--color-bg); border: var(--border-width) solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); min-width: 0; overflow: hidden; }
.sp-row { display: flex; flex-wrap: wrap; gap: var(--space-sm); align-items: center; }
.sp-btn { min-height: var(--space-size-target); padding: 0 var(--space-md); border-radius: var(--radius-md); border: var(--border-width) solid transparent; font: inherit; font-weight: 600; cursor: pointer; background: var(--color-primary); color: var(--color-on-primary); }
.sp-btn--secondary { background: var(--color-surface); color: var(--color-ink); border-color: var(--color-control); }
.sp-btn--ghost { background: transparent; color: var(--color-primary); }
.sp-btn:focus-visible, .sp-input:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
.sp-btn[disabled] { opacity: 0.55; cursor: not-allowed; }
.sp-field { display: grid; gap: var(--space-xs); } .sp-label { font-weight: 600; font-size: var(--text-sm); } .sp-hint { font-size: var(--text-sm); color: var(--color-ink-muted); } .sp-error { font-size: var(--text-sm); color: var(--color-danger); }
.sp-input { min-height: var(--space-size-target); padding: 0 var(--space-sm); border-radius: var(--radius-sm); border: var(--border-width) solid var(--color-control); background: var(--color-surface); color: var(--color-ink); font: inherit; width: 100%; min-width: 0; }
.sp-input[aria-invalid="true"] { border-color: var(--color-danger); }
.sp-check { display: flex; gap: var(--space-sm); align-items: center; min-height: var(--space-size-target); } .sp-check input { accent-color: var(--color-primary); width: 1.25rem; height: 1.25rem; }
.sp-switch { display: inline-flex; align-items: center; gap: var(--space-sm); } .sp-track { width: 2.75rem; height: 1.5rem; border-radius: var(--radius-full); background: var(--color-primary); position: relative; } .sp-track::after { content: ""; position: absolute; top: 0.1875rem; right: 0.1875rem; width: 1.125rem; height: 1.125rem; border-radius: 50%; background: var(--color-on-primary); }
.sp-card { background: var(--color-surface); border: var(--border-width) solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); display: grid; gap: var(--space-xs); box-shadow: var(--shadow-sm); }
.sp-badge { justify-self: start; display: inline-flex; align-items: center; padding: 0 var(--space-sm); min-height: 1.5rem; border-radius: var(--radius-full); background: var(--color-surface-sunken, var(--color-border)); color: var(--color-ink); font-size: var(--text-sm); }
.sp-dialog { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-lg); display: grid; gap: var(--space-md); box-shadow: var(--shadow-md); border: var(--border-width) solid var(--color-border); }
.sp-toast { background: var(--color-ink); color: var(--color-bg); border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); box-shadow: var(--shadow-md); }
.sp-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr)); gap: var(--space-sm); }
.sp-swatch { border: var(--border-width) solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; font-size: var(--text-xs); background: var(--color-surface); }
.sp-swatch i { display: block; height: 3rem; } .sp-swatch span { display: block; padding: var(--space-xs); font-variant-numeric: tabular-nums; }
.sp-scale { display: grid; gap: var(--space-xs); } .sp-scale div { display: flex; gap: var(--space-md); align-items: baseline; min-width: 0; } .sp-scale code { width: 4rem; flex: none; font-size: var(--text-xs); color: var(--color-ink-muted); }
.sp-bars { display: flex; flex-wrap: wrap; gap: var(--space-sm); align-items: flex-end; } .sp-bars i { display: block; background: var(--color-primary); }
.sp-notes { margin: 0; padding-left: 1.2em; font-size: var(--text-sm); } .sp-notes li + li { margin-top: var(--space-xs); }
.sp-ok { color: var(--color-ink-muted); } .sp-warn { color: var(--color-danger); }
`;

// the contrast that matters for a swatch: text and UI colours against the ground, on-primary against primary;
// grounds and decorative borders show none
function swatchContrast(d, k, hex) {
  const against = k === 'on-primary' ? 'primary' : ['bg', 'surface', 'surface-sunken', 'border'].includes(k) ? null : 'bg';
  if (!against || !HEX.test(hex) || !HEX.test(d.colors[against] || '')) return '';
  return ` · ${Math.round(contrast(hex, d.colors[against]) * 10) / 10}:1 on ${against}`;
}

/**
 * The specimen page: every direction, one after another, each in its own scoped tokens, showing the person's first
 * screen (a shared HTML fragment that uses the .sp-* classes), core components, palette with contrast, type, spacing
 * and shape. No scripts; publishable as is.
 */
export function renderSpecimen(dirs, { product = 'Your product', screen = '' } = {}) {
  const url = googleFontsUrl(dirs);
  const scoped = dirs.map((d) => `[data-direction="${esc(d.id)}"] {\n${tokenEntries(d).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`).join('\n');
  const similar = compareDirections(dirs);
  const sections = dirs.map((d) => {
    const v = validateDirection(d);
    const notes = [...v.errors.map((e) => `<li class="sp-warn">${esc(e)}</li>`), ...v.warnings.map((w) => `<li>${esc(w.message)}</li>`)];
    const swatches = Object.entries(d.colors).map(([k, hex]) => `<div class="sp-swatch"><i style="background:${esc(hex)}"></i><span><strong>${esc(k)}</strong><br>${esc(hex)}${swatchContrast(d, k, hex)}</span></div>`).join('');
    const scale = TEXT_STEPS.slice().reverse().map(([n]) => `<div><code>${n}</code><span style="font-size:var(--text-${n});${['3xl', '2xl', 'xl'].includes(n) ? 'font-family:var(--font-display);font-weight:var(--weight-display);line-height:var(--leading-tight)' : ''}">${esc(product)}</span></div>`).join('');
    const space = SPACE_NAMES.map((n) => `<i title="space-${n}" style="width:var(--space-${n});height:var(--space-${n})"></i>`).join('');
    const radii = Object.keys(d.shape?.radius || {}).map((k) => `<div class="sp-card" style="border-radius:var(--radius-${k});padding:var(--space-sm)"><code>radius-${esc(k)}</code></div>`).join('');
    return `<section class="sp" data-direction="${esc(d.id)}" aria-labelledby="h-${esc(d.id)}">
<div class="sp-inner">
<header class="sp-head"><h2 id="h-${esc(d.id)}">${esc(d.name)}</h2><p>${esc(d.thesis)}</p><p class="sp-muted">${esc(d.scene)}${d.references?.length ? ` Sits beside ${esc(d.references.join(' and '))}.` : ''} ${esc(d.type.display.family)} with ${esc(d.type.body.family)}; ${esc(d.space?.density || 'balanced')} spacing; ${esc(d.shape?.depth || 'soft')} depth.</p>${notes.length ? `<ul class="sp-notes">${notes.join('')}</ul>` : '<p class="sp-ok">Every contrast pair passes WCAG 2.2 AA.</p>'}</header>
<div class="sp-screen">${screen}</div>
<div class="sp-grid">
<div class="sp-panel"><h3>Actions</h3><div class="sp-row"><button class="sp-btn" type="button">Save changes</button><button class="sp-btn sp-btn--secondary" type="button">Cancel</button><button class="sp-btn sp-btn--ghost" type="button">Learn more</button></div><div class="sp-row"><button class="sp-btn" type="button" disabled>Disabled</button><span class="sp-badge">Draft</span></div></div>
<div class="sp-panel"><h3>Form</h3><div class="sp-field"><label class="sp-label" for="e-${esc(d.id)}">Email</label><input class="sp-input" id="e-${esc(d.id)}" type="email" value="ada@example.com"><span class="sp-hint">We only use it to sign you in.</span></div><div class="sp-field"><label class="sp-label" for="n-${esc(d.id)}">Name</label><input class="sp-input" id="n-${esc(d.id)}" aria-invalid="true" aria-describedby="ne-${esc(d.id)}"><span class="sp-error" id="ne-${esc(d.id)}">Enter your name.</span></div><label class="sp-check"><input type="checkbox" checked> Keep me signed in</label><span class="sp-switch"><span class="sp-track" aria-hidden="true"></span>Notifications on</span></div>
<div class="sp-panel"><h3>Surfaces</h3><div class="sp-card"><strong>Weekly summary</strong><span class="sp-muted">12 tasks done, 3 waiting on others.</span></div><div class="sp-dialog" role="group" aria-label="Dialog example"><strong class="sp-display" style="font-size:var(--text-lg)">Delete this project?</strong><span class="sp-muted">Its 24 files go too. This cannot be undone.</span><div class="sp-row"><button class="sp-btn" type="button">Delete</button><button class="sp-btn sp-btn--secondary" type="button">Keep it</button></div></div><div class="sp-toast" role="status">Saved just now</div></div>
</div>
<div class="sp-grid">
<div class="sp-panel"><h3>Palette</h3><div class="sp-swatches">${swatches}</div></div>
<div class="sp-panel"><h3>Type</h3><div class="sp-scale">${scale}</div></div>
<div class="sp-panel"><h3>Space and shape</h3><div class="sp-bars">${space}</div><div class="sp-grid" style="gap:var(--space-sm)">${radii}</div></div>
</div>
</div>
</section>`;
  }).join('\n');
  return page({
    title: `${product} directions`,
    head: url ? `<link rel="stylesheet" href="${esc(url)}">` : '',
    base: false,
    css: `.intro { padding-block: 32px 24px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); max-width: 1152px; margin: 0 auto; display: grid; gap: 8px; }
.intro h1 { margin: 0; font-size: 1.75rem; text-wrap: balance; } .intro p { margin: 0; color: var(--muted); max-width: 70ch; }
${scoped}
${SPECIMEN_CSS}`,
    body: `<div class="intro"><h1>${esc(product)}: ${dirs.length} direction${dirs.length === 1 ? '' : 's'}</h1><p>Each direction below is a complete system shown on your first screen and the core components. Pick one, or say what to change ("calmer", "more like the second, warmer"). Nothing is written to your project until you choose.</p>${similar.map((w) => `<p>${esc(w.message)}</p>`).join('')}</div>
${sections}`,
  });
}

