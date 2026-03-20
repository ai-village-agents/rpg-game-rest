const TILE_SIZE = 32;
const WORLD_GRID_WIDTH = 32;
const WORLD_GRID_HEIGHT = 32;
const ROOM_WIDTH = 16;
const ROOM_HEIGHT = 12;
export const ROOM_MID_X = Math.floor(ROOM_WIDTH / 2);
export const ROOM_MID_Y = Math.floor(ROOM_HEIGHT / 2);

const ENTRY_OFFSETS = [0, -1, 1, -2, 2, -3, 3];

const DIRECTIONS = {
  north: { dx: 0, dy: -1, roomRow: -1, roomCol: 0 },
  south: { dx: 0, dy: 1, roomRow: 1, roomCol: 0 },
  west: { dx: -1, dy: 0, roomRow: 0, roomCol: -1 },
  east: { dx: 1, dy: 0, roomRow: 0, roomCol: 1 },
};

function createGrid(width, height, fill = 0) {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
}

function addObstacle(grid, x, y, w, h) {
  for (let row = y; row < y + h && row < grid.length; row += 1) {
    for (let col = x; col < x + w && col < grid[0].length; col += 1) {
      grid[row][col] = 1;
    }
  }
}

function openEdge(grid, edge) {
  if (edge === 'north') {
    grid[0][ROOM_MID_X] = 0;
    grid[1][ROOM_MID_X] = 0;
  } else if (edge === 'south') {
    grid[ROOM_HEIGHT - 1][ROOM_MID_X] = 0;
    grid[ROOM_HEIGHT - 2][ROOM_MID_X] = 0;
  } else if (edge === 'west') {
    grid[ROOM_MID_Y][0] = 0;
    grid[ROOM_MID_Y][1] = 0;
  } else if (edge === 'east') {
    grid[ROOM_MID_Y][ROOM_WIDTH - 1] = 0;
    grid[ROOM_MID_Y][ROOM_WIDTH - 2] = 0;
  }
}

function buildRoom(id, name, obstacles = []) {
  const collision = createGrid(ROOM_WIDTH, ROOM_HEIGHT, 0);

  // Perimeter walls.
  for (let x = 0; x < ROOM_WIDTH; x += 1) {
    collision[0][x] = 1;
    collision[ROOM_HEIGHT - 1][x] = 1;
  }
  for (let y = 0; y < ROOM_HEIGHT; y += 1) {
    collision[y][0] = 1;
    collision[y][ROOM_WIDTH - 1] = 1;
  }

  // Openings for room transitions.
  openEdge(collision, 'north');
  openEdge(collision, 'south');
  openEdge(collision, 'west');
  openEdge(collision, 'east');

  obstacles.forEach(({ x, y, w, h }) => addObstacle(collision, x, y, w, h));

  return { id, name, collision };
}

// Basic 3x3 world layout with light obstruction variety.
const defaultRooms = [
  [
    buildRoom('nw', 'Northwest Grove', [
      { x: 4, y: 3, w: 3, h: 2 },
      { x: 9, y: 5, w: 2, h: 2 },
    ]),
    buildRoom('n', 'Northern Path', [
      { x: 7, y: 2, w: 2, h: 6 },
    ]),
    buildRoom('ne', 'Northeast Ridge', [
      { x: 3, y: 6, w: 4, h: 3 },
      { x: 10, y: 2, w: 3, h: 2 },
    ]),
  ],
  [
    buildRoom('w', 'Western Crossing', [
      { x: 6, y: 4, w: 2, h: 3 },
      { x: 10, y: 8, w: 3, h: 2 },
    ]),
    buildRoom('center', 'Village Square', [
      { x: 4, y: 4, w: 2, h: 2 },
      { x: 9, y: 4, w: 2, h: 2 },
      { x: 6, y: 7, w: 4, h: 2 },
    ]),
    buildRoom('e', 'Eastern Fields', [
      { x: 11, y: 3, w: 2, h: 5 },
      { x: 3, y: 8, w: 2, h: 2 },
    ]),
  ],
  [
    buildRoom('sw', 'Southwest Marsh', [
      { x: 5, y: 6, w: 3, h: 2 },
    ]),
    buildRoom('s', 'Southern Road', [
      { x: 7, y: 2, w: 2, h: 7 },
    ]),
    buildRoom('se', 'Southeast Dock', [
      { x: 4, y: 3, w: 2, h: 2 },
      { x: 9, y: 6, w: 3, h: 3 },
    ]),
  ],
];

export const DEFAULT_WORLD_DATA = {
  tileSize: TILE_SIZE,
  worldWidth: WORLD_GRID_WIDTH,
  worldHeight: WORLD_GRID_HEIGHT,
  roomWidth: ROOM_WIDTH,
  roomHeight: ROOM_HEIGHT,
  rooms: defaultRooms,
  startRoom: { row: 1, col: 1 }, // Center room
  startPosition: {
    x: Math.floor(ROOM_WIDTH / 2),
    y: Math.floor(ROOM_HEIGHT / 2),
  },
};

export class WorldMap {
  constructor(worldData = DEFAULT_WORLD_DATA, persistedState = null) {
    this.tileSize = worldData.tileSize ?? TILE_SIZE;
    this.worldWidth = worldData.worldWidth ?? WORLD_GRID_WIDTH;
    this.worldHeight = worldData.worldHeight ?? WORLD_GRID_HEIGHT;
    this.roomWidth = worldData.roomWidth ?? ROOM_WIDTH;
    this.roomHeight = worldData.roomHeight ?? ROOM_HEIGHT;
    this.rooms = worldData.rooms;
    this.grid = createGrid(this.worldWidth, this.worldHeight, 0);

    const baseState = {
      roomRow: worldData.startRoom?.row ?? 0,
      roomCol: worldData.startRoom?.col ?? 0,
      x: worldData.startPosition?.x ?? 0,
      y: worldData.startPosition?.y ?? 0,
    };

    const merged = { ...baseState, ...(persistedState ?? {}) };
    this.state = this._validateState(merged);
  }

  _validateState(nextState) {
    const room = this.rooms[nextState.roomRow]?.[nextState.roomCol];
    const x = Math.max(0, Math.min(this.roomWidth - 1, nextState.x));
    const y = Math.max(0, Math.min(this.roomHeight - 1, nextState.y));
    if (!room || this._isBlocked(room, x, y)) {
      return {
        roomRow: DEFAULT_WORLD_DATA.startRoom.row,
        roomCol: DEFAULT_WORLD_DATA.startRoom.col,
        x: DEFAULT_WORLD_DATA.startPosition.x,
        y: DEFAULT_WORLD_DATA.startPosition.y,
      };
    }
    return { ...nextState, x, y };
  }

  snapshot() {
    return { ...this.state };
  }

  getCurrentRoom() {
    return this.rooms[this.state.roomRow]?.[this.state.roomCol] ?? null;
  }

  _isInsideRoom(x, y) {
    return x >= 0 && x < this.roomWidth && y >= 0 && y < this.roomHeight;
  }

  _isBlocked(room, x, y) {
    const row = room?.collision?.[y];
    if (!row) return true;
    return row[x] === 1;
  }

  _isBoundaryForDirection(x, y, directionKey) {
    if (directionKey === 'north') return y === 0;
    if (directionKey === 'south') return y === this.roomHeight - 1;
    if (directionKey === 'west') return x === 0;
    if (directionKey === 'east') return x === this.roomWidth - 1;
    return false;
  }

  _resolveEntryPosition(directionKey, targetRoom) {
    if (!targetRoom) return null;

    const preferMidX = Number.isFinite(this.state?.x) ? this.state.x : ROOM_MID_X;
    const preferMidY = Number.isFinite(this.state?.y) ? this.state.y : ROOM_MID_Y;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    if (directionKey === 'north' || directionKey === 'south') {
      const entryY = directionKey === 'north' ? this.roomHeight - 2 : 1;
      const bases = [preferMidX, ROOM_MID_X];
      for (const base of bases) {
        for (const offset of ENTRY_OFFSETS) {
          const candidateX = clamp(base + offset, 0, this.roomWidth - 1);
          if (!this._isBlocked(targetRoom, candidateX, entryY)) {
            return { x: candidateX, y: entryY };
          }
        }
      }
    } else if (directionKey === 'east' || directionKey === 'west') {
      const entryX = directionKey === 'west' ? this.roomWidth - 2 : 1;
      const bases = [preferMidY, ROOM_MID_Y];
      for (const base of bases) {
        for (const offset of ENTRY_OFFSETS) {
          const candidateY = clamp(base + offset, 0, this.roomHeight - 1);
          if (!this._isBlocked(targetRoom, entryX, candidateY)) {
            return { x: entryX, y: candidateY };
          }
        }
      }
    }

    return null;
  }

  move(directionKey) {
    const direction = DIRECTIONS[directionKey];
    if (!direction) {
      return { moved: false, blocked: 'invalid-direction', transitioned: false, state: this.snapshot() };
    }

    const room = this.getCurrentRoom();
    const targetX = this.state.x + direction.dx;
    const targetY = this.state.y + direction.dy;

    if (this._isInsideRoom(targetX, targetY)) {
      if (this._isBlocked(room, targetX, targetY)) {
        if (this._isBoundaryForDirection(targetX, targetY, directionKey)) {
          return this._attemptTransition(directionKey);
        }
        return { moved: false, blocked: 'collision', transitioned: false, state: this.snapshot() };
      }
      this.state = { ...this.state, x: targetX, y: targetY };
      return { moved: true, blocked: null, transitioned: false, state: this.snapshot() };
    }

    return this._attemptTransition(directionKey);
  }

  _attemptTransition(directionKey) {
    const direction = DIRECTIONS[directionKey];
    const nextRoomRow = this.state.roomRow + direction.roomRow;
    const nextRoomCol = this.state.roomCol + direction.roomCol;
    const targetRoom = this.rooms[nextRoomRow]?.[nextRoomCol];

    if (!targetRoom) {
      return { moved: false, blocked: 'edge', transitioned: false, state: this.snapshot() };
    }

    const entry = this._resolveEntryPosition(directionKey, targetRoom);
    if (!entry) {
      return { moved: false, blocked: 'collision', transitioned: false, state: this.snapshot() };
    }

    this.state = {
      roomRow: nextRoomRow,
      roomCol: nextRoomCol,
      x: entry.x,
      y: entry.y,
    };

    return { moved: true, blocked: null, transitioned: true, state: this.snapshot() };
  }
}

export function createWorld(worldData = DEFAULT_WORLD_DATA) {
  return new WorldMap(worldData);
}

export function createWorldState(persistedState = null, worldData = DEFAULT_WORLD_DATA) {
  const world = new WorldMap(worldData, persistedState);
  return world.snapshot();
}

export function movePlayer(worldState, directionKey, worldData = DEFAULT_WORLD_DATA) {
  const world = new WorldMap(worldData, worldState);
  const result = world.move(directionKey);
  return { ...result, worldState: world.snapshot(), room: world.getCurrentRoom() };
}

export function travelToAdjacentRoom(worldState, directionKey, worldData = DEFAULT_WORLD_DATA) {
  const world = new WorldMap(worldData, worldState);
  const direction = DIRECTIONS[directionKey];
  if (!direction) {
    return {
      moved: false,
      blocked: 'invalid-direction',
      transitioned: false,
      worldState,
      room: null,
    };
  }

  const currentState = world.snapshot();
  const nextRoomRow = currentState.roomRow + direction.roomRow;
  const nextRoomCol = currentState.roomCol + direction.roomCol;
  const targetRoom = world.rooms[nextRoomRow]?.[nextRoomCol];

  if (!targetRoom) {
    return { moved: false, blocked: 'edge', transitioned: false, worldState, room: null };
  }

  const entry = world._resolveEntryPosition(directionKey, targetRoom);
  if (!entry) {
    return { moved: false, blocked: 'collision', transitioned: false, worldState, room: null };
  }

  world.state = {
    roomRow: nextRoomRow,
    roomCol: nextRoomCol,
    x: entry.x,
    y: entry.y,
  };

  return { moved: true, blocked: null, transitioned: true, worldState: world.snapshot(), room: world.getCurrentRoom() };
}

/**
 * Create a map wrapper object with world data and state.
 * @param {object} worldData
 * @param {object|null} persistedState
 * @returns {{worldData: object, worldState: object}}
 */
export function createMap(worldData = DEFAULT_WORLD_DATA, persistedState = null) {
  return {
    worldData,
    worldState: createWorldState(persistedState, worldData),
  };
}

/**
 * Get the current room from a map wrapper or world state.
 * @param {object} mapState
 * @param {object} worldData
 * @returns {object|null}
 */
export function getCurrentRoom(mapState, worldData = DEFAULT_WORLD_DATA) {
  const resolvedWorldData = mapState?.worldData ?? worldData;
  const resolvedWorldState = mapState?.worldState ?? mapState;
  const world = new WorldMap(resolvedWorldData, resolvedWorldState);
  return world.getCurrentRoom();
}

/**
 * Get the available exits from the current room.
 * @param {object} mapState
 * @param {object} worldData
 * @returns {string[]}
 */
export function getRoomExits(mapState, worldData = DEFAULT_WORLD_DATA) {
  const resolvedWorldData = mapState?.worldData ?? worldData;
  const resolvedWorldState = mapState?.worldState ?? mapState;
  const roomRow = resolvedWorldState?.roomRow ?? 0;
  const roomCol = resolvedWorldState?.roomCol ?? 0;
  const rooms = resolvedWorldData.rooms ?? [];

  return Object.entries(DIRECTIONS)
    .filter(([, dir]) => Boolean(rooms[roomRow + dir.roomRow]?.[roomCol + dir.roomCol]))
    .map(([key]) => key);
}
