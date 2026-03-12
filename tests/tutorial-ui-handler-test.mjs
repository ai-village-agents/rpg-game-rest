import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleUIAction } from '../src/handlers/ui-handler.js';
import { createTutorialState } from '../src/tutorial.js';

describe('Tutorial UI Action Handlers', () => {
  let baseState;

  beforeEach(() => {
    baseState = {
      tutorialState: createTutorialState(),
      ui: {
        tutorialProgressVisible: false,
      },
    };
  });

  describe('VIEW_TUTORIAL_PROGRESS', () => {
    it('sets tutorialProgressVisible to true', () => {
      const action = { type: 'VIEW_TUTORIAL_PROGRESS' };
      const nextState = handleUIAction(baseState, action);
      assert.ok(nextState);
      assert.equal(nextState.ui.tutorialProgressVisible, true);
      assert.deepEqual(nextState.tutorialState, baseState.tutorialState);
    });

    it('returns null if tutorialState is missing', () => {
      const stateWithoutTutorial = { ...baseState, tutorialState: null };
      const action = { type: 'VIEW_TUTORIAL_PROGRESS' };
      const nextState = handleUIAction(stateWithoutTutorial, action);
      assert.equal(nextState, null);
    });
  });

  describe('CLOSE_TUTORIAL_PROGRESS', () => {
    it('sets tutorialProgressVisible to false', () => {
      const stateWithVisible = {
        ...baseState,
        ui: { ...baseState.ui, tutorialProgressVisible: true },
      };
      const action = { type: 'CLOSE_TUTORIAL_PROGRESS' };
      const nextState = handleUIAction(stateWithVisible, action);
      assert.ok(nextState);
      assert.equal(nextState.ui.tutorialProgressVisible, false);
    });

    it('works when already false', () => {
      const action = { type: 'CLOSE_TUTORIAL_PROGRESS' };
      const nextState = handleUIAction(baseState, action);
      assert.ok(nextState);
      assert.equal(nextState.ui.tutorialProgressVisible, false);
    });
  });

  describe('TUTORIAL_REENABLE_HINTS', () => {
    it('sets hintsEnabled to true', () => {
      const stateWithDisabled = {
        ...baseState,
        tutorialState: {
          ...baseState.tutorialState,
          hintsEnabled: false,
        },
      };
      const action = { type: 'TUTORIAL_REENABLE_HINTS' };
      const nextState = handleUIAction(stateWithDisabled, action);
      assert.ok(nextState);
      assert.equal(nextState.tutorialState.hintsEnabled, true);
      assert.deepEqual(nextState.ui, baseState.ui);
    });

    it('returns null if tutorialState is missing', () => {
      const stateWithoutTutorial = { ...baseState, tutorialState: null };
      const action = { type: 'TUTORIAL_REENABLE_HINTS' };
      const nextState = handleUIAction(stateWithoutTutorial, action);
      assert.equal(nextState, null);
    });

    it('does nothing if hints already enabled', () => {
      const action = { type: 'TUTORIAL_REENABLE_HINTS' };
      const nextState = handleUIAction(baseState, action);
      assert.ok(nextState);
      assert.equal(nextState.tutorialState.hintsEnabled, true);
    });
  });

  describe('TUTORIAL_RESET', () => {
    it('resets tutorial state to fresh state', () => {
      const stateWithProgress = {
        ...baseState,
        tutorialState: {
          ...baseState.tutorialState,
          completedSteps: ['welcome', 'combat-intro'],
          hintsEnabled: false,
          currentHint: { id: 'some-hint' },
        },
      };
      const action = { type: 'TUTORIAL_RESET' };
      const nextState = handleUIAction(stateWithProgress, action);
      assert.ok(nextState);
      assert.equal(nextState.tutorialState.completedSteps.length, 0);
      assert.equal(nextState.tutorialState.hintsEnabled, true);
      assert.equal(nextState.tutorialState.currentHint, null);
      assert.deepEqual(nextState.ui, baseState.ui);
    });

    it('returns null if tutorialState is missing', () => {
      const stateWithoutTutorial = { ...baseState, tutorialState: null };
      const action = { type: 'TUTORIAL_RESET' };
      const nextState = handleUIAction(stateWithoutTutorial, action);
      assert.equal(nextState, null);
    });
  });

  describe('Edge Cases', () => {
    it('returns null for unknown action type', () => {
      const action = { type: 'UNKNOWN_ACTION' };
      const nextState = handleUIAction(baseState, action);
      assert.equal(nextState, null);
    });

    it('preserves other state fields', () => {
      const stateWithExtra = {
        ...baseState,
        player: { name: 'Hero' },
        inventory: { gold: 100 },
      };
      const action = { type: 'VIEW_TUTORIAL_PROGRESS' };
      const nextState = handleUIAction(stateWithExtra, action);
      assert.ok(nextState);
      assert.deepEqual(nextState.player, stateWithExtra.player);
      assert.deepEqual(nextState.inventory, stateWithExtra.inventory);
      assert.equal(nextState.ui.tutorialProgressVisible, true);
    });
  });
});

console.log('Tutorial UI Handler tests completed.');
