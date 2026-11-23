# review

Audit existing components against `DESIGN.md`, the component cards and the mobile-first and AI-usability goals. Findings go to **chat only**. Nothing is edited and no file is written.

## Steps

1. **Load the design** (SKILL.md rule 1). Decide the scope: components named in the request, the components that changed per git (`git status`), or all components if asked. State the scope.
2. **For each component** load its card (through `_aliases.md`) and `_rules.md`. Read the component's `.tsx`, `.css` and stories. If a visual report from a recent run exists (`visual-report/run.json`), use its axe findings rather than guessing.
3. **Check, in this order:**
   - **Accessibility** against the card's Requirements and the shared Requirements in `_rules.md`: name, role, keyboard, focus, contrast, target size, motion, labels, error association.
   - **Mobile first**: `min-width` queries, no fixed widths that break at 320px, text sized in relative units for 200% text, touch targets.
   - **Tokens**: raw colours, sizes and radii that have a token; tokens that do not exist.
   - **Card review checks**: every check on the card's list.
   - **API**: typed props with JSDoc, names consistent with the project's pattern, `data-slot` on every part, a story for every state, no duplicate of an existing component.
   - **AI usability**: a clear props surface and story coverage so an agent can use the component without reading its internals.
4. **Report** per component, worst first. Use three groups: **Blocking** (breaks a Requirement or the component), **Should fix** (deviates from a Default, or a token, API or story problem), **Looks fine**. A Default the project or `DESIGN.md` overrides on purpose is not a finding. Each finding: what, where as `path:line`, why in a few words, the fix in one line. Cite the rule, such as WCAG 2.2 SC 2.5.8 or the card check number.
5. **Do not pad.** If a group is empty, say "none". Do not list things that are fine except in "Looks fine", one line.
6. **Close** by offering `visual-test` for rendered evidence and `improve` for a written list. Offer to make the fixes, one component at a time. Make none unprompted.

A finding you could not verify (it depends on rendering) is marked "not verified, needs visual-test".
