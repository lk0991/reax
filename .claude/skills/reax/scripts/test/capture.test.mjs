// Integration test of one capture against a minimal fake Storybook frame (no Storybook needed).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { capture, mergeConfig } from '../lib/capture.mjs';
import { serveStatic } from '../lib/storybook.mjs';
import { req, chromiumPath } from '../lib/runtime.mjs';

const chromium = chromiumPath();
const skip = !chromium && 'no Chromium found';

const PAGE = `<!doctype html><html><head><style>
  body{margin:0} button{width:120px;height:44px;border:0;background:#fff;color:#000}
  button:hover{background:#f00} button:active{background:#00f} button:focus-visible{outline:4px solid #0a0}
</style></head><body class="sb-show-main"><div id="storybook-root"><button type="button">Save</button></div>
<script>
  // a fake play function: it changes the DOM after a delay, then marks the render completed
  window.__STORYBOOK_PREVIEW__ = { currentRender: { phase: 'playing' } };
  if (location.search.includes('play')) setTimeout(() => { document.querySelector('button').textContent = 'Played'; window.__STORYBOOK_PREVIEW__.currentRender.phase = 'completed'; }, 600);
  else window.__STORYBOOK_PREVIEW__.currentRender.phase = 'completed';
</script></body></html>`;

async function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-cap-'));
  fs.writeFileSync(path.join(dir, 'iframe.html'), PAGE);
  const server = await serveStatic(dir);
  const { chromium: pw } = req('playwright'); const { AxeBuilder } = req('@axe-core/playwright');
  const browser = await pw.launch({ executablePath: chromium, args: ['--no-sandbox'] });
  const config = mergeConfig({ axe: { tags: ['wcag2a'] } });
  const vp = { name: 'mobile-390', width: 390, height: 200 };
  const shot = async (story) => (await capture({ browser, baseUrl: server.url, story, vp, config, AxeBuilder })).buffer;
  return { shot, close: async () => { await browser.close(); await server.close(); } };
}

test('state tags put the target into hover, pressed and focus-visible before the screenshot', { skip }, async () => {
  const { shot, close } = await setup();
  try {
    const plain = await shot({ id: 'b--default', tags: [] });
    const hover = await shot({ id: 'b--hover', tags: ['reax-state-hover'] });
    const pressed = await shot({ id: 'b--pressed', tags: ['reax-state-pressed'] });
    const focus = await shot({ id: 'b--focus', tags: ['reax-state-focus'] });
    assert.ok(!plain.equals(hover), 'hover differs from default');
    assert.ok(!plain.equals(pressed) && !hover.equals(pressed), 'pressed differs from default and hover');
    assert.ok(!plain.equals(focus), 'focus differs from default');
  } finally { await close(); }
});

test('a capture waits for the story\'s play function to finish', { skip }, async () => {
  const { shot, close } = await setup();
  try {
    const played = await shot({ id: 'b--play', tags: [] });
    const plain = await shot({ id: 'b--default', tags: [] });
    assert.ok(!played.equals(plain), 'the screenshot shows the DOM after the play function');
  } finally { await close(); }
});

test('200% text doubles the project\'s own root size instead of replacing it', { skip }, async () => {
  const { scaleRootText } = await import('../lib/capture.mjs');
  const { chromium: pw } = req('playwright');
  const browser = await pw.launch({ executablePath: chromium, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>html{font-size:62.5%}</style><p>x</p>');
    await scaleRootText(page, 2);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize), '20px');
    await scaleRootText(page, 2); // applying it twice does not compound
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize), '20px');
  } finally { await browser.close(); }
});
