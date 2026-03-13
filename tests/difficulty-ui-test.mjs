/**
 * Difficulty UI Selection Tests
 * Tests for difficulty selection during character creation
 * Created by Claude Opus 4.5 (Day 345)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { initialStateWithClass } from '../src/state.js';
import {
  DIFFICULTY_LEVELS,
  DIFFICULTY_NAMES,
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_MULTIPLIERS,
} from '../src/difficulty.js';
import { handleSystemAction } from '../src/handlers/system-handler.js';

function withMockedMathRandom(value, fn) {
  const realRandom = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = realRandom;
  }
}

describe('Difficulty Selection UI', () => {
  describe('initialStateWithClass with difficulty parameter', () => {
    it('should use default difficulty when not specified', () => {
      const state = initialStateWithClass('warrior', 'TestHero');
      assert.strictEqual(state.difficulty, DIFFICULTY_LEVELS.NORMAL);
    });

    it('should accept easy difficulty', () => {
      const state = initialStateWithClass('warrior', 'TestHero', DIFFICULTY_LEVELS.EASY);
      assert.strictEqual(state.difficulty, DIFFICULTY_LEVELS.EASY);
    });

    it('should accept hard difficulty', () => {
      const state = initialStateWithClass('mage', 'TestMage', DIFFICULTY_LEVELS.HARD);
      assert.strictEqual(state.difficulty, DIFFICULTY_LEVELS.HARD);
    });

    it('should accept nightmare difficulty', () => {
      const state = initialStateWithClass('rogue', 'TestRogue', DIFFICULTY_LEVELS.NIGHTMARE);
      assert.strictEqual(state.difficulty, DIFFICULTY_LEVELS.NIGHTMARE);
    });

    it('should apply difficulty to initial enemy HP (easy)', () => {
      withMockedMathRandom(0.123456789, () => {
        const normalState = initialStateWithClass('warrior', 'Test', DIFFICULTY_LEVELS.NORMAL);
        const easyState = initialStateWithClass('warrior', 'Test', DIFFICULTY_LEVELS.EASY);

        // Easy enemies should have less (or equal) HP than normal.
        // We mock Math.random so both states pick the same initial enemy.
        assert.ok(
          easyState.enemy.maxHp <= normalState.enemy.maxHp,
          `Easy HP (${easyState.enemy.maxHp}) should be <= Normal HP (${normalState.enemy.maxHp})`
        );
      });
    });

    it('should apply difficulty to initial enemy HP (hard)', () => {
      withMockedMathRandom(0.123456789, () => {
        const normalState = initialStateWithClass('warrior', 'Test', DIFFICULTY_LEVELS.NORMAL);
        const hardState = initialStateWithClass('warrior', 'Test', DIFFICULTY_LEVELS.HARD);

        // Hard enemies should have more HP than normal.
        assert.ok(
          hardState.enemy.maxHp > normalState.enemy.maxHp,
          `Hard HP (${hardState.enemy.maxHp}) should be greater than Normal HP (${normalState.enemy.maxHp})`
        );
      });
    });

    it('should apply difficulty to initial enemy HP (nightmare)', () => {
      withMockedMathRandom(0.123456789, () => {
        const normalState = initialStateWithClass('warrior', 'Test', DIFFICULTY_LEVELS.NORMAL);
        const nightmareState = initialStateWithClass('warrior', 'Test', DIFFICULTY_LEVELS.NIGHTMARE);

        // Nightmare enemies should have significantly more HP than normal.
        assert.ok(
          nightmareState.enemy.maxHp > normalState.enemy.maxHp,
          `Nightmare HP (${nightmareState.enemy.maxHp}) should be greater than Normal HP (${normalState.enemy.maxHp})`
        );
      });
    });
  });

  describe('SELECT_CLASS action with difficulty', () => {
    it('should pass difficulty to initialStateWithClass', () => {
      const mockState = { phase: 'class-select' };
      const action = {
        type: 'SELECT_CLASS',
        classId: 'warrior',
        name: 'TestWarrior',
        difficulty: DIFFICULTY_LEVELS.HARD,
      };

      const newState = handleSystemAction(mockState, action);
      assert.strictEqual(newState.difficulty, DIFFICULTY_LEVELS.HARD);
    });

    it('should default to normal difficulty if invalid difficulty provided', () => {
      const mockState = { phase: 'class-select' };
      const action = {
        type: 'SELECT_CLASS',
        classId: 'mage',
        name: 'TestMage',
        difficulty: 'invalid-difficulty',
      };

      const newState = handleSystemAction(mockState, action);
      assert.strictEqual(newState.difficulty, DIFFICULTY_LEVELS.NORMAL);
    });

    it('should default to normal difficulty if difficulty not provided', () => {
      const mockState = { phase: 'class-select' };
      const action = {
        type: 'SELECT_CLASS',
        classId: 'cleric',
        name: 'TestCleric',
      };

      const newState = handleSystemAction(mockState, action);
      assert.strictEqual(newState.difficulty, DIFFICULTY_LEVELS.NORMAL);
    });
  });

  describe('Difficulty data exports', () => {
    it('should have all difficulty levels defined', () => {
      assert.ok(DIFFICULTY_LEVELS.EASY);
      assert.ok(DIFFICULTY_LEVELS.NORMAL);
      assert.ok(DIFFICULTY_LEVELS.HARD);
      assert.ok(DIFFICULTY_LEVELS.NIGHTMARE);
    });

    it('should have display names for all levels', () => {
      Object.values(DIFFICULTY_LEVELS).forEach(level => {
        assert.ok(DIFFICULTY_NAMES[level], `Missing display name for ${level}`);
      });
    });

    it('should have descriptions for all levels', () => {
      Object.values(DIFFICULTY_LEVELS).forEach(level => {
        assert.ok(DIFFICULTY_DESCRIPTIONS[level], `Missing description for ${level}`);
      });
    });

    it('should have multipliers for all levels', () => {
      Object.values(DIFFICULTY_LEVELS).forEach(level => {
        const multipliers = DIFFICULTY_MULTIPLIERS[level];
        assert.ok(multipliers, `Missing multipliers for ${level}`);
        assert.ok(typeof multipliers.enemyDamage === 'number');
        assert.ok(typeof multipliers.enemyHp === 'number');
        assert.ok(typeof multipliers.xpReward === 'number');
        assert.ok(typeof multipliers.goldReward === 'number');
      });
    });
  });
});
