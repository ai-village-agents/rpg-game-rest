import assert from 'node:assert/strict';
import test from 'node:test';

const { initialState, initialStateWithClass } = await import('../src/state.js');

function assertDungeonStateShape(ds) {
  assert.ok(ds && typeof ds === 'object', 'dungeonState should be an object');
  assert.equal(typeof ds.currentFloor, 'number');
  assert.equal(typeof ds.deepestFloor, 'number');
  assert.ok(Array.isArray(ds.floorsCleared), 'floorsCleared should be an array');
  assert.equal(typeof ds.inDungeon, 'boolean');
  assert.equal(typeof ds.stairsFound, 'boolean');
}

test('initialState() initializes dungeonState', () => {
  const s = initialState();
  assertDungeonStateShape(s.dungeonState);
  assert.equal(s.dungeonState.currentFloor, 0);
  assert.equal(s.dungeonState.deepestFloor, 0);
  assert.deepEqual(s.dungeonState.floorsCleared, []);
  assert.equal(s.dungeonState.inDungeon, false);
  assert.equal(s.dungeonState.stairsFound, false);
});

test('initialStateWithClass() initializes dungeonState', () => {
  const s = initialStateWithClass('rogue', 'Test Rogue');
  assertDungeonStateShape(s.dungeonState);
  assert.equal(s.dungeonState.currentFloor, 0);
  assert.equal(s.dungeonState.deepestFloor, 0);
  assert.deepEqual(s.dungeonState.floorsCleared, []);
  assert.equal(s.dungeonState.inDungeon, false);
  assert.equal(s.dungeonState.stairsFound, false);
});
