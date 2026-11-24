# reax sample

A small React and Storybook project for running the reax skill end to end. It has a token file whose names are not the open DESIGN.md names, a `DESIGN.md`, a `COMPONENTS.md` (its component conventions) and design sidecar, and four components:

- **Button** and **ProfileCard** pass. ProfileCard changes layout at the tablet breakpoint.
- **Dialog** is a native modal dialog, for keyboard and focus checks. Its `NoFocusReturn` story is deliberately broken: focus does not return to the trigger, so the keyboard checks must fail it.
- **Today** (`src/screens/Today`) is a screen built only from Button and ProfileCard, with stories for Loaded, Empty, Loading, Error and LongContent under the title `Screens/Today`. It was built with the `screen` flow: building it showed ProfileCard hard-coded an `h3`, so ProfileCard gained a `headingLevel` prop.
- **Chip** is deliberately broken (no accessible name, low contrast, `px` text). A visual test must fail on it.

Install with `npm install` here, then run the skill's scripts with `--root examples/sample`: `visual-test.mjs --all` should exit 1 with Chip's blocking findings and the NoFocusReturn keyboard failure, `--approve all` approves every story except Chip, and `--preview` opens the live preview. Baselines depend on the machine's fonts, so they are not committed here.
