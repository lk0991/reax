// The quality verdict: from the evidence gathered for one change, answer in plain words "can this merge without a
// developer reviewing it?". Pure: verdict.mjs gathers the evidence and writes it; this decides and renders.
// Levels: ready (every check ran and passed, the independent reviewer agrees), gaps (nothing failed, but named checks
// could not run), needs-work (a concern: a Should fix finding, a Default not met, a reviewer concern, a scope surprise),
// blocked (a Requirement fails, a story fails, the type check or lint fails). Only "ready" claims no review is needed.
import path from 'node:path';
import { page, esc } from './page.mjs';

export const CHECKS = [
  ['typecheck', 'Type check'], ['lint', 'Lint'], ['visualTest', 'Visual test'], ['review', 'Review'], ['conventions', 'Conventions'], ['fit', 'Fit with the design'], ['reviewer', 'Independent reviewer'],
];
const NOT_BUILT = { status: 'not-run', reason: 'reax does not run this check yet.', howTo: 'A developer looks at this part instead.' };
const LOCKFILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock']);

/** Added, changed and removed packages between two package.json objects. */
export function dependencyChanges(before = {}, after = {}) {
  const all = (p) => ({ ...(p.dependencies || {}), ...(p.devDependencies || {}), ...(p.peerDependencies || {}), ...(p.optionalDependencies || {}) });
  const a = all(before); const b = all(after); const out = { added: [], changed: [], removed: [] };
  for (const [n, v] of Object.entries(b)) if (!(n in a)) out.added.push(`${n}@${v}`); else if (a[n] !== v) out.changed.push(`${n} ${a[n]} → ${v}`);
  for (const n of Object.keys(a)) if (!(n in b)) out.removed.push(n);
  return out;
}

/** Which components a change touches, and what it touches outside them. */
export function classifyScope(files, { componentsDir = 'src/components', screensDir = null, tokenFiles = [] } = {}) {
  const dirs = [componentsDir, screensDir].filter(Boolean).map((d) => d.replace(/\/$/, '') + '/');
  const components = new Set(); const screens = new Set(); const outside = []; const global = [];
  for (const f of files) {
    const dir = dirs.find((d) => f.startsWith(d));
    if (dir) { const rest = f.slice(dir.length); const name = rest.includes('/') ? rest.split('/')[0] : path.posix.basename(rest).replace(/\..*$/, ''); if (rest.includes('/') || /^[A-Z]/.test(name)) (dir === dirs[0] ? components : screens).add(name); continue; }
    outside.push(f);
    if (/\.(css|scss|sass|less)$/.test(f) || /^\.storybook\/preview\./.test(f) || tokenFiles.includes(f)) global.push(f);
  }
  return { components: [...components].sort(), screens: [...screens].sort(), outsideComponents: outside, globalStyles: global };
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Decide the verdict for an evidence record. */
export function decide(e) {
  const checks = e.checks || {}; const scope = e.scope || {}; const expected = new Set(scope.expected || []);
  const blocking = []; const concerns = []; const gaps = []; const lines = [];
  const line = (check, label, status, plain, detail) => lines.push({ check, label, status, plain, detail });

  for (const [key, label] of CHECKS) {
    const c = checks[key] || NOT_BUILT;
    if (c.status === 'not-run') { gaps.push({ check: key, label, reason: c.reason || NOT_BUILT.reason, howTo: c.howTo || NOT_BUILT.howTo }); line(key, label, 'not-run', `Not checked: ${c.reason || NOT_BUILT.reason}`, c.howTo); continue; }
    if (key === 'typecheck') {
      if (c.status === 'fail') { blocking.push('TypeScript found errors in the code.'); line(key, label, 'fail', 'TypeScript found errors: the code would not build cleanly.', c.detail); }
      else line(key, label, 'pass', 'The code type-checks with no errors.', c.command);
    } else if (key === 'lint') {
      if (c.status === 'fail') { blocking.push('The project\'s lint found problems.'); line(key, label, 'fail', 'The project\'s own lint rules found problems.', c.detail); }
      else line(key, label, 'pass', 'The code follows the project\'s own lint rules.', c.command);
    } else if (key === 'visualTest') {
      const s = c.summary || {};
      for (const f of c.failures || []) blocking.push(`${f.story}: ${f.reasons.join('; ')}`);
      if (c.status === 'fail' && !(c.failures || []).length) blocking.push(`The visual test did not finish: ${String(c.detail || 'no result').split('\n')[0]}`);
      for (const w of c.warnings || []) concerns.push(`${w.story}: ${w.reasons.join('; ')}`);
      if (c.status === 'fail' && !(c.failures || []).length) line(key, label, 'fail', 'The visual test did not finish, so nothing was rendered or checked.', c.detail);
      else if (c.status === 'fail' || (c.failures || []).length) line(key, label, 'fail', `${plural((c.failures || []).length, 'story', 'stories')} of ${s.total} fail: accessibility, keyboard or rendering problems a person would run into.`, (c.failures || []).map((f) => `${f.story}: ${f.reasons.join('; ')}`).join('\n'));
      else if ((c.warnings || []).length) line(key, label, 'concern', `All ${plural(s.total, 'story', 'stories')} render, but ${plural(c.warnings.length, 'has a problem', 'have problems')} worth fixing.`, c.warnings.map((w) => `${w.story}: ${w.reasons.join('; ')}`).join('\n'));
      else line(key, label, 'pass', `All ${plural(s.total, 'story', 'stories')} render at every size, and pass the accessibility and keyboard checks.`, c.report);
      if ((c.changedFromBaseline || []).length) line('baselines', 'Approved screenshots', 'info', `${c.changedFromBaseline.length === 1 ? '1 story looks different from its approved screenshots' : `${c.changedFromBaseline.length} stories look different from their approved screenshots`}: that is the change you are approving, shown before and after.`, c.changedFromBaseline.join('\n'));
    } else if (key === 'review') {
      for (const f of c.blocking || []) blocking.push(`Review: ${f.what || f}`);
      for (const f of c.shouldFix || []) concerns.push(`Review: ${f.what || f}`);
      const n = (c.blocking || []).length; const m = (c.shouldFix || []).length;
      line(key, label, n ? 'fail' : m ? 'concern' : 'pass', n ? `The review found ${plural(n, 'problem')} that must be fixed.` : m ? `The review found ${plural(m, 'thing')} that should be fixed.` : 'The review against the component cards and DESIGN.md found nothing to fix.', [...(c.blocking || []), ...(c.shouldFix || [])].map((f) => (f.where ? `${f.where}: ${f.what}` : f.what || f)).join('\n'));
    } else if (key === 'conventions') {
      for (const d of c.deviations || []) concerns.push(`${d.component} breaks a project convention: ${d.label}`);
      const n = (c.deviations || []).length;
      line(key, label, n ? 'concern' : 'pass', n ? `${plural(n, 'place')} where the code is written differently from the rest of the project.` : 'The code is written the way the project\'s other components are.', (c.deviations || []).map((d) => `${d.component}: ${d.label} (expected ${JSON.stringify(d.expected)}, found ${JSON.stringify(d.found)})`).join('\n'));
    } else if (key === 'fit' && c.status === 'n/a') {
      line(key, label, 'info', c.note || 'No style or component code changed, so there was nothing to check.');
    } else if (key === 'fit') {
      const fs = c.findings || [];
      for (const f of fs) concerns.push(`${f.file}:${f.line} ${f.message}`);
      line(key, label, fs.length ? 'concern' : 'pass', fs.length ? `${plural(fs.length, 'place')} where the code strays from the project's design: colours, spacing, type or corners that are not the project's own, or a screen with several primary actions.` : 'The code uses only the project\'s own colours, spacing, type and corners, and each screen has one main action.', fs.map((f) => `${f.file}:${f.line} [${f.kind}] ${f.message}`).join('\n'));
    } else if (key === 'reviewer') {
      if (c.verdict === 'blocked') { blocking.push(`Independent reviewer: ${(c.findings || []).map((f) => f.what || f).join('; ') || 'blocks the change'}`); line(key, label, 'fail', 'A reviewer that did not write the code found problems that must be fixed.', (c.findings || []).map((f) => f.what || f).join('\n')); }
      else if (c.verdict === 'concerns' || (c.findings || []).length) { for (const f of c.findings || []) concerns.push(`Independent reviewer: ${f.what || f}`); line(key, label, 'concern', 'A reviewer that did not write the code has concerns.', (c.findings || []).map((f) => f.what || f).join('\n')); }
      else line(key, label, 'pass', 'A reviewer that did not write the code read it and agrees it is ready.', c.summary);
    }
  }

  // scope: what the change touched beyond what was asked
  const deps = scope.dependencies || { added: [], changed: [], removed: [] };
  const depLines = [...deps.added.map((d) => `adds ${d}`), ...deps.changed.map((d) => `changes ${d}`), ...deps.removed.map((d) => `removes ${d}`)];
  const unexpectedGlobal = (scope.globalStyles || []).filter((f) => !expected.has(f));
  const reaxRecord = (f) => ['DESIGN.md', 'COMPONENTS.md', 'PRODUCT.md'].includes(path.posix.basename(f)) || /(^|\/)\.reax\//.test(f);
  const unexpectedOutside = (scope.outsideComponents || []).filter((f) => !expected.has(f) && !reaxRecord(f) && !unexpectedGlobal.includes(f) && !LOCKFILES.has(path.posix.basename(f)) && !(f === 'package.json' && depLines.length));
  for (const d of depLines) concerns.push(`The change ${d}.`);
  for (const f of unexpectedGlobal) concerns.push(`The change edits a style that applies everywhere: ${f}.`);
  for (const f of unexpectedOutside) concerns.push(`The change touches a file outside the components: ${f}.`);
  const comps = scope.components || []; const scr = scope.screens || [];
  const what = [comps.length ? `${plural(comps.length, 'component')} (${comps.join(', ')})` : '', scr.length ? `${plural(scr.length, 'screen')} (${scr.join(', ')})` : ''].filter(Boolean).join(' and ') || 'no component';
  const touched = `${plural((scope.changedFiles || []).length, 'file')} in ${what}`;
  const surprises = depLines.length + unexpectedGlobal.length + unexpectedOutside.length;
  line('scope', 'Scope', surprises ? 'concern' : 'pass', surprises ? `The change touches ${touched}, and goes further than the components: ${[...depLines, ...unexpectedGlobal, ...unexpectedOutside].join('; ')}.` : `The change touches ${touched} and nothing unexpected.`, (scope.changedFiles || []).join('\n'));

  const level = blocking.length ? 'blocked' : concerns.length ? 'needs-work' : gaps.length ? 'gaps' : 'ready';
  const headline = {
    ready: 'Ready to merge. Every check ran and passed, and a reviewer that did not write the code agrees. No developer review needed.',
    gaps: `Ready with gaps. Nothing failed, but ${plural(gaps.length, 'check')} could not run (${gaps.map((g) => g.label.toLowerCase()).join(', ')}), so a developer should look at ${gaps.length === 1 ? 'that' : 'those'} before merging.`,
    'needs-work': `Needs work. Nothing is broken, but ${plural(concerns.length, 'thing')} should be fixed first.`,
    blocked: `Blocked. ${plural(blocking.length, 'problem')} must be fixed before this can merge.`,
  }[level];
  // the page shows the level as its own label, so it shows the headline without repeating it
  const summary = headline.replace(/^[^.]+\.\s*/, '');
  return { level, headline, summary, blocking, concerns, gaps, lines };
}

const LEVEL = { ready: ['Ready to merge', 'ok'], gaps: ['Ready with gaps', 'warn'], 'needs-work': ['Needs work', 'warn'], blocked: ['Blocked', 'bad'] };
const STATUS = { pass: ['Passed', 'ok'], fail: ['Failed', 'bad'], concern: ['Worth fixing', 'warn'], 'not-run': ['Not run', 'warn'], info: ['For you to see', 'muted'] };

/** The verdict page. `extra` is more body HTML (the before/after section). */
export function renderVerdict(e, v, { extra = '', title = 'Quality verdict' } = {}) {
  const [levelName, tone] = LEVEL[v.level];
  const list = (items) => (items.length ? `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const rows = v.lines.map((l) => { const [name, t] = STATUS[l.status]; return `<li class="check"><div class="check-h"><strong>${esc(l.label)}</strong><span class="tag ${t}">${name}</span></div><p>${esc(l.plain)}</p>${l.detail ? `<details><summary>Detail for developers</summary><pre>${esc(l.detail)}</pre></details>` : ''}</li>`; }).join('');
  return page({
    title,
    css: `main { max-width: 860px; margin: 0 auto; display: grid; gap: 24px; }
h1 { font-size: 1.5rem; margin: 0; } h2 { font-size: 1.125rem; margin: 0 0 8px; }
.verdict { border: 2px solid var(--line); border-radius: 12px; padding: 16px 20px; background: var(--card); display: grid; gap: 8px; }
.verdict.ok { border-color: var(--ok); } .verdict.warn { border-color: var(--warn); } .verdict.bad { border-color: var(--bad); }
.verdict .level { font-size: 1.375rem; font-weight: 700; } .ok .level { color: var(--ok); } .warn .level { color: var(--warn); } .bad .level { color: var(--bad); }
.meta { color: var(--muted); font-size: 0.875rem; margin: 0; }
.checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.check { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 12px 16px; min-width: 0; }
.check p { margin: 4px 0 0; }
.check-h { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; }
.tag { font-size: 0.75rem; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid currentColor; }
.tag.ok { color: var(--ok); } .tag.bad { color: var(--bad); } .tag.warn { color: var(--warn); } .tag.muted { color: var(--muted); }
details { margin-top: 8px; } summary { cursor: pointer; color: var(--muted); font-size: 0.875rem; }
pre { margin: 8px 0 0; padding: 8px; background: var(--bg); border: 1px solid var(--line); border-radius: 6px; overflow-x: auto; font-size: 0.8125rem; white-space: pre-wrap; word-break: break-word; }
ul { margin: 4px 0 0; padding-left: 1.2em; } li + li { margin-top: 4px; }`,
    body: `<main>
<header><h1>${esc(title)}</h1><p class="meta">Checked ${esc(String(e.createdAt || '').replace('T', ' ').slice(0, 16))} UTC${e.scope?.base ? ` · compared with ${esc(e.scope.base)}` : ''}</p></header>
<section class="verdict ${tone}" aria-label="Verdict"><span class="level">${esc(levelName)}</span><p>${esc(v.summary ?? v.headline)}</p>${v.blocking.length ? `<div><strong>Must be fixed</strong>${list(v.blocking)}</div>` : ''}${v.concerns.length ? `<div><strong>Should be fixed</strong>${list(v.concerns)}</div>` : ''}${v.gaps.length ? `<div><strong>Not checked</strong><ul>${v.gaps.map((g) => `<li>${esc(g.label)}: ${esc(g.reason)} ${esc(g.howTo)}</li>`).join('')}</ul></div>` : ''}</section>
<section aria-labelledby="checks-h"><h2 id="checks-h">What was checked</h2><ul class="checks">${rows}</ul></section>
${extra}
</main>`,
  });
}
