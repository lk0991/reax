#!/usr/bin/env node
// Approve the last verdict and prepare the hand-off (spec #35). Reads the evidence the last verdict saved,
// refuses when it is Blocked, asks for --confirm when it is Ready with gaps or Needs work, updates the Baselines of
// exactly the changed and new stories, records who approved it on which verdict, and writes the pull request
// description to visual-report/verdict/pull-request.md (with before/after pictures linked from .reax/baselines on
// GitHub when the repository is known).
//   node approve.mjs --root <project> --approver "Sam (design system)" [--confirm] [--page-url <published verdict>]
//                    [--repo owner/name] [--base main] [--head <branch>]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson, writeJson, findUp } from './lib/runtime.mjs';
import { decide } from './lib/verdict.mjs';
import { beforeAfter, listBaselines } from './lib/before-after.mjs';
import { approvalPlan, prDescription } from './lib/approval.mjs';
import { currentChange } from './lib/evidence.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
const out = (o, code = 0) => { console.log(JSON.stringify(o, null, 2)); process.exit(code); };
const dir = path.join(root, 'visual-report', 'verdict');
const evidence = readJson(path.join(dir, 'evidence.json'), null);
if (!evidence) out({ ok: false, error: 'There is no verdict to approve. Run the verdict first.' }, 1);
if (!args.approver) out({ ok: false, error: '--approver is required: who is approving, in their own words.' }, 1);

// the verdict must still describe the code, and the screenshots must be the ones it judged
if (currentChange(root, evidence.scope?.base).hash !== evidence.diffHash) out({ ok: false, error: 'The change has changed since the verdict: run the verdict again before approving.' }, 1);
const runFile = path.join(root, 'visual-report', 'run.json');
if (fs.existsSync(runFile) && fs.statSync(runFile).mtimeMs > fs.statSync(path.join(dir, 'evidence.json')).mtimeMs) out({ ok: false, error: 'The visual test ran again after the verdict: run the verdict again before approving.' }, 1);
const verdict = decide(evidence);
const baselines = listBaselines(root);
const ba = beforeAfter(readJson(path.join(root, 'visual-report', 'run.json'), { stories: [] }), baselines);
const plan = approvalPlan(verdict, ba);
if (!plan.ok) out({ ok: false, error: plan.reason }, 1);
if (plan.confirm && !args.confirm) out({ ok: false, needsConfirmation: true, question: plan.confirm, hint: 'Ask the person; run again with --confirm only on their yes.' }, 2);

let approved = { approved: 0, files: [] };
if (plan.stories.length) {
  const r = spawnSync(process.execPath, [path.join(HERE, 'visual-test.mjs'), '--root', root, '--approve', plan.stories.join(',')], { encoding: 'utf8' });
  try { approved = JSON.parse(r.stdout); } catch { out({ ok: false, error: 'Approving the screenshots failed.', detail: r.stderr }, 1); }
  if (approved.ok === false) out({ ok: false, error: 'Some screenshots could not be approved.', refused: approved.refused }, 1);
}

const git = (...a) => spawnSync('git', ['-C', root, ...a], { encoding: 'utf8' }).stdout.trim();
const remote = git('remote', 'get-url', 'origin');
const repo = args.repo || remote.match(/github\.com[:/]([^/]+\/[^/.]+?)(\.git)?$/)?.[1] || null;
const head = args.head || git('rev-parse', '--abbrev-ref', 'HEAD') || null;
const base = args.base || (evidence.scope?.base || '').replace(/^origin\//, '') || null;
const approvedAt = new Date().toISOString();
const record = { approver: String(args.approver), approvedAt, level: verdict.level, diffHash: evidence.diffHash, stories: plan.stories, confirmed: !!plan.confirm };
writeJson(path.join(dir, 'approval.json'), record);
const description = prDescription({ verdict, ba, approver: record.approver, approvedAt, repo, base, head, pageUrl: args['page-url'] });
fs.writeFileSync(path.join(dir, 'pull-request.md'), description);
out({ ok: true, level: verdict.level, approved: approved.approved, baselines: approved.files, record: path.relative(root, path.join(dir, 'approval.json')), pullRequest: { description: path.relative(root, path.join(dir, 'pull-request.md')), repo, base, head, note: repo ? 'Commit the change and .reax/baselines, push the branch, then open the pull request with this description.' : 'No GitHub repository found: give the person the description file.' } });
