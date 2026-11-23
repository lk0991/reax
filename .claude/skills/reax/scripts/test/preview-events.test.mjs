import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'preview-events.mjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function follow(root, ...args) {
  const child = spawn(process.execPath, [SCRIPT, '--root', root, ...args]);
  let out = ''; child.stdout.on('data', (d) => { out += d; });
  const done = new Promise((r) => child.on('exit', (code) => r(code)));
  return { lines: () => out.split('\n').filter(Boolean).map((l) => JSON.parse(l)), done, kill: () => child.kill() };
}

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-ev-'));
  fs.mkdirSync(path.join(root, 'visual-report'));
  return { root, file: path.join(root, 'visual-report', 'preview-events.jsonl') };
}
const add = (file, o) => fs.appendFileSync(file, JSON.stringify(o) + '\n');

test('prints each event as it is appended, numbered, and exits on "stopped"', async () => {
  const { root, file } = project();
  add(file, { event: 'ready', url: 'http://127.0.0.1:1/__reax/' });
  const f = follow(root);
  await sleep(400); add(file, { event: 'comment', id: 'c1', text: 'Too tight' });
  await sleep(400); add(file, { event: 'stopped' });
  assert.equal(await f.done, 0);
  assert.deepEqual(f.lines().map((e) => [e.line, e.event]), [[1, 'ready'], [2, 'comment'], [3, 'stopped']]);
});

test('--from skips events already handled, so a re-armed watch loses and repeats nothing', async () => {
  const { root, file } = project();
  add(file, { event: 'ready' }); add(file, { event: 'comment', id: 'c1' }); add(file, { event: 'apply', id: 'e1' }); add(file, { event: 'stopped' });
  const f = follow(root, '--from', '3');
  assert.equal(await f.done, 0);
  assert.deepEqual(f.lines().map((e) => e.event), ['apply', 'stopped']);
});

test('waits for the file when the preview has not started yet', async () => {
  const { root, file } = project();
  const f = follow(root);
  await sleep(400); add(file, { event: 'ready' }); add(file, { event: 'stopped' });
  assert.equal(await f.done, 0);
  assert.deepEqual(f.lines().map((e) => e.event), ['ready', 'stopped']);
});

test('with --run, an old preview\'s events are ignored until this run\'s events arrive', async () => {
  const { root, file } = project();
  add(file, { event: 'ready', run: 'old' }); add(file, { event: 'comment', run: 'old', id: 'c9' }); add(file, { event: 'stopped', run: 'old' });
  const f = follow(root, '--run', 'new');
  await sleep(500);
  fs.writeFileSync(file, ''); add(file, { event: 'ready', run: 'new' }); add(file, { event: 'comment', run: 'new', id: 'c1' }); add(file, { event: 'stopped', run: 'new' });
  assert.equal(await f.done, 0);
  assert.deepEqual(f.lines().map((e) => [e.event, e.run]), [['ready', 'new'], ['comment', 'new'], ['stopped', 'new']]);
});

test('a re-armed watch on a file a new preview replaced starts that preview from its first event', async () => {
  const { root, file } = project();
  add(file, { event: 'ready', run: 'b' }); add(file, { event: 'comment', run: 'b', id: 'c1' }); add(file, { event: 'stopped', run: 'b' });
  const f = follow(root, '--run', 'a', '--from', '3');
  assert.equal(await f.done, 0);
  assert.deepEqual(f.lines().map((e) => e.event), ['replaced']);
});
