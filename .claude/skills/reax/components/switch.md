# Card: Switch

An on or off setting that takes effect at once. Use a checkbox when the choice is confirmed with a Save button. Also read `_rules.md`.

## Native first
`<input type="checkbox" role="switch">` with a `<label>`. Space toggles. Do not use `aria-checked` on a `div`.

## Anatomy
`switch` (label row) > `control` (input), `track`, `thumb`, `label`, optional `status` text (On, Off), optional `hint`.

## Props
```ts
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Show On and Off beside the track. Default true when the label does not say it. */
  showStatus?: boolean;
  size?: 'sm' | 'md';
  loading?: boolean;                 // pending change: keeps focus, announces
}
```

## Variants
With and without a status label; label at the start or end.

## States, mapped to stories
off, on, disabled off, disabled on, focus-visible, loading, long label, 320px, 200% text.

## MUST
- Name from the label. State exposed as checked.
- The label does not change when the state changes ("Notifications", not "Turn notifications on").
- On and off are told apart by more than colour (thumb position, a text status, or an icon).
- Target is the whole row, track at least 24px tall.
- Effect is immediate. If it cannot be, use a checkbox.

## Mobile
Row full width, label wraps, track keeps its size.

## Review checks
1. `div` role switch. 2. Label changes with state. 3. State by colour only. 4. Used for a value that needs Save. 5. Track under 24px.
