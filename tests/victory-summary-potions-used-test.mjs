/**
 * Guard test: Victory Summary 'Potions Used' must read ONLY combatStats.potionCount
 * and must NOT infer from itemUses['potion'].
 */

import {
  createCombatStats,
  recordItemUse,
  recordPotionUse,
  finalizeCombatStats,
  formatCombatStatsDisplay,
} from '../src/combat-stats-tracker.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) passed += 1; else { failed += 1; console.error('FAIL:', msg); }
}

function getActionsRowValue(display, label) {
  const actions = display.sections.find((s) => s?.type === 'stats' && s.title === 'Actions');
  if (!actions) return null;
  const row = actions.rows.find((r) => r?.label === label);
  return row ? row.value : null;
}

// Positive guard: potionCount=1, itemUses.potion=4 → display shows 1
{
  let s = createCombatStats('Slime');
  // Intentionally inflate generic itemUses for 'potion' to simulate potential confusion
  s = recordItemUse(s, 'potion', 0);
  s = recordItemUse(s, 'potion', 0);
  s = recordItemUse(s, 'potion', 0);
  s = recordItemUse(s, 'potion', 0);
  // Actual potion counter should be incremented exactly once
  s = recordPotionUse(s, 15);
  s = finalizeCombatStats(s, 'victory', 20, 30);

  const display = formatCombatStatsDisplay(s);
  const value = getActionsRowValue(display, 'Potions Used');
  assert(value === '1', `Potions Used should read combatStats.potionCount (1), got ${value}`);
}

// Negative guard: potionCount=0, itemUses.potion=3 → display shows 0
{
  let s = createCombatStats('Bat');
  // Only itemUses increments, no recordPotionUse
  s = recordItemUse(s, 'potion', 0);
  s = recordItemUse(s, 'potion', 0);
  s = recordItemUse(s, 'potion', 0);
  s = finalizeCombatStats(s, 'victory', 10, 25);

  const display = formatCombatStatsDisplay(s);
  const value = getActionsRowValue(display, 'Potions Used');
  assert(value === '0', `Potions Used should ignore itemUses map and show 0 when potionCount=0, got ${value}`);
}

console.log(`\nVictory Summary Potions Used Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
