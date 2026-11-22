# reax

An agent skill that generates, reviews and visually tests React UI components. It learns your project's own design system (a `DESIGN.md` and your token files) and never imposes one.

- **Build** components from a text description or a Figma or image design, as a folder with typed props, styles on your tokens, Storybook stories and `data-slot` parts.
- **Review** existing components against your design and WCAG 2.2 AA.
- **Test** every story at four sizes (390, 1280, 320px reflow, 200% text) with Playwright and axe-core, compared with approved baselines. The report is plain Markdown.
- **Preview** a component live: use it, resize it, comment on any element, see how it is built, and change values as a draft that Claude writes to code.

## Install

Copy `.claude/skills/reax/` into your project's `.claude/skills/` folder, or into `~/.claude/skills/` to use it everywhere. Requires Node 20 or newer and a React project. Storybook 8 or newer is installed by the skill's `storybook` command, after asking.

## Commands

| Command | What it does |
| --- | --- |
| `init` | Scans the project, writes `DESIGN.md` and `.reax/design.json`. Never overwrites. |
| `from-text` | Builds a component from a description. |
| `from-figma` | Builds a component from an image, screenshot or Figma link. |
| `review` | Audits components, findings in chat. |
| `storybook` | Installs Storybook and writes missing stories. |
| `visual-test` | Runs the tests, reviews the screenshots, opens the live preview. |
| `improve` | Writes a prioritised list to `visual-report/improvements.md`. |

Ask in plain words ("build a dialog that confirms deleting a project") or start with the command name.

## Layout

```
.claude/skills/reax/
  SKILL.md              entry point and rules
  reference/            one file per command
  components/           component cards, _rules.md, _aliases.md
  scripts/              design loader, visual-test, preview helper, setup
docs/adr/               architecture decisions
CONTEXT.md              glossary
```

The skill's script dependencies (Playwright, axe-core, pixelmatch) install into `~/.cache/reax`, never into your project. Run `node .claude/skills/reax/scripts/setup.mjs --check` to see what is missing.

## Develop

```
node --test .claude/skills/reax/scripts/test/design.test.mjs
```

The decisions behind the skill are in `docs/adr/` and `CONTEXT.md`.
