# Card: Tooltip

A short label or description that appears on hover and focus. It never holds anything a person needs to act on. Also read `_rules.md`.

## Native first
A visible label first. A tooltip only adds a name to an icon-only control or a short description. Do not use `title`: it is not shown on focus or touch.

## Anatomy
`trigger` (the element it describes) > `tooltip` (`role="tooltip"`), optional `arrow`.

## Props
```ts
interface TooltipProps {
  /** Short text; no links or buttons inside. */
  content: string;
  /** label: names an icon-only trigger. description: adds to the trigger's own name. */
  kind?: 'label' | 'description';             // default 'description'
  children: React.ReactElement;               // the trigger; must be focusable
  placement?: 'top' | 'bottom' | 'start' | 'end';
}
```

## Variants
Label (for icon-only buttons), description.

## States, mapped to stories
hidden, shown on hover (`reax-state-hover`), shown on focus (`reax-state-focus`), near the viewport edge, long text that wraps, 200% text.

## Requirements
- It appears on keyboard focus as well as hover (2.1.1, 1.4.13).
- It can be dismissed with Esc without moving focus or the pointer, the pointer can move onto it without it vanishing, and it stays until the person moves away or dismisses it (1.4.13).
- It is connected to the trigger: `aria-labelledby` for a label, `aria-describedby` for a description (4.1.2, 1.3.1).
- Text contrast at least 4.5:1 (1.4.3).

## Defaults
- Opens after a short delay on hover, at once on focus.
- No interactive content inside. If it needs a link or button, it is a popover or disclosure, not a tooltip.
- On touch it is not the only way to get the information.

## Mobile
Touch has no hover: the information the tooltip holds must also be available another way (a visible label, or a disclosure).

## Review checks
1. Shown on hover only. 2. No Esc to dismiss. 3. Links or buttons inside. 4. `title` attribute used instead. 5. Essential information only in the tooltip.
