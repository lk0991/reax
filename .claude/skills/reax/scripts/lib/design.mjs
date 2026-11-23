// The design loader: the one place that reads DESIGN.md and the sidecar (.reax/design.json).
// Decision (DESIGN.md schema, ADR 0001): DESIGN.md follows the open DESIGN.md format; reax adds sections (Language,
// Component inventory, Gaps) and keeps its own machine data in a sidecar. Nothing else in the skill parses the markdown.
import fs from 'node:fs';
import path from 'node:path';
import { req, sha1, readJson, findUp } from './runtime.mjs';

export const SPEC_SECTIONS = ['Overview', 'Colors', 'Typography', 'Layout', 'Elevation & Depth', 'Shapes', 'Motion & Micro-interaction', 'Voice & Content Strategy', 'Components', "Do's and Don'ts"];
export const REAX_SECTIONS = ['Language', 'Component inventory', 'Gaps'];
const ALIASES = { 'brand & style': 'Overview', 'layout & spacing': 'Layout', elevation: 'Elevation & Depth', motion: 'Motion & Micro-interaction', 'motion & micro-interactions': 'Motion & Micro-interaction' };
const TOKEN_GROUPS = ['colors', 'typography', 'spacing', 'rounded', 'components', 'motion'];
const TYPO_PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontFeature', 'fontVariation'];
const CSS_PREFIX = { colors: 'color', typography: 'type', spacing: 'space', rounded: 'radius', components: 'component', motion: 'motion' };

export const canonicalSection = (heading) => {
  const h = heading.trim();
  return ALIASES[h.toLowerCase()] || [...SPEC_SECTIONS, ...REAX_SECTIONS].find((s) => s.toLowerCase() === h.toLowerCase()) || h;
};

/** Split a DESIGN.md into front matter, fenced yaml blocks and h2 sections. */
export function parseDesignMarkdown(text) {
  const { parse } = req('yaml');
  const errors = []; const blocks = [];
  let body = text.replace(/\r\n/g, '\n');
  const fm = body.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) { blocks.push({ kind: 'frontmatter', source: fm[1], line: 1 }); body = body.slice(fm[0].length); }
  const lineOffset = fm ? fm[0].split('\n').length - 1 : 0;

  const sections = []; const lines = body.split('\n'); let inFence = false; let fenceLang = ''; let fenceStart = 0; let fenceBuf = [];
  lines.forEach((line, i) => {
    const fence = line.match(/^\s*```(\w*)/);
    if (fence) {
      if (!inFence) { inFence = true; fenceLang = fence[1]; fenceStart = i + 1; fenceBuf = []; return; }
      inFence = false;
      if (/^ya?ml$/i.test(fenceLang)) blocks.push({ kind: 'block', source: fenceBuf.join('\n'), line: fenceStart + lineOffset + 1 });
      return;
    }
    if (inFence) { fenceBuf.push(line); return; }
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) sections.push({ heading: h2[1], name: canonicalSection(h2[1]), line: i + 1 + lineOffset });
  });

  const seen = new Map();
  sections.forEach((s) => { if (seen.has(s.name)) errors.push({ kind: 'duplicate-section', message: `Two "${s.name}" sections (lines ${seen.get(s.name)} and ${s.line}). The format rejects this.` }); else seen.set(s.name, s.line); });

  const top = {}; const definedIn = {};
  for (const b of blocks) {
    let doc;
    try { doc = parse(b.source) || {}; } catch (e) { errors.push({ kind: 'yaml', message: `YAML at line ${b.line} could not be parsed: ${e.message.split('\n')[0]}` }); continue; }
    for (const [k, v] of Object.entries(doc)) {
      if (k in top) errors.push({ kind: 'duplicate-key', message: `Top-level key "${k}" is defined twice (line ${definedIn[k]} and line ${b.line}). The format rejects this.` });
      else { top[k] = v; definedIn[k] = b.line; }
    }
  }

  // sections in the format's order: spec sections first, then reax's own
  const order = sections.map((s) => s.name);
  const specIdx = order.map((n) => SPEC_SECTIONS.indexOf(n)).filter((i) => i >= 0);
  const warnings = [];
  if (specIdx.some((v, i) => i && v < specIdx[i - 1])) warnings.push({ kind: 'section-order', message: 'Sections are not in the format\'s order.' });
  const firstReax = order.findIndex((n) => REAX_SECTIONS.includes(n));
  if (firstReax >= 0 && order.slice(firstReax).some((n) => SPEC_SECTIONS.includes(n))) warnings.push({ kind: 'section-order', message: 'Reax sections (Language, Component inventory, Gaps) should come after the format\'s own sections.' });
  return { meta: { name: top.name, version: top.version, description: top.description }, top, sections, errors, warnings };
}

/** Flatten the token groups to dotted paths, resolve {references}, and detect name collisions. */
export function flattenTokens(top) {
  const flat = {}; const errors = [];
  const isLeaf = (group, v) => v === null || typeof v !== 'object' || (group === 'typography' && TYPO_PROPS.some((p) => p in v));
  const walk = (group, prefix, node) => {
    for (const [k, v] of Object.entries(node || {})) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (isLeaf(group, v)) flat[`${group}.${p}`] = { group, path: `${group}.${p}`, value: v, css: `--${CSS_PREFIX[group]}-${p.replace(/\./g, '-')}` };
      else walk(group, p, v);
    }
  };
  for (const g of TOKEN_GROUPS) if (top[g]) walk(g, '', top[g]);

  // flat hyphenated and nested names that produce the same CSS property are rejected by the format
  const byCss = new Map();
  for (const t of Object.values(flat)) {
    if (byCss.has(t.css) && byCss.get(t.css) !== t.path) errors.push({ kind: 'name-collision', message: `"${byCss.get(t.css)}" and "${t.path}" both become ${t.css}. The format rejects this.` });
    else byCss.set(t.css, t.path);
  }

  const resolve = (t, stack = []) => {
    if (typeof t.value !== 'string') return t.value;
    const m = t.value.match(/^\{([\w.-]+)\}$/);
    if (!m) return t.value;
    const target = flat[m[1]];
    if (!target) { errors.push({ kind: 'unresolved-reference', message: `${t.path} refers to {${m[1]}}, which does not exist.` }); return t.value; }
    if (stack.includes(t.path)) { errors.push({ kind: 'reference-cycle', message: `${[...stack, t.path].join(' -> ')} is a cycle.` }); return t.value; }
    return resolve(target, [...stack, t.path]);
  };
  for (const t of Object.values(flat)) t.resolved = resolve(t);
  return { flat, errors };
}

/** Hashes that tell whether the files DESIGN.md was derived from have changed since the scan. */
export function currentHashes(root, scan = {}) {
  const abs = (f) => path.join(root, f);
  const tokenFiles = (scan.tokenFiles || []).map(abs);
  let componentFiles = [];
  if (scan.componentsDir) {
    const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx|ts|jsx|css)$/.test(e.name) && !/\.stories\./.test(e.name) ? [path.join(d, e.name)] : [])) : []);
    componentFiles = walk(abs(scan.componentsDir));
  }
  // token files: their content is what DESIGN.md summarises. Components: only which files exist, because the
  // inventory records names and paths; editing a component's code or styles is not drift.
  const list = componentFiles.map((f) => path.relative(root, f).split(path.sep).join('/')).sort().join('\n');
  // hash content under project-relative names, so the root's spelling (relative or absolute) does not matter
  const rel = (f) => path.relative(root, f).split(path.sep).join('/');
  const tokens = sha1(tokenFiles.map((f) => rel(f)).sort().map((r) => `${r}\0${fs.existsSync(path.join(root, r)) ? sha1(fs.readFileSync(path.join(root, r))) : 'missing'}`).join('\n'));
  return { tokens, components: sha1(list) };
}

export function checkStale(root, sidecar) {
  if (!sidecar?.scan) return { stale: false, reasons: [], unknown: true };
  const now = currentHashes(root, sidecar.scan); const was = sidecar.scan.hashes || {}; const reasons = [];
  if (was.tokens && now.tokens !== was.tokens) reasons.push('A token source file changed since DESIGN.md was written.');
  if (was.components && now.components !== was.components) reasons.push('Component files were added, renamed or removed since the inventory was written.');
  return { stale: reasons.length > 0, reasons, now };
}

/** Find the package that owns the components: the nearest package.json at or above `start`. */
export function findRoot(start) {
  return findUp(start, ['DESIGN.md']) || findUp(start, ['package.json']) || path.resolve(start);
}

/** Read everything: DESIGN.md, the sidecar, parsed tokens, gaps and staleness. */
export function loadDesign(start = process.cwd(), opts = {}) {
  const root = opts.root ? path.resolve(opts.root) : findRoot(start);
  const designPath = path.join(root, 'DESIGN.md'); const sidecarPath = path.join(root, '.reax', 'design.json');
  const out = { root, designPath, sidecarPath, exists: { design: fs.existsSync(designPath), sidecar: fs.existsSync(sidecarPath) }, gaps: [], errors: [], warnings: [] };
  const sidecar = out.exists.sidecar ? readJson(sidecarPath, null) : null;
  if (out.exists.sidecar && !sidecar) out.errors.push({ kind: 'sidecar', message: '.reax/design.json is not valid JSON.' });
  out.sidecar = sidecar;
  if (sidecar && sidecar.schemaVersion !== 1) out.warnings.push({ kind: 'schema', message: `The sidecar uses schemaVersion ${sidecar.schemaVersion}; this loader reads 1. Run init to migrate.` });

  if (out.exists.design) {
    const parsed = parseDesignMarkdown(fs.readFileSync(designPath, 'utf8'));
    const { flat, errors } = flattenTokens(parsed.top);
    Object.assign(out, { meta: parsed.meta, sections: parsed.sections, tokens: flat, top: parsed.top });
    out.errors.push(...parsed.errors, ...errors); out.warnings.push(...parsed.warnings);
    out.gaps.push(...[...parsed.errors, ...errors].map((e) => ({ kind: e.kind, message: e.message })));
  } else { out.tokens = {}; out.sections = []; out.meta = {}; }

  out.language = sidecar?.language || {}; out.inventory = sidecar?.inventory || []; out.tokenSources = sidecar?.tokenSources || {};

  // The project's own custom property names win. The derived name (--color-primary) is only a fallback, for
  // proposed tokens and for sidecars written before init recorded names; generated code must not rely on it.
  const derived = [];
  for (const t of Object.values(out.tokens)) {
    const real = out.tokenSources[t.path]?.css;
    if (real) { t.css = real; t.cssDerived = false; } else { t.cssDerived = true; derived.push(t.path); }
  }
  if (derived.length && sidecar) out.warnings.push({ kind: 'css-derived', message: `No project custom property is recorded for ${derived.join(', ')}. Their CSS names are derived and may not exist in the project: check before using them, or run init.` });
  out.stale = checkStale(root, sidecar);
  return out;
}

/** A tiny line diff (longest common subsequence), printed like `diff -u` without context trimming. */
export function diffText(a, b, labelA = 'current', labelB = 'proposed') {
  const A = a.split('\n'); const B = b.split('\n');
  const dp = Array.from({ length: A.length + 1 }, () => new Int32Array(B.length + 1));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0; let j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) { out.push(' ' + A[i]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push('-' + A[i++]); else out.push('+' + B[j++]);
  }
  while (i < A.length) out.push('-' + A[i++]); while (j < B.length) out.push('+' + B[j++]);
  const changed = out.some((l) => l[0] !== ' ');
  return { changed, text: changed ? [`--- ${labelA}`, `+++ ${labelB}`, ...out.filter((l, k) => l[0] !== ' ' || out.slice(Math.max(0, k - 2), k + 3).some((x) => x[0] !== ' '))].join('\n') : '' };
}
