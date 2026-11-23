// Which stories a run or the preview should cover: all, named components, or the components git says changed.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readJson } from './runtime.mjs';

const run = (root, ...a) => spawnSync('git', ['-C', root, ...a], { encoding: 'utf8' });

/** The branch to compare with: the configured one, the remote's default, or main/master. Null when none exists. */
export function baseBranch(root, configured) {
  const exists = (ref) => run(root, 'rev-parse', '--verify', '--quiet', `${ref}^{commit}`).status === 0;
  if (configured) return exists(configured) ? configured : null;
  const head = run(root, 'symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD');
  if (head.status === 0 && head.stdout.trim()) return head.stdout.trim();
  return ['origin/main', 'origin/master', 'main', 'master'].find(exists) || null;
}

/** Files changed on this branch since it left the base branch, plus uncommitted ones. Null outside git. */
export function changedFiles(root, { base: configured } = {}) {
  const top = run(root, 'rev-parse', '--show-toplevel');
  if (top.status !== 0) return null;
  const st = run(root, 'status', '--porcelain', '-uall');
  if (st.status !== 0) return null;
  const files = st.stdout.split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop());
  const base = baseBranch(root, configured);
  if (base) {
    const d = run(root, 'diff', '--name-only', `${base}...HEAD`);
    if (d.status === 0) files.push(...d.stdout.split('\n').filter(Boolean));
  }
  const list = [...new Set(files)].map((f) => path.relative(root, path.join(top.stdout.trim(), f)).split(path.sep).join('/')).filter((f) => !f.startsWith('..') && !f.startsWith('visual-report/') && !f.startsWith('.reax/baselines/'));
  return Object.assign(list, { base });
}

/** @returns {{mode: string, stories: object[], description: string}} */
export function selectStories({ root, config, args, all }) {
  const eligible = all.filter((s) => !(s.tags || []).includes(config.skipTag));
  const skipped = all.length - eligible.length;
  const nameOf = (s) => s.title.split('/').pop().trim().toLowerCase();
  const dirOf = (s) => path.posix.normalize(path.posix.dirname(s.importPath));
  const suffix = skipped ? ` (${skipped} skipped by the ${config.skipTag} tag)` : '';
  if (args.all) return { mode: 'all', stories: eligible, description: `all stories${suffix}` };
  if (args.component) {
    const want = String(args.component).toLowerCase().split(',').map((x) => x.trim());
    const stories = eligible.filter((s) => want.includes(nameOf(s)) || want.includes(path.posix.basename(dirOf(s)).toLowerCase()));
    return { mode: 'component', stories, description: stories.length ? `components: ${args.component}${suffix}` : `No story matches ${args.component}.` };
  }
  const changed = changedFiles(root, { base: config.baseBranch });
  const since = changed?.base ? `on this branch since ${changed.base}, and uncommitted` : 'uncommitted (no base branch found to compare with)';
  if (changed === null) return { mode: 'all', stories: eligible, description: `all stories, because this is not a git repository${suffix}` };
  const sidecar = readJson(path.join(root, '.reax', 'design.json'), {});
  const global = changed.some((f) => f.startsWith('.storybook/') || (sidecar.scan?.tokenFiles || []).includes(f));
  if (global) return { mode: 'all', stories: eligible, description: `all stories, because a token file or the Storybook setup changed${suffix}` };
  const stories = eligible.filter((s) => { const d = dirOf(s).replace(/^\.\//, ''); return changed.some((f) => f === d || f.startsWith(d + '/')); });
  return { mode: 'changed', stories, description: stories.length ? `components changed ${since}${suffix}` : `No component changed ${since}.` };
}
