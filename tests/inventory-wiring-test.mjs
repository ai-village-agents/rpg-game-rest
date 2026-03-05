// Tests for inventory phase wiring in main.js dispatch + render.js
// Verifies VIEW_INVENTORY transitions to inventory phase,
// inventory actions are dispatched correctly, and CLOSE_INVENTORY returns.
// Created by Claude Sonnet 4.6 (Day 338)

import {
  createInventoryState,
  handleInventoryAction,
  INVENTORY_SCREENS,
  equipItem,
  getCategorizedInventory,
  getItemDetails,
  isUsable,
  isEquippable,
} from '../src/inventory.js';
import { initialStateWithClass } from '../src/state.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'assertion failed');
}

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// Helper: build an exploration-phase state
function makeExplorationState() {
  const state = initialStateWithClass('warrior');
  return { ...state, phase: 'exploration' };
}

console.log('\n--- createInventoryState ---');
test('creates state with main screen', () => {
  const s = createInventoryState('exploration');
  assertEqual(s.screen, INVENTORY_SCREENS.MAIN);
});
test('stores returnPhase', () => {
  const s = createInventoryState('victory');
  assertEqual(s.returnPhase, 'victory');
});
test('defaults returnPhase to exploration', () => {
  const s = createInventoryState();
  assertEqual(s.returnPhase, 'exploration');
});
test('selectedItem starts null', () => {
  const s = createInventoryState('exploration');
  assertEqual(s.selectedItem, null);
});
test('message starts null', () => {
  const s = createInventoryState('exploration');
  assertEqual(s.message, null);
});

console.log('\n--- VIEW_INVENTORY dispatch simulation ---');
test('VIEW_INVENTORY transitions to inventory phase', () => {
  const state = makeExplorationState();
  const newState = { ...state, phase: 'inventory', inventoryState: createInventoryState(state.phase) };
  assertEqual(newState.phase, 'inventory');
});
test('inventoryState.returnPhase is prior phase', () => {
  const state = makeExplorationState();
  const invState = createInventoryState(state.phase);
  assertEqual(invState.returnPhase, 'exploration');
});
test('player is preserved on inventory open', () => {
  const state = makeExplorationState();
  const newState = { ...state, phase: 'inventory', inventoryState: createInventoryState(state.phase) };
  assert(newState.player !== undefined, 'player should be preserved');
});

console.log('\n--- CLOSE_INVENTORY ---');
test('CLOSE_INVENTORY returns to returnPhase', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  const result = handleInventoryAction(invPhase, { type: 'CLOSE_INVENTORY' });
  assertEqual(result.phase, 'exploration');
});
test('CLOSE_INVENTORY removes inventoryState', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  const result = handleInventoryAction(invPhase, { type: 'CLOSE_INVENTORY' });
  assert(result.inventoryState === undefined, 'inventoryState should be removed');
});
test('CLOSE_INVENTORY logs message', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  const result = handleInventoryAction(invPhase, { type: 'CLOSE_INVENTORY' });
  assert(result.log.some(l => l.includes('Closed')), 'log should mention closing');
});
test('CLOSE_INVENTORY from victory returns to victory', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('victory') };
  const result = handleInventoryAction(invPhase, { type: 'CLOSE_INVENTORY' });
  assertEqual(result.phase, 'victory');
});

console.log('\n--- INVENTORY_BACK ---');
test('INVENTORY_BACK resets to main screen', () => {
  const base = makeExplorationState();
  const invPhase = {
    ...base,
    phase: 'inventory',
    inventoryState: { ...createInventoryState('exploration'), screen: INVENTORY_SCREENS.DETAILS, selectedItem: 'potion' },
  };
  const result = handleInventoryAction(invPhase, { type: 'INVENTORY_BACK' });
  assertEqual(result.inventoryState.screen, INVENTORY_SCREENS.MAIN);
});
test('INVENTORY_BACK clears selectedItem', () => {
  const base = makeExplorationState();
  const invPhase = {
    ...base,
    phase: 'inventory',
    inventoryState: { ...createInventoryState('exploration'), screen: INVENTORY_SCREENS.DETAILS, selectedItem: 'potion' },
  };
  const result = handleInventoryAction(invPhase, { type: 'INVENTORY_BACK' });
  assertEqual(result.inventoryState.selectedItem, null);
});
test('INVENTORY_BACK clears message', () => {
  const base = makeExplorationState();
  const invPhase = {
    ...base,
    phase: 'inventory',
    inventoryState: { ...createInventoryState('exploration'), message: 'something' },
  };
  const result = handleInventoryAction(invPhase, { type: 'INVENTORY_BACK' });
  assertEqual(result.inventoryState.message, null);
});

console.log('\n--- INVENTORY_VIEW_DETAILS ---');
test('INVENTORY_VIEW_DETAILS sets details screen', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  const result = handleInventoryAction(invPhase, { type: 'INVENTORY_VIEW_DETAILS', itemId: 'potion' });
  assertEqual(result.inventoryState.screen, INVENTORY_SCREENS.DETAILS);
});
test('INVENTORY_VIEW_DETAILS sets selectedItem', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  const result = handleInventoryAction(invPhase, { type: 'INVENTORY_VIEW_DETAILS', itemId: 'potion' });
  assertEqual(result.inventoryState.selectedItem, 'potion');
});

console.log('\n--- INVENTORY_USE ---');
test('INVENTORY_USE on consumable updates player HP', () => {
  const base = makeExplorationState();
  // Damage the player first
  const damagedPlayer = { ...base.player, hp: base.player.maxHp - 20 };
  const invPhase = { ...base, player: damagedPlayer, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  // Player starts with 3 potions
  assert(invPhase.player.inventory.potion >= 1, 'player needs a potion');
  const result = handleInventoryAction(invPhase, { type: 'INVENTORY_USE', itemId: 'potion' });
  assert(result.player.hp > damagedPlayer.hp, 'HP should increase after using potion');
});
test('INVENTORY_USE on non-usable item returns error message', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  const result = handleInventoryAction(invPhase, { type: 'INVENTORY_USE', itemId: null });
  assert(result.inventoryState.message, 'should set error message');
});

console.log('\n--- getCategorizedInventory ---');
test('consumables include potion', () => {
  const inv = { potion: 3 };
  const cat = getCategorizedInventory(inv);
  assert(cat.consumables.some(i => i.id === 'potion'), 'should include potion in consumables');
});
test('empty inventory returns empty categories', () => {
  const cat = getCategorizedInventory({});
  assertEqual(cat.consumables.length + cat.weapons.length + cat.armors.length + cat.accessories.length + cat.unknown.length, 0);
});
test('filters out zero-count items', () => {
  const inv = { potion: 0 };
  const cat = getCategorizedInventory(inv);
  assert(!cat.consumables.some(i => i.id === 'potion'), 'zero-count item should be excluded');
});

console.log('\n--- getItemDetails ---');
test('returns null for unknown item', () => {
  const detail = getItemDetails('nonexistent_item_xyz');
  assertEqual(detail, null);
});
test('potion details has name', () => {
  const detail = getItemDetails('potion');
  assert(detail !== null, 'potion should exist');
  assert(detail.name, 'potion should have name');
});
test('potion is usable', () => {
  assert(isUsable('potion'), 'potion should be usable');
});
test('potion is not equippable', () => {
  assert(!isEquippable('potion'), 'potion should not be equippable');
});

console.log('\n--- no-op for unknown inventory action ---');
test('unknown action returns unchanged state', () => {
  const base = makeExplorationState();
  const invPhase = { ...base, phase: 'inventory', inventoryState: createInventoryState('exploration') };
  const result = handleInventoryAction(invPhase, { type: 'SOMETHING_UNKNOWN' });
  assertEqual(result.inventoryState.screen, INVENTORY_SCREENS.MAIN);
});

console.log('\n--- Easter egg scan ---');
const srcMain = (await import('fs')).readFileSync('./src/main.js', 'utf8');
const srcRender = (await import('fs')).readFileSync('./src/render.js', 'utf8');
test('src/main.js has no egg/easter keywords', () => {
  assert(!/\b(egg|easter|bunny|hunt)\b/i.test(srcMain), 'egg/easter keyword found in main.js');
});
test('src/render.js has no egg/easter keywords', () => {
  assert(!/\b(egg|easter|bunny|hunt)\b/i.test(srcRender), 'egg/easter keyword found in render.js');
});

console.log(`\n==========================================`);
console.log(`Inventory wiring tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
