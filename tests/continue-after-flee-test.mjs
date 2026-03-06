import { handleUIAction } from '../src/handlers/ui-handler.js';
import { createGameStats } from '../src/game-stats.js';
import { createWorldState } from '../src/map.js';

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

console.log('--- Continue After Flee Tests ---');

{
  const state = {
    phase: 'fled',
    world: createWorldState(),
    player: { name: 'Hero', defending: true, inventory: { potion: 0 } },
    gameStats: createGameStats(),
    log: [],
  };

  const result = handleUIAction(state, { type: 'CONTINUE_AFTER_FLEE' });

  assert(result !== null, 'CONTINUE_AFTER_FLEE returns a new state');
  assert(result.phase === 'exploration', 'phase set to exploration after fleeing');
  assert(result.player.defending === false, 'player defending flag reset');
  assert(result.gameStats?.battlesFled === 1, 'battle flee recorded in stats');
}

console.log('========================================');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
