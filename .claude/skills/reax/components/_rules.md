# Rules for every component

Loaded with every card, and alone for a component that has no card. A card adds to these and never relaxes them.

Every list has two kinds of rule. **Requirements** come from WCAG 2.2 AA, each with its success criterion; nothing overrides them, except an exception a person explicitly accepts in the preview's Edit mode, which is recorded. **Defaults** are this skill's choices; a request or the project (`DESIGN.md`, existing components) overrides them.

## Precedence

Request, then project (`DESIGN.md`, `COMPONENTS.md`, existing components, token files), then card defaults. Requirements apply whatever the order says: do the accessible thing and say so in one line.

## Requirements (WCAG 2.2 AA)

- Every part has the correct role, name, state and value: a native element, or an ARIA pattern when no native element gives the behaviour (4.1.2).
- Every interactive element has an accessible name (visible label, `aria-label` or `aria-labelledby`); icon-only controls always have one; a visible label is part of the name (4.1.2, 2.5.3). A placeholder is never the label (3.3.2).
- Everything works with the keyboard alone, with no keyboard trap (2.1.1, 2.1.2), in a sensible focus order (2.4.3).
- Focus is visible (2.4.7), and the indicator has at least 3:1 contrast against its surroundings (1.4.11). Never `outline: none` without a replacement.
- Pointer targets are at least 24×24 CSS px, or spaced so a 24px circle around each does not overlap another; inline links in text are exempt (2.5.8).
- Text contrast at least 4.5:1, 3:1 for large text (1.4.3); UI parts and states at least 3:1 (1.4.11). Meaning is never carried by colour alone (1.4.1).
- Content reflows at 320 CSS px with no sideways scroll (1.4.10), stays usable with text at 200% (1.4.4) and with increased text spacing (1.4.12). No clipping.
- Nothing flashes more than three times a second (2.3.1).
- State is exposed to assistive technology (`disabled`, `aria-invalid`, `aria-expanded`, `aria-current`, `aria-pressed`) (4.1.2). Errors are described in text (3.3.1) and linked to their control with `aria-describedby` (1.3.1). Status messages are announced without moving focus (4.1.3).

## Defaults

- Native element first (`button`, `a`, `input`, `select`, `textarea`, `dialog`, `details`, `table`). No ARIA role that repeats native semantics.
- Size text and spacing in `rem` or `em`, not `px`, and avoid fixed widths: the easiest way to meet 1.4.4 and 1.4.10. `px` tokens are fine when the 320px and 200% captures pass.
- Respect `prefers-reduced-motion`.
- A checkbox or radio target is the whole label row. Targets go above 24px only when `DESIGN.md` states a size.

## Keyboard checks

`visual-test` runs these on every story, with real key presses, once at the first viewport. A card adds its own in its "Keyboard checks" section. A failed check fails the run.

- `tab-reach`: Tab reaches every interactive element (a radio group counts once) (2.1.1).
- `focus-visible`: every element Tab reaches looks different when focused (2.4.7).

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
- **Toast** and **Tooltip**: see their cards (`toast.md`, `tooltip.md`).

## Stories

One story per state the card lists, a long-text story, and a story at the narrow width if the layout changes. Stories carry the arguments of the state, not a hard-coded copy of the markup.

Interaction states cannot be set with arguments. Give those stories a tag, and the visual test puts the element into the state with real pointer and keyboard input before the screenshot, so `:hover`, `:active` and `:focus-visible` styles show:

- `tags: ['reax-state-hover']`, `['reax-state-pressed']` or `['reax-state-focus']`.
- The target is the first interactive element in the story, or the element marked `data-reax-target` (for example the trigger, not the first item, in a compound story).
- Other states that need interaction (an open menu, a filled form) use a `play` function. The capture waits for it to finish.
- A story for 200% text or a narrow width is not needed: every story is captured at 320px and at 200% text.

## Review checks for any component

1. Missing accessible name. 2. Target under 24px. 3. Raw value where a token exists. 4. Fixed width or `px` text. 5. No visible focus. 6. State not exposed to assistive technology. 7. A state with no story. 8. No `data-slot` on a part.
