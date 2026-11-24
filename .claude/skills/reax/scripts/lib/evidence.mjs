// Gathering the evidence a quality verdict needs, beyond the type check and the visual test: the project's own lint,
// the saved review findings, and the conventions check. Each returns one check for lib/verdict.mjs: pass, fail, or
// not-run with the reason and what it would take. A check that cannot be trusted (a stale review) is not-run, never pass.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readJson, packageManager } from './runtime.mjs';
import { analyzeComponents, collectFiles, deviations } from './conventions.mjs';

/** How to run the project's lint: its "lint" script, else ESLint on the changed files, else a named gap. */
export function lintCommand(root, files = []) {
  const pkg = readJson(path.join(root, 'package.json'), {});
  const script = ['lint', 'lint:js', 'eslint'].find((s) => pkg.scripts?.[s]);
  if (script) return { command: packageManager(root).name, args: ['run', script] };
  const targets = files.filter((f) => /\.[jt]sx?$/.test(f) && fs.existsSync(path.join(root, f)));
  const config = fs.readdirSync(root).some((f) => /^(eslint\.config\.(js|mjs|cjs|ts)|\.eslintrc(\.(js|cjs|json|ya?ml))?)$/.test(f)) || !!pkg.eslintConfig;
  const bin = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (config && fs.existsSync(bin)) return targets.length ? { command: process.execPath, args: [bin, ...targets] } : { status: 'not-run', reason: 'No JavaScript or TypeScript file changed, so there was nothing to lint.', howTo: 'Nothing to do.' };
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
    const changed = Object.entries(changedAt).find(([k]) => k.toLowerCase() === c.toLowerCase())?.[1];
    const reviewed = Date.parse(r.reviewedAt);
    if (Number.isNaN(reviewed) || (changed && reviewed < changed)) { stale.push(c); continue; }
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

/** A short, stable hash of the change a reviewer read. */
export const diffHash = (diff) => crypto.createHash('sha1').update(String(diff)).digest('hex').slice(0, 16);

/**
 * The independent reviewer's saved answer, counted only when it reviewed exactly the current change.
 * `saved` is what the reviewer wrote: { diffHash, verdict: agree|concerns|blocked, findings, summary }, or
 * { diffHash, status: 'not-run', reason } when no separate agent could be started.
 */
export function reviewerEvidence(saved, hash) {
  if (!saved) return { status: 'not-run', reason: 'No independent reviewer has read this change.', howTo: 'Start a fresh reviewer agent with the reviewer packet (verdict --packet).' };
  if (saved.diffHash !== hash) return { status: 'not-run', reason: 'The change has changed since the independent reviewer read it.', howTo: 'Run the reviewer again on the current change.' };
  if (saved.status === 'not-run') return { status: 'not-run', reason: saved.reason || 'No independent reviewer could run.', howTo: 'Run the verdict in a session that can start a separate agent.' };
  return { status: 'pass', verdict: ['agree', 'concerns', 'blocked'].includes(saved.verdict) ? saved.verdict : 'concerns', findings: saved.findings || [], summary: saved.summary };
}

/** The packet a fresh reviewer reads: everything it needs, nothing of the conversation that wrote the code. */
export function reviewerPacket({ diff, hash, files = [], evidence, screenshots = [], out }) {
  return `# Review this change

You are an independent reviewer. You did not write this code and you have not seen the conversation that did. Judge it as a senior front-end engineer would before approving a pull request for a design system: correctness, accessibility, behaviour in every state, consistency with the project, and anything a person merging it without reading the code would regret.

Read, in this order:
${files.map((f) => `- \`${f}\``).join('\n')}
- \`${evidence}\`: what the automated checks found (type check, lint, visual test, review, conventions, scope)
${screenshots.length ? `\nLook at these screenshots of the changed stories:\n${screenshots.map((f) => `- \`${f}\``).join('\n')}\n` : ''}
Do not repeat what the automated checks already report; look for what they cannot see: logic errors, states that are not handled, props that do not do what their names say, focus or announcements that are wrong in use, styles that only work for the example content, changes beyond what the diff needs.

Write your answer as JSON to \`${out}\`, exactly in this shape, and nothing else:

\`\`\`json
{
  "diffHash": "${hash}",
  "verdict": "agree" | "concerns" | "blocked",
  "summary": "one or two plain sentences a non-developer can read",
  "findings": [ { "what": "plain-language problem", "where": "path:line", "why": "what goes wrong for a person", "fix": "one line" } ]
}
\`\`\`

\`agree\`: you would merge it as it is. \`concerns\`: it works, but something should change first. \`blocked\`: it breaks something for people or for the code. An empty \`findings\` list goes with \`agree\` only.

## The change

\`\`\`diff
${diff}
\`\`\`
`;
}

/** The change itself: its diff (since the merge base with `base`, or since HEAD, plus untracked files) and its hash. */
export function currentChange(root, base) {
  const git = (...a) => spawnSync('git', ['-C', root, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const exclude = [':(exclude)visual-report', ':(exclude).reax/baselines'];
  const from = base ? (git('merge-base', base, 'HEAD').stdout.trim() || base) : 'HEAD';
  const untracked = git('ls-files', '--others', '--exclude-standard', '--', '.', ...exclude).stdout.split('\n').filter(Boolean);
  const diff = [git('diff', from, '--', '.', ...exclude).stdout, ...untracked.map((f) => git('diff', '--no-index', '--', '/dev/null', f).stdout)].join('\n').trim();
  return { diff, hash: diffHash(diff) };
}
