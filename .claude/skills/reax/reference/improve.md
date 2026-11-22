# improve

Turn the latest visual-test run and any review findings from this session into one prioritised list, written to `visual-report/improvements.md`.

## Steps

1. **Read the inputs**: `visual-report/report.md` and `run.json` (if missing, say so and offer `visual-test`), the review findings from this conversation, and open comments in `visual-report/comments.json` that are not resolved.
2. **Merge and de-duplicate.** One entry per underlying problem, even if it appears at four widths or in three stories.
3. **Rank** as follows, and say the rank in each entry:
   1. **Blocking**: axe serious or critical, a story that could not run, a clipped or unreachable control, a target under 24px.
   2. **Should fix**: text that ignores the 200% setting, sideways scroll at 320px, raw values that have a token, missing states, a baseline diff above the threshold that the visual review says is wrong.
   3. **Nice to have**: consistency, naming, extra stories.
   4. **Comments**: each open preview comment, quoted, with its selector and viewport.
4. **Write** `visual-report/improvements.md`: a one-line summary, then the list. Each entry: a short title, the component and file as `path:line` when known, what is wrong and where it was seen, the fix in one or two lines using tokens from `DESIGN.md`, and the rule it comes from. Also fill the "Improvements" placeholder in `report.md` with a link to the file.
5. **Tell the person** the top three in chat and where the file is. Offer to apply them one component at a time. Apply nothing unprompted.

Do not invent findings. Everything in the list traces to a report line, a review finding or a comment.
