# verdict

Answer, for a change to components, "can this merge without a developer reviewing it?", in words a person who does not read code can trust. Every command that changes a component ends with it; run it on its own when someone asks whether a change can merge.

## Run

```
node scripts/verdict.mjs --root <project> [--component Button,Card] [--expect <file>,<file>]
```

It gathers the evidence for the change (on this branch since its base, plus uncommitted): the project's type check, the visual test of the changed components (all stories when a style that applies everywhere changed), and the scope of the change: changed files, added or changed dependencies, files outside the components, and global styles. Pass `--expect` with the files outside the components the change was meant to touch (a token change's token file), so they do not count as surprises. It writes `visual-report/verdict/evidence.json` and the page `visual-report/verdict/index.html`, and prints the level.

## The four levels

- **Ready to merge:** every check ran and passed, and an independent reviewer agrees. The only level that means no developer review is needed.
- **Ready with gaps:** nothing failed, but named checks could not run. Never call this ready to merge; name what was not checked.
- **Needs work:** nothing is broken, but something should be fixed first: a problem the visual test found, a scope surprise, a review or reviewer concern.
- **Blocked:** a Requirement fails, a story fails, or the type check or lint fails.

## Report it

Lead with the level and the one-line headline, in plain words. Then what must be fixed, what should be fixed and what was not checked, a line each. Then where the page is: locally, the file; in a cloud session, publish `visual-report/verdict/index.html` as a private Artifact (it has no other files). Never describe a level the command did not print.

On **Blocked** or **Needs work**, say what you will do about each item and, when the change is yours to make, fix it and run the verdict again, at most two rounds, before asking the person. Never change a check, a Baseline or a threshold to get a better level.
