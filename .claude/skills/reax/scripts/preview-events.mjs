#!/usr/bin/env node
// Follows the preview's events so an agent can be woken by each one (run it under a watcher such as Monitor).
// The preview helper writes every event, tagged with its run id, to visual-report/preview-events.jsonl; this prints
// each new one as a line of JSON with its line number, and exits after the "stopped" or "error" event.
//
//   node preview-events.mjs --root <project> --run <id>             from this run's first event (the id is in "ready")
//   node preview-events.mjs --root <project> --run <id> --from 7    from line 7: re-arm here after a watch expires,
//                                                                    passing the last line number you handled + 1
// With --run, an older preview's events still in the file are ignored until this run starts. If a newer preview has
// replaced this one, it prints {"event":"replaced"} and exits: start a new watch with the new run id.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from './lib/runtime.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root || process.cwd());
const file = path.join(root, 'visual-report', 'preview-events.jsonl');
let next = Math.max(1, Number(args.from) || 1); // the line number to print next
const want = args.run ? String(args.run) : null;
let seenOurs = next > 1; // re-armed: this run's events were in the file before
let locked = null; // without --run: the run being followed

function poll() {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return setTimeout(poll, 300); } // not started yet
  const lines = text.split('\n'); lines.pop(); // the last element is an unfinished line, or empty
  let first; try { first = lines.length ? JSON.parse(lines[0]) : null; } catch { first = null; }
  if (!first) return setTimeout(poll, 300);
  if (want) {
    if (first.run !== want) {
      if (seenOurs) { process.stdout.write(JSON.stringify({ event: 'replaced', run: first.run }) + '\n'); process.exit(0); }
      return setTimeout(poll, 300); // an older preview's file, not yet replaced by this run
    }
    seenOurs = true;
  } else if (locked !== first.run) {
    if (locked !== null) next = 1; // a new preview replaced the file
    locked = first.run;
  }
  for (; next <= lines.length; next++) {
    let e; try { e = JSON.parse(lines[next - 1]); } catch { continue; }
    process.stdout.write(JSON.stringify({ line: next, ...e }) + '\n');
    if (e.event === 'stopped' || e.event === 'error') process.exit(0);
  }
  setTimeout(poll, 300);
}
poll();
