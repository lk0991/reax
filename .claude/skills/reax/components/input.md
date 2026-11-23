# Card: Input

Single-line text entry. Also read `_rules.md` and `form-field.md` (an input always sits in a field).

## Native first
`<input>` with the right `type`, `inputMode` and `autoComplete`.

## Anatomy
`field` (wrapper) > `label`, optional `hint`, `control` (the input, optional `prefix`/`suffix`), `error`.

## Props
```ts
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Required. Visible text label. */
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message. Sets aria-invalid and links the message. */
  error?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';          // default 'md'
  hideLabel?: boolean;                // visually hidden, still present
}
```
`disabled` and `required` are forwarded from the field wrapper when one is used.

## Variants
type: text, email, password, number, search, tel, url. Prefix or suffix add-ons.

## States, mapped to stories
default, with hint, focus, filled, error, disabled, read-only, required, long value, long label, narrow width at 320px, 200% text.

## Requirements
- Visible label associated with `for` and `id`; a placeholder is never the label (1.3.1, 3.3.2).
- On error, `aria-invalid="true"`, and the error and hint are linked with `aria-describedby` (3.3.1, 1.3.1).
- A `pattern` or required format is explained in the hint (3.3.2).
- Fields for personal data have the right `autoComplete` (1.3.5).
- Zoom is never suppressed through the viewport (1.4.4).

## Defaults
- The control fills the field width (`width: 100%; min-width: 0`) so it never overflows a narrow container.
- Text size at least 1rem, so mobile browsers do not zoom on focus.
- No autofocus on mobile.

## Mobile
Right keyboard through `inputMode` and `type`. Control height at least 24px, 44px if `DESIGN.md` says so.

## Review checks
1. No associated label. 2. Placeholder used as label. 3. Error not linked. 4. Control wider than its container at 320px or 200% text. 5. `outline: none` on focus. 6. Wrong `type` for the data.
