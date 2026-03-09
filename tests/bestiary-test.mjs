import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ENEMIES } from '../src/data/enemies.js';
import { BOSSES } from '../src/data/bosses.js';
import {
  createBestiaryState,
  recordEncounter,
  recordDefeat,
  hasEncountered,
  getDefeatCount,
  getEncounteredCount,
  getDefeatedUniqueCount,
  getBestiaryEntry,
  getAllBestiaryEntries,
  getCompletionPercent,
  getTotalEnemyCount,
} from '../src/bestiary.js';

describe('Bestiary', () => {
  describe('createBestiaryState', () => {
    it('should create an empty bestiary state', () => {
      const state = createBestiaryState();
      assert.deepStrictEqual(state.encountered, []);
      assert.deepStrictEqual(state.defeatedCounts, {});
    });
  });

  describe('recordEncounter', () => {
    it('should add a new enemy to encountered list', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'slime');
      assert.deepStrictEqual(bestiary.encountered, ['slime']);
    });

    it('should not duplicate encounters', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'slime');
      bestiary = recordEncounter(bestiary, 'slime');
      assert.deepStrictEqual(bestiary.encountered, ['slime']);
    });

    it('should track multiple enemies', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'slime');
      bestiary = recordEncounter(bestiary, 'goblin');
      bestiary = recordEncounter(bestiary, 'wolf');
      assert.equal(bestiary.encountered.length, 3);
      assert.ok(bestiary.encountered.includes('slime'));
      assert.ok(bestiary.encountered.includes('goblin'));
      assert.ok(bestiary.encountered.includes('wolf'));
    });

    it('should handle invalid input gracefully', () => {
      let bestiary = createBestiaryState();
      assert.deepStrictEqual(recordEncounter(bestiary, null), bestiary);
      assert.deepStrictEqual(recordEncounter(bestiary, ''), bestiary);
      assert.deepStrictEqual(recordEncounter(bestiary, 123), bestiary);
    });

    it('should return new state object (immutability)', () => {
      let bestiary = createBestiaryState();
      const updated = recordEncounter(bestiary, 'slime');
      assert.notStrictEqual(bestiary, updated);
      assert.deepStrictEqual(bestiary.encountered, []);
    });
  });

  describe('recordDefeat', () => {
    it('should record a defeat and auto-encounter', () => {
      let bestiary = createBestiaryState();
      bestiary = recordDefeat(bestiary, 'slime');
      assert.ok(bestiary.encountered.includes('slime'));
      assert.equal(bestiary.defeatedCounts['slime'], 1);
    });

    it('should increment defeat count on multiple defeats', () => {
      let bestiary = createBestiaryState();
      bestiary = recordDefeat(bestiary, 'goblin');
      bestiary = recordDefeat(bestiary, 'goblin');
      bestiary = recordDefeat(bestiary, 'goblin');
      assert.equal(bestiary.defeatedCounts['goblin'], 3);
      assert.equal(bestiary.encountered.length, 1);
    });

    it('should handle invalid input gracefully', () => {
      let bestiary = createBestiaryState();
      assert.deepStrictEqual(recordDefeat(bestiary, null), bestiary);
      assert.deepStrictEqual(recordDefeat(bestiary, ''), bestiary);
    });

    it('should return new state object (immutability)', () => {
      let bestiary = createBestiaryState();
      const updated = recordDefeat(bestiary, 'slime');
      assert.notStrictEqual(bestiary, updated);
      assert.deepStrictEqual(bestiary.defeatedCounts, {});
    });
  });

  describe('hasEncountered', () => {
    it('should return false for unencountered enemy', () => {
      const bestiary = createBestiaryState();
      assert.equal(hasEncountered(bestiary, 'slime'), false);
    });

    it('should return true for encountered enemy', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'slime');
      assert.equal(hasEncountered(bestiary, 'slime'), true);
    });
  });

  describe('getDefeatCount', () => {
    it('should return 0 for undefeated enemy', () => {
      const bestiary = createBestiaryState();
      assert.equal(getDefeatCount(bestiary, 'slime'), 0);
    });

    it('should return correct defeat count', () => {
      let bestiary = createBestiaryState();
      bestiary = recordDefeat(bestiary, 'slime');
      bestiary = recordDefeat(bestiary, 'slime');
      assert.equal(getDefeatCount(bestiary, 'slime'), 2);
    });
  });

  describe('getEncounteredCount', () => {
    it('should return 0 for empty bestiary', () => {
      assert.equal(getEncounteredCount(createBestiaryState()), 0);
    });

    it('should count unique encounters', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'slime');
      bestiary = recordEncounter(bestiary, 'goblin');
      bestiary = recordDefeat(bestiary, 'wolf');
      assert.equal(getEncounteredCount(bestiary), 3);
    });
  });

  describe('getDefeatedUniqueCount', () => {
    it('should return 0 for empty bestiary', () => {
      assert.equal(getDefeatedUniqueCount(createBestiaryState()), 0);
    });

    it('should count unique defeated enemies', () => {
      let bestiary = createBestiaryState();
      bestiary = recordDefeat(bestiary, 'slime');
      bestiary = recordDefeat(bestiary, 'slime');
      bestiary = recordDefeat(bestiary, 'goblin');
      assert.equal(getDefeatedUniqueCount(bestiary), 2);
    });
  });

  describe('getBestiaryEntry', () => {
    it('should return null for nonexistent enemy', () => {
      const bestiary = createBestiaryState();
      assert.equal(getBestiaryEntry(bestiary, 'nonexistent'), null);
    });

    it('should return hidden entry for unencountered enemy', () => {
      const bestiary = createBestiaryState();
      const entry = getBestiaryEntry(bestiary, 'slime');
      assert.equal(entry.name, '???');
      assert.equal(entry.encountered, false);
      assert.equal(entry.isBoss, false);
      assert.equal(entry.timesDefeated, 0);
    });

    it('should return full stats for encountered regular enemy', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'slime');
      const entry = getBestiaryEntry(bestiary, 'slime');
      assert.equal(entry.name, 'Slime');
      assert.equal(entry.encountered, true);
      assert.equal(entry.isBoss, false);
      assert.equal(entry.element, 'earth');
      assert.equal(entry.maxHp, 18);
      assert.equal(entry.atk, 5);
      assert.equal(entry.def, 2);
      assert.equal(entry.spd, 4);
      assert.equal(entry.xpReward, 5);
      assert.equal(entry.goldReward, 3);
    });

    it('should show defeat count for defeated enemy', () => {
      let bestiary = createBestiaryState();
      bestiary = recordDefeat(bestiary, 'goblin');
      bestiary = recordDefeat(bestiary, 'goblin');
      const entry = getBestiaryEntry(bestiary, 'goblin');
      assert.equal(entry.timesDefeated, 2);
      assert.equal(entry.encountered, true);
    });

    it('should return hidden entry for unencountered boss', () => {
      const bestiary = createBestiaryState();
      const entry = getBestiaryEntry(bestiary, 'forest-guardian');
      assert.equal(entry.name, '???');
      assert.equal(entry.encountered, false);
      assert.equal(entry.isBoss, true);
    });

    it('should return full stats for encountered boss', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'fire-drake');
      const entry = getBestiaryEntry(bestiary, 'fire-drake');
      assert.equal(entry.name, 'Fire Drake');
      assert.equal(entry.encountered, true);
      assert.equal(entry.isBoss, true);
      assert.equal(entry.element, 'fire');
      assert.equal(entry.maxHp, 200);
      assert.equal(entry.phases, 3);
      assert.equal(entry.xpReward, 300);
      assert.equal(entry.goldReward, 200);
    });
  });

  describe('getAllBestiaryEntries', () => {
    it('should return entries for all enemies and bosses', () => {
      const bestiary = createBestiaryState();
      const entries = getAllBestiaryEntries(bestiary);
      const total = getTotalEnemyCount();
      assert.equal(entries.length, total);
    });

    it('should show all as hidden when no encounters', () => {
      const bestiary = createBestiaryState();
      const entries = getAllBestiaryEntries(bestiary);
      for (const entry of entries) {
        assert.equal(entry.encountered, false);
        assert.equal(entry.name, '???');
      }
    });

    it('should include both regular enemies and bosses', () => {
      let bestiary = createBestiaryState();
      bestiary = recordEncounter(bestiary, 'slime');
      bestiary = recordEncounter(bestiary, 'forest-guardian');
      const entries = getAllBestiaryEntries(bestiary);
      const slimeEntry = entries.find(e => e.id === 'slime');
      const bossEntry = entries.find(e => e.id === 'forest-guardian');
      assert.ok(slimeEntry);
      assert.ok(bossEntry);
      assert.equal(slimeEntry.isBoss, false);
      assert.equal(bossEntry.isBoss, true);
    });
  });

  describe('getCompletionPercent', () => {
    it('should return 0 for empty bestiary', () => {
      assert.equal(getCompletionPercent(createBestiaryState()), 0);
    });

    it('should calculate correct percentage', () => {
      let bestiary = createBestiaryState();
      const total = getTotalEnemyCount();
      bestiary = recordDefeat(bestiary, 'slime');
      const expected = Math.round((1 / total) * 100);
      assert.equal(getCompletionPercent(bestiary), expected);
    });

    it('should return 100 when all enemies defeated', () => {
      let bestiary = createBestiaryState();
      // Defeat all regular enemies
      for (const id of Object.keys(ENEMIES)) {
        bestiary = recordDefeat(bestiary, id);
      }
      for (const id of Object.keys(BOSSES)) {
        bestiary = recordDefeat(bestiary, id);
      }
      assert.equal(getCompletionPercent(bestiary), 100);
    });
  });

  describe('getTotalEnemyCount', () => {
    it('should return positive number', () => {
      assert.ok(getTotalEnemyCount() > 0);
    });

    it('should include both regular enemies and bosses', () => {
      // We know there are at least 9 regular enemies and 3 bosses
      assert.ok(getTotalEnemyCount() >= 12);
    });
  });
});
