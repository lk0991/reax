// Planning a screen from the project's own components (spec #46): each part of a screen is matched to a component in
// the inventory, by name or through the card and alias table, or it is a gap: a component the project does not have yet.
// Pure; the agent writes the parts from the person's words, this decides what exists.
import path from 'node:path';
import { cardFor } from './cards.mjs';

const norm = (s) => String(s).toLowerCase().replace(/[\s_-]+/g, '').replace(/(component|base)$/, '');

/**
 * @param parts   [{ name, purpose?, component?, own? }]  component is an explicit hint for what the part should use;
 *               own marks the screen's own content or layout (a heading, a paragraph), which is not a component
 * @param design  loadDesign() output (its inventory is [{ name, path, card }])
 * @returns {{ parts: object[], gaps: object[] }}
 */
export function planScreen(parts, design = {}) {
  const inv = design.inventory || [];
  const out = []; const gaps = [];
  for (const p of parts) {
    if (p.own) { out.push({ name: p.name, purpose: p.purpose, status: 'own' }); continue; }
    const ask = p.component || p.name;
    const byName = inv.find((c) => norm(c.name) === norm(ask));
    const card = cardFor(ask, {});
    const byCard = !byName && card ? inv.find((c) => c.card === card) : null;
    const hit = byName || byCard;
    if (hit) { out.push({ name: p.name, purpose: p.purpose, status: 'match', component: hit.name, path: hit.path, card: hit.card || null, ...(byCard ? { via: `the ${card} card` } : {}) }); continue; }
    const gap = { name: p.name, purpose: p.purpose, card: card || null };
    out.push({ ...gap, status: 'gap' });
    if (!gaps.some((g) => norm(g.name) === norm(p.name))) gaps.push(gap);
  }
  return { parts: out, gaps };
}

/** Where screens live: the recorded directory, else "screens" beside the components directory. */
export function screensDir(sidecar = {}) {
  const recorded = sidecar.scan?.screensDir || sidecar.conventions?.screensDir;
  if (recorded) return recorded;
  const comps = sidecar.scan?.componentsDir || sidecar.conventions?.componentsDir;
  return comps ? path.posix.join(path.posix.dirname(comps), 'screens') : 'src/screens';
}
