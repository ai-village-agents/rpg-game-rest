# Human Testing Checklist - AI Village RPG

**For Thursday 3/19/2026 Human Testers**

## Before you start
- [ ] Use a private/incognito browser window to avoid cached assets
- [ ] After the team announces an update, perform a hard refresh (Ctrl+Shift+R) on the page

## 1. First-Time User Flow
- [ ] Load game at your local server URL (e.g., localhost:8001 or use the live version at https://ai-village-agents.github.io/rpg-game-rest/)
- [ ] Enter character name
- [ ] Select difficulty (Easy/Normal/Hard)
- [ ] Choose a class (Warrior/Mage/Rogue/Cleric)
- [ ] Choose a background (Soldier/Scholar/Wanderer/Artisan)
- [ ] Tutorial hints appear and are dismissible
- [ ] Character stats display correctly

## 2. Save/Load System
- [ ] Click Save/Load button
- [ ] Save game to an empty slot
- [ ] Save shows confirmation message
- [ ] Refresh page (hard refresh: Ctrl+Shift+R)
- [ ] **Continue Game button appears** at top of class selection
- [ ] Click Continue Game - Load modal opens
- [ ] Load saved game - returns to game state

## 3. Movement & Exploration
- [ ] Click directional buttons (N/S/E/W) - movement works
- [ ] WASD keys work for movement
- [ ] Location description updates
- [ ] World map shows current position
- [ ] Can explore to different areas

## 4. NPC Interaction
- [ ] Talk to Village Elder Aldric (at Village Square)
- [ ] Dialog progresses through multiple pages
- [ ] Dialog completes without errors
- [ ] Talk to other NPCs (Innkeeper Mira, merchants)

## 5. Combat System
- [ ] Click "Seek Battle" to find enemies
- [ ] Combat actions work (Attack, Defend, Skills)
- [ ] HP/MP display correctly during combat
- [ ] Victory screen shows rewards
- [ ] XP gained after combat

## 6. Arena & Tournament
- [ ] Visit Arena location
- [ ] Enter a tournament (pay entry fee)
- [ ] Tournament matches progress correctly
- [ ] Can forfeit tournament if needed
- [ ] Claim rewards after winning

## 7. Bounty Board
- [ ] Visit Bounty Board location
- [ ] View available bounties
- [ ] Accept a bounty
- [ ] Track bounty progress
- [ ] Complete and turn in bounty

## 8. Crafting & Enchanting
- [ ] Open Crafting panel
- [ ] View available recipes
- [ ] Craft an item (if materials available)
- [ ] Open Enchanting panel
- [ ] Enchant an item (if materials available)

## 9. Other Systems
- [ ] Inventory panel shows items correctly
- [ ] Stats panel displays character info
- [ ] Quests panel tracks active quests
- [ ] Journal records events
- [ ] Achievements unlock properly
- [ ] Talents panel shows available upgrades
- [ ] Companions panel (if applicable)

## 10. Error Checking
- [ ] Open browser console (F12)
- [ ] No TypeErrors or critical errors
- [ ] Only expected warnings (favicon 404 is normal)

---

**Report Issues To:** Create a GitHub issue with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshot (if applicable)
5. Console errors (if any)
