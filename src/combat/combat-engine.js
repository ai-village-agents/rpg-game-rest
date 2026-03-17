/**
 * Combat Engine — AI Village RPG
 * Owner: Claude Opus 4.6
 *
 * Full turn-based combat system with:
 * - Multi-character party vs enemy group battles
 * - Speed-based turn order (CTB-style)
 * - Status effects (poison, stun, regen, ATK up/down, DEF up/down)
 * - Special abilities with MP costs
 * - Elemental damage (fire, ice, lightning, earth, light, dark, physical)
 * - Flee mechanic
 * - XP/gold rewards on victory
 */

import { StatusEffect, applyStatusEffects, removeExpiredEffects, isStunned } from './status-effects.js';
import { calculateDamage, calculateHeal, ELEMENTS } from './damage-calc.js';
import { getAbility } from './abilities.js';

// ── Combat State Factory ─────────────────────────────────────────────

/**
 * Create a fresh combat state from party and enemy group arrays.
 * Each combatant should have: { id, name, hp, maxHp, mp, maxMp, atk, def, spd, abilities[], element? }
 * @param {Array} party - Array of player characters
 * @param {Array} enemies - Array of enemy combatants
 * @param {number} [rngSeed] - Optional seed for deterministic RNG
 * @returns {Object} combatState
 */
export function createCombatState(party, enemies, rngSeed) {
  const seed = rngSeed ?? (Date.now() % 2147483647);

  // Deep-clone combatants so combat doesn't mutate originals
  const allyCombatants = party.map((c, i) => ({
    ...c,
    combatId: `ally-${i}`,
    side: 'ally',
    defending: false,
    statusEffects: [],
    turnGauge: 0,
  }));

  const enemyCombatants = enemies.map((c, i) => ({
    ...c,
    combatId: `enemy-${i}`,
    side: 'enemy',
    defending: false,
    statusEffects: [],
    turnGauge: 0,
  }));

  return {
    phase: 'turn-calc',        // turn-calc | choose-action | executing | victory | defeat | fled
    allCombatants: [...allyCombatants, ...enemyCombatants],
    turnOrder: [],              // queue of combatId strings
    activeCombatantId: null,
    pendingAction: null,
    log: ['Battle begins!'],
    turn: 0,
    rngSeed: seed,
    rewards: { xp: 0, gold: 0, items: [] },
  };
}

// ── Deterministic RNG (Park-Miller LCG) ──────────────────────────────

export function nextRng(seed) {
  const a = 48271;
  const m = 2147483647;
  const next = (seed * a) % m;
  return { seed: next, value: next / m };
}

function rngFromState(state) {
  const result = nextRng(state.rngSeed);
  return { state: { ...state, rngSeed: result.seed }, value: result.value };
}

// ── Helpers ──────────────────────────────────────────────────────────

function pushLog(state, msg) {
  return { ...state, log: [...state.log, msg].slice(-300) };
}

function getCombatant(state, combatId) {
  return state.allCombatants.find(c => c.combatId === combatId);
}

function updateCombatant(state, combatId, updates) {
  return {
    ...state,
    allCombatants: state.allCombatants.map(c =>
      c.combatId === combatId ? { ...c, ...updates } : c
    ),
  };
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function livingAllies(state) {
  return state.allCombatants.filter(c => c.side === 'ally' && c.hp > 0);
}

function livingEnemies(state) {
  return state.allCombatants.filter(c => c.side === 'enemy' && c.hp > 0);
}

function checkVictoryDefeat(state) {
  if (livingEnemies(state).length === 0) {
    state = { ...state, phase: 'victory' };
    state = pushLog(state, 'Victory! All enemies defeated!');
    // Calculate rewards from enemy data
    const totalXp = state.allCombatants
      .filter(c => c.side === 'enemy')
      .reduce((sum, e) => sum + (e.xpReward ?? 10), 0);
    const totalGold = state.allCombatants
      .filter(c => c.side === 'enemy')
      .reduce((sum, e) => sum + (e.goldReward ?? 5), 0);
    state = {
      ...state,
      rewards: { ...state.rewards, xp: totalXp, gold: totalGold },
    };
    state = pushLog(state, `Earned ${totalXp} XP and ${totalGold} gold!`);
    return state;
  }
  if (livingAllies(state).length === 0) {
    state = { ...state, phase: 'defeat' };
    state = pushLog(state, 'Defeat... Your party has fallen.');
    return state;
  }
  return state;
}

// ── Turn Order (CTB-style: fill gauge by speed) ──────────────────────

/**
 * Advance turn gauges until someone reaches 100.
 * Returns updated state with the next combatant ready.
 */
export function calculateTurnOrder(state) {
  if (state.phase === 'victory' || state.phase === 'defeat' || state.phase === 'fled') {
    return state;
  }

  // Tick gauges until someone hits 100
  let working = { ...state, allCombatants: state.allCombatants.map(c => ({ ...c })) };
  let safety = 0;
  const MAX_TICKS = 1000;

  while (safety < MAX_TICKS) {
    safety++;
    for (const c of working.allCombatants) {
      if (c.hp <= 0) continue;
      // Speed determines gauge fill rate (min 1)
      const spdMod = getSpeedModifier(c);
      c.turnGauge += Math.max(1, Math.floor(c.spd * spdMod));
    }

    // Check if anyone reached 100
    const ready = working.allCombatants
      .filter(c => c.hp > 0 && c.turnGauge >= 100)
      .sort((a, b) => b.turnGauge - a.turnGauge || b.spd - a.spd);

    if (ready.length > 0) {
      const active = ready[0];
      active.turnGauge -= 100;

      working.turn += 1;
      working.activeCombatantId = active.combatId;

      // Apply start-of-turn status effects
      working = applyStatusEffects(working, active.combatId, 'turn-start');
      working = removeExpiredEffects(working, active.combatId);

      // Check if stunned
      const activeAfterStatus = getCombatant(working, active.combatId);
      if (activeAfterStatus.hp <= 0) {
        working = checkVictoryDefeat(working);
        if (working.phase === 'victory' || working.phase === 'defeat') return working;
        // Dead combatant, recalculate
        return calculateTurnOrder(working);
      }

      if (isStunned(activeAfterStatus)) {
        working = pushLog(working, `${activeAfterStatus.name} is stunned and can't act!`);
        working = { ...working, phase: 'turn-calc' };
        return calculateTurnOrder(working);
      }

      // Determine phase based on side
      if (active.side === 'ally') {
        working = { ...working, phase: 'choose-action' };
        working = pushLog(working, `${active.name}'s turn. Choose an action.`);
      } else {
        working = { ...working, phase: 'executing' };
        // AI will choose action
        working = enemyAI(working);
        working = checkVictoryDefeat(working);
        if (working.phase === 'victory' || working.phase === 'defeat') return working;
        return calculateTurnOrder(working);
      }

      return working;
    }
  }

  // Shouldn't reach here
  return pushLog(working, 'Turn calculation timed out.');
}

function getSpeedModifier(combatant) {
  let mod = 1.0;
  for (const eff of (combatant.statusEffects ?? [])) {
    if (eff.type === 'spd-down') mod *= 0.5;
    if (eff.type === 'spd-up') mod *= 1.5;
  }
  return mod;
}

// ── Player Actions ───────────────────────────────────────────────────

/**
 * Execute a player-chosen action.
 * @param {Object} state - current combat state
 * @param {Object} action - { type: 'attack'|'defend'|'ability'|'item'|'flee', targetId?, abilityId?, itemId? }
 */
export function executePlayerAction(state, action) {
  if (state.phase !== 'choose-action') return state;

  const actor = getCombatant(state, state.activeCombatantId);
  if (!actor || actor.side !== 'ally') return state;

  switch (action.type) {
    case 'attack':
      state = executeAttack(state, actor.combatId, action.targetId);
      break;
    case 'defend':
      state = executeDefend(state, actor.combatId);
      break;
    case 'ability':
      state = executeAbility(state, actor.combatId, action.abilityId, action.targetId);
      break;
    case 'item':
      state = executeItem(state, actor.combatId, action.itemId, action.targetId);
      break;
    case 'flee':
      state = executeFlee(state);
      break;
    default:
      state = pushLog(state, 'Unknown action.');
  }

  state = checkVictoryDefeat(state);
  if (state.phase === 'victory' || state.phase === 'defeat' || state.phase === 'fled') {
    return state;
  }

  // Move to next turn
  state = { ...state, phase: 'turn-calc' };
  return calculateTurnOrder(state);
}

function executeAttack(state, attackerId, targetId) {
  const attacker = getCombatant(state, attackerId);
  const target = getCombatant(state, targetId);
  if (!target || target.hp <= 0) {
    return pushLog(state, 'Invalid target.');
  }

  const { damage, critical } = calculateDamage({
    attackerAtk: getEffectiveStat(attacker, 'atk'),
    targetDef: getEffectiveStat(target, 'def'),
    targetDefending: target.defending,
    element: attacker.element ?? 'physical',
    targetElement: target.element ?? null,
    rngValue: nextRng(state.rngSeed).value,
    critChance: attacker.critChance ?? 0,
  });

  const { state: newState } = rngFromState(state);
  state = newState;

  const newHp = clamp(target.hp - damage, 0, target.maxHp);
  state = updateCombatant(state, targetId, { hp: newHp, defending: false });

  let msg = `${attacker.name} attacks ${target.name} for ${damage} damage!`;
  if (critical) msg += ' Critical hit!';
  if (newHp <= 0) msg += ` ${target.name} is defeated!`;
  state = pushLog(state, msg);

  // Reset attacker defending
  state = updateCombatant(state, attackerId, { defending: false });

  return state;
}

function executeDefend(state, combatantId) {
  const combatant = getCombatant(state, combatantId);
  state = updateCombatant(state, combatantId, { defending: true });
  state = pushLog(state, `${combatant.name} takes a defensive stance.`);
  return state;
}

function executeAbility(state, casterId, abilityId, targetId) {
  const caster = getCombatant(state, casterId);
  const ability = getAbility(abilityId);

  if (!ability) {
    return pushLog(state, 'Unknown ability.');
  }

  if (caster.mp < ability.mpCost) {
    return pushLog(state, `Not enough MP! ${ability.name} costs ${ability.mpCost} MP.`);
  }

  // Deduct MP
  state = updateCombatant(state, casterId, {
    mp: caster.mp - ability.mpCost,
    defending: false,
  });

  state = pushLog(state, `${caster.name} uses ${ability.name}!`);

  // Handle different ability types
  if (ability.targetType === 'single-enemy' || ability.targetType === 'single-ally') {
    state = applySingleTargetAbility(state, casterId, targetId, ability);
  } else if (ability.targetType === 'all-enemies') {
    const targets = livingEnemies(state);
    for (const t of targets) {
      state = applySingleTargetAbility(state, casterId, t.combatId, ability);
    }
  } else if (ability.targetType === 'all-allies') {
    const targets = livingAllies(state);
    for (const t of targets) {
      state = applySingleTargetAbility(state, casterId, t.combatId, ability);
    }
  } else if (ability.targetType === 'self') {
    state = applySingleTargetAbility(state, casterId, casterId, ability);
  }

  return state;
}

function applySingleTargetAbility(state, casterId, targetId, ability) {
  const caster = getCombatant(state, casterId);
  const target = getCombatant(state, targetId);

  if (!target || target.hp <= 0) return state;

  // Damage abilities
  if (ability.power && ability.power > 0) {
    const { damage, critical } = calculateDamage({
      attackerAtk: getEffectiveStat(caster, 'atk'),
      targetDef: getEffectiveStat(target, 'def'),
      targetDefending: target.defending,
      element: ability.element ?? 'physical',
      targetElement: target.element ?? null,
      rngValue: nextRng(state.rngSeed).value,
      abilityPower: ability.power,
      critChance: caster.critChance ?? 0,
    });

    const { state: newState } = rngFromState(state);
    state = newState;

    const newHp = clamp(target.hp - damage, 0, target.maxHp);
    state = updateCombatant(state, targetId, { hp: newHp });

    let msg = `${target.name} takes ${damage} ${ability.element ?? 'physical'} damage!`;
    if (critical) msg += ' Critical!';
    if (newHp <= 0) msg += ` ${target.name} is defeated!`;
    state = pushLog(state, msg);
  }

  // Healing abilities
  if (ability.healPower && ability.healPower > 0) {
    const heal = calculateHeal(ability.healPower, getEffectiveStat(caster, 'atk'));
    const newHp = clamp(target.hp + heal, 0, target.maxHp);
    state = updateCombatant(state, targetId, { hp: newHp });
    state = pushLog(state, `${target.name} is healed for ${heal} HP!`);
  }

  // Status effect application
  if (ability.statusEffect) {
    const eff = new StatusEffect(ability.statusEffect);
    const updatedTarget = getCombatant(state, targetId);
    state = updateCombatant(state, targetId, {
      statusEffects: [...(updatedTarget.statusEffects ?? []), eff],
    });
    state = pushLog(state, `${target.name} is afflicted with ${eff.name}!`);
  }

  return state;
}

function executeItem(state, userId, itemId, targetId) {
  // Delegate to items module — for now, basic potion support
  const user = getCombatant(state, userId);
  if (itemId === 'potion') {
    const target = getCombatant(state, targetId ?? userId);
    if (!target) return pushLog(state, 'Invalid target.');
    const heal = 10; // Will come from items module
    const newHp = clamp(target.hp + heal, 0, target.maxHp);
    state = updateCombatant(state, target.combatId, { hp: newHp });
    state = updateCombatant(state, userId, { defending: false });
    state = pushLog(state, `${user.name} uses a Potion on ${target.name}. Healed ${newHp - target.hp} HP!`);
  } else {
    state = pushLog(state, `Unknown item: ${itemId}`);
  }
  return state;
}

function executeFlee(state) {
  const { state: newState, value } = rngFromState(state);
  state = newState;

  // 40% base flee chance
  if (value < 0.4) {
    state = { ...state, phase: 'fled' };
    state = pushLog(state, 'Fled successfully!');
  } else {
    state = pushLog(state, 'Failed to flee!');
  }
  return state;
}

// ── Effective Stat Calculation (with buffs/debuffs) ──────────────────

function getEffectiveStat(combatant, stat) {
  let base = combatant[stat] ?? 0;
  let multiplier = 1.0;

  for (const eff of (combatant.statusEffects ?? [])) {
    if (eff.type === `${stat}-up`) multiplier += 0.25;
    if (eff.type === `${stat}-down`) multiplier -= 0.25;
  }

  return Math.max(1, Math.floor(base * clamp(multiplier, 0.25, 3.0)));
}

// ── Enemy AI ─────────────────────────────────────────────────────────

function enemyAI(state) {
  const enemy = getCombatant(state, state.activeCombatantId);
  if (!enemy || enemy.hp <= 0) return state;

  const allies = livingAllies(state);
  if (allies.length === 0) return state;

  const { state: s1, value: actionRoll } = rngFromState(state);
  state = s1;

  // Check if enemy has abilities and enough MP
  const usableAbilities = (enemy.abilities ?? [])
    .map(id => getAbility(id))
    .filter(a => a && enemy.mp >= a.mpCost);

  // 60% basic attack, 25% ability (if available), 15% defend
  if (actionRoll < 0.6 || usableAbilities.length === 0) {
    // Basic attack — target lowest HP ally
    const target = allies.reduce((low, c) => c.hp < low.hp ? c : low, allies[0]);
    state = executeAttack(state, enemy.combatId, target.combatId);
  } else if (actionRoll < 0.85 && usableAbilities.length > 0) {
    // Use a random ability
    const { state: s2, value: abilityRoll } = rngFromState(state);
    state = s2;
    const ability = usableAbilities[Math.floor(abilityRoll * usableAbilities.length)];

    // Pick target based on ability type
    let targetId;
    if (ability.targetType === 'single-enemy') {
      // Enemy's "enemy" is an ally
      const target = allies.reduce((low, c) => c.hp < low.hp ? c : low, allies[0]);
      targetId = target.combatId;
    } else if (ability.targetType === 'single-ally') {
      // Heal lowest HP ally on enemy side
      const enemyAllies = livingEnemies(state);
      const target = enemyAllies.reduce((low, c) => c.hp < low.hp ? c : low, enemyAllies[0]);
      targetId = target.combatId;
    } else if (ability.targetType === 'self') {
      targetId = enemy.combatId;
    }

    state = executeAbility(state, enemy.combatId, ability.id, targetId);
  } else {
    // Defend
    state = executeDefend(state, enemy.combatId);
  }

  return state;
}

// ── Exports for integration ──────────────────────────────────────────

export {
  pushLog,
  getCombatant,
  updateCombatant,
  livingAllies,
  livingEnemies,
  getEffectiveStat,
};
