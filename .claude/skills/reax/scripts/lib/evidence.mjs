// Gathering the evidence a quality verdict needs, beyond the type check and the visual test: the project's own lint,
// the saved review findings, and the conventions check. Each returns one check for lib/verdict.mjs: pass, fail, or
// not-run with the reason and what it would take. A check that cannot be trusted (a stale review) is not-run, never pass.
import fs from 'node:fs';
import path from 'node:path';
import { readJson, packageManager } from './runtime.mjs';
import { analyzeComponents, collectFiles, deviations } from './conventions.mjs';

/** How to run the project's lint: its "lint" script, else ESLint on the changed files, else a named gap. */
export function lintCommand(root, files = []) {
  const pkg = readJson(path.join(root, 'package.json'), {});
  const script = ['lint', 'lint:js', 'eslint'].find((s) => pkg.scripts?.[s]);
  if (script) return { command: packageManager(root).name, args: ['run', script] };
  const config = fs.readdirSync(root).some((f) => /^(eslint\.config\.(js|mjs|cjs|ts)|\.eslintrc(\.(js|cjs|json|ya?ml))?)$/.test(f)) || !!pkg.eslintConfig;
  const bin = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (config && fs.existsSync(bin)) return { command: process.execPath, args: [bin, ...files.filter((f) => /\.[jt]sx?$/.test(f))] };
  if (config) return { status: 'not-run', reason: 'The project has an ESLint config but ESLint is not installed.', howTo: 'Install the project\'s dependencies.' };
  return { status: 'not-run', reason: 'The project has no lint set up.', howTo: 'Add ESLint and a "lint" script, so the code is checked against the team\'s own rules.' };
}

/**
 * The saved review findings for the changed components. `changedAt` is when each component last changed (ms);
 * a review older than the change no longer describes the code.
 */
export function reviewEvidence(review, components, changedAt = {}) {
  const byName = new Map(Object.entries(review || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const missing = []; const stale = []; const blocking = []; const shouldFix = [];
  for (const c of components) {
    const r = byName.get(c.toLowerCase());
    if (!r) { missing.push(c); continue; }
    if (changedAt[c] && Date.parse(r.reviewedAt) < changedAt[c]) { stale.push(c); continue; }
    for (const f of r.findings || []) (f.rank === 'blocking' ? blocking : shouldFix).push({ component: c, ...f });
  }
  if (missing.length || stale.length) {
    const why = [missing.length ? `${missing.join(', ')} ${missing.length === 1 ? 'has' : 'have'} no saved review` : '', stale.length ? `${stale.join(', ')} changed since ${stale.length === 1 ? 'its' : 'their'} last review` : ''].filter(Boolean).join('; ');
    return { status: 'not-run', reason: `${why}.`, howTo: `Run review on ${[...missing, ...stale].join(', ')}.`, blocking, shouldFix };
  }
  return { status: blocking.length ? 'fail' : 'pass', blocking, shouldFix };
}

/** Where the changed components break the conventions COMPONENTS.md recorded. */
export function conventionsEvidence(root, recorded, components, review = {}) {
  if (!recorded) return { status: 'not-run', reason: 'No component conventions are recorded (no COMPONENTS.md).', howTo: 'Run init to learn them.' };
  const now = analyzeComponents(collectFiles(root, recorded.componentsDir), { componentsDir: recorded.componentsDir });
  // a deviation the review judged explained (by COMPONENTS.md's notes, the card or a Requirement) is not counted again
  const explained = (d) => Object.entries(review || {}).some(([k, v]) => k.toLowerCase() === d.component.toLowerCase() && (v.explained || []).includes(d.key));
  return { status: 'pass', deviations: deviations(recorded, now, components).filter((d) => !explained(d)) };
}
