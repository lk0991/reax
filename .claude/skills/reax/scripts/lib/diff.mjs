// Pixel comparison of a capture against its baseline.
import { req } from './runtime.mjs';

/** Compare two PNG buffers. Returns { ratio, pixels, total, dimsDiffer, diffPng }. */
export function compareImages(baselinePng, currentPng, projectRoot) {
  const { PNG } = req('pngjs', projectRoot); const pixelmatch = req('pixelmatch', projectRoot);
  const a = PNG.sync.read(baselinePng); const b = PNG.sync.read(currentPng);
  if (a.width !== b.width || a.height !== b.height) {
    return { ratio: 1, pixels: Math.max(a.width * a.height, b.width * b.height), total: Math.max(a.width * a.height, b.width * b.height), dimsDiffer: true, diffPng: null, baselineSize: [a.width, a.height], currentSize: [b.width, b.height] };
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const total = a.width * a.height;
  return { ratio: pixels / total, pixels, total, dimsDiffer: false, diffPng: pixels ? PNG.sync.write(diff) : null };
}
