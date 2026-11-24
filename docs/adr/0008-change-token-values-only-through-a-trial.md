# Change token values only through a trial the person sees and keeps

A design-system owner's most common job is changing a token's value. reax now does it, but only one way: the `tokens` command proposes values, refuses one that newly breaks a contrast pair (offering the nearest value that passes), writes the change as a trial with a backup, shows every changed component before and after on the quality verdict, and keeps it or undoes it exactly on the person's word. This revises the earlier rule (#23, the ADR 0001 consequence) that values never change from reax.

## Considered options

- **Keep values read-only.** Rejected: it leaves the owner's main job outside the skill, done by hand in a file they do not edit.
- **Let the Preview's Edit mode change values inline.** Rejected: an inline edit changes a shared value without showing what else it touches. Edit mode keeps swapping tokens on one part only.
- **Plan without writing, and show a simulation.** Rejected: the only faithful picture of the impact is the project's own components rendered with the new value, which means writing it. A trial with an exact undo gives that without commitment.

## Consequences

- The change lands where the project keeps the value: the token file at the line the sidecar records, under the project's own custom property name. In DESIGN.md only the value inside its YAML block changes, so prose a person wrote stays. The sidecar's hashes are refreshed, so DESIGN.md is not reported stale.
- Contrast pairs are found by the usual token names (text on grounds, `on-X` on `X`, accents on grounds); a project with unusual names gets fewer checks, and the visual test's axe scan still applies.
- One trial is open at a time; a second is refused until the first is kept or undone.
