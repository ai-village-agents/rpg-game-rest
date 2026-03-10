# Combat Stats Tracker API Reference

> Complete API documentation for the combat statistics tracking system.  
> **Module:** `src/combat-stats-tracker.js` (471 lines)  
> **Tests:** `tests/combat-stats-tracker-test.mjs` (62+ tests)  
> **Author:** Claude Opus 4.6 (PR #244)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Data Structure](#data-structure)
4. [Core Functions](#core-functions)
5. [Recording Functions](#recording-functions)
6. [Finalization Functions](#finalization-functions)
7. [Integration Guide](#integration-guide)
8. [Best Practices](#best-practices)

---

## Overview

The Combat Stats Tracker records detailed statistics during each combat encounter, including:

- **Damage Metrics:** Total dealt/received, max single hit, healing done
- **Action Counts:** Attacks, defends, abilities, items, potions, flee attempts
- **Shield/Break Stats:** Shields destroyed, break triggers, break damage bonus
- **Companion Stats:** Companion damage, abilities, and healing
- **Status Effects:** Effects inflicted on enemies and received by player
- **Turn Tracking:** Total turns, player turns, enemy turns
- **Timing:** Combat duration from start to finish
- **Outcome:** Victory, defeat, or fled

### Use Cases

1. **Post-Combat Summary:** Display detailed battle statistics to players
2. **Achievement Tracking:** Track milestones like "Deal 1000 damage in one battle"
3. **Analytics:** Understand player behavior and balance combat difficulty
4. **Save/Load:** Persist combat history for session continuity

---

## Quick Start

```javascript
import {
  createCombatStats,
  recordPlayerAttack,
  recordAbilityUse,
  recordDamageReceived,
  recordTurn,
  finalizeCombatStats,
  formatCombatStatsDisplay
} from './combat-stats-tracker.js';

// 1. Initialize at combat start
const stats = createCombatStats('Giant Spider', false);

// 2. Record actions during combat
recordPlayerAttack(stats, 45);
recordTurn(stats, 'player');
recordDamageReceived(stats, 20);
recordTurn(stats, 'enemy');
recordAbilityUse(stats, 'Fireball', 80, 0);
recordTurn(stats, 'player');

// 3. Finalize at combat end
finalizeCombatStats(stats, 'victory', 75, 100);

// 4. Display to player
const display = formatCombatStatsDisplay(stats);
console.log(display.sections);
```

---

## Data Structure

### CombatStats Object

```javascript
{
  // Identification
  enemyName: string,        // "Giant Spider"
  isBoss: boolean,          // false for regular, true for bosses
  
  // Timing
  startTime: number,        // Date.now() at combat start
  endTime: number | null,   // Date.now() at combat end
  
  // Turn Tracking
  turnsTotal: number,       // Total turns elapsed
  playerTurns: number,      // Player's turn count
  enemyTurns: number,       // Enemy's turn count
  
  // Damage Metrics
  totalDamageDealt: number,      // Cumulative damage to enemy
  totalDamageReceived: number,   // Cumulative damage from enemy
  maxSingleHit: number,          // Highest single damage instance
  maxSingleHitAbility: string,   // Ability that dealt max damage
  totalHealingDone: number,      // Total HP restored
  
  // Action Counts
  attackCount: number,      // Basic attacks used
  defendCount: number,      // Defend actions used
  abilityUses: object,      // { 'Fireball': 3, 'Heal': 2 }
  itemUses: object,         // { 'Potion': 2, 'Bomb': 1 }
  potionCount: number,      // Legacy potion tracking
  fleeAttempts: number,     // Times player tried to flee
  
  // Shield/Break System
  shieldsDestroyed: number,   // Enemy shields broken
  timesEnemyBroken: number,   // Times enemy entered BREAK state
  breakDamageDealt: number,   // Damage dealt during BREAK state
  
  // Companion Tracking
  companionDamageDealt: number,  // Damage from companions
  companionAbilityUses: number,  // Companion ability count
  companionHealing: number,      // Healing from companions
  
  // Status Effects
  statusEffectsInflicted: string[],  // ['poison', 'burn']
  statusEffectsReceived: string[],   // ['stun', 'sleep']
  
  // Outcome
  outcome: string | null,    // 'victory', 'defeat', 'fled', null
  finalPlayerHp: number,     // HP at combat end
  finalPlayerMaxHp: number,  // Max HP at combat end
}
```

---

## Core Functions

### createCombatStats(enemyName, isBoss)

Creates a fresh combat stats object for a new encounter.

**Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enemyName` | string | 'Unknown' | Name of the enemy being fought |
| `isBoss` | boolean | false | Whether this is a boss encounter |

**Returns:** `CombatStats` - Initial combat stats object

**Example:**
```javascript
// Regular enemy
const stats = createCombatStats('Goblin Warrior', false);

// Boss encounter
const bossStats = createCombatStats('Dragon Lord Verath', true);
```

**Notes:**
- Sets `startTime` to `Date.now()` automatically
- All counters initialized to 0
- All arrays initialized to empty `[]`
- All objects initialized to empty `{}`

---

## Recording Functions

### recordPlayerAttack(stats, damage)

Records a basic attack action.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object to update |
| `damage` | number | Damage dealt by the attack |

**Returns:** `CombatStats` - Updated stats object

**Side Effects:**
- Increments `attackCount`
- Adds to `totalDamageDealt`
- Updates `maxSingleHit` and `maxSingleHitAbility` if applicable

**Example:**
```javascript
recordPlayerAttack(stats, 45);
// stats.attackCount: 1
// stats.totalDamageDealt: 45
// stats.maxSingleHit: 45
// stats.maxSingleHitAbility: 'Basic Attack'
```

---

### recordPlayerDefend(stats)

Records a defend action.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object to update |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordPlayerDefend(stats);
// stats.defendCount: 1
```

---

### recordAbilityUse(stats, abilityName, damage, healing)

Records player ability use.

**Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | CombatStats | - | Combat stats object |
| `abilityName` | string | 'Unknown Ability' | Name of ability used |
| `damage` | number | 0 | Damage dealt (0 if healing/buff) |
| `healing` | number | 0 | Healing done (0 if damaging) |

**Returns:** `CombatStats` - Updated stats object

**Side Effects:**
- Adds/increments entry in `abilityUses` object
- Adds to `totalDamageDealt` if damage > 0
- Adds to `totalHealingDone` if healing > 0
- Updates `maxSingleHit` if damage exceeds current max

**Example:**
```javascript
// Damaging ability
recordAbilityUse(stats, 'Fireball', 120, 0);
// stats.abilityUses: { 'Fireball': 1 }
// stats.totalDamageDealt: 120
// stats.maxSingleHit: 120
// stats.maxSingleHitAbility: 'Fireball'

// Healing ability
recordAbilityUse(stats, 'Heal', 0, 50);
// stats.abilityUses: { 'Fireball': 1, 'Heal': 1 }
// stats.totalHealingDone: 50
```

---

### recordItemUse(stats, itemName, healing)

Records item usage during combat.

**Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | CombatStats | - | Combat stats object |
| `itemName` | string | 'Unknown Item' | Name of item used |
| `healing` | number | 0 | Healing provided by item |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordItemUse(stats, 'Health Potion', 50);
// stats.itemUses: { 'Health Potion': 1 }
// stats.totalHealingDone: 50
```

---

### recordPotionUse(stats, healing)

Records potion usage (legacy function for backwards compatibility).

**Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | CombatStats | - | Combat stats object |
| `healing` | number | 0 | Healing from potion |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordPotionUse(stats, 30);
// stats.potionCount: 1
// stats.totalHealingDone: 30
```

---

### recordDamageReceived(stats, damage)

Records damage taken by the player.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |
| `damage` | number | Damage received |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordDamageReceived(stats, 35);
// stats.totalDamageReceived: 35
```

---

### recordShieldDestroyed(stats)

Records destroying an enemy shield point.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordShieldDestroyed(stats);
recordShieldDestroyed(stats);
// stats.shieldsDestroyed: 2
```

---

### recordEnemyBroken(stats)

Records triggering enemy BREAK state.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordEnemyBroken(stats);
// stats.timesEnemyBroken: 1
```

---

### recordBreakDamage(stats, damage)

Records damage dealt while enemy is in BREAK state.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |
| `damage` | number | Damage dealt during BREAK |

**Returns:** `CombatStats` - Updated stats object

**Note:** This damage should ALSO be recorded via `recordPlayerAttack` or `recordAbilityUse`. This function tracks the bonus damage specifically dealt during BREAK state for analytics.

**Example:**
```javascript
// Player deals 90 damage during BREAK (60 base * 1.5 multiplier)
recordAbilityUse(stats, 'Heavy Strike', 90, 0);
recordBreakDamage(stats, 90);
// stats.totalDamageDealt: 90
// stats.breakDamageDealt: 90
```

---

### recordFleeAttempt(stats)

Records a flee attempt by the player.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordFleeAttempt(stats);
recordFleeAttempt(stats);
// stats.fleeAttempts: 2
```

---

### recordCompanionAction(stats, damage, healing)

Records companion actions during combat.

**Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | CombatStats | - | Combat stats object |
| `damage` | number | 0 | Damage dealt by companion |
| `healing` | number | 0 | Healing done by companion |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordCompanionAction(stats, 30, 0);  // Companion attacks
recordCompanionAction(stats, 0, 25);  // Companion heals
// stats.companionDamageDealt: 30
// stats.companionHealing: 25
// stats.companionAbilityUses: 2
```

---

### recordStatusInflicted(stats, effectName)

Records a status effect inflicted on the enemy.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |
| `effectName` | string | Name of the status effect |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordStatusInflicted(stats, 'poison');
recordStatusInflicted(stats, 'burn');
// stats.statusEffectsInflicted: ['poison', 'burn']
```

---

### recordStatusReceived(stats, effectName)

Records a status effect received by the player.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |
| `effectName` | string | Name of the status effect |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordStatusReceived(stats, 'stun');
// stats.statusEffectsReceived: ['stun']
```

---

### recordTurn(stats, turnType)

Records a combat turn.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |
| `turnType` | string | 'player' or 'enemy' |

**Returns:** `CombatStats` - Updated stats object

**Example:**
```javascript
recordTurn(stats, 'player');
recordTurn(stats, 'enemy');
recordTurn(stats, 'player');
// stats.turnsTotal: 3
// stats.playerTurns: 2
// stats.enemyTurns: 1
```

---

## Finalization Functions

### finalizeCombatStats(stats, outcome, playerHp, playerMaxHp)

Marks combat as complete and records final state.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Combat stats object |
| `outcome` | string | 'victory', 'defeat', or 'fled' |
| `playerHp` | number | Player's HP at combat end |
| `playerMaxHp` | number | Player's max HP |

**Returns:** `CombatStats` - Finalized stats object

**Side Effects:**
- Sets `endTime` to `Date.now()`
- Sets `outcome`, `finalPlayerHp`, `finalPlayerMaxHp`

**Example:**
```javascript
finalizeCombatStats(stats, 'victory', 45, 100);
// stats.outcome: 'victory'
// stats.endTime: 1678234567890
// stats.finalPlayerHp: 45
// stats.finalPlayerMaxHp: 100
```

---

### computeDerivedStats(stats)

Calculate derived statistics from raw combat data.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Finalized combat stats |

**Returns:** `object` - Computed statistics

**Derived Values:**
```javascript
{
  durationSec: number,           // Combat duration in seconds
  totalActions: number,          // Sum of all player actions
  avgDamagePerTurn: number,      // Damage dealt / player turns
  avgDamageReceivedPerTurn: number,  // Damage received / enemy turns
  netDamage: number,             // Damage dealt - received
  damageEfficiency: number,      // Ratio of dealt to received
  healingEfficiency: number,     // Healing / damage received
  mostUsedAbility: string,       // Ability with highest use count
  mostUsedAbilityCount: number,  // How many times it was used
  healthPercentRemaining: number,// Final HP as percentage
  rating: string,                // 'S', 'A', 'B', 'C', 'D', 'F'
}
```

**Rating System:**
- **S:** Victory + >80% HP + efficiency >3 + max hit >100
- **A:** Victory + >60% HP + efficiency >2
- **B:** Victory + >40% HP + efficiency >1
- **C:** Victory + >20% HP
- **D:** Victory with <20% HP or fled
- **F:** Defeat

**Example:**
```javascript
const derived = computeDerivedStats(stats);
console.log(derived.rating);  // 'A'
console.log(derived.avgDamagePerTurn);  // 52
```

---

### formatCombatStatsDisplay(stats)

Generates structured data for UI rendering.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `stats` | CombatStats | Finalized combat stats |

**Returns:** `object` - Display-ready sections

**Structure:**
```javascript
{
  sections: [
    {
      type: 'header',
      title: 'Boss Battle Complete!' | 'Battle Complete!',
      subtitle: 'vs Giant Spider',
      rating: 'A',
      outcome: 'victory'
    },
    {
      type: 'stats',
      title: 'Combat Overview',
      rows: [
        { label: 'Turns', value: '8' },
        { label: 'Duration', value: '45s' },
        { label: 'Damage Dealt', value: '523', style: 'good' },
        { label: 'Damage Received', value: '127', style: 'bad' },
        // ...more rows
      ]
    },
    {
      type: 'abilities',
      title: 'Abilities Used',
      items: [
        { name: 'Fireball', count: 3 },
        { name: 'Heal', count: 2 }
      ]
    },
    {
      type: 'shield',
      title: 'Shield Break Performance',
      rows: [
        { label: 'Shields Destroyed', value: '4' },
        { label: 'Times Broken', value: '1' },
        { label: 'Break Damage', value: '180' }
      ]
    }
  ]
}
```

---

## Integration Guide

### Integration with Combat System

The combat stats tracker should be integrated at key points in `combat.js` and `combat-handler.js`:

```javascript
// combat.js - playerAttack function
export function playerAttack(state) {
  const damage = calculateDamage(state.player, state.enemy);
  
  // Record the attack
  if (state.combatStats) {
    recordPlayerAttack(state.combatStats, damage);
    recordTurn(state.combatStats, 'player');
  }
  
  // ... rest of attack logic
}

// combat.js - enemyAct function
export function enemyAct(state) {
  const damage = calculateEnemyDamage(state.enemy, state.player);
  
  // Record damage received
  if (state.combatStats) {
    recordDamageReceived(state.combatStats, damage);
    recordTurn(state.combatStats, 'enemy');
  }
  
  // ... rest of enemy logic
}

// combat-handler.js - combat end
function handleCombatEnd(state, outcome) {
  if (state.combatStats) {
    finalizeCombatStats(
      state.combatStats,
      outcome,
      state.player.hp,
      state.player.maxHp
    );
  }
  
  // Show battle summary
  const display = formatCombatStatsDisplay(state.combatStats);
  // ... render display
}
```

### Integration with Shield/Break System

```javascript
// When shield is destroyed
if (shieldsRemaining === 0 && state.combatStats) {
  recordShieldDestroyed(state.combatStats);
}

// When enemy enters BREAK state
if (triggeredBreak && state.combatStats) {
  recordEnemyBroken(state.combatStats);
}

// When dealing damage during BREAK
if (enemy.breakState?.isBroken && state.combatStats) {
  recordBreakDamage(state.combatStats, damage);
}
```

### Integration with State Management

```javascript
// In state initialization for combat
function initializeCombat(state, enemy) {
  return {
    ...state,
    phase: 'combat',
    enemy: enemy,
    combatStats: createCombatStats(enemy.name, enemy.isBoss || false)
  };
}
```

---

## Best Practices

### 1. Always Initialize Before Combat

```javascript
// Good
state.combatStats = createCombatStats(enemy.name, enemy.isBoss);

// Bad - will cause null reference errors
recordPlayerAttack(state.combatStats, 50); // stats is undefined!
```

### 2. Handle Null Stats Gracefully

All recording functions return early if stats is null:
```javascript
// Safe - functions handle null gracefully
recordPlayerAttack(null, 50);  // Returns null, no error
```

### 3. Record Actions Atomically

Record each action as it happens, not in batches:
```javascript
// Good - record immediately after action
player.hp -= damage;
recordDamageReceived(stats, damage);

// Bad - recording after multiple actions
player.hp -= damage1;
player.hp -= damage2;
recordDamageReceived(stats, damage1 + damage2);  // Loses granularity
```

### 4. Finalize Before Display

Always call `finalizeCombatStats` before `formatCombatStatsDisplay`:
```javascript
// Good
finalizeCombatStats(stats, 'victory', player.hp, player.maxHp);
const display = formatCombatStatsDisplay(stats);

// Bad - derived stats may be incorrect
const display = formatCombatStatsDisplay(stats);  // endTime is null!
```

### 5. Don't Modify Stats Object Directly

Use the provided recording functions:
```javascript
// Good
recordPlayerAttack(stats, 50);

// Bad - bypasses tracking logic
stats.totalDamageDealt += 50;
stats.attackCount++;  // maxSingleHit not updated!
```

---

## Related Documentation

- [Shield/Break System](./shield-break-system.md) - Core shield/break mechanics
- [Shield/Break API Contract](./shield-break-api-contract.md) - Function signatures
- [Battle Summary Display](./battle-summary-display.md) - UI rendering (PR #246)
- [Combat System](./combat-system.md) - Core combat mechanics

---

*Documentation written by Claude Opus 4.5 from #voted-out on Day 343*
