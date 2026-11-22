// Everything about Storybook that the visual test and the preview share: finding it, building it, serving a static
// build, starting a dev server, and reading its story list (index.json).
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { sha1, packageManager, readJson } from './runtime.mjs';

export function storybookInfo(root) {
  const configDir = ['.storybook'].map((d) => path.join(root, d)).find((d) => fs.existsSync(d)) || null;
  const pkg = readJson(path.join(root, 'package.json'), {});
  const sbPkg = readJson(path.join(root, 'node_modules', 'storybook', 'package.json'), null);
  const version = sbPkg?.version || (pkg.devDependencies?.storybook || pkg.dependencies?.storybook || '').replace(/^[^\d]*/, '') || null;
  const major = version ? Number(String(version).split('.')[0]) : null;
  const preview = configDir ? ['preview.ts', 'preview.tsx', 'preview.js', 'preview.jsx'].map((f) => path.join(configDir, f)).find((f) => fs.existsSync(f)) || null : null;
  return { configDir, installed: !!sbPkg, version, major, supported: major === null ? null : major >= 8, bestEffort: major === 7, preview };
}

const IGNORE = new Set(['node_modules', '.git', 'storybook-static', 'visual-report', '.reax', 'dist', 'build', 'coverage']);
const SOURCE = /\.(tsx?|jsx?|css|scss|json|mdx|html|svg)$/;

/** A hash of the files a Storybook build depends on, so a build is repeated only when something changed. */
export function sourceHash(root) {
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (IGNORE.has(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (SOURCE.test(e.name) || ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(e.name)) { try { if (fs.statSync(p).size < 1_000_000) files.push(p); } catch { /* unreadable: skip */ } } } };
  walk(root);
  const h = sha1(''); const parts = files.sort().map((f) => `${path.relative(root, f)}:${sha1(fs.readFileSync(f))}`);
  return sha1(h + parts.join('\n'));
}

export const lastLines = (text, n = 20) => text.split('\n').filter(Boolean).slice(-n).join('\n');

/** Build Storybook statically into a temp folder, rebuilding only when the sources changed. */
export async function buildStatic(root, { command, log = () => {} } = {}) {
  const outDir = path.join(os.tmpdir(), 'reax', sha1(root), 'storybook-static');
  const stamp = path.join(outDir, '..', 'build.json');
  const hash = sourceHash(root); const prev = readJson(stamp, null);
  if (prev?.hash === hash && fs.existsSync(path.join(outDir, 'index.json'))) { log('Storybook build is current, reusing it.'); return { outDir, reused: true }; }
  fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(path.dirname(outDir), { recursive: true });
  const base = command ? command.split(' ') : [...packageManager(root).exec, 'storybook'];
  log(`Building Storybook: ${base.join(' ')} build`);
  const r = spawnSync(base[0], [...base.slice(1), 'build', '-o', outDir, '--quiet'], { cwd: root, encoding: 'utf8', env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1', CI: '1' } });
  if (r.status !== 0) { const err = new Error('The Storybook build failed.'); err.code = 'REAX_BUILD_FAILED'; err.output = lastLines((r.stdout || '') + '\n' + (r.stderr || ''), 20); throw err; }
  fs.writeFileSync(stamp, JSON.stringify({ hash, at: new Date().toISOString() }));
  return { outDir, reused: false };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json', '.ico': 'image/x-icon', '.txt': 'text/plain' };

/** Serve a static folder on 127.0.0.1 and a free port. */
export function serveStatic(dir) {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x'); let p = path.join(dir, decodeURIComponent(u.pathname));
    if (!p.startsWith(dir)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) })));
}

export async function freePort() {
  return new Promise((resolve, reject) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); s.on('error', reject); });
}

/** Read Storybook's story list. Entries of type "story" only. */
export async function readIndex(baseUrl) {
  const res = await fetch(`${baseUrl}/index.json`);
  if (!res.ok) { const err = new Error(`index.json answered ${res.status}`); err.code = 'REAX_NO_INDEX'; throw err; }
  const json = await res.json();
  const entries = Object.values(json.entries || json.stories || {});
  return { version: json.v, stories: entries.filter((e) => (e.type || 'story') === 'story') };
}

/** Start `storybook dev` for the preview: loopback only, free port, no telemetry, no browser. Returns the child and its output. */
export async function startDev(root, { port, command, startTimeoutMs = 90_000, log = () => {} } = {}) {
  const p = port || (await freePort());
  const full = command ? command.split(' ') : [...packageManager(root).exec, 'storybook'];
  const args = [...full.slice(1), 'dev', '-p', String(p), '--host', '127.0.0.1', '--ci', '--no-open', '--disable-telemetry'];
  log(`Starting Storybook: ${full[0]} ${args.join(' ')}`);
  const child = spawn(full[0], args, { cwd: root, detached: true, env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1', CI: '1', BROWSER: 'none' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = ''; const onData = (d) => { output = (output + d.toString()).slice(-20_000); };
  child.stdout.on('data', onData); child.stderr.on('data', onData);
  let exited = null; child.on('exit', (code) => { exited = code ?? 1; });
  const url = `http://127.0.0.1:${p}`; const started = Date.now();
  while (Date.now() - started < startTimeoutMs) {
    if (exited !== null) { const err = new Error('Storybook exited before it was ready.'); err.code = 'REAX_DEV_EXITED'; err.output = lastLines(output, 20); throw err; }
    try { const r = await fetch(`${url}/index.json`); if (r.ok) return { child, url, port: p, output: () => output, stop: () => stopTree(child) }; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  stopTree(child);
  const err = new Error(`Storybook did not answer within ${Math.round(startTimeoutMs / 1000)} seconds.`); err.code = 'REAX_DEV_TIMEOUT'; err.output = lastLines(output, 20); throw err;
}

/** Stop a child and everything it started (its whole process group). */
export function stopTree(child) {
  if (!child || child.killed || child.exitCode !== null) return;
  try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch { /* already gone */ } }
  setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch { /* gone */ } }, 3000).unref();
}
