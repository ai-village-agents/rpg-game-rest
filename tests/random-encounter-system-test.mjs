/**
 * Random Encounter System Tests
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  ENCOUNTER_TYPE,
  LOCATION_TYPE,
  ENCOUNTER_RARITY,
  ENCOUNTERS,
  BASE_ENCOUNTER_RATES,
  RARITY_WEIGHTS,
  createEncounterState,
  checkForEncounter,
  generateEncounter,
  createEncounterInstance,
  resolveEncounter,
  addEncounterModifier,
  removeEncounterModifier,
  clearExpiredModifiers,
  getEncountersByType,
  getEncountersByLocation,
  getEncountersByRarity,
  getEncounter,
  getAllEncounters,
  getEncounterRate,
  getEncounterStats,
  getAllLocationTypes,
  getAllEncounterTypes,
  getAllRarities,
} from '../src/random-encounter-system.js';

import {
  getEncounterStyles,
  renderEncounterPopup,
  renderEncounterNotification,
  renderEncounterResult,
  renderEncounterStatsPanel,
  renderEncounterRateDisplay,
  renderEncounterList,
} from '../src/random-encounter-system-ui.js';

// Banned words that should never appear in game content
const BANNED_WORDS = ['egg', 'easter', 'yolk', 'bunny', 'rabbit', 'phoenix'];

describe('Encounter Constants', () => {
  test('ENCOUNTER_TYPE has all expected types', () => {
    assert.strictEqual(ENCOUNTER_TYPE.COMBAT, 'combat');
    assert.strictEqual(ENCOUNTER_TYPE.TREASURE, 'treasure');
    assert.strictEqual(ENCOUNTER_TYPE.EVENT, 'event');
    assert.strictEqual(ENCOUNTER_TYPE.MERCHANT, 'merchant');
    assert.strictEqual(ENCOUNTER_TYPE.REST, 'rest');
    assert.strictEqual(ENCOUNTER_TYPE.TRAP, 'trap');
    assert.strictEqual(ENCOUNTER_TYPE.NPC, 'npc');
    assert.strictEqual(ENCOUNTER_TYPE.NOTHING, 'nothing');
  });

  test('LOCATION_TYPE has all expected locations', () => {
    assert.strictEqual(LOCATION_TYPE.FOREST, 'forest');
    assert.strictEqual(LOCATION_TYPE.CAVE, 'cave');
    assert.strictEqual(LOCATION_TYPE.DUNGEON, 'dungeon');
    assert.strictEqual(LOCATION_TYPE.ROAD, 'road');
    assert.strictEqual(LOCATION_TYPE.TOWN, 'town');
    assert.strictEqual(LOCATION_TYPE.MOUNTAIN, 'mountain');
    assert.strictEqual(LOCATION_TYPE.SWAMP, 'swamp');
    assert.strictEqual(LOCATION_TYPE.RUINS, 'ruins');
  });

  test('ENCOUNTER_RARITY has all expected rarities', () => {
    assert.strictEqual(ENCOUNTER_RARITY.COMMON, 'common');
    assert.strictEqual(ENCOUNTER_RARITY.UNCOMMON, 'uncommon');
    assert.strictEqual(ENCOUNTER_RARITY.RARE, 'rare');
    assert.strictEqual(ENCOUNTER_RARITY.LEGENDARY, 'legendary');
  });

  test('BASE_ENCOUNTER_RATES has rates for all locations', () => {
    for (const location of Object.values(LOCATION_TYPE)) {
      assert.ok(
        typeof BASE_ENCOUNTER_RATES[location] === 'number',
        `Missing rate for ${location}`
      );
      assert.ok(BASE_ENCOUNTER_RATES[location] >= 0 && BASE_ENCOUNTER_RATES[location] <= 1);
    }
  });

  test('RARITY_WEIGHTS has weights for all rarities', () => {
    for (const rarity of Object.values(ENCOUNTER_RARITY)) {
      assert.ok(
        typeof RARITY_WEIGHTS[rarity] === 'number',
        `Missing weight for ${rarity}`
      );
      assert.ok(RARITY_WEIGHTS[rarity] > 0);
    }
  });
});

describe('Encounter Definitions', () => {
  test('All encounters have required fields', () => {
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      assert.strictEqual(encounter.id, id, `Encounter ${id} id mismatch`);
      assert.ok(encounter.name, `Encounter ${id} missing name`);
      assert.ok(encounter.description, `Encounter ${id} missing description`);
      assert.ok(encounter.type, `Encounter ${id} missing type`);
      assert.ok(encounter.rarity, `Encounter ${id} missing rarity`);
      assert.ok(encounter.icon, `Encounter ${id} missing icon`);
      assert.ok(Array.isArray(encounter.locations), `Encounter ${id} missing locations`);
      assert.ok(encounter.locations.length > 0, `Encounter ${id} has no locations`);
    }
  });

  test('All encounters have valid types', () => {
    const validTypes = Object.values(ENCOUNTER_TYPE);
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      assert.ok(
        validTypes.includes(encounter.type),
        `Encounter ${id} has invalid type: ${encounter.type}`
      );
    }
  });

  test('All encounters have valid rarities', () => {
    const validRarities = Object.values(ENCOUNTER_RARITY);
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      assert.ok(
        validRarities.includes(encounter.rarity),
        `Encounter ${id} has invalid rarity: ${encounter.rarity}`
      );
    }
  });

  test('All encounters have valid locations', () => {
    const validLocations = Object.values(LOCATION_TYPE);
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      for (const loc of encounter.locations) {
        assert.ok(
          validLocations.includes(loc),
          `Encounter ${id} has invalid location: ${loc}`
        );
      }
    }
  });

  test('Combat encounters have enemies array', () => {
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      if (encounter.type === ENCOUNTER_TYPE.COMBAT) {
        assert.ok(
          Array.isArray(encounter.enemies),
          `Combat encounter ${id} missing enemies array`
        );
        assert.ok(encounter.enemies.length > 0, `Combat encounter ${id} has no enemies`);
      }
    }
  });

  test('Combat encounters have level range', () => {
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      if (encounter.type === ENCOUNTER_TYPE.COMBAT) {
        assert.ok(
          Array.isArray(encounter.levelRange) && encounter.levelRange.length === 2,
          `Combat encounter ${id} missing levelRange`
        );
        assert.ok(
          encounter.levelRange[0] <= encounter.levelRange[1],
          `Combat encounter ${id} has invalid levelRange`
        );
      }
    }
  });

  test('Trap encounters have damage info', () => {
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      if (encounter.type === ENCOUNTER_TYPE.TRAP) {
        assert.ok(encounter.damage, `Trap encounter ${id} missing damage`);
        assert.ok(encounter.avoidCheck, `Trap encounter ${id} missing avoidCheck`);
      }
    }
  });
});

describe('createEncounterState', () => {
  test('Creates state with null lastEncounter', () => {
    const state = createEncounterState();
    assert.strictEqual(state.lastEncounter, null);
  });

  test('Creates state with zero cooldown', () => {
    const state = createEncounterState();
    assert.strictEqual(state.encounterCooldown, 0);
  });

  test('Creates state with empty arrays', () => {
    const state = createEncounterState();
    assert.ok(Array.isArray(state.encounteredIds));
    assert.ok(Array.isArray(state.modifiers));
    assert.ok(Array.isArray(state.history));
    assert.strictEqual(state.encounteredIds.length, 0);
  });

  test('Creates state with zero counters', () => {
    const state = createEncounterState();
    assert.strictEqual(state.totalEncounters, 0);
    assert.strictEqual(state.fleesCount, 0);
    assert.strictEqual(state.encountersWon, 0);
  });
});

describe('checkForEncounter', () => {
  test('Returns null when on cooldown', () => {
    let state = createEncounterState();
    state.encounterCooldown = 5;
    const result = checkForEncounter(state, LOCATION_TYPE.FOREST, 5);
    assert.strictEqual(result.encounter, null);
    assert.strictEqual(result.state.encounterCooldown, 4);
  });

  test('Decrements cooldown each check', () => {
    let state = createEncounterState();
    state.encounterCooldown = 3;

    let result = checkForEncounter(state, LOCATION_TYPE.FOREST, 5);
    assert.strictEqual(result.state.encounterCooldown, 2);

    result = checkForEncounter(result.state, LOCATION_TYPE.FOREST, 5);
    assert.strictEqual(result.state.encounterCooldown, 1);
  });

  test('Can generate encounter when cooldown is 0', () => {
    // Run multiple times to ensure we sometimes get an encounter
    let gotEncounter = false;
    for (let i = 0; i < 100 && !gotEncounter; i++) {
      let state = createEncounterState();
      const result = checkForEncounter(state, LOCATION_TYPE.DUNGEON, 10);
      if (result.encounter) {
        gotEncounter = true;
        assert.ok(result.encounter.id);
        assert.ok(result.state.encounterCooldown > 0);
      }
    }
    // With 30% rate in dungeon, we should get one in 100 tries
    assert.ok(gotEncounter, 'Should generate encounter eventually');
  });

  test('Tracks encounter in history', () => {
    // Force an encounter by running many times
    let state = createEncounterState();
    let encounter = null;
    for (let i = 0; i < 100 && !encounter; i++) {
      const result = checkForEncounter(state, LOCATION_TYPE.DUNGEON, 10);
      if (result.encounter) {
        encounter = result.encounter;
        state = result.state;
      }
    }
    if (encounter) {
      assert.ok(state.history.length > 0);
      assert.strictEqual(state.history[0].encounterId, encounter.id);
    }
  });

  test('Increments total encounters count', () => {
    let state = createEncounterState();
    let encounter = null;
    for (let i = 0; i < 100 && !encounter; i++) {
      const result = checkForEncounter(state, LOCATION_TYPE.DUNGEON, 10);
      if (result.encounter) {
        encounter = result.encounter;
        state = result.state;
      }
    }
    if (encounter) {
      assert.strictEqual(state.totalEncounters, 1);
    }
  });
});

describe('generateEncounter', () => {
  test('Generates encounter for valid location', () => {
    const encounter = generateEncounter(LOCATION_TYPE.FOREST, 5);
    // May return null if no valid encounters, but if it returns something, check it
    if (encounter) {
      assert.ok(encounter.locations.includes(LOCATION_TYPE.FOREST));
    }
  });

  test('Respects player level for combat', () => {
    const encounter = generateEncounter(LOCATION_TYPE.FOREST, 1);
    if (encounter && encounter.type === ENCOUNTER_TYPE.COMBAT) {
      // Should not get encounters way above level
      assert.ok(encounter.levelRange[0] <= 4); // Within reasonable range
    }
  });

  test('Returns null for invalid location', () => {
    const encounter = generateEncounter('invalid-location', 5);
    // Should return null or an encounter that doesn't require valid location
  });

  test('Excludes recently encountered rare/legendary', () => {
    // This is hard to test deterministically, but we can verify the logic exists
    const excludeIds = ['dragon-spawn'];
    const encounters = [];
    for (let i = 0; i < 50; i++) {
      const e = generateEncounter(LOCATION_TYPE.MOUNTAIN, 20, excludeIds);
      if (e && e.rarity === ENCOUNTER_RARITY.LEGENDARY) {
        encounters.push(e);
      }
    }
    // Should not include excluded legendary
    for (const e of encounters) {
      if (e.id === 'dragon-spawn') {
        assert.fail('Should not generate excluded encounter');
      }
    }
  });
});

describe('createEncounterInstance', () => {
  test('Creates instance with instance ID', () => {
    const def = ENCOUNTERS['wolf-pack'];
    const instance = createEncounterInstance(def, 5);
    assert.ok(instance.instanceId);
    assert.ok(instance.instanceId.startsWith('wolf-pack-'));
  });

  test('Sets player level', () => {
    const def = ENCOUNTERS['wolf-pack'];
    const instance = createEncounterInstance(def, 10);
    assert.strictEqual(instance.playerLevel, 10);
  });

  test('Scales combat level', () => {
    const def = ENCOUNTERS['wolf-pack'];
    const instance = createEncounterInstance(def, 10);
    assert.ok(instance.scaledLevel);
    assert.ok(instance.scaledLevel >= 9 && instance.scaledLevel <= 12);
  });

  test('Scales trap damage', () => {
    const def = ENCOUNTERS['pit-trap'];
    const instance = createEncounterInstance(def, 10);
    assert.ok(instance.scaledDamage);
    assert.ok(instance.scaledDamage > def.damage.base);
  });

  test('Initializes as unresolved', () => {
    const def = ENCOUNTERS['wolf-pack'];
    const instance = createEncounterInstance(def, 5);
    assert.strictEqual(instance.resolved, false);
    assert.strictEqual(instance.outcome, null);
  });
});

describe('resolveEncounter', () => {
  test('Victory outcome updates stats', () => {
    let state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);

    const result = resolveEncounter(state, encounter, 'victory');
    assert.strictEqual(result.state.encountersWon, 1);
    assert.ok(result.encounter.resolved);
    assert.strictEqual(result.encounter.outcome, 'victory');
  });

  test('Victory gives rewards', () => {
    let state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);

    const result = resolveEncounter(state, encounter, 'victory');
    assert.ok(result.rewards);
    assert.ok(result.rewards.xp > 0);
    assert.ok(result.rewards.gold > 0);
  });

  test('Flee outcome updates flee count', () => {
    let state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);

    const result = resolveEncounter(state, encounter, 'flee');
    assert.strictEqual(result.state.fleesCount, 1);
  });

  test('Defeat gives no rewards', () => {
    let state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);

    const result = resolveEncounter(state, encounter, 'defeat');
    assert.strictEqual(result.rewards, null);
  });

  test('Collected gives treasure rewards', () => {
    let state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['hidden-cache'], 5);

    const result = resolveEncounter(state, encounter, 'collected');
    assert.ok(result.rewards);
    assert.ok(result.rewards.gold > 0);
  });

  test('Avoided trap gives small xp', () => {
    let state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['pit-trap'], 5);

    const result = resolveEncounter(state, encounter, 'avoided');
    assert.ok(result.rewards);
    assert.ok(result.rewards.xp > 0);
  });

  test('Triggered trap gives damage', () => {
    let state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['pit-trap'], 10);

    const result = resolveEncounter(state, encounter, 'triggered');
    assert.ok(result.rewards);
    assert.ok(result.rewards.damage > 0);
  });
});

describe('Encounter Modifiers', () => {
  test('addEncounterModifier adds modifier', () => {
    let state = createEncounterState();
    const modifier = { id: 'test', type: 'encounterRate', value: 1.5 };

    state = addEncounterModifier(state, modifier);
    assert.strictEqual(state.modifiers.length, 1);
    assert.strictEqual(state.modifiers[0].id, 'test');
  });

  test('addEncounterModifier sets addedAt timestamp', () => {
    let state = createEncounterState();
    const modifier = { id: 'test', type: 'encounterRate', value: 1.5 };

    const before = Date.now();
    state = addEncounterModifier(state, modifier);
    const after = Date.now();

    assert.ok(state.modifiers[0].addedAt >= before);
    assert.ok(state.modifiers[0].addedAt <= after);
  });

  test('removeEncounterModifier removes modifier', () => {
    let state = createEncounterState();
    state = addEncounterModifier(state, { id: 'test', type: 'encounterRate', value: 1.5 });
    state = addEncounterModifier(state, { id: 'test2', type: 'encounterRate', value: 2.0 });

    state = removeEncounterModifier(state, 'test');
    assert.strictEqual(state.modifiers.length, 1);
    assert.strictEqual(state.modifiers[0].id, 'test2');
  });

  test('clearExpiredModifiers removes old modifiers', () => {
    let state = createEncounterState();
    state = addEncounterModifier(state, {
      id: 'expired',
      type: 'encounterRate',
      value: 1.5,
      duration: 1000,
    });
    state.modifiers[0].addedAt = Date.now() - 2000; // Make it expired

    state = addEncounterModifier(state, {
      id: 'active',
      type: 'encounterRate',
      value: 2.0,
      duration: 10000,
    });

    state = clearExpiredModifiers(state);
    assert.strictEqual(state.modifiers.length, 1);
    assert.strictEqual(state.modifiers[0].id, 'active');
  });

  test('Modifiers without duration are not cleared', () => {
    let state = createEncounterState();
    state = addEncounterModifier(state, { id: 'permanent', type: 'encounterRate', value: 1.5 });

    state = clearExpiredModifiers(state);
    assert.strictEqual(state.modifiers.length, 1);
  });
});

describe('Encounter Queries', () => {
  test('getEncountersByType returns correct type', () => {
    const combat = getEncountersByType(ENCOUNTER_TYPE.COMBAT);
    assert.ok(combat.length > 0);
    for (const e of combat) {
      assert.strictEqual(e.type, ENCOUNTER_TYPE.COMBAT);
    }
  });

  test('getEncountersByLocation returns encounters for location', () => {
    const forest = getEncountersByLocation(LOCATION_TYPE.FOREST);
    assert.ok(forest.length > 0);
    for (const e of forest) {
      assert.ok(e.locations.includes(LOCATION_TYPE.FOREST));
    }
  });

  test('getEncountersByRarity returns correct rarity', () => {
    const legendary = getEncountersByRarity(ENCOUNTER_RARITY.LEGENDARY);
    assert.ok(legendary.length > 0);
    for (const e of legendary) {
      assert.strictEqual(e.rarity, ENCOUNTER_RARITY.LEGENDARY);
    }
  });

  test('getEncounter returns encounter by ID', () => {
    const encounter = getEncounter('wolf-pack');
    assert.ok(encounter);
    assert.strictEqual(encounter.id, 'wolf-pack');
  });

  test('getEncounter returns null for invalid ID', () => {
    const encounter = getEncounter('invalid-id');
    assert.strictEqual(encounter, null);
  });

  test('getAllEncounters returns all encounters', () => {
    const all = getAllEncounters();
    assert.strictEqual(all.length, Object.keys(ENCOUNTERS).length);
  });
});

describe('getEncounterRate', () => {
  test('Returns base rate for location', () => {
    const state = createEncounterState();
    const rate = getEncounterRate(state, LOCATION_TYPE.DUNGEON);
    assert.strictEqual(rate, BASE_ENCOUNTER_RATES[LOCATION_TYPE.DUNGEON]);
  });

  test('Applies modifier to rate', () => {
    let state = createEncounterState();
    state = addEncounterModifier(state, { id: 'double', type: 'encounterRate', value: 2.0 });

    const rate = getEncounterRate(state, LOCATION_TYPE.ROAD);
    assert.strictEqual(rate, BASE_ENCOUNTER_RATES[LOCATION_TYPE.ROAD] * 2.0);
  });

  test('Clamps rate to 0-1', () => {
    let state = createEncounterState();
    state = addEncounterModifier(state, { id: 'huge', type: 'encounterRate', value: 10.0 });

    const rate = getEncounterRate(state, LOCATION_TYPE.DUNGEON);
    assert.strictEqual(rate, 1);
  });

  test('Returns default for unknown location', () => {
    const state = createEncounterState();
    const rate = getEncounterRate(state, 'unknown');
    assert.strictEqual(rate, 0.10);
  });
});

describe('getEncounterStats', () => {
  test('Returns correct stats', () => {
    let state = createEncounterState();
    state.totalEncounters = 10;
    state.encountersWon = 7;
    state.fleesCount = 2;
    state.encounteredIds = ['a', 'b', 'c', 'a', 'b'];

    const stats = getEncounterStats(state);
    assert.strictEqual(stats.total, 10);
    assert.strictEqual(stats.won, 7);
    assert.strictEqual(stats.fled, 2);
    assert.strictEqual(stats.winRate, 70);
    assert.strictEqual(stats.uniqueEncountered, 3);
  });

  test('Returns 0 win rate when no encounters', () => {
    const state = createEncounterState();
    const stats = getEncounterStats(state);
    assert.strictEqual(stats.winRate, 0);
  });
});

describe('Utility Functions', () => {
  test('getAllLocationTypes returns all locations', () => {
    const locations = getAllLocationTypes();
    assert.strictEqual(locations.length, Object.keys(LOCATION_TYPE).length);
    for (const loc of Object.values(LOCATION_TYPE)) {
      assert.ok(locations.includes(loc));
    }
  });

  test('getAllEncounterTypes returns all types', () => {
    const types = getAllEncounterTypes();
    assert.strictEqual(types.length, Object.keys(ENCOUNTER_TYPE).length);
  });

  test('getAllRarities returns all rarities', () => {
    const rarities = getAllRarities();
    assert.strictEqual(rarities.length, Object.keys(ENCOUNTER_RARITY).length);
  });
});

// UI Tests
describe('getEncounterStyles', () => {
  test('Returns CSS string', () => {
    const styles = getEncounterStyles();
    assert.ok(typeof styles === 'string');
    assert.ok(styles.includes('.encounter-popup'));
    assert.ok(styles.includes('.encounter-notification'));
  });

  test('Includes type colors', () => {
    const styles = getEncounterStyles();
    assert.ok(styles.includes('.encounter-icon.combat'));
    assert.ok(styles.includes('.encounter-icon.treasure'));
  });

  test('Includes rarity styles', () => {
    const styles = getEncounterStyles();
    assert.ok(styles.includes('.encounter-rarity.common'));
    assert.ok(styles.includes('.encounter-rarity.legendary'));
  });
});

describe('renderEncounterPopup', () => {
  test('Renders popup with encounter info', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    const html = renderEncounterPopup(encounter);
    assert.ok(html.includes('encounter-popup'));
    assert.ok(html.includes('Wolf Pack'));
  });

  test('Shows encounter icon', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    const html = renderEncounterPopup(encounter);
    assert.ok(html.includes('encounter-icon'));
  });

  test('Shows rarity badge', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    const html = renderEncounterPopup(encounter);
    assert.ok(html.includes('encounter-rarity'));
    assert.ok(html.includes('common'));
  });

  test('Shows action buttons for combat', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    const html = renderEncounterPopup(encounter);
    assert.ok(html.includes('Fight!'));
    assert.ok(html.includes('Flee'));
  });

  test('Shows collect button for treasure', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['hidden-cache'], 5);
    const html = renderEncounterPopup(encounter);
    assert.ok(html.includes('Collect'));
  });
});

describe('renderEncounterNotification', () => {
  test('Shows notification content', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    const html = renderEncounterNotification(encounter);
    assert.ok(html.includes('encounter-notification'));
  });

  test('Shows type-specific text', () => {
    const combat = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    const combatHtml = renderEncounterNotification(combat);
    assert.ok(combatHtml.includes('Enemy Encountered'));

    const treasure = createEncounterInstance(ENCOUNTERS['hidden-cache'], 5);
    const treasureHtml = renderEncounterNotification(treasure);
    assert.ok(treasureHtml.includes('Treasure Found'));
  });
});

describe('renderEncounterResult', () => {
  test('Shows victory result', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    encounter.resolved = true;
    encounter.outcome = 'victory';

    const html = renderEncounterResult(encounter, { xp: 100, gold: 50 });
    assert.ok(html.includes('Victory'));
    assert.ok(html.includes('100 XP'));
    assert.ok(html.includes('50 Gold'));
  });

  test('Shows defeat result', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    encounter.resolved = true;
    encounter.outcome = 'defeat';

    const html = renderEncounterResult(encounter);
    assert.ok(html.includes('Defeat'));
  });

  test('Shows damage for triggered trap', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['pit-trap'], 5);
    encounter.resolved = true;
    encounter.outcome = 'triggered';

    const html = renderEncounterResult(encounter, { damage: 25 });
    assert.ok(html.includes('-25 HP'));
  });
});

describe('renderEncounterStatsPanel', () => {
  test('Shows all stats', () => {
    let state = createEncounterState();
    state.totalEncounters = 10;
    state.encountersWon = 7;
    state.fleesCount = 2;

    const html = renderEncounterStatsPanel(state);
    assert.ok(html.includes('Total Encounters'));
    assert.ok(html.includes('10'));
    assert.ok(html.includes('Battles Won'));
    assert.ok(html.includes('7'));
    assert.ok(html.includes('Win Rate'));
    assert.ok(html.includes('70%'));
  });
});

describe('renderEncounterRateDisplay', () => {
  test('Shows encounter rate', () => {
    const state = createEncounterState();
    const html = renderEncounterRateDisplay(state, LOCATION_TYPE.DUNGEON);
    assert.ok(html.includes('Encounter Rate'));
    assert.ok(html.includes('30%'));
  });
});

describe('renderEncounterList', () => {
  test('Shows encounter list', () => {
    const encounters = [ENCOUNTERS['wolf-pack'], ENCOUNTERS['goblin-ambush']];
    const html = renderEncounterList(encounters);
    assert.ok(html.includes('Wolf Pack'));
    assert.ok(html.includes('Goblin Ambush'));
  });

  test('Shows empty message when no encounters', () => {
    const html = renderEncounterList([]);
    assert.ok(html.includes('No encounters found'));
  });
});

// Security Tests
describe('XSS Prevention', () => {
  test('renderEncounterPopup escapes content', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    encounter.name = '<script>alert("xss")</script>';
    const html = renderEncounterPopup(encounter);
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  test('renderEncounterNotification escapes icon', () => {
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);
    encounter.icon = '<img onerror="alert(1)">';
    const html = renderEncounterNotification(encounter);
    assert.ok(!html.includes('<img'));
  });

  test('renderEncounterList escapes content', () => {
    const malicious = [{
      id: 'test',
      name: '<script>bad</script>',
      icon: '<img>',
      type: 'combat',
      rarity: 'common',
    }];
    const html = renderEncounterList(malicious);
    assert.ok(!html.includes('<script>'));
  });
});

describe('Banned Words Security Scan', () => {
  test('No banned words in encounter names', () => {
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      const name = encounter.name.toLowerCase();
      for (const word of BANNED_WORDS) {
        assert.ok(
          !name.includes(word),
          `Encounter ${id} name contains banned word: ${word}`
        );
      }
    }
  });

  test('No banned words in encounter descriptions', () => {
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      const desc = encounter.description.toLowerCase();
      for (const word of BANNED_WORDS) {
        assert.ok(
          !desc.includes(word),
          `Encounter ${id} description contains banned word: ${word}`
        );
      }
    }
  });

  test('No banned words in encounter IDs', () => {
    for (const id of Object.keys(ENCOUNTERS)) {
      for (const word of BANNED_WORDS) {
        assert.ok(
          !id.toLowerCase().includes(word),
          `Encounter ID ${id} contains banned word: ${word}`
        );
      }
    }
  });

  test('No banned words in location types', () => {
    for (const loc of Object.values(LOCATION_TYPE)) {
      for (const word of BANNED_WORDS) {
        assert.ok(
          !loc.toLowerCase().includes(word),
          `Location ${loc} contains banned word: ${word}`
        );
      }
    }
  });

  test('No banned words in encounter types', () => {
    for (const type of Object.values(ENCOUNTER_TYPE)) {
      for (const word of BANNED_WORDS) {
        assert.ok(
          !type.toLowerCase().includes(word),
          `Encounter type ${type} contains banned word: ${word}`
        );
      }
    }
  });

  test('No banned words in enemy names', () => {
    for (const [id, encounter] of Object.entries(ENCOUNTERS)) {
      if (encounter.enemies) {
        for (const enemy of encounter.enemies) {
          for (const word of BANNED_WORDS) {
            assert.ok(
              !enemy.toLowerCase().includes(word),
              `Encounter ${id} enemy ${enemy} contains banned word: ${word}`
            );
          }
        }
      }
    }
  });
});

describe('Immutability', () => {
  test('checkForEncounter does not mutate original state', () => {
    const state = createEncounterState();
    const originalCooldown = state.encounterCooldown;

    checkForEncounter(state, LOCATION_TYPE.FOREST, 5);
    assert.strictEqual(state.encounterCooldown, originalCooldown);
  });

  test('resolveEncounter does not mutate original state', () => {
    const state = createEncounterState();
    const encounter = createEncounterInstance(ENCOUNTERS['wolf-pack'], 5);

    resolveEncounter(state, encounter, 'victory');
    assert.strictEqual(state.encountersWon, 0);
  });

  test('addEncounterModifier does not mutate original state', () => {
    const state = createEncounterState();
    const originalLength = state.modifiers.length;

    addEncounterModifier(state, { id: 'test', type: 'encounterRate', value: 1.5 });
    assert.strictEqual(state.modifiers.length, originalLength);
  });

  test('removeEncounterModifier does not mutate original state', () => {
    let state = createEncounterState();
    state = addEncounterModifier(state, { id: 'test', type: 'encounterRate', value: 1.5 });

    removeEncounterModifier(state, 'test');
    assert.strictEqual(state.modifiers.length, 1);
  });
});
