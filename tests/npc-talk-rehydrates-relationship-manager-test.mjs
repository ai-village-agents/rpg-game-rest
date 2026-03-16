import assert from 'node:assert/strict';
import { test } from 'node:test';

import { handleExplorationAction } from '../src/handlers/exploration-handler.js';
import { getNPCsInRoom } from '../src/npc-dialog.js';
import { createWorldState, getCurrentRoom } from '../src/map.js';

test('NPC_TALK rehydrates npcRelationshipManager from plain objects', () => {
  const world = createWorldState();
  const startingRoomId = getCurrentRoom(world)?.id;
  const npcs = getNPCsInRoom(startingRoomId);

  assert.ok(npcs.length > 0, 'expected at least one NPC in the starting room');

  const npc = npcs[0];
  const explorationState = {
    phase: 'exploration',
    world,
    log: [],
    npcRelationshipManager: { relationships: {} },
  };

  const result = handleExplorationAction(explorationState, {
    type: 'TALK_TO_NPC',
    npcId: npc.id,
  });

  assert.ok(result);
  assert.strictEqual(result.phase, 'dialog');
  assert.strictEqual(typeof result.npcRelationshipManager.modifyReputation, 'function');
  assert.ok(result.npcRelationshipManager.relationships instanceof Map);
});
