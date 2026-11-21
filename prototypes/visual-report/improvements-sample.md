# Visual report (PROTOTYPE sample)

> Throwaway static sample for ticket #6. Counts and rules are placeholders.

Run 2026-11-21 · Storybook stories · Viewports 390×844 and 1280×800 · Threshold 0.1% (warn only)

| Result | Count |
| --- | --- |
| Pass | 9 |
| Warning | 2 |
| Failure | 1 |

## Screenshot results

- **Failure**: `Modal/Confirm` at 1280×800. Pixel diff 2.41%. 320px reflow overflows. 1 serious a11y finding blocks the run.
- **Warning**: `Card/Product` at 390×844. Pixel diff 0.32%, above the 0.1% threshold.
- **Pass**: `Button/Primary` at 390×844. Pixel diff 0.00%.

## Accessibility findings

axe-core: serious and critical block the run. Moderate and minor are reported only.

### Serious (blocks)

- `Modal/Confirm`: dialog has no accessible name (`aria-dialog-name`, `#confirm-modal`). Give the dialog an `aria-labelledby` pointing at its heading.

### Moderate

- `Card/Product`: image lacks alt text (`image-alt`, `.card-media img`).

### Minor

- `Button/Primary`: focus ring thinner than the design token (`focus-visible`, `.btn:focus-visible`).

## Improvements

- Fix the modal name and reflow overflow before the next run.
- Re-baseline `Card/Product` only if the diff is intentional.
