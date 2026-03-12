/**
 * Equipment Comparison Module — AI Village RPG
 * Owner: Opus 4.5 (Claude Code)
 *
 * Compares equipment items and calculates stat differences
 * to help players make informed gear decisions.
 */

import { items, rarityColors } from './data/items.js';

// ── Stat Definitions ─────────────────────────────────────────────────

const STAT_LABELS = {
  attack: 'ATK',
  defense: 'DEF',
  speed: 'SPD',
  critChance: 'CRIT%',
  critDamage: 'CRIT DMG',
  hp: 'HP',
  mp: 'MP',
  maxHp: 'Max HP',
  maxMp: 'Max MP',
  magicAttack: 'M.ATK',
  magicDefense: 'M.DEF',
  accuracy: 'ACC',
  evasion: 'EVA',
};

const STAT_ICONS = {
  attack: '⚔️',
  defense: '🛡️',
  speed: '💨',
  critChance: '🎯',
  critDamage: '💥',
  hp: '❤️',
  mp: '💧',
  maxHp: '❤️',
  maxMp: '💧',
  magicAttack: '✨',
  magicDefense: '🔮',
  accuracy: '👁️',
  evasion: '🌀',
};

// Higher is better for all stats
const HIGHER_IS_BETTER = {
  attack: true,
  defense: true,
  speed: true,
  critChance: true,
  critDamage: true,
  hp: true,
  mp: true,
  maxHp: true,
  maxMp: true,
  magicAttack: true,
  magicDefense: true,
  accuracy: true,
  evasion: true,
};

// ── Core Comparison Functions ────────────────────────────────────────

/**
 * Get item data from ID or return the item if already an object.
 * @param {string|Object} item - Item ID or item object
 * @returns {Object|null} Item object or null if not found
 */
export function getItemData(item) {
  if (!item) return null;
  if (typeof item === 'string') {
    return items[item] ?? null;
  }
  return item;
}

/**
 * Extract stats from an item.
 * @param {Object} item - Item object
 * @returns {Object} Stats object
 */
export function getItemStats(item) {
  if (!item) return {};
  return item.stats ?? {};
}

/**
 * Compare two items and return stat differences.
 *
 * @param {string|Object} newItem - The item being compared (potential upgrade)
 * @param {string|Object} currentItem - The currently equipped item
 * @returns {Object} Comparison result
 */
export function compareEquipment(newItem, currentItem) {
  const newItemData = getItemData(newItem);
  const currentItemData = getItemData(currentItem);

  if (!newItemData) {
    return { error: 'New item not found', valid: false };
  }

  const newStats = getItemStats(newItemData);
  const currentStats = currentItemData ? getItemStats(currentItemData) : {};

  // Collect all unique stat keys
  const allStatKeys = new Set([
    ...Object.keys(newStats),
    ...Object.keys(currentStats),
  ]);

  const statChanges = [];
  let totalUpgrade = 0;
  let totalDowngrade = 0;

  for (const stat of allStatKeys) {
    const newValue = newStats[stat] ?? 0;
    const currentValue = currentStats[stat] ?? 0;
    const difference = newValue - currentValue;

    if (difference !== 0) {
      const isUpgrade = HIGHER_IS_BETTER[stat] ? difference > 0 : difference < 0;
      const absChange = Math.abs(difference);

      statChanges.push({
        stat,
        label: STAT_LABELS[stat] ?? stat,
        icon: STAT_ICONS[stat] ?? '📊',
        newValue,
        currentValue,
        difference,
        isUpgrade,
        isDowngrade: !isUpgrade,
        percentChange: currentValue !== 0
          ? Math.round((difference / currentValue) * 100)
          : (newValue > 0 ? 100 : -100),
      });

      if (isUpgrade) {
        totalUpgrade += absChange;
      } else {
        totalDowngrade += absChange;
      }
    }
  }

  // Sort by importance (upgrades first, then by absolute difference)
  statChanges.sort((a, b) => {
    if (a.isUpgrade !== b.isUpgrade) return a.isUpgrade ? -1 : 1;
    return Math.abs(b.difference) - Math.abs(a.difference);
  });

  // Calculate overall assessment
  const netChange = totalUpgrade - totalDowngrade;
  const upgrades = statChanges.filter(s => s.isUpgrade).length;
  const downgrades = statChanges.filter(s => s.isDowngrade).length;

  let assessment;
  if (netChange > 5) assessment = 'significant_upgrade';
  else if (netChange > 0) assessment = 'minor_upgrade';
  else if (netChange === 0) assessment = 'sidegrade';
  else if (netChange > -5) assessment = 'minor_downgrade';
  else assessment = 'significant_downgrade';

  return {
    valid: true,
    newItem: newItemData,
    currentItem: currentItemData,
    statChanges,
    summary: {
      upgrades,
      downgrades,
      netChange,
      totalUpgrade,
      totalDowngrade,
      assessment,
    },
  };
}

/**
 * Compare an item against the player's currently equipped item in that slot.
 *
 * @param {Object} state - Game state with player equipment
 * @param {string|Object} newItem - Item to compare
 * @returns {Object} Comparison result with slot info
 */
export function compareWithEquipped(state, newItem) {
  const newItemData = getItemData(newItem);
  if (!newItemData) {
    return { error: 'Item not found', valid: false };
  }

  const slot = getEquipmentSlot(newItemData);
  if (!slot) {
    return { error: 'Item is not equippable', valid: false };
  }

  const equippedItemId = state.player?.equipment?.[slot];
  const comparison = compareEquipment(newItemData, equippedItemId);

  return {
    ...comparison,
    slot,
    slotLabel: getSlotLabel(slot),
    isEmptySlot: !equippedItemId,
  };
}

/**
 * Get the equipment slot for an item.
 * @param {Object} item - Item object
 * @returns {string|null} Slot name or null
 */
export function getEquipmentSlot(item) {
  if (!item) return null;
  const type = item.type ?? item.category;

  switch (type) {
    case 'weapon':
      return 'weapon';
    case 'armor':
    case 'chest':
    case 'body':
      return 'armor';
    case 'helmet':
    case 'head':
      return 'helmet';
    case 'accessory':
    case 'ring':
    case 'amulet':
      return 'accessory';
    case 'shield':
      return 'shield';
    case 'boots':
    case 'feet':
      return 'boots';
    case 'gloves':
    case 'hands':
      return 'gloves';
    default:
      return null;
  }
}

/**
 * Get display label for equipment slot.
 * @param {string} slot - Slot name
 * @returns {string} Display label
 */
export function getSlotLabel(slot) {
  const labels = {
    weapon: 'Weapon',
    armor: 'Armor',
    helmet: 'Helmet',
    accessory: 'Accessory',
    shield: 'Shield',
    boots: 'Boots',
    gloves: 'Gloves',
  };
  return labels[slot] ?? slot;
}

// ── Format Helpers ───────────────────────────────────────────────────

/**
 * Format a stat change as a string.
 * @param {Object} change - Stat change object
 * @returns {string} Formatted string
 */
export function formatStatChange(change) {
  const sign = change.difference > 0 ? '+' : '';
  return `${change.icon} ${change.label}: ${sign}${change.difference}`;
}

/**
 * Format the overall assessment.
 * @param {string} assessment - Assessment type
 * @returns {{ text: string, color: string }} Formatted assessment
 */
export function formatAssessment(assessment) {
  const formats = {
    significant_upgrade: { text: 'Major Upgrade', color: '#00ff00' },
    minor_upgrade: { text: 'Upgrade', color: '#88ff88' },
    sidegrade: { text: 'Sidegrade', color: '#ffff00' },
    minor_downgrade: { text: 'Downgrade', color: '#ff8888' },
    significant_downgrade: { text: 'Major Downgrade', color: '#ff0000' },
  };
  return formats[assessment] ?? { text: 'Unknown', color: '#ffffff' };
}

/**
 * Get rarity color for an item.
 * @param {Object} item - Item object
 * @returns {string} Color hex code
 */
export function getRarityColor(item) {
  if (!item?.rarity) return '#ffffff';
  return rarityColors[item.rarity] ?? '#ffffff';
}
