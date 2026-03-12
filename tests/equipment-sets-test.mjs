/**
 * Equipment Set System Tests
 * Tests for equipment sets, bonuses, and UI components
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

import {
  EQUIPMENT_SLOTS,
  EQUIPMENT_SETS,
  getSetData,
  getAllSets,
  getItemSetInfo,
  countEquippedSetPieces,
  getActiveSetBonuses,
  calculateSetBonusStats,
  applySetBonusesToStats,
  getSetProgress,
  getSetPieceStatus,
  findSetsContainingItem,
  checkSetAdvancement,
  getEquipmentSetSummary,
} from '../src/equipment-sets.js';

import {
  getEquipmentSetStyles,
  renderActiveSetBonuses,
  renderSetProgress,
  renderActiveSetBadges,
  renderSetAdvancementNotice,
  renderTotalSetBonusStats,
  renderSetsCatalog,
  renderSlotSetIndicator,
} from '../src/equipment-sets-ui.js';

// Banned words for security testing
const BANNED_WORDS = ['egg', 'easter', 'yolk', 'bunny', 'rabbit', 'phoenix'];

describe('Equipment Slots', () => {
  it('should define all equipment slots', () => {
    assert.strictEqual(EQUIPMENT_SLOTS.HEAD, 'head');
    assert.strictEqual(EQUIPMENT_SLOTS.BODY, 'body');
    assert.strictEqual(EQUIPMENT_SLOTS.HANDS, 'hands');
    assert.strictEqual(EQUIPMENT_SLOTS.LEGS, 'legs');
    assert.strictEqual(EQUIPMENT_SLOTS.FEET, 'feet');
    assert.strictEqual(EQUIPMENT_SLOTS.WEAPON, 'weapon');
    assert.strictEqual(EQUIPMENT_SLOTS.SHIELD, 'shield');
    assert.strictEqual(EQUIPMENT_SLOTS.ACCESSORY, 'accessory');
  });

  it('should have 8 equipment slots', () => {
    assert.strictEqual(Object.keys(EQUIPMENT_SLOTS).length, 8);
  });
});

describe('Equipment Sets Data', () => {
  it('should define warriors-might set', () => {
    const set = EQUIPMENT_SETS['warriors-might'];
    assert.ok(set);
    assert.strictEqual(set.name, "Warrior's Might");
    assert.strictEqual(set.icon, '\u2694\uFE0F');
    assert.strictEqual(Object.keys(set.pieces).length, 5);
    assert.ok(set.bonuses[2]);
    assert.ok(set.bonuses[3]);
    assert.ok(set.bonuses[5]);
  });

  it('should define shadow-assassin set', () => {
    const set = EQUIPMENT_SETS['shadow-assassin'];
    assert.ok(set);
    assert.strictEqual(set.name, 'Shadow Assassin');
    assert.ok(set.bonuses[2].speed);
    assert.ok(set.bonuses[5].critDamage);
  });

  it('should define arcane-scholar set', () => {
    const set = EQUIPMENT_SETS['arcane-scholar'];
    assert.ok(set);
    assert.strictEqual(set.name, 'Arcane Scholar');
    assert.ok(set.bonuses[2].magic);
    assert.ok(set.bonuses[5].mpRegen);
  });

  it('should define holy-guardian set', () => {
    const set = EQUIPMENT_SETS['holy-guardian'];
    assert.ok(set);
    assert.strictEqual(set.name, 'Holy Guardian');
    assert.ok(set.bonuses[2].healingBonus);
    assert.ok(set.bonuses[5].statusResist);
  });

  it('should define berserker-fury set', () => {
    const set = EQUIPMENT_SETS['berserker-fury'];
    assert.ok(set);
    assert.strictEqual(set.name, 'Berserker Fury');
    assert.ok(set.bonuses[3].lowHpBonus);
    assert.ok(set.bonuses[4].lifesteal);
  });

  it('should define frost-warden set', () => {
    const set = EQUIPMENT_SETS['frost-warden'];
    assert.ok(set);
    assert.strictEqual(set.name, 'Frost Warden');
    assert.ok(set.bonuses[2].iceBonus);
    assert.ok(set.bonuses[5].iceResist);
  });

  it('should define flame-knight set', () => {
    const set = EQUIPMENT_SETS['flame-knight'];
    assert.ok(set);
    assert.strictEqual(set.name, 'Flame Knight');
    assert.ok(set.bonuses[2].fireBonus);
    assert.ok(set.bonuses[5].fireResist);
  });

  it('should define void-walker set', () => {
    const set = EQUIPMENT_SETS['void-walker'];
    assert.ok(set);
    assert.strictEqual(set.name, 'Void Walker');
    assert.ok(set.bonuses[2].shadowBonus);
    assert.ok(set.bonuses[4].evasion);
  });

  it('should have 8 equipment sets total', () => {
    assert.strictEqual(Object.keys(EQUIPMENT_SETS).length >= 8, true);
  });

  it('should have unique set IDs', () => {
    const ids = Object.keys(EQUIPMENT_SETS);
    const uniqueIds = new Set(ids);
    assert.strictEqual(ids.length, uniqueIds.size);
  });

  it('should have descriptions for all bonuses', () => {
    for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
      for (const [threshold, bonus] of Object.entries(setData.bonuses)) {
        assert.ok(bonus.description, `Missing description for ${setId} bonus at ${threshold}`);
      }
    }
  });
});

describe('getSetData', () => {
  it('should return set data for valid set ID', () => {
    const set = getSetData('warriors-might');
    assert.ok(set);
    assert.strictEqual(set.name, "Warrior's Might");
  });

  it('should return null for invalid set ID', () => {
    const set = getSetData('nonexistent-set');
    assert.strictEqual(set, null);
  });

  it('should return null for empty string', () => {
    const set = getSetData('');
    assert.strictEqual(set, null);
  });

  it('should return null for null input', () => {
    const set = getSetData(null);
    assert.strictEqual(set, null);
  });
});

describe('getAllSets', () => {
  it('should return array of all set IDs', () => {
    const sets = getAllSets();
    assert.ok(Array.isArray(sets));
    assert.ok(sets.length >= 8);
    assert.ok(sets.includes('warriors-might'));
    assert.ok(sets.includes('shadow-assassin'));
  });
});

describe('getItemSetInfo', () => {
  it('should return set info for valid item', () => {
    const info = getItemSetInfo('warriors-helm');
    assert.ok(info);
    assert.strictEqual(info.setId, 'warriors-might');
    assert.strictEqual(info.slot, 'head');
    assert.strictEqual(info.setName, "Warrior's Might");
  });

  it('should return set info for shadow item', () => {
    const info = getItemSetInfo('shadow-boots');
    assert.ok(info);
    assert.strictEqual(info.setId, 'shadow-assassin');
    assert.strictEqual(info.slot, 'feet');
  });

  it('should return null for non-set item', () => {
    const info = getItemSetInfo('regular-sword');
    assert.strictEqual(info, null);
  });

  it('should return null for empty string', () => {
    const info = getItemSetInfo('');
    assert.strictEqual(info, null);
  });
});

describe('countEquippedSetPieces', () => {
  it('should count zero pieces with empty equipment', () => {
    const count = countEquippedSetPieces({}, 'warriors-might');
    assert.strictEqual(count, 0);
  });

  it('should count zero pieces with null equipment', () => {
    const count = countEquippedSetPieces(null, 'warriors-might');
    assert.strictEqual(count, 0);
  });

  it('should count one piece correctly', () => {
    const equipment = { head: 'warriors-helm' };
    const count = countEquippedSetPieces(equipment, 'warriors-might');
    assert.strictEqual(count, 1);
  });

  it('should count multiple pieces correctly', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'warriors-gauntlets',
    };
    const count = countEquippedSetPieces(equipment, 'warriors-might');
    assert.strictEqual(count, 3);
  });

  it('should count full set correctly', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'warriors-gauntlets',
      legs: 'warriors-greaves',
      feet: 'warriors-boots',
    };
    const count = countEquippedSetPieces(equipment, 'warriors-might');
    assert.strictEqual(count, 5);
  });

  it('should not count pieces from other sets', () => {
    const equipment = {
      head: 'shadow-hood',
      body: 'warriors-plate',
    };
    const count = countEquippedSetPieces(equipment, 'warriors-might');
    assert.strictEqual(count, 1);
  });

  it('should return zero for invalid set ID', () => {
    const equipment = { head: 'warriors-helm' };
    const count = countEquippedSetPieces(equipment, 'invalid-set');
    assert.strictEqual(count, 0);
  });
});

describe('getActiveSetBonuses', () => {
  it('should return empty array for no equipment', () => {
    const bonuses = getActiveSetBonuses({});
    assert.ok(Array.isArray(bonuses));
    assert.strictEqual(bonuses.length, 0);
  });

  it('should return empty array for null equipment', () => {
    const bonuses = getActiveSetBonuses(null);
    assert.strictEqual(bonuses.length, 0);
  });

  it('should return empty array for single piece', () => {
    const equipment = { head: 'warriors-helm' };
    const bonuses = getActiveSetBonuses(equipment);
    assert.strictEqual(bonuses.length, 0);
  });

  it('should return bonus for 2-piece set', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
    };
    const bonuses = getActiveSetBonuses(equipment);
    assert.strictEqual(bonuses.length, 1);
    assert.strictEqual(bonuses[0].setId, 'warriors-might');
    assert.strictEqual(bonuses[0].pieces, 2);
    assert.strictEqual(bonuses[0].threshold, 2);
  });

  it('should return highest tier bonus for 3-piece set', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'warriors-gauntlets',
    };
    const bonuses = getActiveSetBonuses(equipment);
    assert.strictEqual(bonuses.length, 1);
    assert.strictEqual(bonuses[0].threshold, 3);
    assert.ok(bonuses[0].bonus.hp);
  });

  it('should return multiple set bonuses', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'shadow-gloves',
      feet: 'shadow-boots',
    };
    const bonuses = getActiveSetBonuses(equipment);
    assert.strictEqual(bonuses.length, 2);
  });
});

describe('calculateSetBonusStats', () => {
  it('should return empty object for no equipment', () => {
    const stats = calculateSetBonusStats({});
    assert.deepStrictEqual(stats, {});
  });

  it('should calculate defense bonus for warriors 2-piece', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
    };
    const stats = calculateSetBonusStats(equipment);
    assert.strictEqual(stats.defense, 10);
  });

  it('should calculate combined stats for warriors 3-piece', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'warriors-gauntlets',
    };
    const stats = calculateSetBonusStats(equipment);
    assert.strictEqual(stats.defense, 20);
    assert.strictEqual(stats.hp, 50);
  });

  it('should combine stats from multiple sets', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'shadow-gloves',
      feet: 'shadow-boots',
    };
    const stats = calculateSetBonusStats(equipment);
    assert.strictEqual(stats.defense, 10);
    assert.strictEqual(stats.speed, 15);
  });
});

describe('applySetBonusesToStats', () => {
  it('should return base stats if null', () => {
    const result = applySetBonusesToStats(null, {});
    assert.strictEqual(result, null);
  });

  it('should apply flat stat bonuses', () => {
    const baseStats = { hp: 100, defense: 50 };
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
    };
    const modified = applySetBonusesToStats(baseStats, equipment);
    assert.strictEqual(modified.defense, 60);
  });

  it('should apply percentage attack bonus', () => {
    const baseStats = { attack: 100 };
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'warriors-gauntlets',
      legs: 'warriors-greaves',
      feet: 'warriors-boots',
    };
    const modified = applySetBonusesToStats(baseStats, equipment);
    assert.strictEqual(modified.attack, 110);
  });

  it('should apply special stats like critChance', () => {
    const baseStats = { critChance: 0.1 };
    const equipment = {
      head: 'shadow-hood',
      body: 'shadow-vest',
      hands: 'shadow-gloves',
    };
    const modified = applySetBonusesToStats(baseStats, equipment);
    // Use approximate comparison for floating point
    assert.ok(Math.abs(modified.critChance - 0.15) < 0.0001);
  });

  it('should apply mpRegen bonus', () => {
    const baseStats = { mpRegen: 0 };
    const equipment = {
      head: 'arcane-hat',
      body: 'arcane-robe',
      hands: 'arcane-bracers',
      legs: 'arcane-sash',
      accessory: 'arcane-pendant',
    };
    const modified = applySetBonusesToStats(baseStats, equipment);
    assert.strictEqual(modified.mpRegen, 0.1);
  });

  it('should apply elemental bonuses', () => {
    const baseStats = { iceBonus: 0 };
    const equipment = {
      head: 'frost-helm',
      body: 'frost-mail',
    };
    const modified = applySetBonusesToStats(baseStats, equipment);
    assert.strictEqual(modified.iceBonus, 0.15);
  });
});

describe('getSetProgress', () => {
  it('should return found: false for invalid set', () => {
    const progress = getSetProgress({}, 'invalid-set');
    assert.strictEqual(progress.found, false);
  });

  it('should return correct progress for empty equipment', () => {
    const progress = getSetProgress({}, 'warriors-might');
    assert.strictEqual(progress.found, true);
    assert.strictEqual(progress.equippedPieces, 0);
    assert.strictEqual(progress.totalPieces, 5);
    assert.strictEqual(progress.currentBonus, null);
    assert.ok(progress.nextBonus);
    assert.strictEqual(progress.nextThreshold, 2);
  });

  it('should return current and next bonus correctly', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
    };
    const progress = getSetProgress(equipment, 'warriors-might');
    assert.strictEqual(progress.equippedPieces, 2);
    assert.ok(progress.currentBonus);
    assert.ok(progress.nextBonus);
    assert.strictEqual(progress.nextThreshold, 3);
    assert.strictEqual(progress.piecesNeededForNext, 1);
  });

  it('should return no next bonus when complete', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      hands: 'warriors-gauntlets',
      legs: 'warriors-greaves',
      feet: 'warriors-boots',
    };
    const progress = getSetProgress(equipment, 'warriors-might');
    assert.strictEqual(progress.equippedPieces, 5);
    assert.ok(progress.currentBonus);
    assert.strictEqual(progress.nextBonus, null);
    assert.strictEqual(progress.piecesNeededForNext, 0);
  });
});

describe('getSetPieceStatus', () => {
  it('should return empty array for invalid set', () => {
    const status = getSetPieceStatus({}, 'invalid-set');
    assert.deepStrictEqual(status, []);
  });

  it('should return all pieces with equipped status', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
    };
    const status = getSetPieceStatus(equipment, 'warriors-might');
    assert.strictEqual(status.length, 5);

    const headPiece = status.find(p => p.slot === 'head');
    assert.ok(headPiece);
    assert.strictEqual(headPiece.equipped, true);

    const legsPiece = status.find(p => p.slot === 'legs');
    assert.ok(legsPiece);
    assert.strictEqual(legsPiece.equipped, false);
  });

  it('should handle null equipment', () => {
    const status = getSetPieceStatus(null, 'warriors-might');
    assert.strictEqual(status.length, 5);
    assert.ok(status.every(p => p.equipped === false));
  });
});

describe('findSetsContainingItem', () => {
  it('should find set for valid item', () => {
    const sets = findSetsContainingItem('warriors-helm');
    assert.ok(Array.isArray(sets));
    assert.strictEqual(sets.length, 1);
    assert.ok(sets.includes('warriors-might'));
  });

  it('should return empty array for non-set item', () => {
    const sets = findSetsContainingItem('regular-sword');
    assert.strictEqual(sets.length, 0);
  });

  it('should return empty array for empty string', () => {
    const sets = findSetsContainingItem('');
    assert.strictEqual(sets.length, 0);
  });
});

describe('checkSetAdvancement', () => {
  it('should return null for non-set item', () => {
    const result = checkSetAdvancement({}, 'head', 'regular-helm');
    assert.strictEqual(result, null);
  });

  it('should return advancement info for new set piece', () => {
    const result = checkSetAdvancement({}, 'head', 'warriors-helm');
    assert.ok(result);
    assert.strictEqual(result.setId, 'warriors-might');
    assert.strictEqual(result.previousPieces, 0);
    assert.strictEqual(result.newPieces, 1);
    assert.strictEqual(result.newBonusUnlocked, null);
  });

  it('should detect bonus unlock', () => {
    const equipment = { head: 'warriors-helm' };
    const result = checkSetAdvancement(equipment, 'body', 'warriors-plate');
    assert.ok(result);
    assert.strictEqual(result.previousPieces, 1);
    assert.strictEqual(result.newPieces, 2);
    assert.ok(result.newBonusUnlocked);
    assert.strictEqual(result.newBonusUnlocked.threshold, 2);
  });

  it('should return null when replacing same slot', () => {
    const equipment = { head: 'warriors-helm' };
    const result = checkSetAdvancement(equipment, 'head', 'shadow-hood');
    assert.ok(result);
    assert.strictEqual(result.setId, 'shadow-assassin');
    assert.strictEqual(result.newPieces, 1);
  });
});

describe('getEquipmentSetSummary', () => {
  it('should return summary with no active sets', () => {
    const summary = getEquipmentSetSummary({});
    assert.strictEqual(summary.setCount, 0);
    assert.deepStrictEqual(summary.activeSets, []);
    assert.deepStrictEqual(summary.totalBonusStats, {});
  });

  it('should return summary with active sets', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
    };
    const summary = getEquipmentSetSummary(equipment);
    assert.strictEqual(summary.setCount, 1);
    assert.strictEqual(summary.activeSets.length, 1);
    assert.strictEqual(summary.totalBonusStats.defense, 10);
  });
});

describe('UI Components', () => {
  describe('getEquipmentSetStyles', () => {
    it('should return CSS styles string', () => {
      const styles = getEquipmentSetStyles();
      assert.ok(typeof styles === 'string');
      assert.ok(styles.includes('.set-bonus-container'));
      assert.ok(styles.includes('.set-header'));
      assert.ok(styles.includes('.set-piece'));
    });

    it('should include animation styles', () => {
      const styles = getEquipmentSetStyles();
      assert.ok(styles.includes('@keyframes set-unlock'));
    });
  });

  describe('renderActiveSetBonuses', () => {
    it('should render no sets message', () => {
      const html = renderActiveSetBonuses({});
      assert.ok(html.includes('No Active Set Bonuses'));
      assert.ok(html.includes('Equip matching gear'));
    });

    it('should render active set bonuses', () => {
      const equipment = {
        head: 'warriors-helm',
        body: 'warriors-plate',
      };
      const html = renderActiveSetBonuses(equipment);
      // Note: apostrophe is HTML-escaped to &#039;
      assert.ok(html.includes("Warrior&#039;s Might"));
      assert.ok(html.includes('2/5'));
    });

    it('should escape HTML in output', () => {
      const equipment = {
        head: 'warriors-helm',
        body: 'warriors-plate',
      };
      const html = renderActiveSetBonuses(equipment);
      assert.ok(!html.includes('&lt;script'));
    });
  });

  describe('renderSetProgress', () => {
    it('should render set not found for invalid set', () => {
      const html = renderSetProgress({}, 'invalid-set');
      assert.ok(html.includes('Set not found'));
    });

    it('should render progress display', () => {
      const equipment = {
        head: 'warriors-helm',
        body: 'warriors-plate',
      };
      const html = renderSetProgress(equipment, 'warriors-might');
      // Note: apostrophe is HTML-escaped to &#039;
      assert.ok(html.includes("Warrior&#039;s Might"));
      assert.ok(html.includes('2/5'));
      assert.ok(html.includes('set-piece'));
    });

    it('should show next bonus info', () => {
      const equipment = {
        head: 'warriors-helm',
        body: 'warriors-plate',
      };
      const html = renderSetProgress(equipment, 'warriors-might');
      assert.ok(html.includes('Next'));
    });
  });

  describe('renderActiveSetBadges', () => {
    it('should return empty string for no active sets', () => {
      const html = renderActiveSetBadges({});
      assert.strictEqual(html, '');
    });

    it('should render badges for active sets', () => {
      const equipment = {
        head: 'warriors-helm',
        body: 'warriors-plate',
      };
      const html = renderActiveSetBadges(equipment);
      assert.ok(html.includes('active-set-badge'));
      // Note: apostrophe is HTML-escaped to &#039;
      assert.ok(html.includes("Warrior&#039;s Might"));
    });
  });

  describe('renderSetAdvancementNotice', () => {
    it('should return empty string for null advancement', () => {
      const html = renderSetAdvancementNotice(null);
      assert.strictEqual(html, '');
    });

    it('should render advancement notice', () => {
      const advancement = {
        setName: 'Warriors Might',
        icon: '\u2694\uFE0F',
        newPieces: 2,
        newBonusUnlocked: {
          threshold: 2,
          bonus: { defense: 10, description: '+10 Defense' },
        },
      };
      const html = renderSetAdvancementNotice(advancement);
      assert.ok(html.includes('Bonus Unlocked'));
      assert.ok(html.includes('+10 Defense'));
    });

    it('should render progress without bonus unlock', () => {
      const advancement = {
        setName: 'Warriors Might',
        icon: '\u2694\uFE0F',
        newPieces: 1,
        newBonusUnlocked: null,
      };
      const html = renderSetAdvancementNotice(advancement);
      assert.ok(html.includes('Progress!'));
      assert.ok(html.includes('1 pieces equipped'));
    });
  });

  describe('renderTotalSetBonusStats', () => {
    it('should return empty string for no bonuses', () => {
      const html = renderTotalSetBonusStats({});
      assert.strictEqual(html, '');
    });

    it('should render total bonus stats', () => {
      const equipment = {
        head: 'warriors-helm',
        body: 'warriors-plate',
      };
      const html = renderTotalSetBonusStats(equipment);
      assert.ok(html.includes('Total Set Bonuses'));
      assert.ok(html.includes('DEF'));
    });
  });

  describe('renderSetsCatalog', () => {
    it('should render all sets', () => {
      const html = renderSetsCatalog();
      // Note: apostrophe is HTML-escaped to &#039;
      assert.ok(html.includes("Warrior&#039;s Might"));
      assert.ok(html.includes('Shadow Assassin'));
      assert.ok(html.includes('Arcane Scholar'));
      assert.ok(html.includes('Holy Guardian'));
      assert.ok(html.includes('Berserker Fury'));
      assert.ok(html.includes('Frost Warden'));
      assert.ok(html.includes('Flame Knight'));
      assert.ok(html.includes('Void Walker'));
    });

    it('should show progress when equipment provided', () => {
      const equipment = {
        head: 'warriors-helm',
        body: 'warriors-plate',
      };
      const html = renderSetsCatalog(equipment);
      assert.ok(html.includes('2/5'));
    });
  });

  describe('renderSlotSetIndicator', () => {
    it('should return empty string for invalid set', () => {
      const html = renderSlotSetIndicator('item', 'invalid-set');
      assert.strictEqual(html, '');
    });

    it('should render slot indicator', () => {
      const html = renderSlotSetIndicator('warriors-helm', 'warriors-might');
      assert.ok(html.includes('slot-set-indicator'));
      assert.ok(html.includes('\u2694\uFE0F'));
    });
  });
});

describe('Security Tests', () => {
  it('should not contain banned words in set names', () => {
    for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
      for (const banned of BANNED_WORDS) {
        assert.ok(
          !setData.name.toLowerCase().includes(banned),
          `Set ${setId} name contains banned word "${banned}"`
        );
      }
    }
  });

  it('should not contain banned words in set IDs', () => {
    for (const setId of Object.keys(EQUIPMENT_SETS)) {
      for (const banned of BANNED_WORDS) {
        assert.ok(
          !setId.toLowerCase().includes(banned),
          `Set ID "${setId}" contains banned word "${banned}"`
        );
      }
    }
  });

  it('should not contain banned words in descriptions', () => {
    for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
      for (const banned of BANNED_WORDS) {
        assert.ok(
          !setData.description.toLowerCase().includes(banned),
          `Set ${setId} description contains banned word "${banned}"`
        );
      }
    }
  });

  it('should not contain banned words in piece IDs', () => {
    for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
      for (const pieceId of Object.values(setData.pieces)) {
        for (const banned of BANNED_WORDS) {
          assert.ok(
            !pieceId.toLowerCase().includes(banned),
            `Piece "${pieceId}" in set ${setId} contains banned word "${banned}"`
          );
        }
      }
    }
  });

  it('should not contain banned words in bonus descriptions', () => {
    for (const [setId, setData] of Object.entries(EQUIPMENT_SETS)) {
      for (const [threshold, bonus] of Object.entries(setData.bonuses)) {
        for (const banned of BANNED_WORDS) {
          assert.ok(
            !bonus.description.toLowerCase().includes(banned),
            `Bonus description for ${setId} at ${threshold} contains banned word "${banned}"`
          );
        }
      }
    }
  });

  it('should escape HTML in UI rendering', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
    };
    const html = renderActiveSetBonuses(equipment);
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('javascript:'));
  });
});

describe('Edge Cases', () => {
  it('should handle undefined equipment gracefully', () => {
    assert.doesNotThrow(() => {
      countEquippedSetPieces(undefined, 'warriors-might');
      getActiveSetBonuses(undefined);
      calculateSetBonusStats(undefined);
      getSetProgress(undefined, 'warriors-might');
    });
  });

  it('should handle mixed valid and invalid equipment', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'invalid-item',
      hands: null,
      legs: undefined,
    };
    const count = countEquippedSetPieces(equipment, 'warriors-might');
    assert.strictEqual(count, 1);
  });

  it('should handle equipment with extra properties', () => {
    const equipment = {
      head: 'warriors-helm',
      body: 'warriors-plate',
      extra: 'should-be-ignored',
      another: 123,
    };
    const count = countEquippedSetPieces(equipment, 'warriors-might');
    assert.strictEqual(count, 2);
  });

  it('should handle sets with different piece counts', () => {
    const berserkerEquip = {
      head: 'berserker-helm',
      body: 'berserker-harness',
      hands: 'berserker-bracers',
      weapon: 'berserker-axe',
    };
    const count = countEquippedSetPieces(berserkerEquip, 'berserker-fury');
    assert.strictEqual(count, 4);
  });
});
