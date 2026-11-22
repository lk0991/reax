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

## MUST
- Fieldset and legend name the group. Every option has a label. The row is the target.
- Tab enters the group on the selected radio (or the first), arrows move and select. Do not reimplement this: use native inputs.
- Group error linked with `aria-describedby` on the fieldset.
- Prefer a `select` when there are more than about six options.

## Mobile
Vertical by default. Horizontal wraps rather than scrolls.

## Review checks
1. No fieldset or legend. 2. Radios without a shared `name`. 3. Custom keyboard handling on top of native inputs. 4. Target smaller than the label row. 5. Selection visible by colour only.
