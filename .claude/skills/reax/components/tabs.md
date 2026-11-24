# Card: Tabs

A set of panels shown one at a time, chosen with a row of tabs. Navigation between pages is links, not tabs. Also read `_rules.md`.

## Native first
No native element. Use the ARIA tabs pattern: `role="tablist"` with `role="tab"` buttons and `role="tabpanel"` panels.

## Anatomy
`tabs` (root) > `tablist` > `tab` (`label`, optional `icon`, optional `badge`), `panel`.

## Props
```ts
interface TabsProps {
  /** Names the tablist. */
  label: string;
  tabs: { id: string; label: React.ReactNode; content: React.ReactNode; disabled?: boolean }[];
  value?: string; defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Automatic: arrows select. Manual: arrows move focus, Enter or Space selects. */
  activation?: 'automatic' | 'manual';       // default 'automatic'
}
```

## Variants
Horizontal, vertical, manual activation (for panels that are slow to show).

## States, mapped to stories
first selected, another selected, tab focused but not selected (manual), disabled tab, many tabs at 320px, long labels, 200% text.

## Requirements
- Roles `tablist`, `tab`, `tabpanel`; the selected tab has `aria-selected="true"`; each tab controls its panel (`aria-controls`) and the panel is labelled by its tab (4.1.2, 1.3.1).
- Tab moves into the tablist on the selected tab and then to the panel; Left and Right (or Up and Down when vertical) move between tabs (2.1.1, 2.4.3).
- The selected tab is visible by more than colour (1.4.1, 1.4.11).

## Defaults
- Automatic activation; manual when showing a panel is slow.
- Home and End jump to the first and last tab; arrows wrap.
- The panel is focusable (`tabindex="0"`) when it has no focusable content.

## Mobile
At 320px the tablist scrolls sideways inside itself, or the tabs wrap; the page never scrolls sideways. Consider a disclosure list instead for more than four tabs.

## Review checks
1. Tabs used for page navigation. 2. All tabs in the Tab order. 3. No arrow-key handling. 4. Selected tab by colour only. 5. Page scrolls sideways at 320px.
