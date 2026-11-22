# storybook

Install and configure Storybook in the project, and write stories for components that have none. Storybook 8 or newer (7 works on a best-effort basis).

## Steps

1. **Check** `package.json` and `.storybook/`: is `storybook` a dependency, and which version? (`node_modules/storybook/package.json` has the installed one.) Cases:
   - Installed and supported: skip to step 4.
   - Installed but older than 8: say the preview needs 8 or newer and ask before upgrading.
   - Not installed: continue.
2. **Ask first** (SKILL.md rule 3): "Install Storybook with `npx storybook@latest init`? It adds dev dependencies and a `.storybook/` folder." Wait for yes. Use the project's package manager.
3. **Run the init** non-interactively (`--yes`, `--no-dev`, `--skip-install` is not used). It picks the framework (`@storybook/react-vite` for Vite projects). Then:
   - Make `.storybook/preview.ts` import the project's global CSS and token files so stories render with the real tokens.
   - Remove the sample `src/stories/` folder the init adds, after telling the person.
   - Add `storybook-static` and `visual-report` to `.gitignore`.
   - Do not add the Storybook test runner or Chromatic. `visual-test` is the test.
4. **Write missing stories.** For each component without a `Name.stories.tsx` (scope: named or changed components), write one following [from-text](from-text.md) step 5: `satisfies Meta`, an `argTypes` description for every prop, one story per state from the card, a long-text story. Do not edit existing stories unprompted.
5. **Verify** by running `visual-test --component Name`: it builds Storybook, which proves the setup works. If the build fails, report Storybook's last lines and fix only what you caused.

## Output to the person

What was installed or written, and the one command to start Storybook (`npx storybook dev`).
