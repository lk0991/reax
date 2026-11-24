#!/usr/bin/env node
// Visual directions for a project without a design system (ADR 0007).
//   node direction.mjs check    --dirs directions.json
//       each direction's errors (WCAG contrast, target size, missing values) and warnings (AI-default looks, too alike)
//   node direction.mjs specimen --root <project> --dirs directions.json [--screen screen.html] [--product Name]
//       writes visual-report/directions/index.html (all directions side by side, no scripts, publishable as is) and,
//       when Playwright is installed, one screenshot per direction at 390 and 1280 to look at
//   node direction.mjs commit   --root <project> --dirs directions.json --pick <id> --token-file src/styles/tokens.css
//                               [--components-dir src/components] [--product Name] [--apply]
//       shows the token file, DESIGN.md and sidecar it would write; writes them only with --apply
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, req, chromiumPath, missing, findUp } from './lib/runtime.mjs';
import { validateDirection, compareDirections, renderSpecimen, tokensCss, designDraft } from './lib/direction.mjs';
import { planWrite } from './lib/write.mjs';
import { diffText } from './lib/design.mjs';
import { previewReach } from './lib/reach.mjs';

const args = parseArgs(process.argv.slice(2));
const [cmd] = args._;
const out = (o, code = 0) => { console.log(JSON.stringify(o, null, 2)); process.exit(code); };
const root = findUp(path.resolve(args.root || process.cwd()), ['package.json']) || path.resolve(args.root || process.cwd());
let dirs;
try { dirs = JSON.parse(fs.readFileSync(args.dirs, 'utf8')); if (!Array.isArray(dirs)) dirs = dirs.directions; } catch (e) { out({ ok: false, error: `--dirs must be a JSON array of directions (or { "directions": [...] }): ${e.message}` }, 1); }
const report = () => ({ directions: dirs.map(validateDirection), alike: compareDirections(dirs) });

if (cmd === 'check') {
  const r = report(); out({ ok: r.directions.every((d) => !d.errors.length), ...r });
} else if (cmd === 'specimen') {
  const dir = path.join(root, 'visual-report', 'directions');
  fs.mkdirSync(dir, { recursive: true });
  const screen = args.screen ? fs.readFileSync(args.screen, 'utf8') : '';
  const page = path.join(dir, 'index.html');
  fs.writeFileSync(page, renderSpecimen(dirs, { product: args.product, screen }));
  const shots = []; let fonts = null; let note;
  if (missing(root).includes('playwright') || !chromiumPath(root)) note = 'No screenshots: Playwright or a browser is missing (setup.mjs --check).';
  else {
    const { chromium } = req('playwright', root);
    const browser = await chromium.launch({ executablePath: chromiumPath(root), args: process.getuid?.() === 0 ? ['--no-sandbox'] : [] });
    try {
      for (const width of [390, 1280]) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
        const p = await ctx.newPage();
        // the page is plain HTML without a skeleton; a browser renders it as it is
        await p.goto(pathToFileURL(page).href, { waitUntil: 'load', timeout: 30_000 }).catch(() => {});
        await p.evaluate(() => document.fonts.ready).catch(() => {});
        if (fonts === null) fonts = await p.evaluate((ds) => ds.flatMap((d) => [d.type?.display, d.type?.body].filter((f) => f?.google)).map((f) => ({ family: f.family, loaded: document.fonts.check(`16px "${f.family}"`) })), dirs);
        for (const d of dirs) {
          const file = path.join(dir, `${d.id}-${width}.png`);
          await p.locator(`[data-direction="${d.id}"]`).screenshot({ path: file, timeout: 15_000 });
          shots.push(path.relative(root, file));
        }
        await ctx.close();
      }
    } finally { await browser.close(); }
    if (fonts?.some((f) => !f.loaded)) note = 'Some Google fonts did not load here (no network?); the screenshots use fallback faces. The published page loads them.';
  }
  const r = report();

  out({ ok: true, page: path.relative(root, page), screenshots: shots, fonts, ...(note ? { note } : {}), previewReachable: previewReach().local, ...r, publish: 'The page has no other files: publish it alone as a private Artifact, or open it in a browser locally.' });
} else if (cmd === 'commit') {
  const d = dirs.find((x) => x.id === args.pick);
  if (!d) out({ ok: false, error: `No direction with id "${args.pick}". Ids: ${dirs.map((x) => x.id).join(', ')}` }, 1);
  const v = validateDirection(d);
  if (v.errors.length) out({ ok: false, error: 'This direction breaks accessibility Requirements; fix them before committing it.', errors: v.errors }, 1);
  if (!args['token-file']) out({ ok: false, error: '--token-file is required: where the project keeps its tokens, for example src/styles/tokens.css.' }, 1);
  const tokenRel = String(args['token-file']); const tokenAbs = path.join(root, tokenRel);
  const css = tokensCss(d); const before = fs.existsSync(tokenAbs) ? fs.readFileSync(tokenAbs, 'utf8') : null;
  const tDiff = diffText(before || '', css, before === null ? '(new)' : `${tokenRel} (current)`, `${tokenRel} (proposed)`);
  // the token file goes first: DESIGN.md's sidecar records a hash of it
  if (args.apply && tDiff.changed) { fs.mkdirSync(path.dirname(tokenAbs), { recursive: true }); fs.writeFileSync(tokenAbs, css); }
  const plan = planWrite(root, designDraft(d, { tokenFile: tokenRel, componentsDir: args['components-dir'] || 'src/components', product: args.product }), { apply: !!args.apply });
  console.log([tDiff.text, plan.diff].filter(Boolean).join('\n\n') || '(no changes)');
  console.error(args.apply ? `Written: ${tokenRel}, DESIGN.md and .reax/design.json.${before !== null ? ' The token file was replaced.' : ''}` : `Not written. Re-run with --apply after the person confirms.${before !== null ? ` ${tokenRel} exists and would be replaced.` : ''}`);
  if (v.warnings.length) console.error(`Warnings: ${v.warnings.map((w) => w.message).join(' ')}`);
} else {
  out({ ok: false, error: 'Usage: direction.mjs <check|specimen|commit> --dirs directions.json [options]' }, 1);
}
