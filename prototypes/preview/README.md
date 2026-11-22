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
- **Anatomy**: parts (slots from `data-slot`), props (types and current values), tokens (matched back to the token tables), accessibility (role, name, size against the 24px floor, focus order).
- **Edit**: change text, intent, and token-based padding, radius, text size, colours, height and width as a live draft. Accessibility problems appear as you edit; Apply needs an explicit acceptance, and an accepted exception is saved as a comment.

## Faked or missing, on purpose

- Rendering is a hand-built dialog and a plain script. The real build renders the project's `*.stories.tsx` with Storybook's `composeStories` (exported by `@storybook/react`, checked on 10.6.8).
- The comment crop is a placeholder string. The real build saves a cropped screenshot.
- "Send to Claude" only sets a flag. The real build wakes Claude when `comments.json` changes.
- Apply sends a change set to a file. Claude writing it to code is not built.
- Resizing a selected element's container is not built; only the frame resizes.
- Token tables are hard-coded. The real build reads them from `DESIGN.md`.

## Files

- `index.html`, `server.mjs`: the prototype
- `screenshots/`: one run through each mode
- `visual-report/`: the data from that run
