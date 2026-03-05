import { clamp, pushLog } from './state.js';
import { items } from './data/items.js';
import { getEnemy, getEncounter } from './data/enemies.js';

// Minimal deterministic RNG (Park-Miller LCG)
export function nextRng(seed) {
  const a = 48271;
  const m = 2147483647;
  const next = (seed * a) % m;
  return { seed: next, value: next / m };
}

function computeDamage({ attackerAtk, targetDef, targetDefending }) {
  const defendBonus = targetDefending ? 3 : 0;
  const raw = attackerAtk - (targetDef + defendBonus);
  return Math.max(1, raw);
}

function isStunned(entity) {
  return (entity.statusEffects ?? []).some(
    (effect) => effect.type === 'stun' && effect.duration >= 0
  );
}

export function addStatusEffect(state, targetKey, effect) {
  const target = state[targetKey];
  if (!target) return state;
  const statusEffects = target.statusEffects ?? [];
  return {
    ...state,
    [targetKey]: { ...target, statusEffects: [...statusEffects, { ...effect }] },
  };
}

function processTurnStart(state, actorKey) {
  const actor = state[actorKey];
  if (!actor) return state;

  let nextState = state;
  const actorName = actorKey === 'player' ? 'You' : state.enemy.name;
  const actorPossessive = actorKey === 'player' ? 'Your' : `${state.enemy.name}'s`;
  let hp = actor.hp;
  const remainingEffects = [];

  for (const effect of actor.statusEffects ?? []) {
    const duration = effect.duration ?? 0;
    if (duration <= 0) {
      nextState = pushLog(nextState, `${actorPossessive} ${effect.type} wears off.`);
      continue;
    }

    const verb = actorKey === 'player' ? 'take' : 'takes';
    const healVerb = actorKey === 'player' ? 'regain' : 'regains';

    if (effect.type === 'poison' || effect.type === 'burn') {
      const damage = Math.max(0, effect.power ?? 0);
      if (damage > 0) {
        hp = clamp(hp - damage, 0, actor.maxHp);
        const source = effect.type === 'poison' ? 'poison' : 'burn';
        nextState = pushLog(nextState, `${actorName} ${verb} ${damage} ${source} damage.`);
      }
    } else if (effect.type === 'regen') {
      const heal = Math.max(0, effect.power ?? 0);
      if (heal > 0) {
        hp = clamp(hp + heal, 0, actor.maxHp);
        nextState = pushLog(nextState, `${actorName} ${healVerb} ${heal} HP.`);
      }
    }

    const newDuration = duration - 1;
    remainingEffects.push({ ...effect, duration: newDuration });
  }

  nextState = {
    ...nextState,
    [actorKey]: { ...actor, hp, statusEffects: remainingEffects },
  };

  return applyVictoryDefeat(nextState);
}

function applyVictoryDefeat(state) {
  if (state.enemy.hp <= 0) {
    const xpGained = state.enemy.xpReward ?? 0;
    const goldGained = state.enemy.goldReward ?? 0;
    state = {
      ...state,
      phase: 'victory',
      xpGained,
      goldGained,
      player: {
        ...state.player,
        xp: (state.player.xp ?? 0) + xpGained,
        gold: (state.player.gold ?? 0) + goldGained,
      },
    };
    state = pushLog(state, `Victory! The ${state.enemy.name} dissolves.`);
  }
  if (state.player.hp <= 0) {
    state = { ...state, phase: 'defeat' };
    state = pushLog(state, `Defeat... You collapse.`);
  }
  return state;
}

export function startNewEncounter(state, zoneLevel = 1) {
  const encounter = getEncounter(zoneLevel);
  const enemyId = encounter[0];
  const enemyBase = getEnemy(enemyId);
  const enemy = {
    ...enemyBase,
    hp: enemyBase.maxHp ?? enemyBase.hp,
    maxHp: enemyBase.maxHp ?? enemyBase.hp,
    defending: false,
    statusEffects: [],
  };

  let next = {
    ...state,
    enemy,
    phase: 'player-turn',
    turn: 1,
    player: { ...state.player, defending: false, statusEffects: [] },
  };

  next = pushLog(next, `A wild ${enemy.name} appears.`);
  next = pushLog(next, `Your turn.`);
  return next;
}

export function playerAttack(state) {
  if (state.phase !== 'player-turn') return state;

  if (isStunned(state.player)) {
    state = pushLog(state, 'Player is stunned!');
    state = processTurnStart(state, 'enemy');
    if (state.phase === 'victory' || state.phase === 'defeat') return state;
    return { ...state, phase: 'enemy-turn' };
  }

  const damage = computeDamage({
    attackerAtk: state.player.atk,
    targetDef: state.enemy.def,
    targetDefending: state.enemy.defending,
  });

  const enemyHp = clamp(state.enemy.hp - damage, 0, state.enemy.maxHp);
  state = {
    ...state,
    enemy: { ...state.enemy, hp: enemyHp, defending: false },
    player: { ...state.player, defending: false },
  };

  state = pushLog(state, `You strike for ${damage} damage.`);
  state = applyVictoryDefeat(state);
  if (state.phase === 'victory' || state.phase === 'defeat') return state;
  state = processTurnStart(state, 'enemy');
  if (state.phase === 'victory' || state.phase === 'defeat') return state;
  return { ...state, phase: 'enemy-turn' };
}

export function playerDefend(state) {
  if (state.phase !== 'player-turn') return state;
  if (isStunned(state.player)) {
    state = pushLog(state, 'Player is stunned!');
    state = processTurnStart(state, 'enemy');
    if (state.phase === 'victory' || state.phase === 'defeat') return state;
    return { ...state, phase: 'enemy-turn' };
  }
  state = {
    ...state,
    player: { ...state.player, defending: true },
  };
  state = pushLog(state, `You brace for impact.`);
  state = processTurnStart(state, 'enemy');
  if (state.phase === 'victory' || state.phase === 'defeat') return state;
  return { ...state, phase: 'enemy-turn' };
}

export function playerUsePotion(state) {
  if (state.phase !== 'player-turn') return state;

  if (isStunned(state.player)) {
    state = pushLog(state, 'Player is stunned!');
    state = processTurnStart(state, 'enemy');
    if (state.phase === 'victory' || state.phase === 'defeat') return state;
    return { ...state, phase: 'enemy-turn' };
  }

  const count = state.player.inventory.potion ?? 0;
  if (count <= 0) {
    return pushLog(state, `You fumble for a potion, but you're out.`);
  }

  const heal = items.potion.heal;
  const hp = clamp(state.player.hp + heal, 0, state.player.maxHp);
  state = {
    ...state,
    player: {
      ...state.player,
      hp,
      defending: false,
      inventory: { ...state.player.inventory, potion: count - 1 },
    },
  };

  state = pushLog(state, `You drink a potion and heal ${hp - (state.player.hp)} HP.`);
  state = processTurnStart(state, 'enemy');
  if (state.phase === 'victory' || state.phase === 'defeat') return state;
  return { ...state, phase: 'enemy-turn' };
}

export function enemyAct(state) {
  if (state.phase !== 'enemy-turn') return state;
  if (state.enemy.hp <= 0 || state.player.hp <= 0) return applyVictoryDefeat(state);

  // Choose action: 80% attack, 20% defend.
  const { seed, value } = nextRng(state.rngSeed);
  state = { ...state, rngSeed: seed };

  if (value < 0.2) {
    state = {
      ...state,
      enemy: { ...state.enemy, defending: true },
      player: { ...state.player, defending: false },
      turn: state.turn + 1,
    };
    state = pushLog(state, `${state.enemy.name} wiggles defensively.`);
    state = processTurnStart(state, 'player');
    if (state.phase === 'victory' || state.phase === 'defeat') return state;
    state = pushLog(state, `Your turn.`);
    return { ...state, phase: 'player-turn' };
  }

  const damage = computeDamage({
    attackerAtk: state.enemy.atk,
    targetDef: state.player.def,
    targetDefending: state.player.defending,
  });

  const playerHp = clamp(state.player.hp - damage, 0, state.player.maxHp);
  state = {
    ...state,
    player: { ...state.player, hp: playerHp, defending: false },
    enemy: { ...state.enemy, defending: false },
    turn: state.turn + 1,
  };

  state = pushLog(state, `${state.enemy.name} slams you for ${damage} damage.`);
  state = applyVictoryDefeat(state);
  if (state.phase === 'victory' || state.phase === 'defeat') return state;
  state = processTurnStart(state, 'player');
  if (state.phase === 'victory' || state.phase === 'defeat') return state;
  state = pushLog(state, `Your turn.`);
  return { ...state, phase: 'player-turn' };
}
