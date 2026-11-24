# change

Change an existing component because a person asked: a new variant, size or state, or a fix. Editing an existing component is right here because it was asked for (SKILL.md rule 4); change only what was asked.

## Steps

1. **Load the design** (SKILL.md rule 1), the component's card (through `_aliases.md`) and `_rules.md`, and `COMPONENTS.md`. Read the component's files and its stories.
2. **Restate the change in a line** and what it will not touch: "Add a `ghost` variant to Button; the other variants, sizes and states stay as they are." If the request is unclear about something the card treats as required, ask once.
3. **Make the change the project's way.** Follow `COMPONENTS.md` (how variants are declared and styled, prop naming, class names) and the card (anatomy, slots, Requirements). Use the project's tokens by their real names. Keep the component's existing API working: add, do not rename or remove, unless the person asked for that.
4. **Write the stories** for what is new: one per new variant, size or state, in the project's story conventions, and the state tags for hover, pressed and focus where the card lists them. Do not edit existing stories unless the change makes them wrong.
5. **Type-check** if the project has it.
6. **Show it:** run the [verdict](verdict.md) with `--component <Name>`. Its before and after shows the new stories (nothing approved to compare against yet) and any existing story that moved. An existing story that moved is a change the person did not ask for unless it explains why: fix it, or say why it had to move.
7. **Report** in a few lines: what changed, the verdict's level and headline, and the page. Then offer to approve the new screenshots once the person is happy ([visual-test](visual-test.md), Baselines).
