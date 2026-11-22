#!/usr/bin/env node
// The design loader's command line. Everything in the skill that needs the project's design data goes through this.
//   node design.mjs load  [--root dir]            print the loaded design as JSON
//   node design.mjs check [--root dir]            exit 2 when DESIGN.md is missing, invalid or stale; say why
//   node design.mjs tokens [--group colors]       print the flattened, resolved tokens
//   node design.mjs write --draft file.json [--apply]   show the diff init would make; write only with --apply
//   node design.mjs diff a.md b.md                a line diff of two files
import fs from 'node:fs';
import { parseArgs } from './lib/runtime.mjs';
import { loadDesign, diffText } from './lib/design.mjs';
import { planWrite } from './lib/write.mjs';

const args = parseArgs(process.argv.slice(2));
const [cmd] = args._;
const root = args.root || process.cwd();

function summary(d) {
  return {
    root: d.root, designPath: d.designPath, exists: d.exists, meta: d.meta, sections: d.sections?.map((s) => s.name),
    tokens: Object.fromEntries(Object.entries(d.tokens || {}).map(([k, t]) => [k, { value: t.resolved, css: t.css }])),
    language: d.language, inventory: d.inventory, tokenSources: d.tokenSources,
    stale: d.stale?.stale ? d.stale.reasons : false, gaps: d.gaps, errors: d.errors, warnings: d.warnings,
  };
}

if (cmd === 'load') {
  console.log(JSON.stringify(summary(loadDesign(root, { root: args.root })), null, 2));
} else if (cmd === 'check') {
  const d = loadDesign(root, { root: args.root }); const problems = [];
  if (!d.exists.design) problems.push('DESIGN.md does not exist. Run init.');
  if (d.exists.design && !d.exists.sidecar) problems.push('.reax/design.json does not exist. Run init to write it.');
  problems.push(...d.errors.map((e) => e.message));
  if (d.stale.stale) problems.push(...d.stale.reasons.map((r) => `${r} Run init to review the changes.`));
  problems.push(...d.warnings.filter((w) => w.kind === 'schema').map((w) => w.message));
  console.log(JSON.stringify({ ok: problems.length === 0, problems }, null, 2));
  process.exit(problems.length ? 2 : 0);
} else if (cmd === 'tokens') {
  const d = loadDesign(root, { root: args.root });
  const rows = Object.values(d.tokens).filter((t) => !args.group || t.group === args.group);
  for (const t of rows) console.log(`${t.path.padEnd(34)} ${String(t.resolved).padEnd(18)} ${t.css}`);
} else if (cmd === 'write') {
  if (!args.draft) { console.error('--draft <file.json> is required'); process.exit(1); }
  const plan = planWrite(root, JSON.parse(fs.readFileSync(args.draft, 'utf8')), { apply: !!args.apply });
  console.log(plan.diff || '(no changes)');
  console.error(plan.applied ? 'Written.' : plan.changed ? 'Not written. Re-run with --apply after the person confirms.' : 'Nothing to write.');
} else if (cmd === 'diff') {
  const [, a, b] = args._; const r = diffText(fs.readFileSync(a, 'utf8'), fs.readFileSync(b, 'utf8'), a, b);
  console.log(r.text || '(no differences)'); process.exit(r.changed ? 1 : 0);
} else {
  console.error('Usage: design.mjs <load|check|tokens|write|diff> [options]'); process.exit(1);
}
