# Card: Combobox

A text input with a popup list of suggestions the person can type to filter (autocomplete). A plain choice from a fixed list is a `select`. Also read `_rules.md` and `form-field.md`.

## Native first
`<input list>` with a `<datalist>` when the suggestions are plain text and styling the popup does not matter. Otherwise the ARIA combobox pattern: `input role="combobox"` with `aria-expanded`, `aria-controls` and `aria-autocomplete`, and a `role="listbox"` popup of `role="option"` items.

## Anatomy
`field` > `label`, optional `hint`, `control` (the input), optional `clear`, `listbox` > `option` (with optional `option-description`), `empty` (no results), `error`.

## Props
```ts
interface ComboboxProps<T> {
  label: React.ReactNode;                     // required
  options: T[];
  getOptionLabel: (option: T) => string;
  value?: T | null; defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
  /** Text typed so far; filter outside when the list comes from a server. */
  inputValue?: string; onInputChange?: (text: string) => void;
  /** Whether typed text that matches no option is accepted. */
  allowCustomValue?: boolean;                 // default false
  loading?: boolean;
  hint?: React.ReactNode; error?: React.ReactNode;
}
```

## Variants
List autocomplete (filters), with inline completion, async (server results), with custom value.

## States, mapped to stories
closed empty, closed with value, open with options (play function types a letter), filtered to one, no results, loading, option active (keyboard), disabled, error, long option text, 320px, 200% text.

## Requirements
- Visible label associated with the input (1.3.1, 3.3.2).
- Role, `aria-expanded`, `aria-controls` and the active option are exposed: `aria-activedescendant` on the input, or real focus on the option (4.1.2).
- Down and Up move through the options, Enter chooses, Esc closes, all without leaving the input (2.1.1).
- The number of results, "no results" and loading are announced without moving focus (4.1.3).
- The active option is visible by more than colour (1.4.1, 1.4.11).

## Defaults
- DOM focus stays on the input; options are reached with `aria-activedescendant`.
- Alt+Down opens without moving; Home and End move in the text, not the list.
- Typing never selects by itself: Enter or a click does.
- The popup fits the viewport at 320px and scrolls inside, not the page.

## Mobile
The popup is full width under the input and never covered by the on-screen keyboard: limit its height. Option rows meet the target size.

## Review checks
1. `div` with `role="combobox"` that is not the text input. 2. No `aria-expanded` or `aria-controls`. 3. Options reachable only with a pointer. 4. Results count not announced. 5. Focus moves into the list. 6. Active option shown by colour only.
