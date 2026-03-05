/**
 * Input helpers.
 *
 * Keep these pure (no DOM access) so they’re easy to test and safe to reuse
 * across UI/front-end entrypoints.
 */

const KEY_TO_CARDINAL = {
  w: 'north',
  W: 'north',
  ArrowUp: 'north',

  s: 'south',
  S: 'south',
  ArrowDown: 'south',

  a: 'west',
  A: 'west',
  ArrowLeft: 'west',

  d: 'east',
  D: 'east',
  ArrowRight: 'east',
};

/**
 * Convert a keyboard `event.key` value into a cardinal direction.
 *
 * @param {unknown} key
 * @returns {'north'|'south'|'west'|'east'|null}
 */
export function keyToCardinalDirection(key) {
  if (typeof key !== 'string') return null;
  return KEY_TO_CARDINAL[key] ?? null;
}
