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

## Requirements
- Space toggles (2.1.1). A visible label is associated with the input (1.3.1, 3.3.2).
- Indeterminate is exposed as mixed, through the element's `indeterminate` property (4.1.2).
- A group is a `fieldset` with a `legend`; a group error is linked to the fieldset (1.3.1, 3.3.1).
- State is never colour only: the mark is a shape (1.4.1).
- Target at least 24×24 px (2.5.8).

## Defaults
- The target is the whole label row.


## Keyboard checks
Run by `visual-test`, besides the shared checks in `_rules.md`.
- `space-toggles`: Space changes the checked state (2.1.1).

## Mobile
The row is full width and wraps. Spacing between rows keeps targets from touching.

## Review checks
1. Target is only the 16px box. 2. No label. 3. `div` with `role="checkbox"` where a native input would do. 4. Group without a legend. 5. Checked state visible by colour only.
