import { test, assert } from './utils.js';
import { handleSystemAction } from '../src/handlers/system-handler.js';

test('class selection moves to background selection phase', () => {
  const start = { phase: 'class-select', log: [] };
  const afterClass = handleSystemAction(start, { type: 'SELECT_CLASS', classId: 'warrior', name: 'TestHero' });

  assert(afterClass.phase === 'background-select', 'should enter background-select phase after choosing class');
  assert(afterClass.player.classId === 'warrior', 'player keeps selected classId');
});

test('background selection applies bonuses and moves to avatar-select phase', () => {
  const afterClass = handleSystemAction({ phase: 'class-select', log: [] }, { type: 'SELECT_CLASS', classId: 'warrior', name: 'TestHero' });
  const baseAtk = afterClass.player.atk;
  const basePotions = afterClass.player.inventory?.potion || 0;

  const afterBackground = handleSystemAction(afterClass, { type: 'SELECT_BACKGROUND', backgroundId: 'soldier' });

  assert(afterBackground.phase === 'avatar-select', 'should enter avatar-select after selecting background');
  assert(afterBackground.player.backgroundId === 'soldier', 'player stores chosen backgroundId');
  assert(afterBackground.player.atk === baseAtk + 2, 'soldier background adds to attack');
  assert(afterBackground.player.inventory.potion === basePotions + 1, 'soldier background adds potion to inventory');
});

test('avatar selection enters exploration phase', () => {
  const afterClass = handleSystemAction({ phase: 'class-select', log: [] }, { type: 'SELECT_CLASS', classId: 'warrior', name: 'TestHero' });
  const afterBackground = handleSystemAction(afterClass, { type: 'SELECT_BACKGROUND', backgroundId: 'soldier' });

  const afterAvatar = handleSystemAction(afterBackground, { type: 'SELECT_AVATAR', avatar: '🧝' });

  assert(afterAvatar.phase === 'exploration', 'should enter exploration after selecting avatar');
  assert(afterAvatar.player.avatar === '🧝', 'player stores chosen avatar');
  assert(afterAvatar.visitedRooms !== undefined, 'visitedRooms initialized after avatar select');
  assert(afterAvatar.gameStats !== undefined, 'gameStats initialized after avatar select');
});

test('background bonuses adjust gold values', () => {
  const afterClass = handleSystemAction({ phase: 'class-select', log: [] }, { type: 'SELECT_CLASS', classId: 'rogue', name: 'TestRogue' });
  const afterBackground = handleSystemAction(afterClass, { type: 'SELECT_BACKGROUND', backgroundId: 'wanderer' });
  const afterAvatar = handleSystemAction(afterBackground, { type: 'SELECT_AVATAR', avatar: '🧙' });

  assert(afterAvatar.player.gold === 15, 'wanderer background grants starting gold');
});
