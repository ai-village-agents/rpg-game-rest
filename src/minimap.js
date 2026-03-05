/**
 * Exploration Minimap UI
 *
 * Renders a 3×3 grid showing player position, visited rooms, and danger zones.
 * Tracks visited rooms via a Set encoded as an array in game state (for serialization).
 */

// The 3×3 room ID map matches DEFAULT_WORLD_DATA.rooms layout
export const MINIMAP_ROOM_ID_MAP = [
  ['nw', 'n',      'ne'],
  ['w',  'center', 'e' ],
  ['sw', 's',      'se'],
];

// Room names for display
export const ROOM_NAMES = {
  nw:     'Northwest Grove',
  n:      'Northern Path',
  ne:     'Northeast Ridge',
  w:      'Western Crossing',
  center: 'Village Square',
  e:      'Eastern Fields',
  sw:     'Southwest Marsh',
  s:      'Southern Road',
  se:     'Southeast Dock',
};

// Danger level per room (0 = safe, 1 = low, 2 = medium, 3 = high)
// Based on encounter probability and enemy difficulty
export const ROOM_DANGER_LEVEL = {
  center: 0,  // Village Square — safe hub
  n:      1,  // Northern Path — low danger
  w:      1,  // Western Crossing — low danger
  s:      1,  // Southern Road — low danger
  e:      2,  // Eastern Fields — medium danger
  nw:     2,  // Northwest Grove — medium danger
  ne:     2,  // Northeast Ridge — medium danger
  sw:     3,  // Southwest Marsh — high danger
  se:     3,  // Southeast Dock — high danger
};

// Danger level labels for tooltip/display
export const DANGER_LABELS = {
  0: 'Safe',
  1: 'Low risk',
  2: 'Dangerous',
  3: 'Very dangerous',
};

// Danger level icons
export const DANGER_ICONS = {
  0: '🏡',
  1: '⚠️',
  2: '☠️',
  3: '💀',
};

/**
 * Get the room ID for a given grid position.
 * @param {number} row - 0..2
 * @param {number} col - 0..2
 * @returns {string|null}
 */
export function getRoomId(row, col) {
  return MINIMAP_ROOM_ID_MAP[row]?.[col] ?? null;
}

/**
 * Get the current room ID from world state.
 * @param {object} worldState - { roomRow, roomCol }
 * @returns {string|null}
 */
export function getCurrentRoomId(worldState) {
  if (!worldState) return null;
  const { roomRow, roomCol } = worldState;
  if (roomRow == null || roomCol == null) return null;
  return getRoomId(roomRow, roomCol);
}

/**
 * Get the danger level for a room.
 * @param {string} roomId
 * @returns {number} 0..3
 */
export function getRoomDangerLevel(roomId) {
  if (!roomId) return 0;
  return ROOM_DANGER_LEVEL[roomId] ?? 1;
}

/**
 * Get the danger label for a room.
 * @param {string} roomId
 * @returns {string}
 */
export function getRoomDangerLabel(roomId) {
  const level = getRoomDangerLevel(roomId);
  return DANGER_LABELS[level] ?? 'Unknown';
}

/**
 * Get the danger icon for a room.
 * @param {string} roomId
 * @returns {string}
 */
export function getRoomDangerIcon(roomId) {
  const level = getRoomDangerLevel(roomId);
  return DANGER_ICONS[level] ?? '?';
}

/**
 * Initialize visited rooms tracking. Returns a fresh set encoded as an array.
 * Call this when starting a new game; the starting room is pre-marked visited.
 * @param {number} startRow - initial roomRow (default 1 = center)
 * @param {number} startCol - initial roomCol (default 1 = center)
 * @returns {string[]} Array of visited room IDs
 */
export function initVisitedRooms(startRow = 1, startCol = 1) {
  const startId = getRoomId(startRow, startCol);
  return startId ? [startId] : [];
}

/**
 * Mark a room as visited. Returns updated visited rooms array (no duplicates).
 * @param {string[]} visitedRooms - current visited rooms array
 * @param {number} row
 * @param {number} col
 * @returns {string[]}
 */
export function markRoomVisited(visitedRooms, row, col) {
  const roomId = getRoomId(row, col);
  if (!roomId) return visitedRooms;
  const visited = Array.isArray(visitedRooms) ? visitedRooms : [];
  if (visited.includes(roomId)) return visited;
  return [...visited, roomId];
}

/**
 * Check if a room has been visited.
 * @param {string[]} visitedRooms
 * @param {string} roomId
 * @returns {boolean}
 */
export function isRoomVisited(visitedRooms, roomId) {
  if (!Array.isArray(visitedRooms)) return false;
  return visitedRooms.includes(roomId);
}

/**
 * Get the cell type for a minimap cell.
 * @param {string} roomId
 * @param {string} currentRoomId
 * @param {string[]} visitedRooms
 * @returns {'current'|'visited'|'unvisited'}
 */
export function getMinimapCellType(roomId, currentRoomId, visitedRooms) {
  if (roomId === currentRoomId) return 'current';
  if (isRoomVisited(visitedRooms, roomId)) return 'visited';
  return 'unvisited';
}

/**
 * Build a minimap data structure for rendering.
 * @param {object} worldState - { roomRow, roomCol }
 * @param {string[]} visitedRooms - array of visited room IDs
 * @returns {object[]} Array of cell data objects for all 9 rooms
 */
export function buildMinimapData(worldState, visitedRooms) {
  const currentRoomId = getCurrentRoomId(worldState);
  const cells = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const roomId = getRoomId(row, col);
      const cellType = getMinimapCellType(roomId, currentRoomId, visitedRooms);
      const danger = getRoomDangerLevel(roomId);
      cells.push({
        row,
        col,
        roomId,
        roomName: ROOM_NAMES[roomId] ?? 'Unknown',
        cellType,
        danger,
        dangerLabel: DANGER_LABELS[danger] ?? 'Unknown',
        dangerIcon: DANGER_ICONS[danger] ?? '?',
        isCurrent: cellType === 'current',
        isVisited: cellType === 'visited' || cellType === 'current',
      });
    }
  }

  return cells;
}

/**
 * Escape HTML special characters.
 * @param {string} s
 * @returns {string}
 */
function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Render the CSS styles for the minimap (call once, inject into <style> tag).
 * @returns {string} CSS string
 */
export function getMinimapStyles() {
  return `
.minimap-card {
  min-width: 160px;
}
.minimap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  margin: 6px 0;
}
.minimap-cell {
  width: 44px;
  height: 44px;
  border: 2px solid #444;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  text-align: center;
  cursor: default;
  transition: border-color 0.2s;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.minimap-cell.current {
  border-color: #4af;
  background: #1a3a5c;
}
.minimap-cell.current .minimap-player {
  display: block;
}
.minimap-cell.visited {
  border-color: #666;
  background: #2a2a2a;
}
.minimap-cell.unvisited {
  border-color: #333;
  background: #111;
  color: #444;
}
.minimap-cell-abbr {
  font-size: 9px;
  font-weight: bold;
  line-height: 1.1;
  color: inherit;
}
.minimap-cell.unvisited .minimap-cell-abbr {
  color: #333;
}
.minimap-cell.visited .minimap-cell-abbr {
  color: #aaa;
}
.minimap-cell.current .minimap-cell-abbr {
  color: #7cf;
}
.minimap-danger-icon {
  font-size: 11px;
  line-height: 1;
}
.minimap-cell.unvisited .minimap-danger-icon {
  opacity: 0;
}
.minimap-player {
  display: none;
  font-size: 12px;
  position: absolute;
  top: 2px;
  right: 2px;
}
.minimap-legend {
  font-size: 10px;
  color: #888;
  margin-top: 4px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.minimap-legend-item {
  display: flex;
  align-items: center;
  gap: 2px;
}
.minimap-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
}
.minimap-legend-dot.current { background: #1a3a5c; border: 1px solid #4af; }
.minimap-legend-dot.visited { background: #2a2a2a; border: 1px solid #666; }
.minimap-legend-dot.unvisited { background: #111; border: 1px solid #333; }
.minimap-room-info {
  font-size: 11px;
  color: #ccc;
  margin-top: 4px;
}
.minimap-room-info .danger-badge {
  display: inline-block;
  margin-left: 4px;
  font-size: 11px;
}
`;
}

/**
 * Render the minimap as an HTML string.
 * @param {object} worldState - { roomRow, roomCol }
 * @param {string[]} visitedRooms - array of visited room IDs
 * @returns {string} HTML string for the minimap card
 */
export function renderMinimap(worldState, visitedRooms) {
  if (!worldState) return '';

  const cells = buildMinimapData(worldState, visitedRooms);
  const currentRoomId = getCurrentRoomId(worldState);
  const currentRoom = cells.find(c => c.isCurrent);
  const visitedCount = cells.filter(c => c.isVisited).length;

  // Build grid rows (3×3)
  let gridHtml = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = cells[row * 3 + col];
      const abbr = cell.roomName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
      const tooltip = cell.cellType === 'unvisited'
        ? 'Unexplored'
        : `${esc(cell.roomName)} — ${esc(cell.dangerLabel)}`;
      gridHtml += `
        <div class="minimap-cell ${esc(cell.cellType)}"
             title="${tooltip}"
             data-roomid="${esc(cell.roomId)}"
             data-row="${cell.row}"
             data-col="${cell.col}">
          <span class="minimap-player">🧍</span>
          <span class="minimap-danger-icon" aria-label="${esc(cell.dangerLabel)}">${cell.cellType !== 'unvisited' ? esc(cell.dangerIcon) : '?'}</span>
          <span class="minimap-cell-abbr">${cell.cellType !== 'unvisited' ? esc(abbr) : '?'}</span>
        </div>
      `;
    }
  }

  const currentRoomInfo = currentRoom
    ? `<b>${esc(currentRoom.roomName)}</b><span class="danger-badge" title="${esc(currentRoom.dangerLabel)}">${esc(currentRoom.dangerIcon)}</span>`
    : 'Unknown location';

  const legendHtml = `
    <div class="minimap-legend">
      <span class="minimap-legend-item"><span class="minimap-legend-dot current"></span>&nbsp;Here</span>
      <span class="minimap-legend-item"><span class="minimap-legend-dot visited"></span>&nbsp;Visited</span>
      <span class="minimap-legend-item"><span class="minimap-legend-dot unvisited"></span>&nbsp;Unknown</span>
    </div>
  `;

  return `
    <div class="card minimap-card">
      <h2>Minimap <small style="font-size:11px;color:#888;">(${visitedCount}/9)</small></h2>
      <div class="minimap-grid">${gridHtml}</div>
      <div class="minimap-room-info">${currentRoomInfo}</div>
      ${legendHtml}
    </div>
  `;
}
