// Shared runtime for the reax scripts: where dependencies come from, where the browser is, small helpers.
// Dependencies are never added to the target project. They live in a user-level cache (~/.cache/reax),
// and a project's own copies win when they exist (decision: Playwright and axe wiring, ADR 0002).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const CACHE = process.env.REAX_HOME || path.join(os.homedir(), '.cache', 'reax');

/** Packages the scripts need. Versions are pinned to CommonJS-compatible lines so `require` works from anywhere. */
export const PACKAGES = {
  playwright: '^1.50.0',
  '@axe-core/playwright': '^4.10.0',
  'axe-core': '^4.10.0',
  pixelmatch: '5.3.0',
  pngjs: '^7.0.0',
  yaml: '^2.5.0',
};

const cachePackageJson = path.join(CACHE, 'package.json');

/** Load a dependency: the project's copy if it has one, otherwise the cache. */
export function req(name, projectRoot = process.cwd()) {
  const roots = [path.join(projectRoot, 'package.json'), cachePackageJson];
  let lastError;
  for (const r of roots) {
    try { return createRequire(r)(name); } catch (e) { lastError = e; }
  }
  const err = new Error(`Dependency "${name}" is not installed. Run: node ${path.join(HERE, '..', 'setup.mjs')} --install`);
  err.code = 'REAX_MISSING_DEP'; err.cause = lastError;
  throw err;
}

/** Which packages are missing from both the project and the cache. */
export function missing(projectRoot = process.cwd()) {
  return Object.keys(PACKAGES).filter((name) => {
    try { req(name, projectRoot); return false; } catch { return true; }
  });
}

/** Path to a Chromium Playwright can launch, or null. REAX_CHROMIUM wins, then Playwright's own, then known locations. */
export function chromiumPath(projectRoot = process.cwd()) {
  const candidates = [process.env.REAX_CHROMIUM];
  try { candidates.push(req('playwright', projectRoot).chromium.executablePath()); } catch { /* not installed yet */ }
  candidates.push('/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome');
  return candidates.find((p) => p && fs.existsSync(p)) || null;
}

export const sha1 = (data) => crypto.createHash('sha1').update(data).digest('hex');

/** Find the nearest directory upward from `start` that contains one of `names`. */
export function findUp(start, names) {
  let dir = path.resolve(start);
  for (;;) {
    for (const n of names) if (fs.existsSync(path.join(dir, n))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Detect the package manager from the lockfile and return how to run a local binary. */
export function packageManager(root) {
  const has = (f) => fs.existsSync(path.join(root, f));
  if (has('pnpm-lock.yaml')) return { name: 'pnpm', exec: ['pnpm', 'exec'] };
  if (has('yarn.lock')) return { name: 'yarn', exec: ['yarn'] };
  if (has('bun.lockb') || has('bun.lock')) return { name: 'bun', exec: ['bunx'] };
  return { name: 'npm', exec: ['npx', '--no-install'] };
}

/** Parse `--flag value`, `--flag=value` and bare `--flag` arguments. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) out[k] = v;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i];
    else out[k] = true;
  }
  return out;
}

export const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
export const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); };
