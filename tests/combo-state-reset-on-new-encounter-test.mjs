import { describe, it } from 'node:test';
import assert from 'node:assert';
import { startNewEncounter } from '../src/combat.js';
import { handleEncounterAction } from '../src/handlers/encounter-handler.js';
import { handleDungeonAction } from '../src/handlers/dungeon-handler.js';
import { createDungeonState, enterDungeon } from '../src/dungeon-floors.js';
import { createComboState } from '../src/combo-system.js';

function createActiveCombo(hitCount) {
  return { ...createComboState(), hitCount, isActive: true, lastHitTurn: 5 };
}

describe('Combo state reset on new encounter', () => {
  it('resets when starting a new encounter directly', () => {
    const state = {
      player: { hp: 10, maxHp: 10 },
      comboState: createActiveCombo(3),
      log: [],
    };

    const result = startNewEncounter(state, 1);

    assert.strictEqual(result.comboState.hitCount, 0);
  });

  it('resets when engaging a map encounter', () => {
    const state = {
      player: { hp: 12, maxHp: 12 },
      comboState: createActiveCombo(4),
      currentEncounter: { enemies: ['slime'] },
      log: [],
    };

    const result = handleEncounterAction(state, { type: 'ENGAGE_ENCOUNTER' });

    assert.ok(result);
    assert.strictEqual(result.comboState.hitCount, 0);
  });

  it('resets when dungeon search triggers combat', () => {
    const dungeonState = enterDungeon(createDungeonState());
    const state = {
      phase: 'dungeon',
      dungeonState,
      rngSeed: 1, // deterministic low roll to trigger encounter
      player: { hp: 15, maxHp: 15 },
      comboState: createActiveCombo(2),
      log: [],
    };

    const result = handleDungeonAction(state, { type: 'DUNGEON_SEARCH' });

    assert.ok(result);
    assert.strictEqual(result.comboState.hitCount, 0);
  });

  it('resets when challenging a dungeon boss', () => {
    const dungeonState = { ...enterDungeon(createDungeonState()), currentFloor: 3 };
    const state = {
      phase: 'dungeon',
      dungeonState,
      player: { hp: 20, maxHp: 20 },
      comboState: createActiveCombo(5),
      log: [],
    };

    const result = handleDungeonAction(state, { type: 'DUNGEON_FIGHT_BOSS' });

    assert.ok(result);
    assert.strictEqual(result.comboState.hitCount, 0);
  });
});
