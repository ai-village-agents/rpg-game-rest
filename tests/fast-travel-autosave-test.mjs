import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

globalThis.localStorage = localStorageMock;

// Import modules under test
import { emit, on } from '../src/engine.js';
import { AUTOSAVE_SLOT } from '../src/save-system.js';
import { handleFastTravelAction } from '../src/handlers/exploration-handler.js';

describe('Fast Travel triggers autosave via room_change', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('emits room_change which writes to AUTOSAVE_SLOT', () => {
    // Arrange: minimal exploration state with two visited rooms so FT is allowed
    const baseWorld = { roomRow: 1, roomCol: 1, x: 8, y: 6 };
    const state = {
      phase: 'exploration',
      world: baseWorld,
      visitedRooms: ['center', 'e'],
      log: [],
    };

    // Sanity: autosave slot should be empty
    assert.equal(localStorage.getItem('aiVillageRpg_slot_' + AUTOSAVE_SLOT), null);

    // Act: perform fast travel to 'e'
    const next = handleFastTravelAction(state, { type: 'FAST_TRAVEL', destination: 'e' });

    // Assert: handler returned state and room_change should have been emitted
    assert.ok(next && next.world && next.world.roomCol === 2);

    const saved = localStorage.getItem('aiVillageRpg_slot_' + AUTOSAVE_SLOT);
    assert.ok(saved, 'Auto-save slot should be populated after fast travel');
    const parsed = JSON.parse(saved);
    assert.equal(parsed.autoSave, true);
    assert.equal(parsed.autoSaveReason, 'room_change');
    // Saved location should reflect destination
    assert.equal(parsed.world.roomCol, 2);
  });
});
