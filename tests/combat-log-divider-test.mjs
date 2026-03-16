import { describe, it } from 'node:test';
import assert from 'node:assert';
import { handleUIAction } from '../src/handlers/ui-handler.js';
import { createWorldState } from '../src/map.js';

const DIVIDER = '— Back to exploration —';

function createBaseState(overrides = {}) {
  return {
    phase: 'exploration',
    player: { name: 'Hero', defending: true },
    world: createWorldState(),
    log: [],
    ...overrides,
  };
}

describe('Combat log divider', () => {
  it('adds divider when continuing after battle', () => {
    const state = createBaseState({
      phase: 'battle-summary',
      battleSummary: {},
    });

    const result = handleUIAction(state, { type: 'CONTINUE_AFTER_BATTLE' });

    assert.ok(result, 'returns a new state');
    assert.strictEqual(result.phase, 'exploration');
    const dividerIndex = result.log.indexOf(DIVIDER);
    const gatherIndex = result.log.indexOf('You gather yourself and continue your journey.');
    assert.ok(dividerIndex >= 0, 'includes exploration divider');
    assert.ok(gatherIndex >= 0, 'includes gather log');
    assert.ok(dividerIndex < gatherIndex, 'divider precedes gather log');
  });

  it('adds divider when continuing after flee', () => {
    const state = createBaseState({
      phase: 'fled',
      enemy: { name: 'Bandit' },
    });

    const result = handleUIAction(state, { type: 'CONTINUE_AFTER_FLEE' });

    assert.ok(result, 'returns a new state');
    assert.strictEqual(result.phase, 'exploration');
    const dividerIndex = result.log.indexOf(DIVIDER);
    const safetyIndex = result.log.indexOf('You slip away and return to safety.');
    assert.ok(dividerIndex >= 0, 'includes exploration divider');
    assert.ok(safetyIndex >= 0, 'includes safety log');
    assert.ok(dividerIndex < safetyIndex, 'divider precedes safety log');
  });

  it('adds divider when continuing exploration after victory', () => {
    const state = createBaseState({
      phase: 'victory',
    });

    const result = handleUIAction(state, { type: 'CONTINUE_EXPLORING' });

    assert.ok(result, 'returns a new state');
    assert.strictEqual(result.phase, 'exploration');
    assert.ok(result.log.includes(DIVIDER), 'includes exploration divider');
  });
});
