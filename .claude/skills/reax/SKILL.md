---
name: reax
description: Generate, review and visually test React UI components that follow the project's own design system, or give a project without one a look of its own. Use when asked to build a React component from a text description or a Figma or image design, to review a project's React components against its design system and WCAG (not general page or design audits), to set up Storybook, to run visual and accessibility tests with screenshots, or to open a live preview where a person can try a component, comment on elements and edit tokens. Also use to create or refresh DESIGN.md, or to choose a visual direction (a look of its own, not a generic default) for a project that has no design system yet.
version: 0.1.0
user-invocable: true
argument-hint: "[direction|init|from-figma|from-text|change|tokens|review|storybook|visual-test|improve|verdict] [details]"
license: MIT
---

# reax

You build React UI components that fit the project they are written in, and you check them: Storybook stories, screenshots at four sizes, an axe accessibility scan, keyboard and focus checks with real key presses, and a live preview a person can use. These catch a lot, not everything: say so. Screen reader output, reading order, and whether names and errors make sense still need a person, and the visual review is your judgement of the screenshots. You never impose a design system. You learn the project's own from its `DESIGN.md` and its existing components.

Mobile first. Accessibility to WCAG 2.2 AA is never overridden by a request, by the project, or by a card. The one exception is a person who sees the specific problem in the preview's Edit mode and explicitly accepts it: then the change is made and recorded (see [visual-test](reference/visual-test.md), Handling events).

## Commands

The first word of the request picks the command. With no command, infer it from the request and say which one you chose.

| Command | Use it to | Read |
| --- | --- | --- |
| `direction` | Give a project with no design system a look of its own: product questions, three directions on a specimen page, then the token file and `DESIGN.md` | [reference/direction.md](reference/direction.md) |
| `init` | Scan the project and write `DESIGN.md`, `COMPONENTS.md` and `.reax/design.json` | [reference/init.md](reference/init.md) |
| `from-text` | Build a component from a text description | [reference/from-text.md](reference/from-text.md) |
| `from-figma` | Build a component from an image, screenshot or Figma link | [reference/from-figma.md](reference/from-figma.md) |
| `change` | Add a variant, size or state to an existing component, or fix one, and show what moved | [reference/change.md](reference/change.md) |
| `tokens` | Change token values, see every affected component before and after, then keep or undo | [reference/tokens.md](reference/tokens.md) |
| `review` | Audit existing components, findings to chat and `visual-report/review.json` | [reference/review.md](reference/review.md) |
| `storybook` | Install and configure Storybook, write missing stories | [reference/storybook.md](reference/storybook.md) |
| `visual-test` | Run the visual and accessibility tests, review the screenshots, open the preview | [reference/visual-test.md](reference/visual-test.md) |
| `improve` | Turn the latest run and review findings into a prioritised list | [reference/improve.md](reference/improve.md) |
| `verdict` | Answer "can this change merge without developer review?" with evidence, in plain words | [reference/verdict.md](reference/verdict.md) |

Read the reference for the command before you act. Do not read the others.

## Rules that hold in every command

1. **Load the design first.** Before creating or reviewing anything, run `node scripts/design.mjs check --root <project>` (paths below are relative to this skill's folder). Exit 0: run `load` and use it, and read `COMPONENTS.md` if it exists before writing a component or a story. Missing: offer `init` (in `from-text` and `from-figma`, as part of the one plan they ask for). When the project has no tokens at all, offer `direction` instead: a component built on generic defaults looks generic. Carry on with the card defaults only if the person declines both. Stale: say what drifted and offer `init`. Never refresh silently.
2. **Precedence.** The request wins, then the project (`DESIGN.md`, `COMPONENTS.md`, its existing components and token files), then the card and shared defaults. Accessibility requirements (the Requirements lists in the cards and [components/_rules.md](components/_rules.md), each citing its WCAG success criterion) apply whatever the order says. Defaults are overridable. If a request conflicts with one, do the accessible thing and say so in one line. A chat request never overrides one; only an exception accepted in Edit mode does.
3. **Ask before installing** anything into the project. Say which packages and why, then wait (in a build command, the one plan is that question). Skill dependencies (Playwright, axe, pixelmatch) install into `~/.cache/reax`, not the project: run `node scripts/setup.mjs --check --root <project>`, and `--install` only after the person agrees.
4. **Never edit an existing component unprompted.** `review` reports and saves its findings, `improve` lists. A person asks for the change (`change`), or approves it in the preview's Edit mode.
5. **Use the project's tokens, by their real names.** Use the `css` name `design.mjs load` reports for each token: a `var(--…)` custom property, or the project's theme key or utility class when its `Language` is utility classes. A token marked `cssDerived` has no recorded project name: check that it exists before using it. Never invent a colour, size or radius that is not a token. If a needed token does not exist, say so, use the nearest and list it as a gap.
6. **Small, finished output.** A component is a folder (below). Say what you wrote in a few lines. Do not paste the code back.
7. **Report what ran.** If a check could not run, say that and why. Never describe a result you did not see.
8. **Ask what the person expects, and end with a preview.** Commands that build a component (`from-text`, `from-figma`) ask once before writing code: one round that covers purpose, variants and states, and a plan naming `init` and every install they will need, approved together. Apart from the `init` diff, nothing else interrupts. They always close by offering a preview. If the person declines the questions, state the defaults and go on.
9. **End a change with the verdict.** After a command changes components (`from-text`, `from-figma`, an applied Edit or fix), run the [verdict](reference/verdict.md) and report its level in plain words.

## Component folder

```
src/components/Button/
  Button.tsx          typed props with JSDoc; one component per file; data-slot on every part
  Button.css          styles with design tokens as custom properties; mobile-first min-width queries
  Button.stories.tsx  Storybook CSF3, typed with `satisfies Meta`; one story per state
  index.ts            re-exports the component (per folder, no directory-wide barrel)
```

This is the shape for a project with no components yet. A project with components has its own, recorded by `init` in **`COMPONENTS.md`**: folder layout and file names, how components and props are declared, how styles select variants, prop naming, and how stories are written, each with how many components follow it. New components and stories follow `COMPONENTS.md`, so they read like the ones already there, and `review` reports a component that breaks it without a recorded reason (as Should fix); the card still decides anatomy, slots, states and Requirements. Use the components directory the project already uses (`init` records it). No separate unit test: the story is the test.

Every part of a component carries `data-slot="name"`, using the slot names from the component card. The preview's comment, anatomy and edit modes and the report all depend on them.

## Component cards

[components/](components/) holds one short card per component, plus [_rules.md](components/_rules.md) (rules for every component) and [_aliases.md](components/_aliases.md) (other names that map to a card, for example Modal and Popup to Dialog).

- Load a card only when its component is involved. Resolve the project's own names through `_aliases.md`.
- Load at most about six cards per request.
- A component with no card gets `_rules.md` only.
- The same card drives generation and `review`.

## Files the skill writes in the project

| Path | What | Commit it? |
| --- | --- | --- |
| `PRODUCT.md` | Who the product is for, its situation and commitments (written by `direction`; the impeccable skill reads it too) | yes |
| `DESIGN.md` | Design tokens and language, open DESIGN.md format | yes |
| `COMPONENTS.md` | How components are written here: layout, names, declarations, styling, props, stories | yes |
| `.reax/design.json` | Machine data beside them | yes |
| `.reax/baselines/` | Approved reference screenshots | yes |
| `.reax/visual-test.json` | Optional settings | yes |
| `.reax/viewports.json` | Widths pinned in the preview | yes |
| `visual-report/` | `report.md`, `run.json`, `gallery.html`, `catalogue.html`, `verdict.html`, screenshots, comments, `review.json`, `improvements.md` | no, add to `.gitignore` |

## Scripts

All scripts live in `scripts/`, run with Node 20 or newer, and print JSON or Markdown. Run them with `--root <project>` when the working directory is not the project.

- `design.mjs`: `check`, `load`, `tokens`, `write`, `diff`
- `conventions.mjs`: learns the project's component conventions, for `init`
- `direction.mjs`: `check`, `specimen`, `commit`, for `direction`
- `verdict.mjs`: gathers the evidence for a change and writes the quality verdict
- `token-change.mjs`: plans, tries, keeps or undoes token value changes, for `tokens`
- `setup.mjs`: `--check`, `--install`, `--install-browser`
- `visual-test.mjs`: the visual test, `--approve`, `--preview`
- `preview.mjs`: the live preview helper
- `preview-events.mjs`: follows the preview's events, for a watcher, with `--from <line>` to re-arm
