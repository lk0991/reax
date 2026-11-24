# reax

An agent skill that gives a React project a look of its own, builds and changes its components and screens, and checks them. It learns your project's own design system (a `DESIGN.md`, a `COMPONENTS.md` and your token files) and never imposes one.

- **Set the look.** A project with no design system gets three directions to choose from, shown side by side on its own first screen, then its own token file and `DESIGN.md`.
- **Build** components and whole screens from a text description or a Figma or image design. A component is a folder with typed props, styles on your tokens, Storybook stories and `data-slot` parts; a screen is composed only from your components, with stories for each state.
- **Follow your conventions.** `init` learns how your project writes components (layout, names, props, styling, stories) and new work matches it.
- **Review** existing components against your design, your conventions and WCAG 2.2 AA.
- **Test** every story at four sizes (390, 1280, 320px reflow, 200% text) with Playwright and axe-core, plus keyboard and focus checks with real key presses, compared with approved baselines.
- **See the system.** A catalogue of every token and component, and a before and after of every change.
- **Know if a change can merge.** One plain-language verdict per change (type check, your lint, the visual test, review, conventions, fit with the design, scope, and a fresh reviewer that did not write the code), then approve it and hand it off as a pull request.
- **Preview** a component live: use it, resize it, comment on any element, see how it is built, and change values as a draft that Claude writes to code.

## Install

Copy `.claude/skills/reax/` into your project's `.claude/skills/` folder, or into `~/.claude/skills/` to use it everywhere. Requires Node 20 or newer and a React project. Storybook 8 or newer is installed by the skill's `storybook` command, after asking.

## Commands

| Command | What it does |
| --- | --- |
| `direction` | Gives a project with no design system a look of its own: product questions, three directions on a specimen page, then the token file and `DESIGN.md`. |
| `init` | Scans the project, writes `DESIGN.md`, `COMPONENTS.md` and `.reax/design.json`. Never overwrites. |
| `from-text` | Builds a component from a description. |
| `from-figma` | Builds a component from an image, screenshot or Figma link. |
| `screen` | Builds a whole screen from your components, filling gaps with approval, and checks it fits the product. |
| `change` | Adds a variant, size or state to an existing component, or fixes one, and shows what moved. |
| `tokens` | Changes token values, shows every affected component before and after, then keeps or undoes it. |
| `review` | Audits components, findings in chat and saved for `improve`. |
| `storybook` | Installs Storybook and writes missing stories. |
| `visual-test` | Runs the tests, reviews the screenshots, writes the report, the gallery and the catalogue, opens the live preview. |
| `verdict` | Answers "can this change merge without developer review?", then approves it and prepares the pull request. |
| `improve` | Writes a prioritised list to `visual-report/improvements.md`. |

Ask in plain words ("build a dialog that confirms deleting a project", "make the primary a little warmer") or start with the command name.

## Layout

```
.claude/skills/reax/
  SKILL.md              entry point and rules
  reference/            one file per command
  components/           component cards, _rules.md, _aliases.md
  scripts/              design loader, direction, visual-test, verdict, preview helper, setup
examples/sample/        a small React and Storybook project to run the skill on
docs/adr/               architecture decisions
CONTEXT.md              glossary
```

The skill's script dependencies (Playwright, axe-core, pixelmatch) install into `~/.cache/reax`, never into your project. Run `node .claude/skills/reax/scripts/setup.mjs --check` to see what is missing.

## Develop

```
node --test .claude/skills/reax/scripts/test/*.test.mjs
```

Some tests need Chromium and skip without it. [`examples/sample`](examples/sample) runs the whole pipeline; its README says what to expect. The decisions behind the skill are in `docs/adr/` and `CONTEXT.md`.

## License

See [LICENSE](LICENSE).
