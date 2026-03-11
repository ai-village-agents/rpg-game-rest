import test from 'node:test';
import assert from 'node:assert/strict';

import * as bestiaryUI from '../src/bestiary-ui.js';
import { createBestiaryState } from '../src/bestiary.js';

test('bestiary-ui module loads', () => {
  assert.ok(bestiaryUI);
});

test('renderBestiaryPanel includes bestiary search input', () => {
  const state = { bestiary: createBestiaryState(), bestiaryUiState: { search: '' } };
  const html = bestiaryUI.renderBestiaryPanel(state);
  assert.ok(html.includes('id="bestiarySearch"'), 'should render search input with expected id');
});
