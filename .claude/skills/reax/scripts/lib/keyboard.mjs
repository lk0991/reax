// Keyboard and focus checks: the behaviour a card's Requirements describe, checked with real key presses in a story's
// frame. Each card lists the checks that apply to it in its "Keyboard checks" section; every component gets the shared
// ones. A check returns ok: true, false or null (it does not apply to this story). A failed check fails the run,
// except one marked `default` in CHECK_INFO, which tests a Default and only warns.

/** The checks a card asks for, as named in its "Keyboard checks" section. */
export const CARD_CHECKS = {
  dialog: ['dialog-focus-in', 'dialog-esc', 'dialog-focus-return'],
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

/** Mark the elements that must be reachable with Tab, in markup order, and return their names. */
const markTargets = (page) => page.evaluate(() => {
  const root = document.querySelector('#storybook-root') || document.body;
  const modal = [...root.querySelectorAll('dialog[open]')].find((d) => d.matches(':modal'));
  const scope = modal || root;
  const SEL = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [role=menuitem], [role=radio], [role=option], [role=combobox]';
  const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('value') || el.tagName.toLowerCase()).trim().replace(/\s+/g, ' ').slice(0, 40) || el.tagName.toLowerCase();
  const seenGroups = new Set(); const out = [];
  for (const el of scope.querySelectorAll(SEL)) {
    if (el.disabled || el.closest('[inert], dialog:not([open]), [hidden]') || !el.getClientRects().length) continue;
    if (el.matches('input[type=radio]')) { // a radio group is one stop
      if (seenGroups.has(el.name)) continue; seenGroups.add(el.name);
    }
    el.setAttribute('data-reax-kb', String(out.length)); out.push(el.matches('input[type=radio]') ? `radio group "${el.name}"` : name(el));
  }
  document.activeElement?.blur?.();
  return out;
});

const focusStyle = (page) => page.evaluate(() => {
  const el = document.activeElement; if (!el || el === document.body) return null;
  const k = el.closest('[data-reax-kb]') || el; const cs = getComputedStyle(el);
  const radioGroup = el.matches('input[type=radio]') ? document.querySelector(`input[type=radio][name="${el.name}"][data-reax-kb]`) : null;
  return { index: (radioGroup || k).getAttribute('data-reax-kb'), sig: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderColor, cs.backgroundColor, cs.textDecorationLine].join('|') };
});

const restStyles = (page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-reax-kb]')].map((el) => {
  const cs = getComputedStyle(el); return [el.getAttribute('data-reax-kb'), [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderColor, cs.backgroundColor, cs.textDecorationLine].join('|')];
})));

async function tabChecks(page) {
  const names = await markTargets(page);
  if (!names.length) return [{ id: 'tab-reach', ok: null, detail: 'no interactive element' }, { id: 'focus-visible', ok: null, detail: 'no interactive element' }];
  const rest = await restStyles(page);
  const reached = new Set(); const noRing = new Set();
  for (let i = 0; i < names.length * 2 + 2; i++) {
    await page.keyboard.press('Tab');
    const f = await focusStyle(page); if (!f || f.index === null) continue;
    reached.add(f.index); if (f.sig === rest[f.index]) noRing.add(f.index); else noRing.delete(f.index);
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
    out.push({ id: 'error', ok: null, detail: `the checks could not finish: ${String(e.message).split('\n')[0]}` });
  }
  return out;
}
