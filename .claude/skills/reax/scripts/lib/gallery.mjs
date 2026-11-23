// A static screenshot gallery of a visual-test run: one page plus the screenshots it references, small enough to read
// and publish (for example as a private Artifact) when the person cannot reach the live preview on this machine.
// Decision: ADR 0005.
import { page, esc } from './page.mjs';

const LABEL = { 'mobile-390': '390 × 844', 'desktop-1280': '1280 × 800', 'reflow-320': '320 reflow', 'text-200': '200% text' };
const label = (v) => LABEL[v] || (String(v).startsWith('pinned-') ? `${String(v).slice(7)}px (pinned)` : v);

/** @returns {{ html: string, files: string[] }} the page, and the screenshot paths it references (relative to visual-report/) */
export function renderGallery(run) {
  const files = [];
  const byComponent = new Map();
  for (const s of run.stories) { const k = s.title.split('/').pop().trim(); if (!byComponent.has(k)) byComponent.set(k, []); byComponent.get(k).push(s); }
  const sections = [...byComponent].map(([name, stories]) => `<section><h2>${esc(name)}</h2>${stories.map((s) => {
    const shots = s.captures.map((c) => {
      if (!c.screenshot) return `<figure class="missing"><div class="none">${c.status === 'could-not-run' ? 'could not run' : 'no screenshot'}</div><figcaption>${esc(label(c.viewport))}</figcaption></figure>`;
      files.push(c.screenshot);
      return `<figure><a href="${esc(c.screenshot)}"><img src="${esc(c.screenshot)}" alt="${esc(`${s.title} / ${s.name} at ${label(c.viewport)}`)}" loading="lazy"></a><figcaption>${esc(label(c.viewport))}${c.unstable ? ' (unstable)' : ''}</figcaption></figure>`;
    }).join('');
    const keys = (s.keyboard || []).filter((k) => k.ok === false).map((k) => `keyboard: ${k.what || k.id}`);
    const why = [...s.reasons, ...keys.filter((k) => !s.reasons.some((r) => r.startsWith('keyboard')))];
    return `<article class="${esc(s.result)}"><h3>${esc(s.name)} <span class="badge">${s.result === 'failure' ? 'Failure' : s.result === 'warning' ? 'Warning' : 'Pass'}</span></h3>${why.length ? `<p class="why">${why.map(esc).join(' · ')}</p>` : ''}<div class="shots">${shots}</div></article>`;
  }).join('')}</section>`).join('\n');
  const sum = run.summary;
  const html = page({
    title: 'Component screenshots',
    css: `main { max-width: 1200px; margin: 0 auto; }
h1 { font-size: 1.5rem; margin: 0 0 4px; } h2 { font-size: 1.25rem; margin: 32px 0 8px; border-bottom: 1px solid var(--line); padding-bottom: 4px; } h3 { font-size: 1rem; margin: 0 0 4px; }
.meta, .why, figcaption { color: var(--muted); font-size: 0.875rem; }
article { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin: 12px 0; }
.badge { font-size: 0.75rem; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid currentColor; margin-left: 6px; }
.failure .badge { color: var(--bad); } .warning .badge { color: var(--warn); } .pass .badge { color: var(--ok); }
.shots { min-width: 0; display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
figure { margin: 0; flex: 0 0 auto; }
img { display: block; max-height: 360px; max-width: min(80vw, 640px); height: auto; border: 1px solid var(--line); background: #fff; }
.none { width: 160px; height: 120px; display: grid; place-items: center; border: 1px dashed var(--line); color: var(--bad); font-size: 0.875rem; }`,
    body: `<main>
<h1>Component screenshots</h1>
<p class="meta">Visual test of ${esc(run.scope.description)} · ${sum.failure} failing, ${sum.warning} with warnings, ${sum.pass} passing · Storybook ${esc(run.storybook.version || 'unknown')} · ${esc(run.startedAt.replace('T', ' ').slice(0, 16))} UTC. Select a screenshot to open it at full size. These are pictures: to try the components, open the live preview or a deployed Storybook.</p>
${sections}
</main>`,
  });
  return { html, files };
}
