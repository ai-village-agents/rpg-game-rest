// Journal/Adventure Log System
// Tracks player activities, discoveries, and milestones

// Journal entry categories
export const JOURNAL_CATEGORIES = {
  COMBAT: 'combat',
  EXPLORATION: 'exploration',
  QUESTS: 'quests',
  DISCOVERIES: 'discoveries',
  MILESTONES: 'milestones'
};

// Maximum entries per category to prevent bloat
export const MAX_ENTRIES_PER_CATEGORY = 50;

// Create a new journal entry
export function createJournalEntry(category, title, description, metadata = {}) {
  return {
    id: generateEntryId(),
    category,
    title,
    description,
    turn: metadata.turn || 0,
    timestamp: new Date().toISOString(),
    location: metadata.location || 'Unknown',
    isImportant: metadata.isImportant || false
  };
}

// Generate unique entry ID
function generateEntryId() {
  return 'journal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize journal in game state
export function initializeJournal(state) {
  if (!state.journal) {
    state.journal = {
      entries: [],
      unreadCount: 0,
      lastViewedTurn: 0
    };
  }
  return state;
}

// Add entry to journal
export function addJournalEntry(state, category, title, description, metadata = {}) {
  const journal = state.journal || { entries: [], unreadCount: 0, lastViewedTurn: 0 };
  
  const entry = createJournalEntry(category, title, description, {
    turn: state.turn || 0,
    location: state.currentRoom || metadata.location || 'Unknown',
    isImportant: metadata.isImportant || false
  });
  
  journal.entries.unshift(entry);
  journal.unreadCount++;
  
  // Trim old entries if over limit
  const categoryEntries = journal.entries.filter(e => e.category === category);
  if (categoryEntries.length > MAX_ENTRIES_PER_CATEGORY) {
    const oldestId = categoryEntries[categoryEntries.length - 1].id;
    journal.entries = journal.entries.filter(e => e.id !== oldestId);
  }
  
  return { ...state, journal };
}

// Get entries by category
export function getEntriesByCategory(state, category) {
  const journal = state.journal || { entries: [] };
  if (category === 'all') {
    return journal.entries;
  }
  return journal.entries.filter(e => e.category === category);
}

// Get important entries only
export function getImportantEntries(state) {
  const journal = state.journal || { entries: [] };
  return journal.entries.filter(e => e.isImportant);
}

// Get recent entries (last N)
export function getRecentEntries(state, count = 10) {
  const journal = state.journal || { entries: [] };
  return journal.entries.slice(0, count);
}

// Mark all entries as read
export function markAllRead(state) {
  const journal = state.journal || { entries: [], unreadCount: 0, lastViewedTurn: 0 };
  return {
    ...state,
    journal: {
      ...journal,
      unreadCount: 0,
      lastViewedTurn: state.turn || 0
    }
  };
}

// Get unread count
export function getUnreadCount(state) {
  return state.journal?.unreadCount || 0;
}

// Toggle entry importance
export function toggleEntryImportance(state, entryId) {
  const journal = state.journal || { entries: [] };
  const updatedEntries = journal.entries.map(e => 
    e.id === entryId ? { ...e, isImportant: !e.isImportant } : e
  );
  return {
    ...state,
    journal: { ...journal, entries: updatedEntries }
  };
}

// Delete a journal entry
export function deleteJournalEntry(state, entryId) {
  const journal = state.journal || { entries: [] };
  const updatedEntries = journal.entries.filter(e => e.id !== entryId);
  return {
    ...state,
    journal: { ...journal, entries: updatedEntries }
  };
}

// Search journal entries
export function searchJournal(state, searchTerm) {
  const journal = state.journal || { entries: [] };
  const term = searchTerm.toLowerCase();
  return journal.entries.filter(e => 
    e.title.toLowerCase().includes(term) || 
    e.description.toLowerCase().includes(term)
  );
}

// Get entry count by category
export function getEntryCounts(state) {
  const journal = state.journal || { entries: [] };
  const counts = {
    all: journal.entries.length,
    combat: 0,
    exploration: 0,
    quests: 0,
    discoveries: 0,
    milestones: 0
  };
  
  journal.entries.forEach(e => {
    if (counts[e.category] !== undefined) {
      counts[e.category]++;
    }
  });
  
  return counts;
}

// Format entry timestamp for display
export function formatEntryTimestamp(entry) {
  const date = new Date(entry.timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Log combat victory
export function logCombatVictory(state, enemyName, goldEarned, xpEarned) {
  return addJournalEntry(
    state,
    JOURNAL_CATEGORIES.COMBAT,
    `Defeated ${enemyName}`,
    `Earned ${goldEarned} gold and ${xpEarned} XP.`,
    { isImportant: false }
  );
}

// Log boss defeat
export function logBossDefeat(state, bossName) {
  return addJournalEntry(
    state,
    JOURNAL_CATEGORIES.COMBAT,
    `Boss Defeated: ${bossName}`,
    `A mighty foe has fallen!`,
    { isImportant: true }
  );
}

// Log location discovery
export function logLocationDiscovery(state, locationName) {
  return addJournalEntry(
    state,
    JOURNAL_CATEGORIES.EXPLORATION,
    `Discovered ${locationName}`,
    `A new area has been revealed.`,
    { isImportant: true }
  );
}

// Log quest completion
export function logQuestComplete(state, questName, rewards) {
  return addJournalEntry(
    state,
    JOURNAL_CATEGORIES.QUESTS,
    `Quest Complete: ${questName}`,
    `Rewards: ${rewards}`,
    { isImportant: true }
  );
}

// Log level up
export function logLevelUp(state, newLevel) {
  return addJournalEntry(
    state,
    JOURNAL_CATEGORIES.MILESTONES,
    `Reached Level ${newLevel}`,
    `Growing stronger with each challenge.`,
    { isImportant: true }
  );
}

// Log item discovery
export function logItemDiscovery(state, itemName, rarity) {
  const isImportant = rarity === 'rare' || rarity === 'legendary';
  return addJournalEntry(
    state,
    JOURNAL_CATEGORIES.DISCOVERIES,
    `Found ${itemName}`,
    `A ${rarity} item has been added to inventory.`,
    { isImportant }
  );
}
