/**
 * Equipment Set UI Components
 * Renders set bonuses, progress, and equipment displays
 */

import {
  EQUIPMENT_SETS,
  EQUIPMENT_SLOTS,
  countEquippedSetPieces,
  getSetData,
  getActiveSetBonuses,
  getSetProgress,
  getSetPieceStatus,
  checkSetAdvancement,
  getEquipmentSetSummary,
  getAllSets,
} from './equipment-sets.js';

/**
 * Get CSS styles for equipment set UI
 * @returns {string} CSS styles
 */
export function getEquipmentSetStyles() {
  return `
.set-bonus-container {
  padding: 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #0f3460;
  margin-bottom: 10px;
}

.set-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.set-icon {
  font-size: 20px;
  line-height: 1;
}

.set-name {
  font-size: 14px;
  font-weight: bold;
  color: #e8e8e8;
}

.set-piece-count {
  font-size: 12px;
  color: #888;
  margin-left: auto;
}

.set-piece-count.complete {
  color: #8f8;
}

.set-description {
  font-size: 11px;
  color: #aaa;
  font-style: italic;
  margin-bottom: 8px;
}

.set-bonus-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-bonus-item {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.set-bonus-item.active {
  background: rgba(100, 200, 100, 0.2);
  color: #8f8;
  border-left: 2px solid #8f8;
}

.set-bonus-item.inactive {
  background: rgba(100, 100, 100, 0.15);
  color: #666;
}

.set-bonus-item.next {
  background: rgba(200, 200, 100, 0.15);
  color: #aa8;
  border-left: 2px dashed #aa8;
}

.set-bonus-threshold {
  font-weight: bold;
  min-width: 20px;
}

.set-bonus-description {
  flex: 1;
}

/* Set progress bar */
.set-progress-bar {
  height: 4px;
  background: #333;
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}

.set-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a8 0%, #8f8 100%);
  transition: width 0.3s ease;
}

/* Set pieces display */
.set-pieces-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 8px;
}

.set-piece {
  font-size: 10px;
  padding: 4px 6px;
  border-radius: 4px;
  text-align: center;
  text-transform: capitalize;
}

.set-piece.equipped {
  background: rgba(100, 200, 100, 0.2);
  color: #8f8;
  border: 1px solid #4a8;
}

.set-piece.missing {
  background: rgba(100, 100, 100, 0.1);
  color: #555;
  border: 1px dashed #444;
}

/* Active sets summary */
.active-sets-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.active-set-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(100, 200, 100, 0.15);
  border: 1px solid rgba(100, 200, 100, 0.3);
  font-size: 11px;
}

.active-set-badge .badge-icon {
  font-size: 14px;
}

.active-set-badge .badge-name {
  color: #8f8;
  font-weight: bold;
}

.active-set-badge .badge-pieces {
  color: #888;
}

/* Set advancement notification */
.set-advancement-notice {
  padding: 10px;
  background: linear-gradient(135deg, #1a2a1a 0%, #0a1a0a 100%);
  border: 1px solid #4a8;
  border-radius: 6px;
  text-align: center;
  animation: set-unlock 0.5s ease-out;
}

@keyframes set-unlock {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

.set-advancement-notice .unlock-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.set-advancement-notice .unlock-title {
  font-size: 13px;
  font-weight: bold;
  color: #8f8;
  margin-bottom: 4px;
}

.set-advancement-notice .unlock-bonus {
  font-size: 11px;
  color: #aaa;
}

/* Equipment slot indicator */
.slot-set-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(100, 200, 100, 0.3);
}

/* Total bonus stats */
.total-set-bonuses {
  padding: 8px;
  background: rgba(50, 100, 50, 0.1);
  border-radius: 6px;
  margin-top: 8px;
}

.total-set-bonuses-title {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.total-bonus-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.total-bonus-stat {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(100, 200, 100, 0.2);
  color: #8f8;
}
`;
}

/**
 * Render active set bonuses display
 * @param {Object} equipment - Equipped items by slot
 * @returns {string} HTML string
 */
export function renderActiveSetBonuses(equipment) {
  const summary = getEquipmentSetSummary(equipment);

  if (summary.setCount === 0) {
    return `
      <div class="set-bonus-container">
        <div class="set-header">
          <span class="set-icon">\u2728</span>
          <span class="set-name">No Active Set Bonuses</span>
        </div>
        <div class="set-description">Equip matching gear pieces to unlock set bonuses.</div>
      </div>
    `.trim();
  }

  const setBonusHtml = summary.activeSets.map(activeSet => {
    const setData = getSetData(activeSet.setId);
    const progress = getSetProgress(equipment, activeSet.setId);
    const progressPercent = (activeSet.pieces / activeSet.totalPieces) * 100;

    return `
      <div class="set-bonus-container">
        <div class="set-header">
          <span class="set-icon">${escapeHtml(activeSet.icon)}</span>
          <span class="set-name">${escapeHtml(activeSet.setName)}</span>
          <span class="set-piece-count ${activeSet.pieces === activeSet.totalPieces ? 'complete' : ''}">${activeSet.pieces}/${activeSet.totalPieces}</span>
        </div>
        <div class="set-bonus-list">
          ${renderSetBonusTiers(setData, activeSet.pieces)}
        </div>
        <div class="set-progress-bar">
          <div class="set-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;
  }).join('');

  return setBonusHtml;
}

/**
 * Render set bonus tiers
 * @param {Object} setData - Set data
 * @param {number} equippedPieces - Number of equipped pieces
 * @returns {string} HTML string
 */
function renderSetBonusTiers(setData, equippedPieces) {
  const thresholds = Object.keys(setData.bonuses).map(Number).sort((a, b) => a - b);

  return thresholds.map(threshold => {
    const bonus = setData.bonuses[threshold];
    const isActive = equippedPieces >= threshold;
    const isNext = !isActive && equippedPieces === threshold - 1;
    const statusClass = isActive ? 'active' : (isNext ? 'next' : 'inactive');

    return `
      <div class="set-bonus-item ${statusClass}">
        <span class="set-bonus-threshold">(${threshold})</span>
        <span class="set-bonus-description">${escapeHtml(bonus.description)}</span>
      </div>
    `;
  }).join('');
}

/**
 * Render set progress display
 * @param {Object} equipment - Equipped items
 * @param {string} setId - Set ID to display
 * @returns {string} HTML string
 */
export function renderSetProgress(equipment, setId) {
  const progress = getSetProgress(equipment, setId);

  if (!progress.found) {
    return `<div class="set-bonus-container">Set not found</div>`;
  }

  const pieceStatus = getSetPieceStatus(equipment, setId);
  const progressPercent = (progress.equippedPieces / progress.totalPieces) * 100;

  return `
    <div class="set-bonus-container">
      <div class="set-header">
        <span class="set-icon">${escapeHtml(progress.icon)}</span>
        <span class="set-name">${escapeHtml(progress.setName)}</span>
        <span class="set-piece-count ${progress.equippedPieces === progress.totalPieces ? 'complete' : ''}">${progress.equippedPieces}/${progress.totalPieces}</span>
      </div>
      <div class="set-description">${escapeHtml(progress.description)}</div>
      <div class="set-pieces-grid">
        ${pieceStatus.map(piece => `
          <div class="set-piece ${piece.equipped ? 'equipped' : 'missing'}">
            ${escapeHtml(piece.slot)}
          </div>
        `).join('')}
      </div>
      <div class="set-progress-bar">
        <div class="set-progress-fill" style="width: ${progressPercent}%"></div>
      </div>
      ${progress.nextBonus ? `
        <div class="set-bonus-item next" style="margin-top: 8px;">
          <span class="set-bonus-threshold">Next (${progress.nextThreshold}):</span>
          <span class="set-bonus-description">${escapeHtml(progress.nextBonus.description)}</span>
        </div>
      ` : ''}
    </div>
  `.trim();
}

/**
 * Render compact active sets badges
 * @param {Object} equipment - Equipped items
 * @returns {string} HTML string
 */
export function renderActiveSetBadges(equipment) {
  const summary = getEquipmentSetSummary(equipment);

  if (summary.setCount === 0) {
    return '';
  }

  const badges = summary.activeSets.map(activeSet => `
    <div class="active-set-badge">
      <span class="badge-icon">${escapeHtml(activeSet.icon)}</span>
      <span class="badge-name">${escapeHtml(activeSet.setName)}</span>
      <span class="badge-pieces">(${activeSet.pieces})</span>
    </div>
  `).join('');

  return `<div class="active-sets-container">${badges}</div>`;
}

/**
 * Render set advancement notification
 * @param {Object} advancement - Advancement info from checkSetAdvancement
 * @returns {string} HTML string
 */
export function renderSetAdvancementNotice(advancement) {
  if (!advancement) return '';

  const bonusText = advancement.newBonusUnlocked
    ? advancement.newBonusUnlocked.bonus.description
    : `${advancement.newPieces} pieces equipped`;

  return `
    <div class="set-advancement-notice">
      <div class="unlock-icon">${escapeHtml(advancement.icon)}</div>
      <div class="unlock-title">${escapeHtml(advancement.setName)} ${advancement.newBonusUnlocked ? 'Bonus Unlocked!' : 'Progress!'}</div>
      <div class="unlock-bonus">${escapeHtml(bonusText)}</div>
    </div>
  `.trim();
}

/**
 * Render total set bonus stats
 * @param {Object} equipment - Equipped items
 * @returns {string} HTML string
 */
export function renderTotalSetBonusStats(equipment) {
  const summary = getEquipmentSetSummary(equipment);
  const stats = summary.totalBonusStats;

  if (Object.keys(stats).length === 0) {
    return '';
  }

  const statDisplay = Object.entries(stats).map(([stat, value]) => {
    const displayValue = typeof value === 'number' && value < 1
      ? `+${Math.round(value * 100)}%`
      : `+${value}`;
    return `<span class="total-bonus-stat">${formatStatName(stat)} ${displayValue}</span>`;
  }).join('');

  return `
    <div class="total-set-bonuses">
      <div class="total-set-bonuses-title">Total Set Bonuses</div>
      <div class="total-bonus-grid">${statDisplay}</div>
    </div>
  `.trim();
}

/**
 * Render all available sets catalog
 * @param {Object} equipment - Equipped items (optional, to show progress)
 * @returns {string} HTML string
 */
export function renderSetsCatalog(equipment = null) {
  const setIds = Object.keys(EQUIPMENT_SETS);

  const catalog = setIds.map(setId => {
    const setData = EQUIPMENT_SETS[setId];
    const progress = equipment ? getSetProgress(equipment, setId) : null;
    const equippedCount = progress ? progress.equippedPieces : 0;
    const totalPieces = Object.keys(setData.pieces).length;

    return `
      <div class="set-bonus-container">
        <div class="set-header">
          <span class="set-icon">${escapeHtml(setData.icon)}</span>
          <span class="set-name">${escapeHtml(setData.name)}</span>
          <span class="set-piece-count">${equippedCount}/${totalPieces}</span>
        </div>
        <div class="set-description">${escapeHtml(setData.description)}</div>
        <div class="set-bonus-list">
          ${renderSetBonusTiers(setData, equippedCount)}
        </div>
      </div>
    `;
  }).join('');

  return `<div class="sets-catalog">${catalog}</div>`;
}

/**
 * Render slot indicator showing set membership
 * @param {string} itemId - Item ID
 * @param {string} setId - Set ID the item belongs to
 * @returns {string} HTML string
 */
export function renderSlotSetIndicator(itemId, setId) {
  const setData = getSetData(setId);
  if (!setData) return '';

  return `<span class="slot-set-indicator" title="${escapeHtml(setData.name)}">${escapeHtml(setData.icon)}</span>`;
}

/**
 * Format stat name for display
 * @param {string} stat - Stat key
 * @returns {string} Formatted name
 */
function formatStatName(stat) {
  const names = {
    hp: 'HP',
    mp: 'MP',
    attack: 'ATK',
    defense: 'DEF',
    magic: 'MAG',
    speed: 'SPD',
    attackPercent: 'ATK',
    mpRegen: 'MP Regen',
    critChance: 'Crit',
    critDamage: 'Crit DMG',
    healingBonus: 'Healing',
    statusResist: 'Status Res',
    lowHpBonus: 'Low HP DMG',
    lifesteal: 'Lifesteal',
    evasion: 'Evasion',
    iceBonus: 'Ice DMG',
    fireBonus: 'Fire DMG',
    shadowBonus: 'Shadow DMG',
    freezeChance: 'Freeze',
    burnChance: 'Burn',
    iceResist: 'Ice Res',
    fireResist: 'Fire Res',
    shadowResist: 'Shadow Res',
  };
  return names[stat] || stat;
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

export function getEquipmentSetsPanelStyles() {
  return `
.equipment-sets-panel {
  display: block;
  padding: 16px;
  background: rgba(10, 12, 18, 0.9);
  border-radius: 12px;
  color: #ccc;
}
.equipment-sets-panel .set-card {
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  background: rgba(20, 22, 30, 0.8);
}
.equipment-sets-panel .set-card--active {
  border-color: #4a9;
  background: rgba(20, 60, 40, 0.6);
}
.equipment-sets-panel .set-card--compact {
  padding: 6px 10px;
  margin-bottom: 5px;
}
.equipment-sets-panel .set-bonuses {
  margin-top: 8px;
  font-size: 0.88em;
  color: #aef;
}
.equipment-sets-panel .set-header {
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 4px;
}
.equipment-sets-panel .inactive-sets {
  margin-top: 14px;
}
.equipment-sets-panel .inactive-sets h3 {
  color: #888;
  margin-bottom: 8px;
}
.equipment-sets-panel .set-progress {
  color: #aaa;
  font-size: 0.85em;
}
`;
}

export function renderEquipmentSetsPanel(equipment, options = {}) {
  const { showInactive = true, compact = false } = options;
  const allSets = Object.values(EQUIPMENT_SETS);
  const activeSets = [];
  const inactiveSets = [];
  for (const set of allSets) {
    const total = Object.keys(set.pieces).length;
    const equipped = equipment ? countEquippedSetPieces(equipment, set.id) : 0;
    const isActive = equipped >= 2 && equipped >= total;
    const missingItems = [];
    for (const [slot, pieceId] of Object.entries(set.pieces)) {
      if (!equipment || equipment[slot] !== pieceId) missingItems.push(pieceId);
    }
    const cardClass = 'set-card' + (isActive ? ' set-card--active' : '') + (compact ? ' set-card--compact' : '');
    const bonusThreshold = Object.keys(set.bonuses).map(Number).filter(t => equipped >= t).sort((a, b) => b - a)[0];
    const bonusText = bonusThreshold ? set.bonuses[bonusThreshold].description : '';
    const card = '<div class="' + cardClass + '"><div class="set-header">' + set.name + '</div><div class="set-progress">' + equipped + '/' + total + '</div>' + (bonusText ? '<div class="set-bonuses">' + bonusText + '</div>' : '') + '</div>';
    if (isActive) activeSets.push(card); else inactiveSets.push(card);
  }
  let html = '<div class="equipment-sets-panel">';
  html += activeSets.join('');
  if (showInactive && inactiveSets.length > 0) {
    html += '<div class="inactive-sets"><h3>Available Sets</h3>' + inactiveSets.join('') + '</div>';
  }
  html += (activeSets.length === 0 ? '<div class="no-active-sets">No complete sets equipped</div>' : '') + '</div>';
  return html;
}

export function getEquipmentSetsStatus(equipment) {
  const allSets = Object.values(EQUIPMENT_SETS);
  return allSets.map(set => {
    const totalRequired = Object.keys(set.pieces).length;
    const equippedCount = equipment ? countEquippedSetPieces(equipment, set.id) : 0;
    const isActive = equippedCount >= totalRequired;
    const missingItems = [];
    for (const [slot, pieceId] of Object.entries(set.pieces)) {
      if (!equipment || equipment[slot] !== pieceId) missingItems.push(pieceId);
    }
    return { set, isActive, equippedCount, totalRequired, missingItems };
  });
}
