#!/usr/bin/env node
// Learns how the project writes components (layout, names, declarations, styling, props, stories) and prints it as
// JSON for init: each convention with how many components follow it, examples and exceptions, or "mixed" with the
// options and the newest one recommended. It reads only; init writes COMPONENTS.md from it.
//   node conventions.mjs --root <project> [--dir src/components]
// The directory defaults to the one init recorded (scan.componentsDir in .reax/design.json).
import path from 'node:path';
import { parseArgs, readJson, findUp } from './lib/runtime.mjs';
import { analyzeComponents, collectFiles } from './lib/conventions.mjs';

const args = parseArgs(process.argv.slice(2));
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
const dir = args.dir || readJson(path.join(root, '.reax', 'design.json'), {})?.scan?.componentsDir;
if (!dir) { console.log(JSON.stringify({ ok: false, error: 'No components directory: pass --dir, or run init first so it is recorded.' }, null, 2)); process.exit(1); }
const result = analyzeComponents(collectFiles(root, dir), { componentsDir: dir });
const mixed = [];
for (const group of ['layout', 'code', 'styling', 'props', 'stories']) for (const [k, c] of Object.entries(result[group] || {})) if (c?.status === 'mixed') mixed.push(`${group}.${k}`);
console.log(JSON.stringify({ ok: true, mixed, ...result }, null, 2));
