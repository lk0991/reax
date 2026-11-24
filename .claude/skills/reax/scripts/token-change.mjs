#!/usr/bin/env node
// Change token values (spec #35, ADR 0008). Nothing is kept until the person approves.
//   node token-change.mjs --root <project> --set colors.primary=#2a5db0,rounded.md=0.75rem
//       plan only: the edits it would make (file, line, custom property, from, to), and any value it refuses,
//       with the nearest value that passes
//   ... --set ... --try    write the change as a trial (with a backup) so the visual test and verdict can show it
//   node token-change.mjs --root <project> --keep     the person approved: keep the trial
//   node token-change.mjs --root <project> --undo     the person declined: restore everything exactly
import path from 'node:path';
import { parseArgs, findUp } from './lib/runtime.mjs';
import { planTokenChange, applyTokenChange, undoTokenChange, keepTokenChange } from './lib/token-change.mjs';

const args = parseArgs(process.argv.slice(2));
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
const out = (o, code = 0) => { console.log(JSON.stringify(o, null, 2)); process.exit(code); };

try {
  if (args.keep) out({ ok: true, kept: keepTokenChange(root) });
  if (args.undo) out({ ok: true, undone: undoTokenChange(root) });
} catch (e) { out({ ok: false, error: e.message }, 1); }

if (!args.set) out({ ok: false, error: 'Use --set path=value[,path=value], or --keep / --undo for an open trial.' }, 1);
const changes = Object.fromEntries(String(args.set).split(',').map((s) => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim()]; }));
const plan = planTokenChange(root, changes);
if (!args.try) out({ ok: plan.errors.length === 0, edits: plan.edits, errors: plan.errors });
if (plan.errors.length) out({ ok: false, error: 'Some values are refused; nothing was written.', errors: plan.errors }, 1);
try { applyTokenChange(root, plan, { trial: true }); } catch (e) { out({ ok: false, error: e.message }, 1); }
out({ ok: true, trial: true, edits: plan.edits, next: `Run the verdict with --expect ${[...new Set(plan.edits.map((e) => e.file))].join(',')} to show the impact, then --keep or --undo.` });
