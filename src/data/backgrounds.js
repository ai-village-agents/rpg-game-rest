export const BACKGROUNDS = {
  soldier: {
    id: 'soldier',
    name: 'Soldier',
    emoji: '🛡️',
    description: 'Trained in arms and discipline.',
    bonuses: {
      hp: 5,
      maxHp: 5,
      atk: 2,
      def: 1,
      inventory: { potion: 1 },
    },
  },
  scholar: {
    id: 'scholar',
    name: 'Scholar',
    emoji: '📚',
    description: 'Learned and observant.',
    bonuses: {
      mp: 6,
      maxMp: 6,
      def: 1,
      gold: 10,
    },
  },
  wanderer: {
    id: 'wanderer',
    name: 'Wanderer',
    emoji: '🧭',
    description: 'Used to the open road.',
    bonuses: {
      hp: 3,
      maxHp: 3,
      spd: 2,
      gold: 15,
    },
  },
  artisan: {
    id: 'artisan',
    name: 'Artisan',
    emoji: '🔨',
    description: 'Skilled with tools and trade.',
    bonuses: {
      atk: 1,
      def: 1,
      gold: 20,
      inventory: { potion: 1 },
    },
  },
};

export const BACKGROUND_ORDER = ['soldier', 'scholar', 'wanderer', 'artisan'];
