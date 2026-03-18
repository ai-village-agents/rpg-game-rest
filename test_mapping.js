// Test the mapping logic
const ITEMID_TO_INVENTORY_KEY = {
  hiPotion: 'potion',
  herbBundle: 'herb',
  etherShard: 'ether',
  spellScroll: 'scroll',
  superPotion: 'superPotion',
};

function _getItemCountFromInventory(inventory, itemId) {
  const inventoryKey = ITEMID_TO_INVENTORY_KEY[itemId] || itemId;
  console.log(`Looking up itemId: ${itemId}, mapped to key: ${inventoryKey}`);
  if (!inventory) return 0;
  if (typeof inventory === 'object' && !Array.isArray(inventory)) {
    // Object format: { itemId: quantity }
    if (typeof inventory[inventoryKey] === 'number') return inventory[inventoryKey];
    // Could be nested: { items: { itemId: qty } }
    if (inventory.items && typeof inventory.items[inventoryKey] === 'number') {
      return inventory.items[inventoryKey];
    }
  }
  return 0;
}

// Test with expected inventory
const testInventory = { potion: 2, ether: 0, herb: 1, scroll: 0 };
console.log('Test inventory:', testInventory);
console.log('hiPotion count:', _getItemCountFromInventory(testInventory, 'hiPotion'));
console.log('herbBundle count:', _getItemCountFromInventory(testInventory, 'herbBundle'));
