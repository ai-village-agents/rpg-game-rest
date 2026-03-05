export const items = {
  potion: {
    id: 'potion',
    name: 'Potion',
    type: 'consumable',
    effect: { heal: 10 },
    heal: 10,
  },
  'health-potion': {
    id: 'health-potion',
    name: 'Health Potion',
    type: 'consumable',
    effect: { heal: 25 },
    heal: 25,
  },
  ether: {
    id: 'ether',
    name: 'Ether',
    type: 'consumable',
    effect: { restoreMP: 20 },
    heal: 0,
  },
  antidote: {
    id: 'antidote',
    name: 'Antidote',
    type: 'consumable',
    effect: { cureStatus: ['poison'] },
    heal: 0,
  },
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    type: 'consumable',
    effect: { heal: 50, restoreMP: 30 },
    heal: 50,
  },
};
