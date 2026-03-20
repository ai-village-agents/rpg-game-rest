/**
 * Game Engine Module - Core game state machine and coordination
 * Provides: game states, turn phases, event system, multi-slot saves
 * Owner: Opus 4.5 (Claude Code)
 */

// Game states for the overall game flow
export const GameState = Object.freeze({
  MENU: 'menu',
  EXPLORATION: 'exploration', 
  COMBAT: 'combat',
  DIALOG: 'dialog',
  INVENTORY: 'inventory',
  GAME_OVER: 'game_over'
});

// Turn phases for combat (complements combat.js)
export const TurnPhase = Object.freeze({
  PLAYER_SELECT: 'player_select',
  PLAYER_ACTION: 'player_action',
  ENEMY_TURN: 'enemy_turn',
  RESOLVE: 'resolve'
});

// Event system for module communication
const eventListeners = {};

export function on(eventName, callback) {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = [];
  }
  eventListeners[eventName].push(callback);
}

export function off(eventName, callback) {
  if (!eventListeners[eventName]) return;
  const idx = eventListeners[eventName].indexOf(callback);
  if (idx !== -1) {
    eventListeners[eventName].splice(idx, 1);
  }
}

export function emit(eventName, data) {
  if (!eventListeners[eventName]) return;
  for (const cb of eventListeners[eventName]) {
    try {
      cb(data);
    } catch (err) {
      console.error(`Event handler error for ${eventName}:`, err);
    }
  }
}

// Enhanced multi-slot save system
const SAVE_PREFIX = 'aiVillageRpg_slot_';
const MAX_SAVE_SLOTS = 5;

export function saveToSlot(state, slotIndex = 0) {
  if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) {
    console.error('Invalid save slot:', slotIndex);
    return false;
  }
  try {
    const saveData = {
      ...state,
      savedAt: new Date().toISOString(),
      version: state.version || 1
    };
    localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(saveData));
    emit('game:saved', { slotIndex, state: saveData });
    return true;
  } catch (err) {
    console.error('Save failed:', err);
    return false;
  }
}

export function loadFromSlot(slotIndex = 0, skipValidation = false) {
  if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) {
    console.error('Invalid save slot:', slotIndex);
    return null;
  }
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + slotIndex);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.player && !skipValidation) {
      if (parsed.player.maxHP === 0 || parsed.player.maxHP === undefined) {
        emit('game:loadFailed', { slotIndex, reason: 'corrupt save - player has no HP' });
        console.error('Load failed: corrupt save - player has no HP');
        return null;
      }
      if (parsed.player.atk === undefined) {
        emit('game:loadFailed', { slotIndex, reason: 'corrupt save - missing stats' });
        console.error('Load failed: corrupt save - missing stats');
        return null;
      }
      if (parsed.playerClass === undefined || parsed.playerClass === null || parsed.playerClass === '') {
        emit('game:loadFailed', { slotIndex, reason: 'corrupt save - no class selected' });
        console.error('Load failed: corrupt save - no class selected');
        return null;
      }
    }
    emit('game:loaded', { slotIndex, state: parsed });
    return parsed;
  } catch (err) {
    console.error('Load failed:', err);
    return null;
  }
}

export function getSaveSlots() {
  const slots = [];
  for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
    const raw = localStorage.getItem(SAVE_PREFIX + i);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        slots.push({
          index: i,
          exists: true,
          savedAt: data.savedAt || 'Unknown',
          playerName: data.player?.name || 'Unknown',
          turn: data.turn || 0
        });
      } catch {
        slots.push({ index: i, exists: false });
      }
    } else {
      slots.push({ index: i, exists: false });
    }
  }
  return slots;
}

export function deleteSaveSlot(slotIndex) {
  if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return false;
  localStorage.removeItem(SAVE_PREFIX + slotIndex);
  emit('game:saveDeleted', { slotIndex });
  return true;
}

// Game state transition helpers
let currentGameState = GameState.MENU;

export function getGameState() {
  return currentGameState;
}

export function setGameState(newState) {
  const oldState = currentGameState;
  currentGameState = newState;
  emit('game:stateChange', { oldState, newState });
  return newState;
}

// Initialize the engine
export function initEngine() {
  console.log('Game Engine initialized');
  currentGameState = GameState.MENU;
  emit('engine:initialized', { gameState: currentGameState });
  return true;
}

// Export all as a namespace for convenience
export default {
  GameState,
  TurnPhase,
  on,
  off,
  emit,
  saveToSlot,
  loadFromSlot,
  getSaveSlots,
  deleteSaveSlot,
  getGameState,
  setGameState,
  initEngine
};
