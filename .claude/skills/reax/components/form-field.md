# Card: Form field

The wrapper that gives a control its label, hint and error. Every `input`, `textarea`, `select`, `checkbox group` and `radio group` sits in one. Also read `_rules.md`.

## Native first
`<label for>` plus the control, or `<fieldset>` with `<legend>` for a group of controls.

## Anatomy
`field` (root) > `label` (or `legend`), optional `required-mark`, optional `hint`, `control`, `error`.

## Props
```ts
interface FieldProps {
  label: React.ReactNode;                    // required
  /** Renders a fieldset and legend for a group of controls. */
  group?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Set once here: forwarded to the control. */
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';   // default 'vertical'; horizontal only from the tablet breakpoint up
  /** The control, or a render function that receives the wiring props. */
  children: React.ReactNode | ((control: { id: string; 'aria-describedby': string; 'aria-invalid': boolean; required?: boolean; disabled?: boolean }) => React.ReactNode);
}
```
The wrapper generates the `id`, wires label, hint and error to the control with `aria-describedby`, and sets `aria-invalid`.

## Variants
Single control, group (fieldset), horizontal.

## States, mapped to stories
default, with hint, required, error, disabled, group with legend, group error, long label, horizontal at 1280px and stacked at 390px, 200% text.

## MUST
- Label associated with the control. A required control has the `required` attribute and a visible marker explained in text ("required"), not only an asterisk.
- Error text is specific and says how to fix it. It is linked and announced when it appears (`role="alert"` or a polite live region), and not by colour alone.
- Validation runs on submit or blur, not on every keystroke.
- Related controls are grouped in a fieldset with a legend.

## Mobile
Stacked. Label above the control. Horizontal layout only when there is room.

## Review checks
1. Control without an associated label. 2. Error not linked with `aria-describedby`. 3. Required shown by asterisk only. 4. `disabled` or `required` set on the control but not the wrapper. 5. Error appears on every keystroke. 6. A radio or checkbox group without a legend.
