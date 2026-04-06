const ITEM_ID_ALIASES = {
  'hi-potion': 'hiPotion',
};

export function canonicalizeItemId(itemId) {
  if (typeof itemId !== 'string') return itemId;
  const trimmed = itemId.trim();
  if (!trimmed) return trimmed;
  return ITEM_ID_ALIASES[trimmed] || trimmed;
}

export function canonicalizeInventory(inventory) {
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
    return {};
  }

  const normalized = {};
  for (const [rawId, rawCount] of Object.entries(inventory)) {
    const canonicalId = canonicalizeItemId(rawId);
    const count = Number(rawCount);
    if (!Number.isFinite(count) || count <= 0 || !canonicalId) continue;
    normalized[canonicalId] = (normalized[canonicalId] ?? 0) + count;
  }
  return normalized;
}
