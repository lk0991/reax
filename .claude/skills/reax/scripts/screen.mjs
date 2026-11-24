#!/usr/bin/env node
// Plan a screen from the project's components (spec #46).
//   node screen.mjs plan --root <project> --plan screen.json
//   screen.json: { "name": "Today", "parts": [ { "name": "Sightings list", "purpose": "...", "component": "Card" }, ... ] }
// Prints each part matched to a component in the inventory or marked as a gap, the gap list (components to build
// first), and where the screen goes (the screens directory, shaped like a component folder).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, findUp } from './lib/runtime.mjs';
import { loadDesign } from './lib/design.mjs';
import { planScreen, screensDir } from './lib/screens.mjs';

const args = parseArgs(process.argv.slice(2));
const [cmd] = args._;
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
const out = (o, code = 0) => { console.log(JSON.stringify(o, null, 2)); process.exit(code); };

if (cmd !== 'plan' || !args.plan) out({ ok: false, error: 'Usage: screen.mjs plan --root <project> --plan screen.json' }, 1);
let spec;
try { spec = JSON.parse(fs.readFileSync(args.plan, 'utf8')); } catch (e) { out({ ok: false, error: `--plan must be a JSON file: ${e.message}` }, 1); }
if (!Array.isArray(spec.parts) || !spec.parts.length) out({ ok: false, error: 'The plan needs a "parts" list.' }, 1);
const design = loadDesign(root, { root });
if (!design.exists.design) out({ ok: false, error: 'DESIGN.md does not exist. Run direction or init first.' }, 1);
const plan = planScreen(spec.parts, design);
const name = String(spec.name || 'Screen').replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^./, (c) => c.toUpperCase());
const dir = screensDir(design.sidecar || {});
out({ ok: true, screen: name, folder: `${dir}/${name}`, storyTitle: `Screens/${name}`, states: ['Loaded', 'Empty', 'Loading', 'Error', 'LongContent'], ...plan, ready: plan.gaps.length === 0 });
