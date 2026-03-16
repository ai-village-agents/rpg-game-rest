import test from 'node:test';
import assert from 'node:assert';
import { render } from '../src/render.js';

class ElementMock {
  constructor(id, document) {
    this.id = id || null;
    this.document = document;
    this.children = [];
    this.dataset = {};
    this.classList = { add: () => {} };
    this.buttons = [];
    this.onclick = null;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.buttons = [];

    if (html && html.includes('btnCloseQuests')) {
      const closeBtn = new ElementMock('btnCloseQuests', this.document);
      this.children.push(closeBtn);
      this.document.registerElement(closeBtn);
    }

    const matches = [...(html || '').matchAll(/class="quest-accept-btn" data-quest-id="([^"]+)"/g)];
    this.buttons = matches.map(([, questId]) => {
      const btn = new ElementMock(null, this.document);
      btn.dataset = { questId };
      return btn;
    });
  }

  get innerHTML() {
    return this._innerHTML;
  }

  appendChild(el) {
    this.children.push(el);
    if (el.id) this.document.registerElement(el);
    return el;
  }

  querySelectorAll(selector) {
    if (selector === '.quest-accept-btn') return this.buttons || [];
    return [];
  }

  remove() {
    // no-op for tests
  }
}

class DocumentMock {
  constructor() {
    this.elements = {};
    this.head = new ElementMock('head', this);
    this.body = new ElementMock('body', this);
    this.registerElement(this.head);
    this.registerElement(this.body);
    this.registerElement(new ElementMock('hud', this));
    this.registerElement(new ElementMock('actions', this));
    this.registerElement(new ElementMock('log', this));
  }

  createElement(tagName) {
    return new ElementMock(null, this);
  }

  registerElement(el) {
    if (el?.id) {
      this.elements[el.id] = el;
    }
    return el;
  }

  getElementById(id) {
    if (id === 'quest-filter' || id === 'quest-sort' || id === 'quest-sort-dir') {
      return null;
    }
    return this.elements[id] || null;
  }
}

test('quests UI wiring is guarded when filter controls are missing', () => {
  const originalDocument = globalThis.document;
  const mockDocument = new DocumentMock();
  globalThis.document = mockDocument;

  const dispatches = [];
  const dispatch = (action) => dispatches.push(action);

  const state = {
    phase: 'quests',
    world: { roomRow: 1, roomCol: 1 },
    questState: { activeQuests: [], completedQuests: [], questProgress: {} },
    questUiState: { sortBy: 'name', sortOrder: 'asc', filter: 'available' },
    log: [],
  };

  try {
    assert.doesNotThrow(() => render(state, dispatch));

    const closeBtn = mockDocument.getElementById('btnCloseQuests');
    assert.ok(closeBtn, 'close quests button should exist');
    assert.strictEqual(typeof closeBtn.onclick, 'function', 'close quests handler should be wired');

    const hud = mockDocument.getElementById('hud');
    const questButtons = hud.querySelectorAll('.quest-accept-btn');
    assert.ok(questButtons.length > 0, 'quest accept buttons should be rendered in hud');
    assert.strictEqual(typeof questButtons[0].onclick, 'function', 'quest accept button should have onclick');

    closeBtn.onclick();
    questButtons[0].onclick();

    assert.deepStrictEqual(dispatches[0], { type: 'CLOSE_QUESTS' });
    assert.deepStrictEqual(dispatches[1], { type: 'ACCEPT_QUEST', questId: questButtons[0].dataset.questId });
  } finally {
    if (originalDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = originalDocument;
    }
  }
});
