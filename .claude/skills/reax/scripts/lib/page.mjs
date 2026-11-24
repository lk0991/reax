// The shell every page reax publishes shares: the screenshot gallery, the direction specimen, the verdict, before/after
// and catalogue pages. It holds what the Artifact page contract asks of every page (a title, colour tokens for light and
// dark with an explicit data-theme override, the safe-area side gutter, no scripts and no document skeleton, since the
// publisher wraps the page in its own), so each page module writes only its own content.

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LIGHT = '--bg: #fbfbfa; --ink: #1b1b1b; --muted: #5d5d5d; --line: #dcdcd8; --card: #ffffff; --bad: #a3261d; --warn: #8a5a00; --ok: #1f6a3a; --accent: #2f5bd3;';
const DARK = '--bg: #161616; --ink: #ececec; --muted: #a8a8a8; --line: #333333; --card: #1f1f1f; --bad: #ff8b80; --warn: #e8b85c; --ok: #7ccf98; --accent: #8fb0ff;';

const BASE = `* { box-sizing: border-box; }
body { margin: 0; padding-block: 24px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); background: var(--bg); color: var(--ink); font: 1rem/1.5 system-ui, sans-serif; }
h1, h2, h3 { text-wrap: balance; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }`;

/**
 * @param {{ title: string, css?: string, body: string, head?: string, base?: boolean }} p
 *   head: extra lines after the metas (a font stylesheet); base: false leaves out the shell's body styles, for a page
 *   that lays out its own full-bleed sections (the specimen)
 */
export function page({ title, css = '', body, head = '', base = true }) {
  return `<title>${esc(title)}</title>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
${head ? `${head}\n` : ''}<style>
:root { ${LIGHT} color-scheme: light; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${DARK} color-scheme: dark; } }
:root[data-theme="dark"] { ${DARK} color-scheme: dark; }
${base ? BASE : '* { box-sizing: border-box; }\nbody { margin: 0; background: var(--bg); color: var(--ink); font: 1rem/1.5 system-ui, sans-serif; }'}
${css}
</style>
${body}
`;
}
