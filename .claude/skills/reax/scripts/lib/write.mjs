// Generates DESIGN.md and the sidecar from a draft, without ever overwriting by itself.
// Human-owned prose (Overview, Do's and Don'ts and any section reax does not know) is copied from an existing
// DESIGN.md verbatim; only the token blocks and reax's own sections are regenerated (decision: DESIGN.md schema, Q10).
import fs from 'node:fs';
import path from 'node:path';
import { req } from './runtime.mjs';
import { canonicalSection, SPEC_SECTIONS, REAX_SECTIONS, currentHashes, diffText, HASH_VERSION } from './design.mjs';
import { composeComponentsMarkdown } from './components-md.mjs';

const HUMAN_OWNED = new Set(['Overview', "Do's and Don'ts"]);

/** Split a DESIGN.md into the part before the first section and its h2 sections, keeping each section's text verbatim. */
export function splitSections(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n'); const out = { preamble: [], sections: [] };
  let inFence = false; let cur = null;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const h2 = !inFence && line.match(/^##\s+(.+?)\s*$/);
    if (h2) { cur = { heading: h2[1], name: canonicalSection(h2[1]), lines: [line] }; out.sections.push(cur); } else if (cur) cur.lines.push(line); else out.preamble.push(line);
  }
  return { preamble: out.preamble.join('\n'), sections: out.sections.map((s) => ({ heading: s.heading, name: s.name, text: s.lines.join('\n').replace(/\n+$/, '') })) };
}

const yamlBlock = (obj) => '```yaml\n' + req('yaml').stringify(obj, { lineWidth: 0 }).trimEnd() + '\n```';

function buildSections(draft) {
  const t = draft.tokens || {}; const lang = draft.sidecar?.language || {}; const inv = draft.sidecar?.inventory || [];
  const s = {};
  s.Overview = `## Overview\n\n${draft.prose?.overview || '<!-- draft: replace with one or two sentences on the design language -->\n' + (draft.description || 'Design language to be described.')}`;
  if (t.colors) s.Colors = `## Colors\n\n${draft.prose?.colors || 'Colour tokens found in the project.'}\n\n${yamlBlock({ colors: t.colors })}`;
  if (t.typography) s.Typography = `## Typography\n\n${draft.prose?.typography || 'Type tokens found in the project.'}\n\n${yamlBlock({ typography: t.typography })}`;
  if (t.spacing) s.Layout = `## Layout\n\n${draft.prose?.layout || 'Spacing, touch-target sizes and breakpoints.'}\n\n${yamlBlock({ spacing: t.spacing })}`;
  if (t.rounded) s.Shapes = `## Shapes\n\n${draft.prose?.shapes || 'Corner radii.'}\n\n${yamlBlock({ rounded: t.rounded })}`;
  if (t.motion) s['Motion & Micro-interaction'] = `## Motion & Micro-interaction\n\n${draft.prose?.motion || 'Motion tokens.'}\n\n${yamlBlock({ motion: t.motion })}`;
  if (t.components) s.Components = `## Components\n\n${draft.prose?.components || 'Component property tokens.'}\n\n${yamlBlock({ components: t.components })}`;
  s["Do's and Don'ts"] = `## Do's and Don'ts\n\n${draft.prose?.doDont || '<!-- draft: add a few rules specific to this project -->\n- Do use a token for every colour, space and radius.\n- Don\'t hard-code a value that has a token.'}`;

  const langRows = Object.entries(lang).filter(([, v]) => v !== undefined && v !== null && v !== '' && typeof v !== 'object').map(([k, v]) => `- **${k}**: ${v}`);
  s.Language = `## Language\n\n${langRows.length ? langRows.join('\n') : 'Not determined yet. See Gaps.'}\n\nMachine-readable detail: \`@.reax/design.json\``;
  s['Component inventory'] = `## Component inventory\n\n${inv.length ? '| Component | Path | Card |\n| --- | --- | --- |\n' + inv.map((c) => `| ${c.name} | \`${c.path}\` | ${c.card || 'none'} |`).join('\n') : 'No components found yet.'}\n\nMachine-readable detail: \`@.reax/design.json\``;
  const gaps = draft.gaps || [];
  s.Gaps = `## Gaps\n\n${gaps.length ? gaps.map((g) => `- ${g}`).join('\n') : 'Nothing the scan could not determine.'}`;
  return s;
}

/** Compose the new DESIGN.md text, keeping human-owned sections and unknown sections from `existing`. */
export function composeDesignMarkdown(draft, existing = null) {
  const generated = buildSections(draft);
  const kept = existing ? splitSections(existing) : null;
  const keepVerbatim = new Map();
  if (kept) for (const sec of kept.sections) if (HUMAN_OWNED.has(sec.name) || ![...SPEC_SECTIONS, ...REAX_SECTIONS].includes(sec.name)) keepVerbatim.set(sec.name, sec.text);

  const frontmatter = req('yaml').stringify({ version: 'alpha', name: draft.name || 'Design system', ...(draft.description ? { description: draft.description } : {}) }).trimEnd();
  const preamble = kept && kept.preamble.trim() ? kept.preamble.replace(/\n+$/, '') : `---\n${frontmatter}\n---\n\n# ${draft.name || 'Design system'}`;
  const parts = [preamble];
  const emitted = new Set();
  for (const name of [...SPEC_SECTIONS, ...REAX_SECTIONS]) {
    const text = keepVerbatim.has(name) ? keepVerbatim.get(name) : generated[name];
    if (text) { parts.push(text); emitted.add(name); }
  }
  for (const [name, text] of keepVerbatim) if (!emitted.has(name)) parts.push(text); // unknown sections are preserved
  return parts.join('\n\n') + '\n';
}

export function composeSidecar(root, draft) {
  const scan = { ...(draft.scan || {}), scannedAt: new Date().toISOString() };
  scan.hashes = currentHashes(root, scan); scan.hashVersion = HASH_VERSION;
  return { schemaVersion: 1, scan, ...(draft.components ? { conventions: draft.components.conventions } : {}), ...(draft.sidecar?.direction ? { direction: draft.sidecar.direction } : {}), tokenSources: draft.sidecar?.tokenSources || {}, language: draft.sidecar?.language || {}, inventory: draft.sidecar?.inventory || [], shadows: draft.sidecar?.shadows || {}, themes: draft.sidecar?.themes || [] };
}

/** Compute what would be written, as a diff against what exists. Writes only when `apply` is true. */
export function planWrite(root, draft, { apply = false } = {}) {
  const designPath = path.join(root, 'DESIGN.md'); const sidecarPath = path.join(root, '.reax', 'design.json');
  const existing = fs.existsSync(designPath) ? fs.readFileSync(designPath, 'utf8') : null;
  const existingSidecar = fs.existsSync(sidecarPath) ? fs.readFileSync(sidecarPath, 'utf8') : null;
  const nextDesign = composeDesignMarkdown(draft, existing);
  const nextSidecar = JSON.stringify(composeSidecar(root, draft), null, 2) + '\n';
  // the scan timestamp changes on every run; it is not a change the person needs to review
  const stripStamp = (s) => (s ? s.replace(/"scannedAt": "[^"]*"/, '"scannedAt": "-"') : s);
  const dDesign = diffText(existing || '', nextDesign, existing ? 'DESIGN.md (current)' : '(new)', 'DESIGN.md (proposed)');
  const dSidecar = diffText(stripStamp(existingSidecar) || '', stripStamp(nextSidecar), existingSidecar ? '.reax/design.json (current)' : '(new)', '.reax/design.json (proposed)');
  // COMPONENTS.md, when the draft carries the learned component conventions
  const componentsPath = path.join(root, 'COMPONENTS.md');
  const existingComponents = fs.existsSync(componentsPath) ? fs.readFileSync(componentsPath, 'utf8') : null;
  const nextComponents = draft.components ? composeComponentsMarkdown(draft, existingComponents) : null;
  const dComponents = nextComponents ? diffText(existingComponents || '', nextComponents, existingComponents ? 'COMPONENTS.md (current)' : '(new)', 'COMPONENTS.md (proposed)') : { changed: false, text: '' };
  const plan = { root, designPath, sidecarPath, componentsPath, isNew: { design: existing === null, sidecar: existingSidecar === null, components: !!nextComponents && existingComponents === null }, changed: dDesign.changed || dSidecar.changed || dComponents.changed, diff: [dDesign.text, dComponents.text, dSidecar.text].filter(Boolean).join('\n\n'), applied: false };
  if (apply && plan.changed) {
    fs.mkdirSync(path.dirname(sidecarPath), { recursive: true });
    fs.writeFileSync(designPath, nextDesign); fs.writeFileSync(sidecarPath, nextSidecar);
    if (nextComponents) fs.writeFileSync(componentsPath, nextComponents);
    plan.applied = true;
  }
  return plan;
}
