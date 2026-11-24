import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCatalogue } from '../lib/catalogue.mjs';

const design = {
  meta: { name: 'Acme' },
  tokens: {
    'colors.bg': { group: 'colors', path: 'colors.bg', resolved: '#ffffff', css: '--color-bg' },
    'colors.ink': { group: 'colors', path: 'colors.ink', resolved: '#1a1a1a', css: '--color-ink' },
    'colors.primary': { group: 'colors', path: 'colors.primary', resolved: '#1f4f9a', css: '--brand-blue-500' },
    'typography.body': { group: 'typography', path: 'typography.body', resolved: { fontFamily: 'system-ui', fontSize: '1rem' }, css: '--type-body' },
    'spacing.md': { group: 'spacing', path: 'spacing.md', resolved: '1rem', css: '--gap-3' },
    'rounded.md': { group: 'rounded', path: 'rounded.md', resolved: '0.5rem', css: '--corner-m' },
  },
  sidecar: { shadows: { sm: '0 1px 2px rgb(0 0 0 / 0.1)' } },
  inventory: [{ name: 'Button', card: 'button' }, { name: 'Chip', card: null }],
};
const cap = (id, vp) => ({ viewport: vp, screenshot: `screenshots/${id}/${vp}.png`, size: { w: 390, h: 844 }, content: { x: 16, y: 16, w: 120, h: 44 } });
const run = { startedAt: '2026-11-23T10:00:00Z', stories: [
  { id: 'components-button--primary', title: 'Components/Button', name: 'Primary', result: 'pass', captures: [cap('components-button--primary', 'mobile-390'), cap('components-button--primary', 'desktop-1280')] },
  { id: 'components-chip--default', title: 'Components/Chip', name: 'Default', result: 'failure', captures: [cap('components-chip--default', 'mobile-390')] },
] };

test('shows every token group with its real name, and colours with their contrast on the ground', () => {
  const { html } = renderCatalogue({ design, run });
  assert.match(html, /--brand-blue-500/);
  assert.match(html, /#1f4f9a/);
  assert.match(html, /[\d.]+:1/);
  for (const h of ['Colours', 'Type', 'Spacing', 'Corners', 'Shadows']) assert.ok(html.includes(h), h);
});

test('shows every component\'s stories, its card and how far it follows COMPONENTS.md', () => {
  const { html, files } = renderCatalogue({ design, run, deviations: { Chip: 2 } });
  assert.match(html, /Button/); assert.match(html, /button card/i);
  assert.match(html, /Chip/); assert.match(html, /no card/i);
  assert.match(html, /Follows the project.s conventions/); assert.match(html, /2 differences from the project.s conventions/);
  assert.deepEqual(files.sort(), ['screenshots/components-button--primary/desktop-1280.png', 'screenshots/components-button--primary/mobile-390.png', 'screenshots/components-chip--default/mobile-390.png']);
  assert.match(html, /class="crop"/);
});

test('without COMPONENTS.md it says conventions are not recorded, and the page has no scripts', () => {
  const { html } = renderCatalogue({ design, run, deviations: null });
  assert.match(html, /conventions are not recorded/i);
  assert.ok(!/<script/i.test(html));
  assert.match(html, /<title>Acme catalogue<\/title>/);
});

test('components at their real size, the ground colour marked as such, breakpoints as text', () => {
  const d = structuredClone(design); d.tokens['spacing.breakpoint.md'] = { group: 'spacing', path: 'spacing.breakpoint.md', resolved: '768px', css: '--bp-tablet' };
  const { html } = renderCatalogue({ design: d, run });
  assert.match(html, /max-width: 152px/); // the 120px-wide content plus margins, not doubled
  assert.match(html, /<strong>bg<\/strong> #ffffff · the ground/);
  assert.match(html, /screens 768px and wider/);
});

test('open findings per component: saved review findings and stories failing the last run, worst level first', async () => {
  const { openFindings } = await import('../lib/catalogue.mjs');
  const review = { Button: { findings: [{ rank: 'should-fix', what: 'Raw colour in hover' }] }, chip: { findings: [] } };
  const f = openFindings(review, run);
  assert.deepEqual(f.Button, { count: 1, worst: 'should-fix', items: ['Raw colour in hover'] });
  assert.equal(f.Chip.count, 1); assert.equal(f.Chip.worst, 'blocking'); assert.match(f.Chip.items[0], /Default fails a check/);
  const { html } = renderCatalogue({ design, run, findings: f });
  assert.match(html, /1 open finding/);
  assert.match(html, /<details><summary>What is open<\/summary><ul><li>Raw colour in hover<\/li>/);
});

test('stories titled Screens/... are shown under their own heading, apart from components', () => {
  const r = structuredClone(run);
  r.stories.push({ id: 'screens-today--loaded', title: 'Screens/Today', name: 'Loaded', result: 'pass', captures: [cap('screens-today--loaded', 'mobile-390'), cap('screens-today--loaded', 'desktop-1280')] });
  r.stories.push({ id: 'screens-today--empty', title: 'Screens/Today', name: 'Empty', result: 'pass', captures: [cap('screens-today--empty', 'mobile-390')] });
  const { html } = renderCatalogue({ design, run: r, deviations: {} });
  const compAt = html.indexOf('<h2>Components</h2>'); const screenAt = html.indexOf('<h2>Screens</h2>');
  assert.ok(compAt > 0 && screenAt > compAt, 'a Screens section after Components');
  assert.ok(html.indexOf('id="c-today"') > screenAt, 'Today is under Screens');
  assert.ok(html.indexOf('id="c-button"') < screenAt, 'Button stays under Components');
  assert.match(html, /A screen, built from the project's components/);
  assert.match(html, /Loaded/); assert.match(html, /Empty/);
});

test('with no screens there is no Screens section', () => {
  assert.ok(!renderCatalogue({ design, run }).html.includes('<h2>Screens</h2>'));
});
