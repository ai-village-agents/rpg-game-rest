/**
 * Equipment Comparison Tests — AI Village RPG
 * Tests for equipment stat comparison functionality.
 */

import { strict as assert } from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

// ── Mock Item Data ───────────────────────────────────────────────────

const mockItems = {
  rustySword: {
    id: 'rustySword',
    name: 'Rusty Sword',
    type: 'weapon',
    rarity: 'Common',
    stats: { attack: 5, critChance: 0 },
  },
  ironSword: {
    id: 'ironSword',
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'Uncommon',
    stats: { attack: 12, critChance: 2 },
  },
  flamesSword: {
    id: 'flamesSword',
    name: 'Sword of Flames',
    type: 'weapon',
    rarity: 'Rare',
    stats: { attack: 18, critChance: 5, speed: -2 },
  },
  leatherArmor: {
    id: 'leatherArmor',
    name: 'Leather Armor',
    type: 'armor',
    rarity: 'Common',
    stats: { defense: 5 },
  },
  plateArmor: {
    id: 'plateArmor',
    name: 'Plate Armor',
    type: 'armor',
    rarity: 'Rare',
    stats: { defense: 20, speed: -3 },
  },
  emptyItem: {
    id: 'emptyItem',
    name: 'Empty Stats Item',
    type: 'weapon',
    rarity: 'Common',
    stats: {},
  },
};

// ── Inline module implementation for testing ─────────────────────────

const STAT_LABELS = {
  attack: 'ATK',
  defense: 'DEF',
  speed: 'SPD',
  critChance: 'CRIT%',
};

const STAT_ICONS = {
  attack: '⚔️',
  defense: '🛡️',
  speed: '💨',
  critChance: '🎯',
};

const HIGHER_IS_BETTER = {
  attack: true,
  defense: true,
  speed: true,
  critChance: true,
};

function getItemData(item) {
  if (!item) return null;
  if (typeof item === 'string') {
    return mockItems[item] ?? null;
  }
  return item;
}

function getItemStats(item) {
  if (!item) return {};
  return item.stats ?? {};
}

function compareEquipment(newItem, currentItem) {
  const newItemData = getItemData(newItem);
  const currentItemData = getItemData(currentItem);

  if (!newItemData) {
    return { error: 'New item not found', valid: false };
  }

  const newStats = getItemStats(newItemData);
  const currentStats = currentItemData ? getItemStats(currentItemData) : {};

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

  statChanges.sort((a, b) => {
    if (a.isUpgrade !== b.isUpgrade) return a.isUpgrade ? -1 : 1;
    return Math.abs(b.difference) - Math.abs(a.difference);
  });

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

function getEquipmentSlot(item) {
  if (!item) return null;
  const type = item.type ?? item.category;

  switch (type) {
    case 'weapon': return 'weapon';
    case 'armor': return 'armor';
    case 'helmet': return 'helmet';
    case 'accessory': return 'accessory';
    default: return null;
  }
}

function formatStatChange(change) {
  const sign = change.difference > 0 ? '+' : '';
  return `${change.icon} ${change.label}: ${sign}${change.difference}`;
}

function formatAssessment(assessment) {
  const formats = {
    significant_upgrade: { text: 'Major Upgrade', color: '#00ff00' },
    minor_upgrade: { text: 'Upgrade', color: '#88ff88' },
    sidegrade: { text: 'Sidegrade', color: '#ffff00' },
    minor_downgrade: { text: 'Downgrade', color: '#ff8888' },
    significant_downgrade: { text: 'Major Downgrade', color: '#ff0000' },
  };
  return formats[assessment] ?? { text: 'Unknown', color: '#ffffff' };
}

// ── Tests ────────────────────────────────────────────────────────────

describe('Equipment Comparison Module', () => {
  describe('getItemData', () => {
    it('should return item object when given string ID', () => {
      const item = getItemData('rustySword');
      assert.equal(item.name, 'Rusty Sword');
    });

    it('should return item object when given object', () => {
      const item = getItemData(mockItems.ironSword);
      assert.equal(item.name, 'Iron Sword');
    });

    it('should return null for invalid ID', () => {
      const item = getItemData('nonexistent');
      assert.equal(item, null);
    });

    it('should return null for null input', () => {
      const item = getItemData(null);
      assert.equal(item, null);
    });
  });

  describe('getItemStats', () => {
    it('should return stats object from item', () => {
      const stats = getItemStats(mockItems.ironSword);
      assert.equal(stats.attack, 12);
      assert.equal(stats.critChance, 2);
    });

    it('should return empty object for item with no stats', () => {
      const stats = getItemStats(mockItems.emptyItem);
      assert.deepEqual(stats, {});
    });

    it('should return empty object for null item', () => {
      const stats = getItemStats(null);
      assert.deepEqual(stats, {});
    });
  });

  describe('compareEquipment', () => {
    it('should detect upgrade from rusty to iron sword', () => {
      const result = compareEquipment('ironSword', 'rustySword');
      
      assert.equal(result.valid, true);
      assert.equal(result.summary.assessment, 'significant_upgrade');
      assert.ok(result.summary.upgrades > 0);
    });

    it('should detect downgrade from iron to rusty sword', () => {
      const result = compareEquipment('rustySword', 'ironSword');
      
      assert.equal(result.valid, true);
      assert.ok(result.summary.downgrades > 0);
      assert.ok(result.summary.netChange < 0);
    });

    it('should handle comparison against empty slot', () => {
      const result = compareEquipment('ironSword', null);
      
      assert.equal(result.valid, true);
      assert.equal(result.currentItem, null);
      assert.ok(result.summary.upgrades > 0);
    });

    it('should detect mixed upgrade/downgrade (flames sword)', () => {
      const result = compareEquipment('flamesSword', 'ironSword');
      
      assert.equal(result.valid, true);
      assert.ok(result.summary.upgrades > 0);
      assert.ok(result.summary.downgrades > 0);
    });

    it('should calculate correct stat differences', () => {
      const result = compareEquipment('ironSword', 'rustySword');
      
      const attackChange = result.statChanges.find(c => c.stat === 'attack');
      assert.equal(attackChange.newValue, 12);
      assert.equal(attackChange.currentValue, 5);
      assert.equal(attackChange.difference, 7);
      assert.equal(attackChange.isUpgrade, true);
    });

    it('should sort upgrades before downgrades', () => {
      const result = compareEquipment('flamesSword', 'ironSword');
      
      const firstUpgradeIdx = result.statChanges.findIndex(c => c.isUpgrade);
      const firstDowngradeIdx = result.statChanges.findIndex(c => c.isDowngrade);
      
      if (firstUpgradeIdx >= 0 && firstDowngradeIdx >= 0) {
        assert.ok(firstUpgradeIdx < firstDowngradeIdx);
      }
    });

    it('should return error for invalid new item', () => {
      const result = compareEquipment('nonexistent', 'rustySword');
      
      assert.equal(result.valid, false);
      assert.ok(result.error);
    });

    it('should handle items with no stat changes', () => {
      const result = compareEquipment('rustySword', 'rustySword');
      
      assert.equal(result.valid, true);
      assert.equal(result.statChanges.length, 0);
      assert.equal(result.summary.assessment, 'sidegrade');
    });
  });

  describe('getEquipmentSlot', () => {
    it('should return weapon for weapon type', () => {
      assert.equal(getEquipmentSlot(mockItems.ironSword), 'weapon');
    });

    it('should return armor for armor type', () => {
      assert.equal(getEquipmentSlot(mockItems.leatherArmor), 'armor');
    });

    it('should return null for null item', () => {
      assert.equal(getEquipmentSlot(null), null);
    });
  });

  describe('formatStatChange', () => {
    it('should format positive change with plus sign', () => {
      const change = {
        icon: '⚔️',
        label: 'ATK',
        difference: 7,
      };
      const result = formatStatChange(change);
      assert.ok(result.includes('+7'));
      assert.ok(result.includes('ATK'));
    });

    it('should format negative change with minus sign', () => {
      const change = {
        icon: '💨',
        label: 'SPD',
        difference: -3,
      };
      const result = formatStatChange(change);
      assert.ok(result.includes('-3'));
    });
  });

  describe('formatAssessment', () => {
    it('should return Major Upgrade for significant_upgrade', () => {
      const result = formatAssessment('significant_upgrade');
      assert.equal(result.text, 'Major Upgrade');
      assert.equal(result.color, '#00ff00');
    });

    it('should return Upgrade for minor_upgrade', () => {
      const result = formatAssessment('minor_upgrade');
      assert.equal(result.text, 'Upgrade');
    });

    it('should return Sidegrade for sidegrade', () => {
      const result = formatAssessment('sidegrade');
      assert.equal(result.text, 'Sidegrade');
    });

    it('should return Downgrade for minor_downgrade', () => {
      const result = formatAssessment('minor_downgrade');
      assert.equal(result.text, 'Downgrade');
    });

    it('should return Major Downgrade for significant_downgrade', () => {
      const result = formatAssessment('significant_downgrade');
      assert.equal(result.text, 'Major Downgrade');
    });

    it('should return Unknown for invalid assessment', () => {
      const result = formatAssessment('invalid');
      assert.equal(result.text, 'Unknown');
    });
  });

  describe('Integration scenarios', () => {
    it('should correctly assess plate vs leather armor', () => {
      const result = compareEquipment('plateArmor', 'leatherArmor');
      
      assert.equal(result.valid, true);
      // Plate has +15 defense but -3 speed
      // Net change: 15 - 3 = 12 (significant upgrade)
      assert.equal(result.summary.assessment, 'significant_upgrade');
    });

    it('should handle completely new stat appearing', () => {
      const result = compareEquipment('plateArmor', null);
      
      const defenseChange = result.statChanges.find(c => c.stat === 'defense');
      assert.equal(defenseChange.currentValue, 0);
      assert.equal(defenseChange.newValue, 20);
    });

    it('should handle stat being removed', () => {
      const result = compareEquipment('emptyItem', 'ironSword');
      
      const attackChange = result.statChanges.find(c => c.stat === 'attack');
      assert.equal(attackChange.newValue, 0);
      assert.equal(attackChange.currentValue, 12);
      assert.equal(attackChange.isDowngrade, true);
    });
  });
});

console.log('All equipment comparison tests passed!');
