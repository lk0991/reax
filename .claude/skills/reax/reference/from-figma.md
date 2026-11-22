# from-figma

Build a component from a design: an image, a screenshot, or a Figma link.

## Input

- **Image or screenshot**: look at it. This always works.
- **Figma link**: try the Figma connection (MCP). If it is not connected or fails, say so in one line and ask for an exported image or screenshot instead. Do not guess the design from the URL.

## Steps

1. **Load the design** and the card(s), as in [from-text](from-text.md) steps 1 and 2.
2. **Read the design into a spec** before writing code, and show it in a short list: the parts (matching card slots where they exist), the variants and states visible, text content, measured sizes and spacing, colours.
3. **Map every value to a project token.** Take the nearest token for each colour, space, radius and type size. If a value is within a small tolerance, use the token without comment. If it is far from any token, use the nearest and list it as a deviation. Never write a raw value to match the picture.
4. **Accessibility beats the picture**: if the design shows a 20px touch target or low-contrast text, build it accessibly (24px floor, 4.5:1 text contrast) and report the difference.
5. **Responsive behaviour**: a design is usually one width. Make it mobile first: build the 390px layout, then the wider one. Say what you assumed for widths the design does not show.
6. **Write the component folder** exactly as in [from-text](from-text.md) step 5.
7. **Compare**: if you can render it (Storybook installed), run `visual-test --component Name` and look at the screenshots next to the original design. List differences under "Differs from the design" in your reply. Do not tune pixels to match when it breaks a token or an accessibility rule.

## Output to the person

Where the files are, the deviations from the design (token substitutions, accessibility changes), and what the design did not show.
