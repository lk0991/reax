// "Does this still look like us?" as an automatic check (spec #46): the code of a screen or component against the
// direction's rules. Raw colours, spacing off the scale, type sizes off the scale, radii off the scale, and more than one
// primary action in a file. Findings are Should fix: they are the direction's rules, not accessibility Requirements.
// Pure: takes source text and the loaded design's tokens.
const CODE = /\.(css|scss|sass|less|tsx|jsx|ts|js)$/;
const STYLE = /\.(css|scss|sass|less)$/;
const toPx = (v) => { const m = String(v).trim().match(/^(-?\d*\.?\d+)(px|rem|em)?$/); if (!m) return null; return m[2] === 'rem' || m[2] === 'em' ? +m[1] * 16 : +m[1]; };
const isColour = (s) => /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s);
const rgbOf = (hex) => { let h = hex.slice(1); if (h.length <= 4) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const dist = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const px = (n) => `${+(n).toFixed(2)}px`;

/** The opening tag of every capitalised <Button>, read whole: braces and quotes are tracked, so a `>` inside a prop
 * (an arrow function, a comparison) does not end it. */
function buttonTags(text) {
  const out = []; const re = /<Button(?![\w.])/g; let m;
  while ((m = re.exec(text))) {
    let i = m.index + 7; let depth = 0; let quote = null;
    for (; i < text.length; i++) {
      const c = text[i];
      if (quote) { if (c === quote && text[i - 1] !== '\\') quote = null; continue; }
      if (c === '"' || c === "'" || c === '`') quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) break;
    }
    out.push({ index: m.index, tag: text.slice(m.index, i) });
    re.lastIndex = i;
  }
  return out;
}

/** Remove comments and var(...) (a token reference, fallback included), keeping line breaks so line numbers hold. */
function clean(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/var\([^()]*(\([^()]*\)[^()]*)*\)/g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * @param files   [{ path, text }]  the changed code files
 * @param design  loadDesign() output: tokens by path, each { group, resolved, css }
 */
export function fitCheck(files, design = {}) {
  const code = files.filter((f) => CODE.test(f.path));
  // nothing to check is not a gap: there is no code that could stray
  if (!code.length) return { status: 'n/a', note: 'No style or component code changed, so there was nothing to check.', findings: [] };
  const tokens = Object.values(design.tokens || {});
  const colours = tokens.filter((t) => t.group === 'colors' && isColour(String(t.resolved)));
  const spacing = tokens.filter((t) => t.group === 'spacing' && !/breakpoint/.test(t.path) && toPx(t.resolved) !== null);
  const sizes = tokens.filter((t) => t.group === 'typography').map((t) => ({ css: t.css, value: typeof t.resolved === 'object' ? t.resolved.fontSize : null })).filter((t) => t.value && toPx(t.value) !== null);
  const radii = tokens.filter((t) => t.group === 'rounded' && toPx(t.resolved) !== null);
  if (!colours.length && !spacing.length && !sizes.length && !radii.length) return { status: 'not-run', reason: 'The project has no tokens to check against.', howTo: 'Run direction to give the project its own tokens.', findings: [] };

  const findings = []; const add = (file, line, kind, found, message) => findings.push({ file, line, kind, found, message });
  const nearest = (list, value) => list.reduce((best, t) => (Math.abs(toPx(t.value ?? t.resolved) - value) < Math.abs(toPx(best.value ?? best.resolved) - value) ? t : best));
  for (const f of code) {
    const text = clean(f.text).split('\n');
    text.forEach((l, i) => {
      const line = i + 1;
      for (const m of l.matchAll(/(?<![&\w/])#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)/g)) {
        const v = m[0];
        // an in-page link (href="#add") is not a colour
        if (v[0] === '#' && !STYLE.test(f.path) && /\b(href|to|src|id|htmlFor|for)\s*=\s*\{?\s*["'`]$/.test(l.slice(0, m.index))) continue;
        if (!isColour(v)) { add(f.path, line, 'colour', v, `Uses ${v}, a colour that is not a token. Use one of the project's colour tokens.`); continue; }
        const exact = colours.find((t) => String(t.resolved).toLowerCase() === v.toLowerCase());
        if (exact) { add(f.path, line, 'colour', v, `Uses ${v} directly: use var(${exact.css}), which is that colour.`); continue; }
        if (!colours.length) continue;
        const best = colours.reduce((b, t) => (dist(rgbOf(String(t.resolved)), rgbOf(v)) < dist(rgbOf(String(b.resolved)), rgbOf(v)) ? t : b));
        add(f.path, line, 'colour', v, `Uses ${v}, which is not one of the project's colours. The nearest is var(${best.css}) (${best.resolved}).`);
      }
      if (!STYLE.test(f.path) && !/style=|css`|styled/.test(l)) return;
      const decl = [...l.matchAll(/(^|[\s{;])(margin(?:-[a-z]+)?|padding(?:-[a-z]+)?|gap|row-gap|column-gap|font-size|border(?:-[a-z]+)*-radius)\s*:\s*([^;}]+)/g)];
      for (const d of decl) {
        const prop = d[2];
        // look at each part of the value: skip calc() and friends and !important, check the rest
        const value = d[3].replace(/!important/g, ' ').replace(/\b(?:calc|clamp|min|max)\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ' ').trim();
        if (!value) continue;
        if (prop === 'font-size') {
          const n = toPx(value); if (n === null || !sizes.length) continue;
          if (!sizes.some((t) => Math.abs(toPx(t.value) - n) < 0.01)) { const b = nearest(sizes, n); add(f.path, line, 'type', value, `Font size ${value} is not on the project's type scale. The nearest is var(${b.css}) (${b.value}).`); }
        } else if (prop.endsWith('radius')) {
          for (const part of value.split(/\s+/)) {
            const n = toPx(part); if (n === null || n === 0 || n >= 999 || !radii.length) continue;
            if (!radii.some((t) => Math.abs(toPx(t.resolved) - n) < 0.01)) { const b = nearest(radii, n); add(f.path, line, 'radius', part, `Corner radius ${part} is not one of the project's. The nearest is var(${b.css}) (${b.resolved}).`); }
          }
        } else if (spacing.length) {
          for (const part of value.split(/\s+/)) {
            const n = toPx(part); if (n === null || n === 0) continue;
            if (!spacing.some((t) => Math.abs(toPx(t.resolved) - n) < 0.01)) { const b = nearest(spacing, n); add(f.path, line, 'spacing', part, `Spacing ${part}${part === px(n) ? '' : ` (${px(n)})`} is not on the project's spacing scale. The nearest is var(${b.css}) (${b.resolved}).`); }
          }
        }
      }
    });
    // one primary action per screen: capitalised <Button> elements with no variant, or variant="primary"
    if (/\.(tsx|jsx)$/.test(f.path)) {
      const primaries = buttonTags(f.text).filter((t) => !/\bvariant\s*=/.test(t.tag) || /\bvariant\s*=\s*(["'`]|\{\s*["'`])primary/.test(t.tag));
      if (primaries.length > 1) add(f.path, f.text.slice(0, primaries[1].index).split('\n').length, 'primary-action', String(primaries.length), `${primaries.length} primary buttons in one screen: the main action should be clear. Make the others secondary or ghost.`);
    }
  }
  return { status: findings.length ? 'concern' : 'pass', findings };
}
