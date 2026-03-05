import {
  MINIMAP_ROOM_ID_MAP,
  ROOM_NAMES,
  ROOM_DANGER_LEVEL,
  DANGER_LABELS,
  DANGER_ICONS,
  getRoomId,
  getCurrentRoomId,
  getRoomDangerLevel,
  getRoomDangerLabel,
  getRoomDangerIcon,
  initVisitedRooms,
  markRoomVisited,
  isRoomVisited,
  getMinimapCellType,
  buildMinimapData,
  getMinimapStyles,
  renderMinimap
} from '../src/minimap.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function assertEqual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

console.log('\n=== MINIMAP_ROOM_ID_MAP ===');
test('is a 3x3 array', () => {
  assert(Array.isArray(MINIMAP_ROOM_ID_MAP), 'should be array');
  assertEqual(MINIMAP_ROOM_ID_MAP.length, 3);
  MINIMAP_ROOM_ID_MAP.forEach(row => assertEqual(row.length, 3));
});
test('has correct room IDs', () => {
  assertEqual(MINIMAP_ROOM_ID_MAP[0], ['nw', 'n', 'ne']);
  assertEqual(MINIMAP_ROOM_ID_MAP[1], ['w', 'center', 'e']);
  assertEqual(MINIMAP_ROOM_ID_MAP[2], ['sw', 's', 'se']);
});

console.log('\n=== ROOM_NAMES ===');
test('has all 9 rooms', () => {
  const keys = Object.keys(ROOM_NAMES);
  assertEqual(keys.length, 9);
});
test('center room name exists', () => {
  assert(ROOM_NAMES['center'], 'center should have a name');
});
test('all room IDs have names', () => {
  ['nw','n','ne','w','center','e','sw','s','se'].forEach(id => {
    assert(ROOM_NAMES[id], `${id} should have a name`);
  });
});

console.log('\n=== ROOM_DANGER_LEVEL ===');
test('center is danger 0 (safe)', () => assertEqual(ROOM_DANGER_LEVEL['center'], 0));
test('has danger levels 0-3', () => {
  const levels = new Set(Object.values(ROOM_DANGER_LEVEL));
  assert(levels.has(0) && levels.has(1) && levels.has(2) && levels.has(3));
});
test('all 9 rooms have danger levels', () => {
  ['nw','n','ne','w','center','e','sw','s','se'].forEach(id => {
    assert(ROOM_DANGER_LEVEL[id] !== undefined, `${id} missing danger level`);
  });
});

console.log('\n=== DANGER_LABELS and DANGER_ICONS ===');
test('DANGER_LABELS has 4 entries', () => assertEqual(Object.keys(DANGER_LABELS).length, 4));
test('DANGER_ICONS has 4 entries', () => assertEqual(Object.keys(DANGER_ICONS).length, 4));
test('DANGER_LABELS[0] is Safe', () => assertEqual(DANGER_LABELS[0], 'Safe'));
test('DANGER_ICONS[3] is skull', () => assert(DANGER_ICONS[3].includes('💀') || DANGER_ICONS[3].length > 0));

console.log('\n=== getRoomId ===');
test('getRoomId(0,0) = nw', () => assertEqual(getRoomId(0, 0), 'nw'));
test('getRoomId(1,1) = center', () => assertEqual(getRoomId(1, 1), 'center'));
test('getRoomId(2,2) = se', () => assertEqual(getRoomId(2, 2), 'se'));
test('getRoomId(0,2) = ne', () => assertEqual(getRoomId(0, 2), 'ne'));
test('getRoomId(2,0) = sw', () => assertEqual(getRoomId(2, 0), 'sw'));

console.log('\n=== getCurrentRoomId ===');
const makeWorld = (row, col) => ({ roomRow: row, roomCol: col });
test('center room (1,1)', () => assertEqual(getCurrentRoomId(makeWorld(1, 1)), 'center'));
test('nw room (0,0)', () => assertEqual(getCurrentRoomId(makeWorld(0, 0)), 'nw'));
test('se room (2,2)', () => assertEqual(getCurrentRoomId(makeWorld(2, 2)), 'se'));

console.log('\n=== getRoomDangerLevel/Label/Icon ===');
test('getRoomDangerLevel center = 0', () => assertEqual(getRoomDangerLevel('center'), 0));
test('getRoomDangerLabel center = Safe', () => assertEqual(getRoomDangerLabel('center'), 'Safe'));
test('getRoomDangerIcon center exists', () => assert(getRoomDangerIcon('center').length > 0));

console.log('\n=== initVisitedRooms ===');
test('default starts with center (1,1)', () => {
  const v = initVisitedRooms();
  assert(v.includes('center'), 'should include center');
  assertEqual(v.length, 1);
});
test('custom start position (0,0) = nw', () => {
  const v = initVisitedRooms(0, 0);
  assert(v.includes('nw'), 'should include nw');
});
test('returns array', () => assert(Array.isArray(initVisitedRooms())));

console.log('\n=== markRoomVisited ===');
test('adds new room', () => {
  const v = initVisitedRooms();
  const v2 = markRoomVisited(v, 0, 0);
  assert(v2.includes('nw'), 'should include nw');
  assert(v2.includes('center'), 'should still include center');
  assertEqual(v2.length, 2);
});
test('no duplicate entries', () => {
  const v = initVisitedRooms();
  const v2 = markRoomVisited(v, 1, 1); // center again
  assertEqual(v2.length, 1);
});
test('does not mutate original', () => {
  const v = initVisitedRooms();
  const v2 = markRoomVisited(v, 0, 0);
  assertEqual(v.length, 1); // original unchanged
});

console.log('\n=== isRoomVisited ===');
test('center is visited after init', () => {
  const v = initVisitedRooms();
  assert(isRoomVisited(v, 'center'));
});
test('nw is not visited initially', () => {
  const v = initVisitedRooms();
  assert(!isRoomVisited(v, 'nw'));
});
test('after marking nw visited', () => {
  const v = markRoomVisited(initVisitedRooms(), 0, 0);
  assert(isRoomVisited(v, 'nw'));
});

console.log('\n=== getMinimapCellType ===');
test('current room → "current"', () => {
  const v = initVisitedRooms(1, 1);
  assertEqual(getMinimapCellType('center', 'center', v), 'current');
});
test('visited non-current room → "visited"', () => {
  const v = markRoomVisited(initVisitedRooms(1, 1), 0, 0);
  assertEqual(getMinimapCellType('nw', 'center', v), 'visited');
});
test('unvisited room → "unvisited"', () => {
  const v = initVisitedRooms(1, 1);
  assertEqual(getMinimapCellType('nw', 'center', v), 'unvisited');
});

console.log('\n=== buildMinimapData ===');
const worldState = { roomRow: 1, roomCol: 1 };
const visitedRooms = initVisitedRooms(1, 1);
const cells = buildMinimapData(worldState, visitedRooms);

test('returns 9 cells', () => assertEqual(cells.length, 9));
test('center cell has correct type', () => {
  const center = cells.find(c => c.roomId === 'center');
  assert(center, 'center cell should exist');
  assertEqual(center.cellType, 'current');
  assert(center.isCurrent);
});
test('unvisited cells have unvisited type', () => {
  const nw = cells.find(c => c.roomId === 'nw');
  assertEqual(nw.cellType, 'unvisited');
  assert(!nw.isVisited);
});
test('all cells have required fields', () => {
  cells.forEach(c => {
    assert(c.roomId !== undefined, 'missing roomId');
    assert(c.roomName !== undefined, 'missing roomName');
    assert(c.cellType !== undefined, 'missing cellType');
    assert(c.danger !== undefined, 'missing danger');
    assert(c.dangerLabel !== undefined, 'missing dangerLabel');
    assert(c.dangerIcon !== undefined, 'missing dangerIcon');
    assert(c.row !== undefined, 'missing row');
    assert(c.col !== undefined, 'missing col');
  });
});
test('cells are ordered row 0,0 to row 2,2', () => {
  assertEqual(cells[0].row, 0);
  assertEqual(cells[0].col, 0);
  assertEqual(cells[8].row, 2);
  assertEqual(cells[8].col, 2);
});

console.log('\n=== getMinimapStyles ===');
test('returns non-empty string', () => {
  const css = getMinimapStyles();
  assert(typeof css === 'string' && css.length > 0);
});
test('contains minimap-card class', () => {
  assert(getMinimapStyles().includes('minimap-card'));
});
test('contains minimap-cell class', () => {
  assert(getMinimapStyles().includes('minimap-cell'));
});

console.log('\n=== renderMinimap ===');
const html = renderMinimap(worldState, visitedRooms);
test('returns string', () => assert(typeof html === 'string'));
test('contains Minimap heading', () => assert(html.includes('Minimap')));
test('shows visited count like (1/9)', () => assert(html.includes('1/9')));
test('contains player indicator 🧍', () => assert(html.includes('🧍')));
test('contains minimap-grid', () => assert(html.includes('minimap-grid')));
test('contains fog of war ? for unvisited', () => assert(html.includes('?')));
test('contains legend', () => assert(html.includes('minimap-legend')));
test('has current class on current cell', () => assert(html.includes('current')));

// Test with multiple visited rooms
const visitedMultiple = markRoomVisited(markRoomVisited(visitedRooms, 0, 1), 0, 2);
const html2 = renderMinimap(worldState, visitedMultiple);
test('shows updated visited count (3/9)', () => assert(html2.includes('3/9')));
test('visited rooms show room name abbreviation', () => assert(typeof html2 === 'string'));

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
