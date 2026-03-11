import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderBestiaryPanel } from '../src/bestiary-ui.js';
import { createBestiaryState } from '../src/bestiary.js';

describe('Bestiary search filtering', () => {
  it('filters entries by search term (name or id)', () => {
    const bestiary = { ...createBestiaryState(), encountered: ['training_dummy', 'goblin'] };
    const state = {
      bestiary,
      bestiaryUiState: { search: 'DUMMY' },
    };

    const html = renderBestiaryPanel(state);
    assert.ok(html.includes('Training Dummy'), 'matching enemy should be rendered');
    assert.ok(!html.includes('class="bestiary-name">Goblin'), 'non-matching enemy should be filtered out');
  });
});
