# Achievements System API Documentation

**Version:** 1.0.0  
**Last Updated:** Day 343  
**Author:** Claude Opus 4.5 (from #voted-out)  
**Source File:** `src/achievements.js` (346 lines)

## Table of Contents

1. [Overview](#overview)
2. [Achievement Data Structure](#achievement-data-structure)
3. [State Integration](#state-integration)
4. [Core API Functions](#core-api-functions)
5. [Internal Helper Functions](#internal-helper-functions)
6. [Complete Achievement List](#complete-achievement-list)
7. [Integration Guide](#integration-guide)
8. [Usage Examples](#usage-examples)

---

## Overview

The Achievements System tracks player progress and unlocks achievements based on game milestones. It supports 27 achievements across 5 categories with automatic tracking and progress display.

### Key Features

- **27 Total Achievements** across 5 categories
- **Automatic Tracking** via `trackAchievements()` on state changes
- **Progress Tracking** for tiered achievements
- **Category Filtering** for UI organization
- **Backward Compatibility** with legacy state shapes

### Architecture Flow

```
Game Action → State Update → trackAchievements(state)
                                    ↓
                        Check all achievement conditions
                                    ↓
                        Add newly unlocked to state.unlockedAchievements
                                    ↓
                        UI displays notification for new unlocks
```

---

## Achievement Data Structure

### Achievement Definition

Each achievement in the `ACHIEVEMENTS` array:

```javascript
{
  id: 'first_blood',           // Unique identifier
  name: 'First Blood',         // Display name
  description: 'Defeat your first enemy',
  category: 'combat',          // 'combat' | 'exploration' | 'progression' | 'collection' | 'quests'
  condition: (data) => data.kills >= 1,  // Boolean function
  getProgress: (data) => data.kills      // Progress number for display
}
```

### Achievement Categories

| Category | Description | Count |
|----------|-------------|-------|
| combat | Battle-related milestones | 6 |
| exploration | Room discovery milestones | 4 |
| progression | Level and XP milestones | 6 |
| collection | Gold, items, and purchases | 9 |
| quests | Quest completion milestones | 3 |

### State Shape

Achievements are stored in the game state:

```javascript
{
  // ... other state
  unlockedAchievements: ['first_blood', 'first_steps', ...],  // Primary storage
  achievements: [...],  // Legacy fallback (deprecated)
  
  // Data sources for achievement checks:
  gameStats: {
    enemiesDefeated: 45,
    perfectCombat: 3,
    bossesDefeated: 2,
    shopPurchases: 12,
    highestTavernStreak: 4,
    tavernBusts: 2
  },
  player: {
    level: 12,
    gold: 850,
    xp: 3200,
    inventory: [...],
    equipment: {...}
  },
  questState: {
    discoveredRooms: ['nw', 'n', 'center', ...],
    activeQuests: [...],
    completedQuests: [...]
  }
}
```

---

## Core API Functions

### trackAchievements(state)

Main function to check and unlock achievements. Call after any state change that might trigger an achievement.

```javascript
import { trackAchievements } from './achievements.js';

function handleStateChange(oldState, newState) {
  const stateWithAchievements = trackAchievements(newState);
  // stateWithAchievements.unlockedAchievements now includes any new unlocks
  return stateWithAchievements;
}
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| state | GameState | Current game state |

**Returns:** `GameState` - Updated state with `unlockedAchievements` array

**Side Effects:**
- Adds newly unlocked achievement IDs to `state.unlockedAchievements`
- Normalizes legacy `state.achievements` to `state.unlockedAchievements`
- Deduplicates achievement list

---

### isUnlocked(state, achievementId)

Check if a specific achievement is unlocked.

```javascript
import { isUnlocked } from './achievements.js';

if (isUnlocked(state, 'boss_slayer')) {
  showBossSlayerBadge();
}
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| state | GameState | Current game state |
| achievementId | string | Achievement ID to check |

**Returns:** `boolean`

---

### getProgress(state, achievementId)

Get current progress value for an achievement.

```javascript
import { getProgress } from './achievements.js';

const kills = getProgress(state, 'slayer');  // Returns number of kills
// Display: "Slayer: 35/50 enemies defeated"
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| state | GameState | Current game state |
| achievementId | string | Achievement ID |

**Returns:** `number` - Progress value (0 if achievement not found)

---

### getAllAchievements()

Get array of all achievement definitions.

```javascript
import { getAllAchievements } from './achievements.js';

const achievements = getAllAchievements();
// Returns copy of ACHIEVEMENTS array (27 items)
```

**Returns:** `Achievement[]` - Copy of all achievement definitions

---

### getAchievementsByCategory(category)

Filter achievements by category.

```javascript
import { getAchievementsByCategory } from './achievements.js';

const combatAchievements = getAchievementsByCategory('combat');
// Returns 6 combat achievements
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| category | string | Category name (case-insensitive) |

**Returns:** `Achievement[]` - Filtered achievement array

---

### getUnlockedCount(state)

Get count of unlocked achievements.

```javascript
import { getUnlockedCount, getTotalCount } from './achievements.js';

const unlocked = getUnlockedCount(state);
const total = getTotalCount();
// Display: "Achievements: 15/27"
```

**Returns:** `number` - Count of unlocked achievements

---

### getTotalCount()

Get total number of achievements.

```javascript
import { getTotalCount } from './achievements.js';

const total = getTotalCount();  // Returns 27
```

**Returns:** `number` - Total achievement count (currently 27)

---

## Internal Helper Functions

### safeState(state)

Creates safe object with default values for legacy state properties.

```javascript
// Internal use - handles missing properties gracefully
function safeState(state) {
  return {
    kills: state.kills || 0,
    perfectCombat: state.perfectCombat || 0,
    explored: state.explored || [],
    level: state.level || 1,
    gold: state.gold || 0,
    inventory: Array.isArray(state.inventory) ? [...state.inventory] : [],
    equipment: state.equipment || {},
    xp: state.xp || 0,
    shopPurchases: state.shopPurchases || 0,
    completedQuests: state.completedQuests || [],
    bossesDefeated: state.bossesDefeated || 0
  };
}
```

---

### extractAchievementData(state)

Extracts and normalizes achievement-relevant data from various state locations.

```javascript
// Internal use - handles both legacy and modern state shapes
function extractAchievementData(state) {
  const legacy = safeState(state);
  return {
    ...legacy,
    kills: state.gameStats?.enemiesDefeated ?? legacy.kills,
    gold: state.player?.gold ?? legacy.gold,
    level: state.player?.level ?? legacy.level,
    xp: state.player?.xp ?? legacy.xp,
    explored: state.questState?.discoveredRooms ?? legacy.explored,
    quests: state.questState?.activeQuests ?? state.quests ?? [],
    activeQuests: state.questState?.activeQuests ?? state.quests ?? [],
    completedQuests: state.questState?.completedQuests ?? legacy.completedQuests,
    inventory: Array.isArray(state.player?.inventory) 
      ? state.player.inventory 
      : (Array.isArray(legacy.inventory) ? legacy.inventory : []),
    equipment: state.player?.equipment ?? legacy.equipment,
    perfectCombat: state.gameStats?.perfectCombat ?? legacy.perfectCombat,
    shopPurchases: state.gameStats?.shopPurchases ?? legacy.shopPurchases,
    bossesDefeated: state.gameStats?.bossesDefeated ?? legacy.bossesDefeated,
    highestTavernStreak: state.gameStats?.highestTavernStreak ?? 0,
    tavernBusts: state.gameStats?.tavernBusts ?? 0
  };
}
```

**Data Source Mapping:**

| Data Field | Modern Path | Legacy Fallback |
|------------|-------------|-----------------|
| kills | gameStats.enemiesDefeated | state.kills |
| gold | player.gold | state.gold |
| level | player.level | state.level |
| xp | player.xp | state.xp |
| explored | questState.discoveredRooms | state.explored |
| activeQuests | questState.activeQuests | state.quests |
| completedQuests | questState.completedQuests | state.completedQuests |
| inventory | player.inventory | state.inventory |
| equipment | player.equipment | state.equipment |
| perfectCombat | gameStats.perfectCombat | state.perfectCombat |
| shopPurchases | gameStats.shopPurchases | state.shopPurchases |
| bossesDefeated | gameStats.bossesDefeated | state.bossesDefeated |
| highestTavernStreak | gameStats.highestTavernStreak | 0 |
| tavernBusts | gameStats.tavernBusts | 0 |

---

## Complete Achievement List

### Combat Achievements (6)

| ID | Name | Description | Condition |
|----|------|-------------|-----------|
| first_blood | First Blood | Defeat your first enemy | kills >= 1 |
| veteran | Veteran | Defeat 10 enemies | kills >= 10 |
| slayer | Slayer | Defeat 50 enemies | kills >= 50 |
| legend | Legend | Defeat 100 enemies | kills >= 100 |
| perfect_combat | Perfect Combat | Win a battle without taking damage | perfectCombat >= 1 |
| boss_slayer | Boss Slayer | Defeat a boss enemy | bossesDefeated >= 1 |

### Exploration Achievements (4)

| ID | Name | Description | Condition |
|----|------|-------------|-----------|
| first_steps | First Steps | Explore your first room | explored.length >= 1 |
| wanderer | Wanderer | Explore 5 rooms | explored.length >= 5 |
| pathfinder | Pathfinder | Explore 15 rooms | explored.length >= 15 |
| cartographer | Cartographer | Explore 30 rooms | explored.length >= 30 |

### Progression Achievements (6)

| ID | Name | Description | Condition |
|----|------|-------------|-----------|
| apprentice | Apprentice | Reach level 5 | level >= 5 |
| journeyman | Journeyman | Reach level 10 | level >= 10 |
| expert | Expert | Reach level 15 | level >= 15 |
| master | Master | Reach level 20 | level >= 20 |
| xp_hunter | XP Hunter | Earn 1000 total XP | xp >= 1000 |
| xp_master | XP Master | Earn 5000 total XP | xp >= 5000 |

### Collection Achievements (9)

| ID | Name | Description | Condition |
|----|------|-------------|-----------|
| first_coin | First Coin | Collect 100 gold | gold >= 100 |
| wealthy | Wealthy | Collect 500 gold | gold >= 500 |
| tycoon | Tycoon | Collect 2000 gold | gold >= 2000 |
| rare_collector | Rare Collector | Own a rare item | any item.rarity === 'rare' |
| epic_collector | Epic Collector | Own an epic item | any item.rarity === 'epic' |
| merchant | Merchant | Purchase 5 items from shops | shopPurchases >= 5 |
| shopaholic | Shopaholic | Purchase 20 items from shops | shopPurchases >= 20 |
| high_roller | High Roller | Achieve a 3-win streak in Tavern Dice | highestTavernStreak >= 3 |
| house_always_wins | The House Always Wins | Lose a pot in Tavern Dice | tavernBusts >= 1 |

### Quest Achievements (3)

| ID | Name | Description | Condition |
|----|------|-------------|-----------|
| quest_starter | Quest Starter | Accept your first quest | activeQuests.length >= 1 |
| quest_seeker | Quest Seeker | Complete 3 quests | completedQuests.length >= 3 |
| quest_master | Quest Master | Complete 10 quests | completedQuests.length >= 10 |

---

## Integration Guide

### Basic Integration

Call `trackAchievements()` after state changes:

```javascript
import { trackAchievements } from './achievements.js';

function gameLoop(state, action) {
  // Process action...
  let newState = processAction(state, action);
  
  // Track achievements after every state change
  newState = trackAchievements(newState);
  
  return newState;
}
```

### Combat Integration

Track combat-related achievements after battles:

```javascript
import { trackAchievements } from './achievements.js';

function handleCombatVictory(state, enemy) {
  let newState = {
    ...state,
    gameStats: {
      ...state.gameStats,
      enemiesDefeated: (state.gameStats?.enemiesDefeated || 0) + 1,
      bossesDefeated: enemy.isBoss 
        ? (state.gameStats?.bossesDefeated || 0) + 1 
        : (state.gameStats?.bossesDefeated || 0)
    }
  };
  
  // Check for new achievements
  return trackAchievements(newState);
}
```

### Perfect Combat Tracking

```javascript
function handlePerfectCombat(state) {
  const newState = {
    ...state,
    gameStats: {
      ...state.gameStats,
      perfectCombat: (state.gameStats?.perfectCombat || 0) + 1
    }
  };
  return trackAchievements(newState);
}
```

### UI Display

```javascript
import { 
  getAllAchievements, 
  isUnlocked, 
  getProgress,
  getUnlockedCount,
  getTotalCount 
} from './achievements.js';

function renderAchievementsUI(state) {
  const achievements = getAllAchievements();
  
  return {
    header: `Achievements: ${getUnlockedCount(state)}/${getTotalCount()}`,
    items: achievements.map(ach => ({
      name: ach.name,
      description: ach.description,
      unlocked: isUnlocked(state, ach.id),
      progress: getProgress(state, ach.id),
      category: ach.category
    }))
  };
}
```

### Notification System

Detect newly unlocked achievements:

```javascript
import { trackAchievements } from './achievements.js';

function processStateChange(oldState, newState) {
  const oldUnlocked = oldState.unlockedAchievements || [];
  const trackedState = trackAchievements(newState);
  const newUnlocked = trackedState.unlockedAchievements || [];
  
  // Find newly unlocked achievements
  const justUnlocked = newUnlocked.filter(id => !oldUnlocked.includes(id));
  
  if (justUnlocked.length > 0) {
    showAchievementNotifications(justUnlocked);
  }
  
  return trackedState;
}
```

### Save/Load Integration

Achievements persist automatically in state:

```javascript
// Saving
const saveData = JSON.stringify({
  ...state,
  unlockedAchievements: state.unlockedAchievements
});

// Loading
function loadGame(saveData) {
  const loaded = JSON.parse(saveData);
  return trackAchievements(loaded);  // Verify/update achievements
}
```

---

## Usage Examples

### Example 1: Achievement Progress Bar

```javascript
import { getProgress, getAllAchievements } from './achievements.js';

function getProgressPercentage(state, achievementId) {
  const achievement = getAllAchievements().find(a => a.id === achievementId);
  if (!achievement) return 0;
  
  // Extract threshold from condition (simplified)
  const thresholds = {
    veteran: 10, slayer: 50, legend: 100,
    wanderer: 5, pathfinder: 15, cartographer: 30,
    apprentice: 5, journeyman: 10, expert: 15, master: 20,
    first_coin: 100, wealthy: 500, tycoon: 2000
  };
  
  const threshold = thresholds[achievementId] || 1;
  const progress = getProgress(state, achievementId);
  return Math.min(100, (progress / threshold) * 100);
}
```

### Example 2: Category Summary

```javascript
import { getAchievementsByCategory, isUnlocked } from './achievements.js';

function getCategorySummary(state) {
  const categories = ['combat', 'exploration', 'progression', 'collection', 'quests'];
  
  return categories.map(cat => {
    const achievements = getAchievementsByCategory(cat);
    const unlocked = achievements.filter(a => isUnlocked(state, a.id));
    return {
      category: cat,
      unlocked: unlocked.length,
      total: achievements.length,
      percentage: Math.round((unlocked.length / achievements.length) * 100)
    };
  });
}
// Returns: [{ category: 'combat', unlocked: 4, total: 6, percentage: 67 }, ...]
```

### Example 3: Recent Unlocks Display

```javascript
import { getAllAchievements, isUnlocked } from './achievements.js';

function getRecentUnlocks(state, limit = 5) {
  // In a real implementation, you'd track unlock timestamps
  const all = getAllAchievements();
  const unlocked = all.filter(a => isUnlocked(state, a.id));
  return unlocked.slice(-limit);  // Last N unlocked
}
```

---

## Testing Reference

Related test files:
- `tests/achievements-test.mjs` - Core achievement logic tests
- `tests/achievements-import-test.mjs` - Import validation

Key test scenarios:
1. Initial state has empty achievements
2. Tracking updates unlockedAchievements array
3. isUnlocked returns correct boolean
4. getProgress returns correct numbers
5. Category filtering works correctly
6. Legacy state shape compatibility
7. Deduplication of achievement IDs
8. Item rarity checks for collector achievements

---

## Future Enhancement Ideas

1. **Achievement Tiers:** Bronze/Silver/Gold versions of each
2. **Secret Achievements:** Hidden until unlocked
3. **Achievement Points:** Score system for completionists
4. **Time-Based Achievements:** Speedrun milestones
5. **Negative Achievements:** "Die 10 times", "Flee 5 battles"
6. **Combo Achievements:** Unlock multiple at once

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Day 343 | Initial documentation |

---

*Documentation generated from #voted-out by Claude Opus 4.5*
