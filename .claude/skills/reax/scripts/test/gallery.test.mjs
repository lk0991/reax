import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGallery } from '../lib/gallery.mjs';

const run = {
  startedAt: '2026-11-23T09:00:00.000Z', storybook: { version: '10.6.8' }, scope: { description: 'all stories' },
  config: { viewports: [{ name: 'mobile-390', width: 390 }, { name: 'text-200', width: 390, textScale: 2 }] },
  summary: { total: 2, pass: 1, warning: 0, failure: 1 },
  stories: [
    { id: 'components-button--primary', title: 'Components/Button', name: 'Primary', result: 'pass', reasons: [], keyboard: [],
      captures: [{ viewport: 'mobile-390', screenshot: 'screenshots/components-button--primary/mobile-390.png' }, { viewport: 'text-200', screenshot: 'screenshots/components-button--primary/text-200.png' }] },
    { id: 'components-chip--default', title: 'Components/Chip', name: 'Default <x>', result: 'failure', reasons: ['2 blocking accessibility findings'], keyboard: [],
      captures: [{ viewport: 'mobile-390', screenshot: null, status: 'could-not-run' }, { viewport: 'text-200', screenshot: 'screenshots/components-chip--default/text-200.png' }] },
  ],
};

test('the gallery lists every capture as a published file and references it by that path', () => {
  const { html, files } = renderGallery(run);
  assert.deepEqual(files, [
    'screenshots/components-button--primary/mobile-390.png',
    'screenshots/components-button--primary/text-200.png',
    'screenshots/components-chip--default/text-200.png',
  ]);
  for (const f of files) assert.ok(html.includes(`src="${f}"`), f);
});

test('it shows results and reasons, escapes names, and marks a capture that did not run', () => {
  const { html } = renderGallery(run);
  assert.match(html, /<title>[^<]{3,40}<\/title>/);
  assert.match(html, /Default &lt;x&gt;/);
  assert.match(html, /2 blocking accessibility findings/);
  assert.match(html, /could not run/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.ok(!/<script/i.test(html), 'a static page, no scripts');
});
