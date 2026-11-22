import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseDesignMarkdown, flattenTokens, loadDesign, diffText } from '../lib/design.mjs';
import { planWrite, composeDesignMarkdown } from '../lib/write.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'reax-test-'));

const VALID = `---
version: alpha
name: Test System
description: A fixture
---

# Test System

## Overview

Plain and calm.

## Colors

\`\`\`yaml
colors:
  primary: "#1f4f9a"
  on-primary: "{colors.surface}"
  surface: "#ffffff"
\`\`\`

## Layout

\`\`\`yaml
spacing:
  base: 16px
  md: 16px
  size:
    24: 24px
  breakpoint:
    md: 768px
\`\`\`

## Iconography

Unknown sections are preserved.
`;

test('parses front matter, yaml blocks and sections, and resolves references', () => {
  const p = parseDesignMarkdown(VALID);
  assert.equal(p.meta.name, 'Test System');
  assert.deepEqual(p.errors, []);
  assert.deepEqual(p.sections.map((s) => s.name), ['Overview', 'Colors', 'Layout', 'Iconography']);
  const { flat, errors } = flattenTokens(p.top);
  assert.deepEqual(errors, []);
  assert.equal(flat['colors.on-primary'].resolved, '#ffffff');
  assert.equal(flat['spacing.size.24'].css, '--space-size-24');
  assert.equal(flat['spacing.breakpoint.md'].resolved, '768px');
});

test('rejects a top-level key defined twice across blocks', () => {
  const p = parseDesignMarkdown(`---\nname: x\ncolors:\n  primary: "#000"\n---\n\n## Colors\n\n\`\`\`yaml\ncolors:\n  secondary: "#fff"\n\`\`\`\n`);
  assert.ok(p.errors.some((e) => e.kind === 'duplicate-key'));
});

test('rejects duplicate section headings', () => {
  const p = parseDesignMarkdown('## Colors\n\ntext\n\n## Colors\n\nmore\n');
  assert.ok(p.errors.some((e) => e.kind === 'duplicate-section'));
});

test('rejects a flat and a grouped name that become the same CSS property', () => {
  const { errors } = flattenTokens({ colors: { 'primary-light': '#fff', primary: { light: '#000' } } });
  assert.ok(errors.some((e) => e.kind === 'name-collision'));
});

test('reports unresolved references and cycles', () => {
  const { errors } = flattenTokens({ colors: { a: '{colors.missing}', b: '{colors.c}', c: '{colors.b}' } });
  assert.ok(errors.some((e) => e.kind === 'unresolved-reference'));
  assert.ok(errors.some((e) => e.kind === 'reference-cycle'));
});

test('accepts unknown token names and warns when sections are out of order', () => {
  const { flat, errors } = flattenTokens({ colors: { 'surface-container-high': '#ede7dd' }, typography: { 'telemetry-data': { fontFamily: 'Mono', fontSize: '12px' } } });
  assert.deepEqual(errors, []);
  assert.ok(flat['typography.telemetry-data']);
  const p = parseDesignMarkdown('## Typography\n\nx\n\n## Colors\n\ny\n');
  assert.ok(p.warnings.some((w) => w.kind === 'section-order'));
});

const DRAFT = {
  name: 'Sample', description: 'A sample',
  tokens: { colors: { primary: '#1f4f9a', surface: '#ffffff' }, spacing: { md: '16px', size: { 24: '24px' } }, rounded: { md: '8px' } },
  scan: { tokenFiles: ['tokens.css'], componentsDir: 'src/components' },
  sidecar: { language: { framework: 'react 18', styling: 'css-vars' }, inventory: [{ name: 'Button', path: 'src/components/Button', card: 'button' }], tokenSources: { 'colors.primary': { file: 'tokens.css', line: 1 } } },
  gaps: ['No dark theme found.'],
};

test('write never overwrites by itself, and writes on apply', () => {
  const root = tmp(); fs.writeFileSync(path.join(root, 'tokens.css'), ':root{--color-primary:#1f4f9a}');
  const plan = planWrite(root, DRAFT);
  assert.equal(plan.applied, false); assert.equal(plan.changed, true);
  assert.equal(fs.existsSync(path.join(root, 'DESIGN.md')), false);
  const done = planWrite(root, DRAFT, { apply: true });
  assert.equal(done.applied, true);
  const d = loadDesign(root, { root });
  assert.deepEqual(d.errors, []);
  assert.equal(d.tokens['colors.primary'].resolved, '#1f4f9a');
  assert.equal(d.inventory[0].name, 'Button');
  assert.equal(d.stale.stale, false);
  assert.ok(d.sections.some((s) => s.name === 'Gaps') && d.sections.some((s) => s.name === 'Language'));
  // a second identical run proposes nothing
  assert.equal(planWrite(root, DRAFT).changed, false);
});

test('a re-run keeps human-written prose and unknown sections verbatim', () => {
  const root = tmp(); planWrite(root, DRAFT, { apply: true });
  const file = path.join(root, 'DESIGN.md');
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/## Overview[\s\S]*?(?=\n## )/, '## Overview\n\nWritten by a person. Keep me.\n').trimEnd() + '\n\n## Iconography\n\nLucide, 1.5px strokes.\n';
  fs.writeFileSync(file, text);
  const next = { ...DRAFT, tokens: { ...DRAFT.tokens, colors: { primary: '#000000', surface: '#ffffff' } } };
  const plan = planWrite(root, next, { apply: true });
  const out = fs.readFileSync(file, 'utf8');
  assert.match(out, /Written by a person\. Keep me\./);
  assert.match(out, /Lucide, 1\.5px strokes\./);
  assert.match(out, /primary: "#000000"|primary: '#000000'|primary: #000000/);
  assert.ok(plan.diff.includes('#000000'));
  assert.deepEqual(loadDesign(root, { root }).errors, []);
});

test('detects staleness when a token file or a component changes', () => {
  const root = tmp();
  fs.writeFileSync(path.join(root, 'tokens.css'), ':root{--color-primary:#1f4f9a}');
  fs.mkdirSync(path.join(root, 'src/components/Button'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/components/Button/Button.tsx'), 'export const Button = () => null');
  planWrite(root, DRAFT, { apply: true });
  assert.equal(loadDesign(root, { root }).stale.stale, false);
  fs.writeFileSync(path.join(root, 'tokens.css'), ':root{--color-primary:#ff0000}');
  assert.match(loadDesign(root, { root }).stale.reasons.join(' '), /token source/);
  planWrite(root, DRAFT, { apply: true });
  fs.writeFileSync(path.join(root, 'src/components/Button/Input.tsx'), 'export const Input = () => null');
  assert.match(loadDesign(root, { root }).stale.reasons.join(' '), /Component files/);
});

test('compose keeps the format valid for other tools: spec sections first, reax sections after', () => {
  const text = composeDesignMarkdown(DRAFT);
  const p = parseDesignMarkdown(text);
  assert.deepEqual(p.errors, []); assert.deepEqual(p.warnings, []);
  const names = p.sections.map((s) => s.name);
  assert.ok(names.indexOf('Gaps') > names.indexOf("Do's and Don'ts"));
});

test('diffText shows only changed lines', () => {
  const d = diffText('a\nb\nc', 'a\nB\nc');
  assert.equal(d.changed, true); assert.match(d.text, /-b/); assert.match(d.text, /\+B/);
  assert.equal(diffText('x', 'x').changed, false);
});
