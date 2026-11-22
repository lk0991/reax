# reax live preview (PROTOTYPE, ticket #14)

Throwaway. Answers one question: does the preview described in ticket #13 feel right to use?

## Run

```
node prototypes/preview/server.mjs
```

Open the URL it prints (it contains a random token). The helper binds `127.0.0.1` only, rejects other Host headers, and writes to `prototypes/preview/visual-report/`:

- `comments.json`: comments and accepted exceptions
- `viewports.json`: widths pinned for automated captures
- `applied-edits.json`: structured change sets from edit mode

Opened straight from disk, or hosted without the helper, the page falls back to an in-memory store and says so.

## Modes

- **Test**: use the component. Resize the frame by dragging the purple handle, use the width presets, 200% text, or the other story. "Find narrowest working width" walks the width down in 10px steps until the first clip or undersized target, reports it, and offers to pin the last working width.
- **Comment**: hover and click an element, write a comment, save, or save and send to Claude. Pins show where comments sit. Statuses: open, addressed, resolved (only the user resolves; "Simulate: Claude addressed it" stands in for the agent).
- **Anatomy**: four views under a card for the selected part. **Parts**: numbered in the margins beside the frame, each joined to its element by a dotted leader. **Props**: types and current values. **Tokens**: what the part takes from tokens, and what it does not (browser default, raw value, from layout). **Accessibility**: role, name, size against the 24px floor, tab order. Rows are buttons: pick a part from a row, from its number or on the frame, and hovering a row lights up its number and part.
- **Edit**: change text, intent, and token-based padding, radius, text size, colours, height and width as a live draft. Accessibility problems appear as you edit; Apply needs an explicit acceptance, and an accepted exception is saved as a comment.

## After the design critique (22/40, then a polish pass)

- The frame fits the screen (shown at a percentage, sizes stay real pixels), the rail is a bottom sheet on phones, and the viewport controls collapse behind one summary row.
- Edit keeps focus while typing, shows what a value really is (a token, or "no token"), and a Draft strip above the frame stays visible in every mode, with Show original and Discard. The sweep says when it ran on a draft and states its rule.
- Selection stays when you switch mode, with a solid outline, a mode chip, pins offset off the element, and list-to-pin highlighting. Anatomy parts are numbered in the margins beside the frame, each joined to its element by a dotted leader line, on the side nearest the element, so nothing is drawn on the component itself.
- Keys 1 to 4 switch mode, Esc deselects, the handle resizes with the arrow keys, and there is a width field. Comments can be removed and widths unpinned.
- Known detector note: the nested-cards warning is the small bordered buttons inside a comment card or the selected-part card ("Deselect"); judged a false positive and left as is.

## After the Anatomy critique (25/40, then five steps)

1. **Leaders**: elbow-routed from each number to the element's outer edge. A part picks the margin on its nearer side unless another part with text is in the way. No line crosses another or passes through text at 320, 390, 768 or 1280px, with either story and at 100% or 200% text (32 combinations checked).
2. **Tables to stacked rows** (Props, Accessibility), a 40% phone sheet in Anatomy, a one-line demo banner on phones, 40px controls on touch.
3. **Selection in step**: the selected-part card sits above the tabs in every view, rows are clickable and hover-linked, numbers are clickable, and the frame keeps its position across views.
4. **Hardening**: parts the frame cuts off are tagged, with "Grow frame to fit"; no floor on the display scale (a 1280 frame no longer overflows a phone), and below 30% the numbers are not drawn; proper tab semantics with arrow keys; the resize drag survives a second finger, `pointercancel`, lost capture and window blur; long unbroken names, emoji, Arabic and CJK do not overflow.
5. **Clearer copy**: Tokens split into "From tokens" and "Not from tokens" with a reason for each; "(sides differ)", "no role", and notes that explain the 24px floor and tab order.

## Faked or missing, on purpose

- Rendering is a hand-built dialog and a plain script. The real build renders the project's `*.stories.tsx` with Storybook's `composeStories` (exported by `@storybook/react`, checked on 10.6.8).
- The comment crop is a placeholder string. The real build saves a cropped screenshot.
- "Send to Claude" only sets a flag. The real build wakes Claude when `comments.json` changes.
- Apply sends a change set to a file. Claude writing it to code is not built.
- Resizing a selected element's container is not built; only the frame resizes.
- Token tables are hard-coded. The real build reads them from `DESIGN.md`.

## Files

- `index.html`, `server.mjs`: the prototype
- `screenshots/`: the final build at 320, 390, 768 and 1280px: every Anatomy view, the cut-off case, Comment, Edit with a warning, and the phone
- `visual-report/`: empty data files (the helper writes here)
