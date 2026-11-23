// One capture: a story at one width and text size. Deterministic by construction (decision: Playwright and axe wiring, Q8):
// Chromium only, scale factor 1, animations off, reduced motion, fixed locale and timezone, wait for the story, fonts and a
// quiet DOM, and each screenshot must match itself before it is believed.

export const DEFAULTS = {
  viewports: [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'reflow-320', width: 320, height: 640 },
    { name: 'text-200', width: 390, height: 844, textScale: 2 },
  ],
  diffThreshold: 0.001,
  axe: { tags: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'], disabledRules: [], blockingImpacts: ['serious', 'critical'] },
  skipTag: 'reax-skip',
  baseBranch: null,
  concurrency: 4,
  storyTimeoutMs: 30_000,
  stabilityAttempts: 3,
  storybook: { command: null },
  preview: { startTimeoutMs: 90_000 },
};

const ANIM_OFF = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}';

/** Merge a project's config over the defaults, one level deep. */
export function mergeConfig(user = {}) {
  if (user.storybook && 'buildCommand' in user.storybook) throw new Error('.reax/visual-test.json: "storybook.buildCommand" is now "storybook.command". It is the command that runs the Storybook CLI without a subcommand, for example "pnpm exec storybook", not a build script.');
  const out = { ...DEFAULTS, ...user };
  for (const k of ['axe', 'storybook', 'preview']) out[k] = { ...DEFAULTS[k], ...(user[k] || {}) };
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wait until the page's DOM has been still for `quietMs`, or give up after `maxMs`. */
async function settle(page, quietMs = 200, maxMs = 5000) {
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(([quiet, max]) => new Promise((resolve) => {
    let timer = setTimeout(done, quiet); const stop = setTimeout(done, max);
    const mo = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(done, quiet); });
    function done() { mo.disconnect(); clearTimeout(timer); clearTimeout(stop); resolve(); }
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  }), [quietMs, maxMs]);
}

/** Wait until Storybook reports the story's render, play function included, as finished. Storybook 8 and newer expose
 * this through the preview's current render; it is not a public API, so a missing field just skips the wait. */
async function waitForPlay(page, timeout) {
  await page.waitForFunction(() => {
    const r = window.__STORYBOOK_PREVIEW__?.currentRender;
    return !r || !r.phase || ['completed', 'finished', 'errored', 'aborted'].includes(r.phase);
  }, null, { timeout }).catch(() => { /* a play function that never ends is reported by the screenshot itself */ });
}

/** Interaction states a story asks for with a tag (reax-state-hover, -pressed, -focus). */
export const STATE_TAGS = { 'reax-state-hover': 'hover', 'reax-state-pressed': 'pressed', 'reax-state-focus': 'focus' };
const TARGET = '[data-reax-target], #storybook-root button, #storybook-root a[href], #storybook-root input, #storybook-root select, #storybook-root textarea, #storybook-root summary, #storybook-root [tabindex]:not([tabindex="-1"])';

/** Put the story's target element into the state with real pointer and keyboard input, so CSS pseudo-classes apply. */
async function enterState(page, state) {
  const target = page.locator(TARGET).first();
  if (state === 'hover') await target.hover();
  if (state === 'pressed') { await target.hover(); await page.mouse.down(); }
  if (state === 'focus') { await page.keyboard.press('Shift'); await target.focus(); }
}

/** Font size of every element that carries its own text, with a short selector. */
const measureText = (page) => page.evaluate(() => {
  const root = document.querySelector('#storybook-root') || document.body; const out = [];
  const sel = (el) => { const parts = []; for (let e = el; e && e !== root.parentElement && parts.length < 4; e = e.parentElement) { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; else if (e.classList.length) s += '.' + [...e.classList].slice(0, 2).join('.'); parts.unshift(s); } return parts.join(' > '); };
  for (const el of root.querySelectorAll('*')) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    out.push({ selector: sel(el), text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 40), size: parseFloat(getComputedStyle(el).fontSize) });
  }
  return out;
});

/** Take one capture. Never throws for a problem with the story: it returns { status: 'could-not-run', error }. */
export async function capture({ browser, baseUrl, story, vp, config, AxeBuilder }) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'reduce', colorScheme: 'light' });
  const page = await context.newPage();
  const result = { viewport: vp.name, status: 'ok', unstable: false, buffer: null, axe: [], textScale: [], overflow: null, error: null };
  try {
    await page.goto(`${baseUrl}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`, { timeout: config.storyTimeoutMs, waitUntil: 'load' });
    await page.waitForFunction(() => document.body.classList.contains('sb-show-main') || document.body.classList.contains('sb-show-errordisplay'), null, { timeout: config.storyTimeoutMs });
    if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) {
      const msg = await page.evaluate(() => (document.querySelector('.sb-errordisplay_main, #error-message') || document.body).innerText.slice(0, 600));
      throw Object.assign(new Error(msg.trim() || 'The story threw while rendering.'), { storyError: true });
    }
    await waitForPlay(page, config.storyTimeoutMs);
    await page.addStyleTag({ content: ANIM_OFF });
    await settle(page);

    if (vp.textScale) {
      const before = await measureText(page);
      await page.evaluate((s) => { document.documentElement.style.fontSize = `${s * 100}%`; }, vp.textScale);
      await settle(page);
      const after = await measureText(page);
      before.forEach((b, i) => { const a = after[i]; if (!a || a.selector !== b.selector) return; const ratio = a.size / b.size; if (ratio < vp.textScale * 0.75) result.textScale.push({ selector: b.selector, text: b.text, before: b.size, after: a.size, ratio: Math.round(ratio * 100) / 100 }); });
    }

    // the interaction state goes last, after any text-size change, so the pointer is still over its target
    const state = (story.tags || []).map((t) => STATE_TAGS[t]).find(Boolean);
    if (state) { await enterState(page, state); await settle(page); }

    // a screenshot must match itself before it is believed; otherwise the capture is reported as unstable
    let shot; let stable = false;
    for (let i = 0; i < config.stabilityAttempts && !stable; i++) {
      const a = await page.screenshot({ fullPage: true, animations: 'disabled' }); await sleep(100);
      const b = await page.screenshot({ fullPage: true, animations: 'disabled' });
      shot = b; stable = a.equals(b); if (!stable) await sleep(200);
    }
    result.buffer = shot; result.unstable = !stable;

    const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    result.overflow = dims.sw > dims.cw + 1 ? { scrollWidth: dims.sw, clientWidth: dims.cw } : null;

    const builder = new AxeBuilder({ page }).withTags(config.axe.tags);
    if (await page.$('#storybook-root')) builder.include('#storybook-root');
    const disabled = config.axe.disabledRules.map((r) => r.id); if (disabled.length) builder.disableRules(disabled);
    const res = await builder.analyze();
    result.axe = res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, nodes: v.nodes.map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 160), summary: (n.failureSummary || '').split('\n').slice(1).map((l) => l.trim()).filter(Boolean).slice(0, 2).join(' or ') })) }));
  } catch (e) {
    result.status = 'could-not-run';
    result.error = String(e.message || e).split('\n').slice(0, 6).join('\n');
  } finally {
    await context.close();
  }
  return result;
}
