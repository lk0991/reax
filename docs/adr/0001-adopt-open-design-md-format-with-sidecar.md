# Adopt the open DESIGN.md format, with reax's own data in a sidecar

`DESIGN.md` follows the open DESIGN.md specification (YAML design tokens plus its standard sections), and reax's additions (Language, Component inventory, Gaps) are extra sections the spec tells consumers to preserve. Data the spec cannot hold (the source file of each token, the component inventory, language fields, shadows, scan stamps) lives in a sidecar, `.reax/design.json`, so the file stays valid for other tools and a project's existing `DESIGN.md` is extended, never replaced.

## Considered options

- **A bespoke `DESIGN.md` layout** (the Tokens, Language, Component inventory and Gaps sections first decided for `init`). Rejected: a project that already uses another tool's `DESIGN.md` would have two incompatible files with one name, and its tokens could not flow to Tailwind theme configs, Figma variables or `tokens.json`.
- **Putting reax's data in the token tree.** Rejected: the spec does not say what a consumer does with an unknown top-level key, and a token may be defined only once.

## Consequences

- The project's own token files own the values. `DESIGN.md` is derived. A change to a token's value is made in the source file and `DESIGN.md` together, through the `tokens` command's trial (ADR 0008). The preview's Edit mode never changes a token's value: it swaps which token a part uses, in the component's own styles.
- One loader reads the file and the sidecar; nothing else parses the markdown. If the spec changes (it is marked alpha), only the loader changes.
- Two files must stay in step, so every reading command compares content hashes and warns when they have drifted.
