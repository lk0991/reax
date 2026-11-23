# init

Scan the project and write `DESIGN.md` (open DESIGN.md format) and `.reax/design.json`. Never overwrites: show the diff, ask, then write.

## Steps

1. **Find the project root** (nearest `package.json`) and read: `package.json`, the CSS entry points, token files (`:root` custom properties, `tokens.css`, `theme.*`, Tailwind config, `@theme` blocks, a `tokens.json`), the components directory, and an existing `DESIGN.md` if any.
2. **Detect the language**: framework and version, styling approach (CSS custom properties, CSS modules, Tailwind or utility classes, CSS-in-JS), file naming, prop patterns (variant/size/intent naming), where components live, Storybook present or not.
3. **Collect tokens** from the project's own files. The project owns the values. Record the file, line and **real name** of each: the custom property (`--brand-blue-500`), or for a utility-class project the theme key or class (`colors.brand.500`, `bg-brand-500`). Put it in `tokenSources` as `css`. Generated code uses that name, never one derived from the `DESIGN.md` path. Group them as the format does: `colors`, `typography`, `spacing`, `rounded`, `motion`, `components`. Use the spec's names: spacing `xs sm md lg xl`, rounded `sm md lg full`, touch targets `spacing.size.24`, `.32`, `.44`, breakpoints `spacing.breakpoint.sm/md/lg` = 390/768/1280. Map the project's own names onto them only when the meaning is obvious, otherwise keep the project's name.
4. **Fill gaps with a proposed fallback scale** for any group the project has none of (marked `proposed`). A proposed token is written to the project only after the person confirms. Never put a proposed value in a token file silently.
5. **List the components** found, with path and the card each maps to (use `components/_aliases.md`).
6. **Ask at most three questions**, only where the scan cannot decide and the answer changes the output (for example: two competing token files, which is the source of truth; light-only or a dark theme too; a components directory choice). Offer a recommended answer for each. Do not ask what you can read. When `init` runs as part of `from-text` or `from-figma`, do the scan before that command's one round and put these questions in it, rather than asking separately.
7. **Write a draft** JSON to the scratchpad:

```json
{
  "name": "Acme UI",
  "description": "one sentence",
  "prose": { "overview": "...", "doDont": "..." },
  "tokens": { "colors": {}, "typography": {}, "spacing": {}, "rounded": {}, "motion": {}, "components": {} },
  "gaps": ["No motion tokens found"],
  "scan": { "tokenFiles": ["src/styles/tokens.css"], "componentsDir": "src/components", "hashes": {} },
  "sidecar": { "language": { "framework": "react 18", "styling": "css-vars" }, "inventory": [{ "name": "Button", "path": "src/components/Button", "card": "button" }], "tokenSources": { "colors.primary": { "file": "src/styles/tokens.css", "line": 2, "css": "--brand-blue-500" } }, "shadows": {}, "themes": [] }
}
```

   Hashes are computed by the writer; leave `scan.hashes` out.
8. **Show the diff**: `node scripts/design.mjs write --draft <draft.json>` (without `--apply`). Show it to the person and ask to apply.
9. **Apply** with `--apply` only after a yes. Then run `node scripts/design.mjs check` and report the result.

## Rules

- An existing `DESIGN.md`: keep the Overview, Do's and Don'ts and any section reax does not know, verbatim. Only token blocks and the Language, Component inventory and Gaps sections are regenerated.
- `init` on a project with its own design system: summarise what you found, do not restructure it.
- One `DESIGN.md` per package that owns components (monorepo): ask which package if it is not clear.
- Default theme only in this version. Note other themes under Gaps.
- If tokens drift later, `check` reports it. Nothing refreshes silently.
