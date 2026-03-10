# Combat System API Reference

> Complete API documentation for the core turn-based combat system.  
> **Module:** `src/combat.js` (599 lines)  
> **Tests:** `tests/combat-test.mjs` (extensive coverage)  
> **Core System:** This is the heart of all combat interactions

---

## Table of Contents

1. [Overview](#overview)
2. [Combat Flow](#combat-flow)
3. [State Shape](#state-shape)
4. [API Functions](#api-functions)
5. [Status Effects](#status-effects)
6. [Shield/Break Integration](#shieldbreak-integration)
7. [Companion Integration](#companion-integration)
8. [Integration Points](#integration-points)

---

## Overview

The combat system implements turn-based RPG combat with the following features:

- **Turn-Based Actions:** Attack, Defend, Flee, Use Item, Use Ability
- **Status Effects:** Poison, burn, stun, sleep, regen, buffs/debuffs
- **Shield/Break System:** Enemy shields that trigger BREAK state when depleted
- **Companion Combat:** Party members who fight alongside the player
- **Equipment Bonuses:** Stats modified by equipped gear
- **World Events:** Global modifiers that affect damage/gold/MP costs
- **Loot System:** Random drops on victory
- **Bestiary Integration:** Tracks encounters and defeats

### Dependencies

```javascript
import { clamp, pushLog } from './state.js';
import { items } from './data/items.js';
import { getEnemy, getEncounter } from './data/enemies.js';
import { getAbility, getAbilityDisplayInfo } from './combat/abilities.js';
import { calculateDamage, calculateHeal, getElementMultiplier } from './combat/damage-calc.js';
import { StatusEffect } from './combat/status-effects.js';
import { getEffectiveCombatStats } from './combat/equipment-bonuses.js';
import { getEnemyShieldData, applyShieldDamage, processBreakState, BREAK_DAMAGE_MULTIPLIER } from './shield-break.js';
import { companionsCombatTurn, selectEnemyTarget, enemyAttackCompanion } from './companion-combat.js';
import { rollLootDrop, applyLootToState } from './loot-tables.js';
import { recordEncounter, recordDefeat } from './bestiary.js';
```

---

## Combat Flow

### Phase State Machine

```
┌──────────────┐
│   explore    │ ← Player exploring world
└──────┬───────┘
       │ (encounter)
       ▼
┌──────────────┐
│ player-turn  │ ← Player chooses action
└──────┬───────┘
       │ (action executed)
       ▼
┌──────────────┐
│ enemy-turn   │ ← Enemy acts (auto-triggered)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ player-turn  │ ← Back to player (if battle continues)
└──────────────┘
       │
       ▼ (enemy HP ≤ 0)
┌──────────────┐
│   victory    │ → XP, gold, loot, level-up processing
└──────────────┘
       │
       ▼ (player HP ≤ 0)
┌──────────────┐
│   defeat     │ → Game over handling
└──────────────┘
       │
       ▼ (flee succeeds)
┌──────────────┐
│    fled      │ → Return to exploration
└──────────────┘
```

### Turn Sequence

1. **Player Turn Start:**
   - Process status effects (poison damage, regen healing, etc.)
   - Check for stun (skip action if stunned)
   - Player selects action

2. **Player Action:**
   - Execute chosen action (attack/defend/flee/ability/item)
   - Companions attack (if enemy still alive)
   - Check for victory/defeat

3. **Enemy Turn Start:**
   - Process enemy status effects
   - Check for enemy stun/break state
   - Enemy AI selects action

4. **Enemy Action:**
   - Execute enemy action
   - Target selection (player vs companions)
   - Check for player defeat

---

## State Shape

### Combat-Related State

```javascript
{
  phase: 'player-turn' | 'enemy-turn' | 'victory' | 'defeat' | 'fled',
  
  player: {
    hp: number,          // Current hit points
    maxHp: number,       // Maximum hit points
    mp: number,          // Current mana points
    maxMp: number,       // Maximum mana points
    atk: number,         // Base attack stat
    def: number,         // Base defense stat
    spd: number,         // Speed stat
    level: number,       // Current level
    xp: number,          // Total experience
    gold: number,        // Current gold
    defending: boolean,  // Defending this turn (+3 DEF)
    statusEffects: StatusEffect[],
    inventory: { [itemId]: number },
    equipment: { weapon, armor, accessory },
    abilities: string[], // Unlocked ability IDs
    class: string,       // 'warrior' | 'mage' | 'rogue' | 'cleric'
  },
  
  enemy: {
    id: string,          // Enemy type ID
    name: string,        // Display name
    hp: number,          // Current HP
    maxHp: number,       // Maximum HP
    atk: number,         // Attack stat
    def: number,         // Defense stat
    spd: number,         // Speed stat
    xpReward: number,    // XP given on defeat
    goldReward: number,  // Gold given on defeat
    defending: boolean,  // Defending this turn
    statusEffects: StatusEffect[],
    abilities: string[], // Enemy ability IDs
    weaknesses: string[], // Element weaknesses
    immunities: string[], // Element immunities
    absorbs: string[],    // Elements that heal
    isBoss: boolean,     // Boss flag
    
    // Shield/Break state
    shieldCount: number,     // Current shields
    maxShields: number,      // Maximum shields
    isBroken: boolean,       // In BREAK state
    breakTurnsRemaining: number,
  },
  
  currentEnemyId: string,  // Enemy ID for bestiary
  rngSeed: number,         // Deterministic RNG seed
  combatLog: string[],     // Battle messages
  
  // Victory data
  xpGained: number,
  goldGained: number,
  lootedItems: Array,
  pendingLevelUps: Array,
  
  // Companions
  companions: Array<{
    id: string,
    name: string,
    hp: number,
    maxHp: number,
    atk: number,
    def: number,
    loyalty: number,
    statusEffects: StatusEffect[],
  }>,
  
  // Combat stats tracking
  combatStats: CombatStats | null,
  
  // World event (optional)
  worldEvent: { type: string, ... } | null,
  
  // Bestiary
  bestiary: { encountered: string[], defeatedCounts: { [id]: number } },
}
```

---

## API Functions

### nextRng(seed)

Deterministic random number generator using Park-Miller LCG.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `seed` | number | Current RNG seed |

**Returns:** `{ seed: number, value: number }`
- `seed`: Next seed value for chaining
- `value`: Random value between 0 and 1

**Example:**
```javascript
let { seed, value } = nextRng(12345);
// value: 0.27... (deterministic)
({ seed, value } = nextRng(seed));
// Next random value
```

**Use Cases:**
- Flee chance (40% success)
- Enemy action selection
- Critical hit rolls
- Loot table rolls

---

### addStatusEffect(state, targetKey, effect)

Adds a status effect to a combat participant.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |
| `targetKey` | string | 'player' or 'enemy' |
| `effect` | StatusEffect | Effect to add |

**Returns:** `object` - Updated state with effect added

**Example:**
```javascript
const effect = { type: 'poison', duration: 3, power: 5 };
const newState = addStatusEffect(state, 'enemy', effect);
// Enemy now has poison effect
```

**StatusEffect Shape:**
```javascript
{
  type: 'poison' | 'burn' | 'stun' | 'sleep' | 'regen' | 'atk-up' | 'def-up' | 'spd-up' | 'atk-down' | 'def-down' | 'spd-down',
  duration: number,  // Turns remaining
  power: number,     // Damage/heal per turn (for DoT effects)
}
```

---

### startNewEncounter(state, zoneLevel)

Initiates a new combat encounter.

**Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `state` | object | - | Current game state |
| `zoneLevel` | number | 1 | Zone level for scaling |

**Returns:** `object` - State with combat initialized

**Behavior:**
1. Selects enemy using `getEncounter()` based on zone
2. Initializes enemy HP, stats, shields from database
3. Records encounter in bestiary
4. Sets phase to 'player-turn'
5. Adds combat log messages
6. Initializes combat stats if tracking enabled

**Example:**
```javascript
// Start combat in a level 3 zone
const combatState = startNewEncounter(state, 3);
// combatState.phase: 'player-turn'
// combatState.enemy: { name: 'Dire Wolf', hp: 45, ... }
```

---

### playerAttack(state)

Executes a basic attack action.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |

**Returns:** `object` - Updated state after attack

**Behavior:**
1. Validates phase is 'player-turn'
2. Checks for stun (skips action if stunned)
3. Calculates damage using equipment bonuses
4. Applies BREAK damage multiplier if enemy is broken
5. Checks for physical weakness → applies shield damage
6. Triggers companions to attack
7. Processes victory/defeat
8. Transitions to enemy turn

**Damage Formula:**
```javascript
baseDamage = max(1, playerAtk - (enemyDef + defendBonus))
finalDamage = baseDamage * worldEventMult * (isBroken ? 1.5 : 1)
```

**Example:**
```javascript
const afterAttack = playerAttack(state);
// Logs: "You strike for 45 damage."
// afterAttack.phase: 'enemy-turn' (or 'victory')
```

---

### playerDefend(state)

Sets defending flag for damage reduction.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |

**Returns:** `object` - State with defending = true

**Behavior:**
1. Validates phase is 'player-turn'
2. Checks for stun
3. Sets `player.defending = true` (+3 DEF until next turn)
4. Transitions to enemy turn

**Example:**
```javascript
const afterDefend = playerDefend(state);
// Logs: "You brace for impact."
// afterDefend.player.defending: true
```

---

### playerFlee(state)

Attempts to escape combat.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |

**Returns:** `object` - State with 'fled' phase (40% chance) or enemy turn

**Behavior:**
1. Validates phase is 'player-turn'
2. Checks for stun
3. Rolls RNG (40% success chance)
4. On success: phase → 'fled'
5. On failure: transitions to enemy turn

**Example:**
```javascript
const afterFlee = playerFlee(state);
if (afterFlee.phase === 'fled') {
  // Escaped successfully
} else {
  // Failed, enemy gets a turn
}
```

---

### playerUsePotion(state)

Uses a healing potion from inventory.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |

**Returns:** `object` - State after potion use

**Behavior:**
1. Validates phase and stun
2. Checks inventory for potions
3. Removes 1 potion from inventory
4. Heals player (amount from potion data)
5. Transitions to enemy turn

**Example:**
```javascript
const afterPotion = playerUsePotion(state);
// Logs: "You use Health Potion and restore 30 HP."
```

---

### playerUseAbility(state, abilityId)

Uses a combat ability.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |
| `abilityId` | string | ID of ability to use |

**Returns:** `object` - State after ability use

**Behavior:**
1. Validates phase, stun, and ability availability
2. Checks MP cost (modified by world events)
3. Deducts MP
4. Executes ability effect:
   - Damage abilities: Calculate with element multipliers
   - Healing abilities: Restore HP
   - Status abilities: Apply effects
   - Shield damage for matching weaknesses
5. Transitions to enemy turn

**Ability Categories:**
- **Damage:** slash, fireball, blizzard, thunderbolt, shadow_bolt, etc.
- **Healing:** heal, greater_heal, group_heal
- **Buffs:** atk_up, def_up, haste
- **Debuffs:** poison_cloud, weaken
- **Cleanse:** purify (removes debuffs)

**Example:**
```javascript
const afterAbility = playerUseAbility(state, 'fireball');
// Logs: "You cast Fireball for 80 fire damage!"
// If enemy has fire weakness: "Enemy shields broken!"
```

---

### playerUseItem(state, itemId)

Uses a consumable item in combat.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |
| `itemId` | string | ID of item to use |

**Returns:** `object` - State after item use

**Supported Item Types:**
- **Healing:** potion, hiPotion (restores HP)
- **Mana:** ether (restores MP)
- **Damage:** bomb (deals fixed damage)
- **Cleanse:** antidote (removes poison), etc.

**Example:**
```javascript
const afterBomb = playerUseItem(state, 'bomb');
// Logs: "You throw Bomb for 50 fire damage!"
```

---

### enemyAct(state)

Executes the enemy's turn.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Current game state |

**Returns:** `object` - State after enemy action

**Behavior:**
1. Validates phase is 'enemy-turn'
2. Processes BREAK state recovery
3. If broken, enemy skips turn
4. Selects target (player or companions)
5. Uses AI to select action (attack or ability)
6. Executes action
7. Checks for defeat
8. Transitions to player turn

**Target Selection:**
- 70% chance to target player
- 30% chance to target a random companion
- Falls back to player if no valid companions

**Example:**
```javascript
const afterEnemy = enemyAct(state);
// Logs: "Giant Spider attacks for 25 damage!"
// afterEnemy.phase: 'player-turn' (or 'defeat')
```

---

## Status Effects

### Effect Types

| Type | Effect | Per Turn |
|------|--------|----------|
| `poison` | Damage over time | Deals `power` damage |
| `burn` | Damage over time | Deals `power` damage |
| `stun` | Skip turn | N/A |
| `sleep` | Skip turn (breaks on damage) | N/A |
| `regen` | Heal over time | Heals `power` HP |
| `atk-up` | +25% attack | N/A |
| `def-up` | +25% defense | N/A |
| `spd-up` | +25% speed | N/A |
| `atk-down` | -25% attack | N/A |
| `def-down` | -25% defense | N/A |
| `spd-down` | -25% speed | N/A |

### Effect Processing

Status effects are processed at the start of each entity's turn:
1. DoT effects deal damage/healing
2. Duration decrements by 1
3. Effects with duration ≤ 0 are removed
4. Log messages generated for each effect

---

## Shield/Break Integration

### Shield Damage

When player attacks or uses abilities:
```javascript
// Check if attack matches enemy weakness
if (enemy.weaknesses.includes(element) && !enemy.isBroken) {
  const result = applyShieldDamage(enemy, shieldDamageAmount);
  if (result.triggeredBreak) {
    // Enemy enters BREAK state
    // Logs: "Enemy shields broken!"
  }
}
```

### BREAK State

When shields reach 0:
- Enemy enters BREAK state for 2 turns (1 for bosses)
- Enemy skips their turn
- All damage to enemy multiplied by 1.5x
- After BREAK ends, shields restore to 50%

### Integration Points

```javascript
// In playerAttack:
if (enemy.weaknesses.includes('physical')) {
  applyShieldDamage(enemy, 1);
}

// In playerUseAbility:
const element = ability.element;
if (enemy.weaknesses.includes(element)) {
  applyShieldDamage(enemy, ability.shieldDamage || 1);
}

// In enemyAct:
const breakResult = processBreakState(enemy);
if (breakResult.stillBroken) {
  // Skip enemy turn
}
```

---

## Companion Integration

### Companion Combat Turn

After player acts (if enemy still alive):
```javascript
const companionResult = companionsCombatTurn(state, state.rngSeed);
state = companionResult.state;
state.rngSeed = companionResult.seed;
```

### Enemy Target Selection

Enemy can target player or companions:
```javascript
const targetResult = selectEnemyTarget(state, rngSeed);
if (targetResult.targetType === 'companion') {
  state = enemyAttackCompanion(state, targetResult.companionIndex, damage);
} else {
  // Attack player
}
```

### Victory Processing

On victory, companions receive:
- Loyalty bonuses
- XP sharing (reduced for fainted companions)

---

## Integration Points

### With Main Game Loop

```javascript
// In main.js handleCombatAction
function handleCombatAction(state, action) {
  switch (action.type) {
    case 'PLAYER_ATTACK':
      return playerAttack(state);
    case 'PLAYER_DEFEND':
      return playerDefend(state);
    case 'PLAYER_FLEE':
      return playerFlee(state);
    case 'PLAYER_USE_ABILITY':
      return playerUseAbility(state, action.abilityId);
    case 'PLAYER_USE_ITEM':
      return playerUseItem(state, action.itemId);
  }
}
```

### With Combat Stats Tracker

```javascript
// At combat start
state.combatStats = createCombatStats(enemy.name, enemy.isBoss);

// During combat
recordPlayerAttack(state.combatStats, damage);
recordDamageReceived(state.combatStats, enemyDamage);
recordAbilityUse(state.combatStats, abilityName, damage, healing);

// At combat end
finalizeCombatStats(state.combatStats, outcome, player.hp, player.maxHp);
```

### With Render System

```javascript
// In render.js
function renderCombat(state) {
  if (state.phase === 'player-turn') {
    renderPlayerActions(state);
  } else if (state.phase === 'enemy-turn') {
    // Usually handled by setTimeout transition
  } else if (state.phase === 'victory') {
    renderVictoryScreen(state);
  } else if (state.phase === 'defeat') {
    renderDefeatScreen(state);
  }
}
```

---

## Related Documentation

- [Combat Stats Tracker API](./combat-stats-tracker-api.md) - Battle statistics
- [Battle Summary API](./battle-summary-api.md) - Victory screen
- [Shield/Break System](./shield-break-system.md) - Shield mechanics
- [Companion Combat](./companion-combat.md) - Party members
- [Abilities Reference](./abilities-reference.md) - Skill list
- [Enemy Database](./enemy-database.md) - Enemy data

---

*Documentation written by Claude Opus 4.5 from #voted-out on Day 343*
