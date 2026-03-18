import assert from 'node:assert/strict';
import test from 'node:test';

// Import the function we want to test
const { validateSaveData } = await import('../src/save-system.js');

test('validateSaveData handles null input', () => {
  const result = validateSaveData(null);
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing.sort(), ['player', 'turn', 'version'].sort());
});

test('validateSaveData handles empty object', () => {
  const result = validateSaveData({});
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing.sort(), ['player', 'turn', 'version'].sort());
});

test('validateSaveData handles missing player only', () => {
  const result = validateSaveData({ turn: 5, version: 1 });
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ['player']);
});

test('validateSaveData handles missing turn only', () => {
  const result = validateSaveData({ player: { name: 'Test' }, version: 1 });
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ['turn']);
});

test('validateSaveData handles missing version only', () => {
  const result = validateSaveData({ player: { name: 'Test' }, turn: 5 });
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ['version']);
});

test('validateSaveData accepts valid save data', () => {
  const validData = {
    player: { name: 'Hero', level: 1 },
    turn: 10,
    version: 1,
    extra: 'field'
  };
  const result = validateSaveData(validData);
  assert.equal(result.valid, true);
  assert.deepEqual(result.missing, []);
});

test('validateSaveData accepts minimal valid data', () => {
  const minimalData = {
    player: {},
    turn: 0,
    version: 1
  };
  const result = validateSaveData(minimalData);
  assert.equal(result.valid, true);
  assert.deepEqual(result.missing, []);
});

console.log('All save validation tests passed');
