// Creature Evolution System - Inspired by Spore (2008)
// A companion that evolves through stages based on player choices

import { pushLog } from './state.js';

// Evolution stages inspired by Spore's gameplay progression
export const EVOLUTION_STAGES = {
  CELL: {
    name: 'Cell',
    description: 'A microscopic organism seeking to grow',
    baseStats: { hp: 10, attack: 2, defense: 1, speed: 3 },
    evolutionPointsRequired: 0,
  },
  CREATURE: {
    name: 'Creature',
    description: 'A land-dwelling being learning to survive',
    baseStats: { hp: 25, attack: 5, defense: 3, speed: 5 },
    evolutionPointsRequired: 50,
  },
  TRIBAL: {
    name: 'Tribal',
    description: 'A social creature forming bonds with others',
    baseStats: { hp: 50, attack: 10, defense: 7, speed: 6 },
    evolutionPointsRequired: 150,
  },
  CIVILIZED: {
    name: 'Civilized',
    description: 'An intelligent being mastering tools and tactics',
    baseStats: { hp: 80, attack: 15, defense: 12, speed: 8 },
    evolutionPointsRequired: 300,
  },
  COSMIC: {
    name: 'Cosmic',
    description: 'A transcendent entity wielding universal power',
    baseStats: { hp: 120, attack: 22, defense: 18, speed: 10 },
    evolutionPointsRequired: 500,
  },
};

// Traits that can be selected during evolution (like Spore's creature parts)
export const EVOLUTION_TRAITS = {
  // Offensive traits
  SHARP_CLAWS: {
    name: 'Sharp Claws',
    category: 'offense',
    effect: { attack: 3 },
    description: 'Razor-sharp appendages for striking foes',
  },
  VENOMOUS_BITE: {
    name: 'Venomous Bite',
    category: 'offense',
    effect: { attack: 2, poisonChance: 0.2 },
    description: 'Toxic secretions that weaken enemies over time',
  },
  POWERFUL_CHARGE: {
    name: 'Powerful Charge',
    category: 'offense',
    effect: { attack: 4, speed: -1 },
    description: 'A devastating rush attack',
  },

  // Defensive traits
  THICK_HIDE: {
    name: 'Thick Hide',
    category: 'defense',
    effect: { defense: 4, speed: -1 },
    description: 'Armored skin that absorbs damage',
  },
  REGENERATION: {
    name: 'Regeneration',
    category: 'defense',
    effect: { defense: 1, regenPerTurn: 3 },
    description: 'Rapid cellular repair between battles',
  },
  EVASIVE_FORM: {
    name: 'Evasive Form',
    category: 'defense',
    effect: { defense: 1, dodgeChance: 0.15 },
    description: 'A sleek body that avoids attacks',
  },

  // Utility traits
  KEEN_SENSES: {
    name: 'Keen Senses',
    category: 'utility',
    effect: { speed: 2, critChance: 0.1 },
    description: 'Enhanced perception for precise strikes',
  },
  PACK_BOND: {
    name: 'Pack Bond',
    category: 'utility',
    effect: { loyaltyBonus: 10, supportDamage: 2 },
    description: 'Strong connection with companions',
  },
  ADAPTIVE_METABOLISM: {
    name: 'Adaptive Metabolism',
    category: 'utility',
    effect: { hp: 10, healingBonus: 0.2 },
    description: 'Efficient energy use for survival',
  },
};

// Create initial Sporeling companion state
export function createSporeling(name = 'Sporeling') {
  const cellStage = EVOLUTION_STAGES.CELL;
  return {
    id: 'sporeling_' + Date.now(),
    name,
    type: 'EVOLVING_CREATURE',
    stage: 'CELL',
    evolutionPoints: 0,
    traits: [],
    stats: { ...cellStage.baseStats },
    maxHp: cellStage.baseStats.hp,
    hp: cellStage.baseStats.hp,
    alive: true,
    loyalty: 60,
    combatVictories: 0,
  };
}

// Award evolution points after combat
export function awardEvolutionPoints(state, points) {
  const sporeling = getSporeling(state);
  if (!sporeling) return state;

  const newPoints = sporeling.evolutionPoints + points;
  const updatedSporeling = { ...sporeling, evolutionPoints: newPoints };

  const nextState = updateSporeling(state, updatedSporeling);
  return pushLog(nextState, `${sporeling.name} gained ${points} evolution points!`);
}

// Check if sporeling can evolve to next stage
export function canEvolve(sporeling) {
  const stages = Object.keys(EVOLUTION_STAGES);
  const currentIndex = stages.indexOf(sporeling.stage);
  if (currentIndex >= stages.length - 1) return false;

  const nextStage = EVOLUTION_STAGES[stages[currentIndex + 1]];
  return sporeling.evolutionPoints >= nextStage.evolutionPointsRequired;
}

// Get available next stage
export function getNextStage(sporeling) {
  const stages = Object.keys(EVOLUTION_STAGES);
  const currentIndex = stages.indexOf(sporeling.stage);
  if (currentIndex >= stages.length - 1) return null;
  return stages[currentIndex + 1];
}

// Evolve sporeling to next stage with selected trait
export function evolveSporeling(state, traitId) {
  const sporeling = getSporeling(state);
  if (!sporeling || !canEvolve(sporeling)) {
    return pushLog(state, 'Cannot evolve right now.');
  }

  const trait = EVOLUTION_TRAITS[traitId];
  if (!trait) {
    return pushLog(state, 'Invalid trait selection.');
  }

  const nextStageKey = getNextStage(sporeling);
  const nextStage = EVOLUTION_STAGES[nextStageKey];

  // Calculate new stats from stage + all traits
  const newTraits = [...sporeling.traits, traitId];
  const newStats = calculateStats(nextStage.baseStats, newTraits);

  const evolvedSporeling = {
    ...sporeling,
    stage: nextStageKey,
    traits: newTraits,
    stats: newStats,
    maxHp: newStats.hp,
    hp: newStats.hp, // Full heal on evolution
  };

  let nextState = updateSporeling(state, evolvedSporeling);
  nextState = pushLog(
    nextState,
    `${sporeling.name} evolved to ${nextStage.name} stage and gained ${trait.name}!`
  );

  return nextState;
}

// Calculate total stats from base + traits
function calculateStats(baseStats, traitIds) {
  const stats = { ...baseStats };

  for (const traitId of traitIds) {
    const trait = EVOLUTION_TRAITS[traitId];
    if (trait && trait.effect) {
      for (const [key, value] of Object.entries(trait.effect)) {
        if (typeof stats[key] === 'number') {
          stats[key] += value;
        } else if (typeof value === 'number') {
          stats[key] = value;
        }
      }
    }
  }

  return stats;
}

// Get sporeling from state
export function getSporeling(state) {
  if (!state.companions) return null;
  return state.companions.find((c) => c.type === 'EVOLVING_CREATURE') || null;
}

// Update sporeling in state
function updateSporeling(state, sporeling) {
  if (!state.companions) return state;

  const companions = state.companions.map((c) =>
    c.type === 'EVOLVING_CREATURE' ? sporeling : c
  );

  return { ...state, companions };
}

// Get available traits for evolution (excluding already selected)
export function getAvailableTraits(sporeling) {
  const selectedTraits = new Set(sporeling.traits);
  return Object.entries(EVOLUTION_TRAITS)
    .filter(([id]) => !selectedTraits.has(id))
    .map(([id, trait]) => ({ id, ...trait }));
}

// Recruit a Sporeling companion
export function recruitSporeling(state, name = 'Sporeling') {
  if (getSporeling(state)) {
    return pushLog(state, 'You already have a Sporeling companion.');
  }

  const sporeling = createSporeling(name);
  const companions = state.companions ? [...state.companions, sporeling] : [sporeling];

  let nextState = { ...state, companions };
  return pushLog(
    nextState,
    `A mysterious ${sporeling.name} joined you! It seems eager to evolve...`
  );
}

// Get evolution progress info
export function getEvolutionProgress(sporeling) {
  if (!sporeling) return null;

  const stages = Object.keys(EVOLUTION_STAGES);
  const currentIndex = stages.indexOf(sporeling.stage);
  const currentStage = EVOLUTION_STAGES[sporeling.stage];
  const nextStageKey = stages[currentIndex + 1];
  const nextStage = nextStageKey ? EVOLUTION_STAGES[nextStageKey] : null;

  return {
    currentStage: currentStage.name,
    currentDescription: currentStage.description,
    evolutionPoints: sporeling.evolutionPoints,
    pointsNeeded: nextStage ? nextStage.evolutionPointsRequired : null,
    canEvolve: canEvolve(sporeling),
    isMaxStage: !nextStage,
    traits: sporeling.traits.map((id) => EVOLUTION_TRAITS[id]),
  };
}
