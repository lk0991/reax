#!/usr/bin/env node
// Follows the preview's events so an agent can be woken by each one (run it under a watcher such as Monitor).
// The preview helper appends every event to visual-report/preview-events.jsonl; this prints each new one as a
// line of JSON with its line number, and exits after the "stopped" or "error" event.
//
//   node preview-events.mjs --root <project>             from the first event
//   node preview-events.mjs --root <project> --from 7    from line 7: re-arm here after a watch expires,
//                                                         passing the last line number you handled + 1
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './lib/runtime.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root || process.cwd());
const file = path.join(root, 'visual-report', 'preview-events.jsonl');
let next = Math.max(1, Number(args.from) || 1); // the line number to print next
let size = 0;

function poll() {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return setTimeout(poll, 300); } // not started yet
  if (text.length < size) next = 1; // a new preview replaced the file
  size = text.length;
  const lines = text.split('\n'); lines.pop(); // the last element is an unfinished line, or empty
  for (; next <= lines.length; next++) {
    let e; try { e = JSON.parse(lines[next - 1]); } catch { continue; }
    process.stdout.write(JSON.stringify({ line: next, ...e }) + '\n');
    if (e.event === 'stopped' || e.event === 'error') process.exit(0);
  }
  setTimeout(poll, 300);
}
poll();
