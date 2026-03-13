/**
 * Tests for combat-rewards-animator.js
 * Covers: calculateBattleRating, computeXpBarPercent, formatGoldAmount,
 *         createRewardsState, renderRewardsHtml, getRewardsStyles
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBattleRating,
  computeXpBarPercent,
  formatGoldAmount,
  createRewardsState,
  renderRewardsHtml,
  getRewardsStyles,
} from '../src/combat-rewards-animator.js';

// ── calculateBattleRating ──────────────────────────────────────────

describe('calculateBattleRating', () => {
  it('returns S grade for flawless fight (no damage taken)', () => {
    const result = calculateBattleRating(3, 100, 0, 100, 100);
    assert.equal(result.grade, 'S');
    assert.equal(result.title, 'Flawless Victory');
    assert.ok(result.score >= 90);
  });

  it('returns A grade for good performance', () => {
    const result = calculateBattleRating(5, 100, 30, 100, 100);
    assert.equal(result.grade, 'A');
    assert.equal(result.title, 'Impressive Win');
    assert.ok(result.score >= 70 && result.score < 90);
  });

  it('returns B grade for solid performance', () => {
    const result = calculateBattleRating(10, 100, 60, 100, 100);
    assert.equal(result.grade, 'B');
    assert.equal(result.title, 'Solid Performance');
    assert.ok(result.score >= 50 && result.score < 70);
  });

  it('returns C grade for narrow victory', () => {
    const result = calculateBattleRating(20, 100, 90, 100, 100);
    assert.equal(result.grade, 'C');
    assert.equal(result.title, 'Narrow Victory');
    assert.ok(result.score >= 30 && result.score < 50);
  });

  it('returns D grade for pyrrhic victory', () => {
    const result = calculateBattleRating(99, 100, 99, 100, 50);
    assert.equal(result.grade, 'D');
    assert.equal(result.title, 'Pyrrhic Victory');
    assert.ok(result.score < 30);
  });

  it('score is clamped between 0 and 100', () => {
    const perfect = calculateBattleRating(1, 9999, 0, 100, 100);
    assert.ok(perfect.score <= 100);
    assert.ok(perfect.score >= 0);

    const terrible = calculateBattleRating(999, 1, 999, 1, 1);
    assert.ok(terrible.score <= 100);
    assert.ok(terrible.score >= 0);
  });

  it('handles zero/negative inputs gracefully', () => {
    const result = calculateBattleRating(0, 0, 0, 0, 0);
    assert.ok(['S', 'A', 'B', 'C', 'D'].includes(result.grade));
    assert.equal(typeof result.score, 'number');
    assert.ok(Number.isFinite(result.score));
  });

  it('returns object with grade, title, and score properties', () => {
    const result = calculateBattleRating(5, 50, 20, 100, 50);
    assert.ok('grade' in result);
    assert.ok('title' in result);
    assert.ok('score' in result);
  });

  it('higher damage ratio yields better efficiency score', () => {
    const goodRatio = calculateBattleRating(5, 200, 20, 100, 100);
    const badRatio = calculateBattleRating(5, 20, 200, 100, 100);
    assert.ok(goodRatio.score > badRatio.score);
  });
});

// ── computeXpBarPercent ────────────────────────────────────────────

describe('computeXpBarPercent', () => {
  it('returns 50 for half XP', () => {
    assert.equal(computeXpBarPercent(50, 100), 50);
  });

  it('returns 0 for zero XP', () => {
    assert.equal(computeXpBarPercent(0, 100), 0);
  });

  it('returns 100 for full XP', () => {
    assert.equal(computeXpBarPercent(100, 100), 100);
  });

  it('clamps to 100 if XP exceeds level requirement', () => {
    assert.equal(computeXpBarPercent(200, 100), 100);
  });

  it('handles zero xpForLevel without dividing by zero', () => {
    const result = computeXpBarPercent(50, 0);
    assert.ok(Number.isFinite(result));
    assert.ok(result >= 0 && result <= 100);
  });

  it('handles negative inputs gracefully', () => {
    const result = computeXpBarPercent(-10, 100);
    assert.ok(Number.isFinite(result));
    assert.ok(result >= 0);
  });

  it('handles non-numeric inputs', () => {
    const result = computeXpBarPercent('abc', 100);
    assert.ok(Number.isFinite(result));
  });
});

// ── formatGoldAmount ───────────────────────────────────────────────

describe('formatGoldAmount', () => {
  it('formats 0', () => {
    assert.equal(formatGoldAmount(0), '0');
  });

  it('formats small number without commas', () => {
    assert.equal(formatGoldAmount(999), '999');
  });

  it('formats 1000 with comma', () => {
    assert.equal(formatGoldAmount(1000), '1,000');
  });

  it('formats 1234 with comma', () => {
    assert.equal(formatGoldAmount(1234), '1,234');
  });

  it('formats millions with multiple commas', () => {
    assert.equal(formatGoldAmount(1000000), '1,000,000');
  });

  it('rounds floating point values', () => {
    assert.equal(formatGoldAmount(1234.56), '1,235');
  });

  it('handles NaN gracefully', () => {
    assert.equal(formatGoldAmount(NaN), '0');
  });

  it('handles negative values', () => {
    const result = formatGoldAmount(-500);
    assert.equal(typeof result, 'string');
  });
});

// ── createRewardsState ─────────────────────────────────────────────

describe('createRewardsState', () => {
  const baseState = {
    player: { xp: 50, maxHp: 100, level: 3, xpForLevel: 100 },
    enemy: { name: 'Goblin', maxHp: 30 },
    xpGained: 25,
    goldGained: 15,
    turnsUsed: 4,
    damageDealt: 35,
    damageReceived: 10,
  };

  it('returns all expected properties', () => {
    const result = createRewardsState(baseState);
    const expected = [
      'xpBefore', 'xpAfter', 'xpForLevel', 'goldGained', 'lootItems',
      'battleRating', 'turnsUsed', 'damageDealt', 'damageReceived',
      'enemyName', 'leveledUp', 'newLevel',
    ];
    for (const key of expected) {
      assert.ok(key in result, `Missing property: ${key}`);
    }
  });

  it('extracts xpGained correctly', () => {
    const result = createRewardsState(baseState);
    assert.equal(result.goldGained, 15);
  });

  it('extracts enemy name', () => {
    const result = createRewardsState(baseState);
    assert.equal(result.enemyName, 'Goblin');
  });

  it('calculates battle rating', () => {
    const result = createRewardsState(baseState);
    assert.ok('grade' in result.battleRating);
    assert.ok('title' in result.battleRating);
    assert.ok('score' in result.battleRating);
  });

  it('handles null/undefined state gracefully', () => {
    const result = createRewardsState(null);
    assert.equal(typeof result.goldGained, 'number');
    assert.equal(typeof result.enemyName, 'string');
  });

  it('handles empty object state', () => {
    const result = createRewardsState({});
    assert.equal(result.goldGained, 0);
    assert.equal(result.enemyName, 'Enemy');
    assert.equal(result.lootItems.length, 0);
  });

  it('lootItems defaults to empty array', () => {
    const result = createRewardsState(baseState);
    assert.ok(Array.isArray(result.lootItems));
  });

  it('detects level up when xpAfter exceeds xpForLevel', () => {
    const lvlUpState = { ...baseState, player: { ...baseState.player, xp: 90, xpForLevel: 100 } };
    const result = createRewardsState(lvlUpState);
    assert.equal(result.leveledUp, true);
  });
});

// ── renderRewardsHtml ──────────────────────────────────────────────

describe('renderRewardsHtml', () => {
  const rewardsState = {
    xpBefore: 50,
    xpAfter: 75,
    xpForLevel: 100,
    goldGained: 120,
    lootItems: [{ name: 'Iron Sword', quantity: 1 }],
    battleRating: { grade: 'A', title: 'Impressive Win', score: 82 },
    turnsUsed: 5,
    damageDealt: 80,
    damageReceived: 25,
    enemyName: 'Goblin',
    leveledUp: false,
    newLevel: 3,
  };

  it('returns a non-empty HTML string', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.length > 0);
    assert.equal(typeof html, 'string');
  });

  it('contains rewards-panel class', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('rewards-panel'));
  });

  it('contains enemy name', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('Goblin'));
  });

  it('contains battle rating grade', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('grade-A'));
  });

  it('contains XP section', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('rewards-xp'));
  });

  it('contains gold section', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('rewards-gold'));
  });

  it('contains loot section', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('rewards-loot'));
  });

  it('shows loot item name', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('Iron Sword'));
  });

  it('escapes HTML in enemy name', () => {
    const xssState = { ...rewardsState, enemyName: '<script>alert("xss")</script>' };
    const html = renderRewardsHtml(xssState, 'complete');
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  it('rating phase shows only rating section as visible', () => {
    const html = renderRewardsHtml(rewardsState, 'rating');
    assert.ok(html.includes('rewards-rating'));
    // XP section should not have is-visible
    const xpMatch = html.match(/rewards-section rewards-xp\s+/);
    assert.ok(!html.includes('rewards-xp is-visible'));
  });

  it('complete phase shows all sections as visible', () => {
    const html = renderRewardsHtml(rewardsState, 'complete');
    assert.ok(html.includes('is-visible'));
  });

  it('handles empty loot items', () => {
    const noLoot = { ...rewardsState, lootItems: [] };
    const html = renderRewardsHtml(noLoot, 'complete');
    assert.ok(html.includes('None'));
  });

  it('shows level up indicator when leveledUp is true', () => {
    const lvlUp = { ...rewardsState, leveledUp: true, newLevel: 4 };
    const html = renderRewardsHtml(lvlUp, 'complete');
    assert.ok(html.includes('Level Up'));
    assert.ok(html.includes('4'));
  });

  it('handles null rewardsState', () => {
    const html = renderRewardsHtml(null, 'complete');
    assert.ok(html.includes('rewards-panel'));
  });

  it('handles unknown animation phase', () => {
    const html = renderRewardsHtml(rewardsState, 'unknown');
    assert.equal(typeof html, 'string');
  });
});

// ── getRewardsStyles ───────────────────────────────────────────────

describe('getRewardsStyles', () => {
  it('returns a non-empty CSS string', () => {
    const css = getRewardsStyles();
    assert.ok(css.length > 0);
    assert.equal(typeof css, 'string');
  });

  it('contains rewards-panel selector', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('.rewards-panel'));
  });

  it('contains fade-in keyframes', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('@keyframes rewards-fade-in'));
  });

  it('contains slide-up keyframes', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('@keyframes rewards-slide-up'));
  });

  it('contains XP fill keyframes', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('@keyframes rewards-xp-fill'));
  });

  it('contains gold pulse keyframes', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('@keyframes rewards-gold-pulse'));
  });

  it('contains grade stamp keyframes', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('@keyframes rewards-grade-stamp'));
  });

  it('contains grade color classes', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('.grade-S'));
    assert.ok(css.includes('.grade-A'));
    assert.ok(css.includes('.grade-B'));
    assert.ok(css.includes('.grade-C'));
    assert.ok(css.includes('.grade-D'));
  });

  it('uses gold color variable', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('--rewards-gold'));
  });

  it('uses XP blue color variable', () => {
    const css = getRewardsStyles();
    assert.ok(css.includes('--rewards-xp'));
  });
});
