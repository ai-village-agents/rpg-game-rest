/**
 * Equipment Set Bonus System
 * Wearing matching gear pieces grants additional bonuses
 */

/**
 * Equipment slots
 */
export const EQUIPMENT_SLOTS = {
  HEAD: 'head',
  BODY: 'body',
  HANDS: 'hands',
  LEGS: 'legs',
  FEET: 'feet',
  WEAPON: 'weapon',
  SHIELD: 'shield',
  ACCESSORY: 'accessory',
};

/**
 * Set data definitions
 */
export const EQUIPMENT_SETS = {
  'warriors-might': {
    id: 'warriors-might',
    name: "Warrior's Might",
    icon: '\u2694\uFE0F',
    description: 'Heavy armor forged for battle.',
    pieces: {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'warriors-gauntlets',
      legs: 'warriors-greaves',
      feet: 'warriors-boots',
    },
    bonuses: {
      2: { defense: 10, description: '+10 Defense' },
      3: { defense: 20, hp: 50, description: '+20 Defense, +50 HP' },
      5: { defense: 35, hp: 100, attackPercent: 0.1, description: '+35 DEF, +100 HP, +10% ATK' },
    },
  },
  'shadow-assassin': {
    id: 'shadow-assassin',
    name: 'Shadow Assassin',
    icon: '\uD83D\uDDE1\uFE0F',
    description: 'Light armor for swift strikes.',
    pieces: {
      head: 'shadow-hood',
      body: 'shadow-vest',
      hands: 'shadow-gloves',
      legs: 'shadow-pants',
      feet: 'shadow-boots',
    },
    bonuses: {
      2: { speed: 15, description: '+15 Speed' },
      3: { speed: 25, critChance: 0.05, description: '+25 SPD, +5% Crit' },
      5: { speed: 40, critChance: 0.15, critDamage: 0.3, description: '+40 SPD, +15% Crit, +30% Crit DMG' },
    },
  },
  'arcane-scholar': {
    id: 'arcane-scholar',
    name: 'Arcane Scholar',
    icon: '\uD83D\uDCDA',
    description: 'Robes enhancing magical power.',
    pieces: {
      head: 'arcane-hat',
      body: 'arcane-robe',
      hands: 'arcane-bracers',
      legs: 'arcane-sash',
      accessory: 'arcane-pendant',
    },
    bonuses: {
      2: { magic: 15, description: '+15 Magic' },
      3: { magic: 30, mp: 40, description: '+30 Magic, +40 MP' },
      5: { magic: 50, mp: 80, mpRegen: 0.1, description: '+50 MAG, +80 MP, +10% MP Regen' },
    },
  },
  'holy-guardian': {
    id: 'holy-guardian',
    name: 'Holy Guardian',
    icon: '\u2728',
    description: 'Blessed armor of protection.',
    pieces: {
      head: 'holy-crown',
      body: 'holy-vestments',
      hands: 'holy-gloves',
      shield: 'holy-shield',
      accessory: 'holy-amulet',
    },
    bonuses: {
      2: { healingBonus: 0.15, description: '+15% Healing' },
      3: { healingBonus: 0.25, defense: 15, description: '+25% Heal, +15 DEF' },
      5: { healingBonus: 0.4, defense: 30, statusResist: 0.2, description: '+40% Heal, +30 DEF, +20% Status Resist' },
    },
  },
  'berserker-fury': {
    id: 'berserker-fury',
    name: 'Berserker Fury',
    icon: '\uD83D\uDCA2',
    description: 'Gear that grows stronger as HP drops.',
    pieces: {
      head: 'berserker-helm',
      body: 'berserker-harness',
      hands: 'berserker-bracers',
      weapon: 'berserker-axe',
    },
    bonuses: {
      2: { attack: 20, description: '+20 Attack' },
      3: { attack: 35, lowHpBonus: 0.2, description: '+35 ATK, +20% DMG when HP < 30%' },
      4: { attack: 50, lowHpBonus: 0.4, lifesteal: 0.1, description: '+50 ATK, +40% low HP DMG, +10% Lifesteal' },
    },
  },
  'frost-warden': {
    id: 'frost-warden',
    name: 'Frost Warden',
    icon: '\u2744\uFE0F',
    description: 'Ice-enchanted armor.',
    pieces: {
      head: 'frost-helm',
      body: 'frost-mail',
      hands: 'frost-gauntlets',
      feet: 'frost-boots',
      weapon: 'frost-blade',
    },
    bonuses: {
      2: { iceBonus: 0.15, description: '+15% Ice Damage' },
      3: { iceBonus: 0.25, freezeChance: 0.1, description: '+25% Ice DMG, +10% Freeze Chance' },
      5: { iceBonus: 0.4, freezeChance: 0.2, iceResist: 0.5, description: '+40% Ice, +20% Freeze, +50% Ice Resist' },
    },
  },
  'flame-knight': {
    id: 'flame-knight',
    name: 'Flame Knight',
    icon: '\uD83D\uDD25',
    description: 'Fire-enchanted armor.',
    pieces: {
      head: 'flame-helm',
      body: 'flame-plate',
      hands: 'flame-gauntlets',
      legs: 'flame-greaves',
      weapon: 'flame-sword',
    },
    bonuses: {
      2: { fireBonus: 0.15, description: '+15% Fire Damage' },
      3: { fireBonus: 0.25, burnChance: 0.1, description: '+25% Fire DMG, +10% Burn Chance' },
      5: { fireBonus: 0.4, burnChance: 0.2, fireResist: 0.5, description: '+40% Fire, +20% Burn, +50% Fire Resist' },
    },
  },
  'void-walker': {
    id: 'void-walker',
    name: 'Void Walker',
    icon: '\uD83C\uDF11',
    description: 'Dark armor from the void.',
    pieces: {
      head: 'void-mask',
      body: 'void-cloak',
      hands: 'void-gloves',
      accessory: 'void-ring',
    },
    bonuses: {
      2: { shadowBonus: 0.2, description: '+20% Shadow Damage' },
      3: { shadowBonus: 0.35, evasion: 0.1, description: '+35% Shadow DMG, +10% Evasion' },
      4: { shadowBonus: 0.5, evasion: 0.2, shadowResist: 0.3, description: '+50% Shadow, +20% Evade, +30% Shadow Resist' },
    },
  },
  rustySet: {
    id: 'rustySet',
    name: 'Rusty Set',
    icon: '🗡️',
    description: 'Old but sturdy starter gear.',
    pieces: {
      weapon: 'rustySword',
      armor: 'leatherArmor',
    },
    bonuses: {
      2: { attack: 3, defense: 2, speed: 1, description: '+3 ATK, +2 DEF, +1 SPD' },
    },
  },
  ironSet: {
    id: 'ironSet',
    name: 'Iron Set',
    icon: '⚔️',
    description: 'Dependable iron equipment for seasoned fighters.',
    pieces: {
      weapon: 'ironSword',
      armor: 'chainmail',
    },
    bonuses: {
      2: { attack: 6, defense: 8, critChance: 2, description: '+6 ATK, +8 DEF, +2% Crit' },
    },
  },
};

/**
 * Get set data by ID
 */
export function getSetData(setId) {
  return EQUIPMENT_SETS[setId] || null;
}

/**
 * Get all available sets
 */
export function getAllSets() {
  return Object.keys(EQUIPMENT_SETS);
}

/**
 * Check which set an item belongs to
 */
export function getItemSetInfo(itemId) {
  for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
    for (const [slot, pieceId] of Object.entries(setData.pieces)) {
      if (pieceId === itemId) {
        return { setId, slot, setName: setData.name };
      }
    }
  }
  return null;
}

/**
 * Count equipped pieces of a set
 */
export function countEquippedSetPieces(equipment, setId) {
  const setData = EQUIPMENT_SETS[setId];
  if (!setData || !equipment) return 0;

  let count = 0;
  for (const [slot, pieceId] of Object.entries(setData.pieces)) {
    if (equipment[slot] === pieceId) {
      count++;
    }
  }
  return count;
}

/**
 * Get active set bonuses for equipped items
 */
export function getActiveSetBonuses(equipment) {
  if (!equipment) return [];

  const activeBonuses = [];

  for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
    const pieceCount = countEquippedSetPieces(equipment, setId);

    if (pieceCount >= 2) {
      const bonusThresholds = Object.keys(setData.bonuses)
        .map(Number)
        .filter(t => pieceCount >= t)
        .sort((a, b) => b - a);

      if (bonusThresholds.length > 0) {
        const threshold = bonusThresholds[0];
        activeBonuses.push({
          setId,
          setName: setData.name,
          icon: setData.icon,
          pieces: pieceCount,
          threshold,
          totalPieces: Object.keys(setData.pieces).length,
          bonus: setData.bonuses[threshold],
        });
      }
    }
  }

  return activeBonuses;
}

/**
 * Calculate total stat bonuses from all active sets
 */
export function calculateSetBonusStats(equipment) {
  const activeBonuses = getActiveSetBonuses(equipment);
  const totalStats = {};

  for (const activeSet of activeBonuses) {
    const { bonus } = activeSet;
    for (const [stat, value] of Object.entries(bonus)) {
      if (stat === 'description') continue;
      if (typeof value === 'number') {
        totalStats[stat] = (totalStats[stat] || 0) + value;
      }
    }
  }

  return totalStats;
}

/**
 * Apply set bonuses to base stats
 */
export function applySetBonusesToStats(baseStats, equipment) {
  if (!baseStats) return baseStats;

  const setBonuses = calculateSetBonusStats(equipment);
  const modifiedStats = { ...baseStats };

  const flatStats = ['hp', 'mp', 'attack', 'defense', 'magic', 'speed'];
  for (const stat of flatStats) {
    if (setBonuses[stat]) {
      modifiedStats[stat] = (modifiedStats[stat] || 0) + setBonuses[stat];
    }
  }

  if (setBonuses.attackPercent && modifiedStats.attack) {
    modifiedStats.attack = Math.floor(modifiedStats.attack * (1 + setBonuses.attackPercent));
  }

  if (setBonuses.mpRegen) {
    modifiedStats.mpRegen = (modifiedStats.mpRegen || 0) + setBonuses.mpRegen;
  }

  const specialStats = [
    'critChance', 'critDamage', 'healingBonus', 'statusResist',
    'lowHpBonus', 'lifesteal', 'evasion',
    'iceBonus', 'fireBonus', 'shadowBonus',
    'freezeChance', 'burnChance',
    'iceResist', 'fireResist', 'shadowResist',
  ];

  for (const stat of specialStats) {
    if (setBonuses[stat]) {
      modifiedStats[stat] = (modifiedStats[stat] || 0) + setBonuses[stat];
    }
  }

  return modifiedStats;
}

/**
 * Get set progress info
 */
export function getSetProgress(equipment, setId) {
  const setData = EQUIPMENT_SETS[setId];
  if (!setData) {
    return { found: false };
  }

  const pieceCount = countEquippedSetPieces(equipment, setId);
  const totalPieces = Object.keys(setData.pieces).length;
  const bonusThresholds = Object.keys(setData.bonuses).map(Number).sort((a, b) => a - b);

  let currentBonus = null;
  let nextBonus = null;
  let nextThreshold = null;

  for (const threshold of bonusThresholds) {
    if (pieceCount >= threshold) {
      currentBonus = setData.bonuses[threshold];
    } else if (!nextBonus) {
      nextBonus = setData.bonuses[threshold];
      nextThreshold = threshold;
    }
  }

  return {
    found: true,
    setId,
    setName: setData.name,
    icon: setData.icon,
    description: setData.description,
    equippedPieces: pieceCount,
    totalPieces,
    currentBonus,
    nextBonus,
    nextThreshold,
    piecesNeededForNext: nextThreshold ? nextThreshold - pieceCount : 0,
  };
}

/**
 * Get all set pieces with equipped status
 */
export function getSetPieceStatus(equipment, setId) {
  const setData = EQUIPMENT_SETS[setId];
  if (!setData) return [];

  return Object.entries(setData.pieces).map(([slot, pieceId]) => ({
    slot,
    pieceId,
    equipped: equipment?.[slot] === pieceId,
  }));
}

/**
 * Find sets that an item contributes to
 */
export function findSetsContainingItem(itemId) {
  const sets = [];
  for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
    if (Object.values(setData.pieces).includes(itemId)) {
      sets.push(setId);
    }
  }
  return sets;
}

/**
 * Check if equipping an item would advance a set bonus
 */
export function checkSetAdvancement(equipment, slot, itemId) {
  const itemSetInfo = getItemSetInfo(itemId);
  if (!itemSetInfo) return null;

  const { setId } = itemSetInfo;
  const currentPieces = countEquippedSetPieces(equipment, setId);

  const newEquipment = { ...equipment, [slot]: itemId };
  const newPieces = countEquippedSetPieces(newEquipment, setId);

  if (newPieces > currentPieces) {
    const setData = EQUIPMENT_SETS[setId];
    const bonusThresholds = Object.keys(setData.bonuses).map(Number).sort((a, b) => a - b);

    let newBonusUnlocked = null;
    for (const threshold of bonusThresholds) {
      if (currentPieces < threshold && newPieces >= threshold) {
        newBonusUnlocked = { threshold, bonus: setData.bonuses[threshold] };
        break;
      }
    }

    return {
      setId,
      setName: setData.name,
      icon: setData.icon,
      previousPieces: currentPieces,
      newPieces,
      newBonusUnlocked,
    };
  }

  return null;
}

/**
 * Get summary of all equipped set bonuses
 */
export function getEquipmentSetSummary(equipment) {
  const activeBonuses = getActiveSetBonuses(equipment);
  const totalStats = calculateSetBonusStats(equipment);

  return {
    activeSets: activeBonuses,
    totalBonusStats: totalStats,
    setCount: activeBonuses.length,
  };
}

export const equipmentSets = Object.values(EQUIPMENT_SETS);
