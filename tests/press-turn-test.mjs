/**
 * Tests for Press Turn Combat System
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

import {
  ICON_STATE,
  ACTION_RESULT,
  DEFAULT_CONFIG,
  createPressTurnState,
  createIconArray,
  countAvailableActions,
  hasActionsRemaining,
  determineActionResult,
  applyActionResult,
  startNewTurn,
  processAction,
  getPressTurnSummary,
  getResultMessage,
  isBonusResult,
  isPenaltyResult,
  getComboBonus,
} from '../src/press-turn.js';

import {
  renderPressTurnBar,
  renderPressTurnDisplay,
  renderActionResult,
  renderComboIndicator,
  renderTurnStart,
  renderPassButton,
  renderCompactIndicator,
  getPressTurnStyles,
} from '../src/press-turn-ui.js';

// ====================
// Constants Tests
// ====================

describe('Press Turn Constants', () => {
  it('should define icon states', () => {
    assert.strictEqual(ICON_STATE.FULL, 'full');
    assert.strictEqual(ICON_STATE.HALF, 'half');
    assert.strictEqual(ICON_STATE.EMPTY, 'empty');
  });

  it('should define action results', () => {
    assert.strictEqual(ACTION_RESULT.NORMAL, 'normal');
    assert.strictEqual(ACTION_RESULT.WEAKNESS, 'weakness');
    assert.strictEqual(ACTION_RESULT.CRITICAL, 'critical');
    assert.strictEqual(ACTION_RESULT.MISS, 'miss');
    assert.strictEqual(ACTION_RESULT.BLOCKED, 'blocked');
    assert.strictEqual(ACTION_RESULT.ABSORBED, 'absorbed');
    assert.strictEqual(ACTION_RESULT.PASS, 'pass');
  });

  it('should have valid default config', () => {
    assert.strictEqual(DEFAULT_CONFIG.baseIcons, 4);
    assert.strictEqual(DEFAULT_CONFIG.maxIcons, 8);
    assert.strictEqual(DEFAULT_CONFIG.partyBonusIcons, 1);
    assert.strictEqual(DEFAULT_CONFIG.bossExtraIcons, 2);
  });
});

// ====================
// State Creation Tests
// ====================

describe('createPressTurnState', () => {
  it('should create default state with 4 icons', () => {
    const state = createPressTurnState();
    assert.strictEqual(state.playerIcons.length, 4);
    assert.strictEqual(state.enemyIcons.length, 4);
    assert.strictEqual(state.currentTurn, 'player');
    assert.strictEqual(state.turnNumber, 1);
  });

  it('should create all full icons', () => {
    const state = createPressTurnState();
    state.playerIcons.forEach(icon => {
      assert.strictEqual(icon, ICON_STATE.FULL);
    });
  });

  it('should give bosses extra icons', () => {
    const state = createPressTurnState({ isBoss: true });
    assert.strictEqual(state.enemyIcons.length, 6); // 4 + 2 extra
  });

  it('should add icons for party members', () => {
    const state = createPressTurnState({ partySize: 3 });
    assert.strictEqual(state.playerIcons.length, 6); // 4 + 2 for party
  });

  it('should cap icons at maximum', () => {
    const state = createPressTurnState({ partySize: 10 });
    assert.strictEqual(state.playerIcons.length, 8);
  });

  it('should initialize tracking values', () => {
    const state = createPressTurnState();
    assert.strictEqual(state.actionsThisTurn, 0);
    assert.strictEqual(state.consecutiveWeaknesses, 0);
  });
});

describe('createIconArray', () => {
  it('should create array of full icons', () => {
    const icons = createIconArray(4);
    assert.strictEqual(icons.length, 4);
    icons.forEach(icon => assert.strictEqual(icon, ICON_STATE.FULL));
  });

  it('should handle zero count', () => {
    const icons = createIconArray(0);
    assert.strictEqual(icons.length, 0);
  });

  it('should handle negative count', () => {
    const icons = createIconArray(-5);
    assert.strictEqual(icons.length, 0);
  });

  it('should cap at max icons', () => {
    const icons = createIconArray(100);
    assert.strictEqual(icons.length, 8);
  });
});

// ====================
// Icon Counting Tests
// ====================

describe('countAvailableActions', () => {
  it('should count full icons', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.FULL];
    assert.strictEqual(countAvailableActions(icons), 3);
  });

  it('should count half icons', () => {
    const icons = [ICON_STATE.HALF, ICON_STATE.HALF];
    assert.strictEqual(countAvailableActions(icons), 2);
  });

  it('should not count empty icons', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.EMPTY, ICON_STATE.EMPTY];
    assert.strictEqual(countAvailableActions(icons), 1);
  });

  it('should handle mixed icons', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.HALF, ICON_STATE.EMPTY];
    assert.strictEqual(countAvailableActions(icons), 2);
  });

  it('should handle null/undefined', () => {
    assert.strictEqual(countAvailableActions(null), 0);
    assert.strictEqual(countAvailableActions(undefined), 0);
  });

  it('should handle empty array', () => {
    assert.strictEqual(countAvailableActions([]), 0);
  });
});

describe('hasActionsRemaining', () => {
  it('should return true with full icons', () => {
    assert.strictEqual(hasActionsRemaining([ICON_STATE.FULL]), true);
  });

  it('should return true with half icons', () => {
    assert.strictEqual(hasActionsRemaining([ICON_STATE.HALF]), true);
  });

  it('should return false with only empty icons', () => {
    assert.strictEqual(hasActionsRemaining([ICON_STATE.EMPTY, ICON_STATE.EMPTY]), false);
  });

  it('should return false for empty array', () => {
    assert.strictEqual(hasActionsRemaining([]), false);
  });
});

// ====================
// Action Result Determination Tests
// ====================

describe('determineActionResult', () => {
  it('should return NORMAL for basic attack', () => {
    assert.strictEqual(determineActionResult({}), ACTION_RESULT.NORMAL);
  });

  it('should return WEAKNESS when hitting weakness', () => {
    assert.strictEqual(determineActionResult({ hitWeakness: true }), ACTION_RESULT.WEAKNESS);
  });

  it('should return CRITICAL for critical hit', () => {
    assert.strictEqual(determineActionResult({ isCritical: true }), ACTION_RESULT.CRITICAL);
  });

  it('should return MISS for missed attack', () => {
    assert.strictEqual(determineActionResult({ missed: true }), ACTION_RESULT.MISS);
  });

  it('should return BLOCKED for nullified attack', () => {
    assert.strictEqual(determineActionResult({ wasBlocked: true }), ACTION_RESULT.BLOCKED);
  });

  it('should return ABSORBED for absorbed element', () => {
    assert.strictEqual(determineActionResult({ wasAbsorbed: true }), ACTION_RESULT.ABSORBED);
  });

  it('should return PASS for voluntary pass', () => {
    assert.strictEqual(determineActionResult({ isPass: true }), ACTION_RESULT.PASS);
  });

  it('should prioritize absorbed over other results', () => {
    const result = determineActionResult({
      hitWeakness: true,
      wasAbsorbed: true,
    });
    assert.strictEqual(result, ACTION_RESULT.ABSORBED);
  });

  it('should prioritize blocked over miss', () => {
    const result = determineActionResult({
      wasBlocked: true,
      missed: true,
    });
    assert.strictEqual(result, ACTION_RESULT.BLOCKED);
  });
});

// ====================
// Action Result Application Tests
// ====================

describe('applyActionResult', () => {
  it('should consume 1 icon for normal attack', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.FULL];
    const { icons: newIcons, consumed } = applyActionResult(icons, ACTION_RESULT.NORMAL);
    assert.strictEqual(consumed, 1);
    assert.strictEqual(countAvailableActions(newIcons), 3);
  });

  it('should convert full to half for weakness hit', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL];
    const { icons: newIcons, consumed, bonusGenerated } = applyActionResult(icons, ACTION_RESULT.WEAKNESS);
    assert.strictEqual(consumed, 0.5);
    assert.strictEqual(bonusGenerated, true);
    assert.ok(newIcons.includes(ICON_STATE.HALF));
  });

  it('should consume half icon first for weakness', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.HALF];
    const { icons: newIcons, consumed } = applyActionResult(icons, ACTION_RESULT.WEAKNESS);
    assert.strictEqual(consumed, 0.5);
    assert.strictEqual(newIcons.filter(i => i === ICON_STATE.FULL).length, 1);
    assert.strictEqual(newIcons.filter(i => i === ICON_STATE.EMPTY).length, 1);
  });

  it('should consume 2 icons for miss', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.FULL];
    const { icons: newIcons, consumed } = applyActionResult(icons, ACTION_RESULT.MISS);
    assert.strictEqual(consumed, 2);
    assert.strictEqual(countAvailableActions(newIcons), 2);
  });

  it('should consume 2 icons for blocked attack', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.FULL];
    const { icons: newIcons, consumed } = applyActionResult(icons, ACTION_RESULT.BLOCKED);
    assert.strictEqual(consumed, 2);
  });

  it('should consume all icons for absorbed', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.HALF];
    const { icons: newIcons, consumed } = applyActionResult(icons, ACTION_RESULT.ABSORBED);
    assert.strictEqual(consumed, 2.5);
    assert.strictEqual(countAvailableActions(newIcons), 0);
  });

  it('should handle pass efficiently', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL];
    const { consumed } = applyActionResult(icons, ACTION_RESULT.PASS);
    assert.strictEqual(consumed, 0.5);
  });

  it('should handle empty array', () => {
    const { icons: newIcons, consumed } = applyActionResult([], ACTION_RESULT.NORMAL);
    assert.deepStrictEqual(newIcons, []);
    assert.strictEqual(consumed, 0);
  });

  it('should handle null input', () => {
    const { icons: newIcons } = applyActionResult(null, ACTION_RESULT.NORMAL);
    assert.deepStrictEqual(newIcons, []);
  });
});

// ====================
// Turn Management Tests
// ====================

describe('startNewTurn', () => {
  it('should reset player icons for player turn', () => {
    let state = createPressTurnState();
    state = { ...state, playerIcons: [ICON_STATE.EMPTY, ICON_STATE.EMPTY, ICON_STATE.HALF, ICON_STATE.HALF] };
    state = startNewTurn(state, 'player');
    state.playerIcons.forEach(icon => assert.strictEqual(icon, ICON_STATE.FULL));
  });

  it('should reset enemy icons for enemy turn', () => {
    let state = createPressTurnState();
    state = { ...state, enemyIcons: [ICON_STATE.EMPTY, ICON_STATE.EMPTY] };
    state = startNewTurn(state, 'enemy');
    state.enemyIcons.forEach(icon => assert.strictEqual(icon, ICON_STATE.FULL));
  });

  it('should update current turn', () => {
    let state = createPressTurnState();
    state = startNewTurn(state, 'enemy');
    assert.strictEqual(state.currentTurn, 'enemy');
  });

  it('should increment turn number on player turn', () => {
    let state = createPressTurnState();
    state = startNewTurn(state, 'player');
    assert.strictEqual(state.turnNumber, 2);
  });

  it('should reset action tracking', () => {
    let state = createPressTurnState();
    state = { ...state, actionsThisTurn: 5, consecutiveWeaknesses: 3 };
    state = startNewTurn(state, 'player');
    assert.strictEqual(state.actionsThisTurn, 0);
    assert.strictEqual(state.consecutiveWeaknesses, 0);
  });

  it('should handle null state', () => {
    const state = startNewTurn(null);
    assert.ok(state);
    assert.strictEqual(state.currentTurn, 'player');
  });
});

describe('processAction', () => {
  it('should process normal action', () => {
    const state = createPressTurnState();
    const { state: newState, result } = processAction(state, {});
    assert.strictEqual(result, ACTION_RESULT.NORMAL);
    assert.strictEqual(countAvailableActions(newState.playerIcons), 3);
  });

  it('should track consecutive weaknesses', () => {
    let state = createPressTurnState();
    let processed = processAction(state, { hitWeakness: true });
    assert.strictEqual(processed.state.consecutiveWeaknesses, 1);

    processed = processAction(processed.state, { hitWeakness: true });
    assert.strictEqual(processed.state.consecutiveWeaknesses, 2);
  });

  it('should reset consecutive on non-weakness', () => {
    let state = createPressTurnState();
    state = { ...state, consecutiveWeaknesses: 3 };
    const { state: newState } = processAction(state, {});
    assert.strictEqual(newState.consecutiveWeaknesses, 0);
  });

  it('should indicate when turn ends', () => {
    const state = {
      ...createPressTurnState(),
      playerIcons: [ICON_STATE.FULL],
    };
    const { turnEnded } = processAction(state, {});
    assert.strictEqual(turnEnded, true);
  });

  it('should increment actions counter', () => {
    const state = createPressTurnState();
    const { state: newState } = processAction(state, {});
    assert.strictEqual(newState.actionsThisTurn, 1);
  });
});

// ====================
// Summary and Messages Tests
// ====================

describe('getPressTurnSummary', () => {
  it('should return correct summary', () => {
    const state = createPressTurnState();
    const summary = getPressTurnSummary(state);
    assert.strictEqual(summary.currentTurn, 'player');
    assert.strictEqual(summary.playerActions, 4);
    assert.strictEqual(summary.enemyActions, 4);
    assert.strictEqual(summary.turnNumber, 1);
  });

  it('should handle null state', () => {
    const summary = getPressTurnSummary(null);
    assert.strictEqual(summary.playerActions, 0);
    assert.strictEqual(summary.enemyActions, 0);
  });
});

describe('getResultMessage', () => {
  it('should return weakness message', () => {
    const msg = getResultMessage(ACTION_RESULT.WEAKNESS);
    assert.ok(msg.includes('Weakness'));
    assert.ok(msg.includes('Bonus'));
  });

  it('should return critical message', () => {
    const msg = getResultMessage(ACTION_RESULT.CRITICAL);
    assert.ok(msg.includes('Critical'));
  });

  it('should return miss message', () => {
    const msg = getResultMessage(ACTION_RESULT.MISS);
    assert.ok(msg.includes('missed'));
  });

  it('should return absorbed message', () => {
    const msg = getResultMessage(ACTION_RESULT.ABSORBED);
    assert.ok(msg.includes('absorbed'));
  });

  it('should return empty for normal', () => {
    assert.strictEqual(getResultMessage(ACTION_RESULT.NORMAL), '');
  });
});

describe('isBonusResult and isPenaltyResult', () => {
  it('should identify bonus results', () => {
    assert.strictEqual(isBonusResult(ACTION_RESULT.WEAKNESS), true);
    assert.strictEqual(isBonusResult(ACTION_RESULT.CRITICAL), true);
    assert.strictEqual(isBonusResult(ACTION_RESULT.NORMAL), false);
  });

  it('should identify penalty results', () => {
    assert.strictEqual(isPenaltyResult(ACTION_RESULT.MISS), true);
    assert.strictEqual(isPenaltyResult(ACTION_RESULT.BLOCKED), true);
    assert.strictEqual(isPenaltyResult(ACTION_RESULT.ABSORBED), true);
    assert.strictEqual(isPenaltyResult(ACTION_RESULT.NORMAL), false);
  });
});

describe('getComboBonus', () => {
  it('should return 0 for less than 2 hits', () => {
    assert.strictEqual(getComboBonus(0), 0);
    assert.strictEqual(getComboBonus(1), 0);
  });

  it('should return 5% for 2 consecutive', () => {
    assert.strictEqual(getComboBonus(2), 0.05);
  });

  it('should scale with consecutive hits', () => {
    // Use tolerance for floating point comparison
    const bonus3 = getComboBonus(3);
    const bonus4 = getComboBonus(4);
    assert.ok(Math.abs(bonus3 - 0.10) < 0.001, `Expected ~0.10, got ${bonus3}`);
    assert.ok(Math.abs(bonus4 - 0.15) < 0.001, `Expected ~0.15, got ${bonus4}`);
  });

  it('should cap at 50%', () => {
    assert.strictEqual(getComboBonus(20), 0.5);
  });

  it('should handle invalid input', () => {
    assert.strictEqual(getComboBonus(null), 0);
    assert.strictEqual(getComboBonus('invalid'), 0);
  });
});

// ====================
// UI Rendering Tests
// ====================

describe('renderPressTurnBar', () => {
  it('should render player icons bar', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.HALF, ICON_STATE.EMPTY];
    const html = renderPressTurnBar(icons, 'player');
    assert.ok(html.includes('press-turn-bar'));
    assert.ok(html.includes('player-icons'));
    assert.ok(html.includes('Actions'));
  });

  it('should render enemy icons bar', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL];
    const html = renderPressTurnBar(icons, 'enemy');
    assert.ok(html.includes('enemy-icons'));
    assert.ok(html.includes('Enemy'));
  });

  it('should return empty for null icons', () => {
    assert.strictEqual(renderPressTurnBar(null), '');
    assert.strictEqual(renderPressTurnBar([]), '');
  });

  it('should include icon count', () => {
    const icons = [ICON_STATE.FULL, ICON_STATE.FULL, ICON_STATE.EMPTY];
    const html = renderPressTurnBar(icons, 'player');
    assert.ok(html.includes('press-turn-count'));
  });
});

describe('renderPressTurnDisplay', () => {
  it('should render full display', () => {
    const state = createPressTurnState();
    const html = renderPressTurnDisplay(state);
    assert.ok(html.includes('press-turn-display'));
    assert.ok(html.includes('player-icons'));
    assert.ok(html.includes('enemy-icons'));
  });

  it('should show player active class', () => {
    const state = createPressTurnState();
    const html = renderPressTurnDisplay(state);
    assert.ok(html.includes('player-active'));
  });

  it('should show enemy active class', () => {
    const state = { ...createPressTurnState(), currentTurn: 'enemy' };
    const html = renderPressTurnDisplay(state);
    assert.ok(html.includes('enemy-active'));
  });

  it('should return empty for null state', () => {
    assert.strictEqual(renderPressTurnDisplay(null), '');
  });
});

describe('renderActionResult', () => {
  it('should render bonus result', () => {
    const html = renderActionResult(ACTION_RESULT.WEAKNESS);
    assert.ok(html.includes('result-bonus'));
    assert.ok(html.includes('Weakness'));
  });

  it('should render penalty result', () => {
    const html = renderActionResult(ACTION_RESULT.MISS);
    assert.ok(html.includes('result-penalty'));
    assert.ok(html.includes('missed'));
  });

  it('should return empty for normal result', () => {
    assert.strictEqual(renderActionResult(ACTION_RESULT.NORMAL), '');
  });
});

describe('renderComboIndicator', () => {
  it('should render combo for 2+ hits', () => {
    const html = renderComboIndicator(3);
    assert.ok(html.includes('3x COMBO'));
    assert.ok(html.includes('+10%'));
  });

  it('should return empty for less than 2', () => {
    assert.strictEqual(renderComboIndicator(1), '');
    assert.strictEqual(renderComboIndicator(0), '');
  });
});

describe('renderTurnStart', () => {
  it('should render player turn', () => {
    const html = renderTurnStart('player', 4);
    assert.ok(html.includes('Your Turn'));
    assert.ok(html.includes('player-turn'));
    assert.ok(html.includes('4 actions'));
  });

  it('should render enemy turn', () => {
    const html = renderTurnStart('enemy', 3);
    assert.ok(html.includes('Enemy Turn'));
    assert.ok(html.includes('enemy-turn'));
  });

  it('should use singular for 1 action', () => {
    const html = renderTurnStart('player', 1);
    assert.ok(html.includes('1 action'));
    assert.ok(!html.includes('1 actions'));
  });
});

describe('renderPassButton', () => {
  it('should render enabled button', () => {
    const html = renderPassButton(true);
    assert.ok(html.includes('press-turn-pass'));
    assert.ok(html.includes('Pass'));
    assert.ok(!html.includes('disabled'));
  });

  it('should render disabled button', () => {
    const html = renderPassButton(false);
    assert.ok(html.includes('disabled'));
  });
});

describe('renderCompactIndicator', () => {
  it('should render compact display', () => {
    const state = createPressTurnState();
    const html = renderCompactIndicator(state);
    assert.ok(html.includes('press-turn-compact'));
    assert.ok(html.includes('PT:'));
  });

  it('should show active class when player turn', () => {
    const state = createPressTurnState();
    const html = renderCompactIndicator(state);
    assert.ok(html.includes('active'));
  });

  it('should return empty for null state', () => {
    assert.strictEqual(renderCompactIndicator(null), '');
  });
});

describe('getPressTurnStyles', () => {
  it('should return CSS string', () => {
    const css = getPressTurnStyles();
    assert.ok(typeof css === 'string');
    assert.ok(css.length > 0);
  });

  it('should include key classes', () => {
    const css = getPressTurnStyles();
    assert.ok(css.includes('.press-turn-display'));
    assert.ok(css.includes('.press-turn-icon'));
    assert.ok(css.includes('.press-turn-result'));
  });

  it('should include animations', () => {
    const css = getPressTurnStyles();
    assert.ok(css.includes('@keyframes'));
    assert.ok(css.includes('pulse-half'));
  });
});

// ====================
// Security Tests
// ====================

describe('Security - No banned words', () => {
  const bannedWords = ['egg', 'easter', 'yolk', 'bunny', 'rabbit', 'phoenix'];

  it('should not contain banned words in core module', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync(new URL('../src/press-turn.js', import.meta.url), 'utf-8').toLowerCase();
    bannedWords.forEach(word => {
      assert.ok(!content.includes(word), `Found banned word: ${word}`);
    });
  });

  it('should not contain banned words in UI module', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync(new URL('../src/press-turn-ui.js', import.meta.url), 'utf-8').toLowerCase();
    bannedWords.forEach(word => {
      assert.ok(!content.includes(word), `Found banned word: ${word}`);
    });
  });
});

// ====================
// Edge Cases
// ====================

describe('Edge Cases', () => {
  it('should handle multiple consecutive absorbed attacks', () => {
    let state = createPressTurnState();
    const { state: newState, turnEnded } = processAction(state, { wasAbsorbed: true });
    assert.strictEqual(turnEnded, true);
    assert.strictEqual(countAvailableActions(newState.playerIcons), 0);
  });

  it('should handle weakness on last action', () => {
    const state = {
      ...createPressTurnState(),
      playerIcons: [ICON_STATE.FULL],
    };
    const { state: newState, bonusGenerated } = processAction(state, { hitWeakness: true });
    assert.strictEqual(bonusGenerated, true);
    // Should convert to half, giving one more action
    assert.strictEqual(countAvailableActions(newState.playerIcons), 1);
  });

  it('should handle miss with only half icons', () => {
    const state = {
      ...createPressTurnState(),
      playerIcons: [ICON_STATE.HALF, ICON_STATE.HALF],
    };
    const { consumed } = processAction(state, { missed: true });
    assert.strictEqual(consumed, 1); // 2 half icons = 1 full
  });
});
