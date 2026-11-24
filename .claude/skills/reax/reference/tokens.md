# tokens

Change the value of one or more tokens ("make the primary a little warmer", "rounder corners") and show the person every component it affects before anything is kept. For someone who owns the design system but does not edit code.

## Steps

1. **Load the design** (SKILL.md rule 1). Every token to change must be in `DESIGN.md` with a recorded place in a token file; if one is not, say so and offer `init`.
2. **Turn the words into values.** Read the current values (`design.mjs tokens`) and propose concrete new ones that do what was asked, in plain words: "primary from #1f4f9a to #2d6a4f, a greener, slightly lighter blue". Change only the tokens the request is about. A request touching several tokens is one proposal.
3. **Check them:** `node scripts/token-change.mjs --root <project> --set <path>=<value>[,<path>=<value>]`. A value that would newly break a contrast pair is refused, with the pair, the WCAG criterion and the nearest value that passes. Tell the person in plain words and propose the nearest value instead. Never write a refused value.
4. **Try it:** run the same command with `--try`. It writes the change (token file at the recorded line, then the value in `DESIGN.md`, then the sidecar) and keeps a backup.
5. **Show the impact:** run the [verdict](verdict.md) with `--expect <token file>`. A token file applies everywhere, so every story is tested, and the verdict page shows the before and after of every component that changed. Report the level and what changed, and publish the page when the person cannot open local files.
6. **Ask the person to keep it or not.** Kept: `token-change.mjs --keep`, then offer to approve the new screenshots ([visual-test](visual-test.md), Baselines). Not kept: `token-change.mjs --undo`, which restores every file exactly. Never leave a trial open at the end of a turn.

If the verdict is Blocked by problems that were there before the change, say so plainly: the token change did not cause them, but they stay open.

The Preview's Edit mode does not change token values; it swaps which token a part uses. A value change always goes through this flow.
