// Learns how a project writes its components, so new ones match: layout, file names, how components and props are
// declared, how styles pick a variant, and how stories are written. Every convention is a vote across the project's
// components: about 70% or more is the convention (with its exceptions listed); less is "mixed", for init to ask about,
// recommending the pattern of the most recently changed components. Decision: ADR 0006.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const CONVENTION_SHARE = 0.7;

/** Every convention, by group, with the label COMPONENTS.md and review use. */
export const CONVENTION_GROUPS = [
  ['Layout', 'layout', { folderPerComponent: 'One folder per component', folderCase: 'Folder name case', files: 'Files in a component folder', fileCase: 'Component file name case' }],
  ['Code', 'code', { definition: 'How a component is declared', export: 'Export', propsType: 'Props type', propsExtendNative: 'Props extend the native element\'s attributes', jsdocOnProps: 'JSDoc on props', indexExports: 'index file' }],
  ['Styling', 'styling', { approach: 'Styling approach', variantSelector: 'How styles select a variant', classNaming: 'Class names', dataSlot: '`data-slot` on parts' }],
  ['Props', 'props', { emphasis: 'Name of the emphasis prop', size: 'Size values', booleanPrefix: 'Boolean prop prefix', pressHandler: 'Press handler name' }],
  ['Stories', 'stories', { present: 'Every component has stories', format: 'Story format', titlePrefix: 'Story title', tags: 'Meta tags', storyShape: 'Story shape' }],
];

/**
 * Where components break the conventions COMPONENTS.md recorded: compares each component's current value (from a
 * fresh analysis) with the recorded convention, or with the person's decision for a mixed one. Undecided mixed
 * conventions are skipped. A deviation is never more than "should fix": conventions are not Requirements.
 */
export function deviations(recorded, now, only = null) {
  const out = []; const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const want = only ? new Set(only.map((n) => n.toLowerCase())) : null;
  for (const [, group, labels] of CONVENTION_GROUPS) {
    for (const [key, label] of Object.entries(labels)) {
      const r = recorded?.[group]?.[key]; const n = now?.[group]?.[key];
      if (!r || !n?.byComponent) continue;
      const expected = r.decided !== undefined ? r.decided : r.status === 'convention' ? r.value : undefined;
      if (expected === undefined) continue;
      for (const [component, found] of Object.entries(n.byComponent)) {
        if (want && !want.has(component.toLowerCase())) continue;
        if (!same(found, expected)) out.push({ component, key: `${group}.${key}`, label, expected, found, followedBy: r.decided !== undefined ? 'decided' : `${r.count} of ${r.total}`, rank: 'should-fix' });
      }
    }
  }
  return out;
}
const SOURCE = /\.(tsx|jsx)$/;
const SKIP = /\.(stories|test|spec)\.[jt]sx?$/;
const EMPHASIS = ['variant', 'kind', 'appearance', 'emphasis', 'look', 'tone', 'intent'];
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** One vote: items are { component, value, mtime }; values compare by JSON. */
export function vote(items) {
  const counted = items.filter((i) => i.value !== undefined && i.value !== null);
  if (!counted.length) return { status: 'none', value: null, count: 0, total: 0, byComponent: {} };
  const groups = new Map();
  for (const i of counted) {
    const k = JSON.stringify(i.value);
    const g = groups.get(k) || { value: i.value, count: 0, components: [], latest: 0 };
    g.count++; g.components.push(i.component); g.latest = Math.max(g.latest, i.mtime || 0); groups.set(k, g);
  }
  const options = [...groups.values()].sort((a, b) => b.count - a.count || b.latest - a.latest);
  const top = options[0]; const total = counted.length; const share = top.count / total;
  const byComponent = Object.fromEntries(counted.map((i) => [i.component, i.value]));
  const base = { value: top.value, count: top.count, total, share: Math.round(share * 100) / 100, examples: top.components.slice(0, 3), byComponent };
  if (share >= CONVENTION_SHARE) return { ...base, status: 'convention', exceptions: counted.filter((i) => JSON.stringify(i.value) !== JSON.stringify(top.value)).map((i) => i.component) };
  const recent = [...options].sort((a, b) => b.latest - a.latest)[0];
  return { ...base, status: 'mixed', options: options.map((o) => ({ value: o.value, count: o.count, components: o.components })), recommended: recent.value };
}

const caseOf = (s) => (/^[A-Z][A-Za-z0-9]*$/.test(s) ? 'PascalCase' : /^[a-z][a-z0-9]*(-[a-z0-9]+)+$|^[a-z][a-z0-9]*$/.test(s) ? 'kebab-case' : /^[a-z][A-Za-z0-9]*$/.test(s) ? 'camelCase' : 'other');

/** The props a `{Name}Props` interface or type declares: [{ name, type }]. Reads the braces' contents, so props on one
 * line or several both count; nested object types are skipped over. */
function propsOf(text, name) {
  const m = new RegExp(`(?:interface\\s+${escRe(name)}Props\\b[^{]*|type\\s+${escRe(name)}Props\\s*=[^{]*)\\{`).exec(text);
  if (!m) return [];
  let depth = 1; let i = m.index + m[0].length; const start = i;
  for (; i < text.length && depth; i++) { if (text[i] === '{') depth++; else if (text[i] === '}') depth--; }
  const body = text.slice(start, i - 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const out = []; let d = 0; let cur = '';
  for (const ch of body) { if ('{(<['.includes(ch)) d++; if ('})>]'.includes(ch)) d--; if (!d && (ch === ';' || ch === '\n' || ch === ',')) { out.push(cur); cur = ''; } else cur += ch; }
  out.push(cur);
  return out.map((x) => x.trim().match(/^(?:readonly\s+)?['"]?([A-Za-z_$][\w$-]*)['"]?\??\s*:\s*([\s\S]+)$/)).filter(Boolean).map((x) => ({ name: x[1], type: x[2].trim() }));
}

/** The story file's meta object (`const meta = {...}` or `export default {...}`), as text. */
function metaOf(text) {
  const m = /(?:const\s+meta\b[^=]*=|export\s+default)\s*\{/.exec(text);
  if (!m) return '';
  let depth = 1; let i = m.index + m[0].length;
  for (; i < text.length && depth; i++) { if (text[i] === '{') depth++; else if (text[i] === '}') depth--; }
  return text.slice(m.index, i);
}

/**
 * @param {{path: string, text: string, mtime?: number}[]} files  project-relative paths under the components directory
 * @param {{componentsDir: string}} opts
 */
export function analyzeComponents(files, { componentsDir }) {
  const byPath = new Map(files.map((f) => [f.path, f]));
  const dirFiles = (d) => files.filter((f) => path.posix.dirname(f.path) === d);
  const components = files
    .filter((f) => SOURCE.test(f.path) && !SKIP.test(f.path))
    .map((f) => ({ name: path.posix.basename(f.path).replace(SOURCE, ''), file: f }))
    .filter(({ name, file }) => /^[A-Z]/.test(name) && new RegExp(`export\\s+(?:default\\s+)?(?:const|function|class)\\s+${escRe(name)}\\b|export\\s+default\\s+${escRe(name)}\\b`).test(file.text))
    .map(({ name, file }) => {
      const dir = path.posix.dirname(file.path);
      const own = path.posix.basename(dir) === name;
      const sibling = own ? dirFiles(dir) : files.filter((f) => path.posix.dirname(f.path) === dir && path.posix.basename(f.path).startsWith(`${name}.`));
      return { name, dir, own, file, files: sibling, mtime: Math.max(0, ...sibling.map((f) => f.mtime || 0)) };
    });

  const v = (fn) => vote(components.map((c) => ({ component: c.name, value: fn(c), mtime: c.mtime })));
  const sib = (c, re) => c.files.find((f) => re.test(path.posix.basename(f.path)));
  const storyOf = (c) => sib(c, new RegExp(`^${escRe(c.name)}\\.stories\\.[jt]sx?$`));
  const styleOf = (c) => sib(c, /\.(module\.)?(css|scss|sass|less)$/);

  const layout = {
    folderPerComponent: v((c) => c.own),
    folderCase: vote(components.filter((c) => c.own).map((c) => ({ component: c.name, value: caseOf(path.posix.basename(c.dir)), mtime: c.mtime }))),
    files: vote(components.filter((c) => c.own).map((c) => ({ component: c.name, mtime: c.mtime, value: c.files.map((f) => path.posix.basename(f.path).replace(new RegExp(`^${escRe(c.name)}(?=\\.)`), '{Name}')).sort((a, b) => (b.startsWith('{') - a.startsWith('{')) || a.localeCompare(b)) }))),
    fileCase: v((c) => caseOf(c.name)),
  };

  const code = {
    definition: v((c) => (/forwardRef\s*[<(]/.test(c.file.text) ? 'forwardRef' : new RegExp(`(?:const|let)\\s+${escRe(c.name)}\\s*(?::[^=]+)?=\\s*(?:\\([^)]*\\)|[A-Za-z_$]\\w*)\\s*(?::[^=]+)?=>|(?:const|let)\\s+${escRe(c.name)}\\s*(?::[^=]+)?=\\s*\\(`).test(c.file.text) ? 'arrow' : 'function')),
    export: v((c) => (new RegExp(`export\\s+default\\s+(?:function\\s+)?${escRe(c.name)}\\b`).test(c.file.text) ? 'default' : 'named')),
    propsType: v((c) => (new RegExp(`interface\\s+${escRe(c.name)}Props\\b`).test(c.file.text) ? 'interface {Name}Props' : new RegExp(`type\\s+${escRe(c.name)}Props\\b`).test(c.file.text) ? 'type {Name}Props' : 'inline or none')),
    propsExtendNative: v((c) => /(?:extends|&)\s*(?:React\.)?(?:\w+HTMLAttributes|ComponentProps(?:WithoutRef|WithRef)?)\s*</.test(c.file.text)),
    jsdocOnProps: v((c) => { const m = c.file.text.match(new RegExp(`(?:interface|type)\\s+${escRe(c.name)}Props[\\s\\S]*?\\n\\}`)); return m ? /\/\*\*/.test(m[0]) : null; }),
    indexExports: v((c) => { if (!c.own) return null; const idx = sib(c, /^index\.[jt]sx?$/); if (!idx) return 'none'; return /export\s*\*/.test(idx.text) ? 'export *' : /export\s*(?:type\s*)?\{/.test(idx.text) ? 'named re-exports' : 'other'; }),
  };

  const styling = {
    approach: v((c) => {
      const t = c.file.text; const s = styleOf(c);
      if (/from\s+['"](?:styled-components|@emotion\/styled|@emotion\/react)['"]/.test(t)) return 'css-in-js';
      if (s && /\.module\./.test(s.path)) return 'css-modules';
      if (s) return 'plain-css';
      if (/className=\{?\s*(?:cn|clsx|cva|twMerge)\(|className="[^"]*\b(?:flex|px-\d|py-\d|text-(?:sm|lg)|bg-[a-z]+-\d{2,3})\b/.test(t)) return 'utility-classes';
      return 'none';
    }),
    variantSelector: v((c) => {
      const t = c.file.text; const p = EMPHASIS.find((e) => new RegExp(`\\b${e}\\b`).test(t)) || 'variant';
      if (new RegExp(`data-${p}=`).test(t)) return 'data-attribute';
      if (new RegExp(`styles\\[\\s*${p}\\s*\\]|--\\$\\{${p}\\}|\\$\\{${p}\\}`).test(t)) return 'modifier-class';
      if (/cva\(/.test(t)) return 'cva';
      return null;
    }),
    classNaming: v((c) => {
      const s = styleOf(c); const css = s?.text || '';
      if (s && /\.module\./.test(s.path)) return /\.[a-z][a-zA-Z0-9]*[A-Z]/.test(css) ? 'camelCase (module)' : 'plain (module)';
      if (/__[a-z]/.test(css) || /--[a-z][\w-]*\s*[{,.:[]/.test(css.replace(/var\(--[^)]+\)/g, ''))) return 'BEM';
      return css ? 'other' : null;
    }),
    dataSlot: v((c) => /data-slot=/.test(c.file.text)),
    tokenUsage: (() => {
      let vars = 0; let raw = 0;
      for (const c of components) for (const f of [c.file, styleOf(c)].filter(Boolean)) { vars += (f.text.match(/var\(--/g) || []).length; raw += (f.text.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/g) || []).length; }
      return { customProperties: vars, rawColours: raw };
    })(),
  };

  const allProps = components.map((c) => ({ c, props: propsOf(c.file.text, c.name) }));
  const counts = new Map();
  for (const { props } of allProps) for (const p of new Set(props.map((x) => x.name))) counts.set(p, (counts.get(p) || 0) + 1);
  const propsConv = {
    emphasis: vote(allProps.map(({ c, props }) => ({ component: c.name, mtime: c.mtime, value: EMPHASIS.find((e) => props.some((p) => p.name === e)) || null }))),
    size: vote(allProps.map(({ c, props }) => { const p = props.find((x) => x.name === 'size'); return { component: c.name, mtime: c.mtime, value: p ? (p.type.match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1)) : null }; })),
    booleanPrefix: vote(allProps.flatMap(({ c, props }) => props.filter((p) => /^boolean\b/.test(p.type)).map((p) => ({ component: c.name, mtime: c.mtime, value: /^is[A-Z]/.test(p.name) ? 'is' : /^has[A-Z]/.test(p.name) ? 'has' : 'none' })))),
    pressHandler: vote(allProps.map(({ c, props }) => ({ component: c.name, mtime: c.mtime, value: ['onPress', 'onClick', 'onAction', 'onSelect'].find((h) => props.some((p) => p.name === h)) || null }))),
    common: [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 15).map(([name, count]) => ({ name, count })),
  };

  const withStories = components.map((c) => ({ c, s: storyOf(c) })).filter((x) => x.s);
  const sv = (fn, part = (t) => t) => vote(withStories.map(({ c, s }) => ({ component: c.name, mtime: c.mtime, value: fn(part(s.text), c) })));
  const stories = {
    present: v((c) => !!storyOf(c)),
    format: sv((t) => (/storiesOf\(/.test(t) ? 'storiesOf' : /satisfies\s+Meta\b/.test(t) ? 'csf3-satisfies' : /:\s*Meta(?:<|\b)/.test(t) ? 'csf3-typed' : 'csf3')),
    titlePrefix: sv((t) => { const m = t.match(/title:\s*['"`]([^'"`]+)['"`]/); if (!m) return 'none (from the file path)'; const parts = m[1].split('/'); return parts.length > 1 ? parts.slice(0, -1).join('/') : ''; }, metaOf),
    tags: sv((t) => { const m = t.match(/tags:\s*\[([^\]]*)\]/); return m ? [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]) : []; }, metaOf),
    storyShape: sv((t) => (/:\s*Story\s*=\s*\{\s*args/.test(t) ? 'args' : /render:\s*\(/.test(t) ? 'render' : 'other')),
  };

  return {
    componentsDir, scanned: components.length,
    components: components.map((c) => ({ name: c.name, path: c.dir, files: c.files.map((f) => path.posix.basename(f.path)) })),
    layout, code, styling, props: propsConv, stories,
  };
}

/** Read the components directory of a project (and when each file last changed, from git if it can). */
export function collectFiles(root, componentsDir) {
  const base = path.join(root, componentsDir); const out = [];
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name.startsWith('.')) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|jsx?|css|scss|sass|less)$/.test(e.name)) out.push(p); } };
  walk(base);
  const changed = new Map();
  const log = spawnSync('git', ['-C', root, 'log', '--format=%ct', '--name-only', '--', componentsDir], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (log.status === 0) { let t = 0; for (const line of log.stdout.split('\n')) { if (/^\d+$/.test(line)) t = Number(line) * 1000; else if (line && !changed.has(line)) changed.set(line, t); } }
  const top = spawnSync('git', ['-C', root, 'rev-parse', '--show-prefix'], { encoding: 'utf8' });
  const prefix = top.status === 0 ? top.stdout.trim() : '';
  return out.map((p) => {
    const rel = path.relative(root, p).split(path.sep).join('/');
    return { path: rel, text: fs.readFileSync(p, 'utf8'), mtime: changed.get(prefix + rel) ?? fs.statSync(p).mtimeMs };
  });
}
