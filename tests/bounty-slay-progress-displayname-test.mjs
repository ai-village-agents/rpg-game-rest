import assert from 'node:assert/strict';
import { test } from 'node:test';

import { handleCombatAction } from '../src/handlers/combat-handler.js';
import { createBountyBoardState } from '../src/bounty-board.js';
import { createEmptyStatistics } from '../src/statistics-dashboard.js';

function createActiveSlayBounty({ target = 'Slime', targetAmount = 1 } = {}) {
  return {
    id: 'bounty_test_0',
    type: 'SLAY',
    description: `Defeat ${targetAmount} ${target}`,
    target,
    targetAmount,
    currentAmount: 0,
    reward: 10,
    status: 'ACTIVE',
  };
}

test('SLAY bounty progress increments on victory even when enemy has decorated displayName', () => {
  const bountyBoard = createBountyBoardState();
  bountyBoard.bounties = [createActiveSlayBounty({ target: 'Slime', targetAmount: 1 })];

  const state = {
    phase: 'player-turn',
    turn: 1,
    rngSeed: 123,
    log: ['Your turn.'],
    statistics: createEmptyStatistics(),
    player: {
      name: 'Tester',
      hp: 10,
      maxHp: 10,
      atk: 99,
      def: 0,
      gold: 0,
      xp: 0,
      defending: false,
      inventory: {},
    },
    enemy: {
      name: 'Slime',
      displayName: 'Ancient Slime of Doom',
      hp: 1,
      maxHp: 1,
      atk: 0,
      def: 0,
      defending: false,
      weaknesses: [],
      isBroken: false,
    },
    bountyBoard,
  };

  const next = handleCombatAction(state, { type: 'PLAYER_ATTACK' });
  assert.ok(next, 'expected handled action to return next state');
  assert.equal(next.phase, 'victory');

  const b = next.bountyBoard.bounties[0];
  assert.equal(b.currentAmount, 1);
  assert.equal(b.status, 'COMPLETED');
  assert.equal(next.bountyBoard.completed, 1);
  assert.equal(next.player.gold, 10);
});
