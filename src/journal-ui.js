// Journal UI - Renders the adventure log interface
import {
  JOURNAL_CATEGORIES,
  getEntriesByCategory,
  getImportantEntries,
  getEntryCounts,
  formatEntryTimestamp,
  getUnreadCount
} from './journal.js';

// Current filter state
let currentCategory = 'all';
let showImportantOnly = false;

// Render the journal panel
export function renderJournalPanel(state) {
  const counts = getEntryCounts(state);
  const unreadCount = getUnreadCount(state);
  
  const categories = [
    { id: 'all', label: 'All', icon: '📜' },
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'exploration', label: 'Exploration', icon: '🗺️' },
    { id: 'quests', label: 'Quests', icon: '📋' },
    { id: 'discoveries', label: 'Discoveries', icon: '💎' },
    { id: 'milestones', label: 'Milestones', icon: '🏆' }
  ];
  
  const tabsHTML = categories.map(cat => {
    const active = cat.id === currentCategory ? 'active' : '';
    const count = counts[cat.id] || 0;
    return `<button class="journal-tab ${active}" data-action="JOURNAL_FILTER" data-category="${cat.id}">
      ${cat.icon} ${cat.label} (${count})
    </button>`;
  }).join('');
  
  const entries = showImportantOnly 
    ? getImportantEntries(state).filter(e => currentCategory === 'all' || e.category === currentCategory)
    : getEntriesByCategory(state, currentCategory);
  
  const entriesHTML = entries.length > 0 
    ? entries.map(entry => renderJournalEntry(entry)).join('')
    : '<div class="journal-empty">No entries yet. Your adventures will be recorded here.</div>';
  
  const importantToggle = showImportantOnly ? 'active' : '';
  
  return `
    <div class="journal-panel">
      <div class="journal-header">
        <h2>📖 Adventure Journal</h2>
        ${unreadCount > 0 ? `<span class="journal-unread">${unreadCount} new</span>` : ''}
        <button class="journal-close" data-action="CLOSE_JOURNAL">✕</button>
      </div>
      
      <div class="journal-toolbar">
        <button class="journal-important-toggle ${importantToggle}" data-action="JOURNAL_TOGGLE_IMPORTANT">
          ⭐ Important Only
        </button>
      </div>
      
      <div class="journal-tabs">
        ${tabsHTML}
      </div>
      
      <div class="journal-entries">
        ${entriesHTML}
      </div>
    </div>
  `;
}

// Render a single journal entry
function renderJournalEntry(entry) {
  const categoryIcons = {
    combat: '⚔️',
    exploration: '🗺️',
    quests: '📋',
    discoveries: '💎',
    milestones: '🏆'
  };
  
  const icon = categoryIcons[entry.category] || '📜';
  const importantClass = entry.isImportant ? 'important' : '';
  const timestamp = formatEntryTimestamp(entry);
  
  return `
    <div class="journal-entry ${importantClass}" data-entry-id="${entry.id}">
      <div class="journal-entry-header">
        <span class="journal-entry-icon">${icon}</span>
        <span class="journal-entry-title">${entry.title}</span>
        <button class="journal-star ${entry.isImportant ? 'starred' : ''}" 
                data-action="JOURNAL_TOGGLE_STAR" data-entry-id="${entry.id}">
          ${entry.isImportant ? '⭐' : '☆'}
        </button>
      </div>
      <div class="journal-entry-body">
        <p>${entry.description}</p>
      </div>
      <div class="journal-entry-footer">
        <span class="journal-entry-location">📍 ${entry.location}</span>
        <span class="journal-entry-turn">Turn ${entry.turn}</span>
        <span class="journal-entry-time">${timestamp}</span>
      </div>
    </div>
  `;
}

// Set current category filter
export function setJournalCategory(category) {
  currentCategory = category;
}

// Toggle important-only filter
export function toggleImportantFilter() {
  showImportantOnly = !showImportantOnly;
}

// Get current category
export function getCurrentCategory() {
  return currentCategory;
}

// Get important filter state
export function isShowingImportantOnly() {
  return showImportantOnly;
}

// Reset filters
export function resetJournalFilters() {
  currentCategory = 'all';
  showImportantOnly = false;
}

// Initialize journal UI event handlers
export function initJournalUI(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  container.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    
    switch (action) {
      case 'JOURNAL_FILTER':
        const category = e.target.closest('[data-category]')?.dataset.category;
        if (category) setJournalCategory(category);
        break;
      case 'JOURNAL_TOGGLE_IMPORTANT':
        toggleImportantFilter();
        break;
      case 'JOURNAL_TOGGLE_STAR':
        const entryId = e.target.closest('[data-entry-id]')?.dataset.entryId;
        if (entryId) {
          window.dispatchEvent(new CustomEvent('journal:toggleStar', { detail: { entryId } }));
        }
        break;
      case 'CLOSE_JOURNAL':
        window.dispatchEvent(new CustomEvent('journal:close'));
        break;
    }
  });
}

// Render journal notification badge
export function renderJournalBadge(state) {
  const unreadCount = getUnreadCount(state);
  if (unreadCount === 0) return '';
  return `<span class="journal-badge">${unreadCount}</span>`;
}
