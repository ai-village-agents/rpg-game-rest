/**
 * Bestiary UI Module — Renders the monster compendium panel.
 * Shows encountered enemies, their stats, and defeat counts.
 */

import {
  getAllBestiaryEntries,
  getEncounteredCount,
  getDefeatedUniqueCount,
  getCompletionPercent,
  getTotalEnemyCount,
} from './bestiary.js';

/**
 * Render the bestiary panel as an HTML string.
 * @param {Object} state - Full game state (must include state.bestiary)
 * @returns {string} HTML string for the bestiary panel
 */
export function renderBestiaryPanel(state) {
  const bestiary = state.bestiary;
  if (!bestiary) {
    return '<div class="bestiary-panel"><p>Bestiary not available.</p></div>';
  }

  const entries = getAllBestiaryEntries(bestiary);
  const encountered = getEncounteredCount(bestiary);
  const defeated = getDefeatedUniqueCount(bestiary);
  const total = getTotalEnemyCount();
  const percent = getCompletionPercent(bestiary);

  let html = '<div class="bestiary-panel">';
  html += '<h2>Bestiary</h2>';
  html += `<div class="bestiary-summary">`;
  html += `<span>Encountered: ${encountered}/${total}</span>`;
  html += ` | <span>Defeated: ${defeated}/${total}</span>`;
  html += ` | <span>Completion: ${percent}%</span>`;
  html += `</div>`;

  html += '<div class="bestiary-list">';

  for (const entry of entries) {
    if (!entry.encountered) {
      html += `<div class="bestiary-entry bestiary-unknown">`;
      html += `<span class="bestiary-name">???</span>`;
      html += entry.isBoss ? ' <span class="bestiary-boss-tag">[Boss]</span>' : '';
      html += `</div>`;
      continue;
    }

    const bossTag = entry.isBoss ? ' <span class="bestiary-boss-tag">[Boss]</span>' : '';
    html += `<div class="bestiary-entry bestiary-known${entry.isBoss ? ' bestiary-boss' : ''}">`;
    html += `<div class="bestiary-entry-header">`;
    html += `<span class="bestiary-name">${entry.name}</span>${bossTag}`;
    html += `<span class="bestiary-element">${entry.element || 'none'}</span>`;
    html += `</div>`;

    if (entry.description) {
      html += `<div class="bestiary-description">${entry.description}</div>`;
    }

    html += `<div class="bestiary-stats">`;
    html += `HP: ${entry.maxHp} | ATK: ${entry.atk} | DEF: ${entry.def} | SPD: ${entry.spd}`;
    html += `</div>`;
    html += `<div class="bestiary-rewards">`;
    html += `XP: ${entry.xpReward} | Gold: ${entry.goldReward}`;
    if (entry.phases) {
      html += ` | Phases: ${entry.phases}`;
    }
    html += `</div>`;
    html += `<div class="bestiary-defeats">Defeated: ${entry.timesDefeated} time${entry.timesDefeated !== 1 ? 's' : ''}</div>`;
    html += `</div>`;
  }

  html += '</div>';
  html += '<button class="bestiary-close-btn" data-action="close-bestiary">Close</button>';
  html += '</div>';

  return html;
}
