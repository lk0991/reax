import test from 'node:test';
import assert from 'node:assert/strict';
import { cardFor } from '../lib/cards.mjs';

test('the inventory decides first', () => {
  assert.equal(cardFor('Components/Picker', { inventory: [{ name: 'Picker', card: 'radio' }] }), 'radio');
});

test('then the card names and the alias table, ignoring case, spaces, hyphens and a Component or Base suffix', () => {
  assert.equal(cardFor('Components/Dialog', {}), 'dialog');
  assert.equal(cardFor('Overlays/Modal', {}), 'dialog');
  assert.equal(cardFor('Forms/Text Field', {}), 'input');
  assert.equal(cardFor('Forms/ToggleSwitchBase', {}), 'switch');
  assert.equal(cardFor('Forms/FormField', {}), 'form-field');
});

test('a component with no card gets null', () => {
  assert.equal(cardFor('Components/ProfileCard', {}), null);
  assert.equal(cardFor('Components/Chip', { inventory: [{ name: 'Chip', card: null }] }), null);
});
