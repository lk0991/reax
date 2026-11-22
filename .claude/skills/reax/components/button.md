# Card: Button

Loaded by `from-text`, `from-figma`, `review`, `storybook` when a button is involved. Also read `_rules.md`.

## Native first
`<button>`. Never a `div` or `a` for an action. Navigation is a `link`, not a button.

## Anatomy
`button` (root, `data-slot="button"`) > optional `icon` (start), `label`, optional `icon` (end), `spinner` when pending.

## Props
```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Emphasis. Names from DESIGN.md. */
  variant?: 'primary' | 'secondary' | 'ghost';   // default 'primary'
  /** Meaning of the action. */
  intent?: 'neutral' | 'danger';                 // default 'neutral'
  size?: 'sm' | 'md' | 'lg';                     // default 'md'
  /** Shows the pending state: keeps focus, ignores presses, announces. */
  loading?: boolean;
  fullWidth?: boolean;
  /** Required when the button has no text. */
  'aria-label'?: string;
}
```
`type` defaults to `"button"`, never to submit unless asked.

## Variants
primary, secondary, ghost; danger intent. A link-styled action is still a button.

## States, mapped to stories
default, hover, pressed, focus-visible, disabled, loading, icon-only, long label, full width at 390px, danger, 200% text.

## MUST
- Name from content, or `aria-label` for icon-only.
- Space and Enter activate. Visible focus ring.
- Pending: `aria-busy` or a live announcement, focus stays, repeat presses ignored.
- Toggle buttons use `aria-pressed` with a label that does not change.
- Target at least 24×24 px (the whole padded box), spaced from neighbours.
- A disabled button follows the disabled rule in `_rules.md`.

## Mobile
Full width is opt-in. Label wraps instead of clipping. Icon-only keeps the 24px floor.

## Review checks
1. Icon-only button without a name. 2. `div` or `a` used as a button. 3. Default `type` submits unintentionally. 4. Focus lost on loading. 5. Label clipped at 200% text. 6. Colour-only danger meaning (add text or icon).
