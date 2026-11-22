// Renders visual-report/report.md from a run. Everything deterministic is written here; the "Visual review" and
// "Improvements" sections are marked placeholders that Claude fills in after looking at the screenshots (decision: Q9).

const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];
const label = (vp) => ({ 'mobile-390': '390×844', 'desktop-1280': '1280×800', 'reflow-320': '320px reflow', 'text-200': '200% text' }[vp] || (String(vp).startsWith('pinned-') ? `${String(vp).slice(7)}px (pinned)` : vp));
const pct = (r) => `${(r * 100).toFixed(r < 0.001 && r > 0 ? 3 : 2)}%`;
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

export const PLACEHOLDER_REVIEW = '<!-- reax:visual-review -->\n_Not reviewed yet. Claude looks at each screenshot and writes, per component: **Blocking**, **Should fix**, **Looks right**. The automated checks below do not replace this._\n<!-- /reax:visual-review -->';
export const PLACEHOLDER_IMPROVEMENTS = '<!-- reax:improvements -->\n_Filled in by `improve` or by Claude after the visual review._\n<!-- /reax:improvements -->';

export function renderReport(run) {
  const L = []; const out = (s = '') => L.push(s);
  out('# Visual report'); out();
  out(`Run ${run.startedAt.replace('T', ' ').slice(0, 19)} UTC · Storybook ${run.storybook.version || 'unknown'} · ${run.stories.length} ${run.stories.length === 1 ? 'story' : 'stories'} (${run.scope.description}) · Chromium · ${run.config.viewports.length} captures per story · pixel threshold ${pct(run.config.diffThreshold)}`); out();

  out('## Summary'); out();
  const n = (k, one, many) => `${run.summary[k]} ${run.summary[k] === 1 ? one : many}`;
  out(`**${n('failure', 'failure', 'failures')}, ${n('warning', 'warning', 'warnings')}, ${run.summary.pass} pass.** Exit code ${run.exitCode}.`); out();
  out('| Story | Result | Why |'); out('| --- | --- | --- |');
  for (const s of run.stories) out(`| ${esc(s.title)} / ${esc(s.name)} | ${s.result === 'failure' ? '**Failure**' : s.result === 'warning' ? 'Warning' : 'Pass'} | ${esc(s.reasons.join('; ') || '-')} |`);
  out();

  out('## Screenshots'); out();
  out(`| Story | ${run.config.viewports.map((v) => label(v.name)).join(' | ')} |`); out(`| --- | ${run.config.viewports.map(() => '---').join(' | ')} |`);
  for (const s of run.stories) out(`| ${esc(s.title)} / ${esc(s.name)} | ${run.config.viewports.map((v) => { const c = s.captures.find((x) => x.viewport === v.name); return c?.screenshot ? `[image](${c.screenshot})${c.unstable ? ' (unstable)' : ''}` : c?.status === 'could-not-run' ? 'could not run' : '-'; }).join(' | ')} |`);
  out();

  out('## Visual review'); out(); out(PLACEHOLDER_REVIEW); out();

  out('## Accessibility findings (axe-core)'); out();
  const blockingList = run.config.axe.blockingImpacts.join(' and ');
  out(`Tags: ${run.config.axe.tags.join(', ')}. ${blockingList[0].toUpperCase() + blockingList.slice(1)} findings block the run; others are reported only.`); out();
  const withAxe = run.stories.filter((s) => s.axe.length);
  if (!withAxe.length) out('No findings in the captures that ran. This does not clear what axe cannot judge, such as meaning and focus order.'); out();
  for (const s of withAxe) {
    out(`### ${s.title} / ${s.name}`); out();
    out('| Impact | Rule | Element | Seen in | What to fix |'); out('| --- | --- | --- | --- | --- |');
    for (const f of [...s.axe].sort((a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact))) {
      const blocking = run.config.axe.blockingImpacts.includes(f.impact);
      out(`| ${blocking ? '**' + f.impact + ', blocks**' : f.impact} | \`${f.id}\` | \`${esc(f.target)}\` | ${f.captures.map(label).join(', ')} | ${esc(f.summary || f.help)} |`);
    }
    out();
  }
  if (run.config.axe.disabledRules.length) { out('Rules switched off in `.reax/visual-test.json`:'); out(); for (const r of run.config.axe.disabledRules) out(`- \`${r.id}\`: ${r.reason}`); out(); }

  out('## Other findings'); out();
  const other = [];
  for (const s of run.stories) {
    const name = `${s.title} / ${s.name}`;
    for (const t of s.textScale) other.push(`- **${name}**: text does not follow the 200% setting: \`${t.selector}\` ("${esc(t.text)}") went from ${t.before}px to ${t.after}px (x${t.ratio}). Size text in \`rem\` or \`em\`, not \`px\`.`);
    for (const c of s.captures) {
      if (c.overflow) other.push(`- **${name}**: the page scrolls sideways at ${label(c.viewport)} (content ${c.overflow.scrollWidth}px in a ${c.overflow.clientWidth}px viewport).`);
      if (c.unstable) other.push(`- **${name}**: the capture at ${label(c.viewport)} never settled (animated or changing content), so it was not compared with a baseline.`);
      if (c.baseline === 'changed') other.push(`- **${name}**: ${label(c.viewport)} differs from its baseline by ${pct(c.diff.ratio)}${c.diff.dimsDiffer ? ' (the size changed)' : ''}${c.diff.image ? `, see [diff](${c.diff.image})` : ''}.`);
      if (c.status === 'could-not-run') other.push(`- **${name}**: could not run at ${label(c.viewport)}: ${esc(c.error)}`);
    }
  }
  const noBaseline = run.stories.flatMap((s) => s.captures.filter((c) => c.baseline === 'none').map(() => s.id));
  if (noBaseline.length) other.push(`- ${noBaseline.length} captures have no baseline yet. Nothing fails for that. After the visual review passes and you confirm, approve them with \`visual-test --approve\`.`);
  if (!other.length) out('None.'); else for (const l of other) out(l);
  out();

  out('## Improvements'); out(); out(PLACEHOLDER_IMPROVEMENTS); out();
  return L.join('\n');
}
