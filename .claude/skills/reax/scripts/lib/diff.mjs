// Pixel comparison of a capture against its baseline.
import { req } from './runtime.mjs';

/** Compare two PNG buffers. Returns { ratio, pixels, total, dimsDiffer, diffPng }. */
export function compareImages(baselinePng, currentPng, projectRoot = process.cwd()) {
  const { PNG } = req('pngjs', projectRoot); const pixelmatch = req('pixelmatch', projectRoot);
  const a = PNG.sync.read(baselinePng); const b = PNG.sync.read(currentPng);
  if (a.width !== b.width || a.height !== b.height) {
    return { ratio: 1, pixels: Math.max(a.width * a.height, b.width * b.height), total: Math.max(a.width * a.height, b.width * b.height), dimsDiffer: true, diffPng: null, baselineSize: [a.width, a.height], currentSize: [b.width, b.height] };
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const total = a.width * a.height;
  // the box around every pixel that differs, so a before and after can be cropped to the change
  let x0 = Infinity; let y0 = Infinity; let x1 = -1; let y1 = -1;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const i = (y * a.width + x) * 4;
    if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2] || a.data[i + 3] !== b.data[i + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const box = x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  return { ratio: pixels / total, pixels, total, dimsDiffer: false, box, diffPng: pixels ? PNG.sync.write(diff) : null };
}
