import test from 'node:test';
import assert from 'node:assert/strict';
import { planScreen, screensDir } from '../lib/screens.mjs';

const design = { inventory: [
  { name: 'Button', path: 'src/components/Button', card: 'button' },
  { name: 'Dialog', path: 'src/components/Dialog', card: 'dialog' },
  { name: 'TextField', path: 'src/components/TextField', card: 'input' },
  { name: 'ProfileCard', path: 'src/components/ProfileCard', card: null },
] };

test('a part named like a component, in any spelling, matches it', () => {
  const p = planScreen([{ name: 'Profile card', purpose: 'who is logged in' }, { name: 'button' }], design);
  assert.deepEqual(p.parts.map((x) => [x.status, x.component]), [['match', 'ProfileCard'], ['match', 'Button']]);
  assert.equal(p.parts[0].card, null);
  assert.deepEqual(p.gaps, []);
});

test('a part matches through the alias table to the project\'s own component', () => {
  const p = planScreen([{ name: 'Confirm modal' }, { name: 'Modal' }, { name: 'Email input', component: 'Text field' }], design);
  assert.equal(p.parts[1].component, 'Dialog'); assert.match(p.parts[1].via, /dialog card/);
  assert.equal(p.parts[2].component, 'TextField');
  // "Confirm modal" is not a component name: it is a gap, even though it mentions a modal
  assert.equal(p.parts[0].status, 'gap');
});

test('a part with no matching component is a gap, with the card that says how to build it and what it needs', () => {
  const p = planScreen([{ name: 'Tabs', purpose: 'switch between day and week' }, { name: 'Sighting map', purpose: 'where birds were seen' }], design);
  assert.deepEqual(p.gaps.map((g) => g.name), ['Tabs', 'Sighting map']);
  assert.equal(p.gaps[0].card, 'tabs'); assert.equal(p.gaps[0].purpose, 'switch between day and week');
  assert.equal(p.gaps[1].card, null);
  assert.equal(p.parts[0].status, 'gap');
});

test('an explicit component hint wins over the part name', () => {
  const p = planScreen([{ name: 'Log a sighting', component: 'Button' }], design);
  assert.equal(p.parts[0].component, 'Button'); assert.equal(p.parts[0].status, 'match');
});

test('the same missing component asked for twice is one gap', () => {
  const p = planScreen([{ name: 'Tabs', purpose: 'a' }, { name: 'tabs', purpose: 'b' }], design);
  assert.equal(p.gaps.length, 1);
  assert.equal(p.parts.length, 2);
});

test('screensDir: the recorded one, else a sibling "screens" of the components directory', () => {
  assert.equal(screensDir({ scan: { componentsDir: 'src/components', screensDir: 'src/pages' } }), 'src/pages');
  assert.equal(screensDir({ scan: { componentsDir: 'src/components' } }), 'src/screens');
  assert.equal(screensDir({ scan: { componentsDir: 'app/ui' } }), 'app/screens');
  assert.equal(screensDir({}), 'src/screens');
});

test('a part marked as the screen\'s own content (a heading, copy, layout) is neither a match nor a gap', () => {
  const p = planScreen([{ name: 'Page title', purpose: 'the date', own: true }, { name: 'Button' }], design);
  assert.deepEqual(p.parts.map((x) => x.status), ['own', 'match']);
  assert.deepEqual(p.gaps, []);
});

test('screenName makes a component-style name, and falls back when nothing usable is left', async () => {
  const { screenName } = await import('../lib/screens.mjs');
  assert.equal(screenName("today's sightings"), 'TodaysSightings');
  assert.equal(screenName('sign in'), 'SignIn');
  assert.equal(screenName('!!!'), 'Screen');
  assert.equal(screenName('日本語'), 'Screen');
  assert.equal(screenName(undefined), 'Screen');
});
