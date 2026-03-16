import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  ensureNPCRelationshipManager,
  NPCRelationshipManager,
  RelationshipLevel,
} from '../src/npc-relationships.js';

describe('ensureNPCRelationshipManager', () => {
  test('returns a new manager instance when candidate is null', () => {
    const manager = ensureNPCRelationshipManager(null);

    assert.ok(manager instanceof NPCRelationshipManager);
    assert.strictEqual(typeof manager.modifyReputation, 'function');
    assert.strictEqual(typeof manager.getRelationshipLevel, 'function');
    assert.ok(manager.relationships instanceof Map);
  });

  test('restores from snapshot objects with relationship entries array', () => {
    const source = new NPCRelationshipManager();
    source.modifyReputation('npc-1', 10, 'quest');

    const manager = ensureNPCRelationshipManager(source.getState());
    const relationship = manager.getRelationship('npc-1');

    assert.strictEqual(relationship.reputation, 10);
    assert.strictEqual(manager.getRelationshipLevel('npc-1'), RelationshipLevel.FRIENDLY);
    assert.strictEqual(relationship.history.length, 1);
  });

  test('restores from plain object relationship map', () => {
    const manager = ensureNPCRelationshipManager({
      relationships: {
        'npc-2': { reputation: -60 },
      },
    });

    assert.strictEqual(manager.getRelationshipLevel('npc-2'), RelationshipLevel.HOSTILE);
    const relationship = manager.getRelationship('npc-2');
    assert.strictEqual(relationship.reputation, -60);
  });
});
