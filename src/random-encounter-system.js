/**
 * Random Encounter System
 * Generates and manages random encounters during exploration
 */

/**
 * Encounter types
 */
export const ENCOUNTER_TYPE = {
  COMBAT: 'combat',
  TREASURE: 'treasure',
  EVENT: 'event',
  MERCHANT: 'merchant',
  REST: 'rest',
  TRAP: 'trap',
  NPC: 'npc',
  NOTHING: 'nothing',
};

/**
 * Location types
 */
export const LOCATION_TYPE = {
  FOREST: 'forest',
  CAVE: 'cave',
  DUNGEON: 'dungeon',
  ROAD: 'road',
  TOWN: 'town',
  MOUNTAIN: 'mountain',
  SWAMP: 'swamp',
  RUINS: 'ruins',
};

/**
 * Encounter rarity
 */
export const ENCOUNTER_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  LEGENDARY: 'legendary',
};

/**
 * Encounter definitions
 */
export const ENCOUNTERS = {
  // Combat encounters
  'wolf-pack': {
    id: 'wolf-pack',
    name: 'Wolf Pack',
    description: 'A pack of hungry wolves blocks your path!',
    type: ENCOUNTER_TYPE.COMBAT,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\uD83D\uDC3A',
    enemies: ['wolf', 'wolf', 'wolf'],
    levelRange: [1, 10],
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.MOUNTAIN],
  },
  'goblin-ambush': {
    id: 'goblin-ambush',
    name: 'Goblin Ambush',
    description: 'Goblins leap from the shadows!',
    type: ENCOUNTER_TYPE.COMBAT,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\uD83D\uDC7A',
    enemies: ['goblin', 'goblin', 'goblin-archer'],
    levelRange: [1, 15],
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.CAVE, LOCATION_TYPE.RUINS],
  },
  'skeletal-patrol': {
    id: 'skeletal-patrol',
    name: 'Skeletal Patrol',
    description: 'Undead warriors rise from the ground!',
    type: ENCOUNTER_TYPE.COMBAT,
    rarity: ENCOUNTER_RARITY.UNCOMMON,
    icon: '\uD83D\uDC80',
    enemies: ['skeleton-warrior', 'skeleton-archer', 'skeleton-mage'],
    levelRange: [5, 20],
    locations: [LOCATION_TYPE.DUNGEON, LOCATION_TYPE.RUINS, LOCATION_TYPE.CAVE],
  },
  'bandit-raid': {
    id: 'bandit-raid',
    name: 'Bandit Raid',
    description: 'Highway bandits demand your gold!',
    type: ENCOUNTER_TYPE.COMBAT,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\uD83D\uDDE1\uFE0F',
    enemies: ['bandit', 'bandit', 'bandit-leader'],
    levelRange: [3, 15],
    locations: [LOCATION_TYPE.ROAD, LOCATION_TYPE.FOREST],
  },
  'elemental-fury': {
    id: 'elemental-fury',
    name: 'Elemental Fury',
    description: 'A powerful elemental spirit attacks!',
    type: ENCOUNTER_TYPE.COMBAT,
    rarity: ENCOUNTER_RARITY.RARE,
    icon: '\uD83C\uDF0A',
    enemies: ['water-elemental', 'fire-elemental'],
    levelRange: [10, 30],
    locations: [LOCATION_TYPE.MOUNTAIN, LOCATION_TYPE.CAVE, LOCATION_TYPE.RUINS],
  },
  'dragon-spawn': {
    id: 'dragon-spawn',
    name: 'Dragon Spawn',
    description: 'A young dragon descends from the sky!',
    type: ENCOUNTER_TYPE.COMBAT,
    rarity: ENCOUNTER_RARITY.LEGENDARY,
    icon: '\uD83D\uDC09',
    enemies: ['young-dragon'],
    levelRange: [15, 50],
    locations: [LOCATION_TYPE.MOUNTAIN, LOCATION_TYPE.CAVE, LOCATION_TYPE.RUINS],
  },

  // Treasure encounters
  'hidden-cache': {
    id: 'hidden-cache',
    name: 'Hidden Cache',
    description: 'You discover a hidden stash of supplies!',
    type: ENCOUNTER_TYPE.TREASURE,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\uD83D\uDCBC',
    lootTable: 'small-cache',
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.CAVE, LOCATION_TYPE.RUINS],
  },
  'treasure-chest': {
    id: 'treasure-chest',
    name: 'Treasure Chest',
    description: 'A gleaming chest catches your eye!',
    type: ENCOUNTER_TYPE.TREASURE,
    rarity: ENCOUNTER_RARITY.UNCOMMON,
    icon: '\uD83D\uDDC3\uFE0F',
    lootTable: 'treasure-chest',
    locations: [LOCATION_TYPE.DUNGEON, LOCATION_TYPE.RUINS, LOCATION_TYPE.CAVE],
  },
  'ancient-vault': {
    id: 'ancient-vault',
    name: 'Ancient Vault',
    description: 'You stumble upon an ancient treasure vault!',
    type: ENCOUNTER_TYPE.TREASURE,
    rarity: ENCOUNTER_RARITY.LEGENDARY,
    icon: '\uD83C\uDFF0',
    lootTable: 'legendary-vault',
    locations: [LOCATION_TYPE.DUNGEON, LOCATION_TYPE.RUINS],
  },

  // Event encounters
  'mysterious-shrine': {
    id: 'mysterious-shrine',
    name: 'Mysterious Shrine',
    description: 'A glowing shrine offers a blessing.',
    type: ENCOUNTER_TYPE.EVENT,
    rarity: ENCOUNTER_RARITY.UNCOMMON,
    icon: '\u26E9\uFE0F',
    effects: [{ type: 'buff', stat: 'all', value: 10, duration: 300 }],
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.MOUNTAIN, LOCATION_TYPE.RUINS],
  },
  'healing-spring': {
    id: 'healing-spring',
    name: 'Healing Spring',
    description: 'A magical spring restores your health!',
    type: ENCOUNTER_TYPE.EVENT,
    rarity: ENCOUNTER_RARITY.UNCOMMON,
    icon: '\uD83D\uDCA7',
    effects: [{ type: 'heal', value: 'full' }],
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.CAVE, LOCATION_TYPE.MOUNTAIN],
  },
  'cursed-artifact': {
    id: 'cursed-artifact',
    name: 'Cursed Artifact',
    description: 'A dark artifact emanates malevolent energy.',
    type: ENCOUNTER_TYPE.EVENT,
    rarity: ENCOUNTER_RARITY.RARE,
    icon: '\uD83D\uDD2E',
    effects: [{ type: 'choice', options: ['take', 'leave'] }],
    locations: [LOCATION_TYPE.DUNGEON, LOCATION_TYPE.RUINS, LOCATION_TYPE.CAVE],
  },

  // Merchant encounters
  'wandering-trader': {
    id: 'wandering-trader',
    name: 'Wandering Trader',
    description: 'A friendly merchant offers their wares.',
    type: ENCOUNTER_TYPE.MERCHANT,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\uD83E\uDDD4',
    shopType: 'general',
    locations: [LOCATION_TYPE.ROAD, LOCATION_TYPE.TOWN, LOCATION_TYPE.FOREST],
  },
  'rare-collector': {
    id: 'rare-collector',
    name: 'Rare Collector',
    description: 'A mysterious collector deals in exotic items.',
    type: ENCOUNTER_TYPE.MERCHANT,
    rarity: ENCOUNTER_RARITY.RARE,
    icon: '\uD83C\uDFA9',
    shopType: 'rare',
    locations: [LOCATION_TYPE.TOWN, LOCATION_TYPE.DUNGEON],
  },

  // Rest encounters
  'safe-haven': {
    id: 'safe-haven',
    name: 'Safe Haven',
    description: 'A sheltered spot perfect for resting.',
    type: ENCOUNTER_TYPE.REST,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\u26FA',
    restBonus: 1.5,
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.CAVE, LOCATION_TYPE.MOUNTAIN],
  },
  'abandoned-camp': {
    id: 'abandoned-camp',
    name: 'Abandoned Camp',
    description: 'A recently abandoned campsite with supplies.',
    type: ENCOUNTER_TYPE.REST,
    rarity: ENCOUNTER_RARITY.UNCOMMON,
    icon: '\uD83C\uDFD5\uFE0F',
    restBonus: 2.0,
    bonusLoot: true,
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.ROAD, LOCATION_TYPE.RUINS],
  },

  // Trap encounters
  'pit-trap': {
    id: 'pit-trap',
    name: 'Pit Trap',
    description: 'The ground gives way beneath you!',
    type: ENCOUNTER_TYPE.TRAP,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\u2B07\uFE0F',
    damage: { type: 'falling', base: 20, scaling: 0.1 },
    avoidCheck: 'agility',
    locations: [LOCATION_TYPE.DUNGEON, LOCATION_TYPE.RUINS, LOCATION_TYPE.CAVE],
  },
  'poison-gas': {
    id: 'poison-gas',
    name: 'Poison Gas',
    description: 'Toxic fumes fill the area!',
    type: ENCOUNTER_TYPE.TRAP,
    rarity: ENCOUNTER_RARITY.UNCOMMON,
    icon: '\u2623\uFE0F',
    damage: { type: 'poison', base: 15, scaling: 0.15, dot: true },
    avoidCheck: 'constitution',
    locations: [LOCATION_TYPE.CAVE, LOCATION_TYPE.SWAMP, LOCATION_TYPE.DUNGEON],
  },
  'arcane-ward': {
    id: 'arcane-ward',
    name: 'Arcane Ward',
    description: 'Magical energy crackles around you!',
    type: ENCOUNTER_TYPE.TRAP,
    rarity: ENCOUNTER_RARITY.RARE,
    icon: '\u26A1',
    damage: { type: 'magic', base: 30, scaling: 0.2 },
    avoidCheck: 'intelligence',
    locations: [LOCATION_TYPE.DUNGEON, LOCATION_TYPE.RUINS],
  },

  // NPC encounters
  'lost-traveler': {
    id: 'lost-traveler',
    name: 'Lost Traveler',
    description: 'A confused traveler asks for directions.',
    type: ENCOUNTER_TYPE.NPC,
    rarity: ENCOUNTER_RARITY.COMMON,
    icon: '\uD83E\uDDD1',
    dialogId: 'lost-traveler',
    rewardType: 'reputation',
    locations: [LOCATION_TYPE.FOREST, LOCATION_TYPE.ROAD, LOCATION_TYPE.MOUNTAIN],
  },
  'wounded-knight': {
    id: 'wounded-knight',
    name: 'Wounded Knight',
    description: 'An injured knight needs assistance.',
    type: ENCOUNTER_TYPE.NPC,
    rarity: ENCOUNTER_RARITY.UNCOMMON,
    icon: '\uD83E\uDD3A',
    dialogId: 'wounded-knight',
    rewardType: 'quest',
    locations: [LOCATION_TYPE.ROAD, LOCATION_TYPE.FOREST, LOCATION_TYPE.RUINS],
  },
  'ancient-spirit': {
    id: 'ancient-spirit',
    name: 'Ancient Spirit',
    description: 'A spectral figure appears before you.',
    type: ENCOUNTER_TYPE.NPC,
    rarity: ENCOUNTER_RARITY.LEGENDARY,
    icon: '\uD83D\uDC7B',
    dialogId: 'ancient-spirit',
    rewardType: 'ability',
    locations: [LOCATION_TYPE.RUINS, LOCATION_TYPE.DUNGEON],
  },
};

/**
 * Base encounter rates by location
 */
export const BASE_ENCOUNTER_RATES = {
  [LOCATION_TYPE.FOREST]: 0.15,
  [LOCATION_TYPE.CAVE]: 0.25,
  [LOCATION_TYPE.DUNGEON]: 0.30,
  [LOCATION_TYPE.ROAD]: 0.10,
  [LOCATION_TYPE.TOWN]: 0.05,
  [LOCATION_TYPE.MOUNTAIN]: 0.20,
  [LOCATION_TYPE.SWAMP]: 0.25,
  [LOCATION_TYPE.RUINS]: 0.25,
};

/**
 * Rarity weights
 */
export const RARITY_WEIGHTS = {
  [ENCOUNTER_RARITY.COMMON]: 60,
  [ENCOUNTER_RARITY.UNCOMMON]: 30,
  [ENCOUNTER_RARITY.RARE]: 8,
  [ENCOUNTER_RARITY.LEGENDARY]: 2,
};

/**
 * Create encounter state
 * @returns {Object} Encounter state
 */
export function createEncounterState() {
  return {
    lastEncounter: null,
    encounterCooldown: 0,
    encounteredIds: [],
    totalEncounters: 0,
    fleesCount: 0,
    encountersWon: 0,
    modifiers: [],
    history: [],
  };
}

/**
 * Check for random encounter
 * @param {Object} state - Encounter state
 * @param {string} location - Current location type
 * @param {number} playerLevel - Player level
 * @returns {Object} Result with encounter or null
 */
export function checkForEncounter(state, location, playerLevel = 1) {
  // Check cooldown
  if (state.encounterCooldown > 0) {
    return {
      state: { ...state, encounterCooldown: state.encounterCooldown - 1 },
      encounter: null,
    };
  }

  // Get base rate
  const baseRate = BASE_ENCOUNTER_RATES[location] || 0.10;

  // Apply modifiers
  let rate = baseRate;
  for (const mod of state.modifiers) {
    if (mod.type === 'encounterRate') {
      rate *= mod.value;
    }
  }

  // Random check
  if (Math.random() > rate) {
    return { state, encounter: null };
  }

  // Generate encounter
  const encounter = generateEncounter(location, playerLevel, state.encounteredIds);
  if (!encounter) {
    return { state, encounter: null };
  }

  // Update state
  const newState = {
    ...state,
    lastEncounter: encounter.id,
    encounterCooldown: 3, // Minimum steps between encounters
    encounteredIds: [...state.encounteredIds, encounter.id],
    totalEncounters: state.totalEncounters + 1,
    history: [
      ...state.history.slice(-49),
      {
        encounterId: encounter.id,
        location,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return { state: newState, encounter };
}

/**
 * Generate a random encounter
 * @param {string} location - Location type
 * @param {number} playerLevel - Player level
 * @param {Array} excludeIds - IDs to exclude (recently encountered)
 * @returns {Object|null} Encounter or null
 */
export function generateEncounter(location, playerLevel = 1, excludeIds = []) {
  // Get valid encounters for location and level
  const validEncounters = Object.values(ENCOUNTERS).filter(e => {
    // Check location
    if (!e.locations.includes(location)) return false;

    // Check level range for combat
    if (e.levelRange) {
      const [min, max] = e.levelRange;
      if (playerLevel < min - 3 || playerLevel > max + 5) return false;
    }

    // Check not recently encountered (for rare/legendary only)
    if (
      (e.rarity === ENCOUNTER_RARITY.RARE || e.rarity === ENCOUNTER_RARITY.LEGENDARY) &&
      excludeIds.includes(e.id)
    ) {
      return false;
    }

    return true;
  });

  if (validEncounters.length === 0) {
    return null;
  }

  // Weight by rarity
  const weighted = validEncounters.flatMap(e => {
    const weight = RARITY_WEIGHTS[e.rarity];
    return Array(weight).fill(e);
  });

  // Random selection
  const selected = weighted[Math.floor(Math.random() * weighted.length)];

  // Create encounter instance
  return createEncounterInstance(selected, playerLevel);
}

/**
 * Create an instance of an encounter
 * @param {Object} encounterDef - Encounter definition
 * @param {number} playerLevel - Player level
 * @returns {Object} Encounter instance
 */
export function createEncounterInstance(encounterDef, playerLevel = 1) {
  const instance = {
    ...encounterDef,
    instanceId: `${encounterDef.id}-${Date.now()}`,
    playerLevel,
    resolved: false,
    outcome: null,
  };

  // Scale combat encounters
  if (instance.type === ENCOUNTER_TYPE.COMBAT && instance.enemies) {
    instance.scaledLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);
  }

  // Scale trap damage
  if (instance.type === ENCOUNTER_TYPE.TRAP && instance.damage) {
    instance.scaledDamage = Math.floor(
      instance.damage.base + instance.damage.scaling * playerLevel
    );
  }

  return instance;
}

/**
 * Resolve encounter
 * @param {Object} state - Encounter state
 * @param {Object} encounter - Encounter to resolve
 * @param {string} outcome - Outcome type
 * @param {Object} details - Additional details
 * @returns {Object} Result with updated state and rewards
 */
export function resolveEncounter(state, encounter, outcome, details = {}) {
  const resolved = {
    ...encounter,
    resolved: true,
    outcome,
    resolvedAt: new Date().toISOString(),
  };

  let rewards = null;
  let stateUpdate = {};

  switch (outcome) {
    case 'victory':
      stateUpdate.encountersWon = state.encountersWon + 1;
      rewards = calculateCombatRewards(encounter);
      break;
    case 'defeat':
      // No rewards on defeat
      break;
    case 'flee':
      stateUpdate.fleesCount = state.fleesCount + 1;
      break;
    case 'collected':
      rewards = calculateTreasureRewards(encounter);
      break;
    case 'completed':
      rewards = calculateEventRewards(encounter, details);
      break;
    case 'avoided':
      // Trap avoided, small xp reward
      rewards = { xp: 10 + encounter.playerLevel };
      break;
    case 'triggered':
      // Trap triggered, return damage
      rewards = { damage: encounter.scaledDamage || encounter.damage?.base || 0 };
      break;
  }

  const newState = {
    ...state,
    ...stateUpdate,
    lastEncounter: resolved,
  };

  return { state: newState, encounter: resolved, rewards };
}

/**
 * Calculate combat rewards
 * @param {Object} encounter - Combat encounter
 * @returns {Object} Rewards
 */
function calculateCombatRewards(encounter) {
  const level = encounter.scaledLevel || encounter.playerLevel;
  const enemyCount = encounter.enemies?.length || 1;

  const rarityMultiplier = {
    [ENCOUNTER_RARITY.COMMON]: 1,
    [ENCOUNTER_RARITY.UNCOMMON]: 1.5,
    [ENCOUNTER_RARITY.RARE]: 2,
    [ENCOUNTER_RARITY.LEGENDARY]: 3,
  };

  const mult = rarityMultiplier[encounter.rarity] || 1;

  return {
    xp: Math.floor(50 * level * enemyCount * mult),
    gold: Math.floor(20 * level * enemyCount * mult),
    items: encounter.rarity === ENCOUNTER_RARITY.LEGENDARY ? ['rare-drop'] : [],
  };
}

/**
 * Calculate treasure rewards
 * @param {Object} encounter - Treasure encounter
 * @returns {Object} Rewards
 */
function calculateTreasureRewards(encounter) {
  const level = encounter.playerLevel;
  const rarityMultiplier = {
    [ENCOUNTER_RARITY.COMMON]: 1,
    [ENCOUNTER_RARITY.UNCOMMON]: 2,
    [ENCOUNTER_RARITY.RARE]: 3,
    [ENCOUNTER_RARITY.LEGENDARY]: 5,
  };

  const mult = rarityMultiplier[encounter.rarity] || 1;

  return {
    gold: Math.floor(50 * mult + level * 10 * mult),
    items: [encounter.lootTable || 'generic-loot'],
  };
}

/**
 * Calculate event rewards
 * @param {Object} encounter - Event encounter
 * @param {Object} details - Resolution details
 * @returns {Object} Rewards
 */
function calculateEventRewards(encounter, details) {
  const effects = encounter.effects || [];
  const rewards = { effects: [] };

  for (const effect of effects) {
    if (effect.type === 'heal') {
      rewards.effects.push({ type: 'heal', value: effect.value });
    } else if (effect.type === 'buff') {
      rewards.effects.push({ ...effect });
    } else if (effect.type === 'choice' && details.choice === 'take') {
      rewards.items = ['cursed-artifact'];
      rewards.effects.push({ type: 'curse', duration: 600 });
    }
  }

  return rewards;
}

/**
 * Add encounter modifier
 * @param {Object} state - Encounter state
 * @param {Object} modifier - Modifier to add
 * @returns {Object} Updated state
 */
export function addEncounterModifier(state, modifier) {
  return {
    ...state,
    modifiers: [...state.modifiers, { ...modifier, addedAt: Date.now() }],
  };
}

/**
 * Remove encounter modifier
 * @param {Object} state - Encounter state
 * @param {string} modifierId - Modifier ID to remove
 * @returns {Object} Updated state
 */
export function removeEncounterModifier(state, modifierId) {
  return {
    ...state,
    modifiers: state.modifiers.filter(m => m.id !== modifierId),
  };
}

/**
 * Clear expired modifiers
 * @param {Object} state - Encounter state
 * @param {number} currentTime - Current timestamp
 * @returns {Object} Updated state
 */
export function clearExpiredModifiers(state, currentTime = Date.now()) {
  return {
    ...state,
    modifiers: state.modifiers.filter(m => {
      if (!m.duration) return true;
      return m.addedAt + m.duration > currentTime;
    }),
  };
}

/**
 * Get encounters by type
 * @param {string} type - Encounter type
 * @returns {Array} Encounters of specified type
 */
export function getEncountersByType(type) {
  return Object.values(ENCOUNTERS).filter(e => e.type === type);
}

/**
 * Get encounters by location
 * @param {string} location - Location type
 * @returns {Array} Encounters available at location
 */
export function getEncountersByLocation(location) {
  return Object.values(ENCOUNTERS).filter(e => e.locations.includes(location));
}

/**
 * Get encounters by rarity
 * @param {string} rarity - Rarity level
 * @returns {Array} Encounters of specified rarity
 */
export function getEncountersByRarity(rarity) {
  return Object.values(ENCOUNTERS).filter(e => e.rarity === rarity);
}

/**
 * Get encounter by ID
 * @param {string} encounterId - Encounter ID
 * @returns {Object|null} Encounter or null
 */
export function getEncounter(encounterId) {
  return ENCOUNTERS[encounterId] || null;
}

/**
 * Get all encounters
 * @returns {Array} All encounter definitions
 */
export function getAllEncounters() {
  return Object.values(ENCOUNTERS);
}

/**
 * Get encounter rate for location
 * @param {Object} state - Encounter state
 * @param {string} location - Location type
 * @returns {number} Effective encounter rate
 */
export function getEncounterRate(state, location) {
  let rate = BASE_ENCOUNTER_RATES[location] || 0.10;

  for (const mod of state.modifiers) {
    if (mod.type === 'encounterRate') {
      rate *= mod.value;
    }
  }

  return Math.min(1, Math.max(0, rate));
}

/**
 * Get encounter stats
 * @param {Object} state - Encounter state
 * @returns {Object} Stats summary
 */
export function getEncounterStats(state) {
  return {
    total: state.totalEncounters,
    won: state.encountersWon,
    fled: state.fleesCount,
    winRate: state.totalEncounters > 0
      ? Math.floor((state.encountersWon / state.totalEncounters) * 100)
      : 0,
    uniqueEncountered: new Set(state.encounteredIds).size,
  };
}

/**
 * Get all location types
 * @returns {Array} Location type values
 */
export function getAllLocationTypes() {
  return Object.values(LOCATION_TYPE);
}

/**
 * Get all encounter types
 * @returns {Array} Encounter type values
 */
export function getAllEncounterTypes() {
  return Object.values(ENCOUNTER_TYPE);
}

/**
 * Get all rarity levels
 * @returns {Array} Rarity values
 */
export function getAllRarities() {
  return Object.values(ENCOUNTER_RARITY);
}
