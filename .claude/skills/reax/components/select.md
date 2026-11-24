# Card: Select

Choose one option from a list. Also read `_rules.md`.

## Native first
`<select>`. It is the default everywhere, and the only choice on touch devices. Build a custom listbox only when the options need rich content, and then follow the select-only combobox pattern (`role="combobox"`, `listbox`, `option`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, type-ahead).

## Anatomy
`field` > `label`, optional `hint`, `control` (select), `chevron`, `error`.

## Props
```ts
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: React.ReactNode;
  options: { value: string; label: string; disabled?: boolean; group?: string }[];
  /** Text of an empty first option. Not a substitute for the label. */
  placeholder?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

## Variants
Native, grouped (`optgroup`), custom listbox (opt-in).

## States, mapped to stories
placeholder shown, selected, disabled, disabled option, error, focus, grouped, long option text, 320px, 200% text.

## Requirements
- Visible label with `for` and `id`; error and hint linked (1.3.1, 3.3.2, 3.3.1).
- A custom listbox is fully keyboard operable and exposes its role, state and active option (2.1.1, 4.1.2).
- Option text is not clipped at 200% text (1.4.4).

## Defaults
- A custom listbox follows the select-only combobox pattern: DOM focus stays on the combobox; Down, Alt+Down, Enter and Space open; Esc closes; Home, End and type-ahead work.
- Long option text wraps, or truncates with the full text available.

## Mobile
Native picker. The control fills the width.

## Review checks
1. Custom select where native would do. 2. No label. 3. Custom listbox without keyboard support or ARIA wiring. 4. Placeholder used as label. 5. Closed control text clipped.
