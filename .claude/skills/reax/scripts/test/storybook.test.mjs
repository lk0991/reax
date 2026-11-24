import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { storybookCommand } from '../lib/storybook.mjs';
import { mergeConfig } from '../lib/capture.mjs';

function project({ lock = 'yarn.lock', withBin = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-sb-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'p', scripts: { storybook: 'storybook dev -p 6006' } }));
  if (lock) fs.writeFileSync(path.join(root, lock), '');
  if (withBin) {
    const pkg = path.join(root, 'node_modules', 'storybook');
    fs.mkdirSync(path.join(pkg, 'bin'), { recursive: true });
    fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: 'storybook', version: '10.0.0', bin: { storybook: './bin/index.cjs' } }));
    fs.writeFileSync(path.join(pkg, 'bin', 'index.cjs'), '');
  }
  return root;
}

test('runs the installed Storybook binary directly, so a "storybook" script cannot shadow it', () => {
  const root = project({ lock: 'yarn.lock' });
  const cmd = storybookCommand(root, mergeConfig({}));
  assert.equal(cmd[0], process.execPath);
  assert.equal(cmd[1], path.join(fs.realpathSync(root), 'node_modules', 'storybook', 'bin', 'index.cjs'));
});

test('a configured command wins and is split into arguments', () => {
  const root = project();
  assert.deepEqual(storybookCommand(root, mergeConfig({ storybook: { command: 'pnpm exec storybook' } })), ['pnpm', 'exec', 'storybook']);
});

test('without a resolvable binary, it falls back to the package manager\'s exec, never to a yarn script', () => {
  assert.deepEqual(storybookCommand(project({ lock: 'pnpm-lock.yaml', withBin: false }), mergeConfig({})), ['pnpm', 'exec', 'storybook']);
  assert.deepEqual(storybookCommand(project({ lock: null, withBin: false }), mergeConfig({})), ['npx', '--no-install', 'storybook']);
  assert.deepEqual(storybookCommand(project({ lock: 'yarn.lock', withBin: false }), mergeConfig({})), ['yarn', 'exec', 'storybook']);
});

test('the old buildCommand setting is refused with a clear message', () => {
  assert.throws(() => mergeConfig({ storybook: { buildCommand: 'npm run build-storybook' } }), /storybook\.command/);
});

test('the static server answers a malformed or escaping path without crashing', async () => {
  const { serveStatic } = await import('../lib/storybook.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-srv-')); fs.writeFileSync(path.join(dir, 'index.html'), 'ok');
  const s = await serveStatic(dir);
  try {
    assert.equal((await fetch(`${s.url}/%E0%A4%A`)).status, 400);
    assert.equal((await fetch(`${s.url}/..%2f..%2fetc%2fpasswd`)).status, 403);
    assert.equal(await (await fetch(`${s.url}/`)).text(), 'ok');
  } finally { await s.close(); }
});
