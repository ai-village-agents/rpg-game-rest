import { loadKeybindings, getActionForKey } from './keybindings.js';

/**
 * Input helpers.
 *
 * Keep these pure (no DOM access) so they’re easy to test and safe to reuse
 * across UI/front-end entrypoints.
 */

/**
 * Convert a keyboard `event.key` value into a cardinal direction using current keybindings.
 *
 * @param {unknown} key
 * @returns {'north'|'south'|'west'|'east'|null}
 */
export function keyToCardinalDirection(key) {
  if (typeof key !== 'string') return null;

  const action = getActionForKey(key, loadKeybindings());

  switch (action) {
    case 'moveNorth':
      return 'north';
    case 'moveSouth':
      return 'south';
    case 'moveWest':
      return 'west';
    case 'moveEast':
      return 'east';
    default:
      return null;
  }
}
