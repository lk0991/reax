# Card: Textarea

Multi-line text entry. Same rules as `input.md`; differences only below.

## Native first
`<textarea>`.

## Anatomy
`field` > `label`, optional `hint`, `control`, optional `counter`, `error`.

## Props
```ts
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Minimum visible rows. */
  rows?: number;                      // default 3
  /** Grows with content up to maxRows. */
  autoGrow?: boolean;
  maxLength?: number;
  hideLabel?: boolean;
}
```

## Variants
Fixed rows, auto-grow.

## States, mapped to stories
default, with hint, filled, long text that scrolls, error, disabled, read-only, with counter at the limit, 320px, 200% text.

## Requirements
- Everything in `input.md`'s Requirements.
- A character counter is announced as a polite live region (4.1.3).

## Defaults
- Everything in `input.md`'s Defaults.
- Resize only vertically (`resize: vertical`), never horizontally.
- The counter updates after typing pauses, not on every key. Typing is not blocked at the limit without telling the user.

## Mobile
Rows default to 3 so the keyboard does not hide the label. Auto-grow stops at a max height and then scrolls.

## Review checks
1. Everything in `input.md`. 2. Horizontal resize allowed. 3. Counter announced on every keystroke. 4. Text clipped without scroll.
