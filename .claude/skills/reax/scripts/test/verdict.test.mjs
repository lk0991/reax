import test from 'node:test';
import assert from 'node:assert/strict';
import { decide, renderVerdict, dependencyChanges, classifyScope } from '../lib/verdict.mjs';

// an evidence record where everything this version can check passed
const good = () => ({
  createdAt: '2026-11-23T10:00:00Z',
  scope: { base: 'main', changedFiles: ['src/components/Button/Button.tsx', 'src/components/Button/Button.css'], components: ['Button'], dependencies: { added: [], changed: [], removed: [] }, outsideComponents: [], globalStyles: [], expected: [] },
  checks: {
    typecheck: { status: 'pass', command: 'tsc --noEmit -p .' },
    visualTest: { status: 'pass', summary: { total: 4, pass: 4, warning: 0, failure: 0 }, failures: [], warnings: [], changedFromBaseline: [], report: 'visual-report/report.md' },
    lint: { status: 'pass', command: 'eslint' }, review: { status: 'pass', blocking: [], shouldFix: [] }, conventions: { status: 'pass', deviations: [] },
    reviewer: { status: 'pass', verdict: 'agree', findings: [] }, fit: { status: 'pass', findings: [] },
  },
});

test('every check ran and passed: ready to merge, no developer review needed', () => {
  const v = decide(good());
  assert.equal(v.level, 'ready');
  assert.match(v.headline, /no developer review/i);
  assert.deepEqual(v.gaps, []);
});

test('a check that could not run makes it "ready with gaps", naming the gap and what it would take', () => {
  const e = good(); e.checks.lint = { status: 'not-run', reason: 'No lint is set up in this project.', howTo: 'Add ESLint with a lint script.' };
  const v = decide(e);
  assert.equal(v.level, 'gaps');
  assert.deepEqual(v.gaps.map((g) => g.check), ['lint']);
  assert.match(v.headline, /lint/i);
  // a missing check is never silently a pass
  delete e.checks.review;
  assert.ok(decide(e).gaps.some((g) => g.check === 'review'));
});

test('a failed type check, a failed story or an accessibility failure blocks', () => {
  const a = good(); a.checks.typecheck = { status: 'fail', detail: 'src/x.tsx(3,1): error TS2322' };
  assert.equal(decide(a).level, 'blocked');
  const b = good(); b.checks.visualTest = { ...b.checks.visualTest, status: 'fail', summary: { total: 4, pass: 3, warning: 0, failure: 1 }, failures: [{ story: 'Components/Chip / Default', reasons: ['2 blocking accessibility findings'] }] };
  const v = decide(b);
  assert.equal(v.level, 'blocked');
  assert.ok(v.blocking.some((x) => /Chip/.test(x)));
});

test('a scope surprise needs work: a new dependency, a global style, a file outside the components', () => {
  const a = good(); a.scope.dependencies.added = ['left-pad@1.3.0'];
  assert.equal(decide(a).level, 'needs-work');
  assert.ok(decide(a).concerns.some((c) => /left-pad/.test(c)));
  const b = good(); b.scope.globalStyles = ['src/styles/global.css'];
  assert.equal(decide(b).level, 'needs-work');
  // a file the change was meant to touch (a token change's token file) is not a surprise
  const c = good(); c.scope.outsideComponents = ['src/styles/tokens.css']; c.scope.globalStyles = ['src/styles/tokens.css']; c.scope.expected = ['src/styles/tokens.css'];
  assert.equal(decide(c).level, 'ready');
});

test('visual-test warnings other than baseline changes need work; baseline changes are what the person approves', () => {
  const a = good(); a.checks.visualTest.warnings = [{ story: 'Components/Card / Long', reasons: ['scrolls sideways at 320px reflow'] }];
  assert.equal(decide(a).level, 'needs-work');
  const b = good(); b.checks.visualTest.changedFromBaseline = ['components-button--primary'];
  const v = decide(b);
  assert.equal(v.level, 'ready');
  assert.ok(v.lines.some((l) => /looks? different from (its|their) approved screenshots/.test(l.plain)));
});

test('the page puts plain words first, keeps the detail, names every check, escapes text and has no scripts', () => {
  const e = good(); e.checks.typecheck = { status: 'fail', detail: '<b>error</b> TS2322' }; e.checks.lint = { status: 'not-run', reason: 'No lint.', howTo: 'Add ESLint.' };
  const html = renderVerdict(e, decide(e));
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /Blocked/);
  for (const name of ['Type check', 'Visual test', 'Lint', 'Review', 'Conventions', 'Independent reviewer', 'Scope']) assert.ok(html.includes(name), name);
  assert.match(html, /&lt;b&gt;error&lt;\/b&gt;/);
  assert.match(html, /Add ESLint/);
  assert.ok(!/<script/i.test(html));
});

test('dependencyChanges compares two package.json files', () => {
  const before = { dependencies: { react: '^18.3.1' }, devDependencies: { vite: '^6.0.0' } };
  const after = { dependencies: { react: '^18.3.1', 'left-pad': '1.3.0' }, devDependencies: { vite: '^6.1.0' } };
  assert.deepEqual(dependencyChanges(before, after), { added: ['left-pad@1.3.0'], changed: ['vite ^6.0.0 → ^6.1.0'], removed: [] });
});

test('classifyScope sorts changed files into components, outside files and global styles', () => {
  const s = classifyScope(['src/components/Button/Button.tsx', 'src/components/Button/index.ts', 'src/styles/global.css', 'package.json', '.storybook/preview.ts', 'README.md'], { componentsDir: 'src/components', tokenFiles: ['src/styles/tokens.css'] });
  assert.deepEqual(s.components, ['Button']);
  assert.deepEqual(s.outsideComponents, ['src/styles/global.css', 'package.json', '.storybook/preview.ts', 'README.md']);
  assert.deepEqual(s.globalStyles, ['src/styles/global.css', '.storybook/preview.ts']);
});

test('reax\'s own records (DESIGN.md, COMPONENTS.md, PRODUCT.md, .reax/) are listed but never a surprise', () => {
  const e = good(); e.scope.outsideComponents = ['DESIGN.md', 'COMPONENTS.md', 'PRODUCT.md', '.reax/design.json', '.reax/baselines/x/a.png'];
  assert.equal(decide(e).level, 'ready');
});

test('the page shows the level once: as its label, not again at the start of the sentence', () => {
  const e = good(); e.checks.lint = { status: 'not-run', reason: 'No lint.', howTo: 'Add ESLint.' };
  const html = renderVerdict(e, decide(e));
  assert.match(html, /<span class="level">Ready with gaps<\/span><p>Nothing failed/);
});

test('a reviewer with concerns makes it "needs work"; a blocking reviewer blocks', () => {
  const a = good(); a.checks.reviewer = { status: 'pass', verdict: 'concerns', findings: [{ what: 'Loading state never announced' }] };
  assert.equal(decide(a).level, 'needs-work');
  assert.ok(decide(a).concerns.some((c) => /Loading state/.test(c)));
  const b = good(); b.checks.reviewer = { status: 'pass', verdict: 'blocked', findings: [{ what: 'Focus lost on close' }] };
  assert.equal(decide(b).level, 'blocked');
});

test('a visual test that crashed or never finished blocks, even with no failing story', () => {
  const e = good(); e.checks.visualTest = { status: 'fail', detail: 'The Storybook build failed.' };
  const v = decide(e);
  assert.equal(v.level, 'blocked');
  assert.ok(v.blocking.some((b) => /did not finish/.test(b)));
});

test('classifyScope ignores files directly in the components directory that are not components (a barrel index)', () => {
  const s = classifyScope(['src/components/index.ts', 'src/components/Button.tsx', 'src/components/Card/Card.tsx'], { componentsDir: 'src/components' });
  assert.deepEqual(s.components, ['Button', 'Card']);
});

test('the fit check: findings make it needs work, shown in plain words with where; a gap when it could not run', () => {
  const e = good(); e.checks.fit = { status: 'concern', findings: [{ file: 'src/screens/Today/Today.css', line: 4, kind: 'colour', found: '#1f4f9b', message: 'Uses #1f4f9b, which is not one of the project\'s colours. The nearest is var(--brand-blue-500).' }, { file: 'src/screens/Today/Today.tsx', line: 9, kind: 'primary-action', found: '2', message: '2 primary buttons in one screen.' }] };
  const v = decide(e);
  assert.equal(v.level, 'needs-work');
  assert.ok(v.concerns.some((c) => /Today\.css:4/.test(c) && /nearest is var\(--brand-blue-500\)/.test(c)));
  const html = renderVerdict(e, v);
  assert.ok(html.includes('Fit with the design'));
  assert.match(html, /2 places where the code strays from the project's design/);
  const g = good(); g.checks.fit = { status: 'not-run', reason: 'The project has no tokens to check against.', howTo: 'Run direction.' };
  assert.equal(decide(g).level, 'gaps');
});

test('without a fit check in the evidence (an older record), it is a named gap, never a pass', () => {
  const e = good(); delete e.checks.fit;
  assert.ok(decide(e).gaps.some((g) => g.check === 'fit'));
});

test('classifyScope counts a screen in the screens directory as a component of the change, not as a file outside', () => {
  const s = classifyScope(['src/screens/Today/Today.tsx', 'src/screens/Today/Today.css', 'src/components/Button/Button.css', 'src/styles/global.css'], { componentsDir: 'src/components', screensDir: 'src/screens' });
  assert.deepEqual(s.components, ['Button', 'Today']);
  assert.deepEqual(s.outsideComponents, ['src/styles/global.css']);
});
