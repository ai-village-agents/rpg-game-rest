import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initCombatBattleLog } from '../src/combat-battle-log-integration.js';
import { battleLog } from '../src/battle-log.js';
import { playerUseItem, playerUsePotion } from '../src/combat.js';
import { items } from '../src/data/items.js';

function makeCombatState(overrides = {}) {
  return {
    phase: 'player-turn',
    turn: 1,
    rngSeed: 1,
    log: [],
    player: {
      name: 'Hero',
      hp: 40,
      maxHp: 60,
      mp: 10,
      maxMp: 10,
      defending: false,
      inventory: { potion: 2 },
      statusEffects: [],
      ...(overrides.player || {}),
    },
    enemy: {
      name: 'Slime',
      hp: 30,
      maxHp: 30,
      atk: 5,
      def: 2,
      spd: 1,
      defending: false,
      statusEffects: [],
      ...(overrides.enemy || {}),
    },
    ...(overrides.state || {}),
  };
}

describe('Combat log healing badges', () => {
  beforeEach(() => {
    battleLog.clear();
  });

  it('records healing when using a potion', () => {
    initCombatBattleLog();
    const startingState = makeCombatState();
    playerUsePotion(startingState);

    const expectedHeal = Math.min(items.potion.heal, startingState.player.maxHp - startingState.player.hp);
    const summary = battleLog.getCombatSummary();
    assert.strictEqual(summary.totalHealingDone, expectedHeal);

    const healEntries = battleLog.entries.filter((entry) => entry.type === 'heal' && (entry.details?.amount ?? 0) > 0);
    assert.ok(healEntries.length > 0, 'Potion use should log healing in the battle log');
  });

  it('does not log healing when potion is used at full HP', () => {
    initCombatBattleLog();
    const fullHpState = makeCombatState({ player: { hp: 60, maxHp: 60, inventory: { potion: 1 } } });
    playerUsePotion(fullHpState);

    const summary = battleLog.getCombatSummary();
    assert.strictEqual(summary.totalHealingDone, 0);

    const healEntries = battleLog.entries.filter((entry) => entry.type === 'heal');
    assert.strictEqual(healEntries.length, 0);
  });

  it('counts healing from consumable items in combat summary', () => {
    initCombatBattleLog();
    const healingItemState = makeCombatState({ player: { hp: 20, maxHp: 60, inventory: { potion: 1 } } });
    const result = playerUseItem(healingItemState, 'potion');

    const expectedHeal = Math.min(items.potion.heal, healingItemState.player.maxHp - healingItemState.player.hp);
    const summary = battleLog.getCombatSummary();
    assert.strictEqual(summary.totalHealingDone, expectedHeal);

    const healEntries = battleLog.entries.filter((entry) => entry.type === 'heal' && (entry.details?.amount ?? 0) === expectedHeal);
    assert.ok(healEntries.length > 0, 'Healing consumables should add heal entries');

    const remainingPotions = result.player.inventory.potion;
    assert.ok(remainingPotions === undefined || remainingPotions === 0, 'Item should be consumed through inventory helpers');
  });
});
