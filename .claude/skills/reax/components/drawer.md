# Card: Drawer

A panel that slides in from an edge of the screen (side sheet, bottom sheet), modal or not. A centred modal is a `dialog`. Also read `_rules.md` and `dialog.md`: a modal drawer is a dialog and meets all of its requirements.

## Native first
A modal drawer is a `<dialog>` opened with `showModal()`, positioned at an edge. A non-modal drawer is a landmark region (`aside` or `section` with a name) that a button shows and hides, with `aria-expanded` on that button.

## Anatomy
`drawer` (root) > `header` with `title` and `close`, `body` (scrolls), optional `footer`.

## Props
```ts
interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;                    // required, becomes the name
  side?: 'start' | 'end' | 'bottom';         // default 'end'; bottom on phones
  modal?: boolean;                           // default true
  children: React.ReactNode;
}
```

## Variants
Modal side drawer, non-modal side panel, bottom sheet.

## States, mapped to stories
closed, open (modal), open (non-modal) beside content, long scrolling body, bottom sheet at 390×844, 320px, 200% text.

## Requirements
- Modal: everything in `dialog.md`'s Requirements (name, focus in, focus return, keyboard close, inert background).
- Non-modal: the panel is a named region; the button that opens it exposes `aria-expanded` (4.1.2, 1.3.1); focus is not trapped (2.1.2).
- Content reflows at 320px and scrolls inside the drawer (1.4.10).

## Defaults
- Esc closes a modal drawer. The slide respects `prefers-reduced-motion`.
- A bottom sheet below the mobile breakpoint; a side drawer above it.
- A swipe to close is extra, never the only way.


## Keyboard checks
Run by `visual-test`, besides the shared checks: the dialog card's `dialog-focus-in`, `dialog-esc` and `dialog-focus-return`. They apply when the story opens a modal drawer; a non-modal panel shows them as not applicable.

## Mobile
Bottom sheet or full width. The close control stays reachable at 200% text.

## Review checks
1. Modal drawer without focus return. 2. Background reachable behind a modal drawer. 3. Only swipe closes it. 4. Content cut off at 320px. 5. Non-modal panel with a focus trap.
