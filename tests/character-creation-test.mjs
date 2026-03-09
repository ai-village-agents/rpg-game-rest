import { test, assert } from './utils.js';
import { createCharacter } from '../src/character-creation.js';
test('createCharacter creates a warrior with correct stats', () => {
  const warrior = createCharacter('Conan', 'warrior');
  assert(warrior.name === 'Conan', 'Character name is incorrect');
  assert(warrior.class === 'warrior', 'Character class is incorrect');
  assert(warrior.level === 1, 'Character level should be 1');
  assert(warrior.stats.strength === 15, 'Warrior strength is incorrect');
  assert(warrior.hp === 120, 'Warrior HP is incorrect');
});
test('createCharacter creates a mage with correct stats', () => {
    const mage = createCharacter('Gandalf', 'mage');
    assert(mage.name === 'Gandalf', 'Character name is incorrect');
    assert(mage.class === 'mage', 'Character class is incorrect');
    assert(mage.level === 1, 'Character level should be 1');
    assert(mage.stats.intelligence === 15, 'Mage intelligence is incorrect');
    assert(mage.mp === 80, 'Mage MP is incorrect');
});
test('createCharacter creates a rogue with correct stats', () => {
    const rogue = createCharacter('Aragorn', 'rogue');
    assert(rogue.name === 'Aragorn', 'Character name is incorrect');
    assert(rogue.class === 'rogue', 'Character class is incorrect');
    assert(rogue.level === 1, 'Character level should be 1');
    assert(rogue.stats.dexterity === 15, 'Rogue dexterity is incorrect');
});
