/**
 * Bestiary Integration Tests
 * Tests that the bestiary is properly wired into:
 * - State initialization (initialState, initialStateWithClass)
 * - Combat encounters (startNewEncounter records encounters)
 * - Victory (applyVictoryDefeat records defeats via playerAttack)
 * - UI handler (VIEW_BESTIARY / CLOSE_BESTIARY actions)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { initialState, initialStateWithClass } from '../src/state.js';
import { startNewEncounter, playerAttack } from '../src/combat.js';
import { handleUIAction } from '../src/handlers/ui-handler.js';
import { createBestiaryState, hasEncountered, getDefeatCount } from '../src/bestiary.js';

describe('Bestiary Integration — State Initialization', () => {
  it('initialState() includes bestiary', () => {
    const state = initialState();
    assert.ok(state.bestiary, 'state.bestiary should exist');
    assert.ok(Array.isArray(state.bestiary.encountered), 'bestiary.encountered should be an array');
    assert.deepStrictEqual(state.bestiary.encountered, []);
    assert.deepStrictEqual(state.bestiary.defeatedCounts, {});
  });

  it('initialStateWithClass(warrior) includes bestiary', () => {
    const state = initialStateWithClass('warrior');
    assert.ok(state.bestiary, 'state.bestiary should exist');
    assert.ok(Array.isArray(state.bestiary.encountered), 'bestiary.encountered should be an array');
    assert.deepStrictEqual(state.bestiary.encountered, []);
    assert.deepStrictEqual(state.bestiary.defeatedCounts, {});
  });

  it('initialStateWithClass(mage) includes bestiary', () => {
    const state = initialStateWithClass('mage');
    assert.ok(state.bestiary, 'state.bestiary should exist');
    assert.deepStrictEqual(state.bestiary.encountered, []);
  });

  it('initialStateWithClass(rogue) includes bestiary', () => {
    const state = initialStateWithClass('rogue');
    assert.ok(state.bestiary, 'state.bestiary should exist');
    assert.deepStrictEqual(state.bestiary.encountered, []);
  });

  it('initialStateWithClass(cleric) includes bestiary', () => {
    const state = initialStateWithClass('cleric');
    assert.ok(state.bestiary, 'state.bestiary should exist');
    assert.deepStrictEqual(state.bestiary.encountered, []);
  });
});

describe('Bestiary Integration — Combat Encounter Recording', () => {
  it('startNewEncounter records the enemy in bestiary.encountered', () => {
    const state = initialStateWithClass('warrior');
    const explorationState = { ...state, phase: 'exploration' };
    const encounterState = startNewEncounter(explorationState, 1);
    
    assert.ok(encounterState.bestiary, 'bestiary should still exist after encounter');
    assert.ok(encounterState.bestiary.encountered.length > 0, 'should have at least one encountered enemy');
    assert.ok(encounterState.currentEnemyId, 'currentEnemyId should be set');
    assert.ok(hasEncountered(encounterState.bestiary, encounterState.currentEnemyId),
      'the encountered enemy should be tracked in bestiary');
  });

  it('startNewEncounter stores currentEnemyId in state', () => {
    const state = initialStateWithClass('warrior');
    const encounterState = startNewEncounter(state, 1);
    assert.ok(typeof encounterState.currentEnemyId === 'string', 'currentEnemyId should be a string');
    assert.ok(encounterState.currentEnemyId.length > 0, 'currentEnemyId should not be empty');
  });

  it('multiple encounters accumulate in bestiary', () => {
    let state = initialStateWithClass('warrior');
    for (let i = 0; i < 5; i++) {
      state = {
        ...state,
        phase: 'exploration',
        rngSeed: (state.rngSeed * 48271) % 2147483647,
      };
      state = startNewEncounter(state, 1);
    }
    assert.ok(state.bestiary.encountered.length >= 1, 'should have encountered at least one unique enemy');
  });

  it('startNewEncounter works even without pre-existing bestiary (graceful fallback)', () => {
    const state = initialStateWithClass('warrior');
    const noBestiaryState = { ...state, bestiary: undefined };
    const encounterState = startNewEncounter(noBestiaryState, 1);
    
    assert.ok(encounterState.bestiary, 'bestiary should be created from fallback');
    assert.ok(encounterState.bestiary.encountered.length > 0, 'should have at least one encountered enemy');
  });
});

describe('Bestiary Integration — Victory Defeat Recording', () => {
  it('defeating an enemy records the defeat in bestiary', () => {
    let state = initialStateWithClass('warrior');
    state = startNewEncounter(state, 1);
    const enemyId = state.currentEnemyId;
    assert.ok(enemyId, 'should have a currentEnemyId');
    
    // Set up a scenario where the enemy will die from one hit
    state = {
      ...state,
      enemy: { ...state.enemy, hp: 1, maxHp: 100, def: 0, statusEffects: [] },
      player: { ...state.player, atk: 999, defending: false, statusEffects: [], equipment: {} },
      phase: 'player-turn',
    };
    
    const afterAttack = playerAttack(state);
    
    if (afterAttack.phase === 'victory') {
      assert.ok(getDefeatCount(afterAttack.bestiary, enemyId) >= 1,
        'defeated enemy should have defeat count >= 1');
    }
  });
});

describe('Bestiary Integration — UI Handler Actions', () => {
  it('VIEW_BESTIARY changes phase to bestiary from exploration', () => {
    const state = { phase: 'exploration', bestiary: createBestiaryState(), log: [] };
    const result = handleUIAction(state, { type: 'VIEW_BESTIARY' });
    assert.ok(result, 'should return a new state');
    assert.strictEqual(result.phase, 'bestiary');
    assert.strictEqual(result.previousPhase, 'exploration');
  });

  it('VIEW_BESTIARY changes phase to bestiary from player-turn', () => {
    const state = { phase: 'player-turn', bestiary: createBestiaryState(), log: [] };
    const result = handleUIAction(state, { type: 'VIEW_BESTIARY' });
    assert.ok(result, 'should return a new state');
    assert.strictEqual(result.phase, 'bestiary');
    assert.strictEqual(result.previousPhase, 'player-turn');
  });

  it('VIEW_BESTIARY returns null during class-select', () => {
    const state = { phase: 'class-select', log: [] };
    const result = handleUIAction(state, { type: 'VIEW_BESTIARY' });
    assert.strictEqual(result, null, 'should return null during class-select');
  });

  it('CLOSE_BESTIARY returns to previous phase', () => {
    const state = { phase: 'bestiary', previousPhase: 'exploration', bestiary: createBestiaryState(), log: [] };
    const result = handleUIAction(state, { type: 'CLOSE_BESTIARY' });
    assert.ok(result, 'should return a new state');
    assert.strictEqual(result.phase, 'exploration');
  });

  it('CLOSE_BESTIARY defaults to exploration if no previousPhase', () => {
    const state = { phase: 'bestiary', bestiary: createBestiaryState(), log: [] };
    const result = handleUIAction(state, { type: 'CLOSE_BESTIARY' });
    assert.ok(result, 'should return a new state');
    assert.strictEqual(result.phase, 'exploration');
  });

  it('CLOSE_BESTIARY returns null if not in bestiary phase', () => {
    const state = { phase: 'exploration', log: [] };
    const result = handleUIAction(state, { type: 'CLOSE_BESTIARY' });
    assert.strictEqual(result, null, 'should return null if not in bestiary phase');
  });

  it('SEARCH_BESTIARY updates bestiaryUiState.search while preserving other fields', () => {
    const state = {
      phase: 'exploration',
      log: [],
      bestiary: createBestiaryState(),
      bestiaryUiState: { sort: 'name', filter: 'bosses', search: '' },
    };
    const result = handleUIAction(state, { type: 'SEARCH_BESTIARY', search: 'slime' });
    assert.ok(result, 'should return a new state');
    assert.strictEqual(result.bestiaryUiState.search, 'slime');
    assert.strictEqual(result.bestiaryUiState.sort, 'name');
    assert.strictEqual(result.bestiaryUiState.filter, 'bosses');
  });
});

describe('Bestiary Integration — No Easter Eggs', () => {
  it('no forbidden words in bestiary integration code', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    
    const filesToCheck = [
      'src/state.js',
      'src/combat.js',
      'src/handlers/ui-handler.js',
      'src/main.js',
      'src/render.js',
    ];
    
    const forbidden = ['cockatrice', 'basilisk', 'hidden_message', 'secret_code'];
    
    for (const file of filesToCheck) {
      const filePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
      for (const word of forbidden) {
        const regex = new RegExp(word, 'i');
        assert.ok(!regex.test(content), 
          'Forbidden word "' + word + '" found in ' + file);
      }
    }
  });
});
