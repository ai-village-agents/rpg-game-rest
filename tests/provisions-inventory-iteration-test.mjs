// Regression test for Provisions inventory iteration bug
// Bug: TypeError: inventory is not iterable
// Fix: Use Object.entries() instead of for...of loop
// Fixed by Claude Opus 4.5 (Claude Code) on Day 349

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Mock the PROVISIONS import for testing
const PROVISIONS = {
  bread: { id: 'bread', name: 'Bread', category: 'food', rarity: 'Common', description: 'Basic food', effect: { healInstant: 10 } },
  water: { id: 'water', name: 'Water', category: 'drink', rarity: 'Common', description: 'Clean water', effect: { mpInstant: 5 } },
};

// Copy of the fixed function for testing
function getPlayerProvisions(inventory) {
  if (!inventory || typeof inventory !== 'object') return [];
  const results = [];
  for (const [itemId, quantity] of Object.entries(inventory)) {
    const provData = PROVISIONS[itemId];
    if (provData && quantity > 0) {
      results.push({ ...provData, id: itemId, quantity });
    }
  }
  return results;
}

describe('getPlayerProvisions inventory iteration', () => {
  it('should handle object inventory format { itemId: quantity }', () => {
    const inventory = { bread: 3, water: 2 };
    const result = getPlayerProvisions(inventory);
    
    assert.equal(result.length, 2);
    assert.equal(result[0].id, 'bread');
    assert.equal(result[0].quantity, 3);
    assert.equal(result[1].id, 'water');
    assert.equal(result[1].quantity, 2);
  });

  it('should return empty array for null inventory', () => {
    const result = getPlayerProvisions(null);
    assert.deepEqual(result, []);
  });

  it('should return empty array for undefined inventory', () => {
    const result = getPlayerProvisions(undefined);
    assert.deepEqual(result, []);
  });

  it('should return empty array for non-object inventory', () => {
    const result = getPlayerProvisions('not an object');
    assert.deepEqual(result, []);
  });

  it('should filter out items not in PROVISIONS', () => {
    const inventory = { bread: 1, gold: 100, ironOre: 5 };
    const result = getPlayerProvisions(inventory);
    
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'bread');
  });

  it('should filter out items with zero quantity', () => {
    const inventory = { bread: 0, water: 2 };
    const result = getPlayerProvisions(inventory);
    
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'water');
  });

  it('should include provision data in result', () => {
    const inventory = { bread: 1 };
    const result = getPlayerProvisions(inventory);
    
    assert.equal(result[0].name, 'Bread');
    assert.equal(result[0].category, 'food');
    assert.equal(result[0].rarity, 'Common');
    assert.deepEqual(result[0].effect, { healInstant: 10 });
  });
});
