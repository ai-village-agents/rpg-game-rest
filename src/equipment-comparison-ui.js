/**
 * Equipment Comparison UI Module — AI Village RPG
 * Owner: Opus 4.5 (Claude Code)
 *
 * Renders equipment comparison tooltips and panels
 * showing stat differences between items.
 */

import {
  compareEquipment,
  compareWithEquipped,
  formatStatChange,
  formatAssessment,
  getRarityColor,
  getSlotLabel,
} from './equipment-comparison.js';

// ── Render Functions ─────────────────────────────────────────────────

/**
 * Render a compact comparison tooltip.
 *
 * @param {Object} comparison - Comparison result from compareEquipment
 * @returns {string} HTML string for tooltip
 */
export function renderComparisonTooltip(comparison) {
  if (!comparison.valid) {
    return `<div class="comparison-tooltip error">${escapeHtml(comparison.error)}</div>`;
  }

  const { newItem, currentItem, statChanges, summary } = comparison;
  const assessment = formatAssessment(summary.assessment);

  const upgradesHtml = statChanges
    .filter(c => c.isUpgrade)
    .map(c => `<div class="stat-change upgrade">${renderStatLine(c)}</div>`)
    .join('');

  const downgradesHtml = statChanges
    .filter(c => c.isDowngrade)
    .map(c => `<div class="stat-change downgrade">${renderStatLine(c)}</div>`)
    .join('');

  return `
    <div class="comparison-tooltip">
      <div class="tooltip-header">
        <span class="item-name" style="color: ${getRarityColor(newItem)}">${escapeHtml(newItem.name)}</span>
        ${currentItem ? `<span class="vs">vs</span><span class="item-name current" style="color: ${getRarityColor(currentItem)}">${escapeHtml(currentItem.name)}</span>` : '<span class="empty-slot">(Empty Slot)</span>'}
      </div>
      
      <div class="assessment" style="color: ${assessment.color}">${assessment.text}</div>
      
      ${upgradesHtml ? `<div class="upgrades-section">${upgradesHtml}</div>` : ''}
      ${downgradesHtml ? `<div class="downgrades-section">${downgradesHtml}</div>` : ''}
      
      ${statChanges.length === 0 ? '<div class="no-changes">No stat differences</div>' : ''}
    </div>
  `.trim();
}

/**
 * Render a full comparison panel.
 *
 * @param {Object} comparison - Comparison result
 * @returns {string} HTML string for panel
 */
export function renderComparisonPanel(comparison) {
  if (!comparison.valid) {
    return `<section class="comparison-panel error"><p>${escapeHtml(comparison.error)}</p></section>`;
  }

  const { newItem, currentItem, statChanges, summary, slot, slotLabel, isEmptySlot } = comparison;
  const assessment = formatAssessment(summary.assessment);

  return `
    <section class="comparison-panel">
      <header class="panel-header">
        <h3>Equipment Comparison</h3>
        ${slot ? `<span class="slot-badge">${escapeHtml(slotLabel ?? getSlotLabel(slot))}</span>` : ''}
      </header>

      <div class="items-row">
        <div class="item-card new">
          <div class="item-label">New</div>
          <div class="item-name" style="color: ${getRarityColor(newItem)}">${escapeHtml(newItem.name)}</div>
          <div class="item-rarity">${escapeHtml(newItem.rarity ?? 'Common')}</div>
          ${renderItemStats(newItem)}
        </div>
        
        <div class="comparison-arrow">
          <span class="arrow">→</span>
          <div class="assessment-badge" style="background: ${assessment.color}">${assessment.text}</div>
        </div>
        
        <div class="item-card current ${isEmptySlot ? 'empty' : ''}">
          <div class="item-label">Current</div>
          ${currentItem
            ? `<div class="item-name" style="color: ${getRarityColor(currentItem)}">${escapeHtml(currentItem.name)}</div>
               <div class="item-rarity">${escapeHtml(currentItem.rarity ?? 'Common')}</div>
               ${renderItemStats(currentItem)}`
            : '<div class="empty-text">Empty Slot</div>'
          }
        </div>
      </div>

      <div class="stat-changes-section">
        <h4>Stat Changes</h4>
        ${statChanges.length > 0
          ? `<div class="stat-changes-grid">${statChanges.map(c => renderStatChangeRow(c)).join('')}</div>`
          : '<div class="no-changes">No stat differences</div>'
        }
      </div>

      <div class="summary-section">
        <div class="summary-stat">
          <span class="label">Upgrades</span>
          <span class="value upgrade">${summary.upgrades}</span>
        </div>
        <div class="summary-stat">
          <span class="label">Downgrades</span>
          <span class="value downgrade">${summary.downgrades}</span>
        </div>
        <div class="summary-stat">
          <span class="label">Net Change</span>
          <span class="value ${summary.netChange >= 0 ? 'positive' : 'negative'}">${summary.netChange >= 0 ? '+' : ''}${summary.netChange}</span>
        </div>
      </div>
    </section>
  `.trim();
}

// ── Helper Renderers ─────────────────────────────────────────────────

function renderStatLine(change) {
  const sign = change.difference > 0 ? '+' : '';
  const color = change.isUpgrade ? '#00ff00' : '#ff6666';
  return `<span class="stat-icon">${change.icon}</span>
          <span class="stat-label">${escapeHtml(change.label)}</span>
          <span class="stat-diff" style="color: ${color}">${sign}${change.difference}</span>`;
}

function renderStatChangeRow(change) {
  const sign = change.difference > 0 ? '+' : '';
  const colorClass = change.isUpgrade ? 'upgrade' : 'downgrade';
  
  return `
    <div class="stat-change-row ${colorClass}">
      <span class="stat-icon">${change.icon}</span>
      <span class="stat-name">${escapeHtml(change.label)}</span>
      <span class="stat-current">${change.currentValue}</span>
      <span class="stat-arrow">→</span>
      <span class="stat-new">${change.newValue}</span>
      <span class="stat-diff ${colorClass}">(${sign}${change.difference})</span>
    </div>
  `.trim();
}

function renderItemStats(item) {
  const stats = item.stats ?? {};
  const entries = Object.entries(stats).filter(([_, v]) => v !== 0);
  
  if (entries.length === 0) {
    return '<div class="item-stats empty">No combat stats</div>';
  }

  const statsHtml = entries
    .map(([key, value]) => `<span class="stat">${key}: ${value}</span>`)
    .join('');

  return `<div class="item-stats">${statsHtml}</div>`;
}

// ── CSS Styles ───────────────────────────────────────────────────────

/**
 * Get CSS styles for equipment comparison components.
 * @returns {string} CSS stylesheet string
 */
export function getEquipmentComparisonStyles() {
  return `
    /* Comparison Tooltip */
    .comparison-tooltip {
      background: rgba(0, 0, 0, 0.95);
      border: 1px solid #444;
      border-radius: 8px;
      padding: 12px;
      min-width: 200px;
      max-width: 320px;
      font-size: 13px;
    }

    .comparison-tooltip.error {
      color: #ff6666;
      text-align: center;
    }

    .comparison-tooltip .tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }

    .comparison-tooltip .item-name {
      font-weight: bold;
    }

    .comparison-tooltip .item-name.current {
      opacity: 0.7;
    }

    .comparison-tooltip .vs {
      color: #888;
      font-size: 11px;
    }

    .comparison-tooltip .empty-slot {
      color: #666;
      font-style: italic;
    }

    .comparison-tooltip .assessment {
      text-align: center;
      font-weight: bold;
      margin-bottom: 8px;
      padding: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .comparison-tooltip .stat-change {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 0;
    }

    .comparison-tooltip .stat-change.upgrade .stat-diff {
      color: #00ff00;
    }

    .comparison-tooltip .stat-change.downgrade .stat-diff {
      color: #ff6666;
    }

    .comparison-tooltip .stat-icon {
      width: 18px;
      text-align: center;
    }

    .comparison-tooltip .stat-label {
      flex: 1;
      color: #ccc;
    }

    .comparison-tooltip .stat-diff {
      font-weight: bold;
    }

    .comparison-tooltip .no-changes {
      color: #888;
      text-align: center;
      font-style: italic;
    }

    /* Comparison Panel */
    .comparison-panel {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid #334;
      border-radius: 10px;
      padding: 16px;
      margin: 10px 0;
    }

    .comparison-panel.error {
      text-align: center;
      color: #ff6666;
    }

    .comparison-panel .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .comparison-panel .panel-header h3 {
      margin: 0;
      color: #fff;
      font-size: 18px;
    }

    .comparison-panel .slot-badge {
      background: #334;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      color: #aaa;
    }

    .comparison-panel .items-row {
      display: flex;
      gap: 16px;
      align-items: stretch;
      margin-bottom: 16px;
    }

    .comparison-panel .item-card {
      flex: 1;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid #444;
      border-radius: 8px;
      padding: 12px;
    }

    .comparison-panel .item-card.new {
      border-color: #446;
    }

    .comparison-panel .item-card.empty {
      border-style: dashed;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .comparison-panel .item-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .comparison-panel .item-name {
      font-weight: bold;
      font-size: 15px;
      margin-bottom: 2px;
    }

    .comparison-panel .item-rarity {
      font-size: 11px;
      color: #888;
      margin-bottom: 8px;
    }

    .comparison-panel .item-stats {
      font-size: 12px;
      color: #aaa;
    }

    .comparison-panel .item-stats .stat {
      display: inline-block;
      margin-right: 8px;
    }

    .comparison-panel .item-stats.empty {
      color: #666;
      font-style: italic;
    }

    .comparison-panel .empty-text {
      color: #666;
      font-style: italic;
    }

    .comparison-panel .comparison-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .comparison-panel .arrow {
      font-size: 24px;
      color: #666;
    }

    .comparison-panel .assessment-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      color: #000;
      white-space: nowrap;
    }

    .comparison-panel .stat-changes-section h4 {
      margin: 0 0 12px 0;
      color: #ccc;
      font-size: 14px;
    }

    .comparison-panel .stat-changes-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .comparison-panel .stat-change-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 4px;
    }

    .comparison-panel .stat-change-row.upgrade {
      border-left: 3px solid #00ff00;
    }

    .comparison-panel .stat-change-row.downgrade {
      border-left: 3px solid #ff6666;
    }

    .comparison-panel .stat-icon {
      width: 20px;
      text-align: center;
    }

    .comparison-panel .stat-name {
      flex: 1;
      color: #ccc;
    }

    .comparison-panel .stat-current {
      color: #888;
      min-width: 30px;
      text-align: right;
    }

    .comparison-panel .stat-arrow {
      color: #666;
    }

    .comparison-panel .stat-new {
      color: #fff;
      min-width: 30px;
      text-align: right;
    }

    .comparison-panel .stat-diff {
      min-width: 50px;
      text-align: right;
      font-weight: bold;
    }

    .comparison-panel .stat-diff.upgrade {
      color: #00ff00;
    }

    .comparison-panel .stat-diff.downgrade {
      color: #ff6666;
    }

    .comparison-panel .summary-section {
      display: flex;
      gap: 20px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #333;
    }

    .comparison-panel .summary-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .comparison-panel .summary-stat .label {
      font-size: 11px;
      color: #888;
      margin-bottom: 2px;
    }

    .comparison-panel .summary-stat .value {
      font-size: 18px;
      font-weight: bold;
    }

    .comparison-panel .summary-stat .value.upgrade {
      color: #00ff00;
    }

    .comparison-panel .summary-stat .value.downgrade {
      color: #ff6666;
    }

    .comparison-panel .summary-stat .value.positive {
      color: #00ff00;
    }

    .comparison-panel .summary-stat .value.negative {
      color: #ff6666;
    }

    .comparison-panel .no-changes {
      color: #666;
      text-align: center;
      font-style: italic;
      padding: 12px;
    }
  `;
}

// ── Utility ──────────────────────────────────────────────────────────

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
