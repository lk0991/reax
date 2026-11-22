// Which stories a run or the preview should cover: all, named components, or the components git says changed.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readJson } from './runtime.mjs';

export function changedFiles(root) {
  const top = spawnSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (top.status !== 0) return null;
  const st = spawnSync('git', ['-C', root, 'status', '--porcelain', '-uall'], { encoding: 'utf8' });
  if (st.status !== 0) return null;
  return st.stdout.split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop()).map((f) => path.relative(root, path.join(top.stdout.trim(), f)).split(path.sep).join('/')).filter((f) => !f.startsWith('..') && !f.startsWith('visual-report/') && !f.startsWith('.reax/baselines/'));
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
  const changed = changedFiles(root);
  if (changed === null) return { mode: 'all', stories: eligible, description: `all stories, because this is not a git repository${suffix}` };
  const sidecar = readJson(path.join(root, '.reax', 'design.json'), {});
  const global = changed.some((f) => f.startsWith('.storybook/') || (sidecar.scan?.tokenFiles || []).includes(f));
  if (global) return { mode: 'all', stories: eligible, description: `all stories, because a token file or the Storybook setup changed${suffix}` };
  const stories = eligible.filter((s) => { const d = dirOf(s).replace(/^\.\//, ''); return changed.some((f) => f === d || f.startsWith(d + '/')); });
  return { mode: 'changed', stories, description: stories.length ? `components changed per git${suffix}` : 'No component changed per git.' };
}
