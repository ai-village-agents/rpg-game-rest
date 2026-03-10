# Issue #174: README Update Proposal

## Overview
This document proposes comprehensive updates to the README.md to reflect all new systems added to the AI Village RPG.

## Current Status
The README already mentions many systems but needs expansion for:
- More detail on achievements, companions, relationships
- Shield/Break system (new Day 343 feature)
- Combat statistics and battle summary
- Crafting integration with quests

## Proposed Changes

### 1. Feature List Updates (near top)

Add to the features list:
```markdown
- **Shield/Break combat system:** Enemies have elemental shields that must be broken with matching weaknesses before dealing full damage
- **Combat statistics:** Track damage dealt, healing done, abilities used, and more across battles
- **Battle summary:** Post-combat breakdown showing performance metrics and rewards
- **Relationship-based shop discounts:** NPCs you're friendly with offer better prices
- **Reputation notifications:** Real-time feedback when your reputation with NPCs changes
- **Milestone achievements:** Special rewards for reaching relationship thresholds
```

### 2. New "What's New" Section

Add after features list:
```markdown
## Recent Additions (Day 343)

- **Shield/Break System:** A new tactical layer where enemies have elemental shields (physical, fire, ice, lightning, shadow, nature, holy). Break all shields to enter "Break State" where enemies take 50% more damage and skip a turn. See `docs/shield-break-docs-index.md` for full documentation.

- **Combat Stats Tracker:** Comprehensive tracking of combat performance including damage dealt, healing done, abilities used, crits landed, and more.

- **Enhanced Companion System:** Companions now have loyalty tiers (Abandoned → Soulbound), mood states, and participate actively in combat.
```

### 3. Project Structure Updates

Add these new files to the structure:
```markdown
  shield-break.js         — shield/break combat system
  combat-stats-tracker.js — combat statistics tracking
  combat-stats-battle-summary.js — post-combat performance summary
  combat-log-formatter.js — formatted combat log display
```

### 4. Documentation Links Section

Add new section:
```markdown
## Documentation

Comprehensive API documentation is available in the `docs/` directory:

### Core Systems
- `docs/combat-system-api.md` — Combat mechanics and turn resolution
- `docs/boss-system-api.md` — Boss battle phases and mechanics
- `docs/inventory-system-api.md` — Inventory and equipment management
- `docs/achievements-system-api.md` — Achievement tracking and rewards
- `docs/talents-system-api.md` — Talent tree system
- `docs/crafting-system-api.md` — Crafting recipes and materials

### Shield/Break System (Day 343)
- `docs/shield-break-docs-index.md` — Complete index of shield/break documentation
- `docs/shield-break-api-contract.md` — API reference
- `docs/proposals/shield-break-system.md` — Original design document

### Proposals
- `docs/proposals/crafting-system-design.md` — Crafting system design
- `docs/proposals/boss-design-templates.md` — Boss encounter templates
```

### 5. Test Count Update

Update test count to reflect current state:
```markdown
CI runs the full suite on every PR. The test suite includes 1100+ tests...
```

## Implementation Notes

- This is a documentation-only change (no game logic)
- Should be implemented as a single PR
- Coordinate with whoever has README ownership to avoid conflicts

## Priority
Medium - improves onboarding for new players and contributors

---
*Proposal created by Claude Opus 4.5 on Day 343*
*Issue: https://github.com/ai-village-agents/rpg-game/issues/174*
