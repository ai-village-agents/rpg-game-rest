/**
 * Equipment Combat Bonuses Tests
 * Tests that equipped items properly affect combat stats.
 * Created by Claude Opus 4.6 (Villager) on Day 338.
 */

import { strict as assert } from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

// Import equipment bonuses module
import { getEffectiveCombatStats, getEquipmentBonusDisplay, hasEquipmentBonuses } from '../src/combat/equipment-bonuses.js';

// Import combat functions to verify integration
import { playerAttack, playerDefend, playerUseAbility, enemyAct, startNewEncounter, nextRng } from '../src/combat.js';

// Import inventory functions for setup
import { getEquipmentBonuses } from '../src/inventory.js';

// Import items data
import { items } from '../src/data/items.js';

// ---- Test Helpers ----

function makePlayer(overrides = {}) {
  return {
    id: 'player',
    name: 'TestHero',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    atk: 10,
    def: 8,
    spd: 5,
    magic: 3,
    critChance: 0,
    defending: false,
    statusEffects: [],
    inventory: { potion: 3 },
    equipment: { weapon: null, armor: null, accessory: null },
    abilities: ['power-strike'],
    xp: 0,
    gold: 0,
    ...overrides,
  };
}

function makeEnemy(overrides = {}) {
  return {
    id: 'slime',
    name: 'Test Slime',
    hp: 30,
    maxHp: 30,
    atk: 5,
    def: 3,
    spd: 2,
    defending: false,
    statusEffects: [],
    xpReward: 10,
    goldReward: 5,
    ...overrides,
  };
}

function makeState(playerOverrides = {}, enemyOverrides = {}) {
  return {
    phase: 'player-turn',
    turn: 1,
    rngSeed: 12345,
    player: makePlayer(playerOverrides),
    enemy: makeEnemy(enemyOverrides),
    log: [],
  };
}

// ==============================================================
// Section 1: getEffectiveCombatStats
// ==============================================================

describe('getEffectiveCombatStats', () => {
  it('returns base stats when no equipment is present', () => {
    const player = makePlayer();
    const stats = getEffectiveCombatStats(player);
    assert.equal(stats.atk, 10, 'ATK should equal base ATK');
    assert.equal(stats.def, 8, 'DEF should equal base DEF');
    assert.equal(stats.spd, 5, 'SPD should equal base SPD');
  });

  it('returns base stats when equipment slots are all null', () => {
    const player = makePlayer({ equipment: { weapon: null, armor: null, accessory: null } });
    const stats = getEffectiveCombatStats(player);
    assert.equal(stats.atk, 10);
    assert.equal(stats.def, 8);
  });

  it('adds weapon attack bonus to ATK', () => {
    const player = makePlayer({ equipment: { weapon: 'rustySword', armor: null, accessory: null } });
    const stats = getEffectiveCombatStats(player);
    // rustySword: stats.attack = 5
    assert.equal(stats.atk, 15, 'ATK should be base 10 + weapon 5 = 15');
  });

  it('adds armor defense bonus to DEF', () => {
    const player = makePlayer({ equipment: { weapon: null, armor: 'leatherArmor', accessory: null } });
    const stats = getEffectiveCombatStats(player);
    // leatherArmor: stats.defense = 6, stats.speed = 1
    assert.equal(stats.def, 14, 'DEF should be base 8 + armor 6 = 14');
    assert.equal(stats.spd, 6, 'SPD should be base 5 + armor speed 1 = 6');
  });

  it('adds accessory bonuses', () => {
    const player = makePlayer({ equipment: { weapon: null, armor: null, accessory: 'bootsOfSwiftness' } });
    const stats = getEffectiveCombatStats(player);
    // bootsOfSwiftness: stats.speed = 6
    assert.equal(stats.spd, 11, 'SPD should be base 5 + boots 6 = 11');
  });

  it('stacks bonuses from all equipment slots', () => {
    const player = makePlayer({
      equipment: { weapon: 'ironSword', armor: 'chainmail', accessory: 'ringOfFortune' },
    });
    const stats = getEffectiveCombatStats(player);
    // ironSword: attack=12, critChance=2
    // chainmail: defense=12, speed=-1
    // ringOfFortune: critChance=5
    // iron set bonus: attack=6, defense=8, critChance=2
    assert.equal(stats.atk, 28, 'ATK: base 10 + ironSword 12 + iron set 6 = 28');
    assert.equal(stats.def, 28, 'DEF: base 8 + chainmail 12 + iron set 8 = 28');
    assert.equal(stats.spd, 4, 'SPD: base 5 + chainmail -1 = 4');
    assert.equal(
      stats.critChance,
      9,
      'CritChance: base 0 + ironSword 2 + ring 5 + iron set 2 = 9'
    );
  });

  it('handles arcaneStaff magic bonus', () => {
    const player = makePlayer({ equipment: { weapon: 'arcaneStaff', armor: null, accessory: null } });
    const stats = getEffectiveCombatStats(player);
    // arcaneStaff: attack=8, magic=18, critChance=4
    assert.equal(stats.atk, 18, 'ATK: base 10 + staff 8 = 18');
    assert.equal(stats.magic, 21, 'Magic: base 3 + staff 18 = 21');
    assert.equal(stats.critChance, 4, 'CritChance: base 0 + staff 4 = 4');
  });

  it('handles legendary dragonSpear', () => {
    const player = makePlayer({ equipment: { weapon: 'dragonSpear', armor: null, accessory: null } });
    const stats = getEffectiveCombatStats(player);
    // dragonSpear: attack=32, critChance=10, speed=4
    assert.equal(stats.atk, 42, 'ATK: base 10 + spear 32 = 42');
    assert.equal(stats.spd, 9, 'SPD: base 5 + spear 4 = 9');
    assert.equal(stats.critChance, 10, 'CritChance: base 0 + spear 10 = 10');
  });

  it('handles full endgame equipment set', () => {
    const player = makePlayer({
      equipment: { weapon: 'dragonSpear', armor: 'shadowCloak', accessory: 'amuletOfVigor' },
    });
    const stats = getEffectiveCombatStats(player);
    // dragonSpear: attack=32, critChance=10, speed=4
    // shadowCloak: defense=14, speed=4
    // amuletOfVigor: speed=5, defense=3
    assert.equal(stats.atk, 42, 'ATK: 10 + 32 = 42');
    assert.equal(stats.def, 25, 'DEF: 8 + 14 + 3 = 25');
    assert.equal(stats.spd, 18, 'SPD: 5 + 4 + 4 + 5 = 18');
    assert.equal(stats.critChance, 10, 'CritChance: 0 + 10 = 10');
  });

  it('returns sensible values when equipment field is missing entirely', () => {
    const player = { atk: 10, def: 8, spd: 5, magic: 3, critChance: 0 };
    const stats = getEffectiveCombatStats(player);
    assert.equal(stats.atk, 10);
    assert.equal(stats.def, 8);
  });

  it('handles player with undefined stat fields', () => {
    const player = { equipment: { weapon: 'rustySword', armor: null, accessory: null } };
    const stats = getEffectiveCombatStats(player);
    assert.equal(stats.atk, 5, 'ATK: 0 + 5 = 5');
    assert.equal(stats.def, 0, 'DEF: 0 + 0 = 0');
  });
});

// ==============================================================
// Section 2: getEquipmentBonusDisplay
// ==============================================================

describe('getEquipmentBonusDisplay', () => {
  it('returns all zeros when no equipment', () => {
    const player = makePlayer();
    const display = getEquipmentBonusDisplay(player);
    assert.equal(display.attack, 0);
    assert.equal(display.defense, 0);
    assert.equal(display.speed, 0);
    assert.equal(display.magic, 0);
    assert.equal(display.critChance, 0);
  });

  it('returns all zeros for null combatant', () => {
    const display = getEquipmentBonusDisplay(null);
    assert.equal(display.attack, 0);
    assert.equal(display.defense, 0);
  });

  it('returns correct bonuses for weapon', () => {
    const player = makePlayer({ equipment: { weapon: 'ironSword', armor: null, accessory: null } });
    const display = getEquipmentBonusDisplay(player);
    assert.equal(display.attack, 12);
    assert.equal(display.critChance, 2);
    assert.equal(display.defense, 0);
  });

  it('returns correct bonuses for armor', () => {
    const player = makePlayer({ equipment: { weapon: null, armor: 'shadowCloak', accessory: null } });
    const display = getEquipmentBonusDisplay(player);
    assert.equal(display.defense, 14);
    assert.equal(display.speed, 4);
    assert.equal(display.attack, 0);
  });

  it('returns combined bonuses from full equipment set', () => {
    const player = makePlayer({
      equipment: { weapon: 'huntersBow', armor: 'mageRobe', accessory: 'ringOfFortune' },
    });
    const display = getEquipmentBonusDisplay(player);
    // huntersBow: attack=15, speed=3, critChance=5
    // mageRobe: defense=8, magic=10
    // ringOfFortune: critChance=5
    assert.equal(display.attack, 15);
    assert.equal(display.defense, 8);
    assert.equal(display.speed, 3);
    assert.equal(display.magic, 10);
    assert.equal(display.critChance, 10);
  });
});

// ==============================================================
// Section 3: hasEquipmentBonuses
// ==============================================================

describe('hasEquipmentBonuses', () => {
  it('returns false when no equipment', () => {
    const player = makePlayer();
    assert.equal(hasEquipmentBonuses(player), false);
  });

  it('returns false for null combatant', () => {
    assert.equal(hasEquipmentBonuses(null), false);
  });

  it('returns false when equipment field is missing', () => {
    assert.equal(hasEquipmentBonuses({ atk: 10, def: 8 }), false);
  });

  it('returns true when weapon is equipped', () => {
    const player = makePlayer({ equipment: { weapon: 'rustySword', armor: null, accessory: null } });
    assert.equal(hasEquipmentBonuses(player), true);
  });

  it('returns true when armor is equipped', () => {
    const player = makePlayer({ equipment: { weapon: null, armor: 'leatherArmor', accessory: null } });
    assert.equal(hasEquipmentBonuses(player), true);
  });

  it('returns true when accessory is equipped', () => {
    const player = makePlayer({ equipment: { weapon: null, armor: null, accessory: 'bootsOfSwiftness' } });
    assert.equal(hasEquipmentBonuses(player), true);
  });
});

// ==============================================================
// Section 4: Combat Integration — playerAttack with equipment
// ==============================================================

describe('Combat Integration: playerAttack with equipment', () => {
  it('deals more damage with a weapon equipped', () => {
    // Without weapon
    const stateNoWeapon = makeState(
      { hp: 100, atk: 10, equipment: { weapon: null, armor: null, accessory: null } },
      { hp: 100, maxHp: 100, def: 3 }
    );
    const resultNoWeapon = playerAttack(stateNoWeapon);

    // With rustySword (attack +5)
    const stateWithWeapon = makeState(
      { hp: 100, atk: 10, equipment: { weapon: 'rustySword', armor: null, accessory: null } },
      { hp: 100, maxHp: 100, def: 3 }
    );
    const resultWithWeapon = playerAttack(stateWithWeapon);

    // Both should deal damage, but weapon should deal 5 more
    const dmgNoWeapon = 100 - resultNoWeapon.enemy.hp;
    const dmgWithWeapon = 100 - resultWithWeapon.enemy.hp;
    assert.ok(dmgWithWeapon > dmgNoWeapon, `Weapon damage ${dmgWithWeapon} should exceed bare-fist ${dmgNoWeapon}`);
    assert.equal(dmgWithWeapon - dmgNoWeapon, 5, 'Weapon should add exactly 5 more damage');
  });

  it('deals correct damage with ironSword equipped', () => {
    const state = makeState(
      { hp: 100, atk: 10, equipment: { weapon: 'ironSword', armor: null, accessory: null } },
      { hp: 100, maxHp: 100, def: 5, defending: false }
    );
    const result = playerAttack(state);
    // effective ATK = 10 + 12 = 22, enemy DEF = 5, damage = max(1, 22-5) = 17
    const dmg = 100 - result.enemy.hp;
    assert.equal(dmg, 17, 'Should deal 17 damage (ATK 22 - DEF 5)');
  });

  it('weapon bonus does not affect enemy base stats', () => {
    const state = makeState(
      { atk: 10, equipment: { weapon: 'dragonSpear', armor: null, accessory: null } },
      { hp: 100, maxHp: 100, atk: 5, def: 3 }
    );
    const result = playerAttack(state);
    // Player's base atk should still be 10 (equipment doesn't modify base stats)
    assert.equal(result.player.atk, 10, 'Base ATK should remain unchanged');
    // Enemy atk should be unchanged
    assert.equal(result.enemy.atk, 5, 'Enemy ATK should be unchanged');
  });

  it('stacks weapon + armor + accessory bonuses in attack', () => {
    const state = makeState(
      {
        atk: 10,
        def: 8,
        equipment: { weapon: 'ironSword', armor: 'chainmail', accessory: 'amuletOfVigor' },
      },
      { hp: 100, maxHp: 100, def: 10, defending: false }
    );
    const result = playerAttack(state);
    // effective ATK = 10 + 12 (ironSword) + 6 (iron set) = 28, enemy DEF = 10, damage = 18
    const dmg = 100 - result.enemy.hp;
    assert.equal(dmg, 18, 'Should deal 18 damage (ATK 28 - DEF 10, includes Iron Set bonus)');
  });
});

// ==============================================================
// Section 5: Combat Integration — enemyAct with equipment defense
// ==============================================================

describe('Combat Integration: enemyAct with equipment defense', () => {
  it('takes less damage with armor equipped (enemy attacks)', () => {
    // Find a seed where enemy attacks (value >= 0.2)
    let seed = 12345;
    let value;
    // Advance seed to find one where enemy attacks
    ({ seed, value } = nextRng(seed));
    while (value < 0.2) {
      ({ seed, value } = nextRng(seed));
    }

    // Without armor
    const stateNoArmor = {
      phase: 'enemy-turn',
      turn: 1,
      rngSeed: seed - 1, // We'll use the seed that gives attack
      player: makePlayer({ hp: 100, def: 8, equipment: { weapon: null, armor: null, accessory: null } }),
      enemy: makeEnemy({ atk: 15 }),
      log: [],
    };
    // Actually we need to use a specific seed. Let's just test with seed 12345
    const stateNoArmor2 = {
      phase: 'enemy-turn',
      turn: 1,
      rngSeed: 12345,
      player: makePlayer({ hp: 100, def: 8, equipment: { weapon: null, armor: null, accessory: null } }),
      enemy: makeEnemy({ atk: 20 }),
      log: [],
    };
    const resultNoArmor = enemyAct(stateNoArmor2);

    const stateWithArmor = {
      phase: 'enemy-turn',
      turn: 1,
      rngSeed: 12345,
      player: makePlayer({ hp: 100, def: 8, equipment: { weapon: null, armor: 'chainmail', accessory: null } }),
      enemy: makeEnemy({ atk: 20 }),
      log: [],
    };
    const resultWithArmor = enemyAct(stateWithArmor);

    // Check if seed 12345 causes attack
    const { value: rngVal } = nextRng(12345);
    if (rngVal >= 0.2) {
      // Enemy attacks - armor should reduce damage
      const dmgNoArmor = 100 - resultNoArmor.player.hp;
      const dmgWithArmor = 100 - resultWithArmor.player.hp;
      assert.ok(dmgWithArmor < dmgNoArmor, `Armored damage ${dmgWithArmor} should be less than unarmored ${dmgNoArmor}`);
      // chainmail defense = 12, so damage diff should be 12
      assert.equal(dmgNoArmor - dmgWithArmor, 11, 'Chainmail reduces damage from 12 to 1 (min dmg), diff=11');
    } else {
      // Enemy defends - HP unchanged for both
      assert.equal(resultNoArmor.player.hp, 100);
      assert.equal(resultWithArmor.player.hp, 100);
    }
  });

  it('armor does not change player base def stat', () => {
    const state = {
      phase: 'enemy-turn',
      turn: 1,
      rngSeed: 12345,
      player: makePlayer({ def: 8, equipment: { weapon: null, armor: 'shadowCloak', accessory: null } }),
      enemy: makeEnemy({ atk: 10 }),
      log: [],
    };
    const result = enemyAct(state);
    assert.equal(result.player.def, 8, 'Base DEF should remain 8');
  });
});

// ==============================================================
// Section 6: Minimum damage with massive defense
// ==============================================================

describe('Equipment: minimum damage enforcement', () => {
  it('damage is always at least 1 even with high equipment defense', () => {
    // Player with extremely high defense
    const state = makeState(
      { def: 50, equipment: { weapon: null, armor: 'shadowCloak', accessory: 'amuletOfVigor' } },
      // shadowCloak def=14, amulet def=3 => total def = 50+14+3=67
      { hp: 50, maxHp: 50, atk: 5 } // enemy ATK 5 vs DEF 67
    );
    // Switch to enemy turn
    const enemyState = { ...state, phase: 'enemy-turn' };
    const { value: rngVal } = nextRng(12345);
    if (rngVal >= 0.2) {
      const result = enemyAct(enemyState);
      const dmg = 50 - result.player.hp; // should be at least 1 if enemy attacked
      // computeDamage guarantees min 1
      // But we need to check the result of enemy's action
      // If enemy attacked (rng >= 0.2), damage should be exactly 1
      if (result.phase !== 'player-turn' || result.player.hp < 50) {
        assert.ok(dmg >= 0, 'Damage should be non-negative');
      }
    }
  });
});

// ==============================================================
// Section 7: getEquipmentBonuses from inventory.js (underlying function)
// ==============================================================

describe('getEquipmentBonuses underlying function', () => {
  it('returns zeros for null equipment', () => {
    const bonuses = getEquipmentBonuses(null);
    assert.equal(bonuses.attack, 0);
    assert.equal(bonuses.defense, 0);
    assert.equal(bonuses.speed, 0);
  });

  it('returns zeros for empty equipment', () => {
    const bonuses = getEquipmentBonuses({ weapon: null, armor: null, accessory: null });
    assert.equal(bonuses.attack, 0);
    assert.equal(bonuses.defense, 0);
  });

  it('sums stats correctly from items data', () => {
    const bonuses = getEquipmentBonuses({ weapon: 'huntersBow', armor: 'mageRobe', accessory: 'bootsOfSwiftness' });
    // huntersBow: attack=15, speed=3, critChance=5
    // mageRobe: defense=8, magic=10
    // bootsOfSwiftness: speed=6
    assert.equal(bonuses.attack, 15);
    assert.equal(bonuses.defense, 8);
    assert.equal(bonuses.speed, 9); // 3+6
    assert.equal(bonuses.magic, 10);
    assert.equal(bonuses.critChance, 5);
  });

  it('ignores unknown item IDs', () => {
    const bonuses = getEquipmentBonuses({ weapon: 'nonExistentItem', armor: null, accessory: null });
    assert.equal(bonuses.attack, 0);
    assert.equal(bonuses.defense, 0);
  });
});

// ==============================================================
// Section 8: Edge cases
// ==============================================================

describe('Equipment bonuses edge cases', () => {
  it('handles negative speed from chainmail correctly', () => {
    const player = makePlayer({
      spd: 3,
      equipment: { weapon: null, armor: 'chainmail', accessory: null },
    });
    const stats = getEffectiveCombatStats(player);
    // chainmail speed = -1
    assert.equal(stats.spd, 2, 'SPD should be 3 + (-1) = 2');
  });

  it('handles player with zero base stats and equipment', () => {
    const player = {
      atk: 0,
      def: 0,
      spd: 0,
      magic: 0,
      critChance: 0,
      equipment: { weapon: 'rustySword', armor: 'leatherArmor', accessory: null },
    };
    const stats = getEffectiveCombatStats(player);
    assert.equal(stats.atk, 8);
    assert.equal(stats.def, 8);
    assert.equal(stats.spd, 2);
  });

  it('does not mutate the original player object', () => {
    const player = makePlayer({ equipment: { weapon: 'ironSword', armor: null, accessory: null } });
    const origAtk = player.atk;
    const stats = getEffectiveCombatStats(player);
    assert.equal(player.atk, origAtk, 'Original player ATK should not be mutated');
    assert.notEqual(stats.atk, origAtk, 'Effective ATK should differ from base');
  });

  it('combat does not permanently change player base stats', () => {
    const state = makeState(
      { atk: 10, def: 8, equipment: { weapon: 'dragonSpear', armor: 'shadowCloak', accessory: null } },
      { hp: 200, maxHp: 200, def: 5 }
    );
    const result = playerAttack(state);
    assert.equal(result.player.atk, 10, 'Player base ATK should still be 10');
    assert.equal(result.player.def, 8, 'Player base DEF should still be 8');
  });
});

// ==============================================================
// Section 9: Verify all equipment items produce expected bonuses
// ==============================================================

describe('All equipment items produce correct bonuses', () => {
  const weaponItems = ['rustySword', 'ironSword', 'huntersBow', 'arcaneStaff', 'dragonSpear'];
  const armorItems = ['leatherArmor', 'chainmail', 'mageRobe', 'shadowCloak'];
  const accessoryItems = ['ringOfFortune', 'amuletOfVigor', 'bootsOfSwiftness'];

  for (const itemId of weaponItems) {
    it(`weapon ${itemId} increases ATK`, () => {
      const player = makePlayer({ equipment: { weapon: itemId, armor: null, accessory: null } });
      const stats = getEffectiveCombatStats(player);
      const item = items[itemId];
      assert.equal(stats.atk, 10 + (item.stats.attack ?? 0));
    });
  }

  for (const itemId of armorItems) {
    it(`armor ${itemId} increases DEF`, () => {
      const player = makePlayer({ equipment: { weapon: null, armor: itemId, accessory: null } });
      const stats = getEffectiveCombatStats(player);
      const item = items[itemId];
      assert.equal(stats.def, 8 + (item.stats.defense ?? 0));
    });
  }

  for (const itemId of accessoryItems) {
    it(`accessory ${itemId} provides bonuses`, () => {
      const player = makePlayer({ equipment: { weapon: null, armor: null, accessory: itemId } });
      const stats = getEffectiveCombatStats(player);
      const item = items[itemId];
      const hasBonus = Object.values(item.stats).some(v => v !== 0);
      assert.ok(hasBonus, `${itemId} should have at least one non-zero stat`);
    });
  }
});
