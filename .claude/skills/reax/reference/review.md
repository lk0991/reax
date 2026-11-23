# review

Audit existing components against `DESIGN.md`, `COMPONENTS.md`, the component cards and the mobile-first and AI-usability goals. Findings go to chat, and are saved to `visual-report/review.json` so `improve` can use them in a later conversation. No component is edited.

## Steps

1. **Load the design** (SKILL.md rule 1). Decide the scope: components named in the request, the components changed on this branch or uncommitted (as `visual-test` picks them), or all components if asked. State the scope.
2. **For each component** load its card (through `_aliases.md`) and `_rules.md`. Read the component's `.tsx`, `.css` and stories. If a visual report from a recent run exists (`visual-report/run.json`), use its axe findings rather than guessing.
3. **Check, in this order:**
   - **Accessibility** against the card's Requirements and the shared Requirements in `_rules.md`: name, role, keyboard, focus, contrast, target size, motion, labels, error association.
   - **Mobile first**: `min-width` queries, no fixed widths that break at 320px, text sized in relative units for 200% text, touch targets.
   - **Tokens**: raw colours, sizes and radii that have a token; tokens that do not exist.
   - **Card review checks**: every check on the card's list.
   - **Conventions** (when `COMPONENTS.md` exists): run `node scripts/conventions.mjs --root <project> --check --component <names>`. It lists, per component, each recorded convention it breaks, with what is expected and what it does instead. Report one only if nothing explains it: drop a deviation that `COMPONENTS.md`'s Overview or Notes explain (an intended exception, or a convention the project is moving away from), or that the card or a Requirement asks for (a button card asks for `forwardRef`). A deviation is **Should fix** at most, never Blocking. Cite it as `COMPONENTS.md: <convention>`, with how widely it is followed ("3 of 4 components"), and give the fix in the project's own pattern, using its Template.
   - **API**: typed props with JSDoc, names consistent with the project's pattern, `data-slot` on every part, a story for every state, no duplicate of an existing component.
   - **AI usability**: a clear props surface and story coverage so an agent can use the component without reading its internals.
4. **Report** per component, worst first. Use three groups: **Blocking** (breaks a Requirement or the component), **Should fix** (deviates from a Default, or a token, API or story problem), **Looks fine**. A Default the project or `DESIGN.md` overrides on purpose is not a finding. Each finding: what, where as `path:line`, why in a few words, the fix in one line. Cite the rule, such as WCAG 2.2 SC 2.5.8 or the card check number.
5. **Save the findings** to `visual-report/review.json` (create the folder if needed; it is not committed). One entry per reviewed component, replacing that component's earlier entry and keeping the others:

   ```json
   { "Button": { "reviewedAt": "2026-11-23T09:00:00Z", "findings": [ { "rank": "blocking", "what": "Icon-only button has no name", "where": "src/components/Button/Button.tsx:42", "rule": "WCAG 2.2 SC 4.1.2", "fix": "Add aria-label", "verified": true } ] } }
   ```

   `rank` is `blocking` or `should-fix` (a convention deviation is always `should-fix`, with `rule` as `COMPONENTS.md: <convention>`). Set `verified: false` for a finding that needs visual-test. A component with no findings gets an empty list, so `improve` knows it was reviewed.
6. **Do not pad.** If a group is empty, say "none". Do not list things that are fine except in "Looks fine", one line.
7. **Close** by offering `visual-test` for rendered evidence and `improve` for a written list. Offer to make the fixes, one component at a time. Make none unprompted.

A finding you could not verify (it depends on rendering) is marked "not verified, needs visual-test".
