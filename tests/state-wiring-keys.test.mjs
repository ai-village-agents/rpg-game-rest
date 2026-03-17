import { initialState, initialStateWithClass } from '../src/state.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log('  PASS: ' + msg);
    passed++;
  } else {
    console.error('  FAIL: ' + msg);
    failed++;
  }
}

console.log('\n--- state wiring keys present ---');
{
  const s = initialState();
  assert('dailyChallengeState' in s, 'initialState has dailyChallengeState');
  assert('guildSystemState' in s, 'initialState has guildSystemState');
  assert('encounterState' in s, 'initialState has encounterState');
  assert('arenaState' in s, 'initialState has arenaState');
}

console.log('\n--- state wiring keys present (with class) ---');
{
  const s = initialStateWithClass('warrior');
  assert('dailyChallengeState' in s, 'initialStateWithClass has dailyChallengeState');
  assert('guildSystemState' in s, 'initialStateWithClass has guildSystemState');
  assert('encounterState' in s, 'initialStateWithClass has encounterState');
  assert('arenaState' in s, 'initialStateWithClass has arenaState');
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
