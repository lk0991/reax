# Card: Dialog (PROTOTYPE, for ticket #11)

Loaded by `from-text`, `from-figma` and `review` only when a dialog is involved. Names come from the project's `DESIGN.md`; this card fixes structure and behaviour. Defaults refer to `defaults-proposal.md`.

## Native first
Use `<dialog>` opened with `showModal()` (background becomes inert, Esc closes, `::backdrop` styleable). Fall back to an ARIA dialog only if the project cannot use it.

## Anatomy
`Dialog` (root) > `DialogHeader` with `DialogTitle` (required), optional `DialogDescription`, `DialogBody` (scrolls), `DialogFooter` (actions), `DialogClose` (visible button).

## Props
```ts
interface DialogProps {
  /** Controlled open state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required. Becomes the accessible name. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** `alertdialog` for confirmations that need a response. */
  role?: 'dialog' | 'alertdialog';      // default 'dialog'
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'; // names from DESIGN.md; fullscreen below the mobile breakpoint
  /** Opt-in. Never true for alertdialog. */
  dismissOnOutsideClick?: boolean;      // default false
  showCloseButton?: boolean;            // default true
  /** Element to focus on open. alertdialog: the least destructive action. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}
```

## Variants
dialog, alertdialog. Side sheet or drawer is its own card.

## States, mapped to stories
closed, open, open with long scrolling body, alertdialog (destructive), fullscreen at 390×844, open at 200% text, open at 320px reflow. Add an axe check on every open story.

## MUST (accessibility)
- Accessible name from the title (`aria-labelledby`); description via `aria-describedby` when present.
- `aria-modal="true"` only while the page behind is inert.
- On open, focus moves inside; Tab wraps; on close, focus returns to the trigger.
- Esc closes. A visible close button exists.
- Body scroll is locked behind it; long content scrolls inside the dialog.
- All controls at least 24×24 CSS px.

## Mobile
Fullscreen below the mobile breakpoint. Footer actions stack, primary action first in reading order. No horizontal scroll at 320px.

## Review checks
1. No accessible name (the title was omitted or not rendered).
2. No visible close button.
3. Outside click closes a dialog that contains a form or an alertdialog.
4. Focus not returned to the trigger.
5. `aria-modal` set while content behind stays reachable.
6. Footer or body overflows horizontally at 320px or 200% text.

## Sources
APG dialog-modal and alertdialog; MDN `<dialog>`; Radix Dialog; React Aria Modal; Chakra Dialog. Details and URLs in `research/component-anatomy.md` (Modal / dialog) and `research/component-gallery.md` (Modal, Drawer).
