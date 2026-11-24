// Before and after: for one visual-test run, every story that looks different from its approved screenshots (its
// Baselines), side by side, plus the stories that did not change (listed as checked), new stories and stories whose
// Baselines remain but which no longer exist. The "before" is the Baseline, so one run is enough. Spec #35.
import fs from 'node:fs';
import path from 'node:path';
import { esc } from './page.mjs';

/** The approved screenshots on disk: { storyId: [viewport, ...] }, story folders only. */
export function listBaselines(root) {
  const dir = path.join(root, '.reax', 'baselines'); const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) out[e.name] = fs.readdirSync(path.join(dir, e.name)).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4));
  return out;
}

const LABEL = { 'mobile-390': '390 × 844', 'desktop-1280': '1280 × 800', 'reflow-320': '320 reflow', 'text-200': '200% text' };
const label = (v) => LABEL[v] || (String(v).startsWith('pinned-') ? `${String(v).slice(7)}px (pinned)` : v);
const component = (id) => id.split('--')[0];
const kindOf = (s) => (/^Screens\//i.test(s.title) ? 'screen' : 'component');
const PAD = 16;

/** The area to show of a changed capture: its content and the changed pixels, plus a margin; null to show it whole. */
export function cropOf(c) {
  const boxes = [c.content, c.diff?.box].filter(Boolean);
  if (!c.size || !boxes.length || c.diff?.dimsDiffer) return null;
  const x0 = Math.max(0, Math.min(...boxes.map((b) => b.x)) - PAD); const y0 = Math.max(0, Math.min(...boxes.map((b) => b.y)) - PAD);
  const x1 = Math.min(c.size.w, Math.max(...boxes.map((b) => b.x + b.w)) + PAD); const y1 = Math.min(c.size.h, Math.max(...boxes.map((b) => b.y + b.h)) + PAD);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, imageW: c.size.w, imageH: c.size.h };
}
const pct = (n) => `${+n.toFixed(2)}%`;
/** An image, cropped with CSS to `crop` (the same crop for before, after and the changed pixels). */
export function shot(src, alt, crop, zoom = 2) {
  const img = `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"`;
  if (!crop) return `${img}>`;
  return `<div class="crop" style="aspect-ratio: ${crop.w} / ${crop.h}; max-width: ${crop.w * zoom}px">${img} style="width: ${pct((crop.imageW / crop.w) * 100)}; left: ${pct((-crop.x / crop.w) * 100)}; top: ${pct((-crop.y / crop.h) * 100)}"></div>`;
}

/**
 * @param run        the visual test's run.json
 * @param baselines  { storyId: [viewport, ...] } of the approved screenshots on disk
 */
export function beforeAfter(run, baselines = {}) {
  const changed = []; const unchanged = []; const added = []; const copies = []; const files = [];
  for (const s of run.stories) {
    const has = baselines[s.id] || [];
    if (!has.length) { const first = s.captures.find((c) => c.screenshot); added.push({ id: s.id, title: s.title, name: s.name, kind: kindOf(s), after: first?.screenshot || null, crop: first ? cropOf({ ...first, diff: null }) : null }); if (first) files.push(first.screenshot); continue; }
    const caps = s.captures.filter((c) => c.baseline === 'changed' && c.screenshot && has.includes(c.viewport)).map((c) => {
      const before = `before/${s.id}/${c.viewport}.png`;
      copies.push({ from: `.reax/baselines/${s.id}/${c.viewport}.png`, to: before });
      files.push(before, c.screenshot, ...(c.diff?.image ? [c.diff.image] : []));
      return { viewport: c.viewport, before, after: c.screenshot, diff: c.diff?.image || null, ratio: c.diff?.ratio ?? null, sizeChanged: !!c.diff?.dimsDiffer, crop: cropOf(c) };
    });
    (caps.length ? changed : unchanged).push({ id: s.id, title: s.title, name: s.name, kind: kindOf(s), captures: caps });
  }
  const covered = new Set(run.stories.map((s) => component(s.id)));
  const present = new Set(run.stories.map((s) => s.id));
  const removed = Object.keys(baselines).filter((id) => !present.has(id) && covered.has(component(id))).sort();
  return { changed, unchanged, added, removed, copies, files: [...new Set(files)] };
}

const CSS = `.ba { display: grid; gap: 16px; }
.ba h2 { font-size: 1.125rem; margin: 0; }
.ba-story { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 12px 16px; display: grid; gap: 8px; min-width: 0; }
.ba-story h3 { font-size: 1rem; margin: 0; }
.ba-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 12px; align-items: start; }
.ba-pair figure { margin: 0; min-width: 0; } .ba-pair figcaption { color: var(--muted); font-size: 0.875rem; }
.ba-pair img { display: block; max-width: 100%; max-height: 420px; height: auto; border: 1px solid var(--line); background: #fff; }
.ba-kind { margin: 8px 0 0; font-size: 1rem; }
.ba-note { color: var(--muted); font-size: 0.875rem; margin: 0; }
.ba-pair .crop { position: relative; overflow: hidden; width: 100%; border: 1px solid var(--line); background: #fff; }
.ba-pair .crop img { position: absolute; max-width: none; max-height: none; border: 0; }`;

/** The before/after section, for the verdict page or a page of its own (paths relative to visual-report/). */
export function renderBeforeAfter(m) {
  const pair = (s) => `<article class="ba-story"><h3>${esc(s.title)} / ${esc(s.name)}</h3>${s.captures.map((c) => `<p class="ba-note">${esc(label(c.viewport))}${c.ratio !== null ? ` · ${(c.ratio * 100).toFixed(c.ratio < 0.01 ? 2 : 1)}% of pixels differ` : ''}${c.sizeChanged ? ' · the size changed' : ''}</p><div class="ba-pair"><figure>${shot(c.before, `${s.name} before, at ${label(c.viewport)}`, c.crop)}<figcaption>Before (approved)</figcaption></figure><figure>${shot(c.after, `${s.name} after, at ${label(c.viewport)}`, c.crop)}<figcaption>After</figcaption></figure>${c.diff ? `<figure>${shot(c.diff, `Where ${s.name} changed, at ${label(c.viewport)}`, c.crop)}<figcaption>Where it changed (red)</figcaption></figure>` : ''}</div>`).join('')}</article>`;
  const parts = [`<h2 id="ba-h">Before and after</h2>`];
  if (!m.changed.length && !m.added.length && !m.removed.length) parts.push('<p>Nothing looks different from the approved screenshots.</p>');
  // components and screens are shown apart, with sub-headings, only when the change has screens
  const hasScreens = [...m.changed, ...m.added].some((s) => s.kind === 'screen');
  for (const kind of hasScreens ? ['component', 'screen'] : [null]) {
    const mine = kind ? m.changed.filter((s) => s.kind === kind) : m.changed;
    if (kind && mine.length) parts.push(`<h3 class="ba-kind">${kind === 'screen' ? 'Screens' : 'Components'}</h3>`);
    parts.push(...mine.map(pair));
  }
  if (m.added.length) parts.push(`<article class="ba-story"><h3>New stories, with nothing approved to compare against</h3><div class="ba-pair">${m.added.map((s) => (s.after ? `<figure>${shot(s.after, `${s.name}, new`, s.crop)}<figcaption>${esc(s.title)} / ${esc(s.name)}</figcaption></figure>` : `<p>${esc(s.title)} / ${esc(s.name)}</p>`)).join('')}</div></article>`);
  if (m.removed.length) parts.push(`<p class="ba-note">Approved screenshots for stories that no longer exist (removed, or renamed): ${m.removed.map(esc).join(', ')}.</p>`);
  if (m.unchanged.length) parts.push(`<p class="ba-note">Checked, unchanged: ${m.unchanged.map((s) => `${esc(s.title.split('/').pop())} / ${esc(s.name)}`).join(', ')}.</p>`);
  return `<style>${CSS}</style><section class="ba" aria-labelledby="ba-h">${parts.join('\n')}</section>`;
}
