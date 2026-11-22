const { chromium } = require('playwright');
const fs = require('fs');
const D = '/tmp/claude-0/wt-review/prototypes/visual-review';
const axeSrc = fs.readFileSync('/tmp/claude-0/axe-tmp/node_modules/axe-core/axe.min.js', 'utf8');
const caps = [
  { id: 'mobile-390x844', w: 390, h: 844 },
  { id: 'desktop-1280x800', w: 1280, h: 800 },
  { id: 'reflow-320', w: 320, h: 640 },
  { id: 'text-200', w: 390, h: 844, text200: true },
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const out = {};
  for (const c of caps) {
    const p = await b.newPage({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: 1 });
    await p.goto('file://' + D + '/Dialog.html');
    if (c.text200) await p.addStyleTag({ content: 'html{font-size:200%}' });
    const m = await p.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, dialog: (() => { const r = document.querySelector('.dialog').getBoundingClientRect(); const f = document.querySelector('.footer').getBoundingClientRect(); const cl = document.querySelector('.close').getBoundingClientRect(); return { dialogRight: Math.round(r.right), footerRight: Math.round(f.right), vw: innerWidth, closeSize: [Math.round(cl.width), Math.round(cl.height)] }; })() }));
    out[c.id] = m;
    await p.screenshot({ path: D + '/visual-report/screenshots/dialog-confirm-' + c.id + '.png' });
    if (c.id === 'mobile-390x844') {
      await p.evaluate(axeSrc);
      const r = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'] } })).violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => n.target.join(' ')) })));
      out.axe = r;
    }
    await p.close();
  }
  fs.writeFileSync(D + '/visual-report/run.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
