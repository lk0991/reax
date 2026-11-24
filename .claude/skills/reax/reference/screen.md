# screen

Build a whole screen from the project's own components, and check it still looks like the product. A screen is where generic UI shows most: hierarchy, spacing rhythm, density and the states nobody designed. Use it when someone asks for a page or view ("the dashboard", "the sign-in screen"), not a single component.

## Steps

1. **Load the design** (SKILL.md rule 1), `COMPONENTS.md` and `PRODUCT.md` if they exist. A project with no tokens needs [direction](direction.md) first: a screen on generic defaults looks generic.
2. **Ask once** (the same single round as [from-text](from-text.md) step 3): what the person does on this screen and what they need to see first, which states matter (empty, loading, error), and what must not change. Skip what the request already answers. Do not ask for a layout or a look: the direction decides the look.
3. **Plan the parts** from the answers: a short list of named parts in reading order, each with its purpose ("Sightings list: what was seen today, newest first"). Write it as `screen.json` in the scratchpad:

   ```json
   { "name": "Today", "parts": [ { "name": "Page title", "purpose": "the date", "own": true }, { "name": "Button", "purpose": "log a sighting" }, { "name": "Profile card", "purpose": "one per sighting" } ] }
   ```

   Name a part after a component when it is one (a button, a card, a dialog); `component` is an explicit hint when the name is a description, and `"own": true` marks the screen's own content or layout (a heading, a paragraph of copy), which belongs in the screen and is neither a match nor a gap.
4. **Match the parts to what exists:** `node scripts/screen.mjs plan --root <project> --plan screen.json`. It matches each part to a component in the inventory (by name, or through the card and alias table), lists the parts with no match as **gaps**, and says where the screen goes.
5. **Fill the gaps, with approval.** Show the person the plan: the matches, and each gap with what it needs. For each gap, offer to build the missing component with [from-text](from-text.md), one at a time, each with its own approval and a preview. If the person declines one, leave that part out and say so in the final report. Never build a missing component inline in the screen, and never copy an existing component to adjust it: a variant is a [change](change.md).
6. **Compose the screen from components only.** The screen is a folder shaped like a component folder (component, styles, stories, index), in the `folder` the plan printed, following `COMPONENTS.md` for file names, props and styling. Its own code holds only what is specific to it: the page structure, the layout between parts (grid, flow, gaps from the spacing scale), the page's copy and its data. Every colour, size, radius and gap is a token by its real name; no raw values.
7. **Write the state stories**, titled with the plan's `storyTitle` (`Screens/Name`): `Loaded`, `Empty` (what the person sees before there is data, with a way forward), `Loading` (a placeholder that holds the layout), `Error` (what went wrong and how to recover) and `LongContent` (names and numbers longer than the sample). Stories pass the state through args, not a copy of the markup. Export the error story as `ErrorState` with `name: 'Error'`, so it does not shadow the global `Error`.
8. **End with the verdict** ([verdict](verdict.md)) with `--component <Name>` for the screen. It tests every state at the usual widths and at larger text, and its fit check says whether the screen still looks like the product: only tokens, spacing and type from their scales, one primary action. Report the level, then what the fit check found, in plain words.

## Output to the person

What the screen is made of in one line (the components it reuses), the components you built for it, the parts you left out, where the files are, and the verdict.
