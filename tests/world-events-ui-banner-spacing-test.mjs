import assert from 'node:assert';
import { renderWorldEventBanner } from '../src/world-events-ui.js';

function main() {
  console.log('[world-events-ui-banner-spacing-test] Checking banner has separator between name and description...');

  const worldEvent = {
    id: 'elemental_storm',
    name: 'Elemental Storm',
    description: 'A massive elemental storm rages!',
    icon: '🌩️',
    rarity: 'rare',
    movesRemaining: 2,
    totalMoves: 5,
    effect: { type: 'damage_multiplier', value: 1.4 },
  };

  const html = renderWorldEventBanner(worldEvent);
  assert.ok(html.includes('world-event-name'), 'Expected banner to include name span');
  assert.ok(html.includes('world-event-desc'), 'Expected banner to include desc span');

  // Regression guard: ensure there is at least a space between the name and the description.
  // Without this, the UI renders like: "Elemental StormA massive...".
  assert.ok(
    html.includes('</span><span class="world-event-desc"> '),
    'Expected banner desc span to start with a space for readability',
  );

  console.log('[world-events-ui-banner-spacing-test] ✅ ok');
}

main();
