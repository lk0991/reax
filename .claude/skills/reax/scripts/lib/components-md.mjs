// Writes COMPONENTS.md: how this project writes components, learned by lib/conventions.mjs and judged by the agent in
// init. The Overview, Template and Notes are prose (the person's edits to Overview and Notes are kept on a re-run); the
// convention tables are regenerated. Decision: ADR 0006.
import { splitSections } from './write.mjs';
import { CONVENTION_GROUPS } from './conventions.mjs';

const GROUPS = CONVENTION_GROUPS;
const HUMAN = new Set(['Overview', 'Notes']);

const show = (v) => (Array.isArray(v) ? (v.length ? v.map((x) => `\`${x}\``).join(', ') : 'none') : typeof v === 'boolean' ? (v ? 'yes' : 'no') : v === '' ? '(no prefix)' : `\`${v}\``);
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function row(label, c) {
  if (!c || c.status === 'none') return null;
  if (c.status === 'mixed' && c.decided === undefined) {
    return `| ${label} | Mixed, not decided: ${c.options.map((o) => `${show(o.value)} (${o.count})`).join(', ')}. Newest: ${show(c.recommended)} | ${c.count} of ${c.total} | |`;
  }
  const value = c.decided !== undefined ? `${show(c.decided)} (decided; ${(c.options?.find((o) => JSON.stringify(o.value) === JSON.stringify(c.decided))?.count) ?? 0} of ${c.total} follow it)` : show(c.value);
  return `| ${label} | ${cell(value)} | ${c.count} of ${c.total} | ${cell((c.exceptions || []).join(', '))} |`;
}

// a title prefix reads better as the whole scheme: UI -> UI/{Name}
const title = (p) => (typeof p === 'string' && !p.startsWith('none') ? (p ? `${p}/{Name}` : '{Name}') : p);
function asTitle(c) {
  if (!c || c.status === 'none') return c;
  return { ...c, value: title(c.value), ...(c.decided !== undefined ? { decided: title(c.decided) } : {}), ...(c.recommended !== undefined ? { recommended: title(c.recommended) } : {}), ...(c.options ? { options: c.options.map((o) => ({ ...o, value: title(o.value) })) } : {}) };
}

export function composeComponentsMarkdown(draft, existing = null) {
  const conv = draft.components.conventions; const prose = draft.components.prose || {};
  const kept = existing ? new Map(splitSections(existing).sections.filter((s) => HUMAN.has(s.name) || !['Layout', 'Code', 'Styling', 'Props', 'Stories', 'Template', 'Tokens in code'].includes(s.name)).map((s) => [s.name, s.text])) : new Map();
  const parts = [`# Component conventions\n\nHow this project writes components, so new ones match. Written by reax \`init\` from ${conv.scanned} component${conv.scanned === 1 ? '' : 's'} in \`${conv.componentsDir}\`; the tables are regenerated, the Overview and Notes are yours. Machine-readable detail: \`@.reax/design.json\` (\`conventions\`).${draft.scan?.screensDir ? ` Screens live in \`${draft.scan.screensDir}\`, shaped like a component folder, with \`Screens/<Name>\` story titles.` : ''}`];
  parts.push(kept.get('Overview') || `## Overview\n\n${prose.overview || '<!-- draft: two or three sentences on how components are built here -->'}`);
  for (const [title, key, labels] of GROUPS) {
    const rows = Object.entries(labels).map(([k, label]) => row(label, key === 'stories' && k === 'titlePrefix' ? asTitle(conv.stories?.titlePrefix) : conv[key]?.[k])).filter(Boolean);
    if (key === 'props' && conv.props?.common?.length) rows.push(`| Most used props | ${conv.props.common.slice(0, 10).map((p) => `\`${p.name}\` (${p.count})`).join(', ')} | | |`);
    parts.push(`## ${title}\n\n${rows.length ? `| Convention | Value | Followed by | Exceptions |\n| --- | --- | --- | --- |\n${rows.join('\n')}` : 'Nothing to learn from yet.'}`);
  }
  const t = conv.styling?.tokenUsage;
  if (t) parts.push(`## Tokens in code\n\n${t.customProperties} uses of custom properties and ${t.rawColours} raw colours in component code and styles.`);
  parts.push(`## Template\n\n${prose.template || 'A new component follows the tables above.'}`);
  for (const [name, text] of kept) if (!['Overview', 'Notes'].includes(name)) parts.push(text);
  parts.push(kept.get('Notes') || `## Notes\n\n<!-- Your notes: decisions the scan cannot see, and conventions you are moving towards. Kept on every re-run. -->`);
  return parts.join('\n\n') + '\n';
}
