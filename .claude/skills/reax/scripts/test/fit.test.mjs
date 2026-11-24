import test from 'node:test';
import assert from 'node:assert/strict';
import { fitCheck } from '../lib/fit.mjs';

const tok = (group, p, resolved, css) => [`${group}.${p}`, { group, path: `${group}.${p}`, resolved, css }];
const design = { tokens: Object.fromEntries([
  tok('colors', 'primary', '#1f4f9a', '--brand-blue-500'), tok('colors', 'ink', '#1a1a1a', '--ink-900'), tok('colors', 'surface', '#ffffff', '--paper'),
  tok('spacing', 'xs', '0.25rem', '--gap-1'), tok('spacing', 'sm', '0.5rem', '--gap-2'), tok('spacing', 'md', '1rem', '--gap-3'), tok('spacing', 'lg', '1.5rem', '--gap-4'),
  tok('spacing', 'breakpoint.md', '768px', '--bp-tablet'),
  tok('typography', 'body', { fontSize: '1rem' }, '--type-body'), tok('typography', 'title', { fontSize: '1.25rem' }, '--type-title'),
  tok('rounded', 'sm', '0.25rem', '--corner-s'), tok('rounded', 'md', '0.5rem', '--corner-m'),
]) };
const run = (path, text) => fitCheck([{ path, text }], design);
const kinds = (r) => r.findings.map((f) => f.kind);

test('code that uses only tokens passes', () => {
  const r = run('src/screens/Today/Today.css', `.today { color: var(--ink-900); background: var(--paper); padding: var(--gap-3) 1.5rem; gap: 0.5rem; border-radius: var(--corner-m); font-size: 1rem; margin: 0 auto; }\n.t { font-size: var(--type-title); border-radius: 50%; }\n`);
  assert.equal(r.status, 'pass'); assert.deepEqual(r.findings, []);
});

test('a raw colour is flagged with its file and line, naming the nearest token (or the token it equals)', () => {
  const r = run('src/screens/Today/Today.css', `.a {\n  color: #1f4f9b;\n  background: #1a1a1a;\n}\n`);
  assert.equal(r.status, 'concern');
  assert.deepEqual(r.findings.map((f) => [f.line, f.kind]), [[2, 'colour'], [3, 'colour']]);
  assert.match(r.findings[0].message, /--brand-blue-500/);
  assert.match(r.findings[1].message, /use var\(--ink-900\)/i);
  assert.equal(r.findings[0].file, 'src/screens/Today/Today.css');
});

test('a fallback inside var() and a colour in a comment are not findings; rgb() and hsl() are', () => {
  const r = run('a.css', `/* old: #ff0000 */\n.a { color: var(--ink-900, #1a1a1a); }\n.b { color: rgb(10 20 30); }\n.c { color: hsl(120 50% 50%); }\n`);
  assert.deepEqual(r.findings.map((f) => f.line), [3, 4]);
});

test('spacing off the scale is flagged; values on the scale, in any unit, are not', () => {
  const r = run('a.css', `.a { padding: 13px 16px; margin: 0.75rem; gap: 24px; row-gap: 1.5em; margin-left: auto; padding-top: calc(1rem + 3px); }\n`);
  const found = r.findings.filter((f) => f.kind === 'spacing').map((f) => f.found);
  assert.deepEqual(found, ['13px', '0.75rem']);
  assert.match(r.findings[0].message, /0\.75rem|12px|1rem|0\.5rem/);
});

test('type sizes off the scale are flagged; token sizes are not', () => {
  const r = run('a.css', `.a { font-size: 15px; }\n.b { font-size: 1.25rem; }\n.c { font-size: var(--type-body); }\n.d { font-size: 2rem; }\n`);
  assert.deepEqual(r.findings.filter((f) => f.kind === 'type').map((f) => [f.line, f.found]), [[1, '15px'], [4, '2rem']]);
});

test('radii off the scale are flagged; 0, 50% and pill radii are not', () => {
  const r = run('a.css', `.a { border-radius: 7px; }\n.b { border-radius: 0; }\n.c { border-radius: 999px; }\n.d { border-radius: 50%; }\n.e { border-radius: 0.5rem; }\n`);
  assert.deepEqual(r.findings.filter((f) => f.kind === 'radius').map((f) => f.found), ['7px']);
});

test('more than one primary action in a screen is flagged; one primary and the rest secondary is not', () => {
  const two = run('src/screens/Today/Today.tsx', `<Button>Save</Button>\n<Button variant="primary">Log</Button>\n<Button variant="secondary">Cancel</Button>\n`);
  assert.deepEqual(kinds(two), ['primary-action']);
  assert.match(two.findings[0].message, /2 primary/);
  const one = run('src/screens/Today/Today.tsx', `<Button>Save</Button>\n<Button variant="secondary">Cancel</Button>\n<Button variant="ghost">Skip</Button>\n`);
  assert.equal(one.status, 'pass');
  // a component that renders a lowercase <button> is not a screen's action
  assert.equal(run('Button.tsx', `<button className="x">{children}</button>\n<button>b</button>`).status, 'pass');
});

test('a project with no tokens gets a named gap, not a pass', () => {
  const r = fitCheck([{ path: 'a.css', text: '.a { color: #fff; }' }], { tokens: {} });
  assert.equal(r.status, 'not-run'); assert.match(r.reason, /no tokens/i); assert.match(r.howTo, /direction/);
});

test('files that are not code (images, json) and an empty change are not checked', () => {
  assert.equal(fitCheck([], design).status, 'not-run');
  assert.equal(fitCheck([{ path: 'a.json', text: '{"c":"#fff"}' }], design).status, 'not-run');
});
