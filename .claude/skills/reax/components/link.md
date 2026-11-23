# Card: Link

Navigation: to another page, a place on the page, or a file. An action that changes state is a `button`. Also read `_rules.md`.

## Native first
`<a href>`. For client routing, render the router's link, which still outputs an `a` with a real `href`.

## Anatomy
`link` (root, `data-slot="link"`) > optional `icon`, `label`, optional external-link indicator.

## Props
```ts
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;                                  // required
  variant?: 'underline' | 'plain';               // default 'underline'
  /** Opens in a new tab: adds rel and a visible and spoken indicator. */
  external?: boolean;
}
```

## Variants
Inline in text (always underlined), standalone, with icon.

## States, mapped to stories
default, hover, visited, focus-visible, current page (`aria-current="page"`), external, inside a paragraph, long text that wraps, 200% text.

## Requirements
- The purpose is clear from the link text, or the text with its context (2.4.4).
- Inside text, links are distinguishable by more than colour: underlined, or 3:1 against the text plus a non-colour cue on hover and focus (1.4.1).
- Visible focus; Enter activates (2.4.7, 2.1.1).
- Standalone links meet the 24px target; links inside a sentence are exempt (2.5.8).

## Defaults
- Link text makes sense alone ("Read the changelog", not "Click here").
- `target="_blank"` only with `rel="noopener"`, and the new tab is announced ("opens in a new tab") in the name or visibly.

## Mobile
Standalone links get padding to reach the target size. Long text wraps.

## Review checks
1. `a` without `href`, or an `a` doing a button's job. 2. "Click here" text. 3. Colour-only difference from text. 4. New tab with no warning. 5. Standalone link under 24px.
