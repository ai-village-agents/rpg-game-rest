import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handleUIAction } from '../src/handlers/ui-handler.js';
import { createShopState } from '../src/shop.js';

import { playerAttack, playerUseAbility, nextRng } from '../src/combat.js';
import { calculateDamage } from '../src/combat/damage-calc.js';
import { getAbility } from '../src/combat/abilities.js';
import { getEffectiveCombatStats } from '../src/combat/equipment-bonuses.js';

import { renderShopPanel } from '../src/shop-ui.js';

function makeShopState() {
  return createShopState('merchant_bram', 'exploration');
}

function makePlayer(overrides = {}) {
  return {
    name: 'TestHero',
    hp: 50,
    maxHp: 50,
    mp: 20,
    maxMp: 20,
    atk: 10,
    def: 0,
    spd: 1,
    gold: 0,
    inventory: {},
    defending: false,
    abilities: [],
    ...overrides,
  };
}

function makeEnemy(overrides = {}) {
  return {
    name: 'TestEnemy',
    hp: 30,
    maxHp: 30,
    atk: 1,
    def: 0,
    defending: false,
    xpReward: 0,
    goldReward: 0,
    element: null,
    statusEffects: [],
    ...overrides,
  };
}

describe('World event wiring', () => {
  it('passes worldEvent into BUY_ITEM so shop discounts affect purchase cost', () => {
    const state = {
      phase: 'shop',
      shopState: makeShopState(),
      player: makePlayer({ gold: 15, inventory: {} }),
      worldEvent: { effect: { type: 'shop_discount', value: 0.2 } },
      log: [],
    };

    const next = handleUIAction(state, { type: 'BUY_ITEM', itemId: 'potion', quantity: 1 });
    assert.ok(next);

    assert.equal(next.player.gold, 3);
    assert.equal(next.player.inventory.potion, 1);
  });

  it('applies damage multiplier world event to basic attacks (playerAttack)', () => {
    const baseState = {
      phase: 'player-turn',
      rngSeed: 1,
      turn: 1,
      log: [],
      player: makePlayer({ atk: 10, inventory: { potion: 0 } }),
      enemy: makeEnemy({ hp: 30, maxHp: 30, def: 0 }),
      world: { roomRow: 1, roomCol: 1 },
    };

    const noEvent = playerAttack({ ...baseState, worldEvent: null });
    const dmgNoEvent = 30 - noEvent.enemy.hp;

    const doubled = playerAttack({ ...baseState, worldEvent: { effect: { type: 'damage_multiplier', value: 2 } } });
    const dmgDoubled = 30 - doubled.enemy.hp;

    assert.equal(dmgNoEvent, 10);
    assert.equal(dmgDoubled, 20);
  });

  it('threads worldEvent into ability damage calculations (playerUseAbility)', () => {
    const ability = getAbility('power-strike');
    assert.ok(ability);

    const state = {
      phase: 'player-turn',
      rngSeed: 1,
      turn: 1,
      log: [],
      player: makePlayer({ atk: 20, mp: 20, abilities: ['power-strike'] }),
      enemy: makeEnemy({ hp: 200, maxHp: 200, def: 1, element: null, defending: false }),
      worldEvent: { effect: { type: 'damage_multiplier', value: 2 } },
      world: { roomRow: 1, roomCol: 1 },
    };

    const { value: rngValue } = nextRng(state.rngSeed);
    const expected = calculateDamage({
      attackerAtk: getEffectiveCombatStats(state.player).atk,
      targetDef: state.enemy.def,
      targetDefending: state.enemy.defending,
      element: ability.element ?? 'physical',
      targetElement: state.enemy.element ?? null,
      rngValue,
      abilityPower: ability.power,
      worldEvent: state.worldEvent,
    }).damage;

    const next = playerUseAbility(state, 'power-strike');
    const actual = 200 - next.enemy.hp;

    assert.equal(actual, expected);
  });

  it('Shop UI displays discounted price when worldEvent is provided', () => {
    const shopState = makeShopState();
    const player = makePlayer({ gold: 999 });
    const worldEvent = { effect: { type: 'shop_discount', value: 0.2 } };

    const html = renderShopPanel(shopState, player, worldEvent);

    assert.ok(html.includes('12'));
    assert.ok(html.includes('(-20%)'));
  });
});
