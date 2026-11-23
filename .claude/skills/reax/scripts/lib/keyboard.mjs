// Keyboard and focus checks: the behaviour a card's Requirements describe, checked with real key presses in a story's
// frame. Each card lists the checks that apply to it in its "Keyboard checks" section; every component gets the shared
// ones. A check returns ok: true, false or null (it does not apply to this story). A failed check fails the run,
// except one marked `default` in CHECK_INFO, which tests a Default and only warns.

/** The checks a card asks for, as named in its "Keyboard checks" section. */
export const CARD_CHECKS = {
  dialog: ['dialog-focus-in', 'dialog-esc', 'dialog-focus-return'],
  drawer: ['dialog-focus-in', 'dialog-esc', 'dialog-focus-return'], // a modal drawer is a dialog
  checkbox: ['space-toggles'],
  switch: ['space-toggles'],
  radio: ['arrows-select'],
};
export const SHARED_CHECKS = ['tab-reach', 'focus-visible'];
export const checksFor = (card) => [...SHARED_CHECKS, ...(CARD_CHECKS[card] || [])];

/** What each check proves, for the report. */
export const CHECK_INFO = {
  'tab-reach': { rule: 'WCAG 2.2 SC 2.1.1', what: 'every interactive element is reached with Tab' },
  'focus-visible': { rule: 'WCAG 2.2 SC 2.4.7', what: 'every element reached with Tab shows visible focus' },
  'dialog-focus-in': { rule: 'WCAG 2.2 SC 2.4.3', what: 'opening the dialog from the keyboard moves focus into it' },
  'dialog-esc': { rule: 'dialog card default', what: 'Esc closes the dialog', default: true },
  'dialog-focus-return': { rule: 'WCAG 2.2 SC 2.4.3', what: 'closing the dialog returns focus to its trigger' },
  'space-toggles': { rule: 'WCAG 2.2 SC 2.1.1', what: 'Space toggles the control' },
  'arrows-select': { rule: 'WCAG 2.2 SC 2.1.1', what: 'arrow keys move the selection in a radio group' },
};

const pause = (page, ms = 150) => page.waitForTimeout(ms);

/** Find the Tab stops, in markup order, and remember each candidate element's resting look. A Tab stop is one
 * element, or one group: a native radio group (same non-empty name), or a composite widget (tablist, radiogroup,
 * menu, menubar, listbox, tree, grid, toolbar) that uses roving tabindex or aria-activedescendant. Page state lives
 * on window.__reaxKb so names never pass through a CSS selector. */
const markTargets = (page) => page.evaluate(() => {
  document.activeElement?.blur?.(); // record every resting look unfocused (a modal dialog focuses its first control)
  const root = document.querySelector('#storybook-root') || document.body;
  const modal = [...root.querySelectorAll('dialog[open]')].find((d) => d.matches(':modal'));
  const scope = modal || root;
  const SEL = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [tabindex], [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=radio], [role=option], [role=combobox], [role=treeitem], [role=gridcell]';
  const COMPOSITE = '[role=tablist], [role=radiogroup], [role=menu], [role=menubar], [role=listbox], [role=tree], [role=grid], [role=toolbar]';
  const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('value') || el.tagName.toLowerCase()).trim().replace(/\s+/g, ' ').slice(0, 40) || el.tagName.toLowerCase();
  const look = (el) => {
    const parts = [el, ...['::before', '::after'].map((p) => [el, p])].map((x) => {
      const cs = Array.isArray(x) ? getComputedStyle(x[0], x[1]) : getComputedStyle(x);
      return [cs.content, cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.outlineOffset, cs.boxShadow, cs.borderColor, cs.borderWidth, cs.backgroundColor, cs.color, cs.textDecorationLine, cs.transform].join('|');
    });
    return parts.join('#');
  };
  const stops = []; const groupOf = new Map(); const rest = new Map();
  for (const el of scope.querySelectorAll(SEL)) {
    if (el.disabled || el.closest('[inert], dialog:not([open]), [hidden]') || !el.getClientRects().length) continue;
    const composite = el.closest(COMPOSITE);
    const radioName = el.matches('input[type=radio]') && el.name ? el.name : null;
    const key = composite || (radioName !== null ? `radio:${radioName}` : null);
    if (!composite && el.getAttribute('tabindex') === '-1') continue; // not meant to be a Tab stop
    rest.set(el, look(el));
    if (key !== null && groupOf.has(key)) { stops[groupOf.get(key)].members.add(el); continue; }
    const label = composite ? `${composite.getAttribute('role')} "${(composite.getAttribute('aria-label') || name(el))}"` : radioName !== null ? `radio group "${radioName}"` : name(el);
    if (key !== null) groupOf.set(key, stops.length);
    stops.push({ label, members: new Set([el]), container: composite });
  }
  window.__reaxKb = { stops, rest, look };
  return stops.map((st) => st.label);
});

/** Which stop the focused element belongs to, and whether it looks different from its own resting state. */
const focusStyle = (page) => page.evaluate(() => {
  const kb = window.__reaxKb; const el = document.activeElement;
  if (!kb || !el || el === document.body) return null;
  const index = kb.stops.findIndex((st) => st.members.has(el) || (st.container && st.container.contains(el)));
  if (index < 0) return { index: null };
  const before = kb.rest.get(el);
  return { index: String(index), changed: before === undefined || before !== kb.look(el) };
});

async function tabChecks(page) {
  const names = await markTargets(page);
  if (!names.length) return [{ id: 'tab-reach', ok: null, detail: 'no interactive element' }, { id: 'focus-visible', ok: null, detail: 'no interactive element' }];
  const reached = new Set(); const noRing = new Set();
  for (let i = 0; i < names.length * 2 + 2; i++) {
    await page.keyboard.press('Tab');
    const f = await focusStyle(page); if (!f || f.index === null) continue;
    reached.add(f.index); if (!f.changed) noRing.add(f.index); else noRing.delete(f.index);
  }
  const missed = names.filter((_, i) => !reached.has(String(i)));
  const plain = [...noRing].map((i) => names[Number(i)]);
  return [
    { id: 'tab-reach', ok: !missed.length, detail: missed.length ? `Tab never reaches: ${missed.join(', ')}` : `${names.length} reached` },
    { id: 'focus-visible', ok: !plain.length, detail: plain.length ? `no visible focus on: ${plain.join(', ')}` : 'all show focus' },
  ];
}

const DIALOG = 'dialog[open], [role=dialog]:not([hidden]), [role=alertdialog]:not([hidden])';
const dialogOpen = (page) => page.evaluate((sel) => [...document.querySelectorAll(sel)].some((d) => d.getClientRects().length), DIALOG);
const focusInDialog = (page) => page.evaluate((sel) => { const a = document.activeElement; return !!a && [...document.querySelectorAll(sel)].some((d) => d.contains(a)); }, DIALOG);

async function dialogChecks(page) {
  const res = (id, ok, detail) => ({ id, ok, detail });
  const wasOpen = await dialogOpen(page);
  let trigger = null;
  if (!wasOpen) {
    trigger = await page.evaluateHandle(() => {
      const root = document.querySelector('#storybook-root') || document.body;
      return root.querySelector('[data-reax-target]') || root.querySelector('[data-slot="trigger"]') || [...root.querySelectorAll('button, [role=button], a[href]')].find((b) => !b.closest('dialog, [role=dialog], [role=alertdialog]')) || null;
    });
    if (!(await trigger.evaluate((t) => !!t))) return ['dialog-focus-in', 'dialog-esc', 'dialog-focus-return'].map((id) => res(id, null, 'no dialog and no trigger in this story'));
    await page.keyboard.press('Shift'); await trigger.evaluate((t) => t.focus()); await page.keyboard.press('Enter'); await pause(page);
    if (!(await dialogOpen(page))) return ['dialog-focus-in', 'dialog-esc', 'dialog-focus-return'].map((id) => res(id, null, 'Enter on the trigger did not open a dialog'));
  }
  const inside = await focusInDialog(page);
  await page.keyboard.press('Escape'); await pause(page);
  const closed = !(await dialogOpen(page));
  const out = [res('dialog-focus-in', inside, inside ? 'focus is inside the dialog' : 'focus stayed outside the dialog after it opened'), res('dialog-esc', closed, closed ? 'Esc closed it' : 'Esc did not close the dialog')];
  if (!trigger) out.push(res('dialog-focus-return', null, 'opened by the story itself, so there is no trigger to return to'));
  else if (!closed) out.push(res('dialog-focus-return', null, 'not checked: the dialog did not close'));
  else { const back = await trigger.evaluate((t) => document.activeElement === t); out.push(res('dialog-focus-return', back, back ? 'focus is back on the trigger' : 'focus did not return to the trigger')); }
  return out;
}

async function spaceToggles(page) {
  const el = page.locator('#storybook-root input[type=checkbox], #storybook-root [role=switch], #storybook-root [role=checkbox]').first();
  if (!(await el.count())) return { id: 'space-toggles', ok: null, detail: 'no checkbox or switch' };
  if (await el.isDisabled()) return { id: 'space-toggles', ok: null, detail: 'the control is disabled' };
  const state = () => el.evaluate((e) => ('checked' in e ? e.checked : e.getAttribute('aria-checked')));
  const before = await state(); await page.keyboard.press('Shift'); await el.focus(); await page.keyboard.press('Space'); await pause(page, 50);
  const ok = (await state()) !== before;
  return { id: 'space-toggles', ok, detail: ok ? 'Space toggled it' : 'Space did not change the state' };
}

async function arrowsSelect(page) {
  const radios = page.locator('#storybook-root input[type=radio]:not([disabled])');
  if ((await radios.count()) < 2) return { id: 'arrows-select', ok: null, detail: 'fewer than two radios' };
  const checked = page.locator('#storybook-root input[type=radio]:checked');
  const start = (await checked.count()) ? checked.first() : radios.first();
  await page.keyboard.press('Shift'); await start.focus(); const before = await start.evaluate((e) => e.value);
  await page.keyboard.press('ArrowDown'); await pause(page, 50);
  const after = await page.evaluate(() => { const a = document.activeElement; return a?.matches?.('input[type=radio]') && a.checked ? a.value : null; });
  const ok = !!after && after !== before;
  return { id: 'arrows-select', ok, detail: ok ? 'ArrowDown moved and selected' : 'ArrowDown did not move the selection' };
}

/** Run the named checks on a story that is already rendered in `page`. Never throws for a broken story. */
export async function runChecks(page, ids) {
  const out = [];
  try {
    if (ids.includes('tab-reach') || ids.includes('focus-visible')) out.push(...(await tabChecks(page)).filter((r) => ids.includes(r.id)));
    if (ids.includes('space-toggles')) out.push(await spaceToggles(page));
    if (ids.includes('arrows-select')) out.push(await arrowsSelect(page));
    if (ids.some((i) => i.startsWith('dialog-'))) out.push(...(await dialogChecks(page)).filter((r) => ids.includes(r.id)));
  } catch (e) {
    out.push({ id: 'error', ok: null, error: true, detail: `the checks could not finish: ${String(e.message).split('\n')[0]}` });
  }
  return out;
}
