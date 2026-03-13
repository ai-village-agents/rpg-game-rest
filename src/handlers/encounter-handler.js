/**
 * Random Encounter Handler
 * Handles actions related to the random encounter system
 */

import {
  checkForEncounter,
  resolveEncounter,
  addEncounterModifier,
  removeEncounterModifier,
  clearExpiredModifiers,
  getEncounterStats,
  LOCATION_TYPE,
} from '../random-encounter-system.js';

/**
 * Map world room IDs to encounter location types
 */
function mapRoomToLocationType(roomId) {
  const mappings = {
    'nw': LOCATION_TYPE.FOREST,
    'n': LOCATION_TYPE.MOUNTAIN,
    'ne': LOCATION_TYPE.RUINS,
    'w': LOCATION_TYPE.SWAMP,
    'center': LOCATION_TYPE.TOWN,
    'e': LOCATION_TYPE.ROAD,
    'sw': LOCATION_TYPE.CAVE,
    's': LOCATION_TYPE.FOREST,
    'se': LOCATION_TYPE.DUNGEON,
  };
  return mappings[roomId] || LOCATION_TYPE.ROAD;
}

/**
 * Handle encounter-related actions
 * @param {Object} state - Game state
 * @param {Object} action - Action to handle
 * @returns {Object|null} Updated state or null if action not handled
 */
export function handleEncounterAction(state, action) {
  const { type, payload } = action;

  switch (type) {
    case 'TRIGGER_RANDOM_ENCOUNTER': {
      const roomId = state.world?.currentRoom || 'center';
      const locationType = mapRoomToLocationType(roomId);
      const playerLevel = state.player?.level || 1;
      
      const result = checkForEncounter(
        state.encounterState,
        locationType,
        playerLevel
      );

      if (result.encounter) {
        return {
          ...state,
          encounterState: result.state,
          currentEncounter: result.encounter,
          phase: 'random-encounter',
          previousPhase: state.phase,
        };
      }

      return {
        ...state,
        encounterState: result.state,
      };
    }

    case 'OPEN_ENCOUNTER_STATS': {
      return {
        ...state,
        phase: 'encounter-stats',
        previousPhase: state.phase,
      };
    }

    case 'CLOSE_ENCOUNTER_STATS': {
      return {
        ...state,
        phase: state.previousPhase || 'exploration',
      };
    }

    case 'RESOLVE_ENCOUNTER': {
      const { outcome, details } = payload || {};
      const updatedState = resolveEncounter(
        state.encounterState,
        state.currentEncounter,
        outcome,
        details
      );

      return {
        ...state,
        encounterState: updatedState,
        currentEncounter: null,
        phase: state.previousPhase || 'exploration',
      };
    }

    case 'FLEE_ENCOUNTER': {
      const updatedState = resolveEncounter(
        state.encounterState,
        state.currentEncounter,
        'fled',
        {}
      );

      return {
        ...state,
        encounterState: updatedState,
        currentEncounter: null,
        phase: state.previousPhase || 'exploration',
      };
    }

    case 'ENGAGE_ENCOUNTER': {
      // Start combat with the encounter enemies
      if (state.currentEncounter?.enemies) {
        return {
          ...state,
          phase: 'player-turn',
          encounterCombatActive: true,
        };
      }
      return state;
    }

    case 'ADD_ENCOUNTER_MODIFIER': {
      const { modifier } = payload || {};
      if (!modifier) return state;

      const updatedState = addEncounterModifier(state.encounterState, modifier);
      return {
        ...state,
        encounterState: updatedState,
      };
    }

    case 'REMOVE_ENCOUNTER_MODIFIER': {
      const { modifierId } = payload || {};
      if (!modifierId) return state;

      const updatedState = removeEncounterModifier(state.encounterState, modifierId);
      return {
        ...state,
        encounterState: updatedState,
      };
    }

    case 'CLEAR_EXPIRED_MODIFIERS': {
      const updatedState = clearExpiredModifiers(state.encounterState);
      return {
        ...state,
        encounterState: updatedState,
      };
    }

    default:
      return null;
  }
}

/**
 * Check if random encounter should trigger during exploration
 * @param {Object} state - Game state
 * @returns {boolean} True if encounter should be checked
 */
export function shouldCheckForEncounter(state) {
  // Don't check in town or during combat
  if (state.phase !== 'exploration') return false;
  if (state.world?.currentRoom === 'center') return false; // Town is safe
  if (state.encounterState?.encounterCooldown > 0) return false;
  
  return true;
}

/**
 * Get encounter location type for current room
 * @param {Object} state - Game state
 * @returns {string} Location type
 */
export function getCurrentLocationType(state) {
  const roomId = state.world?.currentRoom || 'center';
  return mapRoomToLocationType(roomId);
}
