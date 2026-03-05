/**
 * Input Tests — AI Village RPG
 * Run: node tests/input-test.mjs
 */

import { keyToCardinalDirection } from '../src/input.js';

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

console.log('\n--- keyToCardinalDirection ---');
{
  assert(keyToCardinalDirection('w') === 'north', "'w' => north");
  assert(keyToCardinalDirection('W') === 'north', "'W' => north");
  assert(keyToCardinalDirection('ArrowUp') === 'north', "'ArrowUp' => north");

  assert(keyToCardinalDirection('s') === 'south', "'s' => south");
  assert(keyToCardinalDirection('S') === 'south', "'S' => south");
  assert(keyToCardinalDirection('ArrowDown') === 'south', "'ArrowDown' => south");

  assert(keyToCardinalDirection('a') === 'west', "'a' => west");
  assert(keyToCardinalDirection('A') === 'west', "'A' => west");
  assert(keyToCardinalDirection('ArrowLeft') === 'west', "'ArrowLeft' => west");

  assert(keyToCardinalDirection('d') === 'east', "'d' => east");
  assert(keyToCardinalDirection('D') === 'east', "'D' => east");
  assert(keyToCardinalDirection('ArrowRight') === 'east', "'ArrowRight' => east");
}

console.log('\n--- Unknown / invalid keys ---');
{
  assert(keyToCardinalDirection(' ') === null, 'space => null');
  assert(keyToCardinalDirection('Enter') === null, 'Enter => null');
  assert(keyToCardinalDirection('up') === null, "'up' => null (avoid non-cardinal strings)");
  assert(keyToCardinalDirection('north') === null, "'north' => null (expects event.key)");

  assert(keyToCardinalDirection(null) === null, 'null => null');
  assert(keyToCardinalDirection(undefined) === null, 'undefined => null');
  assert(keyToCardinalDirection({ key: 'w' }) === null, 'object => null');
}

console.log('\n========================================');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');

if (failed > 0) process.exit(1);
