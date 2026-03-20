import { items } from './data/items.js';
import { canonicalizeInventory, canonicalizeItemId } from './item-id.js';

export function useItem(itemId, character, state) {
  const canonicalItemId = canonicalizeItemId(itemId);
  const inventory = canonicalizeInventory(character?.inventory || {});
  const item = items[canonicalItemId];
  if (!item) {
    return { success: false, message: `Item ${canonicalItemId} not found.` };
  }
  
  // Check if character has item
  const count = inventory[canonicalItemId] || 0;
  if (count <= 0) {
    return { success: false, message: `You don't have any ${item.name}.` };
  }
  
  // Apply item effects based on type
  const result = { success: true, message: '', effects: {} };
  
  switch (item.type) {
    case 'consumable': {
      const effect = item.effect || {};
      const messages = [];

      const healAmount = effect.heal ?? item.heal;
      if (healAmount !== undefined && healAmount !== null) {
        const newHp = Math.min(character.hp + healAmount, character.maxHp);
        result.effects.hp = newHp;
        result.effects.healed = newHp - character.hp;
        messages.push(`${item.name} restored ${result.effects.healed} HP.`);
      }

      const restoreAmount = effect.restoreMP ?? effect.mana ?? item.restoreMP ?? item.mana;
      if (restoreAmount !== undefined && restoreAmount !== null) {
        const currentMp = character.mp || 0;
        const newMp = Math.min(currentMp + restoreAmount, (character.maxMp || 0));
        result.effects.mp = newMp;
        result.effects.restoredMP = newMp - currentMp;
        messages.push(`${item.name} restored ${result.effects.restoredMP} MP.`);
      }

      const cleanseEffect = effect.cleanse ?? effect.cureStatus ?? item.cleanse ?? item.cureStatus;
      const cleanseList = Array.isArray(cleanseEffect)
        ? cleanseEffect
        : cleanseEffect
          ? [cleanseEffect]
          : [];
      if (cleanseList.length > 0) {
        result.effects.cureStatus = cleanseList;
        messages.push(`${item.name} cured ${cleanseList.join(', ')}.`);
      }

      result.message = messages.join(' ').trim();
      break;
    }
      
    default:
      return { success: false, message: `${item.name} cannot be used directly.` };
  }
  
  // Reduce item count
  result.effects.inventory = removeItemFromInventory(inventory, canonicalItemId, 1);
  
  return result;
}

export function addItemToInventory(inventory, itemId, quantity = 1) {
  const canonicalInventory = canonicalizeInventory(inventory || {});
  const canonicalItemId = canonicalizeItemId(itemId);
  const amount = Number(quantity);
  if (!Number.isFinite(amount) || amount <= 0 || !canonicalItemId) {
    return canonicalInventory;
  }
  const current = canonicalInventory[canonicalItemId] || 0;
  return {
    ...canonicalInventory,
    [canonicalItemId]: current + amount
  };
}

export function removeItemFromInventory(inventory, itemId, quantity = 1) {
  const canonicalInventory = canonicalizeInventory(inventory || {});
  const canonicalItemId = canonicalizeItemId(itemId);
  const amount = Number(quantity);
  if (!Number.isFinite(amount) || amount <= 0 || !canonicalItemId) {
    return canonicalInventory;
  }
  const current = canonicalInventory[canonicalItemId] || 0;
  if (current < amount) {
    return canonicalInventory; // Not enough items
  }
  const newCount = current - amount;
  const newInventory = { ...canonicalInventory };
  if (newCount === 0) {
    delete newInventory[canonicalItemId];
  } else {
    newInventory[canonicalItemId] = newCount;
  }
  return newInventory;
}

export function getItemCount(inventory, itemId) {
  const canonicalInventory = canonicalizeInventory(inventory || {});
  const canonicalItemId = canonicalizeItemId(itemId);
  if (!canonicalItemId) return 0;
  return canonicalInventory[canonicalItemId] || 0;
}

export function hasItem(inventory, itemId, quantity = 1) {
  const canonicalInventory = canonicalizeInventory(inventory || {});
  const canonicalItemId = canonicalizeItemId(itemId);
  const required = Number(quantity);
  if (!Number.isFinite(required) || required <= 0 || !canonicalItemId) {
    return false;
  }
  return (canonicalInventory[canonicalItemId] || 0) >= required;
}

// Backward compatibility: converts old inventory format to new
export function normalizeInventory(oldInventory) {
  if (!oldInventory || typeof oldInventory !== 'object' || Array.isArray(oldInventory)) {
    return {};
  }
  return canonicalizeInventory(oldInventory);
}

// Get display name for inventory item
export function getInventoryDisplay(inventory) {
  const display = [];
  Object.entries(inventory).forEach(([itemId, count]) => {
    const item = items[itemId];
    if (item) {
      display.push(`${item.name} ×${count}`);
    } else {
      display.push(`${itemId} ×${count}`);
    }
  });
  return display;
}

/**
 * Get a safe copy of an inventory object.
 * @param {object} inventory
 * @returns {object}
 */
export function getInventory(inventory) {
  if (!inventory) return {};
  if (typeof inventory === 'object' && !Array.isArray(inventory)) {
    return { ...inventory };
  }
  return normalizeInventory(inventory);
}

/**
 * Add an item to an inventory (convenience alias).
 * @param {object} inventory
 * @param {string} itemId
 * @param {number} quantity
 * @returns {object}
 */
export function addItem(inventory, itemId, quantity = 1) {
  return addItemToInventory(inventory, itemId, quantity);
}

/**
 * Remove an item from an inventory (convenience alias).
 * @param {object} inventory
 * @param {string} itemId
 * @param {number} quantity
 * @returns {object}
 */
export function removeItem(inventory, itemId, quantity = 1) {
  return removeItemFromInventory(inventory, itemId, quantity);
}
