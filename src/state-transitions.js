import { calcLevel } from './characters/stats.js';
import { checkLevelUps } from './level-up.js';
import { createBattleSummary } from './battle-summary.js';
import { pushLog } from './state.js';
import { logLevelUp } from './journal.js';
import { addSkillPoints, createTalentState } from './talents.js';
import { recordGoldEarned as recordDashboardGoldEarned } from './statistics-dashboard.js';

const SKILL_POINTS_PER_LEVEL = 1;

/**
 * Handles automatic state updates based on phase transitions.
 * e.g. Level-up detection, Battle Summary creation.
 * @param {Object} prevState - The previous state
 * @param {Object} nextState - The proposed next state
 * @returns {Object} The final next state (possibly modified)
 */
export function handleStateTransitions(prevState, nextState) {
  let next = nextState;
  const enteringVictory = next.phase === 'victory' && prevState.phase !== 'victory' && prevState.phase !== 'level-up';
  
  // Detect level-ups when entering victory phase
  if (enteringVictory) {
    const player = next.player;
    if (player && player.classId) {
      const oldLevel = player.level ?? 1;
      const newLevel = calcLevel(player.xp ?? 0);
      if (newLevel > oldLevel) {
        // Build level-up data: simulate the stat growth
        const levelUps = checkLevelUps(
          [{ ...player, level: oldLevel, xp: (player.xp ?? 0) - (next.xpGained ?? 0) }],
          next.xpGained ?? 0
        );
        if (levelUps.length > 0) {
          // Update player level and stats to match post-level-up
          const lu = levelUps[0];
          const levelsGained = lu.newLevel - oldLevel;
          const pointsToAdd = levelsGained * SKILL_POINTS_PER_LEVEL;
          const currentTalentState = next.talentState || createTalentState();
          const newTalentState = addSkillPoints(currentTalentState, pointsToAdd);
          next = {
            ...next,
            player: {
              ...player,
              level: lu.newLevel,
              maxHp: lu.newStats.maxHp,
              hp: player.hp + (lu.newStats.maxHp - lu.oldStats.maxHp), // Heal by the HP growth amount
              maxMp: lu.newStats.maxMp,
              mp: (player.mp ?? 0) + (lu.newStats.maxMp - (lu.oldStats.maxMp ?? 0)),
              atk: lu.newStats.atk,
              def: lu.newStats.def,
              spd: lu.newStats.spd,
            },
            talentState: newTalentState,
            pendingLevelUps: levelUps,
          };
          next = pushLog(next, `${player.name} reached level ${lu.newLevel}!`);
          next = pushLog(next, `Gained ${pointsToAdd} skill point(s)!`);
          next = logLevelUp(next, lu.newLevel);
        }
      }
    }
  }

  // After level-up detection, transition victory → battle-summary
  if (next.phase === 'victory' && prevState.phase !== 'battle-summary' && prevState.phase !== 'level-up') {
    if ((next.goldGained ?? 0) > 0) {
      next = recordDashboardGoldEarned(next, next.goldGained, 'combat');
    }
    next = { ...next, phase: 'battle-summary', battleSummary: createBattleSummary(next) };
  }
  
  return next;
}
