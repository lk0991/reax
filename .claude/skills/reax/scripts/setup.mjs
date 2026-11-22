#!/usr/bin/env node
// Checks and installs the dependencies the reax scripts need, in a user-level cache, never in the project.
//   node setup.mjs --check            print the status as JSON
//   node setup.mjs --install          install the missing packages into the cache (ask the person first)
//   node setup.mjs --install-browser  download Chromium through Playwright (only if no browser was found)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { CACHE, PACKAGES, missing, chromiumPath, parseArgs, req } from './lib/runtime.mjs';

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();

function status() {
  const miss = missing(root);
  return { cache: CACHE, packages: PACKAGES, missing: miss, chromium: chromiumPath(root), ready: miss.length === 0 && !!chromiumPath(root) };
}

if (args.install) {
  const miss = missing(root);
  if (miss.length) {
    fs.mkdirSync(CACHE, { recursive: true });
    const pj = path.join(CACHE, 'package.json');
    if (!fs.existsSync(pj)) fs.writeFileSync(pj, JSON.stringify({ name: 'reax-cache', private: true, version: '0.0.0' }, null, 2));
    const specs = miss.map((n) => `${n}@${PACKAGES[n]}`);
    console.error(`Installing into ${CACHE}: ${specs.join(' ')}`);
    const r = spawnSync('npm', ['install', '--no-audit', '--no-fund', '--prefix', CACHE, ...specs], { stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' } });
    if (r.status !== 0) { console.error('npm install failed'); process.exit(1); }
  }
}

if (args['install-browser']) {
  req('playwright', root); // fail early with a clear message if Playwright itself is missing
  const projectPw = path.join(root, 'node_modules', 'playwright');
  const pwDir = fs.existsSync(projectPw) ? projectPw : path.join(CACHE, 'node_modules', 'playwright');
  const r = spawnSync(process.execPath, [path.join(pwDir, 'cli.js'), 'install', 'chromium'], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('browser install failed'); process.exit(1); }
}

const s = status();
console.log(JSON.stringify(s, null, 2));
process.exit(args.check && !s.ready ? 2 : 0);
