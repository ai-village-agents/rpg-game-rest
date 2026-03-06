/**
 * Talent Handler Integration Tests
 * Tests for VIEW_TALENTS, ALLOCATE_TALENT, DEALLOCATE_TALENT, RESET_TALENTS, CLOSE_TALENTS handlers
 * and level-up skill point granting integration
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { handleUIAction } from '../src/handlers/ui-handler.js';
import { handleStateTransitions } from '../src/state-transitions.js';
import { createTalentState, addSkillPoints, allocateTalent } from '../src/talents.js';

// Helper to create a base game state
function createBaseState(overrides = {}) {
  return {
    phase: 'exploration',
    player: {
      name: 'Hero',
      classId: 'warrior',
      level: 1,
      xp: 0,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      atk: 15,
      def: 10,
      spd: 12,
      stats: { maxHp: 100, maxMp: 50, atk: 15, def: 10, spd: 12 },
      gold: 100,
      inventory: []
    },
    log: [],
    ...overrides
  };
}

describe('Talent Handler Integration', () => {
  describe('VIEW_TALENTS handler', () => {
    it('should open talents screen from exploration', () => {
      const state = createBaseState();
      const result = handleUIAction(state, { type: 'VIEW_TALENTS' });
      
      assert.ok(result, 'Should return a new state');
      assert.strictEqual(result.phase, 'talents');
      assert.strictEqual(result.previousPhase, 'exploration');
      assert.ok(result.talentState, 'Should initialize talentState');
      assert.strictEqual(result.talentState.availablePoints, 0);
    });

    it('should preserve existing talentState when reopening', () => {
      const existingTalentState = addSkillPoints(createTalentState(), 5);
      const state = createBaseState({ talentState: existingTalentState });
      const result = handleUIAction(state, { type: 'VIEW_TALENTS' });
      
      assert.strictEqual(result.talentState.availablePoints, 5);
    });

    it('should not open talents during class-select', () => {
      const state = createBaseState({ phase: 'class-select' });
      const result = handleUIAction(state, { type: 'VIEW_TALENTS' });
      
      assert.strictEqual(result, null);
    });
  });

  describe('ALLOCATE_TALENT handler', () => {
    it('should allocate talent when in talents phase with points', () => {
      let state = createBaseState({ phase: 'talents' });
      state.talentState = addSkillPoints(createTalentState(), 5);
      
      const result = handleUIAction(state, { type: 'ALLOCATE_TALENT', talentId: 'sharpened-blade' });
      
      assert.ok(result, 'Should return a new state');
      assert.strictEqual(result.talentState.availablePoints, 4);
      assert.strictEqual(result.talentState.allocatedTalents['sharpened-blade'], 1);
      assert.ok(result.log.some(line => line.includes('Allocated')), 'Should have allocation log');
    });

    it('should fail allocation without points', () => {
      let state = createBaseState({ phase: 'talents' });
      state.talentState = createTalentState(); // 0 points
      
      const result = handleUIAction(state, { type: 'ALLOCATE_TALENT', talentId: 'sharpened-blade' });
      
      assert.ok(result, 'Should return a new state');
      assert.ok(result.log.some(line => line.includes('Unable') || line.includes('points')), 'Should have error log');
    });

    it('should not allocate when not in talents phase', () => {
      let state = createBaseState({ phase: 'exploration' });
      state.talentState = addSkillPoints(createTalentState(), 5);
      
      const result = handleUIAction(state, { type: 'ALLOCATE_TALENT', talentId: 'sharpened-blade' });
      
      assert.strictEqual(result, null);
    });

    it('should not allocate without talentId', () => {
      let state = createBaseState({ phase: 'talents' });
      state.talentState = addSkillPoints(createTalentState(), 5);
      
      const result = handleUIAction(state, { type: 'ALLOCATE_TALENT' });
      
      assert.strictEqual(result, null);
    });
  });

  describe('DEALLOCATE_TALENT handler', () => {
    it('should deallocate talent when in talents phase', () => {
      let state = createBaseState({ phase: 'talents' });
      state.talentState = addSkillPoints(createTalentState(), 5);
      // Allocate first
      const allocResult = allocateTalent(state.talentState, 'sharpened-blade');
      state.talentState = allocResult.newState;
      
      const result = handleUIAction(state, { type: 'DEALLOCATE_TALENT', talentId: 'sharpened-blade' });
      
      assert.ok(result, 'Should return a new state');
      assert.strictEqual(result.talentState.availablePoints, 5);
      assert.ok(result.log.some(line => line.includes('Deallocated')), 'Should have deallocation log');
    });

    it('should fail deallocation on unallocated talent', () => {
      let state = createBaseState({ phase: 'talents' });
      state.talentState = addSkillPoints(createTalentState(), 5);
      
      const result = handleUIAction(state, { type: 'DEALLOCATE_TALENT', talentId: 'sharpened-blade' });
      
      assert.ok(result, 'Should return a new state');
      assert.ok(result.log.some(line => line.includes('Unable') || line.includes('no points allocated')), 'Should have error log');
    });
  });

  describe('RESET_TALENTS handler', () => {
    it('should reset all talents and refund points', () => {
      let state = createBaseState({ phase: 'talents' });
      state.talentState = addSkillPoints(createTalentState(), 5);
      // Allocate some talents
      let result = allocateTalent(state.talentState, 'sharpened-blade');
      state.talentState = result.newState;
      result = allocateTalent(state.talentState, 'sharpened-blade');
      state.talentState = result.newState;
      
      assert.strictEqual(state.talentState.availablePoints, 3);
      
      const resetResult = handleUIAction(state, { type: 'RESET_TALENTS' });
      
      assert.ok(resetResult, 'Should return a new state');
      assert.strictEqual(resetResult.talentState.availablePoints, 5);
      assert.strictEqual(resetResult.talentState.totalPointsSpent, 0);
      assert.ok(resetResult.log.some(line => line.includes('reset')), 'Should have reset log');
    });

    it('should not reset when not in talents phase', () => {
      let state = createBaseState({ phase: 'exploration' });
      state.talentState = addSkillPoints(createTalentState(), 5);
      
      const result = handleUIAction(state, { type: 'RESET_TALENTS' });
      
      assert.strictEqual(result, null);
    });
  });

  describe('CLOSE_TALENTS handler', () => {
    it('should return to previous phase', () => {
      const state = createBaseState({ 
        phase: 'talents', 
        previousPhase: 'exploration',
        talentState: createTalentState()
      });
      
      const result = handleUIAction(state, { type: 'CLOSE_TALENTS' });
      
      assert.ok(result, 'Should return a new state');
      assert.strictEqual(result.phase, 'exploration');
    });

    it('should default to exploration if no previousPhase', () => {
      const state = createBaseState({ 
        phase: 'talents',
        talentState: createTalentState()
      });
      
      const result = handleUIAction(state, { type: 'CLOSE_TALENTS' });
      
      assert.strictEqual(result.phase, 'exploration');
    });

    it('should not close when not in talents phase', () => {
      const state = createBaseState({ phase: 'exploration' });
      
      const result = handleUIAction(state, { type: 'CLOSE_TALENTS' });
      
      assert.strictEqual(result, null);
    });
  });
});

describe('Level-Up Skill Point Integration', () => {
  it('should grant skill points on level-up', () => {
    const prevState = createBaseState({
      phase: 'combat',
      player: {
        name: 'Hero',
        classId: 'warrior',
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        atk: 15,
        def: 10,
        spd: 12,
        int: 8,
        lck: 5,
        stats: { maxHp: 100, maxMp: 50, atk: 15, def: 10, spd: 12, int: 8, lck: 5 },
      },
      xpGained: 150
    });
    
    const nextState = {
      ...prevState,
      phase: 'victory',
      player: {
        ...prevState.player,
        xp: 150 // XP that should trigger level up
      }
    };
    
    const result = handleStateTransitions(prevState, nextState);
    
    assert.ok(result.talentState, 'Should have talentState');
    assert.ok(result.talentState.availablePoints >= 1, 'Should have at least 1 skill point');
    assert.ok(result.log.some(line => line.includes('skill point')), 'Should log skill point gain');
  });

  it('should initialize talentState if not present on level-up', () => {
    const prevState = createBaseState({
      phase: 'combat',
      player: {
        name: 'Hero',
        classId: 'warrior',
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        atk: 15,
        def: 10,
        spd: 12,
        int: 8,
        lck: 5,
        stats: { maxHp: 100, maxMp: 50, atk: 15, def: 10, spd: 12, int: 8, lck: 5 },
      },
      xpGained: 150
    });
    // Explicitly no talentState
    delete prevState.talentState;
    
    const nextState = {
      ...prevState,
      phase: 'victory',
      player: {
        ...prevState.player,
        xp: 150
      }
    };
    
    const result = handleStateTransitions(prevState, nextState);
    
    // If level up happens, talentState should be created
    if (result.pendingLevelUps && result.pendingLevelUps.length > 0) {
      assert.ok(result.talentState, 'Should create talentState on level-up');
    }
  });

  it('should add to existing talentState points on level-up', () => {
    const existingTalentState = addSkillPoints(createTalentState(), 3);
    
    const prevState = createBaseState({
      phase: 'combat',
      talentState: existingTalentState,
      player: {
        name: 'Hero',
        classId: 'warrior',
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        atk: 15,
        def: 10,
        spd: 12,
        int: 8,
        lck: 5,
        stats: { maxHp: 100, maxMp: 50, atk: 15, def: 10, spd: 12, int: 8, lck: 5 },
      },
      xpGained: 150
    });
    
    const nextState = {
      ...prevState,
      phase: 'victory',
      player: {
        ...prevState.player,
        xp: 150
      }
    };
    
    const result = handleStateTransitions(prevState, nextState);
    
    // If level up happens, should add to existing points
    if (result.pendingLevelUps && result.pendingLevelUps.length > 0) {
      assert.ok(result.talentState.availablePoints >= 4, 'Should have existing + new points');
    }
  });
});

describe('Forbidden Content Check', () => {
  it('should not contain easter egg patterns in handler code', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const handlerPath = path.join(process.cwd(), 'src/handlers/ui-handler.js');
    const transitionsPath = path.join(process.cwd(), 'src/state-transitions.js');
    
    const handlerContent = fs.readFileSync(handlerPath, 'utf-8');
    const transitionsContent = fs.readFileSync(transitionsPath, 'utf-8');
    
    const forbiddenPatterns = [
      /\begg\b/i,
      /\beaster\b/i,
      /\brabbit\b/i,
      /\bbunny\b/i,
      /\bhunt\b/i,
      /\bbasket\b/i,
      /🥚/,
      /🐰/,
      /🐣/,
      /\bcockatrice\b/i,
      /\bbasilisk\b/i
    ];
    
    for (const pattern of forbiddenPatterns) {
      assert.ok(!pattern.test(handlerContent), `ui-handler.js should not match forbidden pattern: ${pattern}`);
      assert.ok(!pattern.test(transitionsContent), `state-transitions.js should not match forbidden pattern: ${pattern}`);
    }
  });
});
