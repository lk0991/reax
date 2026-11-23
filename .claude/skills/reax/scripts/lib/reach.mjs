// Can the person's browser reach a server on this machine's 127.0.0.1? Not in a cloud or remote session, where the
// agent runs somewhere other than the person's browser. This is a guess from the environment; REAX_PREVIEW_LOCAL=1
// or 0 overrides it (for example when a remote session forwards ports to the person's machine).
const REMOTE = [
  ['CLAUDE_CODE_REMOTE', 'this is a Claude Code cloud session'],
  ['CODESPACES', 'this is a GitHub Codespace'],
  ['GITPOD_WORKSPACE_ID', 'this is a Gitpod workspace'],
  ['SSH_CONNECTION', 'this session runs over SSH'],
];

export function previewReach(env = process.env) {
  if (env.REAX_PREVIEW_LOCAL === '1') return { local: true, reason: null };
  if (env.REAX_PREVIEW_LOCAL === '0') return { local: false, reason: 'REAX_PREVIEW_LOCAL=0' };
  const hit = REMOTE.find(([k]) => env[k] && env[k] !== 'false' && env[k] !== '0');
  return hit ? { local: false, reason: hit[1] } : { local: true, reason: null };
}
