import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { planTokenChange, applyTokenChange, undoTokenChange, keepTokenChange, contrastPairs } from '../lib/token-change.mjs';
import { planWrite } from '../lib/write.mjs';
import { loadDesign } from '../lib/design.mjs';

const CSS = `:root {\n  --brand-blue-500: #1f4f9a;\n  --ink-900: #1a1a1a;\n  --paper: #ffffff;\n  --corner-m: 0.5rem;\n}\n`;
function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-tc-'));
  fs.mkdirSync(path.join(root, 'src/styles'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/styles/tokens.css'), CSS);
  const src = (p, css, line) => [p, { file: 'src/styles/tokens.css', line, css }];
  planWrite(root, {
    name: 'Acme', tokens: { colors: { primary: '#1f4f9a', 'on-surface': '#1a1a1a', surface: '#ffffff' }, rounded: { md: '0.5rem' } },
    prose: { overview: 'Written by a person.' },
    scan: { tokenFiles: ['src/styles/tokens.css'], componentsDir: 'src/components' },
    sidecar: { tokenSources: Object.fromEntries([src('colors.primary', '--brand-blue-500', 2), src('colors.on-surface', '--ink-900', 3), src('colors.surface', '--paper', 4), src('rounded.md', '--corner-m', 5)]) },
  }, { apply: true });
  // a person's own words in a spec section must survive a token change
  const md = path.join(root, 'DESIGN.md');
  fs.writeFileSync(md, fs.readFileSync(md, 'utf8').replace('Colour tokens found in the project.', 'Our blue is the harbour at dusk.'));
  planWrite; return root;
}

test('a value change edits the token file at its recorded line, keeping the project\'s name, and only the value in DESIGN.md', () => {
  const root = project();
  const plan = planTokenChange(root, { 'colors.primary': '#2a5db0' });
  assert.deepEqual(plan.errors, []);
  assert.deepEqual(plan.edits.map((e) => [e.file, e.line, e.css, e.from, e.to]), [['src/styles/tokens.css', 2, '--brand-blue-500', '#1f4f9a', '#2a5db0']]);
  assert.equal(fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8'), CSS); // nothing written by planning
  applyTokenChange(root, plan);
  assert.match(fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8'), /--brand-blue-500: #2a5db0;/);
  const d = loadDesign(root, { root });
  assert.equal(d.tokens['colors.primary'].resolved, '#2a5db0');
  assert.equal(d.tokens['colors.primary'].css, '--brand-blue-500');
  assert.equal(d.stale.stale, false);
  assert.match(fs.readFileSync(path.join(root, 'DESIGN.md'), 'utf8'), /Our blue is the harbour at dusk\./);
});

test('several tokens change as one proposal', () => {
  const root = project();
  const plan = planTokenChange(root, { 'colors.primary': '#2a5db0', 'rounded.md': '0.75rem' });
  assert.equal(plan.edits.length, 2);
  applyTokenChange(root, plan);
  const d = loadDesign(root, { root });
  assert.equal(d.tokens['rounded.md'].resolved, '0.75rem');
});

test('a change that breaks a contrast pair is refused, with the nearest value that passes', () => {
  const root = project();
  const plan = planTokenChange(root, { 'colors.on-surface': '#b0b0b0' });
  assert.equal(plan.edits.length, 0);
  assert.equal(plan.errors.length, 1);
  assert.match(plan.errors[0].message, /on-surface on surface/);
  assert.match(plan.errors[0].message, /1\.4\.3/);
  assert.match(plan.errors[0].nearest, /^#[0-9a-f]{6}$/);
  // the nearest value passes
  assert.deepEqual(planTokenChange(root, { 'colors.on-surface': plan.errors[0].nearest }).errors, []);
});

test('an unknown token, or one with no recorded source, is an error, not a guess', () => {
  const root = project();
  assert.match(planTokenChange(root, { 'colors.nope': '#000000' }).errors[0].message, /no token/i);
});

test('a trial can be undone exactly, or kept', () => {
  const root = project();
  const before = { css: fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8'), md: fs.readFileSync(path.join(root, 'DESIGN.md'), 'utf8'), side: fs.readFileSync(path.join(root, '.reax/design.json'), 'utf8') };
  applyTokenChange(root, planTokenChange(root, { 'colors.primary': '#2a5db0' }), { trial: true });
  undoTokenChange(root);
  assert.equal(fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8'), before.css);
  assert.equal(fs.readFileSync(path.join(root, 'DESIGN.md'), 'utf8'), before.md);
  assert.equal(fs.readFileSync(path.join(root, '.reax/design.json'), 'utf8'), before.side);
  applyTokenChange(root, planTokenChange(root, { 'colors.primary': '#2a5db0' }), { trial: true });
  keepTokenChange(root);
  assert.throws(() => undoTokenChange(root), /no trial/i);
});

test('contrastPairs finds text and UI pairs by the usual token names', () => {
  const pairs = contrastPairs(['colors.on-surface', 'colors.surface', 'colors.primary', 'colors.on-primary', 'colors.ink-muted', 'colors.bg']);
  const has = (a, b) => pairs.some((p) => p.fg === a && p.bg === b);
  assert.ok(has('colors.on-surface', 'colors.surface'));
  assert.ok(has('colors.on-primary', 'colors.primary'));
  assert.ok(has('colors.ink-muted', 'colors.bg'));
  assert.ok(has('colors.primary', 'colors.bg'));
});
