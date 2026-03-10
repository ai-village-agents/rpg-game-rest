# Provisions System API Reference

> Complete API documentation for the food and consumable provisions system.  
> **Module:** `src/provisions.js` (325 lines)  
> **Tests:** `tests/provisions-test.mjs`  
> **Purpose:** Consumable food items with instant and over-time effects

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Data Constants](#data-constants)
4. [State Management](#state-management)
5. [API Functions](#api-functions)
6. [Integration Guide](#integration-guide)
7. [Cooking System](#cooking-system)

---

## Overview

The Provisions System provides consumable food items that grant:

- **Instant Effects:** Immediate HP/MP restoration
- **Buff Effects:** Temporary stat boosts (ATK, DEF)
- **Regen Effects:** HP/MP regeneration over multiple turns
- **Duration:** Effects last for a specified number of turns

### Key Features

- 10 unique provisions with varying rarities (Common → Epic)
- Stacking buff system (multiple provisions can be active)
- Turn-based buff tick system for regen/duration tracking
- Cooking recipes to craft advanced provisions
- Combat integration for mid-battle consumption

---

## Quick Start

```javascript
import {
  PROVISIONS,
  createProvisionState,
  useProvision,
  tickProvisionBuffs,
  getProvisionBonuses
} from './provisions.js';

// 1. Initialize provision state in game state
state.provisionState = createProvisionState();

// 2. Use a provision (must be in inventory)
const result = useProvision(state, 'heartyStew');
console.log(result.message); // "Used Hearty Stew. Buff lasts 8 turns."

// 3. Each turn, tick active buffs
const tickResult = tickProvisionBuffs(state);
tickResult.messages.forEach(msg => console.log(msg));
// "Regenerated 3 HP from provisions."
// "Hearty Stew has worn off."

// 4. Get current bonuses for combat calculations
const bonuses = getProvisionBonuses(state);
// bonuses = { atkBoost: 3, defBoost: 2, hpRegen: 0, mpRegen: 0 }
```

---

## Data Constants

### PROVISIONS

Object containing all available provision definitions:

```javascript
export const PROVISIONS = {
  travelerBread: {
    id: "travelerBread",
    name: "Traveler's Bread",
    type: "provision",
    category: "food",
    rarity: "Common",
    description: "A crusty trail loaf that steadies the stomach and mends small wounds over time.",
    value: 10,
    effect: { hpRegen: 2, duration: 5 }
  },
  // ... more provisions
};
```

### Complete Provision List

| ID | Name | Rarity | Value | Effects |
|----|------|--------|-------|---------|
| `travelerBread` | Traveler's Bread | Common | 10 | HP Regen +2, 5 turns |
| `heartyStew` | Hearty Stew | Uncommon | 25 | ATK +3, DEF +2, 8 turns |
| `roastedMeat` | Roasted Meat | Common | 18 | Heal 30 HP, HP Regen +1, 3 turns |
| `herbTea` | Herb Tea | Common | 15 | Restore 15 MP, MP Regen +2, 4 turns |
| `ironRation` | Iron Ration | Uncommon | 35 | ATK +2, DEF +2, HP Regen +1, 10 turns |
| `dragonPepper` | Dragon Pepper Soup | Rare | 50 | ATK +5, 6 turns |
| `frostBerry` | Frost Berry Tart | Rare | 50 | DEF +5, 6 turns |
| `wardensMeal` | Warden's Feast | Epic | 100 | ATK +4, DEF +4, HP Regen +3, MP Regen +2, 12 turns |
| `fieldMushroom` | Field Mushroom | Common | 8 | Heal 15 HP (instant) |
| `spicedCider` | Spiced Cider | Uncommon | 22 | ATK +2, Restore 10 MP, 5 turns |

### Rarity Tiers

| Rarity | Color | Value Range | Effect Power |
|--------|-------|-------------|--------------|
| Common | White | 8-18 | Basic effects |
| Uncommon | Green | 22-35 | Moderate effects |
| Rare | Blue | 50 | Strong single stat |
| Epic | Purple | 100+ | Multiple strong effects |

### Effect Properties

| Property | Type | Description |
|----------|------|-------------|
| `healInstant` | number | Immediate HP restoration |
| `mpInstant` | number | Immediate MP restoration |
| `hpRegen` | number | HP regenerated per turn |
| `mpRegen` | number | MP regenerated per turn |
| `atkBoost` | number | Attack stat bonus |
| `defBoost` | number | Defense stat bonus |
| `duration` | number | Turns the buff lasts |

---

## State Management

### ProvisionState Shape

```javascript
{
  activeBuffs: Array<{
    id: string,           // Provision ID
    name: string,         // Display name
    turnsRemaining: number,
    atkBoost: number,
    defBoost: number,
    hpRegen: number,
    mpRegen: number,
  }>,
  provisionsUsed: number,  // Total provisions consumed
}
```

### createProvisionState()

Creates initial provision state.

**Returns:** `ProvisionState`

```javascript
const provisionState = createProvisionState();
// { activeBuffs: [], provisionsUsed: 0 }
```

---

## API Functions

### useProvision(state, provisionId)

Consumes a provision from inventory and applies its effects.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Game state with player inventory |
| `provisionId` | string | ID of provision to use |

**Returns:** `{ success: boolean, message: string, state: object }`

**Behavior:**
1. Validates provision exists in PROVISIONS
2. Validates player has item in inventory
3. Applies instant effects (healInstant, mpInstant)
4. Adds buff to activeBuffs if duration > 0
5. Removes item from inventory
6. Increments provisionsUsed counter

**Example:**
```javascript
// Use Hearty Stew
const result = useProvision(state, 'heartyStew');
// result.success: true
// result.message: "Used Hearty Stew. Buff lasts 8 turns."
// state.provisionState.activeBuffs: [{ id: 'heartyStew', turnsRemaining: 8, atkBoost: 3, defBoost: 2, ... }]

// Use Roasted Meat (has both instant and buff)
const result2 = useProvision(state, 'roastedMeat');
// result2.message: "Used Roasted Meat. Restored 30 HP. Buff lasts 3 turns."

// Use Field Mushroom (instant only, no buff)
const result3 = useProvision(state, 'fieldMushroom');
// result3.message: "Used Field Mushroom. Restored 15 HP."
```

**Error Cases:**
```javascript
useProvision(state, 'unknownProvision');
// { success: false, message: "Provision not found." }

useProvision(state, 'heartyStew'); // Not in inventory
// { success: false, message: "You do not have that provision." }
```

---

### tickProvisionBuffs(state)

Processes active buffs: applies regen, decrements duration, removes expired.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Game state with provisionState |

**Returns:** `{ state: object, messages: string[] }`

**Behavior:**
1. Sums all active HP regen and applies to player
2. Sums all active MP regen and applies to player
3. Decrements turnsRemaining on all buffs
4. Removes buffs with turnsRemaining ≤ 0
5. Returns messages for regen and expiration

**Example:**
```javascript
// Active buffs: Hearty Stew (3 turns left), Iron Ration (5 turns left)
const { state: newState, messages } = tickProvisionBuffs(state);
// messages: ["Regenerated 3 HP from provisions."]
// Hearty Stew now has 2 turns, Iron Ration has 4 turns

// When buff expires:
const { messages: expireMessages } = tickProvisionBuffs(state);
// expireMessages: ["Hearty Stew has worn off."]
```

**Call Timing:**
- Call at the start of each combat turn
- Can call during exploration for out-of-combat regen
- Effects stack additively

---

### getProvisionBonuses(state)

Gets current stat bonuses from all active provision buffs.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Game state with provisionState |

**Returns:** `{ atkBoost: number, defBoost: number, hpRegen: number, mpRegen: number }`

**Example:**
```javascript
// Active: Hearty Stew (+3 ATK, +2 DEF) + Dragon Pepper (+5 ATK)
const bonuses = getProvisionBonuses(state);
// bonuses = { atkBoost: 8, defBoost: 2, hpRegen: 0, mpRegen: 0 }

// Apply in combat:
const effectiveAtk = player.atk + bonuses.atkBoost;
```

---

### hasActiveBuff(state, provisionId)

Checks if a specific provision buff is currently active.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Game state |
| `provisionId` | string | Provision ID to check |

**Returns:** `boolean`

**Example:**
```javascript
if (hasActiveBuff(state, 'wardensMeal')) {
  console.log("Warden's Feast is still active!");
}
```

**Use Cases:**
- Prevent stacking same buff
- UI indicators for active effects
- Achievement tracking

---

### clearAllBuffs(state)

Removes all active provision buffs.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Game state |

**Returns:** `object` - Updated state

**Example:**
```javascript
// Clear buffs on death or rest
state = clearAllBuffs(state);
// state.provisionState.activeBuffs = []
```

**Use Cases:**
- Player death/respawn
- Long rest at inn
- Curse/dispel effects

---

### getProvisionById(id)

Gets provision data by ID.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | string | Provision ID |

**Returns:** `Provision | null`

**Example:**
```javascript
const provision = getProvisionById('heartyStew');
// provision = { id: 'heartyStew', name: 'Hearty Stew', ... }

const unknown = getProvisionById('notReal');
// unknown = null
```

---

### canUseProvision(state, provisionId)

Checks if a provision can be used (exists and in inventory).

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `state` | object | Game state |
| `provisionId` | string | Provision ID |

**Returns:** `{ canUse: boolean, reason: string }`

**Example:**
```javascript
const check = canUseProvision(state, 'heartyStew');
if (check.canUse) {
  // Enable "Use" button in UI
} else {
  console.log(check.reason); // "You do not have that provision."
}
```

---

## Integration Guide

### With Combat System

```javascript
// In combat.js - apply provision bonuses to damage calculation
import { getProvisionBonuses, tickProvisionBuffs } from './provisions.js';

function playerAttack(state) {
  const bonuses = getProvisionBonuses(state);
  const effectiveAtk = state.player.atk + bonuses.atkBoost;
  
  // Calculate damage with boosted attack...
}

function startPlayerTurn(state) {
  // Tick provision buffs at turn start
  const { state: newState, messages } = tickProvisionBuffs(state);
  messages.forEach(msg => pushLog(newState, msg));
  return newState;
}
```

### With Equipment Bonuses

```javascript
// In combat/equipment-bonuses.js
import { getProvisionBonuses } from '../provisions.js';

export function getEffectiveCombatStats(player, state) {
  const baseStats = calculateEquipmentBonuses(player);
  const provisionBonuses = getProvisionBonuses(state);
  
  return {
    atk: baseStats.atk + provisionBonuses.atkBoost,
    def: baseStats.def + provisionBonuses.defBoost,
    // ...
  };
}
```

### With UI System

```javascript
// In provisions-ui.js
import { PROVISIONS, canUseProvision, useProvision } from './provisions.js';

function renderProvisionsList(state) {
  const provisions = state.player.inventory
    .filter(item => PROVISIONS[item.id])
    .map(item => {
      const provision = PROVISIONS[item.id];
      const { canUse, reason } = canUseProvision(state, item.id);
      return { ...provision, quantity: item.quantity, canUse, disableReason: reason };
    });
  
  // Render provision buttons...
}
```

---

## Cooking System

### COOKING_RECIPES

Array of recipes to craft provisions from ingredients:

```javascript
export const COOKING_RECIPES = [
  {
    id: "cookHeartyStew",
    name: "Cook Hearty Stew",
    description: "Simmer herbs with a hearty base to craft a fortifying stew.",
    ingredients: [
      { itemId: "herbBundle", quantity: 2 },
      { itemId: "roastedMeat", quantity: 1 }
    ],
    result: { itemId: "heartyStew", quantity: 1 },
    requiredLevel: 2
  },
  // ... more recipes
];
```

### Recipe List

| Recipe | Ingredients | Result | Level |
|--------|-------------|--------|-------|
| Cook Hearty Stew | 2x Herb Bundle, 1x Roasted Meat | Hearty Stew | 2 |
| Cook Dragon Pepper Soup | 1x Dragon Scale, 2x Herb Bundle | Dragon Pepper Soup | 4 |
| Cook Frost Berry Tart | 2x Herb Bundle, 1x Arcane Essence | Frost Berry Tart | 3 |
| Cook Warden's Feast | 1x Hearty Stew, 1x Dragon Pepper, 1x Frost Berry | Warden's Feast | 6 |

### Integration with Crafting System

The cooking recipes integrate with the main crafting system via `crafting.js`:

```javascript
// Cooking recipes are a subset of all crafting recipes
import { COOKING_RECIPES } from './provisions.js';
import { canCraft, craftItem } from './crafting.js';

// Check if player can cook
const canCook = canCraft(state, 'cookHeartyStew');

// Craft the provision
const result = craftItem(state, 'cookHeartyStew');
```

---

## Related Documentation

- [Combat System API](./combat-system-api.md) - Combat integration
- [Items Database](./items-database.md) - Inventory system
- [Crafting System](./crafting-system.md) - Recipe crafting
- [UI Components](./ui-components.md) - Provision UI

---

*Documentation written by Claude Opus 4.5 from #voted-out on Day 343*
