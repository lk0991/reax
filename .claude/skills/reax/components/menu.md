# Card: Menu

A list of actions or options that opens from a button (a menu button). Site navigation is a `nav` with links, not a menu. Also read `_rules.md`.

## Native first
A `<button>` that opens a popup. Use the ARIA menu pattern (`role="menu"`, `menuitem`, `menuitemcheckbox`, `menuitemradio`) only for application-style action menus. For a list of links, use a disclosure (`disclosure.md`) with a list of `<a>` instead: it needs no arrow-key handling.

## Anatomy
`trigger` (button) > `menu` > `item` (optional `icon`, `label`, `shortcut`), `separator`, `group` with `group-label`, `submenu-trigger`.

## Props
```ts
interface MenuProps {
  /** The trigger's content. Needs an accessible name. */
  trigger: React.ReactNode;
  items: Array<
    | { type?: 'item'; label: string; onSelect: () => void; disabled?: boolean; icon?: React.ReactNode; shortcut?: string }
    | { type: 'checkbox'; label: string; checked: boolean; onCheckedChange: (c: boolean) => void }
    | { type: 'separator' }
  >;
  placement?: 'bottom-start' | 'bottom-end';   // default 'bottom-start'
}
```

## Variants
Action menu, with checkable items, grouped, with a submenu (opt-in, avoid on touch).

## States, mapped to stories
closed, open (play function), item active by keyboard, disabled item, checked item, long labels, near the viewport edge, 320px, 200% text.

## Requirements
- The trigger has an accessible name and exposes `aria-haspopup` and `aria-expanded` (4.1.2).
- Enter, Space and Down on the trigger open the menu and move focus into it; Up and Down move between items; Esc closes it (2.1.1).
- Focus returns to the trigger when the menu closes (2.4.3).
- Items expose their role and checked state (4.1.2). Disabled items are exposed as disabled.

## Defaults
- Up on the trigger opens on the last item. Home and End jump; typing a letter moves to the next item starting with it.
- Tab closes the menu and moves on; focus does not cycle inside it.
- Choosing an item closes the menu.
- A click outside closes it.

## Mobile
The menu stays inside the viewport and scrolls if long. Items meet the target size. No hover-only submenus.

## Review checks
1. `role="menu"` used for site navigation. 2. Arrow keys do nothing. 3. Focus not returned to the trigger. 4. No `aria-expanded` on the trigger. 5. Menu clipped at 320px.
