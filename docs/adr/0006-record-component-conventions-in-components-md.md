# Record the project's component conventions in COMPONENTS.md

`init` learns how a project writes its components and records it in `COMPONENTS.md`, beside `DESIGN.md`, with the data in the design sidecar. A script counts what can be counted across every component (folder layout and file names, how components and props are declared and exported, how styles select a variant, prop naming, story format and title scheme); the agent reads a few representative components for what a count cannot see and writes the overview and a template. New components and stories follow it.

## Considered options

- **Grow the Language section of `DESIGN.md`.** Rejected: `DESIGN.md` follows the open format and is read by other tools as a description of tokens and visual language. Code conventions are a different subject with a different reader.
- **Let the agent read some components and write the conventions down.** Rejected as the only source: it is not repeatable, and a sample misses how widely a pattern is followed. Counting first gives each convention a number, its exceptions, and a way to tell a convention from a split.

## Consequences

- A pattern followed by about 70% or more of components is the convention; a closer split is "mixed". `init` asks about mixed ones that matter (within its three questions) and recommends the most recently changed pattern.
- The convention tables are regenerated on each `init`; the Overview and Notes are the person's and are kept.
- `review` reports a component that breaks a recorded convention, as Should fix at most and only when its Overview, Notes, card or a Requirement does not explain it. `conventions.mjs --check` lists the deviations; the agent judges them. `COMPONENTS.md` counts as "the project" in the precedence order: it beats card defaults, never accessibility Requirements.
- Detection is heuristic (regular expressions, no TypeScript compiler). The counts show how much to trust each row.
