// Which component card a story's component maps to: the inventory in the design sidecar first, then the card names
// and the alias table (components/_aliases.md), matched as the table says: ignoring case, spaces, hyphens and a
// "Component" or "Base" suffix.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CARDS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'components');
const norm = (s) => String(s).toLowerCase().replace(/[\s_-]+/g, '').replace(/(component|base)$/, '');

let table;
function aliasTable() {
  if (table) return table;
  table = new Map();
  for (const f of fs.readdirSync(CARDS_DIR)) if (f.endsWith('.md') && !f.startsWith('_')) table.set(norm(f.slice(0, -3)), f.slice(0, -3));
  const text = fs.readFileSync(path.join(CARDS_DIR, '_aliases.md'), 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*([a-z-]+)\s*\|\s*(.+?)\s*\|$/); if (!m || m[1] === 'card') continue;
    for (const alias of m[2].split(',')) table.set(norm(alias.replace(/\(.*?\)/g, '')), m[1]);
  }
  return table;
}

/** @returns {string|null} the card name for a story title such as "Components/Button", or null. */
export function cardFor(title, sidecar = {}) {
  const name = String(title).split('/').pop().trim();
  const inv = (sidecar.inventory || []).find((c) => norm(c.name) === norm(name));
  if (inv) return inv.card || null;
  return aliasTable().get(norm(name)) || null;
}
