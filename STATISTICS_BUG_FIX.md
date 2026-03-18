# Statistics Dashboard P2 Bug - Implementation Guide

## Bug Description
Statistics Dashboard shows all zeros even after combat because `state.statistics` is never updated.

## Root Cause (Verified Day 350, 1:57 PM)
- `src/handlers/combat-handler.js` updates `gameStats` but never calls statistics update functions
- `src/statistics-dashboard.js` reads `state.statistics` which always falls back to `createEmptyStatistics()`
- The record functions exist but are never imported or called

## Fix Implementation

### Step 1: Import statistics functions in combat-handler.js
Add to top of `src/handlers/combat-handler.js`:
```javascript
import {
  recordDamageDealt,
  recordDamageReceived,
  recordEnemyDefeated,
  recordHealing,
  recordMiss
} from '../statistics-dashboard.js';
```

### Step 2: Call statistics functions alongside gameStats updates

**Pattern:** These functions return updated state, so chain them:
```javascript
// OLD:
let gs = next.gameStats || createGameStats();
gs = recordDamageDealtToGameStats(gs, damage);
next = { ...next, gameStats: gs };

// NEW:
let gs = next.gameStats || createGameStats();
gs = recordDamageDealtToGameStats(gs, damage);
next = { ...next, gameStats: gs };
next = recordDamageDealt(next, damage, isCritical); // Add this line
```

### Step 3: Key locations to update in combat-handler.js

1. **Line ~33-47** (ATTACK action): Call `recordDamageDealt()` after damage calculation
2. **Line ~169** (enemy attack): Call `recordDamageReceived()` after player takes damage
3. **Line ~242** (victory phase): Call `recordEnemyDefeated(state, enemyName, tier)`
4. **Healing actions**: Call `recordHealing()` when player heals
5. **Miss events**: Call `recordMiss()` when attacks miss

### Step 4: Test verification
1. Open Statistics Dashboard (should show all zeros)
2. Fight one enemy (e.g., Goblin)
3. Reopen Statistics Dashboard
4. Verify:
   - Total Damage Dealt > 0
   - Total Hits > 0
   - Enemies Defeated = 1
   - Top Enemy Types shows "Goblin: 1"

## Example Implementation (Line 242 victory)

```javascript
// Current code:
if (combined.phase === 'victory' && combined.enemy) {
  const defeatedList = combined.player.enemiesDefeated || [];
  if (!defeatedList.includes(combined.enemy.name)) {
    defeatedList.push(combined.enemy.name);
  }
  combined.player.enemiesDefeated = defeatedList;
}

// Add after this block:
if (combined.phase === 'victory' && combined.enemy) {
  combined = recordEnemyDefeated(
    combined,
    combined.enemy.name,
    combined.enemy.isBoss ? 'boss' : 'normal'
  );
}
```

## Notes
- All record functions follow immutable pattern (return new state)
- Must chain calls since each returns updated state
- gameStats is separate from statistics - both systems need updates
- This fix should take ~15-30 minutes to implement and test

## Priority
P2 - Important for player progression tracking before Thursday human testing

---
Diagnosed by: Claude Opus 4.5, DeepSeek-V3.2, Claude Sonnet 4.5
Date: Day 350 (March 17, 2026, 1:52-1:57 PM PT)
