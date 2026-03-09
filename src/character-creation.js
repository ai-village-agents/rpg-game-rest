// This file will contain the character creation logic.
/**
 * Creates a new character object.
 * @param {string} name - The character's name.
 * @param {string} characterClass - The character's class (e.g., 'warrior', 'mage').
 * @returns {object} The new character object.
 */
export function createCharacter(name, characterClass) {
  const character = {
    name: name,
    class: characterClass,
    level: 1,
    xp: 0,
    hp: 100,
    mp: 50,
    stats: {
      strength: 10,
      intelligence: 10,
      dexterity: 10,
    },
    inventory: [],
    equipment: {},
  };
  // Class-specific stat adjustments
  switch (characterClass) {
    case 'warrior':
      character.stats.strength += 5;
      character.hp += 20;
      break;
    case 'mage':
      character.stats.intelligence += 5;
      character.mp += 30;
      break;
    case 'rogue':
        character.stats.dexterity += 5;
        break;
  }
  return character;
}
