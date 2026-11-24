# Card: Disclosure

A button that shows and hides a section of content. An accordion is a set of disclosures. Also read `_rules.md`.

## Native first
`<details>` with `<summary>`: keyboard, state and semantics come free. A `button` with `aria-expanded` and `aria-controls` when the native element cannot be styled as needed or the state must be controlled.

## Anatomy
`disclosure` (root, `details`) > `trigger` (`summary` or button, with `label` and `chevron`), `panel`. Accordion: `accordion` > several `disclosure` items, each with a heading around its trigger.

## Props
```ts
interface DisclosureProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  open?: boolean; defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
interface AccordionProps {
  items: { id: string; summary: React.ReactNode; content: React.ReactNode }[];
  /** Heading level that wraps each trigger. */
  headingLevel: 2 | 3 | 4 | 5 | 6;
  /** Whether several can be open at once. */
  multiple?: boolean;                         // default true
}
```

## Variants
Single disclosure; accordion (one or several open).

## States, mapped to stories
closed, open, focused (`reax-state-focus`), accordion with one open, long summary that wraps, 320px, 200% text.

## Requirements
- The trigger is a button (or `summary`) with its state exposed (`aria-expanded`, native on `details`) (4.1.2).
- Enter and Space toggle it (2.1.1).
- Accordion triggers sit inside headings at a level that fits the page outline (1.3.1).
- The open or closed state is visible by more than colour: the chevron turns (1.4.1).

## Defaults
- Accordions allow several open sections.
- No arrow-key navigation between accordion items unless the project asks.
- The chevron turns with `prefers-reduced-motion` respected.

## Mobile
The whole summary row is the target. Panels never scroll sideways.

## Review checks
1. `div` with a click handler as the trigger. 2. No `aria-expanded`. 3. Accordion triggers without headings. 4. State shown by colour only. 5. Content hidden with CSS that still lets focus reach it.
