#!/usr/bin/env node
// reax visual-test: builds Storybook statically, takes four captures per story, runs axe, compares with baselines,
// and writes visual-report/report.md and run.json. Decisions: ADR 0002 and the Playwright and axe wiring ticket.
//
//   node visual-test.mjs                       run for the components changed on this branch or uncommitted
//   node visual-test.mjs --component Button    run for named components (comma separated)
//   node visual-test.mjs --all                 run every story
//   node visual-test.mjs --approve [all|id|Component]   approve the last run's captures as baselines
//   node visual-test.mjs --preview [--component X]      open the live preview instead of running
//   node visual-test.mjs --static                       build Storybook into visual-report/static-preview/, to deploy to
//                                                       the person's own hosting when they cannot reach this machine (no tests run)
//   options: --root <dir>  --force (with --approve)
//
// Exit code: 0 when nothing blocks; 1 for axe serious/critical findings, a failed keyboard check, a story that could not
// run, or a failed run.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, req, missing, chromiumPath, findUp, readJson, writeJson } from './lib/runtime.mjs';
import { mergeConfig, capture, keyboardCapture } from './lib/capture.mjs';
import { runChecks, checksFor, CHECK_INFO } from './lib/keyboard.mjs';
import { cardFor } from './lib/cards.mjs';
import { compareImages } from './lib/diff.mjs';
import { renderReport } from './lib/report.mjs';
import { renderGallery } from './lib/gallery.mjs';
import { selectStories as select } from './lib/select.mjs';
import { storybookInfo, buildStatic, serveStatic, readIndex, storybookCommand } from './lib/storybook.mjs';
import { previewReach } from './lib/reach.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const startDir = path.resolve(args.root || process.cwd());
const root = findUp(startDir, ['package.json']) || startDir;
const log = (m) => console.error(m);
const fail = (message, extra = {}) => { console.log(JSON.stringify({ ok: false, error: message, ...extra }, null, 2)); process.exit(1); };

let config;
try { config = mergeConfig(readJson(path.join(root, '.reax', 'visual-test.json'), {})); } catch (e) { fail(e.message); }
/* widths pinned in the live preview become extra captures */
for (const w of readJson(path.join(root, '.reax', 'viewports.json'), [])) if (Number.isInteger(w) && !config.viewports.some((v) => v.width === w && !v.textScale)) config.viewports.push({ name: `pinned-${w}`, width: w, height: 844 });
const reportDir = path.join(root, 'visual-report');
// what one publish of a page and its files may hold (the Artifact tool's limits)
const PUBLISH_LIMITS = { files: 255, bytes: 64 * 1024 * 1024, fileBytes: 15 * 1024 * 1024 };
const baselineDir = path.join(root, '.reax', 'baselines');

/* ---------- --preview hands off to the preview helper ---------- */
if (args.preview) {
  const script = path.join(HERE, 'preview.mjs');
  if (!fs.existsSync(script)) fail('The preview helper is not installed in this skill.');
  const fwd = process.argv.slice(2).filter((a) => a !== '--preview');
  const child = spawn(process.execPath, [script, ...fwd], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
} else if (args.static) {
  await staticPreview();
} else if (args.approve !== undefined) {
  approve();
} else {
  await run();
}

/* ---------- a static Storybook to publish, for a person who cannot reach this machine ---------- */
async function staticPreview() {
  const sb = storybookInfo(root);
  if (!sb.configDir || !sb.installed) fail('No installed Storybook in this project. Run the storybook command first.');
  let built;
  try { built = await buildStatic(root, { command: storybookCommand(root, config), log }); } catch (e) { fail(e.message, { output: e.output }); }
  const dest = path.join(reportDir, 'static-preview');
  fs.rmSync(dest, { recursive: true, force: true }); fs.cpSync(built.outDir, dest, { recursive: true });
  const files = []; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push({ path: path.relative(dest, p).split(path.sep).join('/'), bytes: fs.statSync(p).size }); } };
  walk(dest);
  const bytes = files.reduce((n, f) => n + f.bytes, 0);
  const tooBig = files.filter((f) => f.bytes > PUBLISH_LIMITS.fileBytes).map((f) => f.path);
  const fits = files.length <= PUBLISH_LIMITS.files && bytes <= PUBLISH_LIMITS.bytes && !tooBig.length;
  console.log(JSON.stringify({ ok: true, dir: path.relative(root, dest), page: 'index.html', files: files.map((f) => f.path).filter((f) => f !== 'index.html'), count: files.length, bytes, fits, ...(tooBig.length ? { tooBig } : {}), reach: previewReach() }, null, 2));
  process.exit(0);
}

/* ---------- approve ---------- */
function approve() {
  const run = readJson(path.join(reportDir, 'run.json'), null);
  if (!run) fail('There is no previous run to approve. Run visual-test first.');
  const want = args.approve === true || args.approve === 'all' ? null : String(args.approve).toLowerCase().split(',');
  const picked = run.stories.filter((s) => !want || want.includes(s.id.toLowerCase()) || want.includes(s.title.split('/').pop().trim().toLowerCase()));
  const done = []; const refused = [];
  for (const s of picked) {
    const blocking = s.result === 'failure' || s.captures.some((c) => c.unstable || c.status !== 'ok');
    if (blocking && !args.force) { refused.push({ id: s.id, reason: s.reasons.join('; ') || 'a capture is unstable or did not run' }); continue; }
    for (const c of s.captures) {
      if (!c.screenshot || c.unstable) continue;
      const from = path.join(reportDir, c.screenshot); const to = path.join(baselineDir, s.id, `${c.viewport}.png`);
      fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); done.push(path.relative(root, to));
    }
  }
  console.log(JSON.stringify({ ok: refused.length === 0, approved: done.length, files: done, refused, note: refused.length ? 'Fix the blocking findings first, or pass --force.' : undefined }, null, 2));
  process.exit(refused.length ? 1 : 0);
}

/* ---------- run ---------- */
async function run() {
  const t0 = Date.now(); const startedAt = new Date().toISOString();
  const miss = missing(root); const chromium = chromiumPath(root);
  if (miss.length || !chromium) fail('Dependencies are missing.', { missing: miss, chromium, fix: `Ask the person, then run: node ${path.join(HERE, 'setup.mjs')} --install` });

  const sb = storybookInfo(root);
  if (!sb.configDir) fail('No Storybook found in this project (no .storybook folder). Run the storybook command to set one up.');
  if (!sb.installed) fail('Storybook is configured but not installed. Install the project dependencies first.');
  if (sb.supported === false) fail(`Storybook ${sb.version} is older than the supported 8. Upgrade it first.`);
  if (sb.bestEffort) log('Storybook 7 is supported on a best-effort basis.');

  let built;
  try { built = await buildStatic(root, { command: storybookCommand(root, config), log }); } catch (e) { fail(e.message, { output: e.output }); }
  const server = await serveStatic(built.outDir);
  let index;
  try { index = await readIndex(server.url); } catch (e) { await server.close(); fail(`Could not read Storybook's story list: ${e.message}`); }

  const scope = select({ root, config, args, all: index.stories });
  if (!scope.stories.length) { await server.close(); console.log(JSON.stringify({ result: 'nothing-tested', ran: 0, message: scope.description, note: 'No story was tested. This is not a pass.', hint: 'Use --all, or --component <name>, to choose stories.' }, null, 2)); process.exit(0); }
  log(`Running ${scope.stories.length} stories x ${config.viewports.length} captures (${scope.description}).`);

  const { chromium: pw } = req('playwright', root); const { AxeBuilder } = req('@axe-core/playwright', root);
  const browser = await pw.launch({ executablePath: chromium, args: process.getuid?.() === 0 ? ['--no-sandbox'] : [] });
  fs.rmSync(path.join(reportDir, 'screenshots'), { recursive: true, force: true }); fs.rmSync(path.join(reportDir, 'diffs'), { recursive: true, force: true });
  fs.mkdirSync(reportDir, { recursive: true });

  const tasks = scope.stories.flatMap((story) => config.viewports.map((vp) => ({ story, vp })));
  const results = new Map(); let next = 0; let doneCount = 0;
  const worker = async () => {
    for (;;) {
      const i = next++; if (i >= tasks.length) return;
      const { story, vp } = tasks[i];
      const r = await capture({ browser, baseUrl: server.url, story, vp, config, AxeBuilder });
      results.set(`${story.id}|${vp.name}`, r);
      log(`  [${++doneCount}/${tasks.length}] ${story.id} @ ${vp.name}: ${r.status}${r.unstable ? ' (unstable)' : ''}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(config.concurrency, tasks.length) }, worker));

  // keyboard and focus checks: once per story, at the first viewport, with the checks its card names
  const sidecar = readJson(path.join(root, '.reax', 'design.json'), {});
  const keyboard = new Map(); let kNext = 0;
  const kWorker = async () => {
    for (;;) {
      const i = kNext++; if (i >= scope.stories.length) return;
      const story = scope.stories[i]; const card = cardFor(story.title, sidecar);
      const results = await keyboardCapture({ browser, baseUrl: server.url, story, vp: config.viewports[0], config, checks: checksFor(card), runChecks });
      keyboard.set(story.id, { card, results: results.map((r) => ({ ...r, ...(CHECK_INFO[r.id] || {}) })) });
    }
  };
  if (config.keyboard !== false) { log('Running keyboard and focus checks.'); await Promise.all(Array.from({ length: Math.min(config.concurrency, scope.stories.length) }, kWorker)); }
  await browser.close(); await server.close();

  const stories = scope.stories.map((story) => assemble(story, results, keyboard.get(story.id)));
  const summary = { total: stories.length, pass: stories.filter((s) => s.result === 'pass').length, warning: stories.filter((s) => s.result === 'warning').length, failure: stories.filter((s) => s.result === 'failure').length };
  const exitCode = summary.failure ? 1 : 0;
  const runJson = { startedAt, durationMs: Date.now() - t0, root, storybook: { version: sb.version }, scope: { description: scope.description, mode: scope.mode }, config: { viewports: config.viewports, diffThreshold: config.diffThreshold, axe: config.axe }, stories, summary, exitCode };
  writeJson(path.join(reportDir, 'run.json'), runJson);
  fs.writeFileSync(path.join(reportDir, 'report.md'), renderReport(runJson));
  const gallery = renderGallery(runJson);
  fs.writeFileSync(path.join(reportDir, 'gallery.html'), gallery.html);
  // can the page and its screenshots go out in one publish? (count, total size and size of each file)
  const sizes = gallery.files.map((f) => fs.statSync(path.join(reportDir, f)).size);
  const galleryBytes = sizes.reduce((n, b) => n + b, 0) + Buffer.byteLength(gallery.html);
  const galleryFits = gallery.files.length + 1 <= PUBLISH_LIMITS.files && galleryBytes <= PUBLISH_LIMITS.bytes && sizes.every((b) => b <= PUBLISH_LIMITS.fileBytes);
  const reach = previewReach();
  console.log(JSON.stringify({ ok: exitCode === 0, ...summary, report: path.relative(root, path.join(reportDir, 'report.md')), run: path.relative(root, path.join(reportDir, 'run.json')),
    gallery: { page: path.relative(root, path.join(reportDir, 'gallery.html')), files: gallery.files.length, bytes: galleryBytes, fits: galleryFits }, previewReachable: reach.local, ...(reach.local ? {} : { previewUnreachableBecause: reach.reason }), exitCode }, null, 2));
  process.exit(exitCode);
}

/* ---------- turning captures into a story result ---------- */
function assemble(story, results, keyboard = { card: null, results: [] }) {
  const captures = []; const axeMap = new Map(); const textMap = new Map(); const reasons = []; let failure = false; let warning = false;
  for (const vp of config.viewports) {
    const r = results.get(`${story.id}|${vp.name}`);
    const cap = { viewport: vp.name, status: r.status, unstable: r.unstable, screenshot: null, baseline: 'none', diff: null, size: r.size, content: r.content, overflow: r.overflow, error: r.error };
    if (r.buffer) {
      const rel = path.posix.join('screenshots', story.id, `${vp.name}.png`); const abs = path.join(reportDir, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, r.buffer); cap.screenshot = rel;
      const basePath = path.join(baselineDir, story.id, `${vp.name}.png`);
      if (fs.existsSync(basePath) && !r.unstable) {
        const d = compareImages(fs.readFileSync(basePath), r.buffer, root);
        cap.baseline = d.ratio > config.diffThreshold ? 'changed' : 'matched'; cap.diff = { ratio: d.ratio, pixels: d.pixels, dimsDiffer: d.dimsDiffer, box: d.box || null, image: null };
        if (d.diffPng && cap.baseline === 'changed') { const drel = path.posix.join('diffs', story.id, `${vp.name}.png`); fs.mkdirSync(path.dirname(path.join(reportDir, drel)), { recursive: true }); fs.writeFileSync(path.join(reportDir, drel), d.diffPng); cap.diff.image = drel; }
      }
    }
    for (const f of r.axe) { for (const n of f.nodes) { const key = `${f.id}|${n.target}`; const e = axeMap.get(key) || { id: f.id, impact: f.impact, help: f.help, helpUrl: f.helpUrl, target: n.target, html: n.html, summary: n.summary, captures: [] }; e.captures.push(vp.name); axeMap.set(key, e); } }
    for (const t of r.textScale) { const e = textMap.get(t.selector) || t; textMap.set(t.selector, e); }
    if (r.status === 'could-not-run') { failure = true; reasons.push(`could not run at ${vp.name}`); }
    if (r.unstable) { warning = true; reasons.push(`unstable capture at ${vp.name}`); }
    if (r.overflow) { warning = true; reasons.push(`scrolls sideways at ${vp.name}`); }
    if (cap.baseline === 'changed') { warning = true; reasons.push(`differs from baseline at ${vp.name}`); }
    captures.push(cap);
  }
  const axe = [...axeMap.values()];
  const blocking = axe.filter((f) => config.axe.blockingImpacts.includes(f.impact));
  if (blocking.length) { failure = true; reasons.push(`${blocking.length} blocking accessibility finding${blocking.length > 1 ? 's' : ''}`); }
  if (axe.length > blocking.length) { warning = true; reasons.push(`${axe.length - blocking.length} other accessibility finding${axe.length - blocking.length > 1 ? 's' : ''}`); }
  const brokenKeys = keyboard.results.filter((r) => r.ok === false && !r.default);
  if (brokenKeys.length) { failure = true; reasons.push(`keyboard: ${brokenKeys.map((r) => r.id).join(', ')}`); }
  if (keyboard.results.some((r) => r.error)) { warning = true; reasons.push('keyboard checks could not run'); }
  const missedDefaults = keyboard.results.filter((r) => r.ok === false && r.default);
  if (missedDefaults.length) { warning = true; reasons.push(`keyboard default not met: ${missedDefaults.map((r) => r.id).join(', ')}`); }
  const textScale = [...textMap.values()]; if (textScale.length) { warning = true; reasons.push(`${textScale.length} text size${textScale.length > 1 ? 's' : ''} ignore the 200% setting`); }
  return { id: story.id, title: story.title, name: story.name, importPath: story.importPath, card: keyboard.card, keyboard: keyboard.results, captures, axe, textScale, result: failure ? 'failure' : warning ? 'warning' : 'pass', reasons: [...new Set(reasons)] };
}
