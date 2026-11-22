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

## MUST
- Link text makes sense alone ("Read the changelog", not "Click here").
- Inside text, links are underlined or otherwise 3:1 distinguishable from the text, not by colour alone.
- `target="_blank"` only with `rel="noopener"`, and the new tab is announced ("opens in a new tab") in the name or visibly.
- Focus ring visible. Enter activates.
- Target size: inline links in a sentence are exempt from the 24px floor; standalone links meet it.

## Mobile
Standalone links get padding to reach the target size. Long text wraps.

## Review checks
1. `a` without `href`, or an `a` doing a button's job. 2. "Click here" text. 3. Colour-only difference from text. 4. New tab with no warning. 5. Standalone link under 24px.
