# Component conventions

How this project writes components, so new ones match. Written by reax `init` from 4 components in `src/components`; the tables are regenerated, the Overview and Notes are yours. Machine-readable detail: `@.reax/design.json` (`conventions`).

## Overview

Small function components with a plain stylesheet each. A component's root class is `sample-<name>` and its parts use BEM elements (`sample-dialog__title`); variants are `data-*` attributes on the root, which the CSS selects. Every part carries `data-slot`. Only Button forwards a ref, because it is the one other code needs to focus.

## Layout

| Convention | Value | Followed by | Exceptions |
| --- | --- | --- | --- |
| One folder per component | yes | 4 of 4 |  |
| Folder name case | `PascalCase` | 4 of 4 |  |
| Files in a component folder | `{Name}.css`, `{Name}.stories.tsx`, `{Name}.tsx`, `index.ts` | 4 of 4 |  |
| Component file name case | `PascalCase` | 4 of 4 |  |

## Code

| Convention | Value | Followed by | Exceptions |
| --- | --- | --- | --- |
| How a component is declared | `function` | 3 of 4 | Button |
| Export | `named` | 4 of 4 |  |
| Props type | `interface {Name}Props` | 4 of 4 |  |
| Props extend the native element's attributes | no | 3 of 4 | Button |
| JSDoc on props | yes | 4 of 4 |  |
| index file | `export *` | 4 of 4 |  |

## Styling

| Convention | Value | Followed by | Exceptions |
| --- | --- | --- | --- |
| Styling approach | `plain-css` | 4 of 4 |  |
| How styles select a variant | `data-attribute` | 1 of 1 |  |
| Class names | `BEM` | 3 of 4 | Button |
| `data-slot` on parts | yes | 4 of 4 |  |

## Props

| Convention | Value | Followed by | Exceptions |
| --- | --- | --- | --- |
| Name of the emphasis prop | `variant` | 1 of 1 |  |
| Boolean prop prefix | `none` | 2 of 2 |  |
| Most used props | `bio` (1), `initials` (1), `label` (1), `loading` (1), `name` (1), `onOpenChange` (1), `onRemove` (1), `open` (1), `variant` (1) | | |

## Stories

| Convention | Value | Followed by | Exceptions |
| --- | --- | --- | --- |
| Every component has stories | yes | 4 of 4 |  |
| Story format | `csf3-satisfies` | 4 of 4 |  |
| Story title | `Components/{Name}` | 4 of 4 |  |
| Meta tags | none | 4 of 4 |  |
| Story shape | `args` | 3 of 4 | Chip |

## Tokens in code

33 uses of custom properties and 3 raw colours in component code and styles.

## Template

```tsx
import * as React from 'react';
import './Tag.css';

export interface TagProps {
  /** Text of the tag. */
  label: string;
  /** Emphasis. */
  variant?: 'primary' | 'secondary';
}

/** One line on what it is for. */
export function Tag({ label, variant = 'primary' }: TagProps) {
  return (
    <span className="sample-tag" data-slot="tag" data-variant={variant}>
      <span className="sample-tag__label" data-slot="label">{label}</span>
    </span>
  );
}
```

`Tag.css` styles `.sample-tag` and `.sample-tag[data-variant='secondary']` with tokens; `index.ts` is `export * from './Tag';`; `Tag.stories.tsx` uses `satisfies Meta`, `title: 'Components/Tag'`, and one `args` story per state.

## Notes

<!-- Your notes: decisions the scan cannot see, and conventions you are moving towards. Kept on every re-run. -->
