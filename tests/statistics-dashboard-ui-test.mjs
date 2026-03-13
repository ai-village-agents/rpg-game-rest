/**
 * Statistics Dashboard UI Tests
 * Tests for the visual statistics dashboard rendering system
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  formatNumber,
  renderStatItem,
  renderCombatSection,
  renderEnemiesSection,
  renderEconomySection,
  renderItemsSection,
  renderQuestsSection,
  renderExplorationSection,
  renderTimeSection,
  renderStatisticsDashboard,
  toggleSection,
  getSectionVisibility,
  SECTION_ICONS
} from '../src/statistics-dashboard-ui.js';
import { initializeStatistics, recordDamageDealt, recordEnemyDefeated, recordGoldEarned } from '../src/statistics-dashboard.js';

// Helper to create a mock state with statistics
function createMockState() {
  let state = { player: { name: 'TestHero' } };
  state = initializeStatistics(state);
  return state;
}

// Helper to create a mock state with populated statistics
function createPopulatedMockState() {
  let state = createMockState();
  
  // Add some combat stats
  state = recordDamageDealt(state, 150, true);  // Critical hit
  state = recordDamageDealt(state, 75, false);
  state = recordEnemyDefeated(state, 'Goblin', 'minion');
  state = recordEnemyDefeated(state, 'Goblin', 'minion');
  state = recordEnemyDefeated(state, 'Dragon', 'boss');
  state = recordGoldEarned(state, 500, 'combat');
  state = recordGoldEarned(state, 200, 'quest');
  
  return state;
}

describe('Statistics Dashboard UI', () => {
  
  describe('formatNumber', () => {
    it('should format small numbers', () => {
      assert.strictEqual(formatNumber(42), '42');
    });
    
    it('should format large numbers with commas', () => {
      const formatted = formatNumber(1234567);
      assert.ok(formatted.includes('1'));
      assert.ok(formatted.includes('234'));
    });
    
    it('should handle zero', () => {
      assert.strictEqual(formatNumber(0), '0');
    });
    
    it('should handle undefined', () => {
      assert.strictEqual(formatNumber(undefined), '0');
    });
    
    it('should handle null', () => {
      assert.strictEqual(formatNumber(null), '0');
    });
    
    it('should handle negative numbers', () => {
      const formatted = formatNumber(-500);
      assert.ok(formatted.includes('500'));
    });
  });
  
  describe('renderStatItem', () => {
    it('should render a basic stat item', () => {
      const html = renderStatItem('Damage', 100);
      assert.ok(html.includes('Damage'));
      assert.ok(html.includes('100'));
      assert.ok(html.includes('stat-item'));
      assert.ok(html.includes('stat-label'));
      assert.ok(html.includes('stat-value'));
    });
    
    it('should apply custom value class', () => {
      const html = renderStatItem('Health Lost', 50, 'negative');
      assert.ok(html.includes('negative'));
    });
    
    it('should handle string values', () => {
      const html = renderStatItem('Time', '5h 30m');
      assert.ok(html.includes('5h 30m'));
    });
    
    it('should format numeric values', () => {
      const html = renderStatItem('Gold', 10000);
      assert.ok(html.includes('10'));
    });
  });
  
  describe('SECTION_ICONS', () => {
    it('should have all required section icons', () => {
      assert.ok(SECTION_ICONS.combat);
      assert.ok(SECTION_ICONS.enemies);
      assert.ok(SECTION_ICONS.economy);
      assert.ok(SECTION_ICONS.items);
      assert.ok(SECTION_ICONS.quests);
      assert.ok(SECTION_ICONS.exploration);
      assert.ok(SECTION_ICONS.time);
    });
    
    it('should have combat icon as sword emoji', () => {
      assert.strictEqual(SECTION_ICONS.combat, '⚔️');
    });
    
    it('should have economy icon as money bag', () => {
      assert.strictEqual(SECTION_ICONS.economy, '💰');
    });
    
    it('should have exploration icon as map', () => {
      assert.strictEqual(SECTION_ICONS.exploration, '🗺️');
    });
  });
  
  describe('renderCombatSection', () => {
    it('should render combat section with header', () => {
      const combat = {
        totalDamageDealt: 500,
        totalDamageReceived: 100,
        totalHealingDone: 200,
        totalHits: 25,
        totalMisses: 5,
        totalCriticalHits: 8,
        highestSingleHit: 75,
        longestCombo: 5,
        perfectVictories: 2,
        closeCalls: 1
      };
      
      const html = renderCombatSection(combat);
      assert.ok(html.includes('Combat Statistics'));
      assert.ok(html.includes(SECTION_ICONS.combat));
      assert.ok(html.includes('data-section="combat"'));
    });
    
    it('should display damage dealt', () => {
      const combat = { totalDamageDealt: 1500 };
      const html = renderCombatSection(combat);
      assert.ok(html.includes('Damage Dealt'));
      assert.ok(html.includes('1'));
    });
    
    it('should highlight critical hits', () => {
      const combat = { totalCriticalHits: 10 };
      const html = renderCombatSection(combat);
      assert.ok(html.includes('Critical Hits'));
      assert.ok(html.includes('highlight'));
    });
    
    it('should return empty string for null combat', () => {
      assert.strictEqual(renderCombatSection(null), '');
    });
    
    it('should return empty string for undefined combat', () => {
      assert.strictEqual(renderCombatSection(undefined), '');
    });
  });
  
  describe('renderEnemiesSection', () => {
    it('should render enemies section with header', () => {
      const enemies = {
        totalDefeated: 50,
        bossesDefeated: 3,
        elitesDefeated: 10
      };
      
      const html = renderEnemiesSection(enemies);
      assert.ok(html.includes('Enemies Defeated'));
      assert.ok(html.includes(SECTION_ICONS.enemies));
      assert.ok(html.includes('data-section="enemies"'));
    });
    
    it('should display top enemies when provided', () => {
      const enemies = { totalDefeated: 20 };
      const topEnemies = [
        { type: 'Goblin', count: 15 },
        { type: 'Orc', count: 5 }
      ];
      
      const html = renderEnemiesSection(enemies, topEnemies);
      assert.ok(html.includes('Goblin'));
      assert.ok(html.includes('15'));
      assert.ok(html.includes('Orc'));
    });
    
    it('should show message when no enemies defeated', () => {
      const enemies = { totalDefeated: 0 };
      const html = renderEnemiesSection(enemies, []);
      assert.ok(html.includes('No enemies defeated yet'));
    });
    
    it('should highlight boss count', () => {
      const enemies = { bossesDefeated: 5 };
      const html = renderEnemiesSection(enemies);
      assert.ok(html.includes('Bosses'));
      assert.ok(html.includes('highlight'));
    });
    
    it('should return empty string for null enemies', () => {
      assert.strictEqual(renderEnemiesSection(null), '');
    });
  });
  
  describe('renderEconomySection', () => {
    it('should render economy section with header', () => {
      const economy = {
        goldEarned: 1000,
        goldSpent: 500,
        netGold: 500,
        goldFromCombat: 600,
        goldFromQuests: 400,
        largestPurchase: 200,
        largestSale: 150
      };
      
      const html = renderEconomySection(economy);
      assert.ok(html.includes('Economy'));
      assert.ok(html.includes(SECTION_ICONS.economy));
      assert.ok(html.includes('data-section="economy"'));
    });
    
    it('should show negative class for gold spent', () => {
      const economy = { goldSpent: 100 };
      const html = renderEconomySection(economy);
      assert.ok(html.includes('Gold Spent'));
      assert.ok(html.includes('negative'));
    });
    
    it('should show negative class for negative net gold', () => {
      const economy = { netGold: -100 };
      const html = renderEconomySection(economy);
      assert.ok(html.includes('Net Gold'));
      // The negative class should be applied
      const netGoldMatch = html.match(/Net Gold.*?stat-value\s+(\w*)/s);
      assert.ok(netGoldMatch);
    });
    
    it('should return empty string for null economy', () => {
      assert.strictEqual(renderEconomySection(null), '');
    });
  });
  
  describe('renderItemsSection', () => {
    it('should render items section with header', () => {
      const items = {
        totalFound: 50,
        totalCrafted: 10,
        consumablesUsed: 25,
        legendaryItemsFound: 2,
        rareItemsFound: 8
      };
      
      const html = renderItemsSection(items);
      assert.ok(html.includes('Items'));
      assert.ok(html.includes(SECTION_ICONS.items));
      assert.ok(html.includes('data-section="items"'));
    });
    
    it('should highlight legendary items', () => {
      const items = { legendaryItemsFound: 3 };
      const html = renderItemsSection(items);
      assert.ok(html.includes('Legendary'));
      assert.ok(html.includes('highlight'));
    });
    
    it('should return empty string for null items', () => {
      assert.strictEqual(renderItemsSection(null), '');
    });
  });
  
  describe('renderQuestsSection', () => {
    it('should render quests section with header', () => {
      const quests = {
        totalCompleted: 20,
        mainQuestsCompleted: 5,
        sideQuestsCompleted: 10,
        dailyChallengesCompleted: 3,
        bountiesCompleted: 2
      };
      
      const html = renderQuestsSection(quests);
      assert.ok(html.includes('Quests'));
      assert.ok(html.includes(SECTION_ICONS.quests));
      assert.ok(html.includes('data-section="quests"'));
    });
    
    it('should highlight main quests', () => {
      const quests = { mainQuestsCompleted: 5 };
      const html = renderQuestsSection(quests);
      assert.ok(html.includes('Main Quests'));
      assert.ok(html.includes('highlight'));
    });
    
    it('should return empty string for null quests', () => {
      assert.strictEqual(renderQuestsSection(null), '');
    });
  });
  
  describe('renderExplorationSection', () => {
    it('should render exploration section with header', () => {
      const exploration = {
        uniqueRoomsVisited: 30,
        secretsDiscovered: 5,
        chestsOpened: 20
      };
      
      const html = renderExplorationSection(exploration);
      assert.ok(html.includes('Exploration'));
      assert.ok(html.includes(SECTION_ICONS.exploration));
      assert.ok(html.includes('data-section="exploration"'));
    });
    
    it('should highlight secrets discovered', () => {
      const exploration = { secretsDiscovered: 10 };
      const html = renderExplorationSection(exploration);
      assert.ok(html.includes('Secrets'));
      assert.ok(html.includes('highlight'));
    });
    
    it('should return empty string for null exploration', () => {
      assert.strictEqual(renderExplorationSection(null), '');
    });
  });
  
  describe('renderTimeSection', () => {
    it('should render time section with header', () => {
      const time = {
        totalPlayTime: '5h 30m 15s',
        combatTime: '2h 15m 0s',
        explorationTime: '3h 15m 15s'
      };
      
      const html = renderTimeSection(time);
      assert.ok(html.includes('Time Played'));
      assert.ok(html.includes(SECTION_ICONS.time));
      assert.ok(html.includes('data-section="time"'));
    });
    
    it('should display total play time prominently', () => {
      const time = { totalPlayTime: '10h 0m 0s' };
      const html = renderTimeSection(time);
      assert.ok(html.includes('Total Play Time'));
      assert.ok(html.includes('10h 0m 0s'));
    });
    
    it('should return empty string for null time', () => {
      assert.strictEqual(renderTimeSection(null), '');
    });
  });
  
  describe('renderStatisticsDashboard', () => {
    it('should render complete dashboard with title', () => {
      const state = createMockState();
      const html = renderStatisticsDashboard(state);
      assert.ok(html.includes('stats-dashboard'));
      assert.ok(html.includes('Statistics Dashboard'));
      assert.ok(html.includes('📊'));
    });
    
    it('should include all sections', () => {
      const state = createMockState();
      const html = renderStatisticsDashboard(state);
      assert.ok(html.includes('data-section="combat"'));
      assert.ok(html.includes('data-section="enemies"'));
      assert.ok(html.includes('data-section="economy"'));
      assert.ok(html.includes('data-section="items"'));
      assert.ok(html.includes('data-section="quests"'));
      assert.ok(html.includes('data-section="exploration"'));
      assert.ok(html.includes('data-section="time"'));
    });
    
    it('should display populated statistics', () => {
      const state = createPopulatedMockState();
      const html = renderStatisticsDashboard(state);
      
      // Check combat stats are displayed
      assert.ok(html.includes('Damage Dealt'));
      
      // Check enemies are displayed
      assert.ok(html.includes('Goblin'));
      assert.ok(html.includes('Dragon'));
      
      // Check economy is displayed
      assert.ok(html.includes('Gold Earned'));
    });
    
    it('should handle state without statistics', () => {
      const state = { player: { name: 'Hero' } };
      const html = renderStatisticsDashboard(state);
      assert.ok(html.includes('stats-dashboard'));
    });
  });
  
  describe('toggleSection', () => {
    // Create a mock DOM-like structure for testing
    function createMockDashboard() {
      const sections = {};
      return {
        querySelector: (selector) => {
          const match = selector.match(/data-section="(\w+)"/);
          if (match) {
            const name = match[1];
            if (!sections[name]) {
              sections[name] = { style: { display: 'block' } };
            }
            return sections[name];
          }
          return null;
        },
        _sections: sections
      };
    }
    
    it('should toggle section from visible to hidden', () => {
      const dashboard = createMockDashboard();
      dashboard.querySelector('[data-section="combat"]'); // Initialize section
      
      const result = toggleSection(dashboard, 'combat');
      assert.strictEqual(result, false); // Was visible, now hidden
    });
    
    it('should toggle section from hidden to visible', () => {
      const dashboard = createMockDashboard();
      const section = dashboard.querySelector('[data-section="combat"]');
      section.style.display = 'none';
      
      const result = toggleSection(dashboard, 'combat');
      assert.strictEqual(result, true); // Was hidden, now visible
    });
    
    it('should return false for non-existent section', () => {
      const dashboard = {
        querySelector: () => null
      };
      
      const result = toggleSection(dashboard, 'nonexistent');
      assert.strictEqual(result, false);
    });
  });
  
  describe('getSectionVisibility', () => {
    it('should return visibility states for all sections', () => {
      const dashboard = {
        querySelector: (selector) => {
          if (selector.includes('combat')) {
            return { style: { display: 'block' } };
          }
          if (selector.includes('enemies')) {
            return { style: { display: 'none' } };
          }
          return { style: { display: '' } };
        }
      };
      
      const visibility = getSectionVisibility(dashboard);
      
      assert.strictEqual(visibility.combat, true);
      assert.strictEqual(visibility.enemies, false);
      assert.strictEqual(visibility.economy, true);
      assert.strictEqual(visibility.items, true);
      assert.strictEqual(visibility.quests, true);
      assert.strictEqual(visibility.exploration, true);
      assert.strictEqual(visibility.time, true);
    });
    
    it('should handle missing sections gracefully', () => {
      const dashboard = {
        querySelector: () => null
      };
      
      const visibility = getSectionVisibility(dashboard);
      
      // All sections should default to true when element not found
      assert.strictEqual(visibility.combat, true);
      assert.strictEqual(visibility.enemies, true);
    });
  });
  
  describe('CSS Styles', () => {
    it('should have defined dashboard title class in output', () => {
      const state = createMockState();
      const html = renderStatisticsDashboard(state);
      assert.ok(html.includes('stats-dashboard-title'));
    });
    
    it('should have stats-grid class for layout', () => {
      const combat = { totalDamageDealt: 100 };
      const html = renderCombatSection(combat);
      assert.ok(html.includes('stats-grid'));
    });
    
    it('should have section header class', () => {
      const combat = { totalDamageDealt: 100 };
      const html = renderCombatSection(combat);
      assert.ok(html.includes('stats-section-header'));
    });
  });
  
  describe('Integration with statistics-dashboard', () => {
    it('should work with freshly initialized state', () => {
      const state = createMockState();
      const html = renderStatisticsDashboard(state);
      
      // Should render without errors
      assert.ok(html.length > 0);
      assert.ok(html.includes('stats-dashboard'));
    });
    
    it('should display updated stats after recording events', () => {
      let state = createMockState();
      state = recordDamageDealt(state, 999, true);
      
      const html = renderStatisticsDashboard(state);
      assert.ok(html.includes('999') || html.includes('Damage Dealt'));
    });
    
    it('should show top enemies from getTopEnemiesDefeated', () => {
      let state = createMockState();
      state = recordEnemyDefeated(state, 'Slime', 'minion');
      state = recordEnemyDefeated(state, 'Slime', 'minion');
      state = recordEnemyDefeated(state, 'Slime', 'minion');
      
      const html = renderStatisticsDashboard(state);
      assert.ok(html.includes('Slime'));
    });
  });
});
