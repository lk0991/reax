#!/usr/bin/env node
// The quality verdict for the current change: gathers the evidence (type check, visual test, scope of the change),
// writes it to visual-report/verdict/evidence.json, decides, and writes the plain-language page
// visual-report/verdict.html (beside the screenshots it shows, so it publishes with them). Spec #35.
//   node verdict.mjs --root <project> [--component Button,Card] [--expect src/styles/tokens.css] [--no-visual]
//   --component: the components the change is about (default: those changed on this branch or uncommitted)
//   --expect:    files outside the components the change was meant to touch, so they are not counted as surprises
//   --packet:    also write visual-report/verdict/review-packet.md for a fresh reviewer agent; it saves its answer to
//                visual-report/verdict/reviewer.json, which the next verdict reads (only while the change is the same)
// Exit code: 1 when the verdict is "blocked", otherwise 0. The JSON summary on stdout carries the level.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson, writeJson, findUp, packageManager } from './lib/runtime.mjs';
import { changedFiles } from './lib/select.mjs';
import { mergeConfig } from './lib/capture.mjs';
import { decide, renderVerdict, dependencyChanges, classifyScope } from './lib/verdict.mjs';
import { previewReach } from './lib/reach.mjs';
import { lintCommand, reviewEvidence, conventionsEvidence, reviewerEvidence, reviewerPacket, currentChange } from './lib/evidence.mjs';
import { cardFor } from './lib/cards.mjs';
import { beforeAfter, renderBeforeAfter, listBaselines } from './lib/before-after.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
const log = (m) => console.error(m);
const sidecar = readJson(path.join(root, '.reax', 'design.json'), {}) || {};
const config = (() => { try { return mergeConfig(readJson(path.join(root, '.reax', 'visual-test.json'), {})); } catch { return mergeConfig({}); } })();
const tail = (s, n = 30) => String(s || '').split('\n').filter(Boolean).slice(-n).join('\n');
const outDir = path.join(root, 'visual-report', 'verdict');

/* ---------- scope ---------- */
const changed = changedFiles(root, { base: config.baseBranch }) || [];
const componentsDir = sidecar.scan?.componentsDir || sidecar.conventions?.componentsDir || 'src/components';
const scope = { base: changed.base || null, changedFiles: [...changed], ...classifyScope([...changed], { componentsDir, tokenFiles: sidecar.scan?.tokenFiles || [] }), expected: args.expect ? String(args.expect).split(',').map((s) => s.trim()) : [] };
if (args.component) scope.components = String(args.component).split(',').map((s) => s.trim());
const show = (rev) => { const r = spawnSync('git', ['-C', root, 'show', `${rev}:./package.json`], { encoding: 'utf8' }); try { return r.status === 0 ? JSON.parse(r.stdout) : null; } catch { return null; } };
const before = show(changed.base ? spawnSync('git', ['-C', root, 'merge-base', changed.base, 'HEAD'], { encoding: 'utf8' }).stdout.trim() || changed.base : 'HEAD');
scope.dependencies = before ? dependencyChanges(before, readJson(path.join(root, 'package.json'), {})) : { added: [], changed: [], removed: [] };

/* ---------- type check ---------- */
function typecheck() {
  const pkg = readJson(path.join(root, 'package.json'), {});
  const script = ['typecheck', 'type-check', 'tsc'].find((s) => pkg.scripts?.[s]);
  let cmd;
  if (script) cmd = [packageManager(root).name, ['run', script]];
  else if (fs.existsSync(path.join(root, 'tsconfig.json'))) {
    const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
    if (!fs.existsSync(tsc)) return { status: 'not-run', reason: 'The project has a tsconfig.json but TypeScript is not installed.', howTo: 'Install the project\'s dependencies.' };
    cmd = [process.execPath, [tsc, '--noEmit', '-p', '.']];
  } else return { status: 'not-run', reason: 'The project has no TypeScript set up.', howTo: 'Add a tsconfig.json, or a "typecheck" script.' };
  log(`Type check: ${cmd[0]} ${cmd[1].join(' ')}`);
  const r = spawnSync(cmd[0], cmd[1], { cwd: root, encoding: 'utf8', timeout: 300_000 });
  const command = `${path.basename(cmd[0])} ${cmd[1].map((a) => (a.includes(path.sep) ? path.basename(a) : a)).join(' ')}`;
  return r.status === 0 ? { status: 'pass', command } : { status: 'fail', command, detail: tail((r.stdout || '') + '\n' + (r.stderr || '')) };
}

/* ---------- visual test ---------- */
function visualTest() {
  if (args['no-visual']) return { status: 'not-run', reason: 'The visual test was skipped for this verdict.', howTo: 'Run the verdict without --no-visual.' };
  // a style that applies everywhere (a token file included, expected or not) can move any component
  const all = scope.globalStyles.length > 0;
  if (!all && !scope.components.length) return { status: 'not-run', reason: 'No component changed, so there was nothing to render.', howTo: 'Name the components with --component.' };
  const which = all ? ['--all'] : ['--component', scope.components.join(',')];
  log(`Visual test: ${which.join(' ')}`);
  const r = spawnSync(process.execPath, [path.join(HERE, 'visual-test.mjs'), '--root', root, ...which], { encoding: 'utf8', timeout: 1_800_000 });
  let summary; try { summary = JSON.parse(r.stdout); } catch { summary = null; }
  if (!summary) return { status: 'fail', detail: tail(r.stderr) || 'The visual test did not finish.' };
  if (summary.ok === false && summary.error) return { status: 'fail', detail: [summary.error, summary.output].filter(Boolean).join('\n') };
  if (summary.result === 'nothing-tested') return { status: 'not-run', reason: summary.message, howTo: 'Name the components with --component.' };
  const run = readJson(path.join(root, 'visual-report', 'run.json'), { stories: [] });
  const name = (s) => `${s.title} / ${s.name}`;
  const failures = run.stories.filter((s) => s.result === 'failure').map((s) => ({ story: name(s), reasons: s.reasons }));
  const warnings = run.stories.map((s) => ({ story: name(s), reasons: s.reasons.filter((x) => !/differs from baseline/.test(x)) })).filter((w, i) => run.stories[i].result !== 'failure' && w.reasons.length);
  const changedFromBaseline = run.stories.filter((s) => s.captures.some((c) => c.baseline === 'changed')).map((s) => s.id);
  return { status: failures.length ? 'fail' : 'pass', summary: { total: summary.total, pass: summary.pass, warning: summary.warning, failure: summary.failure }, failures, warnings, changedFromBaseline, report: 'visual-report/report.md', gallery: summary.gallery?.page };
}

/* ---------- lint, review, conventions ---------- */
function lint() {
  const c = lintCommand(root, scope.changedFiles);
  if (c.status) return c;
  log(`Lint: ${path.basename(c.command)} ${c.args.map((a) => (a.includes(path.sep) ? path.basename(a) : a)).join(' ')}`);
  const r = spawnSync(c.command, c.args, { cwd: root, encoding: 'utf8', timeout: 300_000 });
  const command = `${path.basename(c.command)} ${c.args.slice(0, 3).map((a) => (a.includes(path.sep) ? path.basename(a) : a)).join(' ')}`;
  return r.status === 0 ? { status: 'pass', command } : { status: 'fail', command, detail: tail((r.stdout || '') + '\n' + (r.stderr || '')) };
}
const review = readJson(path.join(root, 'visual-report', 'review.json'), {}) || {};
const changedAt = {};
for (const f of scope.changedFiles) {
  const c = classifyScope([f], { componentsDir }).components[0]; if (!c) continue;
  try { changedAt[c] = Math.max(changedAt[c] || 0, fs.statSync(path.join(root, f)).mtimeMs); } catch { /* deleted */ }
}

/* ---------- the change itself, for the independent reviewer ---------- */
const { diff, hash } = currentChange(root, changed.base);
const reviewerFile = path.join(outDir, 'reviewer.json');

const evidence = { createdAt: new Date().toISOString(), root: path.basename(root), scope, checks: {
  typecheck: typecheck(), lint: lint(), visualTest: visualTest(),
  review: scope.components.length ? reviewEvidence(review, scope.components, changedAt) : { status: 'not-run', reason: 'No component changed.', howTo: 'Name the components with --component.' },
  conventions: conventionsEvidence(root, sidecar.conventions || null, scope.components, review),
  reviewer: reviewerEvidence(readJson(reviewerFile, null), hash),
}, diffHash: hash };
const v = decide(evidence);
fs.mkdirSync(outDir, { recursive: true });
writeJson(path.join(outDir, 'evidence.json'), evidence);
let packet = null;
if (args.packet) {
  // project files by their project path; the skill's own files (cards) by their absolute path
  const rel = (f) => { const r = path.relative(root, f); return r.startsWith('..') ? path.resolve(f) : r.split(path.sep).join('/'); };
  const cards = [...new Set(scope.components.map((c) => cardFor(c, sidecar)).filter(Boolean))].map((c) => path.join(HERE, '..', 'components', `${c}.md`));
  const files = [...['COMPONENTS.md', 'DESIGN.md'].filter((f) => fs.existsSync(path.join(root, f))), ...cards.map((f) => rel(f)), rel(path.join(HERE, '..', 'components', '_rules.md'))];
  const run = readJson(path.join(root, 'visual-report', 'run.json'), { stories: [] });
  const shots = run.stories.filter((s) => scope.components.some((c) => c.toLowerCase() === s.title.split('/').pop().trim().toLowerCase())).flatMap((s) => s.captures.filter((c) => c.screenshot && ['mobile-390', 'desktop-1280'].includes(c.viewport)).map((c) => `visual-report/${c.screenshot}`));
  packet = path.join(outDir, 'review-packet.md');
  fs.writeFileSync(packet, reviewerPacket({ diff, hash, files, evidence: 'visual-report/verdict/evidence.json', screenshots: shots, out: 'visual-report/verdict/reviewer.json' }));
}
// before and after: the approved screenshots beside this run's, copied next to the page so it publishes as is
let ba = null;
if (evidence.checks.visualTest.summary) {
  const baselines = listBaselines(root);
  ba = beforeAfter(readJson(path.join(root, 'visual-report', 'run.json'), { stories: [] }), baselines);
  fs.rmSync(path.join(root, 'visual-report', 'before'), { recursive: true, force: true });
  for (const c of ba.copies) { const to = path.join(root, 'visual-report', c.to); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(root, c.from), to); }
}
const pagePath = path.join(root, 'visual-report', 'verdict.html');
fs.rmSync(path.join(outDir, 'index.html'), { force: true });
fs.writeFileSync(pagePath, renderVerdict(evidence, v, { extra: ba ? renderBeforeAfter(ba) : '' }));
const reach = previewReach();
console.log(JSON.stringify({ level: v.level, headline: v.headline, page: path.relative(root, pagePath), publish: { page: 'visual-report/verdict.html', files: ba ? ba.files : [] }, evidence: path.relative(root, path.join(outDir, 'evidence.json')), ...(packet ? { reviewerPacket: path.relative(root, packet) } : {}), diffHash: hash, blocking: v.blocking, concerns: v.concerns, gaps: v.gaps.map((g) => g.label), previewReachable: reach.local }, null, 2));
process.exit(v.level === 'blocked' ? 1 : 0);
