import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { lintCommand, reviewEvidence, conventionsEvidence } from '../lib/evidence.mjs';

const tmp = (files) => { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reax-ev-')); for (const [f, t] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), t); } return root; };

test('lint: a "lint" script wins, then an ESLint config with ESLint installed, otherwise a named gap', () => {
  assert.deepEqual(lintCommand(tmp({ 'package.json': JSON.stringify({ scripts: { lint: 'eslint .' } }) })).args, ['run', 'lint']);
  const r = tmp({ 'package.json': '{}', 'eslint.config.js': 'export default []', 'node_modules/eslint/bin/eslint.js': '', 'src/components/Button/Button.tsx': 'x' });
  assert.match(lintCommand(r, ['src/components/Button/Button.tsx']).args.join(' '), /eslint\.js src\/components\/Button\/Button\.tsx$/);
  const none = lintCommand(tmp({ 'package.json': '{}' }));
  assert.equal(none.status, 'not-run'); assert.match(none.howTo, /ESLint/);
});

test('review: findings for the changed components, split by rank', () => {
  const review = { Button: { reviewedAt: '2026-11-23T10:00:00Z', findings: [{ rank: 'blocking', what: 'No name on icon button', where: 'Button.tsx:12' }, { rank: 'should-fix', what: 'Raw colour' }] }, Card: { reviewedAt: '2026-11-23T10:00:00Z', findings: [{ rank: 'blocking', what: 'other component' }] } };
  const e = reviewEvidence(review, ['Button'], { Button: Date.parse('2026-11-23T09:00:00Z') });
  assert.equal(e.status, 'fail');
  assert.deepEqual(e.blocking.map((f) => f.what), ['No name on icon button']);
  assert.deepEqual(e.shouldFix.map((f) => f.what), ['Raw colour']);
});

test('review: a component never reviewed, or changed since its review, is a named gap, not a pass', () => {
  const missing = reviewEvidence({}, ['Button'], {});
  assert.equal(missing.status, 'not-run'); assert.match(missing.reason, /Button/);
  const stale = reviewEvidence({ Button: { reviewedAt: '2026-11-23T10:00:00Z', findings: [] } }, ['Button'], { Button: Date.parse('2026-11-23T11:00:00Z') });
  assert.equal(stale.status, 'not-run'); assert.match(stale.reason, /changed since/);
  assert.equal(reviewEvidence({ Button: { reviewedAt: '2026-11-23T10:00:00Z', findings: [] } }, ['Button'], { Button: Date.parse('2026-11-23T09:00:00Z') }).status, 'pass');
});

test('conventions: deviations for the changed components only; without recorded conventions, a named gap', () => {
  const comp = (n, ref) => ({ [`src/ui/${n}/${n}.tsx`]: `export interface ${n}Props { a?: string }\n${ref ? `export const ${n} = React.forwardRef<HTMLDivElement, ${n}Props>(function ${n}(p, r) { return null; });` : `export function ${n}(p: ${n}Props) { return null; }`}\n` });
  const root = tmp({ 'package.json': '{}', ...comp('A', true), ...comp('B', true), ...comp('C', true), ...comp('D', false) });
  const recorded = { componentsDir: 'src/ui', code: { definition: { status: 'convention', value: 'forwardRef', count: 3, total: 4 } } };
  const e = conventionsEvidence(root, recorded, ['D', 'A']);
  assert.equal(e.status, 'pass');
  assert.deepEqual(e.deviations.map((d) => [d.component, d.key]), [['D', 'code.definition']]);
  assert.equal(conventionsEvidence(root, null, ['D']).status, 'not-run');
});

test('conventions: deviations the review judged explained are not counted again', () => {
  const comp = (n, ref) => ({ [`src/ui/${n}/${n}.tsx`]: `export interface ${n}Props { a?: string }\n${ref ? `export const ${n} = React.forwardRef<HTMLDivElement, ${n}Props>(function ${n}(p, r) { return null; });` : `export function ${n}(p: ${n}Props) { return null; }`}\n` });
  const root = tmp({ 'package.json': '{}', ...comp('A', true), ...comp('B', true), ...comp('C', true), ...comp('D', false) });
  const recorded = { componentsDir: 'src/ui', code: { definition: { status: 'convention', value: 'forwardRef', count: 3, total: 4 } } };
  const review = { D: { reviewedAt: '2026-11-23T10:00:00Z', findings: [], explained: ['code.definition'] } };
  assert.deepEqual(conventionsEvidence(root, recorded, ['D'], review).deviations, []);
});

test('reviewer: its verdict counts only for the exact change it read', async () => {
  const { reviewerEvidence, diffHash } = await import('../lib/evidence.mjs');
  const h = diffHash('diff --git a/x b/x\n+1');
  assert.equal(h, diffHash('diff --git a/x b/x\n+1'));
  assert.notEqual(h, diffHash('diff --git a/x b/x\n+2'));
  assert.equal(reviewerEvidence({ diffHash: h, verdict: 'agree', findings: [], summary: 'Fine.' }, h).status, 'pass');
  const c = reviewerEvidence({ diffHash: h, verdict: 'concerns', findings: [{ what: 'Loading state never announced' }] }, h);
  assert.equal(c.status, 'pass'); assert.equal(c.verdict, 'concerns');
  assert.equal(reviewerEvidence({ diffHash: h, verdict: 'blocked', findings: [{ what: 'x' }] }, h).verdict, 'blocked');
  const stale = reviewerEvidence({ diffHash: h, verdict: 'agree', findings: [] }, diffHash('other'));
  assert.equal(stale.status, 'not-run'); assert.match(stale.reason, /changed since/);
  const none = reviewerEvidence(null, h);
  assert.equal(none.status, 'not-run'); assert.match(none.howTo, /reviewer/);
  const noAgents = reviewerEvidence({ diffHash: h, status: 'not-run', reason: 'This session cannot start a separate agent.' }, h);
  assert.equal(noAgents.status, 'not-run'); assert.match(noAgents.reason, /separate agent/);
});

test('reviewer packet: the diff, the files to read, the evidence and the exact answer format', async () => {
  const { reviewerPacket } = await import('../lib/evidence.mjs');
  const p = reviewerPacket({ diff: '+ <button>', hash: 'abc123', files: ['COMPONENTS.md', '.claude/skills/reax/components/button.md'], evidence: 'visual-report/verdict/evidence.json', screenshots: ['visual-report/screenshots/b/mobile-390.png'], out: 'visual-report/verdict/reviewer.json' });
  assert.match(p, /did not write/i);
  assert.match(p, /\+ <button>/);
  assert.match(p, /COMPONENTS\.md/); assert.match(p, /button\.md/); assert.match(p, /mobile-390\.png/);
  assert.match(p, /"diffHash": "abc123"/);
  assert.match(p, /"verdict": "agree" \| "concerns" \| "blocked"/);
  assert.match(p, /visual-report\/verdict\/reviewer\.json/);
});

test('review: component names match whatever their case, and a review without a date is stale', () => {
  const r = reviewEvidence({ Button: { reviewedAt: '2026-11-23T10:00:00Z', findings: [] } }, ['button'], { Button: Date.parse('2026-11-23T11:00:00Z') });
  assert.equal(r.status, 'not-run'); assert.match(r.reason, /changed since/);
  const undated = reviewEvidence({ Button: { findings: [] } }, ['Button'], { Button: 1 });
  assert.equal(undated.status, 'not-run');
});

test('lint: only changed files that still exist; none left means nothing to lint', () => {
  const r = tmp({ 'package.json': '{}', 'eslint.config.js': 'export default []', 'node_modules/eslint/bin/eslint.js': '', 'src/a.tsx': 'x' });
  assert.match(lintCommand(r, ['src/a.tsx', 'src/gone.tsx']).args.join(' '), /eslint\.js src\/a\.tsx$/);
  const none = lintCommand(r, ['src/gone.tsx', 'README.md']);
  assert.equal(none.status, 'not-run'); assert.match(none.reason, /No JavaScript or TypeScript file/);
});
