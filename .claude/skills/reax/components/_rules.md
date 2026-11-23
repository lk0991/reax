# Rules for every component

Loaded with every card, and alone for a component that has no card. A card adds to these and never relaxes them. A request or `DESIGN.md` may override a default, never a MUST. The only exception: a person explicitly accepts a listed accessibility warning in the preview's Edit mode, and the change is recorded.

## Precedence

Request, then project (`DESIGN.md`, existing components, token files), then card defaults. Accessibility MUSTs apply whatever the order says: do the accessible thing and say so in one line.

## MUST (accessibility, WCAG 2.2 AA)

- Native element first (`button`, `a`, `input`, `select`, `textarea`, `dialog`, `details`, `table`). An ARIA widget only when no native element gives the behaviour. No ARIA role that repeats native semantics.
- Every interactive element has an accessible name (visible label, `aria-label` or `aria-labelledby`). Icon-only controls always have one. A placeholder is never the label.
- Everything works with the keyboard alone, in a sensible tab order (the markup order). No keyboard trap. Visible focus with `:focus-visible`, at least 3:1 against its surroundings. Never `outline: none` without a replacement.
- Pointer targets are at least 24×24 CSS px (SC 2.5.8). Go larger only when `DESIGN.md` states a size. A checkbox or radio target is the whole label row.
- Text contrast at least 4.5:1 (3:1 for large text and for UI parts and focus indicators). Meaning is never carried by colour alone.
- Content reflows at 320 CSS px with no sideways scroll, and stays usable at 200% text size. Size text and spacing in `rem` or `em`, never `px`. No fixed widths. Wrapping text, no clipping.
- Respect `prefers-reduced-motion`. Nothing flashes more than three times a second.
- State is exposed to assistive technology (`disabled`, `aria-invalid`, `aria-expanded`, `aria-current`, `aria-pressed`), and errors are linked to their control with `aria-describedby`.

## Code

- React and TypeScript. Typed props with JSDoc on every prop. One component per file. Spread the remaining native props onto the root element. Forward `ref` to the main element.
- `data-slot="name"` on every part, using the card's slot names.
- Tokens only, by the project's real names (`var(--…)` custom properties, or the project's utility classes or theme keys). No raw colour, size, radius or shadow that has a token.
- Mobile first: base styles for 390px, `min-width` media queries for wider, using the project's breakpoints.
- Names for variants and sizes come from `DESIGN.md`. With none: emphasis `primary`, `secondary`, `ghost`; intent `neutral`, `info`, `success`, `warning`, `danger`; size `sm`, `md`, `lg`.

## Defaults for known disagreements

- **Disabled**: native `disabled` when an action is permanently unavailable. When people need to learn why, `aria-disabled="true"`, keep focus, and explain with `aria-describedby`. Pending keeps focus and announces.
- **Field wrapper**: `disabled` and `required` are set once on the field wrapper, which forwards them to the control.
- **Select**: native on touch. **Pagination**: previous and next with "Page X of Y"; numbered links opt-in.
- **Toast**: `role="status"`, errors `role="alert"`, never steal focus, errors never auto-dismiss, always a dismiss control.
- **Tooltip**: label or description only, opens on hover and focus, Esc closes, never holds essential content.

## Stories

One story per state the card lists, a long-text story, and a story at the narrow width if the layout changes. Stories carry the arguments of the state, not a hard-coded copy of the markup.

## Review checks for any component

1. Missing accessible name. 2. Target under 24px. 3. Raw value where a token exists. 4. Fixed width or `px` text. 5. No visible focus. 6. State not exposed to assistive technology. 7. A state with no story. 8. No `data-slot` on a part.
