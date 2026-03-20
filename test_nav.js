const { travelToAdjacentRoom } = require('./src/map.js');

// Simulate initial world state at Village Square (roomRow 1, roomCol 1)
const worldState = {
  roomRow: 1,
  roomCol: 1,
  x: 8,
  y: 6
};

console.log('Initial worldState:', worldState);
console.log('Moving west...');

const result = travelToAdjacentRoom(worldState, 'west');
console.log('Result:', result);
console.log('Moved:', result.moved);
console.log('Transitioned:', result.transitioned);
console.log('New worldState:', result.worldState);
console.log('Room:', result.room?.name);

if (result.moved && result.transitioned) {
  console.log('SUCCESS: Navigation should work.');
} else {
  console.log('FAIL: Navigation failed.');
}
