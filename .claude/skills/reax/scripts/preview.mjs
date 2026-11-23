#!/usr/bin/env node
// reax preview helper: starts Storybook (or reuses a running one), and serves the preview page next to Storybook's own
// frame on one local address. Decisions: ADR 0003 and the preview wiring ticket.
//
//   node preview.mjs                          open on the components changed on this branch or uncommitted
//   node preview.mjs --component Button       open on named components
//   node preview.mjs --story <id>             open on one story
//   options: --root <dir>  --port <n>  --storybook-url <url>  (reuse a Storybook that is already running)
//
// Output: stdout carries one JSON object per line and nothing else, and the same lines go to
// visual-report/preview-events.jsonl (follow it with preview-events.mjs):
//   {"event":"ready","url":...}   {"event":"comment",...} (a comment "sent")   {"event":"apply",...} (an edit set sent)
//   {"event":"stopped"} on exit, {"event":"error",...} when it cannot start
// Progress and Storybook's own output go to stderr. The page lives under /__reax/, Storybook at the address root.
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseArgs, req, chromiumPath, findUp, readJson, writeJson } from './lib/runtime.mjs';
import { mergeConfig } from './lib/capture.mjs';
import { selectStories } from './lib/select.mjs';
import { previewReach } from './lib/reach.mjs';
import { storybookInfo, startDev, readIndex, freePort, lastLines, stopTree, storybookCommand } from './lib/storybook.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
const outDir = path.join(root, 'visual-report');
const log = (m) => console.error(m);
// every event also goes to visual-report/preview-events.jsonl, which preview-events.mjs follows so an agent can be
// woken by each one; the file starts empty for each preview
const eventsFile = path.join(outDir, 'preview-events.jsonl');
fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(eventsFile, '');
const emit = (o) => { const line = JSON.stringify(o); console.log(line); try { fs.appendFileSync(eventsFile, line + '\n'); } catch { /* stdout still has it */ } };
const die = (message, output) => { emit({ event: 'error', message, ...(output ? { output } : {}) }); if (output) log(output); process.exit(1); };
let config;
try { config = mergeConfig(readJson(path.join(root, '.reax', 'visual-test.json'), {})); } catch (e) { die(e.message); }

/* ---------- Storybook: reuse or start ---------- */
let sb; let storybook;
try {
  if (args['storybook-url']) {
    const url = String(args['storybook-url']).replace(/\/$/, '');
    await readIndex(url); storybook = { url, stop: () => {} }; log(`Using the running Storybook at ${url}`);
  } else {
    const info = storybookInfo(root);
    if (!info.configDir) die('This project has no .storybook folder. Run the `storybook` command of the skill first.');
    if (!info.installed) die('Storybook is not installed in this project. Install it first (the `storybook` command of the skill does this).');
    if (info.supported === false) die(`Storybook ${info.version} is too old. The preview needs Storybook 8 or newer.`);
    storybook = await startDev(root, { command: storybookCommand(root, config), startTimeoutMs: config.preview.startTimeoutMs, log });
  }
} catch (e) {
  die(e.message, e.output ? lastLines(e.output, 20) : undefined);
}
const upstream = new URL(storybook.url);

let index;
try { index = await readIndex(storybook.url); } catch (e) { storybook.stop?.(); die(`Could not read Storybook's story list: ${e.message}`); }
if (!index.stories.length) { storybook.stop?.(); die('Storybook has no stories yet. Write a story first.'); }

/* ---------- which story to open on ---------- */
let initial = args.story && index.stories.find((s) => s.id === args.story)?.id;
let focus = [];
if (!initial) {
  const scope = selectStories({ root, config, args, all: index.stories });
  focus = scope.mode === 'all' && !args.all ? [] : scope.stories.map((s) => s.id);
  initial = scope.stories[0]?.id || index.stories[0].id;
  log(`Opening on ${scope.stories.length ? scope.description : 'the first story (' + scope.description + ')'}`);
}

/* ---------- local data the page writes ---------- */
const token = crypto.randomBytes(12).toString('hex');
const file = (n) => path.join(outDir, n);
const read = (n, d) => readJson(file(n), d);
const write = (n, v) => { fs.mkdirSync(outDir, { recursive: true }); writeJson(file(n), v); };
const viewportsFile = path.join(root, '.reax', 'viewports.json');
const nextId = (list, p) => p + (Math.max(0, ...list.map((x) => Number(String(x.id).slice(p.length)) || 0)) + 1);

/* ---------- a cropped screenshot of the commented element (best effort) ---------- */
let browserPromise;
async function browser() {
  browserPromise ||= (async () => {
    const { chromium } = req('playwright', root);
    return chromium.launch({ executablePath: chromiumPath(root), args: process.getuid?.() === 0 ? ['--no-sandbox'] : [] });
  })();
  return browserPromise;
}
async function crop(c) {
  try {
    const m = String(c.selector).match(/^\[data-slot="(.+?)"\](?::nth\((\d+)\))?$/); if (!m) return null;
    const b = await browser();
    const ctx = await b.newContext({ viewport: { width: c.viewport || 390, height: 800 }, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'reduce' });
    try {
      const page = await ctx.newPage();
      await page.goto(`${storybook.url}/iframe.html?id=${encodeURIComponent(c.story)}&viewMode=story`, { timeout: 20_000 });
      await page.waitForFunction(() => document.body.classList.contains('sb-show-main'), null, { timeout: 20_000 });
      if (c.textScale === 200) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      await page.waitForTimeout(300);
      const rel = path.posix.join('visual-report', 'comments', `${c.id}.png`);
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      await page.locator(`[data-slot="${m[1]}"]`).nth(Number(m[2] || 1) - 1).screenshot({ path: path.join(root, rel), animations: 'disabled', timeout: 8000 });
      return rel;
    } finally { await ctx.close(); }
  } catch (e) { log(`No crop for ${c.id}: ${String(e.message).split('\n')[0]}`); return null; }
}

/* ---------- the server ---------- */
const MAX_BODY = 1_000_000;
const json = (res, code, v) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(v)); };
const hostOk = (req_) => { const h = (req_.headers.host || '').replace(/:\d+$/, ''); return h === '127.0.0.1' || h === 'localhost'; };
const readPage = () => fs.readFileSync(path.join(HERE, 'preview', 'index.html'), 'utf8');

const server = http.createServer((rq, res) => {
  if (!hostOk(rq)) { res.writeHead(403); return res.end('local only'); }
  const u = new URL(rq.url, 'http://x');
  if (u.pathname === '/__reax' || u.pathname === '/__reax/') {
    if (u.searchParams.get('token') !== token) { res.writeHead(403); return res.end('token required'); }
    const boot = { token, initial, focus, project: path.basename(root) };
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    return res.end(readPage().replace('"__REAX_BOOT__"', JSON.stringify(boot).replace(/</g, '\\u003c')));
  }
  if (u.pathname === '/__reax/favicon.ico') { res.writeHead(204); return res.end(); }
  if (u.pathname.startsWith('/__reax/api/')) return api(rq, res, u);
  proxy(rq, res);
});

function api(rq, res, u) {
  if (rq.headers['x-token'] !== token) { res.writeHead(403); return res.end('forbidden'); }
  let body = ''; let tooBig = false;
  rq.on('data', (c) => { body += c; if (body.length > MAX_BODY) { tooBig = true; rq.destroy(); } });
  rq.on('end', async () => {
    if (tooBig) return;
    let data; try { data = body ? JSON.parse(body) : {}; } catch { return json(res, 400, { error: 'bad json' }); }
    const p = u.pathname.slice('/__reax/api'.length);
    try {
      if (p === '/state') return json(res, 200, { comments: read('comments.json', []), viewports: readJson(viewportsFile, []) });
      if (rq.method === 'POST' && p === '/comments') {
        const list = read('comments.json', []);
        const c = { id: nextId(list, 'c'), status: 'open', createdAt: new Date().toISOString(), crop: null, ...data };
        if (data.kind !== 'accepted-exception') c.crop = await crop(c);
        list.push(c); write('comments.json', list);
        if (c.sent) emit({ event: 'comment', id: c.id, text: c.text, story: c.story, selector: c.selector, role: c.role, name: c.name, viewport: c.viewport, textScale: c.textScale, box: c.box, crop: c.crop });
        return json(res, 200, c);
      }
      const m = p.match(/^\/comments\/(c\d+)$/);
      if (rq.method === 'PATCH' && m) {
        const list = read('comments.json', []); const c = list.find((x) => x.id === m[1]);
        if (!c) return json(res, 404, { error: 'not found' });
        const { status, text } = data; Object.assign(c, status ? { status } : {}, text !== undefined ? { text } : {}); write('comments.json', list); return json(res, 200, c);
      }
      if (rq.method === 'DELETE' && m) { write('comments.json', read('comments.json', []).filter((x) => x.id !== m[1])); return json(res, 200, { ok: true }); }
      const v = p.match(/^\/viewports\/(\d+)$/);
      if (rq.method === 'DELETE' && v) { const list = readJson(viewportsFile, []).filter((w) => w !== Number(v[1])); writeJson(viewportsFile, list); return json(res, 200, list); }
      if (rq.method === 'POST' && p === '/viewports') {
        const list = readJson(viewportsFile, []); const w = Math.round(Number(data.width));
        if (w >= 180 && w <= 1600 && !list.includes(w)) list.push(w);
        list.sort((a, b) => a - b); writeJson(viewportsFile, list); return json(res, 200, list);
      }
      if (rq.method === 'POST' && p === '/apply') {
        const list = read('applied-edits.json', []);
        const e = { id: nextId(list, 'e'), createdAt: new Date().toISOString(), ...data };
        list.push(e); write('applied-edits.json', list);
        emit({ event: 'apply', id: e.id, story: e.story, viewport: e.viewport, changes: e.changes, warnings: e.warnings, acceptedExceptions: e.acceptedExceptions });
        return json(res, 200, e);
      }
      json(res, 404, { error: 'unknown route' });
    } catch (e) { json(res, 500, { error: String(e.message || e) }); }
  });
}

/* everything else is Storybook, unchanged */
function proxy(rq, res) {
  const headers = { ...rq.headers, host: upstream.host };
  const up = http.request({ host: upstream.hostname, port: upstream.port, method: rq.method, path: rq.url, headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  up.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end('Storybook is not answering.'); });
  rq.pipe(up);
}
/* Storybook's hot-reload socket */
server.on('upgrade', (rq, socket, head) => {
  if (!hostOk(rq)) return socket.destroy();
  const up = net.connect(Number(upstream.port), upstream.hostname, () => {
    const lines = [`${rq.method} ${rq.url} HTTP/1.1`];
    for (let i = 0; i < rq.rawHeaders.length; i += 2) { const k = rq.rawHeaders[i]; const v = k.toLowerCase() === 'host' ? upstream.host : k.toLowerCase() === 'origin' ? upstream.origin : rq.rawHeaders[i + 1]; lines.push(`${k}: ${v}`); }
    up.write(lines.join('\r\n') + '\r\n\r\n'); if (head?.length) up.write(head);
    socket.pipe(up); up.pipe(socket);
  });
  up.on('error', () => socket.destroy()); socket.on('error', () => up.destroy());
});

const port = args.port ? Number(args.port) : await freePort();
await new Promise((r) => server.listen(port, '127.0.0.1', r));
const url = `http://127.0.0.1:${port}/__reax/?token=${token}`;
const reach = previewReach();
emit({ event: 'ready', url, storybook: `http://127.0.0.1:${port}/`, stories: index.stories.length, initial, reachable: reach.local, ...(reach.local ? {} : { reason: reach.reason }) });
if (!reach.local) log(`The person's browser probably cannot open this address: ${reach.reason}. Publish a static preview instead (visual-test --static).`);
log(`reax preview: ${url}`);

let closing = false;
async function shutdown() {
  if (closing) return; closing = true;
  emit({ event: 'stopped' });
  server.close(); server.closeAllConnections?.();
  try { (await browserPromise)?.close(); } catch { /* not started */ }
  storybook.stop?.(); setTimeout(() => process.exit(0), 200);
}
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((s) => process.on(s, shutdown));
process.on('exit', () => stopTree(storybook.child));
