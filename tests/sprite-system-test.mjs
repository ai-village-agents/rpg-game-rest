import { test } from 'node:test';
import assert from 'assert';

// Minimal DOM mock for Node.js test environment
class MockElement {
  constructor(tag) {
    this.tagName = tag;
    this.className = '';
    this.style = { cssText: '' };
    this.textContent = '';
    this._children = [];
    this._listeners = {};
  }
  appendChild(child) { this._children.push(child); return child; }
  querySelector(sel) {
    const cls = sel.startsWith('.') ? sel.slice(1) : null;
    for (const c of this._children) {
      if (cls && c.className && c.className.split(' ').includes(cls)) return c;
      const found = c.querySelector && c.querySelector(sel);
      if (found) return found;
    }
    return null;
  }
  querySelectorAll(sel) {
    const results = [];
    const cls = sel === 'div' ? null : (sel.startsWith('.') ? sel.slice(1) : null);
    const isTag = !sel.startsWith('.');
    for (const c of this._children) {
      if (isTag && c.tagName === sel.toUpperCase()) results.push(c);
      if (cls && c.className && c.className.split(' ').includes(cls)) results.push(c);
      if (c.querySelectorAll) results.push(...c.querySelectorAll(sel));
    }
    return results;
  }
  addEventListener(event, fn) { this._listeners[event] = fn; }
  get onmouseenter() { return this._listeners['mouseenter'] || null; }
  get onmouseleave() { return this._listeners['mouseleave'] || null; }
}

class MockDocument {
  constructor() { this.head = new MockElement('head'); this._styles = []; }
  createElement(tag) { return new MockElement(tag.toUpperCase()); }
  querySelectorAll(sel) {
    if (sel === 'style') return this._styles;
    return [];
  }
}

// Install global mock
global.document = new MockDocument();

import { SpriteSystem, injectSpriteAnimations } from '../src/sprite-system.js';

// --- SpriteSystem constructor ---
test('SpriteSystem instantiates with elementColors and classAuras', () => {
  const ss = new SpriteSystem();
  assert.ok(ss.elementColors, 'has elementColors');
  assert.ok(ss.classAuras, 'has classAuras');
  assert.ok(ss.spriteCache instanceof Map, 'has spriteCache Map');
});

// --- elementColors ---
test('elementColors has all expected elements', () => {
  const ss = new SpriteSystem();
  const elements = ['fire', 'ice', 'lightning', 'holy', 'shadow', 'nature', 'physical'];
  for (const el of elements) {
    assert.ok(ss.elementColors[el], `has color for ${el}`);
  }
});

test('elementColors values are valid hex codes', () => {
  const ss = new SpriteSystem();
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  for (const [el, color] of Object.entries(ss.elementColors)) {
    assert.match(color, hexRegex, `${el} color is valid hex: ${color}`);
  }
});

// --- classAuras ---
test('classAuras has aura for each class', () => {
  const ss = new SpriteSystem();
  const classes = ['warrior', 'mage', 'rogue', 'cleric'];
  for (const cls of classes) {
    assert.ok(ss.classAuras[cls], `has aura for ${cls}`);
    assert.ok(ss.classAuras[cls].color, `${cls} has color`);
    assert.ok(ss.classAuras[cls].glow, `${cls} has glow`);
  }
});

// --- getClassIcon ---
test('getClassIcon returns string for each class', () => {
  const ss = new SpriteSystem();
  const classes = ['warrior', 'mage', 'rogue', 'cleric'];
  for (const cls of classes) {
    const icon = ss.getClassIcon(cls);
    assert.strictEqual(typeof icon, 'string', `${cls} icon is string`);
  }
});

test('getClassIcon returns default string for unknown class', () => {
  const ss = new SpriteSystem();
  assert.strictEqual(typeof ss.getClassIcon('unknown'), 'string');
});

// --- getEnemyIcon ---
test('getEnemyIcon handles skeleton/undead', () => {
  const ss = new SpriteSystem();
  const icon = ss.getEnemyIcon('Skeleton', 'physical');
  assert.strictEqual(typeof icon, 'string');
});

test('getEnemyIcon handles dragon', () => {
  const ss = new SpriteSystem();
  assert.strictEqual(typeof ss.getEnemyIcon('Fire Dragon', 'fire'), 'string');
});

test('getEnemyIcon handles elementals for each element', () => {
  const ss = new SpriteSystem();
  for (const el of ['fire', 'ice', 'lightning', 'nature']) {
    const icon = ss.getEnemyIcon(`${el} Elemental`, el);
    assert.strictEqual(typeof icon, 'string', `${el} elemental icon is string`);
  }
});

test('getEnemyIcon returns string for unknown type', () => {
  const ss = new SpriteSystem();
  assert.strictEqual(typeof ss.getEnemyIcon('Unknown', 'physical'), 'string');
});

// --- getActionIcon ---
test('getActionIcon returns string for all action types', () => {
  const ss = new SpriteSystem();
  for (const type of ['attack', 'defend', 'spell', 'ability', 'heal', 'item', 'unknown']) {
    assert.strictEqual(typeof ss.getActionIcon(type), 'string', `${type} icon is string`);
  }
});

// --- createCharacterPortrait ---
test('createCharacterPortrait creates element with correct className', () => {
  const ss = new SpriteSystem();
  const portrait = ss.createCharacterPortrait({ name: 'Hero', class: 'warrior' });
  assert.ok(portrait, 'portrait created');
  assert.strictEqual(portrait.className, 'character-portrait-container');
});

test('createCharacterPortrait includes warrior aura color', () => {
  const ss = new SpriteSystem();
  const portrait = ss.createCharacterPortrait({ name: 'Hero', class: 'warrior' });
  assert.ok(portrait.style.cssText.includes('DC143C'), 'warrior red color present');
});

test('createCharacterPortrait applies aura color for each class', () => {
  const ss = new SpriteSystem();
  for (const cls of ['warrior', 'mage', 'rogue', 'cleric']) {
    const portrait = ss.createCharacterPortrait({ name: 'T', class: cls });
    const color = ss.classAuras[cls].color.replace('#', '');
    assert.ok(portrait.style.cssText.includes(color), `${cls} aura color in cssText`);
  }
});

// --- createEnemySprite ---
test('createEnemySprite creates element with correct className', () => {
  const ss = new SpriteSystem();
  const sprite = ss.createEnemySprite({ name: 'Goblin', type: 'goblin', element: 'physical' });
  assert.strictEqual(sprite.className, 'enemy-sprite-container');
});

test('createEnemySprite includes element color for fire', () => {
  const ss = new SpriteSystem();
  const sprite = ss.createEnemySprite({ name: 'Fire Dragon', type: 'dragon', element: 'fire' });
  const allCss = sprite.style.cssText + sprite._children.map(c => c.style.cssText).join('');
  assert.ok(allCss.includes('FF6B35'), 'fire color in sprite or child cssText');
});

test('createEnemySprite includes correct element colors for all elements', () => {
  const ss = new SpriteSystem();
  for (const [el, color] of Object.entries(ss.elementColors)) {
    const sprite = ss.createEnemySprite({ name: 'T', type: 'test', element: el });
    const allCss = sprite.style.cssText + sprite._children.map(c => c.style.cssText).join('');
    const colorHex = color.replace('#', '');
    assert.ok(allCss.includes(colorHex), `${el} color ${color} in sprite or child cssText`);
  }
});

// --- createStatusEffectOverlay ---
test('createStatusEffectOverlay creates element with correct className', () => {
  const ss = new SpriteSystem();
  const overlay = ss.createStatusEffectOverlay('poison', 3);
  assert.ok(overlay.className.includes('status-effect-overlay'));
});

test('createStatusEffectOverlay includes effect name in textContent', () => {
  const ss = new SpriteSystem();
  const overlay = ss.createStatusEffectOverlay('burn', 5);
  assert.ok(overlay.textContent.includes('burn'), 'textContent includes effect name');
});

test('createStatusEffectOverlay shows duration when provided', () => {
  const ss = new SpriteSystem();
  const overlay = ss.createStatusEffectOverlay('stun', 4);
  assert.ok(overlay.textContent.includes('(4)'), 'duration shown');
});

test('createStatusEffectOverlay omits duration when not provided', () => {
  const ss = new SpriteSystem();
  const overlay = ss.createStatusEffectOverlay('weak');
  assert.ok(!overlay.textContent.includes('('), 'no duration shown');
});

test('createStatusEffectOverlay handles all effect types', () => {
  const ss = new SpriteSystem();
  for (const effect of ['poison', 'burn', 'freeze', 'stun', 'bleed', 'weak', 'strong']) {
    const overlay = ss.createStatusEffectOverlay(effect);
    assert.ok(overlay.style.cssText, `${effect} has cssText`);
  }
});

// --- createActionCard ---
test('createActionCard creates element with className action-card', () => {
  const ss = new SpriteSystem();
  const card = ss.createActionCard({ name: 'Attack', type: 'attack' });
  assert.strictEqual(card.className, 'action-card');
});

test('createActionCard has event listeners', () => {
  const ss = new SpriteSystem();
  const card = ss.createActionCard({ name: 'Defend', type: 'defend' });
  assert.ok(card.onmouseenter, 'has mouseenter handler');
  assert.ok(card.onmouseleave, 'has mouseleave handler');
});

// --- injectSpriteAnimations ---
test('injectSpriteAnimations injects a style element', () => {
  const before = global.document._styles.length;
  const mockStyle = new MockElement('style');
  const origCreate = global.document.createElement.bind(global.document);
  global.document.createElement = (tag) => {
    if (tag === 'style') {
      global.document._styles.push(mockStyle);
      return mockStyle;
    }
    return origCreate(tag);
  };
  injectSpriteAnimations();
  global.document.createElement = origCreate;
  assert.ok(global.document._styles.length > before, 'style element added');
});

test('injectSpriteAnimations style includes float-up keyframe', () => {
  const mockStyle = { textContent: '' };
  const origAppend = global.document.head.appendChild.bind(global.document.head);
  global.document.head.appendChild = (el) => {
    if (el && el.tagName === 'STYLE') { mockStyle.textContent = el.textContent; }
    return origAppend(el);
  };
  const s = new MockElement('style');
  const origCreate = global.document.createElement.bind(global.document);
  global.document.createElement = (tag) => {
    if (tag === 'style') return s;
    return origCreate(tag);
  };
  injectSpriteAnimations();
  global.document.createElement = origCreate;
  assert.ok(s.textContent.includes('float-up'), 'includes float-up animation');
});

test('injectSpriteAnimations style includes element-glow keyframe', () => {
  const s = new MockElement('style');
  const origCreate = global.document.createElement.bind(global.document);
  global.document.createElement = (tag) => {
    if (tag === 'style') return s;
    return origCreate(tag);
  };
  injectSpriteAnimations();
  global.document.createElement = origCreate;
  assert.ok(s.textContent.includes('element-glow'), 'includes element-glow animation');
});
