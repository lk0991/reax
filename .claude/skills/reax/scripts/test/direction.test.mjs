import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { contrast, validateDirection, compareDirections, tokensCss, designDraft, renderSpecimen } from '../lib/direction.mjs';
import { planWrite } from '../lib/write.mjs';
import { loadDesign } from '../lib/design.mjs';

const harbour = () => ({
  id: 'harbour', name: 'Harbour', thesis: 'A tide table: calm blue ink on cool paper, numbers first.', scene: 'Checked on a phone at the quay in daylight, so light.',
  references: ['Things', 'Linear'],
  colors: { bg: '#f4f7f9', surface: '#ffffff', 'surface-sunken': '#e8eef2', ink: '#14212b', 'ink-muted': '#4b5d6b', primary: '#1d4e89', 'on-primary': '#ffffff', border: '#d5dee5', control: '#7a8c99', focus: '#1d4e89', danger: '#b3261e' },
  type: { display: { family: 'Bricolage Grotesque', fallback: 'system-ui, sans-serif', weight: 700, google: true }, body: { family: 'Atkinson Hyperlegible', fallback: 'system-ui, sans-serif', weight: 400, google: true }, base: 16, ratio: 1.25, lineHeight: 1.5 },
  space: { unit: 4, density: 'balanced', target: 44 },
  shape: { radius: { sm: 4, md: 8, lg: 14 }, border: 1, depth: 'soft' },
});

test('contrast follows WCAG relative luminance', () => {
  assert.equal(Math.round(contrast('#000000', '#ffffff') * 10) / 10, 21);
  assert.equal(Math.round(contrast('#777777', '#ffffff') * 100) / 100, 4.48);
  assert.equal(contrast('#fff', '#ffffff'), 1);
});

test('a sound direction has no errors', () => {
  const r = validateDirection(harbour());
  assert.deepEqual(r.errors, []);
  assert.ok(r.contrast.some((c) => c.pair === 'ink on bg' && c.ok));
});

test('contrast and target-size failures are errors that name the pair and the criterion', () => {
  const d = harbour(); d.colors['ink-muted'] = '#9aa7b1'; d.colors['on-primary'] = '#2a5b95'; d.colors.control = '#e0e6ea'; d.space.target = 20;
  const r = validateDirection(d);
  assert.ok(r.errors.some((e) => /ink-muted on bg/.test(e) && /1\.4\.3/.test(e)));
  assert.ok(r.errors.some((e) => /on-primary on primary/.test(e)));
  assert.ok(r.errors.some((e) => /control on bg/.test(e) && /1\.4\.11/.test(e)));
  assert.ok(r.errors.some((e) => /2\.5\.8/.test(e)));
});

test('missing colours or a non-hex value are errors', () => {
  const d = harbour(); delete d.colors.focus; d.colors.bg = 'white';
  const r = validateDirection(d);
  assert.ok(r.errors.some((e) => /focus/.test(e)));
  assert.ok(r.errors.some((e) => /bg/.test(e) && /hex/.test(e)));
});

test('the known AI looks are flagged as warnings, never errors', () => {
  const cream = harbour();
  Object.assign(cream.colors, { bg: '#f4f1ea', surface: '#fbf9f4', primary: '#b4532a', 'on-primary': '#ffffff', focus: '#b4532a' });
  cream.type.display = { family: 'Fraunces', fallback: 'Georgia, serif', weight: 600, google: true, serif: true };
  const r = validateDirection(cream);
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some((w) => w.kind === 'overused-font' && /Fraunces/.test(w.message)));
  assert.ok(r.warnings.some((w) => w.kind === 'ai-look' && /cream/i.test(w.message)));

  const neon = harbour();
  Object.assign(neon.colors, { bg: '#0b0c0f', surface: '#15171c', 'surface-sunken': '#08090b', ink: '#e8eaee', 'ink-muted': '#a3a9b3', primary: '#39ff88', 'on-primary': '#04120a', border: '#262a31', control: '#6b7280', focus: '#39ff88' });
  assert.ok(validateDirection(neon).warnings.some((w) => w.kind === 'ai-look' && /neon/i.test(w.message)));

  const grey = harbour(); Object.assign(grey.colors, { bg: '#f5f5f5', 'surface-sunken': '#e5e5e5', border: '#d4d4d4' });
  assert.ok(validateDirection(grey).warnings.some((w) => w.kind === 'untinted-neutrals'));
});

test('directions that are too alike are flagged', () => {
  const a = harbour(); const b = harbour(); b.id = 'b'; b.name = 'B'; b.colors.primary = '#1f5591';
  assert.ok(compareDirections([a, b]).some((w) => w.kind === 'too-similar'));
  const c = harbour(); c.id = 'c'; c.colors.primary = '#7a2e8c'; c.type.display = { family: 'Unbounded', fallback: 'sans-serif', weight: 600, google: true }; c.colors.bg = '#1a1420';
  assert.equal(compareDirections([a, c]).length, 0);
});

test('tokensCss writes custom properties in rem, with fonts, spacing by density, radii and shadows', () => {
  const css = tokensCss(harbour());
  assert.match(css, /--color-bg: #f4f7f9;/);
  assert.match(css, /--color-on-primary: #ffffff;/);
  assert.match(css, /--font-display: "Bricolage Grotesque", system-ui, sans-serif;/);
  assert.match(css, /--text-base: 1rem;/);
  assert.match(css, /--space-md: 1rem;/);
  assert.match(css, /--space-size-target: 2\.75rem;/);
  assert.match(css, /--radius-md: 0\.5rem;/);
  assert.match(css, /--shadow-sm: [^;]+;/);
  assert.match(css, /fonts\.googleapis\.com/); // how to load the faces, as a comment
});

test('committing a direction writes DESIGN.md whose tokens point at the real custom properties in the token file', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-dir-'));
  fs.mkdirSync(path.join(root, 'src/styles'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/styles/tokens.css'), tokensCss(harbour()));
  planWrite(root, designDraft(harbour(), { tokenFile: 'src/styles/tokens.css', componentsDir: 'src/components' }), { apply: true });
  const d = loadDesign(root, { root });
  assert.deepEqual(d.errors, []);
  assert.equal(d.tokens['colors.primary'].css, '--color-primary');
  assert.equal(d.tokens['colors.primary'].resolved, '#1d4e89');
  assert.equal(d.tokens['spacing.md'].css, '--space-md');
  const css = fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');
  for (const t of Object.values(d.tokens)) assert.ok(css.includes(`${t.css}:`), `${t.path} -> ${t.css} exists in the token file`);
  assert.match(fs.readFileSync(path.join(root, 'DESIGN.md'), 'utf8'), /A tide table/);
  assert.equal(d.sidecar.direction.id, 'harbour');
});

test('the specimen shows each direction in its own scoped tokens, escapes text, and includes the shared screen', () => {
  const evil = harbour(); evil.id = 'x'; evil.name = 'X <script>'; evil.colors.primary = '#7a2e8c';
  const html = renderSpecimen([harbour(), evil], { product: 'Tide', screen: '<section class="sp-screen-demo">Next high water 14:02</section>' });
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /\[data-direction="harbour"\]\s*\{[^}]*--color-bg: #f4f7f9/);
  assert.match(html, /X &lt;script&gt;/);
  assert.equal((html.match(/Next high water 14:02/g) || []).length, 2);
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Bricolage\+Grotesque/);
  assert.ok(!/<script/i.test(html));
});

test('swatches show the contrast that matters: on-primary against primary, none for grounds', () => {
  const html = renderSpecimen([harbour()], { product: 'Tide' });
  assert.match(html, /<strong>on-primary<\/strong><br>#ffffff · [\d.]+:1 on primary/);
  assert.match(html, /<strong>bg<\/strong><br>#f4f7f9<\/span>/);
});
