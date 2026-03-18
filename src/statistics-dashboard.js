/**
 * Statistics Dashboard System
 * Tracks comprehensive game statistics including:
 * - Combat stats (damage dealt/received, hits, misses, crits)
 * - Enemy defeat tracking by type
 * - Gold economy (earned/spent)
 * - Items (crafted/found/consumed)
 * - Quest completion statistics
 * - Time tracking
 */

/**
 * Initialize statistics tracking state
 * @param {Object} state - Current game state
 * @returns {Object} State with initialized statistics
 */
export function initializeStatistics(state) {
  if (state.statistics) {
    return state;
  }
  
  return {
    ...state,
    statistics: createEmptyStatistics()
  };
}

/**
 * Create a fresh statistics object
 * @returns {Object} Empty statistics structure
 */
export function createEmptyStatistics() {
  return {
    combat: {
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      totalHealingDone: 0,
      totalHealingReceived: 0,
      totalHits: 0,
      totalMisses: 0,
      totalCriticalHits: 0,
      totalKills: 0,
      totalDeaths: 0,
      highestSingleHit: 0,
      longestCombo: 0,
      perfectVictories: 0, // Won without taking damage
      closeCalls: 0, // Won with less than 10% HP
      statusEffectsInflicted: 0,
      statusEffectsReceived: 0,
      shieldsDestroyed: 0,
      timesStunned: 0
    },
    enemies: {
      // Tracks count by enemy type
      defeatedByType: {},
      totalDefeated: 0,
      bossesDefeated: 0,
      elitesDefeated: 0,
      minionsDefeated: 0
    },
    economy: {
      goldEarned: 0,
      goldSpent: 0,
      goldFromCombat: 0,
      goldFromQuests: 0,
      goldFromSelling: 0,
      goldSpentOnItems: 0,
      goldSpentOnUpgrades: 0,
      goldSpentOnServices: 0,
      largestPurchase: 0,
      largestSale: 0
    },
    items: {
      totalFound: 0,
      totalCrafted: 0,
      totalConsumed: 0,
      totalSold: 0,
      totalEquipped: 0,
      weaponsFound: 0,
      armorFound: 0,
      accessoriesFound: 0,
      consumablesUsed: 0,
      potionsUsed: 0,
      foodConsumed: 0,
      enchantmentsApplied: 0,
      itemsUpgraded: 0,
      legendaryItemsFound: 0,
      rareItemsFound: 0
    },
    quests: {
      totalCompleted: 0,
      mainQuestsCompleted: 0,
      sideQuestsCompleted: 0,
      dailyChallengesCompleted: 0,
      bountiesCompleted: 0,
      questsFailed: 0,
      questsAbandoned: 0
    },
    exploration: {
      roomsVisited: 0,
      uniqueRoomsVisited: 0,
      secretsDiscovered: 0,
      chestsOpened: 0,
      trapsTriggered: 0,
      trapsDisarmed: 0,
      fastTravelsUsed: 0
    },
    social: {
      npcsTalkedTo: 0,
      reputationGained: 0,
      reputationLost: 0,
      guildTasksCompleted: 0,
      companionLoyaltyEarned: 0
    },
    time: {
      totalPlayTimeSeconds: 0,
      combatTimeSeconds: 0,
      explorationTimeSeconds: 0,
      lastSessionStart: null,
      sessionCount: 0
    }
  };
}

/**
 * Record damage dealt
 * @param {Object} state - Current game state
 * @param {number} amount - Damage amount
 * @param {boolean} isCritical - Whether it was a critical hit
 * @returns {Object} Updated state
 */
export function recordDamageDealt(state, amount, isCritical = false) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        totalDamageDealt: stats.combat.totalDamageDealt + amount,
        totalHits: stats.combat.totalHits + 1,
        totalCriticalHits: isCritical ? stats.combat.totalCriticalHits + 1 : stats.combat.totalCriticalHits,
        highestSingleHit: Math.max(stats.combat.highestSingleHit, amount)
      }
    }
  };
}

/**
 * Record damage received
 * @param {Object} state - Current game state
 * @param {number} amount - Damage amount
 * @returns {Object} Updated state
 */
export function recordDamageReceived(state, amount) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        totalDamageReceived: stats.combat.totalDamageReceived + amount
      }
    }
  };
}

/**
 * Record a missed attack
 * @param {Object} state - Current game state
 * @returns {Object} Updated state
 */
export function recordMiss(state) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        totalMisses: stats.combat.totalMisses + 1
      }
    }
  };
}

/**
 * Record healing done or received
 * @param {Object} state - Current game state
 * @param {number} amount - Healing amount
 * @param {boolean} isReceived - Whether player received the healing
 * @returns {Object} Updated state
 */
export function recordHealing(state, amount, isReceived = false) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        totalHealingDone: isReceived ? stats.combat.totalHealingDone : stats.combat.totalHealingDone + amount,
        totalHealingReceived: isReceived ? stats.combat.totalHealingReceived + amount : stats.combat.totalHealingReceived
      }
    }
  };
}

/**
 * Record an enemy defeat
 * @param {Object} state - Current game state
 * @param {string} enemyType - Type of enemy defeated
 * @param {string} enemyTier - Tier: 'normal', 'elite', 'boss', 'minion'
 * @returns {Object} Updated state
 */
export function recordEnemyDefeated(state, enemyType, enemyTier = 'normal') {
  const stats = state.statistics || createEmptyStatistics();
  const currentCount = stats.enemies.defeatedByType[enemyType] || 0;
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        totalKills: stats.combat.totalKills + 1
      },
      enemies: {
        ...stats.enemies,
        defeatedByType: {
          ...stats.enemies.defeatedByType,
          [enemyType]: currentCount + 1
        },
        totalDefeated: stats.enemies.totalDefeated + 1,
        bossesDefeated: enemyTier === 'boss' ? stats.enemies.bossesDefeated + 1 : stats.enemies.bossesDefeated,
        elitesDefeated: enemyTier === 'elite' ? stats.enemies.elitesDefeated + 1 : stats.enemies.elitesDefeated,
        minionsDefeated: enemyTier === 'minion' ? stats.enemies.minionsDefeated + 1 : stats.enemies.minionsDefeated
      }
    }
  };
}

/**
 * Record gold earned
 * @param {Object} state - Current game state
 * @param {number} amount - Gold amount
 * @param {string} source - Source: 'combat', 'quest', 'selling', 'other'
 * @returns {Object} Updated state
 */
export function recordGoldEarned(state, amount, source = 'other') {
  const stats = state.statistics || createEmptyStatistics();
  
  const sourceField = {
    combat: 'goldFromCombat',
    quest: 'goldFromQuests',
    selling: 'goldFromSelling'
  }[source];
  
  const updatedEconomy = {
    ...stats.economy,
    goldEarned: stats.economy.goldEarned + amount
  };
  
  if (sourceField) {
    updatedEconomy[sourceField] = stats.economy[sourceField] + amount;
  }
  
  if (source === 'selling') {
    updatedEconomy.largestSale = Math.max(stats.economy.largestSale, amount);
  }
  
  return {
    ...state,
    statistics: {
      ...stats,
      economy: updatedEconomy
    }
  };
}

/**
 * Record gold spent
 * @param {Object} state - Current game state
 * @param {number} amount - Gold amount
 * @param {string} category - Category: 'items', 'upgrades', 'services'
 * @returns {Object} Updated state
 */
export function recordGoldSpent(state, amount, category = 'items') {
  const stats = state.statistics || createEmptyStatistics();
  
  const categoryField = {
    items: 'goldSpentOnItems',
    upgrades: 'goldSpentOnUpgrades',
    services: 'goldSpentOnServices'
  }[category] || 'goldSpentOnItems';
  
  return {
    ...state,
    statistics: {
      ...stats,
      economy: {
        ...stats.economy,
        goldSpent: stats.economy.goldSpent + amount,
        [categoryField]: stats.economy[categoryField] + amount,
        largestPurchase: Math.max(stats.economy.largestPurchase, amount)
      }
    }
  };
}

/**
 * Record an item found
 * @param {Object} state - Current game state
 * @param {string} itemType - Type: 'weapon', 'armor', 'accessory', 'consumable', 'other'
 * @param {string} rarity - Rarity: 'common', 'uncommon', 'rare', 'epic', 'legendary'
 * @returns {Object} Updated state
 */
export function recordItemFound(state, itemType = 'other', rarity = 'common') {
  const stats = state.statistics || createEmptyStatistics();
  
  const typeCounters = {
    weapon: 'weaponsFound',
    armor: 'armorFound',
    accessory: 'accessoriesFound'
  };
  
  const typeField = typeCounters[itemType];
  
  return {
    ...state,
    statistics: {
      ...stats,
      items: {
        ...stats.items,
        totalFound: stats.items.totalFound + 1,
        [typeField]: typeField ? stats.items[typeField] + 1 : stats.items[typeField],
        legendaryItemsFound: rarity === 'legendary' ? stats.items.legendaryItemsFound + 1 : stats.items.legendaryItemsFound,
        rareItemsFound: rarity === 'rare' || rarity === 'epic' ? stats.items.rareItemsFound + 1 : stats.items.rareItemsFound
      }
    }
  };
}

/**
 * Record an item crafted
 * @param {Object} state - Current game state
 * @returns {Object} Updated state
 */
export function recordItemCrafted(state) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      items: {
        ...stats.items,
        totalCrafted: stats.items.totalCrafted + 1
      }
    }
  };
}

/**
 * Record a consumable used
 * @param {Object} state - Current game state
 * @param {string} consumableType - Type: 'potion', 'food', 'other'
 * @returns {Object} Updated state
 */
export function recordConsumableUsed(state, consumableType = 'other') {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      items: {
        ...stats.items,
        totalConsumed: stats.items.totalConsumed + 1,
        consumablesUsed: stats.items.consumablesUsed + 1,
        potionsUsed: consumableType === 'potion' ? stats.items.potionsUsed + 1 : stats.items.potionsUsed,
        foodConsumed: consumableType === 'food' ? stats.items.foodConsumed + 1 : stats.items.foodConsumed
      }
    }
  };
}

/**
 * Record a quest completed
 * @param {Object} state - Current game state
 * @param {string} questType - Type: 'main', 'side', 'daily', 'bounty'
 * @returns {Object} Updated state
 */
export function recordQuestCompleted(state, questType = 'side') {
  const stats = state.statistics || createEmptyStatistics();
  
  const typeCounters = {
    main: 'mainQuestsCompleted',
    side: 'sideQuestsCompleted',
    daily: 'dailyChallengesCompleted',
    bounty: 'bountiesCompleted'
  };
  
  const typeField = typeCounters[questType] || 'sideQuestsCompleted';
  
  return {
    ...state,
    statistics: {
      ...stats,
      quests: {
        ...stats.quests,
        totalCompleted: stats.quests.totalCompleted + 1,
        [typeField]: stats.quests[typeField] + 1
      }
    }
  };
}

/**
 * Record a room visited
 * @param {Object} state - Current game state
 * @param {string} roomId - Room identifier
 * @param {boolean} isFirstVisit - Whether this is the first visit
 * @returns {Object} Updated state
 */
export function recordRoomVisited(state, roomId, isFirstVisit = false) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      exploration: {
        ...stats.exploration,
        roomsVisited: stats.exploration.roomsVisited + 1,
        uniqueRoomsVisited: isFirstVisit ? stats.exploration.uniqueRoomsVisited + 1 : stats.exploration.uniqueRoomsVisited
      }
    }
  };
}

/**
 * Record a perfect victory (no damage taken)
 * @param {Object} state - Current game state
 * @returns {Object} Updated state
 */
export function recordPerfectVictory(state) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        perfectVictories: stats.combat.perfectVictories + 1
      }
    }
  };
}

/**
 * Record a close call victory (less than 10% HP remaining)
 * @param {Object} state - Current game state
 * @returns {Object} Updated state
 */
export function recordCloseCall(state) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        closeCalls: stats.combat.closeCalls + 1
      }
    }
  };
}

/**
 * Record combo length
 * @param {Object} state - Current game state
 * @param {number} comboLength - Length of combo achieved
 * @returns {Object} Updated state
 */
export function recordCombo(state, comboLength) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      combat: {
        ...stats.combat,
        longestCombo: Math.max(stats.combat.longestCombo, comboLength)
      }
    }
  };
}

/**
 * Record play time
 * @param {Object} state - Current game state
 * @param {number} seconds - Seconds to add
 * @param {string} activity - Activity type: 'combat', 'exploration', 'general'
 * @returns {Object} Updated state
 */
export function recordPlayTime(state, seconds, activity = 'general') {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    ...state,
    statistics: {
      ...stats,
      time: {
        ...stats.time,
        totalPlayTimeSeconds: stats.time.totalPlayTimeSeconds + seconds,
        combatTimeSeconds: activity === 'combat' ? stats.time.combatTimeSeconds + seconds : stats.time.combatTimeSeconds,
        explorationTimeSeconds: activity === 'exploration' ? stats.time.explorationTimeSeconds + seconds : stats.time.explorationTimeSeconds
      }
    }
  };
}

/**
 * Get formatted statistics summary
 * @param {Object} state - Current game state
 * @returns {Object} Formatted statistics for display
 */
export function getStatisticsSummary(state) {
  const stats = state.statistics || createEmptyStatistics();
  
  return {
    combat: {
      damageDealt: stats.combat.totalDamageDealt,
      damageReceived: stats.combat.totalDamageReceived,
      healingDone: stats.combat.totalHealingDone,
      hits: stats.combat.totalHits,
      misses: stats.combat.totalMisses,
      criticalHits: stats.combat.totalCriticalHits,
      damageRatio: stats.combat.totalDamageReceived > 0 
        ? (stats.combat.totalDamageDealt / stats.combat.totalDamageReceived).toFixed(2) 
        : 'N/A',
      accuracy: stats.combat.totalHits + stats.combat.totalMisses > 0
        ? ((stats.combat.totalHits / (stats.combat.totalHits + stats.combat.totalMisses)) * 100).toFixed(1) + '%'
        : 'N/A',
      critRate: stats.combat.totalHits > 0
        ? ((stats.combat.totalCriticalHits / stats.combat.totalHits) * 100).toFixed(1) + '%'
        : 'N/A',
      killDeathRatio: stats.combat.totalDeaths > 0
        ? (stats.combat.totalKills / stats.combat.totalDeaths).toFixed(2)
        : stats.combat.totalKills.toString(),
      highestHit: stats.combat.highestSingleHit,
      longestCombo: stats.combat.longestCombo,
      perfectVictories: stats.combat.perfectVictories,
      closeCalls: stats.combat.closeCalls
    },
    enemies: {
      totalDefeated: stats.enemies.totalDefeated,
      bossesDefeated: stats.enemies.bossesDefeated,
      elitesDefeated: stats.enemies.elitesDefeated,
      defeatedByType: stats.enemies.defeatedByType
    },
    economy: {
      goldEarned: stats.economy.goldEarned,
      goldSpent: stats.economy.goldSpent,
      netGold: stats.economy.goldEarned - stats.economy.goldSpent,
      goldFromCombat: stats.economy.goldFromCombat,
      goldFromQuests: stats.economy.goldFromQuests,
      largestPurchase: stats.economy.largestPurchase,
      largestSale: stats.economy.largestSale
    },
    items: {
      totalFound: stats.items.totalFound,
      totalCrafted: stats.items.totalCrafted,
      consumablesUsed: stats.items.consumablesUsed,
      legendaryItemsFound: stats.items.legendaryItemsFound,
      rareItemsFound: stats.items.rareItemsFound
    },
    quests: {
      totalCompleted: stats.quests.totalCompleted,
      mainQuestsCompleted: stats.quests.mainQuestsCompleted,
      sideQuestsCompleted: stats.quests.sideQuestsCompleted,
      dailyChallengesCompleted: stats.quests.dailyChallengesCompleted,
      bountiesCompleted: stats.quests.bountiesCompleted
    },
    exploration: {
      uniqueRoomsVisited: stats.exploration.uniqueRoomsVisited,
      secretsDiscovered: stats.exploration.secretsDiscovered,
      chestsOpened: stats.exploration.chestsOpened
    },
    time: {
      totalPlayTime: formatPlayTime(stats.time.totalPlayTimeSeconds),
      combatTime: formatPlayTime(stats.time.combatTimeSeconds),
      explorationTime: formatPlayTime(stats.time.explorationTimeSeconds)
    }
  };
}

/**
 * Format seconds into human-readable time
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string
 */
function formatPlayTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Get top enemies defeated
 * @param {Object} state - Current game state
 * @param {number} limit - Number of top enemies to return
 * @returns {Array} Array of {type, count} sorted by count descending
 */
export function getTopEnemiesDefeated(state, limit = 5) {
  const stats = state.statistics || createEmptyStatistics();
  const entries = Object.entries(stats.enemies.defeatedByType);
  
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([type, count]) => ({ type, count }));
}

export default {
  initializeStatistics,
  createEmptyStatistics,
  recordDamageDealt,
  recordDamageReceived,
  recordMiss,
  recordHealing,
  recordEnemyDefeated,
  recordGoldEarned,
  recordGoldSpent,
  recordItemFound,
  recordItemCrafted,
  recordConsumableUsed,
  recordQuestCompleted,
  recordRoomVisited,
  recordPerfectVictory,
  recordCloseCall,
  recordCombo,
  recordPlayTime,
  getStatisticsSummary,
  getTopEnemiesDefeated
};
