// Integration tests of the keyboard and focus checks against small fake story frames (no Storybook needed).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runChecks, checksFor } from '../lib/keyboard.mjs';
import { serveStatic } from '../lib/storybook.mjs';
import { req, chromiumPath } from '../lib/runtime.mjs';

const chromium = chromiumPath();
const skip = !chromium && 'no Chromium found';
const frame = (body, script = '', css = '') => `<!doctype html><html><head><style>button{font:inherit} :focus-visible{outline:3px solid #00f} ${css}</style></head>
<body class="sb-show-main"><div id="storybook-root">${body}</div><script>${script}</script></body></html>`;

const PAGES = {
  'good-dialog': frame(`<button id="t">Open</button><dialog id="d" aria-labelledby="h"><h2 id="h">Title</h2><button id="x">Close</button></dialog>`,
    `const d=document.getElementById('d'), t=document.getElementById('t');
     t.onclick=()=>d.showModal(); document.getElementById('x').onclick=()=>d.close(); d.addEventListener('close',()=>t.focus());`),
  // the native dialog returns focus by itself, so this one sends it somewhere else on close
  'no-return': frame(`<button id="t">Open</button><button id="o">Other</button><dialog id="d"><h2>Title</h2><button id="x">Close</button></dialog>`,
    `const d=document.getElementById('d'); document.getElementById('t').onclick=()=>d.showModal(); document.getElementById('x').onclick=()=>d.close();
     d.addEventListener('close',()=>setTimeout(()=>document.getElementById('o').focus()));`),
  'no-esc': frame(`<button id="t">Open</button><div id="d" role="dialog" hidden><h2>Title</h2><button id="x">Close</button></div>`,
    `const d=document.getElementById('d'), t=document.getElementById('t');
     t.onclick=()=>{d.hidden=false; document.getElementById('x').focus();}; document.getElementById('x').onclick=()=>{d.hidden=true; t.focus();};`),
  'no-focus-style': frame(`<button>One</button><button class="bare">Two</button>`, '', '.bare:focus-visible{outline:none}'),
  'unreachable': frame(`<button>One</button><div role="button" class="fake">Two</div>`),
  'switch': frame(`<label><input type="checkbox" role="switch"> Wi-Fi</label>`),
  'radios': frame(`<fieldset><legend>Size</legend><label><input type="radio" name="s" value="a" checked> A</label><label><input type="radio" name="s" value="b"> B</label></fieldset>`),
};

async function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-kb-'));
  for (const [name, html] of Object.entries(PAGES)) fs.writeFileSync(path.join(dir, `${name}.html`), html);
  const server = await serveStatic(dir);
  const { chromium: pw } = req('playwright');
  const browser = await pw.launch({ executablePath: chromium, args: ['--no-sandbox'] });
  const check = async (name, card) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 600 } }); const page = await ctx.newPage();
    try { await page.goto(`${server.url}/${name}.html`); return await runChecks(page, checksFor(card)); } finally { await ctx.close(); }
  };
  return { check, close: async () => { await browser.close(); await server.close(); } };
}
const byId = (results) => Object.fromEntries(results.map((r) => [r.id, r.ok]));

test('a card names its checks, and every component gets the shared ones', () => {
  assert.deepEqual(checksFor(null), ['tab-reach', 'focus-visible']);
  assert.ok(checksFor('dialog').includes('dialog-esc') && checksFor('dialog').includes('tab-reach'));
});

test('a well-behaved dialog passes: focus moves in, Esc closes, focus returns', { skip }, async () => {
  const { check, close } = await setup();
  try { assert.deepEqual(byId(await check('good-dialog', 'dialog')), { 'tab-reach': true, 'focus-visible': true, 'dialog-focus-in': true, 'dialog-esc': true, 'dialog-focus-return': true }); } finally { await close(); }
});

test('a dialog that does not return focus, or does not close on Esc, fails', { skip }, async () => {
  const { check, close } = await setup();
  try {
    assert.equal(byId(await check('no-return', 'dialog'))['dialog-focus-return'], false);
    assert.equal(byId(await check('no-esc', 'dialog'))['dialog-esc'], false);
  } finally { await close(); }
});

test('the shared checks catch a missing focus style and a control Tab cannot reach', { skip }, async () => {
  const { check, close } = await setup();
  try {
    const a = await check('no-focus-style', null); assert.equal(byId(a)['focus-visible'], false); assert.match(a.find((r) => r.id === 'focus-visible').detail, /Two/);
    const b = await check('unreachable', null); assert.equal(byId(b)['tab-reach'], false); assert.match(b.find((r) => r.id === 'tab-reach').detail, /Two/);
  } finally { await close(); }
});

test('Space toggles a switch, and arrows move a radio selection', { skip }, async () => {
  const { check, close } = await setup();
  try {
    assert.equal(byId(await check('switch', 'switch'))['space-toggles'], true);
    assert.equal(byId(await check('radios', 'radio'))['arrows-select'], true);
  } finally { await close(); }
});
