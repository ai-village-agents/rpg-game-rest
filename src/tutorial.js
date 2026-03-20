export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    trigger: 'class-select',
    title: 'Welcome, Adventurer!',
    message: 'Pick a class to launch your journey—each one fights with its own flair.',
    position: 'center',
  },
  {
    id: 'exploration-basics',
    trigger: 'first-exploration',
    title: 'Exploring the World',
    message: 'Move with the directional buttons or WASD to uncover new areas.',
    position: 'top',
  },
  {
    id: 'combat-intro',
    trigger: 'first-combat',
    title: 'Combat Basics',
    message: 'Attack for steady damage, Defend to blunt blows, and spend MP on high-impact skills.',
    position: 'top',
  },
  {
    id: 'inventory-intro',
    trigger: 'first-inventory',
    title: 'Your Inventory',
    message: 'Gear boosts your stats; use sort and filter tools to stay organized.',
    position: 'top',
  },
  {
    id: 'shop-intro',
    trigger: 'first-shop',
    title: 'The Shop',
    message: 'Trade gear here—rarer finds cost more but pack greater power.',
    position: 'top',
  },
  {
    id: 'dungeon-intro',
    trigger: 'first-dungeon',
    title: 'Dungeon Delving',
    message: 'Dungeons descend into fiercer floors, so stock supplies before diving.',
    position: 'center',
  },
  {
    id: 'level-up-intro',
    trigger: 'first-level-up',
    title: 'Level Up!',
    message: 'Leveling grants stats and skill points—invest them in the talent tree.',
    position: 'center',
  },
  {
    id: 'quest-intro',
    trigger: 'first-quest',
    title: 'Quests',
    message: 'Quests deliver goals and rewards; check the quest log for details.',
    position: 'top',
  },
  {
    id: 'crafting-intro',
    trigger: 'first-crafting',
    title: 'Crafting',
    message: 'Craft recipes to forge potent gear and discover new blueprints as you roam.',
    position: 'top',
  },
  {
    id: 'companion-intro',
    trigger: 'first-companion',
    title: 'Companions',
    message: 'Recruit companions to join your party and fight alongside you.',
    position: 'top',
  },
  {
    id: 'status-effects',
    trigger: 'first-status-effect',
    title: 'Status Effects',
    message: 'Buffs and debuffs steer the battle, and many fade after a few turns.',
    position: 'top',
  },
  {
    id: 'abilities-intro',
    trigger: 'first-ability-use',
    title: 'Special Abilities',
    message: 'MP abilities unleash elemental damage or effects—target enemy weaknesses.',
    position: 'top',
  },
];

const TUTORIAL_STORAGE_KEY = 'aiVillageRpg_tutorialState';

export function persistTutorialState(tutorialState) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(tutorialState));
    }
  } catch (_e) {
    // localStorage may be unavailable in private browsing
  }
}

export function loadPersistedTutorialState() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.completedSteps)) {
          return parsed;
        }
      }
    }
  } catch (_e) {
    // ignore parse errors
  }
  return null;
}

export function createTutorialState() {
  const persisted = loadPersistedTutorialState();
  if (persisted) {
    return {
      completedSteps: persisted.completedSteps || [],
      currentHint: null,
      hintsEnabled: persisted.hintsEnabled !== false,
    };
  }
  return {
    completedSteps: [],
    currentHint: null,
    hintsEnabled: true,
  };
}

export function getTutorialHint(tutorialState, triggerEvent) {
  if (!tutorialState || tutorialState.hintsEnabled === false) {
    return null;
  }

  const step = TUTORIAL_STEPS.find((s) => s.trigger === triggerEvent);
  if (!step) return null;
  if (tutorialState.completedSteps.includes(step.id)) return null;
  return step;
}

export function completeTutorialStep(tutorialState, stepId) {
  if (!tutorialState || tutorialState.completedSteps.includes(stepId)) {
    return tutorialState;
  }

  return {
    ...tutorialState,
    completedSteps: [...tutorialState.completedSteps, stepId],
    currentHint: null,
  };
}

export function dismissCurrentHint(tutorialState) {
  if (!tutorialState) {
    return tutorialState;
  }

  return {
    ...tutorialState,
    currentHint: null,
  };
}

export function showHint(tutorialState, stepId) {
  if (!tutorialState) {
    return tutorialState;
  }

  const step = TUTORIAL_STEPS.find((entry) => entry.id === stepId);
  if (!step) {
    return tutorialState;
  }

  return {
    ...tutorialState,
    currentHint: step,
  };
}

export function resetTutorial() {
  return createTutorialState();
}

export function getTutorialProgress(tutorialState) {
  const total = TUTORIAL_STEPS.length;
  const completed = tutorialState ? tutorialState.completedSteps.length : 0;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
  };
}
