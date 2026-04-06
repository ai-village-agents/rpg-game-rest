import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalizeInventory, canonicalizeItemId } from '../src/item-id.js';
import { items } from '../src/data/items.js';
import { addItemToInventory, hasItem, removeItemFromInventory } from '../src/items.js';

test('canonicalizeItemId maps legacy ids', () => {
  assert.equal(canonicalizeItemId('hi-potion'), 'hiPotion');
});

test('canonicalizeInventory merges legacy aliases and filters counts', () => {
  const merged = canonicalizeInventory({ 'hi-potion': 1, hiPotion: 2, potion: 0, ether: Infinity, junk: 'not-a-number' });
  assert.deepEqual(merged, { hiPotion: 3 });
});

test('inventory helpers handle legacy aliases seamlessly', () => {
  let inventory = { 'hi-potion': 1 };
  inventory = addItemToInventory(inventory, 'hi-potion', 2);
  assert.deepEqual(inventory, { hiPotion: 3 });
  assert.ok(hasItem(inventory, 'hiPotion'));
  assert.ok(hasItem(inventory, 'hi-potion'));

  inventory = removeItemFromInventory(inventory, 'hi-potion', 1);
  assert.equal(inventory.hiPotion, 2);
  inventory = removeItemFromInventory(inventory, 'hiPotion', 2);
  assert.equal(inventory.hiPotion, undefined);
});

test('duplicate hi-potion definition removed', () => {
  assert.equal(items['hi-potion'], undefined);
  assert.ok(items.hiPotion);
});
