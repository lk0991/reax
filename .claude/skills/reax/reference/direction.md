# direction

Give a project with no design system a look of its own, before any component is built. The output is the project's token file and `DESIGN.md`, so everything built afterwards is built against it. Use it when `init` finds no tokens, or when the person asks for a new look. A project that already has a coherent look keeps it: record it with `init` instead.

The aim is a direction that could only belong to this product. AI-generated UI drifts to a few looks whatever the subject; this flow exists to not land there by default. (Approach adapted from the impeccable skill's new-work flow.)

## 1. Product truth: PRODUCT.md

If `PRODUCT.md` exists at the project root, read it and ask only about what it does not answer. Otherwise ask one round (the question tool if available), each question with a recommended answer you derived from the repository:

- **Who uses it, and in what situation?** Where, on what device, under what light, how often, in what mood. This decides light or dark, density and type size; never choose them by category.
- **What is it for, and what makes it different?** The one thing a neighbouring product could not claim.
- **Two or three products it should sit beside.** They set the craft bar, not the look.
- **Anything already fixed:** a name, logo, colour, face or rule the person made binding.

Do not ask for colours, fonts or a style in this round: a look named in a question is the one the answer confirms. If the person volunteers a binding look, record it and honour it.

Write `PRODUCT.md` with only what was confirmed, in the format the impeccable skill also reads (omit empty sections):

```markdown
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
## Product Purpose
## Positioning
## Operating Context
## Brand Commitments
## Product Principles
```

## 2. Derive directions

1. Name the product's mechanism in one sentence and the user's real scene. Name the look this category always ships, and its predictable opposite: both are the rut.
2. From the users' own world, list seven concrete things they know by heart: artifacts, places, printed matter, rituals, graphic traditions (a survey map, a field guide's plate, a ticket, a ledger). Not the category's software, and not the tools of the trade as a costume. Order them by how well they can carry the product.
3. Turn the strongest **three** into complete directions that differ in idea, not shade: each a different world, so the person has a real choice.

Each direction decides colour, type, spacing and density, and shape and depth. Write them as a JSON array (`directions.json` in the scratchpad):

```json
{
  "id": "survey", "name": "Survey sheet",
  "thesis": "One sentence: the world it comes from and what that gives the product.",
  "scene": "The use scene that decided light or dark.",
  "references": ["OS Maps", "Things"],
  "colors": { "bg": "#f3f6f0", "surface": "#ffffff", "surface-sunken": "#e4ebdf", "ink": "#17241b", "ink-muted": "#4a5a4e",
              "primary": "#1f6b45", "on-primary": "#ffffff", "border": "#cfdac9", "control": "#6f8273", "focus": "#1f6b45", "danger": "#a8261b" },
  "type": { "display": { "family": "Archivo", "fallback": "system-ui, sans-serif", "weight": 700, "google": true },
            "body": { "family": "Public Sans", "fallback": "system-ui, sans-serif", "weight": 400, "google": true },
            "base": 16, "ratio": 1.2, "lineHeight": 1.5 },
  "space": { "unit": 4, "density": "balanced", "target": 44 },
  "shape": { "radius": { "sm": 2, "md": 4, "lg": 6 }, "border": 1, "depth": "flat" }
}
```

- **Colour:** pick a strategy first: restrained (tinted neutrals and one accent, usual for app screens), committed (one colour carries much of the surface), or a small named palette. Tint neutrals toward the world; pure grey reads as unchosen. `control` is the border of inputs and must reach 3:1; `border` is decorative.
- **Type:** faces as objects from the world, in the product's register. Workhorse text faces suit screens people operate; the display face carries the voice. Mark a serif display with `"serif": true`. Use Google Fonts faces (`"google": true`) or system stacks.
- **Density:** `compact`, `balanced` or `airy`, from the scene: a tool used all day is denser than one used once a week. `target` is the touch target in px (44 for touch-first).
- **Shape and depth:** radii in px; `depth` is `flat` (borders and tints), `soft` (light shadows) or `layered`.

Run `node scripts/direction.mjs check --dirs <file>`. **Errors** are accessibility Requirements (contrast, target size) or missing values: fix every one before showing anything. **Warnings** flag a display face AI-generated UI overuses, a known AI look (cream and serif with a terracotta accent, near-black with a neon accent), pure-grey neutrals, or two directions too alike. A warning is not a ban: the person's brief can earn any of them. Without that, rework the direction.

## 3. Show them: the specimen

Write the person's **first screen** as an HTML fragment with their real content (their product's words, plausible data marked as examples where it could be mistaken for real), using the specimen classes: `sp-btn` (`--secondary`, `--ghost`), `sp-field`, `sp-label`, `sp-input`, `sp-hint`, `sp-error`, `sp-check`, `sp-card`, `sp-badge`, `sp-dialog`, `sp-toast`, `sp-row`, `sp-grid`, `sp-muted`, `sp-display`, and the tokens (`var(--space-md)`, `var(--text-2xl)` and so on). Then:

```
node scripts/direction.mjs specimen --root <project> --dirs <file> --screen <screen.html> --product "<name>"
```

It writes `visual-report/directions/index.html`, every direction one after another on the same screen and components, and screenshots of each at 390 and 1280. **Look at every screenshot** before showing the page; fix what looks wrong (overflow, an unreadable pairing, a direction that does not live up to its thesis) and render again.

Show the page: locally, the file in a browser; in a cloud session (`previewReachable: false`), publish it as a private Artifact (it has no other files). Tell the person in a few lines what each direction is and what it is good for, and ask them to pick one or steer: "calmer", "the second, but warmer", "more like X". Steering makes a new round of three that keeps what they liked; never more than three on the page.

## 4. Commit

When the person picks one:

```
node scripts/direction.mjs commit --root <project> --dirs <file> --pick <id> --token-file <path> [--product "<name>"]
```

It shows the token file (custom properties: colours, fonts, text sizes, spacing, radii, shadows), `DESIGN.md` and the sidecar it would write. Put the token file where the project keeps styles (`src/styles/tokens.css` by default) and say how it gets loaded: imported once in the app's entry CSS or file, and in `.storybook/preview` when Storybook exists. Show the diff, and run it again with `--apply` only after a yes. It refuses a direction with errors.

Then load the fonts: the token file's comment has the Google Fonts URL; add the `<link>` to the HTML head, or self-host the same faces. Ask before adding a package.

`DESIGN.md` records the direction (thesis, scene, references) in its Overview and Do's and Don'ts, and the sidecar keeps the full direction. From here on every command builds against it. Dark mode and motion are listed as gaps; a second theme is a later direction round.
