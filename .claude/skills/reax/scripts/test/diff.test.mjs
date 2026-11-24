import test from 'node:test';
import assert from 'node:assert/strict';
import { compareImages } from '../lib/diff.mjs';
import { req } from '../lib/runtime.mjs';

test('compareImages reports the box of the pixels that differ', () => {
  const { PNG } = req('pngjs');
  const img = (paint) => { const p = new PNG({ width: 50, height: 40 }); p.data.fill(255); paint(p); return PNG.sync.write(p); };
  const dot = (p, x, y) => { const i = (y * 50 + x) * 4; p.data[i] = 0; p.data[i + 1] = 0; p.data[i + 2] = 0; };
  const a = img(() => {}); const b = img((p) => { dot(p, 10, 5); dot(p, 20, 30); });
  const d = compareImages(a, b);
  assert.deepEqual(d.box, { x: 10, y: 5, w: 11, h: 26 });
  assert.equal(compareImages(a, a).box, null);
});
