// NPC emoji mapping for visual representation in NPC buttons
// Addresses Issue #63 request: "I wish the game had different emoji for different NPC types."

export const NPC_EMOJIS = {
  // Elder / Leader types
  'village_elder': '👴',
  
  // Innkeeper / Hospitality
  'inn_keeper': '🍺',
  
  // Military / Guard types
  'scout_patrol': '🛡️',
  
  // Sage / Wise types
  'hermit_sage': '🧙',
  
  // Farmer / Worker types
  'farmer_gale': '🌾',
  
  // Merchant / Trader types
  'merchant_bram': '💰',
  
  // Knight / Warrior types
  'wandering_knight': '⚔️',
  
  // Nature / Spirit types
  'forest_spirit': '🌿',
  
  // Witch / Magic types
  'swamp_witch': '🔮',
  
  // Fisherman / Outdoors types
  'old_fisherman': '🎣',
};

/**
 * Get emoji for an NPC by ID
 * @param {string} npcId 
 * @returns {string} Emoji representation
 */
export function getNpcEmoji(npcId) {
  return NPC_EMOJIS[npcId] || '👤';
}

/**
 * Get NPC emoji with fallback based on ID patterns
 * @param {string} npcId
 * @returns {string}
 */
export function getNpcEmojiWithFallback(npcId) {
  const emoji = getNpcEmoji(npcId);
  if (emoji !== '👤') return emoji;
  
  // Fallback mapping based on ID patterns
  if (npcId.includes('elder') || npcId.includes('elderly')) return '👴';
  if (npcId.includes('inn') || npcId.includes('keeper')) return '🍺';
  if (npcId.includes('guard') || npcId.includes('scout') || npcId.includes('patrol')) return '🛡️';
  if (npcId.includes('sage') || npcId.includes('wise') || npcId.includes('hermit')) return '🧙';
  if (npcId.includes('farmer') || npcId.includes('worker')) return '🌾';
  if (npcId.includes('merchant') || npcId.includes('trader')) return '💰';
  if (npcId.includes('knight') || npcId.includes('warrior') || npcId.includes('soldier')) return '⚔️';
  if (npcId.includes('spirit') || npcId.includes('nature') || npcId.includes('forest')) return '🌿';
  if (npcId.includes('witch') || npcId.includes('mage') || npcId.includes('wizard')) return '🔮';
  if (npcId.includes('fisher') || npcId.includes('angler')) return '🎣';
  if (npcId.includes('blacksmith') || npcId.includes('smith')) return '⚒️';
  if (npcId.includes('healer') || npcId.includes('doctor')) return '⚕️';
  if (npcId.includes('child') || npcId.includes('kid')) return '🧒';
  if (npcId.includes('captain') || npcId.includes('commander')) return '🎖️';
  if (npcId.includes('alchemist')) return '🧪';
  if (npcId.includes('trainer')) return '🎓';
  if (npcId.includes('companion')) return '👥';
  if (npcId.includes('boss') || npcId.includes('chief')) return '👑';
  
  return '👤';
}
