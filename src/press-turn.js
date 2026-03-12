/**
 * Press Turn Combat System
 * Rewards strategic play by granting bonus actions for hitting weaknesses
 * and penalizing misses or hitting resistances
 */

/**
 * Press Turn icon states
 */
export const ICON_STATE = {
  FULL: 'full',      // Full action available
  HALF: 'half',      // Half action (consumed on next use)
  EMPTY: 'empty',    // No action remaining
};

/**
 * Action result types that affect press turns
 */
export const ACTION_RESULT = {
  NORMAL: 'normal',       // Standard action - consumes 1 full icon
  WEAKNESS: 'weakness',   // Hit weakness - consumes 1 half icon (or converts full to half)
  CRITICAL: 'critical',   // Critical hit - same as weakness
  MISS: 'miss',           // Missed attack - consumes 2 icons
  BLOCKED: 'blocked',     // Attack blocked/nullified - consumes 2 icons
  ABSORBED: 'absorbed',   // Element absorbed by enemy - consumes all icons
  PASS: 'pass',           // Voluntary pass - consumes 1 half icon
};

/**
 * Default configuration for press turn system
 */
export const DEFAULT_CONFIG = {
  baseIcons: 4,           // Base icons per turn
  maxIcons: 8,            // Maximum icons allowed
  partyBonusIcons: 1,     // Extra icon per party member (future)
  bossExtraIcons: 2,      // Bosses get extra icons
};

/**
 * Create initial press turn state for a combat encounter
 * @param {Object} options - Configuration options
 * @param {number} options.partySize - Number of party members
 * @param {boolean} options.isBoss - Whether enemy is a boss
 * @returns {Object} Press turn state
 */
export function createPressTurnState(options = {}) {
  const { partySize = 1, isBoss = false } = options;

  let totalIcons = DEFAULT_CONFIG.baseIcons;

  // Add icons for party members (future feature)
  if (partySize > 1) {
    totalIcons += (partySize - 1) * DEFAULT_CONFIG.partyBonusIcons;
  }

  // Cap at maximum
  totalIcons = Math.min(totalIcons, DEFAULT_CONFIG.maxIcons);

  return {
    playerIcons: createIconArray(totalIcons),
    enemyIcons: createIconArray(isBoss ? totalIcons + DEFAULT_CONFIG.bossExtraIcons : totalIcons),
    currentTurn: 'player',
    turnNumber: 1,
    actionsThisTurn: 0,
    consecutiveWeaknesses: 0,
  };
}

/**
 * Create an array of full icons
 * @param {number} count - Number of icons
 * @returns {Array} Array of icon states
 */
export function createIconArray(count) {
  const safeCount = Math.max(0, Math.min(count, DEFAULT_CONFIG.maxIcons));
  return Array(safeCount).fill(ICON_STATE.FULL);
}

/**
 * Count available actions from icon array
 * @param {Array} icons - Array of icon states
 * @returns {number} Number of available actions
 */
export function countAvailableActions(icons) {
  if (!Array.isArray(icons)) return 0;
  return icons.filter(icon => icon !== ICON_STATE.EMPTY).length;
}

/**
 * Check if any actions remain
 * @param {Array} icons - Array of icon states
 * @returns {boolean} Whether actions are available
 */
export function hasActionsRemaining(icons) {
  return countAvailableActions(icons) > 0;
}

/**
 * Determine action result based on attack context
 * @param {Object} context - Attack context
 * @param {boolean} context.hitWeakness - Whether attack hit a weakness
 * @param {boolean} context.isCritical - Whether attack was a critical hit
 * @param {boolean} context.missed - Whether attack missed
 * @param {boolean} context.wasBlocked - Whether attack was blocked/nullified
 * @param {boolean} context.wasAbsorbed - Whether element was absorbed
 * @param {boolean} context.isPass - Whether player chose to pass
 * @returns {string} Action result type
 */
export function determineActionResult(context = {}) {
  const {
    hitWeakness = false,
    isCritical = false,
    missed = false,
    wasBlocked = false,
    wasAbsorbed = false,
    isPass = false,
  } = context;

  // Absorbed attacks are worst - end turn immediately
  if (wasAbsorbed) return ACTION_RESULT.ABSORBED;

  // Blocked/nullified attacks waste extra icons
  if (wasBlocked) return ACTION_RESULT.BLOCKED;

  // Misses also waste extra icons
  if (missed) return ACTION_RESULT.MISS;

  // Passing is efficient - only uses half icon
  if (isPass) return ACTION_RESULT.PASS;

  // Weakness and criticals grant bonus actions
  if (hitWeakness) return ACTION_RESULT.WEAKNESS;
  if (isCritical) return ACTION_RESULT.CRITICAL;

  // Standard attack
  return ACTION_RESULT.NORMAL;
}

/**
 * Apply action result to icons array
 * @param {Array} icons - Current icon array
 * @param {string} result - Action result type
 * @returns {Object} Updated icons and metadata
 */
export function applyActionResult(icons, result) {
  if (!Array.isArray(icons) || icons.length === 0) {
    return { icons: [], consumed: 0, bonusGenerated: false };
  }

  const newIcons = [...icons];
  let consumed = 0;
  let bonusGenerated = false;

  switch (result) {
    case ACTION_RESULT.WEAKNESS:
    case ACTION_RESULT.CRITICAL:
      // Consume half icon, or convert full to half
      const halfIdx = newIcons.lastIndexOf(ICON_STATE.HALF);
      if (halfIdx !== -1) {
        newIcons[halfIdx] = ICON_STATE.EMPTY;
        consumed = 0.5;
      } else {
        const fullIdx = newIcons.lastIndexOf(ICON_STATE.FULL);
        if (fullIdx !== -1) {
          newIcons[fullIdx] = ICON_STATE.HALF;
          consumed = 0.5;
          bonusGenerated = true;
        }
      }
      break;

    case ACTION_RESULT.PASS:
      // Consume half icon only
      const passHalfIdx = newIcons.lastIndexOf(ICON_STATE.HALF);
      if (passHalfIdx !== -1) {
        newIcons[passHalfIdx] = ICON_STATE.EMPTY;
        consumed = 0.5;
      } else {
        const passFullIdx = newIcons.lastIndexOf(ICON_STATE.FULL);
        if (passFullIdx !== -1) {
          newIcons[passFullIdx] = ICON_STATE.HALF;
          consumed = 0.5;
        }
      }
      break;

    case ACTION_RESULT.MISS:
    case ACTION_RESULT.BLOCKED:
      // Consume 2 icons (or all remaining if fewer)
      for (let i = 0; i < 2; i++) {
        const idx = newIcons.lastIndexOf(ICON_STATE.FULL);
        if (idx !== -1) {
          newIcons[idx] = ICON_STATE.EMPTY;
          consumed += 1;
        } else {
          const halfIdx = newIcons.lastIndexOf(ICON_STATE.HALF);
          if (halfIdx !== -1) {
            newIcons[halfIdx] = ICON_STATE.EMPTY;
            consumed += 0.5;
          }
        }
      }
      break;

    case ACTION_RESULT.ABSORBED:
      // Lose all remaining icons
      for (let i = 0; i < newIcons.length; i++) {
        if (newIcons[i] !== ICON_STATE.EMPTY) {
          consumed += newIcons[i] === ICON_STATE.FULL ? 1 : 0.5;
          newIcons[i] = ICON_STATE.EMPTY;
        }
      }
      break;

    case ACTION_RESULT.NORMAL:
    default:
      // Consume 1 full icon (or half if no full available)
      const normalFullIdx = newIcons.lastIndexOf(ICON_STATE.FULL);
      if (normalFullIdx !== -1) {
        newIcons[normalFullIdx] = ICON_STATE.EMPTY;
        consumed = 1;
      } else {
        const normalHalfIdx = newIcons.lastIndexOf(ICON_STATE.HALF);
        if (normalHalfIdx !== -1) {
          newIcons[normalHalfIdx] = ICON_STATE.EMPTY;
          consumed = 0.5;
        }
      }
      break;
  }

  return { icons: newIcons, consumed, bonusGenerated };
}

/**
 * Start a new turn, resetting icons
 * @param {Object} state - Press turn state
 * @param {string} turn - Whose turn ('player' or 'enemy')
 * @returns {Object} Updated state
 */
export function startNewTurn(state, turn = 'player') {
  if (!state) return createPressTurnState();

  const isPlayer = turn === 'player';
  const iconCount = isPlayer
    ? state.playerIcons.length
    : state.enemyIcons.length;

  return {
    ...state,
    playerIcons: isPlayer ? createIconArray(iconCount) : state.playerIcons,
    enemyIcons: !isPlayer ? createIconArray(state.enemyIcons.length) : state.enemyIcons,
    currentTurn: turn,
    turnNumber: state.turnNumber + (turn === 'player' ? 1 : 0),
    actionsThisTurn: 0,
    consecutiveWeaknesses: 0,
  };
}

/**
 * Process an action and update state
 * @param {Object} state - Current press turn state
 * @param {Object} context - Action context
 * @returns {Object} Updated state with result info
 */
export function processAction(state, context = {}) {
  if (!state) return { state: createPressTurnState(), result: ACTION_RESULT.NORMAL };

  const isPlayer = state.currentTurn === 'player';
  const currentIcons = isPlayer ? state.playerIcons : state.enemyIcons;

  const result = determineActionResult(context);
  const { icons: newIcons, consumed, bonusGenerated } = applyActionResult(currentIcons, result);

  // Track consecutive weaknesses for combo bonuses
  const newConsecutive = (result === ACTION_RESULT.WEAKNESS || result === ACTION_RESULT.CRITICAL)
    ? state.consecutiveWeaknesses + 1
    : 0;

  const newState = {
    ...state,
    playerIcons: isPlayer ? newIcons : state.playerIcons,
    enemyIcons: !isPlayer ? newIcons : state.enemyIcons,
    actionsThisTurn: state.actionsThisTurn + 1,
    consecutiveWeaknesses: newConsecutive,
  };

  return {
    state: newState,
    result,
    consumed,
    bonusGenerated,
    turnEnded: !hasActionsRemaining(newIcons),
  };
}

/**
 * Get summary of current press turn state
 * @param {Object} state - Press turn state
 * @returns {Object} Summary info
 */
export function getPressTurnSummary(state) {
  if (!state) {
    return {
      currentTurn: 'player',
      playerActions: 0,
      enemyActions: 0,
      turnNumber: 0,
      actionsUsed: 0,
    };
  }

  return {
    currentTurn: state.currentTurn,
    playerActions: countAvailableActions(state.playerIcons),
    enemyActions: countAvailableActions(state.enemyIcons),
    turnNumber: state.turnNumber,
    actionsUsed: state.actionsThisTurn,
    consecutiveWeaknesses: state.consecutiveWeaknesses,
  };
}

/**
 * Get result message for display
 * @param {string} result - Action result type
 * @returns {string} Display message
 */
export function getResultMessage(result) {
  switch (result) {
    case ACTION_RESULT.WEAKNESS:
      return 'Weakness exploited! Bonus action!';
    case ACTION_RESULT.CRITICAL:
      return 'Critical strike! Bonus action!';
    case ACTION_RESULT.MISS:
      return 'Attack missed! Lost extra action.';
    case ACTION_RESULT.BLOCKED:
      return 'Attack nullified! Lost extra action.';
    case ACTION_RESULT.ABSORBED:
      return 'Element absorbed! Turn ended!';
    case ACTION_RESULT.PASS:
      return 'Passed turn efficiently.';
    case ACTION_RESULT.NORMAL:
    default:
      return '';
  }
}

/**
 * Check if result grants a bonus
 * @param {string} result - Action result
 * @returns {boolean} Whether result is beneficial
 */
export function isBonusResult(result) {
  return result === ACTION_RESULT.WEAKNESS || result === ACTION_RESULT.CRITICAL;
}

/**
 * Check if result is a penalty
 * @param {string} result - Action result
 * @returns {boolean} Whether result is detrimental
 */
export function isPenaltyResult(result) {
  return result === ACTION_RESULT.MISS ||
         result === ACTION_RESULT.BLOCKED ||
         result === ACTION_RESULT.ABSORBED;
}

/**
 * Calculate combo bonus for consecutive weakness hits
 * @param {number} consecutive - Number of consecutive weakness hits
 * @returns {number} Damage multiplier bonus (0-0.5)
 */
export function getComboBonus(consecutive) {
  if (typeof consecutive !== 'number' || consecutive < 2) return 0;
  // 5% bonus per hit after the first, capped at 50%
  return Math.min(0.5, (consecutive - 1) * 0.05);
}
