// Approving a verdict and handing the change off (spec #35): which Baselines to update, whether approval is allowed,
// and the pull request description, with before/after pictures linked from the approved screenshots committed under
// .reax/baselines on the base branch (before) and the change's branch (after).

const LEVEL = { ready: 'Ready to merge', gaps: 'Ready with gaps', 'needs-work': 'Needs work', blocked: 'Blocked' };
const STATUS = { pass: 'Passed', fail: 'Failed', concern: 'Worth fixing', 'not-run': 'Not run', info: 'For you to see' };

/** What approving would do: the stories whose Baselines to update, or why it is refused, or what to confirm. */
export function approvalPlan(verdict, ba) {
  if (verdict.level === 'blocked') return { ok: false, reason: `The verdict is Blocked, so it cannot be approved: ${verdict.blocking.join('; ')}.`, stories: [] };
  const stories = [...ba.changed.map((s) => s.id), ...ba.added.map((s) => s.id)];
  const open = verdict.level === 'gaps' ? `not checked: ${verdict.gaps.map((g) => g.label).join(', ')}` : verdict.level === 'needs-work' ? `still open: ${verdict.concerns.join('; ')}` : null;
  return { ok: true, stories, confirm: open ? `The verdict is ${LEVEL[verdict.level]} (${open}). Approve anyway?` : null };
}

/** The pull request description for an approved change. */
export function prDescription({ verdict, ba, approver, approvedAt, repo, base, head, pageUrl }) {
  const img = (branch, id, vp) => `https://github.com/${repo}/blob/${branch}/.reax/baselines/${id}/${vp}.png?raw=true`;
  const L = [];
  L.push(`## ${LEVEL[verdict.level]}`, '', verdict.headline, '');
  if (verdict.blocking.length) L.push('**Must be fixed**', ...verdict.blocking.map((x) => `- ${x}`), '');
  if (verdict.concerns.length) L.push('**Should be fixed**', ...verdict.concerns.map((x) => `- ${x}`), '');
  if (verdict.gaps.length) L.push('**Not checked**', ...verdict.gaps.map((g) => `- ${g.label}: ${g.reason}`), '');
  L.push('## What was checked', '', ...verdict.lines.map((l) => `- **${l.label}** (${STATUS[l.status] || l.status}): ${l.plain.replace(/^Not checked: /, '')}`), '');
  L.push('## Before and after', '');
  if (!ba.changed.length && !ba.added.length) L.push('Nothing looks different from the approved screenshots.', '');
  for (const s of ba.changed) {
    L.push(`### ${s.title} / ${s.name}`, '');
    if (repo && base && head) { L.push('| Before | After |', '| --- | --- |'); for (const c of s.captures) L.push(`| ![${s.name} before at ${c.viewport}](${img(base, s.id, c.viewport)}) | ![${s.name} after at ${c.viewport}](${img(head, s.id, c.viewport)}) |`); }
    else L.push(`Changed at ${s.captures.map((c) => c.viewport).join(', ')}.`);
    L.push('');
  }
  if (ba.added.length) {
    L.push(`**New stories:** ${ba.added.map((s) => `${s.title.split('/').pop()} / ${s.name}`).join(', ')}.`, '');
    if (repo && head) L.push(...ba.added.map((s) => `![${s.name}, new](${img(head, s.id, 'mobile-390')})`), '');
  }
  if (ba.removed.length) L.push(`**Stories removed:** ${ba.removed.join(', ')}.`, '');
  if (ba.unchanged.length) L.push(`Checked, unchanged: ${ba.unchanged.map((s) => `${s.title.split('/').pop()} / ${s.name}`).join(', ')}.`, '');
  if (pageUrl) L.push(`The full verdict, with every screenshot: ${pageUrl}`, '');
  L.push('---', '', `Approved by ${approver} on the verdict "${LEVEL[verdict.level]}", ${String(approvedAt).replace('T', ' ').slice(0, 16)} UTC. The approved screenshots for the changed and new stories are updated in this branch.`);
  return L.join('\n') + '\n';
}
