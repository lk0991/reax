import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { selectStories } from '../lib/select.mjs';
import { mergeConfig } from '../lib/capture.mjs';

const git = (root, ...a) => { const r = spawnSync('git', ['-C', root, ...a], { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr); return r.stdout; };
const write = (root, f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s); };
const stories = [
  { id: 'button--primary', title: 'Components/Button', importPath: './src/components/Button/Button.stories.tsx' },
  { id: 'card--default', title: 'Components/Card', importPath: './src/components/Card/Card.stories.tsx' },
];
const config = mergeConfig({});

function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-select-'));
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 't@example.com'); git(root, 'config', 'user.name', 't');
  write(root, 'src/components/Button/Button.tsx', 'a'); write(root, 'src/components/Card/Card.tsx', 'a');
  git(root, 'add', '.'); git(root, 'commit', '-q', '-m', 'base');
  return root;
}

test('a component committed on a branch is still in the default scope', () => {
  const root = repo();
  git(root, 'checkout', '-q', '-b', 'feature');
  write(root, 'src/components/Button/Button.tsx', 'b'); git(root, 'commit', '-qam', 'change');
  const s = selectStories({ root, config, args: {}, all: stories });
  assert.deepEqual(s.stories.map((x) => x.id), ['button--primary']);
  assert.match(s.description, /main/);
});

test('uncommitted changes are included as well as the branch', () => {
  const root = repo();
  git(root, 'checkout', '-q', '-b', 'feature');
  write(root, 'src/components/Button/Button.tsx', 'b'); git(root, 'commit', '-qam', 'change');
  write(root, 'src/components/Card/Card.tsx', 'b');
  const s = selectStories({ root, config, args: {}, all: stories });
  assert.deepEqual(s.stories.map((x) => x.id).sort(), ['button--primary', 'card--default']);
});

test('with no base branch it falls back to uncommitted changes and says so', () => {
  const root = repo();
  git(root, 'branch', '-m', 'main', 'trunk-only');
  write(root, 'src/components/Card/Card.tsx', 'b');
  const s = selectStories({ root, config, args: {}, all: stories });
  assert.deepEqual(s.stories.map((x) => x.id), ['card--default']);
  assert.match(s.description, /no base branch/);
});

test('on the base branch itself, only uncommitted changes count', () => {
  const root = repo();
  const s = selectStories({ root, config, args: {}, all: stories });
  assert.equal(s.stories.length, 0);
});

test('when the branch cannot be compared with its base, it says so instead of claiming it did', () => {
  const root = repo();
  git(root, 'checkout', '-q', '--orphan', 'unrelated');
  write(root, 'src/components/Button/Button.tsx', 'c'); git(root, 'add', '.'); git(root, 'commit', '-qm', 'unrelated');
  const s = selectStories({ root, config, args: {}, all: stories });
  assert.match(s.description, /could not compare with main/);
  assert.doesNotMatch(s.description, /since main/);
});
