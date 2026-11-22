# Card: Checkbox

Also read `_rules.md`. A group of checkboxes sits in a `fieldset` (see `form-field.md`).

## Native first
`<input type="checkbox">` with a `<label>`. Style the native input (`appearance`, `accent-color`) or draw the box in CSS on top of it. Do not replace it with a `div`.

## Anatomy
`checkbox` (label row, root) > `control` (the input), `box` (drawn mark), `label`, optional `hint`.

## Props
```ts
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Mixed state. Set on the element, since `indeterminate` is a property, not an attribute. */
  indeterminate?: boolean;
  error?: React.ReactNode;
}
```
Controlled with `checked` and `onChange`, or uncontrolled with `defaultChecked`.

## Variants
Single, group, tri-state ("select all").

## States, mapped to stories
unchecked, checked, indeterminate, disabled (both values), error, focus-visible, long label that wraps, group in a fieldset, 200% text.

## MUST
- Space toggles. Visible label, and the target is the whole label row (at least 24px tall).
- Indeterminate is set through the element's `indeterminate` property and exposed as mixed.
- A group is a `fieldset` with a `legend`. A group error is linked to the fieldset.
- State is never colour only: the mark is a shape.

## Mobile
The row is full width and wraps. Spacing between rows keeps targets from touching.

## Review checks
1. Target is only the 16px box. 2. No label. 3. `div` with `role="checkbox"` where a native input would do. 4. Group without a legend. 5. Checked state visible by colour only.
