/**
 * Press Turn UI Components
 * Renders press turn icons and action feedback
 */

import {
  ICON_STATE,
  ACTION_RESULT,
  countAvailableActions,
  getResultMessage,
  isBonusResult,
  isPenaltyResult,
  getComboBonus,
} from './press-turn.js';

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get icon character based on state
 * @param {string} state - Icon state
 * @returns {string} Icon character
 */
function getIconChar(state) {
  switch (state) {
    case ICON_STATE.FULL:
      return '\u25C9'; // ◉ filled circle
    case ICON_STATE.HALF:
      return '\u25D4'; // ◔ circle with upper right quadrant
    case ICON_STATE.EMPTY:
      return '\u25CB'; // ○ empty circle
    default:
      return '\u25CB';
  }
}

/**
 * Get icon CSS class based on state
 * @param {string} state - Icon state
 * @returns {string} CSS class
 */
function getIconClass(state) {
  switch (state) {
    case ICON_STATE.FULL:
      return 'press-turn-icon-full';
    case ICON_STATE.HALF:
      return 'press-turn-icon-half';
    case ICON_STATE.EMPTY:
      return 'press-turn-icon-empty';
    default:
      return 'press-turn-icon-empty';
  }
}

/**
 * Render a single press turn icon
 * @param {string} state - Icon state
 * @param {number} index - Icon index
 * @returns {string} HTML string
 */
function renderIcon(state, index) {
  const iconChar = getIconChar(state);
  const iconClass = getIconClass(state);

  return `
    <span class="press-turn-icon ${iconClass}" data-index="${index}">
      ${iconChar}
    </span>
  `.trim();
}

/**
 * Render press turn icons bar
 * @param {Array} icons - Array of icon states
 * @param {string} side - 'player' or 'enemy'
 * @returns {string} HTML string
 */
export function renderPressTurnBar(icons, side = 'player') {
  if (!Array.isArray(icons) || icons.length === 0) {
    return '';
  }

  const sideClass = side === 'player' ? 'player-icons' : 'enemy-icons';
  const label = side === 'player' ? 'Actions' : 'Enemy';
  const available = countAvailableActions(icons);

  return `
    <div class="press-turn-bar ${sideClass}">
      <span class="press-turn-label">${escapeHtml(label)}</span>
      <div class="press-turn-icons">
        ${icons.map((state, idx) => renderIcon(state, idx)).join('')}
      </div>
      <span class="press-turn-count">${available}</span>
    </div>
  `.trim();
}

/**
 * Render both player and enemy press turn bars
 * @param {Object} state - Press turn state
 * @returns {string} HTML string
 */
export function renderPressTurnDisplay(state) {
  if (!state) {
    return '';
  }

  const currentClass = state.currentTurn === 'player' ? 'player-active' : 'enemy-active';

  return `
    <div class="press-turn-display ${currentClass}">
      ${renderPressTurnBar(state.playerIcons, 'player')}
      <div class="press-turn-separator">
        <span class="turn-indicator">${state.currentTurn === 'player' ? '\u25B6' : '\u25C0'}</span>
      </div>
      ${renderPressTurnBar(state.enemyIcons, 'enemy')}
    </div>
  `.trim();
}

/**
 * Render action result notification
 * @param {string} result - Action result type
 * @param {number} consumed - Icons consumed
 * @returns {string} HTML string
 */
export function renderActionResult(result, consumed = 1) {
  const message = getResultMessage(result);
  if (!message) return '';

  let resultClass = 'result-normal';
  if (isBonusResult(result)) {
    resultClass = 'result-bonus';
  } else if (isPenaltyResult(result)) {
    resultClass = 'result-penalty';
  }

  const consumedText = consumed !== 1 ? ` (${consumed} action${consumed !== 1 ? 's' : ''})` : '';

  return `
    <div class="press-turn-result ${resultClass}">
      <span class="result-message">${escapeHtml(message)}</span>
      <span class="result-consumed">${escapeHtml(consumedText)}</span>
    </div>
  `.trim();
}

/**
 * Render combo indicator for consecutive weaknesses
 * @param {number} consecutive - Number of consecutive weakness hits
 * @returns {string} HTML string
 */
export function renderComboIndicator(consecutive) {
  if (typeof consecutive !== 'number' || consecutive < 2) {
    return '';
  }

  const bonus = getComboBonus(consecutive);
  const bonusPercent = Math.round(bonus * 100);

  return `
    <div class="press-turn-combo">
      <span class="combo-count">${consecutive}x COMBO!</span>
      <span class="combo-bonus">+${bonusPercent}% damage</span>
    </div>
  `.trim();
}

/**
 * Render turn start notification
 * @param {string} turn - Whose turn ('player' or 'enemy')
 * @param {number} actions - Number of available actions
 * @returns {string} HTML string
 */
export function renderTurnStart(turn, actions) {
  const turnLabel = turn === 'player' ? 'Your Turn' : 'Enemy Turn';
  const turnClass = turn === 'player' ? 'player-turn' : 'enemy-turn';

  return `
    <div class="press-turn-start ${turnClass}">
      <span class="turn-label">${escapeHtml(turnLabel)}</span>
      <span class="turn-actions">${actions} action${actions !== 1 ? 's' : ''}</span>
    </div>
  `.trim();
}

/**
 * Render pass action button
 * @param {boolean} enabled - Whether pass is available
 * @returns {string} HTML string
 */
export function renderPassButton(enabled = true) {
  const disabledAttr = enabled ? '' : 'disabled';
  const disabledClass = enabled ? '' : 'disabled';

  return `
    <button class="press-turn-pass ${disabledClass}" data-action="pass" ${disabledAttr}>
      <span class="pass-icon">\u23E9</span>
      <span class="pass-text">Pass (Half Action)</span>
    </button>
  `.trim();
}

/**
 * Render compact press turn indicator for HUD
 * @param {Object} state - Press turn state
 * @returns {string} HTML string
 */
export function renderCompactIndicator(state) {
  if (!state) return '';

  const playerActions = countAvailableActions(state.playerIcons);
  const isPlayerTurn = state.currentTurn === 'player';

  return `
    <div class="press-turn-compact ${isPlayerTurn ? 'active' : ''}">
      <span class="compact-label">PT:</span>
      <span class="compact-icons">${state.playerIcons.map(s => getIconChar(s)).join('')}</span>
    </div>
  `.trim();
}

/**
 * Get CSS styles for press turn UI
 * @returns {string} CSS string
 */
export function getPressTurnStyles() {
  return `
    .press-turn-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 8px;
      border: 1px solid #333;
    }

    .press-turn-bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .press-turn-label {
      font-size: 0.85em;
      color: #888;
      min-width: 50px;
    }

    .press-turn-icons {
      display: flex;
      gap: 4px;
    }

    .press-turn-icon {
      font-size: 1.4em;
      transition: all 0.3s ease;
    }

    .press-turn-icon-full {
      color: #4af;
      text-shadow: 0 0 8px rgba(68, 170, 255, 0.6);
    }

    .press-turn-icon-half {
      color: #fa4;
      text-shadow: 0 0 8px rgba(255, 170, 68, 0.6);
      animation: pulse-half 1s infinite;
    }

    .press-turn-icon-empty {
      color: #444;
    }

    .player-icons .press-turn-icon-full { color: #4af; }
    .enemy-icons .press-turn-icon-full { color: #f44; }
    .enemy-icons .press-turn-icon-half { color: #f84; }

    .press-turn-count {
      font-weight: bold;
      min-width: 20px;
      text-align: center;
    }

    .press-turn-separator {
      color: #666;
      font-size: 1.2em;
    }

    .player-active .turn-indicator { color: #4af; }
    .enemy-active .turn-indicator { color: #f44; }

    .press-turn-result {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.9em;
      animation: fade-slide-in 0.5s ease;
    }

    .result-bonus {
      background: rgba(68, 255, 68, 0.2);
      color: #4f4;
      border: 1px solid rgba(68, 255, 68, 0.4);
    }

    .result-penalty {
      background: rgba(255, 68, 68, 0.2);
      color: #f44;
      border: 1px solid rgba(255, 68, 68, 0.4);
    }

    .result-normal {
      background: rgba(255, 255, 255, 0.1);
      color: #aaa;
    }

    .press-turn-combo {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 16px;
      background: linear-gradient(135deg, #642 0%, #853 100%);
      border-radius: 6px;
      animation: combo-pulse 0.5s ease;
    }

    .combo-count {
      font-weight: bold;
      font-size: 1.2em;
      color: #fc0;
    }

    .combo-bonus {
      font-size: 0.85em;
      color: #fa8;
    }

    .press-turn-start {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 24px;
      border-radius: 8px;
      animation: turn-start 0.6s ease;
    }

    .player-turn {
      background: linear-gradient(135deg, #234 0%, #345 100%);
      border: 2px solid #4af;
    }

    .enemy-turn {
      background: linear-gradient(135deg, #432 0%, #543 100%);
      border: 2px solid #f44;
    }

    .turn-label {
      font-weight: bold;
      font-size: 1.1em;
    }

    .turn-actions {
      font-size: 0.9em;
      color: #aaa;
    }

    .press-turn-pass {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #333;
      border: 1px solid #555;
      border-radius: 4px;
      color: #ccc;
      cursor: pointer;
      transition: all 0.2s;
    }

    .press-turn-pass:hover:not(.disabled) {
      background: #444;
      border-color: #666;
    }

    .press-turn-pass.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .press-turn-compact {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 4px;
      font-size: 0.85em;
    }

    .press-turn-compact.active {
      background: rgba(68, 170, 255, 0.2);
      border: 1px solid rgba(68, 170, 255, 0.4);
    }

    @keyframes pulse-half {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    @keyframes fade-slide-in {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes combo-pulse {
      0% { transform: scale(0.8); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    @keyframes turn-start {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
  `.trim();
}
