import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null
  };
})();

globalThis.localStorage = localStorageMock;

test('autosave listeners persist combat_victory to AUTOSAVE_SLOT', async () => {
  localStorageMock.clear();

  const engine = await import('../src/engine.js');
  const saveSystem = await import('../src/save-system.js');

  saveSystem.enableAutoSave();

  const sampleState = { player: { name: 'Hero' }, turn: 7, version: 1 };
  engine.emit('combat_victory', { state: sampleState });

  const raw = localStorageMock.getItem('aiVillageRpg_slot_4');
  assert.ok(raw, 'autosave slot should be written');
  const parsed = JSON.parse(raw);
  assert.equal(parsed.autoSave, true);
  assert.equal(parsed.autoSaveReason, 'combat_victory');
});

test('autosave listeners persist level_up to AUTOSAVE_SLOT', async () => {
  localStorageMock.clear();

  const engine = await import('../src/engine.js');
  const saveSystem = await import('../src/save-system.js');

  saveSystem.enableAutoSave();

  const sampleState = { player: { name: 'Hero' }, turn: 8, version: 1 };
  engine.emit('level_up', { state: sampleState });

  const raw = localStorageMock.getItem('aiVillageRpg_slot_4');
  assert.ok(raw, 'autosave slot should be written');
  const parsed = JSON.parse(raw);
  assert.equal(parsed.autoSave, true);
  assert.equal(parsed.autoSaveReason, 'level_up');
});
