import test from 'node:test';
import assert from 'node:assert/strict';
import { approvalPlan, prDescription } from '../lib/approval.mjs';

const ba = { changed: [{ id: 'components-button--primary', title: 'Components/Button', name: 'Primary', captures: [{ viewport: 'mobile-390' }, { viewport: 'desktop-1280' }] }], unchanged: [{ id: 'components-button--secondary', title: 'Components/Button', name: 'Secondary' }], added: [{ id: 'components-button--ghost', title: 'Components/Button', name: 'Ghost' }], removed: [] };
const verdict = (level) => ({ level, headline: `${level} headline.`, summary: 'Summary.', blocking: level === 'blocked' ? ['Chip fails'] : [], concerns: level === 'needs-work' ? ['A new dependency'] : [], gaps: level === 'gaps' ? [{ label: 'Lint', reason: 'No lint.' }] : [], lines: [{ label: 'Type check', status: 'pass', plain: 'The code type-checks.' }] });

test('approving updates exactly the changed and new stories', () => {
  const p = approvalPlan(verdict('ready'), ba);
  assert.equal(p.ok, true);
  assert.deepEqual(p.stories, ['components-button--primary', 'components-button--ghost']);
  assert.equal(p.confirm, null);
});

test('approval is refused when the verdict is blocked, with the reason', () => {
  const p = approvalPlan(verdict('blocked'), ba);
  assert.equal(p.ok, false);
  assert.match(p.reason, /Blocked/); assert.match(p.reason, /Chip fails/);
});

test('ready with gaps or needs work asks the person to confirm, naming what is open', () => {
  assert.match(approvalPlan(verdict('gaps'), ba).confirm, /Lint/);
  assert.match(approvalPlan(verdict('needs-work'), ba).confirm, /new dependency/);
});

test('the pull request description carries the verdict, the checks, before/after pictures and the approval', () => {
  const md = prDescription({ verdict: verdict('ready'), ba, approver: 'Sam (design system)', approvedAt: '2026-11-24T10:00:00Z', repo: 'acme/ui', base: 'main', head: 'reax/button-ghost', pageUrl: 'https://claude.ai/artifact/x' });
  assert.match(md, /ready headline\./);
  assert.match(md, /Type check/);
  assert.match(md, /https:\/\/github\.com\/acme\/ui\/blob\/main\/\.reax\/baselines\/components-button--primary\/mobile-390\.png\?raw=true/);
  assert.match(md, /https:\/\/github\.com\/acme\/ui\/blob\/reax\/button-ghost\/\.reax\/baselines\/components-button--primary\/mobile-390\.png\?raw=true/);
  assert.match(md, /Ghost/); assert.match(md, /new/i);
  assert.match(md, /Approved by Sam \(design system\) on the verdict "Ready to merge"/);
  assert.match(md, /https:\/\/claude\.ai\/artifact\/x/);
});

test('without a repository, the description still lists the stories and points at the page', () => {
  const md = prDescription({ verdict: verdict('gaps'), ba, approver: 'Sam', approvedAt: '2026-11-24T10:00:00Z' });
  assert.ok(!/github\.com/.test(md));
  assert.match(md, /Primary/);
  assert.match(md, /Ready with gaps/);
});

test('new stories get their picture from the branch, and not-run checks are not labelled twice', () => {
  const v = verdict('gaps'); v.lines.push({ label: 'Lint', status: 'not-run', plain: 'Not checked: No lint.' });
  const md = prDescription({ verdict: v, ba, approver: 'Sam', approvedAt: '2026-11-24T10:00:00Z', repo: 'acme/ui', base: 'main', head: 'feat' });
  assert.match(md, /!\[Ghost, new\]\(https:\/\/github\.com\/acme\/ui\/blob\/feat\/\.reax\/baselines\/components-button--ghost\/mobile-390\.png\?raw=true\)/);
  assert.match(md, /\*\*Lint\*\* \(Not run\): No lint\./);
});
