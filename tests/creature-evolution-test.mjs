import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  EVOLUTION_STAGES,
  EVOLUTION_TRAITS,
  createSporeling,
  canEvolve,
  getNextStage,
  evolveSporeling,
  awardEvolutionPoints,
  recruitSporeling,
  getSporeling,
  getAvailableTraits,
  getEvolutionProgress,
} from '../src/creature-evolution.js';

describe('Creature Evolution System (Spore-inspired)', () => {
  describe('EVOLUTION_STAGES', () => {
    it('should have 5 evolution stages', () => {
      const stages = Object.keys(EVOLUTION_STAGES);
      assert.strictEqual(stages.length, 5);
      assert.deepStrictEqual(stages, ['CELL', 'CREATURE', 'TRIBAL', 'CIVILIZED', 'COSMIC']);
    });

    it('each stage should have required properties', () => {
      for (const [key, stage] of Object.entries(EVOLUTION_STAGES)) {
        assert.ok(stage.name, `${key} should have a name`);
        assert.ok(stage.description, `${key} should have a description`);
        assert.ok(stage.baseStats, `${key} should have baseStats`);
        assert.strictEqual(typeof stage.evolutionPointsRequired, 'number');
      }
    });

    it('evolution points requirements should increase with each stage', () => {
      const stages = Object.values(EVOLUTION_STAGES);
      for (let i = 1; i < stages.length; i++) {
        assert.ok(
          stages[i].evolutionPointsRequired > stages[i - 1].evolutionPointsRequired,
          'Each stage should require more evolution points than the previous'
        );
      }
    });
  });

  describe('EVOLUTION_TRAITS', () => {
    it('should have at least 9 traits across 3 categories', () => {
      const traits = Object.values(EVOLUTION_TRAITS);
      assert.ok(traits.length >= 9);

      const categories = new Set(traits.map((t) => t.category));
      assert.ok(categories.has('offense'));
      assert.ok(categories.has('defense'));
      assert.ok(categories.has('utility'));
    });

    it('each trait should have required properties', () => {
      for (const [key, trait] of Object.entries(EVOLUTION_TRAITS)) {
        assert.ok(trait.name, `${key} should have a name`);
        assert.ok(trait.category, `${key} should have a category`);
        assert.ok(trait.effect, `${key} should have an effect`);
        assert.ok(trait.description, `${key} should have a description`);
      }
    });
  });

  describe('createSporeling', () => {
    it('should create a sporeling with default name', () => {
      const sporeling = createSporeling();
      assert.strictEqual(sporeling.name, 'Sporeling');
      assert.strictEqual(sporeling.type, 'EVOLVING_CREATURE');
      assert.strictEqual(sporeling.stage, 'CELL');
      assert.strictEqual(sporeling.evolutionPoints, 0);
      assert.deepStrictEqual(sporeling.traits, []);
    });

    it('should create a sporeling with custom name', () => {
      const sporeling = createSporeling('Zyx');
      assert.strictEqual(sporeling.name, 'Zyx');
    });

    it('should initialize stats from CELL stage', () => {
      const sporeling = createSporeling();
      const cellStats = EVOLUTION_STAGES.CELL.baseStats;
      assert.strictEqual(sporeling.stats.hp, cellStats.hp);
      assert.strictEqual(sporeling.stats.attack, cellStats.attack);
      assert.strictEqual(sporeling.hp, cellStats.hp);
      assert.strictEqual(sporeling.maxHp, cellStats.hp);
    });
  });

  describe('canEvolve', () => {
    it('should return false for CELL stage with 0 points', () => {
      const sporeling = createSporeling();
      assert.strictEqual(canEvolve(sporeling), false);
    });

    it('should return true when enough points for next stage', () => {
      const sporeling = createSporeling();
      sporeling.evolutionPoints = 50; // CREATURE requires 50
      assert.strictEqual(canEvolve(sporeling), true);
    });

    it('should return false for max stage', () => {
      const sporeling = createSporeling();
      sporeling.stage = 'COSMIC';
      sporeling.evolutionPoints = 9999;
      assert.strictEqual(canEvolve(sporeling), false);
    });
  });

  describe('getNextStage', () => {
    it('should return CREATURE for CELL stage', () => {
      const sporeling = createSporeling();
      assert.strictEqual(getNextStage(sporeling), 'CREATURE');
    });

    it('should return null for COSMIC stage', () => {
      const sporeling = createSporeling();
      sporeling.stage = 'COSMIC';
      assert.strictEqual(getNextStage(sporeling), null);
    });
  });

  describe('evolveSporeling', () => {
    it('should evolve sporeling with selected trait', () => {
      const sporeling = createSporeling();
      sporeling.evolutionPoints = 50;
      const state = { companions: [sporeling], log: [] };

      const nextState = evolveSporeling(state, 'SHARP_CLAWS');
      const evolved = getSporeling(nextState);

      assert.strictEqual(evolved.stage, 'CREATURE');
      assert.ok(evolved.traits.includes('SHARP_CLAWS'));
      assert.ok(nextState.log.some((l) => l.includes('evolved')));
    });

    it('should reject evolution if cannot evolve', () => {
      const sporeling = createSporeling();
      sporeling.evolutionPoints = 0;
      const state = { companions: [sporeling], log: [] };

      const nextState = evolveSporeling(state, 'SHARP_CLAWS');
      const notEvolved = getSporeling(nextState);

      assert.strictEqual(notEvolved.stage, 'CELL');
    });

    it('should apply trait stat bonuses', () => {
      const sporeling = createSporeling();
      sporeling.evolutionPoints = 50;
      const state = { companions: [sporeling], log: [] };

      const nextState = evolveSporeling(state, 'SHARP_CLAWS');
      const evolved = getSporeling(nextState);

      // CREATURE base attack (5) + SHARP_CLAWS bonus (3) = 8
      assert.strictEqual(evolved.stats.attack, 8);
    });
  });

  describe('awardEvolutionPoints', () => {
    it('should add points to sporeling', () => {
      const sporeling = createSporeling();
      const state = { companions: [sporeling], log: [] };

      const nextState = awardEvolutionPoints(state, 25);
      const updated = getSporeling(nextState);

      assert.strictEqual(updated.evolutionPoints, 25);
      assert.ok(nextState.log.some((l) => l.includes('25 evolution points')));
    });
  });

  describe('recruitSporeling', () => {
    it('should add sporeling to companions', () => {
      const state = { companions: [], log: [] };
      const nextState = recruitSporeling(state, 'Blob');

      assert.strictEqual(nextState.companions.length, 1);
      assert.strictEqual(nextState.companions[0].name, 'Blob');
      assert.ok(nextState.log.some((l) => l.includes('joined')));
    });

    it('should reject if already have sporeling', () => {
      const state = { companions: [createSporeling()], log: [] };
      const nextState = recruitSporeling(state, 'Another');

      assert.strictEqual(nextState.companions.length, 1);
      assert.ok(nextState.log.some((l) => l.includes('already have')));
    });
  });

  describe('getAvailableTraits', () => {
    it('should return all traits for fresh sporeling', () => {
      const sporeling = createSporeling();
      const available = getAvailableTraits(sporeling);
      assert.strictEqual(available.length, Object.keys(EVOLUTION_TRAITS).length);
    });

    it('should exclude already selected traits', () => {
      const sporeling = createSporeling();
      sporeling.traits = ['SHARP_CLAWS', 'THICK_HIDE'];
      const available = getAvailableTraits(sporeling);
      assert.strictEqual(available.length, Object.keys(EVOLUTION_TRAITS).length - 2);
      assert.ok(!available.some((t) => t.id === 'SHARP_CLAWS'));
    });
  });

  describe('getEvolutionProgress', () => {
    it('should return progress info for sporeling', () => {
      const sporeling = createSporeling();
      sporeling.evolutionPoints = 30;
      const progress = getEvolutionProgress(sporeling);

      assert.strictEqual(progress.currentStage, 'Cell');
      assert.strictEqual(progress.evolutionPoints, 30);
      assert.strictEqual(progress.pointsNeeded, 50);
      assert.strictEqual(progress.canEvolve, false);
      assert.strictEqual(progress.isMaxStage, false);
    });

    it('should indicate max stage for COSMIC', () => {
      const sporeling = createSporeling();
      sporeling.stage = 'COSMIC';
      const progress = getEvolutionProgress(sporeling);

      assert.strictEqual(progress.currentStage, 'Cosmic');
      assert.strictEqual(progress.isMaxStage, true);
      assert.strictEqual(progress.pointsNeeded, null);
    });
  });
});
