# reax

An agent skill for building, reviewing and testing React UI components that follow the project's own design system. It lives in [`.claude/skills/reax`](.claude/skills/reax/SKILL.md).

## What it does

- **`init`**: scans a project's token files and components and writes `DESIGN.md` (the open DESIGN.md format) plus a sidecar, `.reax/design.json`, recording each token's real CSS name.
- **`from-text`** and **`from-figma`**: build a component folder (component, styles, stories, index) from a description or a design, asking once up front for every decision and install.
- **`review`** and **`improve`**: audit components against the component cards and WCAG 2.2 AA, and turn the findings into a ranked list.
- **`storybook`** and **`visual-test`**: set up Storybook, then capture every story at four sizes, run axe and keyboard and focus checks, compare with approved baselines, and open a live preview where a person can comment on and edit a component.

Component cards in [`components/`](.claude/skills/reax/components) hold each component's anatomy, Requirements (WCAG, never overridden) and Defaults (overridable).

## Use it

Copy `.claude/skills/reax` into a project's `.claude/skills/` (or your own `~/.claude/skills/`), then ask Claude Code to build or review a component, or run `/reax`. The scripts need Node 20 or newer. Their test dependencies install into `~/.cache/reax` after you agree, never into your project.

## Work on it

- Tests: `node --test .claude/skills/reax/scripts/test/*.test.mjs` (some tests need Chromium; they skip without it).
- [`examples/sample`](examples/sample) is a small React and Storybook project for running the whole pipeline; its README says what to expect.
- Terms are in [`CONTEXT.md`](CONTEXT.md), decisions in [`docs/adr/`](docs/adr).
