---
name: reax
description: Generate, review and visually test React UI components that follow the project's own design system. Use when asked to build a React component from a text description or a Figma or image design, to review components for accessibility and design consistency, to set up Storybook, to run visual and accessibility tests with screenshots, or to open a live preview where a person can try a component, comment on elements and edit tokens. Also use to create or refresh DESIGN.md.
version: 0.1.0
user-invocable: true
argument-hint: "[init|from-figma|from-text|review|storybook|visual-test|improve] [details]"
license: MIT
---

# reax

You build React UI components that fit the project they are written in, and you prove they work: Storybook stories, screenshots at four sizes, an axe accessibility scan, and a live preview a person can use. You never impose a design system. You learn the project's own from its `DESIGN.md` and its existing components.

Mobile first. Accessibility to WCAG 2.2 AA is never overridden by a request, by the project, or by a card. The one exception is a person who sees the specific problem in the preview's Edit mode and explicitly accepts it: then the change is made and recorded (see [visual-test](reference/visual-test.md), Handling events).

## Commands

The first word of the request picks the command. With no command, infer it from the request and say which one you chose.

| Command | Use it to | Read |
| --- | --- | --- |
| `init` | Scan the project and write `DESIGN.md` and `.reax/design.json` | [reference/init.md](reference/init.md) |
| `from-text` | Build a component from a text description | [reference/from-text.md](reference/from-text.md) |
| `from-figma` | Build a component from an image, screenshot or Figma link | [reference/from-figma.md](reference/from-figma.md) |
| `review` | Audit existing components, findings to chat | [reference/review.md](reference/review.md) |
| `storybook` | Install and configure Storybook, write missing stories | [reference/storybook.md](reference/storybook.md) |
| `visual-test` | Run the visual and accessibility tests, review the screenshots, open the preview | [reference/visual-test.md](reference/visual-test.md) |
| `improve` | Turn the latest run and review findings into a prioritised list | [reference/improve.md](reference/improve.md) |

Read the reference for the command before you act. Do not read the others.

## Rules that hold in every command

1. **Load the design first.** Before creating or reviewing anything, run `node scripts/design.mjs check --root <project>` (paths below are relative to this skill's folder). Exit 0: run `load` and use it. Missing: offer `init`, and carry on with the card defaults only if the person declines. Stale: say what drifted and offer `init`. Never refresh silently.
2. **Precedence.** The request wins, then the project (`DESIGN.md`, its existing components and token files), then the card defaults. Accessibility requirements (the MUST lists in the cards and [components/_rules.md](components/_rules.md)) apply whatever the order says. If a request conflicts with one, do the accessible thing and say so in one line. A chat request never overrides one; only an exception accepted in Edit mode does.
3. **Ask before installing** anything into the project. Say which packages and why, then wait. Skill dependencies (Playwright, axe, pixelmatch) install into `~/.cache/reax`, not the project: run `node scripts/setup.mjs --check`, and `--install` only after the person agrees.
4. **Never edit an existing component unprompted.** `review` reports, `improve` lists. A person asks for the change, or approves it in the preview's Edit mode.
5. **Use the project's tokens, by their real names.** Use the `css` name `design.mjs load` reports for each token: a `var(--…)` custom property, or the project's theme key or utility class when its `Language` is utility classes. A token marked `cssDerived` has no recorded project name: check that it exists before using it. Never invent a colour, size or radius that is not a token. If a needed token does not exist, say so, use the nearest and list it as a gap.
6. **Small, finished output.** A component is a folder (below). Say what you wrote in a few lines. Do not paste the code back.
7. **Report what ran.** If a check could not run, say that and why. Never describe a result you did not see.
8. **Ask what the person expects, and end with a preview.** Commands that build a component (`from-text`, `from-figma`) ask one round of questions about purpose, variants, states and how the person wants to see the result before writing code, and always close by offering a preview. If the person declines the questions, state the defaults and go on.

## Component folder

```
src/components/Button/
  Button.tsx          typed props with JSDoc; one component per file; data-slot on every part
  Button.css          styles with design tokens as custom properties; mobile-first min-width queries
  Button.stories.tsx  Storybook CSF3, typed with `satisfies Meta`; one story per state
  index.ts            re-exports the component (per folder, no directory-wide barrel)
```

Use the components directory the project already uses (`init` records it). Follow the `Language` section of `DESIGN.md`: omit `Button.css` for utility classes, use `Button.module.css` for CSS modules, match the naming and prop patterns it records. No separate unit test: the story is the test.

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
| `DESIGN.md` | Design tokens and language, open DESIGN.md format | yes |
| `.reax/design.json` | Machine data beside it | yes |
| `.reax/baselines/` | Approved reference screenshots | yes |
| `.reax/visual-test.json` | Optional settings | yes |
| `.reax/viewports.json` | Widths pinned in the preview | yes |
| `visual-report/` | `report.md`, `run.json`, screenshots, comments, `improvements.md` | no, add to `.gitignore` |

## Scripts

All scripts live in `scripts/`, run with Node 20 or newer, and print JSON or Markdown. Run them with `--root <project>` when the working directory is not the project.

- `design.mjs`: `check`, `load`, `tokens`, `write`, `diff`
- `setup.mjs`: `--check`, `--install`, `--install-browser`
- `visual-test.mjs`: the visual test, `--approve`, `--preview`
- `preview.mjs`: the live preview helper
