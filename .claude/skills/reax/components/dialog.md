# Card: Dialog

Loaded when a dialog, modal, popup or confirmation is involved. Names come from `DESIGN.md`; this card fixes structure and behaviour. Also read `_rules.md`.

## Native first
`<dialog>` opened with `showModal()`: the background becomes inert, Esc closes, `::backdrop` is styleable. Use an ARIA dialog only if the project cannot.

## Anatomy
`dialog` (root) > `header` with `title` (required) and `close`, optional `description`, `body` (scrolls), `footer` (`action` buttons).

## Props
```ts
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required. Becomes the accessible name. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** `alertdialog` for a confirmation that needs a response. */
  role?: 'dialog' | 'alertdialog';           // default 'dialog'
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';  // fullscreen below the mobile breakpoint
  /** Opt-in. Never true for alertdialog or a dialog with a form. */
  dismissOnOutsideClick?: boolean;           // default false
  showCloseButton?: boolean;                 // default true
  /** Element to focus on open. alertdialog: the least destructive action. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}
```

## Variants
dialog, alertdialog. A side sheet or drawer is a different component.

## States, mapped to stories
closed, open, open with long scrolling body, alertdialog (destructive), fullscreen at 390×844, open at 200% text, open at 320px. An axe check on every open story.

## Requirements
- Accessible name from the title (`aria-labelledby`); `aria-describedby` for the description (4.1.2).
- Focus moves inside on open and returns to the trigger on close (2.4.3).
- It can be closed with the keyboard: a visible close button with an accessible name (2.1.1, 4.1.2).
- `aria-modal="true"` only while the page behind is inert (1.3.1).
- Long content scrolls inside the dialog; nothing scrolls sideways at 320px (1.4.10).
- All controls at least 24×24 px (2.5.8).

## Defaults
- Esc closes (native with `showModal()`).
- Tab wraps inside the dialog. A native `<dialog>` lets focus move on to the browser's own controls; that is acceptable, and a custom focus trap is only added if the project asks.
- Page scroll is locked behind it.


## Keyboard checks
Run by `visual-test` on every dialog story, besides the shared checks in `_rules.md`. The trigger is the element marked `data-reax-target` or `data-slot="trigger"`, or the first button outside the dialog.
- `dialog-focus-in`: Enter on the trigger opens the dialog and focus moves inside (2.4.3).
- `dialog-esc`: Esc closes it (a Default: only warns).
- `dialog-focus-return`: after closing, focus is back on the trigger (2.4.3).

## Mobile
Fullscreen below the mobile breakpoint. Footer actions stack, primary first in reading order. No sideways scroll at 320px.

## Review checks
1. No accessible name. 2. No visible close button, or it has no name. 3. Outside click closes a form or alert dialog. 4. Focus not returned to the trigger. 5. `aria-modal` set while the content behind stays reachable. 6. Footer or body overflows sideways at 320px or 200% text. 7. Title and body sized in `px`.
