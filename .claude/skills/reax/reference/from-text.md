# from-text

Build a component from a plain-text description.

## Steps

1. **Load the design** (SKILL.md rule 1). Read the component inventory: if the project already has this component (check `_aliases.md`), stop and say so. Offer `review` or a new variant. Do not overwrite.
2. **Load the card** for the component, resolved through `components/_aliases.md`, and `components/_rules.md`. Components with no card use `_rules.md` only. Compound requests (a form with fields and a submit button) load a card per part, at most about six.
3. **Ask what the person expects before you write code.** One short round of questions, asked together (the question tool if available, otherwise plain text), each with a recommended answer. Always cover: what the component is for, which variants and sizes, which states and features (the card's states list is the menu), and how they want to see the result (see step 8). Skip a question only when the request already answers it. Then ask nothing more unless it blocks the build. Check the request for the things the card marks as required (for example a Dialog needs a title; an Input needs a label). If the person declines the questions, state the defaults you will use and go on. Do not re-ask.
4. **Plan the API** in two or three lines: props with types, variants, states. Apply the precedence order: request, project conventions, card defaults. Names come from `DESIGN.md` (`size="md"`, not a pixel value).
5. **Write the component folder** (SKILL.md) in the project's components directory:
   - `Name.tsx`: typed props with JSDoc on every prop, one component per file, `data-slot` on every part with the card's slot names, native elements first, accessible name, visible focus, keyboard behaviour from the card's Requirements, and its Defaults unless the request or project says otherwise. Spread remaining props onto the root. Forward `ref` when the card says so.
   - `Name.css` (or module, or none): tokens as `var(--…)` custom properties, mobile-first `min-width` queries using the project's breakpoints, sizes in `rem` or `em` for text and spacing so 200% text scale works, no fixed widths that break at 320px, touch targets at least 24×24px (larger only when `DESIGN.md` says so), `:focus-visible` outline, `prefers-reduced-motion` respected.
   - `Name.stories.tsx`: CSF3, `satisfies Meta<typeof Name>`, `title` as `Components/Name`, an `args`/`argTypes` description for every prop, one story per state in the card's "states to stories" list, a long-text story, and a disabled or error story where relevant. Add the tag `reax-skip` only for a story that cannot be captured deterministically, and say why.
   - `index.ts`: `export * from './Name'`.
6. **Type-check** the files if the project has `tsc` set up (`npx tsc --noEmit -p .`). Fix what you caused.
7. **If Storybook is not installed**, say so and offer the `storybook` command. Do not install it unasked.
8. **Always close by offering a preview.** Never end with only "run visual-test later". Offer, with a recommendation:
   - the live preview via `visual-test` when the project can run Storybook (installs need approval, rule 3);
   - otherwise a static HTML preview showing every state at 390px and at desktop width, which needs no installs.
   Run the one the person picks. If none is possible, say why in one line.

## Output to the person

Three to six lines: what you asked and what was decided, where the files are, the props and variants in one line, anything you assumed, any token that was missing and what you used instead.
