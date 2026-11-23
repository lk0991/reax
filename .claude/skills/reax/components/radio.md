# Card: Radio

A radio group chooses exactly one option. Also read `_rules.md`.

## Native first
`<input type="radio">` sharing one `name`, in a `<fieldset>` with a `<legend>`. Arrow keys, Tab and wrapping come from the browser.

## Anatomy
`radio-group` (fieldset) > `legend`, `radio` (label row) > `control`, `dot`, `label`, optional `hint`; group `error`.

## Props
```ts
interface RadioGroupProps {
  legend: React.ReactNode;           // required
  name: string;
  value?: string; defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: React.ReactNode; hint?: React.ReactNode; disabled?: boolean }[];
  orientation?: 'vertical' | 'horizontal';   // default 'vertical'
  error?: React.ReactNode;
  required?: boolean; disabled?: boolean;
}
```

## Variants
Vertical, horizontal (wraps), card-style options (still radios).

## States, mapped to stories
none selected, one selected, option disabled, group disabled, error, required, long labels, horizontal wrapping at 320px, 200% text.

## Requirements
- A fieldset and legend name the group, and every option has a label (1.3.1, 3.3.2).
- Tab enters the group and arrows move and select (2.1.1). Native radios sharing one `name` do this.
- A group error is linked with `aria-describedby` on the fieldset (3.3.1, 1.3.1).
- Selection is visible by more than colour (1.4.1). Targets at least 24×24 px (2.5.8).

## Defaults
- The whole label row is the target.
- Use native inputs; do not reimplement the keyboard behaviour.
- Prefer a `select` when there are more than about six options.

## Mobile
Vertical by default. Horizontal wraps rather than scrolls.

## Review checks
1. No fieldset or legend. 2. Radios without a shared `name`. 3. Custom keyboard handling on top of native inputs. 4. Target smaller than the label row. 5. Selection visible by colour only.
