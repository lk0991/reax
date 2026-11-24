# Own the direction step, shown as specimen pages

A project with no design system gets a look of its own before any component is built. reax asks for product truth (recorded in PRODUCT.md, in the format the impeccable skill also reads), derives three directions from the users' own world, checks each, renders them side by side on one HTML specimen page (the person's first screen plus core components, palette, type, space and shape), and commits the chosen one as the project's token file plus DESIGN.md. The approach is adapted from impeccable's new-work flow.

## Considered options

- **Leave direction to impeccable.** Rejected: reax then starts from generic fallback tokens, which is where AI-looking UI comes from, and the handoff between two skills is where a solo creator gets lost.
- **Show directions as Storybook themes.** Rejected: it needs Storybook installed before the person has even chosen a look.
- **Show directions as generated images.** Rejected for now: it needs image generation, and a build then has to match a picture rather than tokens.
- **Keep product truth in DESIGN.md.** Rejected: DESIGN.md describes the visual system in the open format; product facts are a different subject, and a shared PRODUCT.md lets impeccable and reax read the same answers.

## Consequences

- A direction decides colour, type, spacing and density, and shape and depth. Motion and icons are not part of it yet; DESIGN.md lists them as gaps, along with a dark theme.
- `direction.mjs check` refuses contrast and target-size failures (Requirements) and warns, never blocks, on the looks AI-generated UI defaults to and on directions too alike to be a real choice.
- The token file is the project's own and uses the names DESIGN.md derives (`--color-primary`, `--space-md`), so its sidecar records every token's real name and line.
- Committing writes the token file before DESIGN.md, because the sidecar records a hash of it.
