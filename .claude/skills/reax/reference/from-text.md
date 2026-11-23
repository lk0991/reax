# from-text

Build a component from a plain-text description.

## Steps

1. **Find out what the build will need, without asking yet.** Run `design.mjs check`, `setup.mjs --check --root <project>`, and look for Storybook (`package.json`, `.storybook/`). Read the component inventory: if the project already has this component (check `_aliases.md`), stop and say so, and offer `review` or a new variant. Do not overwrite.
2. **Load the card** for the component, resolved through `components/_aliases.md`, and `components/_rules.md`. Components with no card use `_rules.md` only. Compound requests (a form with fields and a submit button) load a card per part, at most about six.
3. **Ask once: the component questions and the plan together.** One round, asked together (the question tool if available, otherwise plain text), each with a recommended answer:
   - **The component:** what it is for, which variants and sizes, which states and features (the card's states list is the menu). Skip a question the request already answers. Check the request for what the card marks as required (a Dialog needs a title; an Input needs a label).
   - **The plan**, as one list the person approves or adjusts, covering only what step 1 found missing: write `DESIGN.md` with `init` (or use the card defaults without one); install Storybook into the project (which packages, why); install the skill's test dependencies into `~/.cache/reax` and a browser; and how they want to see the result (step 8). Name every install and its reason: this approval is what rule 3 asks for.

   After this, ask nothing more unless it blocks the build. The only other stop is the `init` diff, which the person must see before it is written. If the person declines the questions, state the defaults you will use and go on. If they decline part of the plan, say what you will skip (for example "no Storybook, so no screenshots") and go on. Do not re-ask.

   Then carry out the approved parts in order: `init` (show its diff and wait: the one extra stop), the Storybook install (the [storybook](storybook.md) command, without asking again), and `setup.mjs --install` and `--install-browser`.
4. **Plan the API** in two or three lines: props with types, variants, states. Apply the precedence order: request, project conventions, card defaults. Names come from `DESIGN.md` (`size="md"`, not a pixel value).
5. **Write the component folder** in the project's components directory. When `COMPONENTS.md` exists, it decides the shape, and the list below fills only what it does not say: the folder layout and file names, how the component and its props are declared and exported, the index file, how styles select variants, class names, prop naming (the emphasis prop, boolean prefix, handler names), and its Template. Where it lists a convention as mixed and not decided, use its newest pattern and say so. The card still decides anatomy, slots, states and Requirements. Without `COMPONENTS.md`, use the skill's component folder (SKILL.md):
   - `Name.tsx`: typed props with JSDoc on every prop, one component per file, `data-slot` on every part with the card's slot names, native elements first, accessible name, visible focus, keyboard behaviour from the card's Requirements, and its Defaults unless the request or project says otherwise. Spread remaining props onto the root. Forward `ref` when the card says so.
   - `Name.css` (or module, or none): tokens as `var(--…)` custom properties, mobile-first `min-width` queries using the project's breakpoints, sizes in `rem` or `em` for text and spacing so 200% text scale works, no fixed widths that break at 320px, touch targets at least 24×24px (larger only when `DESIGN.md` says so), `:focus-visible` outline, `prefers-reduced-motion` respected.
   - `Name.stories.tsx`: in the project's story format, title scheme and meta tags from `COMPONENTS.md` (Stories), otherwise CSF3, `satisfies Meta<typeof Name>`, `title` as `Components/Name`; an `args`/`argTypes` description for every prop, one story per state in the card's "states to stories" list (hover, pressed and focus-visible by tag, as in `_rules.md` Stories), a long-text story, and a disabled or error story where relevant. Add the tag `reax-skip` only for a story that cannot be captured deterministically, and say why.
   - `index.ts`: `export * from './Name'`.
6. **Type-check** the files if the project has `tsc` set up (`npx tsc --noEmit -p .`). Fix what you caused.
7. **If Storybook was not approved**, say once that there are no stories to render or test until it is, and that the `storybook` command adds it.
8. **Always close by offering a preview.** Never end with only "run visual-test later". Offer, with a recommendation:
   - the live preview via `visual-test` when the project can run Storybook and the person can reach this machine;
   - in a cloud or remote session, the published screenshot gallery, and optionally a deployed Storybook ([visual-test](visual-test.md), "When the person cannot reach this machine");
   - without Storybook, no preview: say so and offer the `storybook` command.
   Run the one the person picks. If none is possible, say why in one line.

## Output to the person

Three to six lines: what you asked and what was decided, where the files are, the props and variants in one line, anything you assumed, any token that was missing and what you used instead.
