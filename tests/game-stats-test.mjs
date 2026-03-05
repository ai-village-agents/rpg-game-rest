import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGameStats,
  recordEnemyDefeated,
  recordDamageDealt,
  recordDamageReceived,
  recordItemUsed,
  recordAbilityUsed,
  recordGoldEarned,
  recordXPEarned,
  recordBattleWon,
  recordBattleFled,
  recordTurnPlayed,
  getStatsSummary,
} from '../src/game-stats.js';

describe('createGameStats', () => {
  it('returns initial stats with all zeroes', () => {
    const stats = createGameStats();
    assert.equal(stats.enemiesDefeated, 0);
    assert.deepEqual(stats.enemyKills, {});
    assert.equal(stats.totalDamageDealt, 0);
    assert.equal(stats.totalDamageReceived, 0);
    assert.equal(stats.itemsUsed, 0);
    assert.equal(stats.abilitiesUsed, 0);
    assert.equal(stats.goldEarned, 0);
    assert.equal(stats.xpEarned, 0);
    assert.equal(stats.battlesWon, 0);
    assert.equal(stats.battlesFled, 0);
    assert.equal(stats.turnsPlayed, 0);
  });

  it('returns a new object each time', () => {
    const a = createGameStats();
    const b = createGameStats();
    assert.notEqual(a, b);
  });
});

describe('recordEnemyDefeated', () => {
  it('increments enemiesDefeated and tracks enemy name', () => {
    let stats = createGameStats();
    stats = recordEnemyDefeated(stats, 'Slime');
    assert.equal(stats.enemiesDefeated, 1);
    assert.equal(stats.enemyKills['Slime'], 1);
  });

  it('accumulates multiple kills of same enemy', () => {
    let stats = createGameStats();
    stats = recordEnemyDefeated(stats, 'Slime');
    stats = recordEnemyDefeated(stats, 'Slime');
    stats = recordEnemyDefeated(stats, 'Slime');
    assert.equal(stats.enemiesDefeated, 3);
    assert.equal(stats.enemyKills['Slime'], 3);
  });

  it('tracks different enemy types separately', () => {
    let stats = createGameStats();
    stats = recordEnemyDefeated(stats, 'Slime');
    stats = recordEnemyDefeated(stats, 'Goblin');
    stats = recordEnemyDefeated(stats, 'Slime');
    assert.equal(stats.enemiesDefeated, 3);
    assert.equal(stats.enemyKills['Slime'], 2);
    assert.equal(stats.enemyKills['Goblin'], 1);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordEnemyDefeated(original, 'Slime');
    assert.equal(original.enemiesDefeated, 0);
    assert.deepEqual(original.enemyKills, {});
    assert.notEqual(original, updated);
  });
});

describe('recordDamageDealt', () => {
  it('adds damage amount to total', () => {
    let stats = createGameStats();
    stats = recordDamageDealt(stats, 15);
    assert.equal(stats.totalDamageDealt, 15);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    stats = recordDamageDealt(stats, 10);
    stats = recordDamageDealt(stats, 25);
    stats = recordDamageDealt(stats, 5);
    assert.equal(stats.totalDamageDealt, 40);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordDamageDealt(original, 10);
    assert.equal(original.totalDamageDealt, 0);
    assert.notEqual(original, updated);
  });
});

describe('recordDamageReceived', () => {
  it('adds damage amount to total received', () => {
    let stats = createGameStats();
    stats = recordDamageReceived(stats, 8);
    assert.equal(stats.totalDamageReceived, 8);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    stats = recordDamageReceived(stats, 5);
    stats = recordDamageReceived(stats, 12);
    assert.equal(stats.totalDamageReceived, 17);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordDamageReceived(original, 10);
    assert.equal(original.totalDamageReceived, 0);
  });
});

describe('recordItemUsed', () => {
  it('increments items used count', () => {
    let stats = createGameStats();
    stats = recordItemUsed(stats, 'Health Potion');
    assert.equal(stats.itemsUsed, 1);
  });

  it('increments for each use', () => {
    let stats = createGameStats();
    stats = recordItemUsed(stats, 'Health Potion');
    stats = recordItemUsed(stats, 'Mana Potion');
    stats = recordItemUsed(stats, 'Health Potion');
    assert.equal(stats.itemsUsed, 3);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordItemUsed(original, 'Potion');
    assert.equal(original.itemsUsed, 0);
  });
});

describe('recordAbilityUsed', () => {
  it('increments abilities used count', () => {
    let stats = createGameStats();
    stats = recordAbilityUsed(stats, 'fireball');
    assert.equal(stats.abilitiesUsed, 1);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    stats = recordAbilityUsed(stats, 'fireball');
    stats = recordAbilityUsed(stats, 'heal');
    stats = recordAbilityUsed(stats, 'backstab');
    assert.equal(stats.abilitiesUsed, 3);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordAbilityUsed(original, 'fireball');
    assert.equal(original.abilitiesUsed, 0);
  });
});

describe('recordGoldEarned', () => {
  it('adds gold amount to total', () => {
    let stats = createGameStats();
    stats = recordGoldEarned(stats, 50);
    assert.equal(stats.goldEarned, 50);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    stats = recordGoldEarned(stats, 10);
    stats = recordGoldEarned(stats, 30);
    assert.equal(stats.goldEarned, 40);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordGoldEarned(original, 100);
    assert.equal(original.goldEarned, 0);
  });
});

describe('recordXPEarned', () => {
  it('adds XP amount to total', () => {
    let stats = createGameStats();
    stats = recordXPEarned(stats, 25);
    assert.equal(stats.xpEarned, 25);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    stats = recordXPEarned(stats, 10);
    stats = recordXPEarned(stats, 15);
    stats = recordXPEarned(stats, 20);
    assert.equal(stats.xpEarned, 45);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordXPEarned(original, 50);
    assert.equal(original.xpEarned, 0);
  });
});

describe('recordBattleWon', () => {
  it('increments battles won', () => {
    let stats = createGameStats();
    stats = recordBattleWon(stats);
    assert.equal(stats.battlesWon, 1);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    stats = recordBattleWon(stats);
    stats = recordBattleWon(stats);
    stats = recordBattleWon(stats);
    assert.equal(stats.battlesWon, 3);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordBattleWon(original);
    assert.equal(original.battlesWon, 0);
  });
});

describe('recordBattleFled', () => {
  it('increments battles fled', () => {
    let stats = createGameStats();
    stats = recordBattleFled(stats);
    assert.equal(stats.battlesFled, 1);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    stats = recordBattleFled(stats);
    stats = recordBattleFled(stats);
    assert.equal(stats.battlesFled, 2);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordBattleFled(original);
    assert.equal(original.battlesFled, 0);
  });
});

describe('recordTurnPlayed', () => {
  it('increments turns played', () => {
    let stats = createGameStats();
    stats = recordTurnPlayed(stats);
    assert.equal(stats.turnsPlayed, 1);
  });

  it('accumulates across multiple calls', () => {
    let stats = createGameStats();
    for (let i = 0; i < 10; i++) stats = recordTurnPlayed(stats);
    assert.equal(stats.turnsPlayed, 10);
  });

  it('does not mutate the input stats', () => {
    const original = createGameStats();
    const updated = recordTurnPlayed(original);
    assert.equal(original.turnsPlayed, 0);
  });
});

describe('getStatsSummary', () => {
  it('returns formatted summary from empty stats', () => {
    const stats = createGameStats();
    const summary = getStatsSummary(stats);
    assert.equal(summary.enemiesDefeated, 0);
    assert.equal(summary.mostDefeated, 'None');
    assert.equal(summary.totalDamageDealt, 0);
    assert.equal(summary.totalDamageReceived, 0);
    assert.equal(summary.damageRatio, '0.0');
    assert.equal(summary.itemsUsed, 0);
    assert.equal(summary.abilitiesUsed, 0);
    assert.equal(summary.goldEarned, 0);
    assert.equal(summary.xpEarned, 0);
    assert.equal(summary.battlesWon, 0);
    assert.equal(summary.battlesFled, 0);
    assert.equal(summary.turnsPlayed, 0);
  });

  it('shows most defeated enemy', () => {
    let stats = createGameStats();
    stats = recordEnemyDefeated(stats, 'Slime');
    stats = recordEnemyDefeated(stats, 'Slime');
    stats = recordEnemyDefeated(stats, 'Goblin');
    const summary = getStatsSummary(stats);
    assert.equal(summary.mostDefeated, 'Slime (2)');
  });

  it('computes damage ratio correctly', () => {
    let stats = createGameStats();
    stats = recordDamageDealt(stats, 100);
    stats = recordDamageReceived(stats, 50);
    const summary = getStatsSummary(stats);
    assert.equal(summary.damageRatio, '2.0');
  });

  it('shows infinity when no damage received but damage dealt', () => {
    let stats = createGameStats();
    stats = recordDamageDealt(stats, 100);
    const summary = getStatsSummary(stats);
    assert.equal(summary.damageRatio, '∞');
  });

  it('aggregates all stats into summary', () => {
    let stats = createGameStats();
    stats = recordEnemyDefeated(stats, 'Dragon');
    stats = recordDamageDealt(stats, 500);
    stats = recordDamageReceived(stats, 200);
    stats = recordItemUsed(stats, 'Potion');
    stats = recordAbilityUsed(stats, 'fireball');
    stats = recordGoldEarned(stats, 100);
    stats = recordXPEarned(stats, 50);
    stats = recordBattleWon(stats);
    stats = recordTurnPlayed(stats);
    const summary = getStatsSummary(stats);
    assert.equal(summary.enemiesDefeated, 1);
    assert.equal(summary.mostDefeated, 'Dragon (1)');
    assert.equal(summary.totalDamageDealt, 500);
    assert.equal(summary.totalDamageReceived, 200);
    assert.equal(summary.damageRatio, '2.5');
    assert.equal(summary.itemsUsed, 1);
    assert.equal(summary.abilitiesUsed, 1);
    assert.equal(summary.goldEarned, 100);
    assert.equal(summary.xpEarned, 50);
    assert.equal(summary.battlesWon, 1);
    assert.equal(summary.turnsPlayed, 1);
  });
});

describe('immutability chain', () => {
  it('chaining all record functions preserves previous stats', () => {
    const s0 = createGameStats();
    const s1 = recordEnemyDefeated(s0, 'Slime');
    const s2 = recordDamageDealt(s1, 10);
    const s3 = recordDamageReceived(s2, 5);
    const s4 = recordItemUsed(s3, 'Potion');
    const s5 = recordAbilityUsed(s4, 'heal');
    const s6 = recordGoldEarned(s5, 20);
    const s7 = recordXPEarned(s6, 15);
    const s8 = recordBattleWon(s7);
    const s9 = recordBattleFled(s8);
    const s10 = recordTurnPlayed(s9);

    // Original unchanged
    assert.equal(s0.enemiesDefeated, 0);
    assert.equal(s0.totalDamageDealt, 0);

    // Final has everything
    assert.equal(s10.enemiesDefeated, 1);
    assert.equal(s10.totalDamageDealt, 10);
    assert.equal(s10.totalDamageReceived, 5);
    assert.equal(s10.itemsUsed, 1);
    assert.equal(s10.abilitiesUsed, 1);
    assert.equal(s10.goldEarned, 20);
    assert.equal(s10.xpEarned, 15);
    assert.equal(s10.battlesWon, 1);
    assert.equal(s10.battlesFled, 1);
    assert.equal(s10.turnsPlayed, 1);
  });
});
