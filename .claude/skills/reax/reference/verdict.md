# verdict

Answer, for a change to components, "can this merge without a developer reviewing it?", in words a person who does not read code can trust. Every command that changes a component ends with it; run it on its own when someone asks whether a change can merge.

## Run

```
node scripts/verdict.mjs --root <project> [--component Button,Card] [--expect <file>,<file>]
```

It gathers the evidence for the change (on this branch since its base, plus uncommitted): the project's type check, the visual test of the changed components (all stories when a style that applies everywhere changed), and the scope of the change: changed files, added or changed dependencies, files outside the components, and global styles. Pass `--expect` with the files outside the components the change was meant to touch (a token change's token file), so they do not count as surprises. It writes `visual-report/verdict/evidence.json` and the page `visual-report/verdict/index.html`, and prints the level.

## The independent reviewer

The verdict can only be **Ready to merge** when a reviewer that did not write the code agrees. After the first run:

1. Run the verdict again with `--packet`. It writes `visual-report/verdict/review-packet.md`: the diff, the files to read (COMPONENTS.md, DESIGN.md, the component cards), the evidence, the screenshots of the changed stories, and the exact answer format.
2. Start a **fresh agent with no conversation history** (in Claude Code, the Agent tool with a new general-purpose agent, never a fork of this conversation). Its whole prompt: "Read `<project>/visual-report/verdict/review-packet.md` and do exactly what it says. Work in `<project>`." Do not add your own view of the change: the reviewer must not inherit how you see it.
3. When it finishes, check that `visual-report/verdict/reviewer.json` exists and has the packet's `diffHash`, then run the verdict again. Its answer counts only for that exact change: edit anything and it must review again.

If this session cannot start a separate agent, write `{ "diffHash": "<hash>", "status": "not-run", "reason": "This session cannot start a separate agent." }` to that file. The verdict then stays at Ready with gaps at best, and says why. Never review the change yourself and record it as the independent reviewer.

## The four levels

- **Ready to merge:** every check ran and passed, and an independent reviewer agrees. The only level that means no developer review is needed.
- **Ready with gaps:** nothing failed, but named checks could not run. Never call this ready to merge; name what was not checked.
- **Needs work:** nothing is broken, but something should be fixed first: a problem the visual test found, a scope surprise, a review or reviewer concern.
- **Blocked:** a Requirement fails, a story fails, or the type check or lint fails.

## Report it

Lead with the level and the one-line headline, in plain words. Then what must be fixed, what should be fixed and what was not checked, a line each. Then where the page is: locally, the file; in a cloud session, publish `visual-report/verdict/index.html` as a private Artifact (it has no other files). Never describe a level the command did not print.

On **Blocked** or **Needs work**, say what you will do about each item and, when the change is yours to make, fix it, run the verdict and the reviewer again, at most two rounds, before asking the person. After two rounds, report what is still open, item by item, and stop. Never change a check, a Baseline or a threshold to get a better level.
