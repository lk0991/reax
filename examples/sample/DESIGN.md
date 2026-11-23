---
version: alpha
name: reax sample
description: A small sample design system for running the reax skill end to end.
---

# reax sample

## Overview

Calm and plain: one brand blue, ink on paper, generous touch targets.

## Colors

Colour tokens found in the project.

```yaml
colors:
  primary: "#1f4f9a"
  primary-strong: "#163a72"
  on-surface: "#1a1a1a"
  on-surface-muted: "#4a4a4a"
  surface: "#ffffff"
  surface-sunken: "#f3f3f1"
  danger: "#b3261e"
  focus: "#1f4f9a"
```

## Typography

Type tokens found in the project.

```yaml
typography:
  body:
    fontSize: 1rem
  small:
    fontSize: 0.875rem
  title:
    fontSize: 1.25rem
```

## Layout

Spacing, touch-target sizes and breakpoints.

```yaml
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  size:
    "44": 2.75rem
  breakpoint:
    md: 768px
```

## Shapes

Corner radii.

```yaml
rounded:
  sm: 0.25rem
  md: 0.5rem
```

## Do's and Don'ts

- Do use a token for every colour, space and radius.
- Don't use colour alone to show meaning.

## Language

- **framework**: react 18
- **styling**: css-vars
- **naming**: PascalCase folders, data-slot on every part

Machine-readable detail: `@.reax/design.json`

## Component inventory

| Component | Path | Card |
| --- | --- | --- |
| Button | `src/components/Button` | button |
| Chip | `src/components/Chip` | none |
| Dialog | `src/components/Dialog` | dialog |
| ProfileCard | `src/components/ProfileCard` | none |

Machine-readable detail: `@.reax/design.json`

## Gaps

- No motion tokens.
- No dark theme.
- Chip is deliberately broken, as a test fixture.
