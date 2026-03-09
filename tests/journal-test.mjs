/**
 * Journal/Adventure Log System Tests
 * Tests for src/journal.js and src/journal-ui.js
 * Created by Opus 4.5 (Claude Code) - Day 342
 */

import {
  JOURNAL_CATEGORIES,
  MAX_ENTRIES_PER_CATEGORY,
  createJournalEntry,
  initializeJournal,
  addJournalEntry,
  getEntriesByCategory,
  getImportantEntries,
  getRecentEntries,
  markAllRead,
  getUnreadCount,
  toggleEntryImportance,
  deleteJournalEntry,
  searchJournal,
  getEntryCounts,
  formatEntryTimestamp,
  logCombatVictory,
  logBossDefeat,
  logLocationDiscovery,
  logQuestComplete,
  logLevelUp,
  logItemDiscovery
} from '../src/journal.js';

import {
  renderJournalPanel,
  setJournalCategory,
  toggleImportantFilter,
  getCurrentCategory,
  isShowingImportantOnly,
  resetJournalFilters,
  renderJournalBadge
} from '../src/journal-ui.js';

import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertMatch(str, pattern, message) {
  if (!pattern.test(str)) {
    throw new Error(message || `String "${str}" did not match pattern`);
  }
}

console.log('\n📖 Journal System Tests\n');

// Categories tests
console.log('Journal Categories:');
test('defines all required categories', () => {
  assertEqual(JOURNAL_CATEGORIES.COMBAT, 'combat');
  assertEqual(JOURNAL_CATEGORIES.EXPLORATION, 'exploration');
  assertEqual(JOURNAL_CATEGORIES.QUESTS, 'quests');
  assertEqual(JOURNAL_CATEGORIES.DISCOVERIES, 'discoveries');
  assertEqual(JOURNAL_CATEGORIES.MILESTONES, 'milestones');
});

test('has max entries limit defined', () => {
  assertEqual(MAX_ENTRIES_PER_CATEGORY, 50);
});

// createJournalEntry tests
console.log('\ncreateJournalEntry:');
test('creates entry with required fields', () => {
  const entry = createJournalEntry('combat', 'Test Title', 'Test description');
  assertEqual(entry.category, 'combat');
  assertEqual(entry.title, 'Test Title');
  assertEqual(entry.description, 'Test description');
  assertMatch(entry.id, /^journal_/);
  assert(entry.timestamp, 'Should have timestamp');
});

test('includes metadata when provided', () => {
  const entry = createJournalEntry('quests', 'Quest Done', 'Completed', {
    turn: 42,
    location: 'Forest',
    isImportant: true
  });
  assertEqual(entry.turn, 42);
  assertEqual(entry.location, 'Forest');
  assertEqual(entry.isImportant, true);
});

test('uses defaults for missing metadata', () => {
  const entry = createJournalEntry('combat', 'Title', 'Desc');
  assertEqual(entry.turn, 0);
  assertEqual(entry.location, 'Unknown');
  assertEqual(entry.isImportant, false);
});

// initializeJournal tests
console.log('\ninitializeJournal:');
test('initializes empty journal in state', () => {
  const result = initializeJournal({});
  assert(result.journal, 'Should have journal');
  assertEqual(result.journal.entries.length, 0);
  assertEqual(result.journal.unreadCount, 0);
});

test('does not overwrite existing journal', () => {
  const state = { journal: { entries: [{ id: 'test' }], unreadCount: 5 } };
  const result = initializeJournal(state);
  assertEqual(result.journal.entries.length, 1);
  assertEqual(result.journal.unreadCount, 5);
});

// addJournalEntry tests
console.log('\naddJournalEntry:');
test('adds entry to journal', () => {
  let state = { turn: 10, currentRoom: 'Village', journal: { entries: [], unreadCount: 0 } };
  const result = addJournalEntry(state, 'combat', 'Victory', 'Won the fight');
  assertEqual(result.journal.entries.length, 1);
  assertEqual(result.journal.entries[0].title, 'Victory');
});

test('increments unread count', () => {
  let state = { journal: { entries: [], unreadCount: 0 } };
  const result = addJournalEntry(state, 'combat', 'Victory', 'Won');
  assertEqual(result.journal.unreadCount, 1);
});

test('adds entries at the beginning (newest first)', () => {
  let state = { journal: { entries: [], unreadCount: 0 } };
  state = addJournalEntry(state, 'combat', 'First', 'First entry');
  state = addJournalEntry(state, 'combat', 'Second', 'Second entry');
  assertEqual(state.journal.entries[0].title, 'Second');
  assertEqual(state.journal.entries[1].title, 'First');
});

// getEntriesByCategory tests
console.log('\ngetEntriesByCategory:');
test('filters by category', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'Combat 1', 'Desc');
  state = addJournalEntry(state, 'combat', 'Combat 2', 'Desc');
  state = addJournalEntry(state, 'quests', 'Quest 1', 'Desc');
  const combatEntries = getEntriesByCategory(state, 'combat');
  assertEqual(combatEntries.length, 2);
});

test('returns all entries for "all" category', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'C1', 'Desc');
  state = addJournalEntry(state, 'quests', 'Q1', 'Desc');
  const allEntries = getEntriesByCategory(state, 'all');
  assertEqual(allEntries.length, 2);
});

// getImportantEntries tests
console.log('\ngetImportantEntries:');
test('returns only important entries', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'Normal', 'Desc', { isImportant: false });
  state = addJournalEntry(state, 'milestones', 'Important', 'Desc', { isImportant: true });
  const important = getImportantEntries(state);
  assertEqual(important.length, 1);
  assertEqual(important[0].title, 'Important');
});

// markAllRead tests
console.log('\nmarkAllRead:');
test('resets unread count to zero', () => {
  let state = { turn: 5, journal: { entries: [], unreadCount: 10, lastViewedTurn: 0 } };
  state = markAllRead(state);
  assertEqual(state.journal.unreadCount, 0);
});

// toggleEntryImportance tests
console.log('\ntoggleEntryImportance:');
test('toggles isImportant flag', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'Test', 'Desc');
  const entryId = state.journal.entries[0].id;
  assertEqual(state.journal.entries[0].isImportant, false);
  state = toggleEntryImportance(state, entryId);
  assertEqual(state.journal.entries[0].isImportant, true);
});

// deleteJournalEntry tests
console.log('\ndeleteJournalEntry:');
test('removes entry by id', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'Keep', 'Desc');
  state = addJournalEntry(state, 'combat', 'Delete', 'Desc');
  const deleteId = state.journal.entries[0].id;
  state = deleteJournalEntry(state, deleteId);
  assertEqual(state.journal.entries.length, 1);
  assertEqual(state.journal.entries[0].title, 'Keep');
});

// searchJournal tests
console.log('\nsearchJournal:');
test('searches titles and descriptions', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'Dragon Fight', 'Defeated the dragon');
  state = addJournalEntry(state, 'exploration', 'Cave Found', 'Dark cave discovered');
  const results = searchJournal(state, 'dragon');
  assertEqual(results.length, 1);
});

test('is case insensitive', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'Dragon Fight', 'Battle');
  const results = searchJournal(state, 'DRAGON');
  assertEqual(results.length, 1);
});

// getEntryCounts tests
console.log('\ngetEntryCounts:');
test('counts entries by category', () => {
  let state = { journal: { entries: [] } };
  state = addJournalEntry(state, 'combat', 'C1', 'Desc');
  state = addJournalEntry(state, 'combat', 'C2', 'Desc');
  state = addJournalEntry(state, 'quests', 'Q1', 'Desc');
  const counts = getEntryCounts(state);
  assertEqual(counts.all, 3);
  assertEqual(counts.combat, 2);
  assertEqual(counts.quests, 1);
  assertEqual(counts.exploration, 0);
});

// Helper logging functions tests
console.log('\nHelper logging functions:');
test('logCombatVictory creates combat entry', () => {
  let state = { turn: 1, currentRoom: 'Test', journal: { entries: [], unreadCount: 0 } };
  state = logCombatVictory(state, 'Goblin', 50, 100);
  assertEqual(state.journal.entries[0].category, 'combat');
  assertEqual(state.journal.entries[0].title, 'Defeated Goblin');
});

test('logBossDefeat creates important entry', () => {
  let state = { turn: 1, journal: { entries: [], unreadCount: 0 } };
  state = logBossDefeat(state, 'Dragon King');
  assertEqual(state.journal.entries[0].isImportant, true);
});

test('logLocationDiscovery creates exploration entry', () => {
  let state = { turn: 1, journal: { entries: [], unreadCount: 0 } };
  state = logLocationDiscovery(state, 'Hidden Valley');
  assertEqual(state.journal.entries[0].category, 'exploration');
});

test('logQuestComplete creates quests entry', () => {
  let state = { turn: 1, journal: { entries: [], unreadCount: 0 } };
  state = logQuestComplete(state, 'Save the Village', '500 gold');
  assertEqual(state.journal.entries[0].category, 'quests');
});

test('logLevelUp creates milestones entry', () => {
  let state = { turn: 1, journal: { entries: [], unreadCount: 0 } };
  state = logLevelUp(state, 10);
  assertEqual(state.journal.entries[0].category, 'milestones');
  assertEqual(state.journal.entries[0].title, 'Reached Level 10');
});

test('logItemDiscovery marks rare items as important', () => {
  let state = { turn: 1, journal: { entries: [], unreadCount: 0 } };
  state = logItemDiscovery(state, 'Common Sword', 'common');
  assertEqual(state.journal.entries[0].isImportant, false);
  state = logItemDiscovery(state, 'Rare Armor', 'rare');
  assertEqual(state.journal.entries[0].isImportant, true);
});

// Journal UI tests
console.log('\nJournal UI:');
test('defaults to "all" category', () => {
  resetJournalFilters();
  assertEqual(getCurrentCategory(), 'all');
});

test('allows setting category filter', () => {
  resetJournalFilters();
  setJournalCategory('combat');
  assertEqual(getCurrentCategory(), 'combat');
});

test('toggles important filter', () => {
  resetJournalFilters();
  assertEqual(isShowingImportantOnly(), false);
  toggleImportantFilter();
  assertEqual(isShowingImportantOnly(), true);
});

test('renderJournalPanel returns HTML string', () => {
  resetJournalFilters();
  const state = { journal: { entries: [], unreadCount: 0 } };
  const html = renderJournalPanel(state);
  assert(html.includes('journal-panel'), 'Should contain journal-panel class');
  assert(html.includes('Adventure Journal'), 'Should contain title');
});

test('renderJournalBadge shows count when unread > 0', () => {
  const state = { journal: { unreadCount: 5 } };
  const badge = renderJournalBadge(state);
  assert(badge.includes('5'), 'Should show count');
});

test('renderJournalBadge returns empty when no unread', () => {
  const state = { journal: { unreadCount: 0 } };
  const badge = renderJournalBadge(state);
  assertEqual(badge, '');
});

// Forbidden motifs check
console.log('\nForbidden Motifs Check:');
test('source files do not contain forbidden words', () => {
  const forbiddenMotifs = ['egg', 'easter', 'rabbit', 'bunny', 'cockatrice', 'basilisk', 'yolk', 'omelet'];
  const sourceFiles = ['src/journal.js', 'src/journal-ui.js'];
  
  for (const file of sourceFiles) {
    const filePath = path.join(process.cwd(), file);
    const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
    
    for (const motif of forbiddenMotifs) {
      const regex = new RegExp(`\\b${motif}\\b`, 'i');
      if (regex.test(content)) {
        throw new Error(`Found forbidden word "${motif}" in ${file}`);
      }
    }
  }
});

// Summary
console.log('\n' + '='.repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(40));

if (failed > 0) {
  process.exit(1);
}
