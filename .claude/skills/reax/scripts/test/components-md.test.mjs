import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { planWrite } from '../lib/write.mjs';
import { loadDesign } from '../lib/design.mjs';
import { analyzeComponents } from '../lib/conventions.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'reax-cmd-'));
const files = ['Button', 'Badge', 'Card'].flatMap((n) => [
  { path: `src/ui/${n}/${n}.tsx`, text: `export interface ${n}Props { /** x */ kind?: 'a' | 'b'; isOpen?: boolean; }\nexport const ${n} = React.forwardRef<HTMLDivElement, ${n}Props>(function ${n}(p, ref) { return <div ref={ref} data-kind={p.kind} />; });\n` },
  { path: `src/ui/${n}/${n}.stories.tsx`, text: `const meta = { title: 'UI/${n}' } satisfies Meta<typeof ${n}>;\nexport const A: Story = { args: {} };\n` },
]);
const conventions = analyzeComponents(files, { componentsDir: 'src/ui' });
const DRAFT = {
  name: 'Sample', tokens: { colors: { primary: '#123456' } }, scan: { tokenFiles: [], componentsDir: 'src/ui' },
  sidecar: { inventory: [{ name: 'Button', path: 'src/ui/Button', card: 'button' }] },
  components: {
    prose: { overview: 'Small forwardRef components styled by data attributes.', template: '```tsx\nexport const Name = React.forwardRef(...)\n```' },
    conventions,
  },
};

test('init writes COMPONENTS.md with every convention, how widely it is followed, and the house template', () => {
  const root = tmp(); planWrite(root, DRAFT, { apply: true });
  const md = fs.readFileSync(path.join(root, 'COMPONENTS.md'), 'utf8');
  assert.match(md, /^# Component conventions/m);
  assert.match(md, /Small forwardRef components/);
  assert.match(md, /forwardRef/); assert.match(md, /3 of 3/);
  assert.match(md, /`kind`/); assert.match(md, /`is`/);
  assert.match(md, /UI\//);
  assert.match(md, /## Template/);
  const side = JSON.parse(fs.readFileSync(path.join(root, '.reax', 'design.json'), 'utf8'));
  assert.equal(side.conventions.code.definition.value, 'forwardRef');
});

test('a mixed convention shows its options until a decision is recorded, then the decision', () => {
  const root = tmp();
  const mixed = structuredClone(DRAFT);
  mixed.components.conventions.code.definition = { status: 'mixed', value: 'forwardRef', count: 2, total: 4, options: [{ value: 'forwardRef', count: 2 }, { value: 'function', count: 2 }], recommended: 'forwardRef' };
  planWrite(root, mixed, { apply: true });
  assert.match(fs.readFileSync(path.join(root, 'COMPONENTS.md'), 'utf8'), /Mixed, not decided/);
  mixed.components.conventions.code.definition.decided = 'function';
  planWrite(root, mixed, { apply: true });
  const md = fs.readFileSync(path.join(root, 'COMPONENTS.md'), 'utf8');
  assert.match(md, /`function` \(decided; 2 of 4 follow it\)/);
});

test('a re-run keeps the Overview and Notes a person wrote', () => {
  const root = tmp(); planWrite(root, DRAFT, { apply: true });
  const file = path.join(root, 'COMPONENTS.md');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/## Notes[\s\S]*$/, '## Notes\n\nWe are moving to CSS modules. Keep me.\n'));
  planWrite(root, DRAFT, { apply: true });
  assert.match(fs.readFileSync(file, 'utf8'), /Keep me\./);
});

test('load reports the conventions, and check notices a missing COMPONENTS.md', () => {
  const root = tmp(); planWrite(root, DRAFT, { apply: true });
  let d = loadDesign(root, { root });
  assert.equal(d.exists.components, true);
  assert.equal(d.conventions.code.definition.value, 'forwardRef');
  fs.rmSync(path.join(root, 'COMPONENTS.md'));
  d = loadDesign(root, { root });
  assert.ok(d.errors.some((e) => e.kind === 'components-missing'));
});

test('without a components draft, nothing about COMPONENTS.md is written', () => {
  const root = tmp(); const { components, ...noComponents } = DRAFT;
  planWrite(root, noComponents, { apply: true });
  assert.equal(fs.existsSync(path.join(root, 'COMPONENTS.md')), false);
  assert.equal(loadDesign(root, { root }).errors.length, 0);
});

test('COMPONENTS.md says where screens live when the scan records a screens directory', () => {
  const root = tmp();
  planWrite(root, { ...DRAFT, scan: { ...DRAFT.scan, screensDir: 'src/screens' } }, { apply: true });
  const md = fs.readFileSync(path.join(root, 'COMPONENTS.md'), 'utf8');
  assert.match(md, /Screens live in `src\/screens`, shaped like a component folder/);
  assert.match(md, /Screens\/<Name>/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, '.reax', 'design.json'), 'utf8')).scan.screensDir, 'src/screens');
  const noScreens = tmp(); planWrite(noScreens, DRAFT, { apply: true });
  assert.ok(!/Screens live in/.test(fs.readFileSync(path.join(noScreens, 'COMPONENTS.md'), 'utf8')));
});
