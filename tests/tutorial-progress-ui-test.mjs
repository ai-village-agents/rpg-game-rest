import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  TUTORIAL_STEPS,
  createTutorialState,
  getTutorialProgress,
  resetTutorial,
} from '../src/tutorial.js';
import {
  getTutorialProgressStyles,
  renderTutorialProgressPanel,
  attachTutorialProgressHandlers,
} from '../src/tutorial-progress-ui.js';

describe('getTutorialProgressStyles', () => {
  it('returns a non-empty CSS string', () => {
    const styles = getTutorialProgressStyles();
    assert.ok(typeof styles === 'string');
    assert.ok(styles.length > 100);
    assert.ok(styles.includes('.tutorial-progress-overlay'));
  });

  it('contains expected CSS class definitions', () => {
    const styles = getTutorialProgressStyles();
    assert.ok(styles.includes('.tutorial-progress-bar-fill'));
    assert.ok(styles.includes('.tutorial-step-item'));
    assert.ok(styles.includes('@keyframes tutorialProgressFadeIn'));
  });
});

describe('renderTutorialProgressPanel', () => {
  it('returns HTML string for given tutorial state', () => {
    const state = createTutorialState();
    const html = renderTutorialProgressPanel(state);
    assert.ok(typeof html === 'string');
    assert.ok(html.includes('Tutorial Progress'));
    assert.ok(html.includes('tutorial-progress-overlay'));
  });

  it('includes progress percentage and step count', () => {
    const state = createTutorialState();
    const progress = getTutorialProgress(state);
    const html = renderTutorialProgressPanel(state);
    assert.ok(html.includes(`${progress.percentage}%`));
    assert.ok(html.includes('0/' + TUTORIAL_STEPS.length + ' steps'));
  });

  it('shows all tutorial steps in list', () => {
    const state = createTutorialState();
    const html = renderTutorialProgressPanel(state);
    for (const step of TUTORIAL_STEPS.slice(0, 3)) {
      assert.ok(html.includes(step.title));
    }
  });

  it('marks completed steps correctly', () => {
    const state = {
      ...createTutorialState(),
      completedSteps: [TUTORIAL_STEPS[0].id, TUTORIAL_STEPS[1].id],
    };
    const html = renderTutorialProgressPanel(state);
    assert.ok(html.includes('completed'));
    const progress = getTutorialProgress(state);
    assert.ok(html.includes(`${progress.percentage}%`));
  });

  it('marks current hint step correctly', () => {
    const state = {
      ...createTutorialState(),
      currentHint: TUTORIAL_STEPS[2],
    };
    const html = renderTutorialProgressPanel(state);
    assert.ok(html.includes('current'));
  });

  it('shows hints disabled state', () => {
    const state = {
      ...createTutorialState(),
      hintsEnabled: false,
    };
    const html = renderTutorialProgressPanel(state);
    assert.ok(html.includes('Tutorial hints are disabled'));
    assert.ok(html.includes('Re‑enable Hints'));
  });

  it('shows hints enabled state', () => {
    const state = {
      ...createTutorialState(),
      hintsEnabled: true,
    };
    const html = renderTutorialProgressPanel(state);
    assert.ok(html.includes('Tutorial hints are currently enabled'));
    assert.ok(html.includes('Hints Enabled'));
  });
});

describe('attachTutorialProgressHandlers', () => {
  let mockDispatch;
  let originalDocument;

  beforeEach(() => {
    mockDispatch = (action) => {};
    originalDocument = global.document;
    global.document = {
      getElementById: (id) => null,
    };
  });

  afterEach(() => {
    global.document = originalDocument;
  });

  it('does not throw when elements not found', () => {
    assert.doesNotThrow(() => attachTutorialProgressHandlers(mockDispatch));
  });

  it('attaches close button handler', () => {
    let capturedAction = null;
    const mockDispatch = (action) => { capturedAction = action; };
    let clicked = false;
    const mockButton = {
      addEventListener: (event, handler) => {
        if (event === 'click') {
          clicked = true;
          handler();
        }
      },
    };
    global.document.getElementById = (id) => {
      if (id === 'btnTutorialProgressClose') return mockButton;
      return null;
    };
    attachTutorialProgressHandlers(mockDispatch);
    assert.ok(clicked);
    assert.equal(capturedAction.type, 'CLOSE_TUTORIAL_PROGRESS');
  });

  it('attaches re-enable hints button handler', () => {
    let capturedAction = null;
    const mockDispatch = (action) => { capturedAction = action; };
    let clicked = false;
    const mockButton = {
      disabled: false,
      addEventListener: (event, handler) => {
        if (event === 'click') {
          clicked = true;
          handler();
        }
      },
    };
    global.document.getElementById = (id) => {
      if (id === 'btnTutorialReenableHints') return mockButton;
      return null;
    };
    attachTutorialProgressHandlers(mockDispatch);
    assert.ok(clicked);
    assert.equal(capturedAction.type, 'TUTORIAL_REENABLE_HINTS');
  });

  it('does not attach handler if re-enable button is disabled', () => {
    let clicked = false;
    const mockButton = {
      disabled: true,
      addEventListener: (event, handler) => {
        if (event === 'click') clicked = true;
      },
    };
    global.document.getElementById = (id) => {
      if (id === 'btnTutorialReenableHints') return mockButton;
      return null;
    };
    attachTutorialProgressHandlers(() => {});
    assert.equal(clicked, false);
  });

  it('attaches reset tutorial button handler with confirmation', () => {
    let capturedAction = null;
    const mockDispatch = (action) => { capturedAction = action; };
    let clicked = false;
    const mockButton = {
      addEventListener: (event, handler) => {
        if (event === 'click') {
          clicked = true;
          // Simulate confirm returning true
          global.confirm = () => true;
          handler();
        }
      },
    };
    global.document.getElementById = (id) => {
      if (id === 'btnTutorialReset') return mockButton;
      return null;
    };
    global.confirm = () => true;
    attachTutorialProgressHandlers(mockDispatch);
    assert.ok(clicked);
    assert.equal(capturedAction.type, 'TUTORIAL_RESET');
  });

  it('does not dispatch reset if confirmation is canceled', () => {
    let capturedAction = null;
    const mockDispatch = (action) => { capturedAction = action; };
    let clicked = false;
    const mockButton = {
      addEventListener: (event, handler) => {
        if (event === 'click') {
          clicked = true;
          // Simulate confirm returning false
          global.confirm = () => false;
          handler();
        }
      },
    };
    global.document.getElementById = (id) => {
      if (id === 'btnTutorialReset') return mockButton;
      return null;
    };
    attachTutorialProgressHandlers(mockDispatch);
    assert.ok(clicked);
    assert.equal(capturedAction, null);
  });

  it('attaches overlay click handler', () => {
    let capturedAction = null;
    const mockDispatch = (action) => { capturedAction = action; };
    let clicked = false;
    const mockOverlay = {
      addEventListener: (event, handler) => {
        if (event === 'click') {
          clicked = true;
          // Simulate click on overlay itself
          const mockEvent = { target: mockOverlay };
          handler(mockEvent);
        }
      },
    };
    global.document.getElementById = (id) => {
      if (id === 'tutorialProgressOverlay') return mockOverlay;
      return null;
    };
    attachTutorialProgressHandlers(mockDispatch);
    assert.ok(clicked);
    assert.equal(capturedAction.type, 'CLOSE_TUTORIAL_PROGRESS');
  });

  it('does not close on click inside modal', () => {
    let capturedAction = null;
    const mockDispatch = (action) => { capturedAction = action; };
    let clicked = false;
    const mockOverlay = {
      addEventListener: (event, handler) => {
        if (event === 'click') {
          clicked = true;
          // Simulate click on child element
          const mockEvent = { target: { someChild: true } };
          handler(mockEvent);
        }
      },
    };
    global.document.getElementById = (id) => {
      if (id === 'tutorialProgressOverlay') return mockOverlay;
      return null;
    };
    attachTutorialProgressHandlers(mockDispatch);
    assert.ok(clicked);
    assert.equal(capturedAction, null);
  });
});

console.log('\\nTutorial Progress UI tests completed.');
