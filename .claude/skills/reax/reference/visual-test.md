# visual-test

Run the visual and accessibility tests on Storybook stories, review the screenshots, report, and optionally open the live preview. The script does the measuring. You do the looking.

## Before you run

1. Storybook must be installed and 8 or newer. If not, offer the [storybook](storybook.md) command.
2. `node scripts/setup.mjs --check` from the skill folder. If dependencies are missing, ask, then `--install` (they go into `~/.cache/reax`). If no browser is found, ask, then `--install-browser`.
3. Make sure `visual-report/` is in the project's `.gitignore`.

## Run

```
node scripts/visual-test.mjs --root <project> [--component Button,Input | --all]
```

By default it tests the components changed on this branch since it left the base branch (the remote's default branch, or `main` or `master`; set `baseBranch` in `.reax/visual-test.json` to choose), plus uncommitted changes. With no base branch it uses uncommitted changes only and says so. `--component` names them, `--all` runs every story, a story tagged `reax-skip` is left out. It builds Storybook statically into a temp folder (rebuilding only when sources changed), waits for each story's `play` function, puts tagged stories into their hover, pressed or focus state, takes four captures per story (390×844, 1280×800, 320px reflow, 390 wide with 200% text), runs axe on each, runs the keyboard and focus checks the component's card names (once per story, see `_rules.md` and the card's "Keyboard checks"), and compares with baselines in `.reax/baselines/`. Widths pinned in the preview are added. Optional settings are in `.reax/visual-test.json` (below).

The script prints a JSON summary and writes `visual-report/report.md` and `run.json`. Exit code 1 means blocking axe findings (serious, critical), a failed keyboard check, a story that could not run, or a failed run. Warnings (sideways scroll, text that ignores 200%, a baseline diff over 0.1%, an unstable capture) do not fail the run. A first run with no baselines fails nothing. A run whose scope has no stories prints `"result": "nothing-tested"`: report that nothing was tested, never that it passed, and offer `--all` or `--component`.

If the run could not start (build failed, no stories), report Storybook's last lines. Do not retry in a loop.

### Settings

`.reax/visual-test.json` is optional. Every key is optional and falls back to its default. The preview reads the same file.

| Key | Default | What it does |
| --- | --- | --- |
| `viewports` | 390×844, 1280×800, 320×640, 390×844 at 200% text | The captures per story: `{ name, width, height, textScale? }`. Replacing it drops the defaults. |
| `diffThreshold` | `0.001` | Share of pixels that may differ from the baseline before a capture counts as changed. |
| `axe.tags` | `wcag2a`, `wcag2aa`, `wcag22aa`, `best-practice` | The axe-core rule tags to run. |
| `axe.disabledRules` | none | Rules switched off: `[{ id, reason }]`. The reason is printed in the report. |
| `axe.blockingImpacts` | `serious`, `critical` | Impacts that fail the run. |
| `skipTag` | `reax-skip` | Stories with this tag are left out. |
| `baseBranch` | the remote's default, else `main` or `master` | The branch the default scope compares with. |
| `keyboard` | `true` | Run the keyboard and focus checks. `false` skips them, and the report says so. |
| `concurrency` | `4` | Captures taken in parallel. |
| `storyTimeoutMs` | `30000` | How long a story may take to render. |
| `stabilityAttempts` | `3` | Tries for a screenshot that matches itself. |
| `storybook.command` | the installed Storybook binary, run with Node | The command that runs the Storybook CLI, without a subcommand (for example `pnpm exec storybook`). The scripts add `build` or `dev`. Set it only when the binary cannot be found (Yarn Plug'n'Play). The old `storybook.buildCommand` is refused. |
| `preview.startTimeoutMs` | `90000` | How long the preview waits for `storybook dev`. |

The scripts never run a package.json script named `storybook`, so it does not matter what that script does.

## Visual review (you)

The report has a placeholder `<!-- reax:visual-review -->`. Fill it in after reading **every story's screenshots** (`visual-report/screenshots/<story-id>/<viewport>.png`). Look at them. Do not write the review from the axe table.

For each component write three groups, each finding with the story and width it was seen at:

- **Blocking**: clipped or hidden content, controls out of reach or overlapping, text unreadable, contrast clearly failing, layout broken at 320px or 200% text.
- **Should fix**: spacing off the tokens, misalignment, inconsistent with `DESIGN.md` or the card, awkward wrapping, weak focus or state styling, differences from the design (for `from-figma`).
- **Looks right**: one line on what you checked and found fine.

Check against `DESIGN.md` and the component's card. Automated overflow checks miss clipping, so judge it by eye. Replace the placeholder text with your review, keeping the comment markers. Read diffs (`visual-report/diffs/`) for any capture that changed from its baseline and say whether the change is intended.

## Report to the person

In chat: the counts (failures, warnings, passes), the blocking items in a line each, the path to `visual-report/report.md`, and that the screenshots are there to confirm. Then offer `improve`.

## Baselines

Baselines are approved by a person, after the visual review passes:

```
node scripts/visual-test.mjs --root <project> --approve [all|<story-id>|Component]
```

Ask first. Never approve on your own, and never to make a run go green. The script refuses stories with blocking findings. `--force` overrides that, and only on the person's explicit say-so. Tell them to commit `.reax/baselines/`.

## Preview

```
node scripts/visual-test.mjs --root <project> --preview [--component Name]
```

Opens on the component just built or changed. Offer it after the run. To start it:

1. Run the command as a **background command**. It prints one JSON object per line on stdout (`ready` first, with `url`, then `comment` and `apply` events, and `stopped` when it exits), and appends the same lines to `visual-report/preview-events.jsonl`. Everything else is on stderr.
2. Once `ready` is out, **watch the events so each one wakes you**, without the person having to type. With a watcher tool (Monitor in Claude Code), watch `node scripts/preview-events.mjs --root <project>`: each event arrives as one line with its `line` number, and the command ends after `stopped`. A watch expires (Monitor: at most 30 minutes); when it does, re-arm it with `--from <last line you handled + 1>`, so nothing is missed or repeated. Without a watcher tool, tell the person to say "check the preview" in chat after sending, and then read the events file from the last line you handled.
3. Give the person the `url` from the `ready` line. It is on 127.0.0.1, with a token in the address. If the person's browser is not on this machine, see "When the person cannot reach this machine" below.
4. It reuses a running Storybook if you pass `--storybook-url <url>`. On failure it prints Storybook's last 20 lines and exits.
5. Tell the person the four modes in a line: **Test** (use the component, resize, 200% text, "Find narrowest width"), **Comment** (click an element, write a note, "Save and send to Claude"), **Anatomy** (numbered parts, props, tokens, accessibility), **Edit** (change text and token values as a draft, then Apply).
6. When you stop, stop the background command so Storybook's process group exits. The helper writes `stopped`, which ends the watch.

### Handling events

- **`comment`**: `{id, text, story, selector, role, name, viewport, textScale, box, crop}`. Read the cropped screenshot at `crop` (a path in the project, may be null). Find the component from the story id, then the part from the `data-slot` selector. Answer in chat what you will change, make the change only if the person's comment asks for one, and when done set the comment to `addressed` by editing `visual-report/comments.json` (`"status": "addressed"`). Never set `resolved`: only the person does.
- **`apply`**: `{id, story, changes: [{selector, property, from, to}], warnings, acceptedExceptions}`. Each change is a token swap or a text change on a part. Edit mode swaps which token a part uses, or changes a part's text. It never changes a token's value. Write the swap into the component's styles: change the CSS rule for that slot to the new token, by its real name from `design.mjs load`, not an inline style. Write a text change into the story's args, or the component's default text if that is where it lives. If the person asks to change a token's *value* instead, that is a change to the project's token source file (`tokenSources` gives file and line), followed by `init` to refresh `DESIGN.md`; ask first.

  If `acceptedExceptions` is true, the person saw the listed accessibility warnings and accepted them. This is the only way a Requirement can be overridden. Make the change, add a code comment beside it naming the rule it breaks and that the person accepted it, and say in chat which rule it breaks. The preview records each one as an accepted exception in `comments.json`; `improve` lists them, so they stay visible. If `acceptedExceptions` is false and warnings are present, do not make the changes that cause them: say which and why.

  Then tell the person to look at the preview (Storybook hot-reloads).

Comments and applied edits are saved in `visual-report/comments.json` and `applied-edits.json`, so nothing is lost if the helper stops.
