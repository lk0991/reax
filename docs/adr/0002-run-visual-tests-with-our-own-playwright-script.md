# Run visual tests with our own Playwright script, not Storybook's test runner

`visual-test` is a small script shipped in the skill. It builds Storybook statically, reads the story list from `index.json`, opens each story in Playwright, takes the captures, runs axe-core, and compares against baselines with `pixelmatch`. Its dependencies live in a user-level cache, not in the target project.

## Considered options

- **Storybook's test runner** (`@storybook/test-runner`). Rejected: it is still at 0.26 while Storybook is at 10, and it ties captures and accessibility checks to a tool whose shape changes with each Storybook major version.
- **Storybook's Vitest addon** (`@storybook/addon-vitest`). Rejected: it assumes the project adopts Vitest and its browser mode, and it has no notion of our four captures, baselines under `.reax/`, or the text report.
- **Playwright Test with `toHaveScreenshot`.** Rejected: it would add a second test runner to the project and decide baseline names and storage for us.

## Consequences

- We own the runner. The only things that can break it are Storybook's `index.json` format and Playwright itself, so the implementation must check the story list format first.
- A project that wants these checks in CI can install the same packages itself; the script uses the project's own copies when they exist.
- Dependencies in `~/.cache/reax/` keep the skill from changing the project's lockfile, at the cost of a first-use download after confirmation.
