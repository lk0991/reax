import test from 'node:test';
import assert from 'node:assert/strict';
import { beforeAfter, renderBeforeAfter } from '../lib/before-after.mjs';

const cap = (vp, baseline, extra = {}) => ({ viewport: vp, screenshot: `screenshots/STORY/${vp}.png`, baseline, diff: baseline === 'changed' ? { ratio: 0.05, image: `diffs/STORY/${vp}.png` } : baseline === 'matched' ? { ratio: 0 } : null, ...extra });
const story = (id, name, caps) => ({ id, title: 'Components/Button', name, captures: caps.map((c) => ({ ...c, screenshot: c.screenshot?.replace('STORY', id), diff: c.diff?.image ? { ...c.diff, image: c.diff.image.replace('STORY', id) } : c.diff })) });
const run = { config: { viewports: [{ name: 'mobile-390' }, { name: 'desktop-1280' }] }, stories: [
  story('components-button--primary', 'Primary', [cap('mobile-390', 'changed'), cap('desktop-1280', 'matched')]),
  story('components-button--secondary', 'Secondary', [cap('mobile-390', 'matched'), cap('desktop-1280', 'matched')]),
  story('components-button--large', 'Large', [cap('mobile-390', 'none'), cap('desktop-1280', 'none')]),
] };
const baselines = { 'components-button--primary': ['mobile-390', 'desktop-1280'], 'components-button--secondary': ['mobile-390', 'desktop-1280'], 'components-button--ghost': ['mobile-390'], 'components-card--default': ['mobile-390'] };

test('sorts stories into changed, unchanged, new and removed', () => {
  const m = beforeAfter(run, baselines);
  assert.deepEqual(m.changed.map((s) => s.id), ['components-button--primary']);
  assert.deepEqual(m.changed[0].captures.map((c) => c.viewport), ['mobile-390']);
  assert.deepEqual(m.unchanged.map((s) => s.name), ['Secondary']);
  assert.deepEqual(m.added.map((s) => s.name), ['Large']);
  // only stories of a component this run covered can be "removed"
  assert.deepEqual(m.removed, ['components-button--ghost']);
});

test('lists the files a published page needs: the approved screenshots copied beside it', () => {
  const m = beforeAfter(run, baselines);
  assert.deepEqual(m.copies, [{ from: '.reax/baselines/components-button--primary/mobile-390.png', to: 'before/components-button--primary/mobile-390.png' }]);
  assert.ok(m.files.includes('before/components-button--primary/mobile-390.png'));
  assert.ok(m.files.includes('screenshots/components-button--primary/mobile-390.png'));
  assert.ok(m.files.includes('diffs/components-button--primary/mobile-390.png'));
});

test('renders changed stories side by side, names the unchanged as checked, and has no scripts', () => {
  const html = renderBeforeAfter(beforeAfter(run, baselines));
  assert.match(html, /src="before\/components-button--primary\/mobile-390\.png"/);
  assert.match(html, /src="screenshots\/components-button--primary\/mobile-390\.png"/);
  assert.match(html, /Before[\s\S]*After/);
  assert.match(html, /Secondary/);
  assert.match(html, /checked, unchanged/i);
  assert.match(html, /Large/); assert.match(html, /new/i);
  assert.match(html, /components-button--ghost/); assert.match(html, /removed/i);
  assert.ok(!/<script/i.test(html));
});

test('nothing changed: says so plainly', () => {
  const m = beforeAfter({ config: run.config, stories: [run.stories[1]] }, { 'components-button--secondary': ['mobile-390', 'desktop-1280'] });
  assert.match(renderBeforeAfter(m), /Nothing looks different/);
});

test('crops before and after to the same area: the content and where it changed, with a margin', () => {
  const r = structuredClone(run);
  const c = r.stories[0].captures[0];
  Object.assign(c, { size: { w: 390, h: 844 }, content: { x: 16, y: 16, w: 80, h: 40 } }); c.diff.box = { x: 16, y: 16, w: 100, h: 48 };
  const m = beforeAfter(r, baselines);
  assert.deepEqual(m.changed[0].captures[0].crop, { x: 0, y: 0, w: 132, h: 80, imageW: 390, imageH: 844 });
  const html = renderBeforeAfter(m);
  assert.match(html, /class="crop" style="aspect-ratio: 132 \/ 80/);
  assert.match(html, /width: 295\.45%/);
});

test('without boxes, the whole capture is shown', () => {
  const m = beforeAfter(run, baselines);
  assert.equal(m.changed[0].captures[0].crop, null);
  assert.ok(!/class="crop"/.test(renderBeforeAfter(m)));
});
