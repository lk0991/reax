import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeComponents } from '../lib/conventions.mjs';

// a project whose components mostly follow one style, with one exception
const comp = (name, { arrow = false, ref = true, kind = 'variant', module = true } = {}) => [
  { path: `src/ui/${name}/${name}.tsx`, text: `import * as React from 'react';
import styles from './${name}.module.css';
export interface ${name}Props extends React.HTMLAttributes<HTMLElement> {
  /** Look. */
  ${kind}?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  isDisabled?: boolean;
  onPress?: () => void;
}
${ref ? `export const ${name} = React.forwardRef<HTMLElement, ${name}Props>(function ${name}({ ${kind}, ...rest }, ref) {` : arrow ? `export const ${name} = ({ ${kind}, ...rest }: ${name}Props) => {` : `export function ${name}({ ${kind}, ...rest }: ${name}Props) {`}
  return <div ref={ref} className={styles.root} data-${kind}={${kind}} data-slot="root" style={{ color: 'var(--ink)' }} {...rest} />;
}${ref ? ');' : ''}
` },
  module ? { path: `src/ui/${name}/${name}.module.css`, text: `.root { color: var(--ink); padding: var(--space-2); }\n.root[data-${kind}='primary'] { background: var(--brand); }\n` } : { path: `src/ui/${name}/${name}.css`, text: `.${name.toLowerCase()} { color: #333; }` },
  { path: `src/ui/${name}/${name}.stories.tsx`, text: `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';
const meta = { title: 'UI/${name}', component: ${name}, tags: ['autodocs'] } satisfies Meta<typeof ${name}>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = { args: { ${kind}: 'primary' } };
` },
  { path: `src/ui/${name}/index.ts`, text: `export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n` },
];

const files = [
  ...comp('Button'), ...comp('Badge'), ...comp('Card'), ...comp('Tag'),
  ...comp('Panel', { ref: false, arrow: true, kind: 'kind', module: false }),
];

test('finds the layout: one PascalCase folder per component with the same files', () => {
  const c = analyzeComponents(files, { componentsDir: 'src/ui' });
  assert.equal(c.components.length, 5);
  assert.equal(c.layout.folderPerComponent.value, true);
  assert.equal(c.layout.folderCase.value, 'PascalCase');
  assert.deepEqual(c.layout.files.value, ['{Name}.module.css', '{Name}.stories.tsx', '{Name}.tsx', 'index.ts']);
  assert.equal(c.layout.files.status, 'convention');
  assert.deepEqual(c.layout.files.exceptions, ['Panel']);
});

test('finds how components are written: forwardRef, named exports, Props interfaces, data attributes for variants', () => {
  const c = analyzeComponents(files, { componentsDir: 'src/ui' });
  assert.equal(c.code.definition.value, 'forwardRef');
  assert.equal(c.code.definition.count, 4);
  assert.equal(c.code.export.value, 'named');
  assert.equal(c.code.propsType.value, 'interface {Name}Props');
  assert.equal(c.code.indexExports.value, 'named re-exports');
  assert.equal(c.styling.approach.value, 'css-modules');
  assert.equal(c.styling.variantSelector.value, 'data-attribute');
  assert.equal(c.styling.dataSlot.value, true);
});

test('records prop naming: the variant prop name, boolean prefix and event handler names', () => {
  const c = analyzeComponents(files, { componentsDir: 'src/ui' });
  assert.equal(c.props.emphasis.value, 'variant');
  assert.equal(c.props.booleanPrefix.value, 'is');
  assert.equal(c.props.pressHandler.value, 'onPress');
  assert.ok(c.props.common.some((p) => p.name === 'size' && p.count === 5));
});

test('records story conventions: CSF3 with satisfies, title prefix and tags', () => {
  const c = analyzeComponents(files, { componentsDir: 'src/ui' });
  assert.equal(c.stories.format.value, 'csf3-satisfies');
  assert.equal(c.stories.titlePrefix.value, 'UI');
  assert.deepEqual(c.stories.tags.value, ['autodocs']);
});

test('a close split is "mixed", lists both options and recommends the more recent one', () => {
  const split = [
    ...comp('A', { ref: false }), ...comp('B', { ref: false }),
    ...comp('C'), ...comp('D'),
  ].map((f) => ({ ...f, mtime: f.path.includes('/C/') || f.path.includes('/D/') ? 2000 : 1000 }));
  const c = analyzeComponents(split, { componentsDir: 'src/ui' });
  assert.equal(c.code.definition.status, 'mixed');
  assert.deepEqual(c.code.definition.options.map((o) => o.value).sort(), ['forwardRef', 'function']);
  assert.equal(c.code.definition.recommended, 'forwardRef');
});

test('an empty components directory gives no conventions and says so', () => {
  const c = analyzeComponents([], { componentsDir: 'src/ui' });
  assert.equal(c.components.length, 0);
  assert.equal(c.code.definition.status, 'none');
});

test('story tags are read from the meta, not from a story', () => {
  const story = (n) => ({ path: `src/ui/${n}/${n}.stories.tsx`, text: `const meta = {\n  title: 'UI/${n}',\n  component: ${n},\n  tags: ['autodocs'],\n} satisfies Meta<typeof ${n}>;\nexport default meta;\nexport const Hover: Story = { tags: ['reax-state-hover'] };\n` });
  const src = (n) => ({ path: `src/ui/${n}/${n}.tsx`, text: `export function ${n}() { return null; }` });
  const noMetaTags = { path: 'src/ui/C/C.stories.tsx', text: `const meta = { title: 'UI/C' } satisfies Meta<typeof C>;\nexport const Hover: Story = { tags: ['reax-state-hover'] };\n` };
  const c = analyzeComponents([src('A'), story('A'), src('B'), story('B'), src('C'), noMetaTags], { componentsDir: 'src/ui' });
  assert.deepEqual(c.stories.tags.options?.map((o) => o.value) ?? [c.stories.tags.value], [['autodocs'], []]);
});

test('deviations: each component that breaks a recorded convention, with what was expected and found', async () => {
  const { deviations } = await import('../lib/conventions.mjs');
  const recorded = analyzeComponents(files, { componentsDir: 'src/ui' });
  const now = analyzeComponents(files, { componentsDir: 'src/ui' });
  const all = deviations(recorded, now);
  const panel = all.filter((d) => d.component === 'Panel');
  assert.ok(panel.some((d) => d.key === 'code.definition' && d.expected === 'forwardRef' && d.found === 'arrow'));
  assert.ok(panel.some((d) => d.key === 'props.emphasis' && d.expected === 'variant' && d.found === 'kind'));
  assert.ok(panel.some((d) => d.key === 'layout.files'));
  assert.ok(panel.every((d) => d.label && d.rank === 'should-fix'));
  assert.equal(all.filter((d) => d.component === 'Button').length, 0);
  // only the named components
  assert.equal(deviations(recorded, now, ['Button']).length, 0);
});

test('deviations use a decided value for a mixed convention, and skip an undecided one', async () => {
  const { deviations } = await import('../lib/conventions.mjs');
  const split = [...comp('A', { ref: false }), ...comp('B', { ref: false }), ...comp('C'), ...comp('D')];
  const recorded = analyzeComponents(split, { componentsDir: 'src/ui' });
  assert.equal(deviations(recorded, recorded).filter((d) => d.key === 'code.definition').length, 0);
  recorded.code.definition.decided = 'forwardRef';
  assert.deepEqual(deviations(recorded, recorded).filter((d) => d.key === 'code.definition').map((d) => d.component).sort(), ['A', 'B']);
});

test('a new component that breaks the recorded conventions is caught', async () => {
  const { deviations } = await import('../lib/conventions.mjs');
  const recorded = analyzeComponents(files, { componentsDir: 'src/ui' });
  const now = analyzeComponents([...files, ...comp('Fresh', { ref: false, module: false })], { componentsDir: 'src/ui' });
  assert.ok(deviations(recorded, now, ['Fresh']).some((d) => d.key === 'styling.approach' && d.found === 'plain-css'));
});
