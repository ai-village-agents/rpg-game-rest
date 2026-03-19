// Enemy picture/emoji mapping for visual representation in combat
// Addresses Adam's feedback Item #5: "No enemy picture in combat"

export const ENEMY_PICTURES = {
  // Basic enemies
  'slime': '🟢',
  'goblin': '👹',
  'goblin_chief': '👑👹',
  'cave_bat': '🦇',
  'giant_spider': '🕷️',
  'giant-spider': '🕷️',
  'training_dummy': '🎯',
  'wolf': '🐺',
  'skeleton': '💀',
  'orc': '👹💪',
  'bandit': '🤠⚔️',
  'wraith': '👻',
  'dragon': '🐉',
  'abyss_overlord': '👿',
  
  // Elemental spirits
  'fire-spirit': '🔥',
  'ice-spirit': '❄️',
  'dark-cultist': '🧙⚫',
  
  // Monsters
  'stone-golem': '🗿',
  'thunder-hawk': '⚡🦅',
  'frost-revenant': '🧊👻',
  'blood-fiend': '🧛🩸',
  'shadow-weaver': '🕸️👤',
  'storm-elemental': '🌪️',
  'plague-bearer': '🦠💀',
  'infernal-knight': '🔥⚔️',
  'glacial-wyrm': '❄️🐉',
  'void-stalker': '🌌👣',
  
  // Advanced enemies
  'crystal-sentinel': '💎🛡️',
  'ember-drake': '🔥🐲',
  'phantom-assassin': '🗡️👤',
  'arcane-guardian': '🔮🛡️',
  'crimson-berserker': '🔴⚔️',
  'frost-archon': '👑❄️',
  'void-knight': '⚫⚔️',
  'thunder-titan': '⚡🗿',
  'infernal-sorcerer': '🔥🧙♂️',
  'abyssal-warden': '🌊👿',
  'celestial-wyrm': '⭐🐉',
  'chaos-spawn': '🌀👹',
  'eternal-guardian': '♾️🛡️',
  'primordial-phoenix': '🔥🦅',
  'oblivion-lord': '👑⚫',
  'lich-king': '👑💀',
};

/**
 * Get picture/emoji for an enemy by ID
 * @param {string} enemyId 
 * @returns {string} Emoji representation
 */
export function getEnemyPicture(enemyId) {
  return ENEMY_PICTURES[enemyId] || '👤';
}

/**
 * Get enemy picture with fallback to first part of ID
 * @param {string} enemyId
 * @returns {string}
 */
export function getEnemyPictureWithFallback(enemyId) {
  const picture = getEnemyPicture(enemyId);
  if (picture !== '👤') return picture;
  
  // Try to infer from ID parts
  if (enemyId.includes('fire') || enemyId.includes('flame')) return '🔥';
  if (enemyId.includes('ice') || enemyId.includes('frost')) return '❄️';
  if (enemyId.includes('water') || enemyId.includes('sea')) return '💧';
  if (enemyId.includes('earth') || enemyId.includes('rock')) return '🪨';
  if (enemyId.includes('wind') || enemyId.includes('air')) return '💨';
  if (enemyId.includes('lightning') || enemyId.includes('thunder')) return '⚡';
  if (enemyId.includes('dark') || enemyId.includes('shadow')) return '🌑';
  if (enemyId.includes('light') || enemyId.includes('holy')) return '✨';
  if (enemyId.includes('dragon') || enemyId.includes('drake') || enemyId.includes('wyrm')) return '🐉';
  if (enemyId.includes('spider')) return '🕷️';
  if (enemyId.includes('bat')) return '🦇';
  if (enemyId.includes('wolf')) return '🐺';
  if (enemyId.includes('skeleton')) return '💀';
  if (enemyId.includes('goblin')) return '👹';
  if (enemyId.includes('orc')) return '👹💪';
  if (enemyId.includes('bandit')) return '🤠⚔️';
  if (enemyId.includes('ghost') || enemyId.includes('wraith') || enemyId.includes('spirit')) return '👻';
  if (enemyId.includes('knight')) return '⚔️';
  if (enemyId.includes('mage') || enemyId.includes('sorcerer') || enemyId.includes('wizard')) return '🧙';
  if (enemyId.includes('archer')) return '🏹';
  
  return '👤';
}
