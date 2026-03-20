/**
 * Rending Claws Status Effect Test - AI Village RPG
 * Verifies that executing rending-claws applies Bleed to the player.
 * Run: node tests/rending-claws-test.mjs
 */

import { executeEnemyAbility } from '../src/enemy-abilities.js';
import { initialStateWithClass } from '../src/state.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log('  PASS: ' + msg);
  } else {
    failed++;
    console.error('  FAIL: ' + msg);
  }
}

// Build a minimal combat state where a goblin uses rending-claws
function makeRendingClawsState(rngSeed = 12345) {
  const base = initialStateWithClass('warrior');
  return {
    ...base,
    phase: 'enemy-turn',
    turn: 1,
    rngSeed,
    log: [],
    player: {
      ...base.player,
      hp: 40,
      maxHp: 40,
      def: 4,
      atk: 9,
      defending: false,
      statusEffects: [],
      mp: 15,
      maxMp: 15,
    },
    enemy: {
      id: 'goblin',
      name: 'Goblin',
      hp: 18,
      maxHp: 18,
      atk: 7,
      def: 2,
      mp: 5,
      maxMp: 5,
      spd: 6,
      abilities: ['rending-claws'],
      element: 'physical',
      aiBehavior: 'basic',
      xpReward: 6,
      goldReward: 4,
      defending: false,
      statusEffects: [],
    },
  };
}

console.log('\n--- rending-claws applies bleed ---');

{
  const state = makeRendingClawsState();
  const result = executeEnemyAbility(state, 'rending-claws');
  const hasBleed = (result.player.statusEffects ?? []).some((e) => e.type === 'bleed');
  assert(hasBleed, 'rending-claws adds Bleed to player statusEffects');
  console.log('  Log entries:', result.log);
  console.log('  Player status effects:', result.player.statusEffects);
}

console.log(`\nRending Claws Test: ${passed} passed, ${failed} failed.`);
process.exitCode = failed > 0 ? 1 : 0;
