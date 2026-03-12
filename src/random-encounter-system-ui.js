/**
 * Random Encounter System UI Components
 * Renders encounter notifications, cards, and resolution screens
 */

import {
  ENCOUNTER_TYPE,
  ENCOUNTER_RARITY,
  getEncounterStats,
  getEncounterRate,
} from './random-encounter-system.js';

/**
 * Get CSS styles for encounter system
 * @returns {string} CSS styles
 */
export function getEncounterStyles() {
  return `
.encounter-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #333;
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  max-width: 450px;
  z-index: 1000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: encounter-appear 0.4s ease-out;
}

@keyframes encounter-appear {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.05); }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.encounter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
}

.encounter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.encounter-icon {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.encounter-icon.combat { background: rgba(255, 100, 100, 0.2); border: 1px solid #f66; }
.encounter-icon.treasure { background: rgba(255, 200, 100, 0.2); border: 1px solid #fc8; }
.encounter-icon.event { background: rgba(100, 200, 255, 0.2); border: 1px solid #8cf; }
.encounter-icon.merchant { background: rgba(100, 255, 200, 0.2); border: 1px solid #8f8; }
.encounter-icon.rest { background: rgba(100, 200, 100, 0.2); border: 1px solid #8c8; }
.encounter-icon.trap { background: rgba(255, 100, 255, 0.2); border: 1px solid #f8f; }
.encounter-icon.npc { background: rgba(200, 200, 100, 0.2); border: 1px solid #cc8; }

.encounter-title-block {
  flex: 1;
}

.encounter-title {
  font-size: 20px;
  font-weight: bold;
  color: #e8e8e8;
  margin: 0 0 4px 0;
}

.encounter-rarity {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: bold;
}

.encounter-rarity.common { background: rgba(150, 150, 150, 0.3); color: #aaa; }
.encounter-rarity.uncommon { background: rgba(100, 200, 100, 0.3); color: #8f8; }
.encounter-rarity.rare { background: rgba(100, 150, 255, 0.3); color: #8af; }
.encounter-rarity.legendary { background: rgba(255, 200, 50, 0.3); color: #ffd700; }

.encounter-description {
  font-size: 14px;
  color: #aaa;
  line-height: 1.5;
  margin-bottom: 20px;
}

.encounter-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.encounter-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.encounter-detail-row:last-child {
  margin-bottom: 0;
}

.encounter-detail-icon {
  width: 20px;
  text-align: center;
}

.encounter-detail-label {
  color: #888;
}

.encounter-detail-value {
  color: #e8e8e8;
  margin-left: auto;
}

.encounter-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.encounter-btn {
  flex: 1;
  min-width: 100px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.encounter-btn:hover {
  transform: translateY(-2px);
}

.encounter-btn-fight {
  background: linear-gradient(135deg, #d44 0%, #a33 100%);
  color: #fff;
}

.encounter-btn-flee {
  background: linear-gradient(135deg, #555 0%, #333 100%);
  color: #aaa;
}

.encounter-btn-collect {
  background: linear-gradient(135deg, #fc8 0%, #c96 100%);
  color: #000;
}

.encounter-btn-accept {
  background: linear-gradient(135deg, #4a8 0%, #386 100%);
  color: #fff;
}

.encounter-btn-decline {
  background: linear-gradient(135deg, #555 0%, #333 100%);
  color: #aaa;
}

/* Encounter notification (mini) */
.encounter-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: linear-gradient(135deg, #2a2a4e 0%, #1a1a2e 100%);
  border: 2px solid #555;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: notification-slide 0.3s ease-out;
}

@keyframes notification-slide {
  0% { transform: translateX(-50%) translateY(-50px); opacity: 0; }
  100% { transform: translateX(-50%) translateY(0); opacity: 1; }
}

.encounter-notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.encounter-notification-icon {
  font-size: 24px;
}

.encounter-notification-text {
  font-size: 14px;
  color: #e8e8e8;
}

/* Encounter result */
.encounter-result {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 10px;
  text-align: center;
}

.encounter-result-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.encounter-result-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.encounter-result-title.victory { color: #4a8; }
.encounter-result-title.defeat { color: #f66; }
.encounter-result-title.fled { color: #888; }
.encounter-result-title.collected { color: #fc8; }

.encounter-result-rewards {
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.reward-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 5px;
  font-size: 14px;
}

.reward-item:last-child {
  margin-bottom: 0;
}

.reward-xp { color: #8af; }
.reward-gold { color: #ffd700; }
.reward-item-drop { color: #c8f; }

/* Encounter stats panel */
.encounter-stats-panel {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.encounter-stats-title {
  font-size: 14px;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.encounter-stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.encounter-stat-label {
  color: #888;
}

.encounter-stat-value {
  color: #e8e8e8;
  font-weight: bold;
}

/* Encounter rate display */
.encounter-rate-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 12px;
}

.encounter-rate-label {
  color: #888;
}

.encounter-rate-bar {
  flex: 1;
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
}

.encounter-rate-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a8 0%, #fc8 50%, #f66 100%);
}

.encounter-rate-value {
  color: #e8e8e8;
  min-width: 40px;
  text-align: right;
}
`;
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render encounter popup
 * @param {Object} encounter - Encounter instance
 * @returns {string} HTML string
 */
export function renderEncounterPopup(encounter) {
  const detailsHtml = renderEncounterDetails(encounter);
  const actionsHtml = renderEncounterActions(encounter);

  return `
    <div class="encounter-overlay"></div>
    <div class="encounter-popup">
      <div class="encounter-header">
        <div class="encounter-icon ${encounter.type}">${escapeHtml(encounter.icon)}</div>
        <div class="encounter-title-block">
          <h3 class="encounter-title">${escapeHtml(encounter.name)}</h3>
          <span class="encounter-rarity ${encounter.rarity}">${encounter.rarity}</span>
        </div>
      </div>
      <p class="encounter-description">${escapeHtml(encounter.description)}</p>
      ${detailsHtml}
      <div class="encounter-actions">
        ${actionsHtml}
      </div>
    </div>
  `.trim();
}

/**
 * Render encounter details based on type
 * @param {Object} encounter - Encounter instance
 * @returns {string} HTML string
 */
function renderEncounterDetails(encounter) {
  let detailRows = '';

  switch (encounter.type) {
    case ENCOUNTER_TYPE.COMBAT:
      if (encounter.enemies) {
        detailRows += `
          <div class="encounter-detail-row">
            <span class="encounter-detail-icon">\u2694\uFE0F</span>
            <span class="encounter-detail-label">Enemies:</span>
            <span class="encounter-detail-value">${encounter.enemies.length}</span>
          </div>
        `;
      }
      if (encounter.scaledLevel) {
        detailRows += `
          <div class="encounter-detail-row">
            <span class="encounter-detail-icon">\u2B50</span>
            <span class="encounter-detail-label">Level:</span>
            <span class="encounter-detail-value">${encounter.scaledLevel}</span>
          </div>
        `;
      }
      break;

    case ENCOUNTER_TYPE.TREASURE:
      detailRows += `
        <div class="encounter-detail-row">
          <span class="encounter-detail-icon">\uD83D\uDCBC</span>
          <span class="encounter-detail-label">Loot Type:</span>
          <span class="encounter-detail-value">${escapeHtml(encounter.lootTable || 'Unknown')}</span>
        </div>
      `;
      break;

    case ENCOUNTER_TYPE.TRAP:
      if (encounter.scaledDamage) {
        detailRows += `
          <div class="encounter-detail-row">
            <span class="encounter-detail-icon">\uD83D\uDCA5</span>
            <span class="encounter-detail-label">Potential Damage:</span>
            <span class="encounter-detail-value" style="color: #f66;">${encounter.scaledDamage}</span>
          </div>
        `;
      }
      if (encounter.avoidCheck) {
        detailRows += `
          <div class="encounter-detail-row">
            <span class="encounter-detail-icon">\uD83C\uDFAF</span>
            <span class="encounter-detail-label">Avoid Check:</span>
            <span class="encounter-detail-value">${escapeHtml(encounter.avoidCheck)}</span>
          </div>
        `;
      }
      break;

    case ENCOUNTER_TYPE.REST:
      if (encounter.restBonus) {
        detailRows += `
          <div class="encounter-detail-row">
            <span class="encounter-detail-icon">\uD83D\uDCA4</span>
            <span class="encounter-detail-label">Rest Bonus:</span>
            <span class="encounter-detail-value" style="color: #4a8;">x${encounter.restBonus}</span>
          </div>
        `;
      }
      break;

    case ENCOUNTER_TYPE.MERCHANT:
      if (encounter.shopType) {
        detailRows += `
          <div class="encounter-detail-row">
            <span class="encounter-detail-icon">\uD83D\uDED2</span>
            <span class="encounter-detail-label">Shop Type:</span>
            <span class="encounter-detail-value">${escapeHtml(encounter.shopType)}</span>
          </div>
        `;
      }
      break;
  }

  if (!detailRows) return '';

  return `
    <div class="encounter-details">
      ${detailRows}
    </div>
  `.trim();
}

/**
 * Render encounter action buttons
 * @param {Object} encounter - Encounter instance
 * @returns {string} HTML string
 */
function renderEncounterActions(encounter) {
  switch (encounter.type) {
    case ENCOUNTER_TYPE.COMBAT:
      return `
        <button class="encounter-btn encounter-btn-fight" data-action="fight">Fight!</button>
        <button class="encounter-btn encounter-btn-flee" data-action="flee">Flee</button>
      `;

    case ENCOUNTER_TYPE.TREASURE:
      return `
        <button class="encounter-btn encounter-btn-collect" data-action="collect">Collect</button>
        <button class="encounter-btn encounter-btn-decline" data-action="leave">Leave</button>
      `;

    case ENCOUNTER_TYPE.EVENT:
      return `
        <button class="encounter-btn encounter-btn-accept" data-action="accept">Accept</button>
        <button class="encounter-btn encounter-btn-decline" data-action="decline">Decline</button>
      `;

    case ENCOUNTER_TYPE.MERCHANT:
      return `
        <button class="encounter-btn encounter-btn-accept" data-action="shop">Browse Wares</button>
        <button class="encounter-btn encounter-btn-decline" data-action="leave">Leave</button>
      `;

    case ENCOUNTER_TYPE.REST:
      return `
        <button class="encounter-btn encounter-btn-accept" data-action="rest">Rest Here</button>
        <button class="encounter-btn encounter-btn-decline" data-action="continue">Continue</button>
      `;

    case ENCOUNTER_TYPE.TRAP:
      return `
        <button class="encounter-btn encounter-btn-accept" data-action="disarm">Attempt Disarm</button>
        <button class="encounter-btn encounter-btn-flee" data-action="avoid">Try to Avoid</button>
      `;

    case ENCOUNTER_TYPE.NPC:
      return `
        <button class="encounter-btn encounter-btn-accept" data-action="talk">Talk</button>
        <button class="encounter-btn encounter-btn-decline" data-action="ignore">Ignore</button>
      `;

    default:
      return `
        <button class="encounter-btn encounter-btn-accept" data-action="continue">Continue</button>
      `;
  }
}

/**
 * Render encounter notification (mini alert)
 * @param {Object} encounter - Encounter instance
 * @returns {string} HTML string
 */
export function renderEncounterNotification(encounter) {
  const typeText = {
    [ENCOUNTER_TYPE.COMBAT]: 'Enemy Encountered!',
    [ENCOUNTER_TYPE.TREASURE]: 'Treasure Found!',
    [ENCOUNTER_TYPE.EVENT]: 'Something Happened!',
    [ENCOUNTER_TYPE.MERCHANT]: 'Merchant Spotted!',
    [ENCOUNTER_TYPE.REST]: 'Rest Spot Found!',
    [ENCOUNTER_TYPE.TRAP]: 'Watch Out!',
    [ENCOUNTER_TYPE.NPC]: 'Someone Approaches!',
  };

  return `
    <div class="encounter-notification">
      <div class="encounter-notification-content">
        <span class="encounter-notification-icon">${escapeHtml(encounter.icon)}</span>
        <span class="encounter-notification-text">${typeText[encounter.type] || 'Encounter!'}</span>
      </div>
    </div>
  `.trim();
}

/**
 * Render encounter result
 * @param {Object} encounter - Resolved encounter
 * @param {Object} rewards - Rewards received
 * @returns {string} HTML string
 */
export function renderEncounterResult(encounter, rewards = null) {
  const outcomeDisplay = {
    victory: { icon: '\uD83C\uDFC6', title: 'Victory!', class: 'victory' },
    defeat: { icon: '\uD83D\uDC80', title: 'Defeat', class: 'defeat' },
    flee: { icon: '\uD83C\uDFC3', title: 'Escaped!', class: 'fled' },
    collected: { icon: '\uD83D\uDCBC', title: 'Collected!', class: 'collected' },
    completed: { icon: '\u2705', title: 'Complete!', class: 'victory' },
    avoided: { icon: '\uD83D\uDE05', title: 'Avoided!', class: 'victory' },
    triggered: { icon: '\uD83D\uDCA5', title: 'Triggered!', class: 'defeat' },
  };

  const outcome = outcomeDisplay[encounter.outcome] || {
    icon: '\u2753',
    title: 'Done',
    class: '',
  };

  let rewardsHtml = '';
  if (rewards) {
    let rewardItems = '';
    if (rewards.xp) {
      rewardItems += `<div class="reward-item reward-xp">\u2728 +${rewards.xp} XP</div>`;
    }
    if (rewards.gold) {
      rewardItems += `<div class="reward-item reward-gold">\uD83D\uDCB0 +${rewards.gold} Gold</div>`;
    }
    if (rewards.items && rewards.items.length > 0) {
      rewardItems += `<div class="reward-item reward-item-drop">\uD83C\uDF81 +${rewards.items.length} Item(s)</div>`;
    }
    if (rewards.damage) {
      rewardItems += `<div class="reward-item" style="color: #f66;">\uD83D\uDCA5 -${rewards.damage} HP</div>`;
    }

    if (rewardItems) {
      rewardsHtml = `<div class="encounter-result-rewards">${rewardItems}</div>`;
    }
  }

  return `
    <div class="encounter-result">
      <div class="encounter-result-icon">${outcome.icon}</div>
      <div class="encounter-result-title ${outcome.class}">${outcome.title}</div>
      ${rewardsHtml}
    </div>
  `.trim();
}

/**
 * Render encounter stats panel
 * @param {Object} state - Encounter state
 * @returns {string} HTML string
 */
export function renderEncounterStatsPanel(state) {
  const stats = getEncounterStats(state);

  return `
    <div class="encounter-stats-panel">
      <div class="encounter-stats-title">Encounter Statistics</div>
      <div class="encounter-stat-row">
        <span class="encounter-stat-label">Total Encounters:</span>
        <span class="encounter-stat-value">${stats.total}</span>
      </div>
      <div class="encounter-stat-row">
        <span class="encounter-stat-label">Battles Won:</span>
        <span class="encounter-stat-value">${stats.won}</span>
      </div>
      <div class="encounter-stat-row">
        <span class="encounter-stat-label">Times Fled:</span>
        <span class="encounter-stat-value">${stats.fled}</span>
      </div>
      <div class="encounter-stat-row">
        <span class="encounter-stat-label">Win Rate:</span>
        <span class="encounter-stat-value">${stats.winRate}%</span>
      </div>
      <div class="encounter-stat-row">
        <span class="encounter-stat-label">Unique Encounters:</span>
        <span class="encounter-stat-value">${stats.uniqueEncountered}</span>
      </div>
    </div>
  `.trim();
}

/**
 * Render encounter rate display
 * @param {Object} state - Encounter state
 * @param {string} location - Current location
 * @returns {string} HTML string
 */
export function renderEncounterRateDisplay(state, location) {
  const rate = getEncounterRate(state, location);
  const percent = Math.floor(rate * 100);

  return `
    <div class="encounter-rate-display">
      <span class="encounter-rate-label">Encounter Rate:</span>
      <div class="encounter-rate-bar">
        <div class="encounter-rate-fill" style="width: ${percent}%"></div>
      </div>
      <span class="encounter-rate-value">${percent}%</span>
    </div>
  `.trim();
}

/**
 * Render encounter list (for bestiary/log)
 * @param {Array} encounters - Array of encounter definitions
 * @returns {string} HTML string
 */
export function renderEncounterList(encounters) {
  if (!encounters || encounters.length === 0) {
    return '<div style="color: #888; text-align: center;">No encounters found.</div>';
  }

  const items = encounters.map(e => `
    <div class="encounter-list-item" data-encounter="${escapeHtml(e.id)}">
      <span class="encounter-list-icon ${e.type}">${escapeHtml(e.icon)}</span>
      <span class="encounter-list-name">${escapeHtml(e.name)}</span>
      <span class="encounter-rarity ${e.rarity}">${e.rarity}</span>
    </div>
  `).join('');

  return `<div class="encounter-list">${items}</div>`;
}
