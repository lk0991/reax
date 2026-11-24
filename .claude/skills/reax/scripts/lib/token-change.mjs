// Changing a token's value, for a design-system owner (spec #35, ADR 0008): the change is made where the project keeps
// the value (the token file, at the line the Design sidecar records, keeping the project's custom property name), then
// in DESIGN.md (only the value, inside its YAML block, so the person's prose stays), then the sidecar's hashes. A value
// that would newly break a contrast pair is refused with the nearest value that passes. A trial keeps a backup, so the
// person can see the impact and then keep or undo it exactly.
import fs from 'node:fs';
import path from 'node:path';
import { req, readJson, writeJson } from './runtime.mjs';
import { loadDesign, currentHashes } from './design.mjs';
import { contrast } from './direction.mjs';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const TRIAL = (root) => path.join(root, 'visual-report', 'token-trial');
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// `name: value` up to a semicolon or the end of the line (a last declaration may have none)
const declaration = (name) => new RegExp(`(${escRe(name)}\\s*:\\s*)([^;\\n]+?)(\\s*(?:;|$))`);
const leaf = (p) => p.split('.').pop();
const isGround = (n) => !n.startsWith('on-') && /(^|-)(bg|background|surface|paper|canvas|base)(-|$)/.test(n);
const isText = (n) => n.startsWith('on-') || /(^|-)(ink|text|fg|foreground|muted|body|heading)(-|$)/.test(n);
const isAccent = (n) => /(^|-)(primary|brand|accent|focus|control|danger|error|success|warning|link)(-|$)/.test(n);

/** The contrast pairs a set of colour tokens should meet, found by the usual names. */
export function contrastPairs(paths) {
  const colors = paths.filter((p) => p.startsWith('colors.'));
  const grounds = colors.filter((p) => isGround(leaf(p)));
  const out = []; const add = (fg, bg, need, sc) => { if (fg !== bg && !out.some((x) => x.fg === fg && x.bg === bg)) out.push({ fg, bg, need, sc }); };
  for (const p of colors) {
    const n = leaf(p);
    if (n.startsWith('on-')) {
      const target = colors.find((q) => leaf(q) === n.slice(3));
      if (target) add(p, target, 4.5, '1.4.3');
      if (target && !isGround(leaf(target))) continue; // on-primary is read on primary only
    }
    if (isText(n)) for (const g of grounds) add(p, g, 4.5, '1.4.3');
    else if (isAccent(n)) for (const g of grounds) add(p, g, 3, '1.4.11');
  }
  return out;
}

function hsl(hex) {
  let h = hex.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2; if (max === min) return [0, 0, l];
  const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, s, l];
}
function hex([h, s, l]) {
  const k = (n) => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))).toString(16).padStart(2, '0');
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** The nearest colour to `value` (same hue and saturation, lightness moved as little as possible) passing every pair. */
function nearest(value, check) {
  const [h, s, l] = hsl(value);
  for (let step = 0.005; step <= 1; step += 0.005) for (const dir of [-1, 1]) {
    const nl = l + dir * step; if (nl < 0 || nl > 1) continue;
    const c = hex([h, s, nl]); if (check(c)) return c;
  }
  return null;
}

/** What a change would do: edits to make, and errors (with the nearest passing value) for values it refuses. */
export function planTokenChange(root, changes) {
  const design = loadDesign(root, { root });
  const edits = []; const errors = [];
  // colours as written (references kept), resolved twice: as they are, and with the proposed changes, so a token that
  // refers to a changed one ({colors.primary}) is checked with its new value
  const raw = Object.fromEntries(Object.values(design.tokens).filter((t) => t.group === 'colors').map((t) => [t.path, t.value]));
  const resolveAll = (vals) => { const out = {}; const get = (k, seen = []) => { const v = vals[k]; const m = typeof v === 'string' && v.match(/^\{([\w.-]+)\}$/); return m && !seen.includes(k) ? get(m[1], [...seen, k]) : v; }; for (const k of Object.keys(vals)) out[k] = get(k); return out; };
  const refersTo = (k, target, seen = []) => { const m = typeof raw[k] === 'string' && raw[k].match(/^\{([\w.-]+)\}$/); return !!m && !seen.includes(k) && (m[1] === target || refersTo(m[1], target, [...seen, k])); };
  const now = resolveAll(raw);
  const next = resolveAll({ ...raw, ...Object.fromEntries(Object.entries(changes).filter(([p]) => p.startsWith('colors.'))) });
  const pairs = contrastPairs(Object.keys(next));
  for (const [p, to] of Object.entries(changes)) {
    const t = design.tokens[p];
    if (!t) { errors.push({ path: p, message: `There is no token ${p} in DESIGN.md.` }); continue; }
    const src = design.tokenSources[p];
    if (!src?.file || !src?.css) { errors.push({ path: p, message: `${p} has no recorded place in a token file. Run init so it is recorded.` }); continue; }
    if (p.startsWith('colors.')) {
      if (!HEX.test(to)) { errors.push({ path: p, message: `${p}: use a hex colour such as #1f4f9a, not "${to}".` }); continue; }
      const touches = (k) => k === p || refersTo(k, p);
      const mine = pairs.filter((x) => (touches(x.fg) || touches(x.bg)) && HEX.test(next[x.fg] || '') && HEX.test(next[x.bg] || ''));
      const ratio = (x, vals) => contrast(vals[x.fg], vals[x.bg]);
      const broken = mine.filter((x) => ratio(x, next) < x.need && (!HEX.test(now[x.fg] || '') || !HEX.test(now[x.bg] || '') || ratio(x, now) >= x.need || ratio(x, next) < ratio(x, now)));
      if (broken.length) {
        const passes = (c) => mine.every((x) => { const v = resolveAll({ ...raw, ...Object.fromEntries(Object.entries(changes).filter(([q]) => q.startsWith('colors.'))), [p]: c }); return ratio(x, v) >= x.need || (HEX.test(now[x.fg] || '') && HEX.test(now[x.bg] || '') && ratio(x, now) < x.need && ratio(x, v) >= ratio(x, now)); });
        errors.push({ path: p, message: broken.map((x) => `${leaf(x.fg)} on ${leaf(x.bg)} would be ${Math.round(ratio(x, next) * 100) / 100}:1; it needs ${x.need}:1 (WCAG 2.2 SC ${x.sc}).`).join(' '), nearest: nearest(to, passes) });
        continue;
      }
    }
    const file = path.join(root, src.file); const lines = fs.readFileSync(file, 'utf8').split('\n');
    let i = src.line - 1;
    if (!lines[i]?.includes(`${src.css}:`)) i = lines.findIndex((l) => l.trimStart().startsWith(`${src.css}:`));
    if (i < 0) { errors.push({ path: p, message: `Could not find "${src.css}: <value>" in ${src.file}, so the change cannot be written there. Change it by hand, or run init to record where it is.` }); continue; }
    const from = lines[i]?.match(declaration(src.css))?.[2]?.trim();
    if (from === undefined) { errors.push({ path: p, message: `Could not find "${src.css}: <value>" in ${src.file}, so the change cannot be written there. Change it by hand, or run init to record where it is.` }); continue; }
    edits.push({ path: p, file: src.file, line: i + 1, css: src.css, from, to: String(to) });
  }
  return { edits, errors };
}

function setIn(obj, keys, value) { let o = obj; for (const k of keys.slice(0, -1)) o = o[k]; o[keys.at(-1)] = value; }

/** Write a planned change. With `trial`, keep a backup so undoTokenChange can restore everything exactly. */
export function applyTokenChange(root, plan, { trial = false } = {}) {
  if (!plan.edits.length) return;
  const designPath = path.join(root, 'DESIGN.md'); const sidecarPath = path.join(root, '.reax', 'design.json');
  const touched = [...new Set([...plan.edits.map((e) => e.file), 'DESIGN.md', '.reax/design.json'])];
  if (trial) {
    if (fs.existsSync(TRIAL(root))) throw new Error('A token-change trial is already open: keep it or undo it first.');
    writeJson(path.join(TRIAL(root), 'backup.json'), { createdAt: new Date().toISOString(), edits: plan.edits, files: Object.fromEntries(touched.map((f) => [f, fs.readFileSync(path.join(root, f), 'utf8')])) });
  }
  // DESIGN.md first, in memory: only the YAML (front matter or fenced blocks) that holds each token, the prose around it
  // untouched. Every token must be found before anything is written.
  const { parse, stringify } = req('yaml', root);
  const original = fs.readFileSync(designPath, 'utf8'); const crlf = original.includes('\r\n');
  const found = new Set();
  const rewrite = (body) => {
    let doc; try { doc = parse(body); } catch { return null; }
    const mine = plan.edits.filter((e) => doc && typeof doc === 'object' && e.path.split('.')[0] in doc);
    if (!mine.length) return null;
    for (const e of mine) { setIn(doc, e.path.split('.'), e.to); found.add(e.path); }
    return stringify(doc, { lineWidth: 0 }).trimEnd();
  };
  let md = original.replace(/\r\n/g, '\n');
  md = md.replace(/^---\n([\s\S]*?)\n---/, (all, body) => { const r = rewrite(body); return r === null ? all : `---\n${r}\n---`; });
  md = md.replace(/^(\s*```ya?ml[ \t]*\n)([\s\S]*?)(\n\s*```)/gm, (all, open, body, close) => { const r = rewrite(body); return r === null ? all : `${open}${r}${close}`; });
  const missing = plan.edits.filter((e) => !found.has(e.path)).map((e) => e.path);
  if (missing.length) throw new Error(`Could not find ${missing.join(', ')} in DESIGN.md; nothing was written.`);
  // 1. the token file, value only, at the recorded line
  for (const e of plan.edits) {
    const file = path.join(root, e.file); const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines[e.line - 1] = lines[e.line - 1].replace(declaration(e.css), `$1${e.to}$3`);
    fs.writeFileSync(file, lines.join('\n'));
  }
  // 2. DESIGN.md, with its own line endings
  fs.writeFileSync(designPath, crlf ? md.replace(/\n/g, '\r\n') : md);
  // 3. the sidecar's record of the token files, so DESIGN.md is not reported stale
  const side = readJson(sidecarPath, null);
  if (side?.scan) { side.scan.hashes = currentHashes(root, side.scan); fs.writeFileSync(sidecarPath, JSON.stringify(side, null, 2) + '\n'); }
}

/** Restore exactly what the open trial changed. */
export function undoTokenChange(root) {
  const b = readJson(path.join(TRIAL(root), 'backup.json'), null);
  if (!b) throw new Error('There is no trial to undo.');
  for (const [f, text] of Object.entries(b.files)) fs.writeFileSync(path.join(root, f), text);
  fs.rmSync(TRIAL(root), { recursive: true, force: true });
  return b.edits;
}

/** Keep the open trial: the change stays, the backup goes. */
export function keepTokenChange(root) {
  if (!fs.existsSync(TRIAL(root))) throw new Error('There is no trial to keep.');
  const b = readJson(path.join(TRIAL(root), 'backup.json'), { edits: [] });
  fs.rmSync(TRIAL(root), { recursive: true, force: true });
  return b.edits;
}
