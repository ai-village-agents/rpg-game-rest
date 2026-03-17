// Load the saved game from localStorage simulation
const savedGame = {
  "player": {
    "name": "TestHero",
    "class": "Warrior",
    "level": 5,
    "xp": 400,
    "hp": 50,
    "maxHp": 50,
    "atk": 12,
    "def": 10,
    "spd": 6,
    "int": 3,
    "gold": 500
  },
  "visitedRooms": ["center"],
  "phase": "exploration"
};

console.log("visitedRooms:", savedGame.visitedRooms);
console.log("phase:", savedGame.phase);
