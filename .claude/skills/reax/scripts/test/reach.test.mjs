import test from 'node:test';
import assert from 'node:assert/strict';
import { previewReach } from '../lib/reach.mjs';

test('a local session can use the live preview', () => {
  assert.deepEqual(previewReach({}), { local: true, reason: null });
});

test('a cloud or remote session cannot, and says why', () => {
  for (const env of [{ CLAUDE_CODE_REMOTE: 'true' }, { CODESPACES: 'true' }, { GITPOD_WORKSPACE_ID: 'x' }, { SSH_CONNECTION: '1 2 3 4' }]) {
    const r = previewReach(env);
    assert.equal(r.local, false, JSON.stringify(env));
    assert.ok(r.reason);
  }
});

test('REAX_PREVIEW_LOCAL overrides the guess either way', () => {
  assert.equal(previewReach({ CLAUDE_CODE_REMOTE: 'true', REAX_PREVIEW_LOCAL: '1' }).local, true);
  assert.equal(previewReach({ REAX_PREVIEW_LOCAL: '0' }).local, false);
});
