#!/usr/bin/env node
// Learns how the project writes components (layout, names, declarations, styling, props, stories) and prints it as
// JSON for init: each convention with how many components follow it, examples and exceptions, or "mixed" with the
// options and the newest one recommended. It reads only; init writes COMPONENTS.md from it.
//   node conventions.mjs --root <project> [--dir src/components]
//   node conventions.mjs --root <project> --check [--component Button,Card]
//       for review: where components break the conventions COMPONENTS.md recorded (all components, or the named ones)
// The directory defaults to the one init recorded (scan.componentsDir in .reax/design.json).
import path from 'node:path';
import { parseArgs, readJson, findUp } from './lib/runtime.mjs';
import { analyzeComponents, collectFiles, deviations } from './lib/conventions.mjs';

const args = parseArgs(process.argv.slice(2));
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
const sidecar = readJson(path.join(root, '.reax', 'design.json'), {}) || {};
const dir = args.dir || sidecar.conventions?.componentsDir || sidecar.scan?.componentsDir;
if (!dir) { console.log(JSON.stringify({ ok: false, error: 'No components directory: pass --dir, or run init first so it is recorded.' }, null, 2)); process.exit(1); }
const result = analyzeComponents(collectFiles(root, dir), { componentsDir: dir });
if (args.check) {
  if (!sidecar.conventions) { console.log(JSON.stringify({ ok: false, error: 'No component conventions are recorded. Run init to learn them and write COMPONENTS.md.' }, null, 2)); process.exit(1); }
  const only = args.component ? String(args.component).split(',').map((s) => s.trim()) : null;
  const found = deviations(sidecar.conventions, result, only);
  const names = only || result.components.map((c) => c.name);
  console.log(JSON.stringify({ ok: true, checked: names, deviations: found, note: 'Conventions are not Requirements: each deviation is "should fix" at most. Read COMPONENTS.md Notes before reporting one.' }, null, 2));
  process.exit(0);
}
const mixed = [];
for (const group of ['layout', 'code', 'styling', 'props', 'stories']) for (const [k, c] of Object.entries(result[group] || {})) if (c?.status === 'mixed') mixed.push(`${group}.${k}`);
console.log(JSON.stringify({ ok: true, mixed, ...result }, null, 2));
