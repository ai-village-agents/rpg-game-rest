const GRADE_COLORS = {
  S: '#ffd166',
  A: '#9bff66',
  B: '#66d1ff',
  C: '#ffb366',
  D: '#ff6b6b',
};

const PHASES = ['rating', 'xp', 'gold', 'loot', 'complete'];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeString = (value, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createLootLabel = (item) => {
  if (typeof item === 'string') {
    return escapeHtml(item);
  }
  if (item && typeof item === 'object') {
    const name = escapeHtml(normalizeString(item.name, 'Loot'));
    const qty = normalizeNumber(item.quantity, 1);
    return qty > 1 ? `${name} x${formatGoldAmount(qty)}` : name;
  }
  return escapeHtml('Loot');
};

/**
 * Creates the rewards display state from game state.
 * @param {object} state
 * @returns {{ xpBefore: number, xpAfter: number, xpForLevel: number, goldGained: number, lootItems: Array, battleRating: {grade: 'S'|'A'|'B'|'C'|'D', title: string, score: number}, turnsUsed: number, damageDealt: number, damageReceived: number, enemyName: string, leveledUp: boolean, newLevel: number }}
 */
export const createRewardsState = (state) => {
  const player = state?.player ?? {};
  const combat = state?.combat ?? {};
  const enemy = state?.enemy ?? {};
  const rewards = state?.rewards ?? {};

  const xpBefore = normalizeNumber(player.xp ?? state?.xp, 0);
  const xpGained = normalizeNumber(rewards.xpGained ?? state?.xpGained, 0);
  const xpAfter = normalizeNumber(player.xpAfter ?? state?.xpAfter, xpBefore + xpGained);
  const xpForLevel = Math.max(
    1,
    normalizeNumber(player.xpForLevel ?? player.xpNeeded ?? state?.xpForLevel, 1)
  );

  const goldGained = normalizeNumber(rewards.goldGained ?? state?.goldGained, 0);
  const lootItems = normalizeArray(rewards.lootItems ?? state?.lootItems);

  const turnsUsed = normalizeNumber(combat.turnsUsed ?? state?.turnsUsed, 0);
  const damageDealt = normalizeNumber(combat.damageDealt ?? state?.damageDealt, 0);
  const damageReceived = normalizeNumber(combat.damageReceived ?? state?.damageReceived, 0);
  const enemyName = normalizeString(combat.enemyName ?? enemy.name ?? state?.enemyName, 'Enemy');

  const playerMaxHp = normalizeNumber(player.maxHp ?? state?.playerMaxHp, 1);
  const enemyMaxHp = normalizeNumber(enemy.maxHp ?? state?.enemyMaxHp, 1);

  const battleRating = calculateBattleRating(
    turnsUsed,
    damageDealt,
    damageReceived,
    playerMaxHp,
    enemyMaxHp
  );

  const levelBefore = normalizeNumber(player.level ?? state?.level, 1);
  const levelAfter = normalizeNumber(player.levelAfter ?? state?.newLevel ?? levelBefore, levelBefore);
  const leveledUp =
    Boolean(player.leveledUp ?? state?.leveledUp) || levelAfter > levelBefore || xpAfter >= xpForLevel;
  const newLevel = leveledUp ? levelAfter : levelBefore;

  return {
    xpBefore,
    xpAfter,
    xpForLevel,
    goldGained,
    lootItems,
    battleRating,
    turnsUsed,
    damageDealt,
    damageReceived,
    enemyName,
    leveledUp,
    newLevel,
  };
};

/**
 * Calculates the battle rating based on combat performance.
 * @param {number} turnsUsed
 * @param {number} damageDealt
 * @param {number} damageReceived
 * @param {number} playerMaxHp
 * @param {number} enemyMaxHp
 * @returns {{ grade: 'S'|'A'|'B'|'C'|'D', title: string, score: number }}
 */
export const calculateBattleRating = (
  turnsUsed,
  damageDealt,
  damageReceived,
  playerMaxHp,
  enemyMaxHp
) => {
  const safeTurns = Math.max(1, normalizeNumber(turnsUsed, 1));
  const safeDealt = Math.max(0, normalizeNumber(damageDealt, 0));
  const safeReceived = Math.max(0, normalizeNumber(damageReceived, 0));
  const safePlayerHp = Math.max(1, normalizeNumber(playerMaxHp, 1));
  const safeEnemyHp = Math.max(1, normalizeNumber(enemyMaxHp, 1));

  const efficiencyRatio = safeReceived === 0 ? 4 : safeDealt / safeReceived;
  const efficiencyScore = clamp((efficiencyRatio / 4) * 40, 0, 40);

  const targetTurns = Math.max(2, Math.round(safeEnemyHp / Math.max(1, safeDealt / safeTurns)));
  const speedScore = clamp((targetTurns / safeTurns) * 30, 0, 30);

  const healthRemaining = clamp((safePlayerHp - safeReceived) / safePlayerHp, 0, 1);
  const healthScore = clamp(healthRemaining * 30, 0, 30);

  const rawScore = efficiencyScore + speedScore + healthScore;
  const score = Math.round(clamp(rawScore, 0, 100));

  let grade = 'D';
  let title = 'Pyrrhic Victory';
  if (score >= 90) {
    grade = 'S';
    title = 'Flawless Victory';
  } else if (score >= 70) {
    grade = 'A';
    title = 'Impressive Win';
  } else if (score >= 50) {
    grade = 'B';
    title = 'Solid Performance';
  } else if (score >= 30) {
    grade = 'C';
    title = 'Narrow Victory';
  }

  return { grade, title, score };
};

/**
 * Computes the XP bar percentage.
 * @param {number} xpCurrent
 * @param {number} xpForLevel
 * @returns {number}
 */
export const computeXpBarPercent = (xpCurrent, xpForLevel) => {
  const safeForLevel = Math.max(1, normalizeNumber(xpForLevel, 1));
  const safeCurrent = normalizeNumber(xpCurrent, 0);
  return clamp((safeCurrent / safeForLevel) * 100, 0, 100);
};

/**
 * Formats gold amounts with comma separators.
 * @param {number} amount
 * @returns {string}
 */
export const formatGoldAmount = (amount) => {
  const safeAmount = Math.round(normalizeNumber(amount, 0));
  return safeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Renders the rewards display HTML.
 * @param {object} rewardsState
 * @param {'rating'|'xp'|'gold'|'loot'|'complete'} animationPhase
 * @returns {string}
 */
export const renderRewardsHtml = (rewardsState, animationPhase) => {
  const phaseIndex = PHASES.indexOf(animationPhase);
  const maxIndex = phaseIndex === -1 ? 0 : phaseIndex;

  const xpBefore = normalizeNumber(rewardsState?.xpBefore, 0);
  const xpAfter = normalizeNumber(rewardsState?.xpAfter, 0);
  const xpForLevel = Math.max(1, normalizeNumber(rewardsState?.xpForLevel, 1));
  const goldGained = normalizeNumber(rewardsState?.goldGained, 0);
  const lootItems = normalizeArray(rewardsState?.lootItems);
  const battleRating = rewardsState?.battleRating ?? { grade: 'D', title: 'Pyrrhic Victory', score: 0 };
  const enemyName = escapeHtml(normalizeString(rewardsState?.enemyName, 'Enemy'));
  const leveledUp = Boolean(rewardsState?.leveledUp);
  const newLevel = normalizeNumber(rewardsState?.newLevel, 1);

  const xpOldPercent = computeXpBarPercent(xpBefore, xpForLevel);
  const xpNewPercent = computeXpBarPercent(xpAfter, xpForLevel);

  const ratingVisible = maxIndex >= 0;
  const xpVisible = maxIndex >= 1;
  const goldVisible = maxIndex >= 2;
  const lootVisible = maxIndex >= 3;

  const lootHtml = lootItems
    .map((item, index) => {
      const label = createLootLabel(item);
      const delay = `${index * 0.12}s`;
      return `
        <li class="rewards-loot-item" style="animation-delay: ${delay};">${label}</li>
      `;
    })
    .join('');

  const ratingClass = `grade-${battleRating.grade}`;
  const ratingTitle = escapeHtml(normalizeString(battleRating.title, 'Victory'));

  return `
    <section class="rewards-panel">
      <header class="rewards-header">
        <h2 class="rewards-title">Victory Over ${enemyName}</h2>
      </header>

      <div class="rewards-section rewards-rating ${ratingVisible ? 'is-visible rewards-grade-stamp' : ''}">
        <div class="rewards-grade ${ratingClass}">${escapeHtml(battleRating.grade)}</div>
        <div class="rewards-grade-title">${ratingTitle}</div>
        <div class="rewards-grade-score">Score: ${escapeHtml(String(battleRating.score))}</div>
      </div>

      <div class="rewards-section rewards-xp ${xpVisible ? 'is-visible rewards-fade-in' : ''}">
        <div class="rewards-section-title">Experience</div>
        <div class="rewards-xp-bar">
          <div
            class="rewards-xp-fill"
            style="--xp-old: ${xpOldPercent}%; --xp-new: ${xpNewPercent}%;"
          ></div>
        </div>
        <div class="rewards-xp-values">${escapeHtml(String(xpAfter))} / ${escapeHtml(
    String(xpForLevel)
  )} XP</div>
        ${
          leveledUp
            ? `<div class="rewards-level-up rewards-fade-in">Level Up! Now Level ${escapeHtml(
                String(newLevel)
              )}</div>`
            : ''
        }
      </div>

      <div class="rewards-section rewards-gold ${goldVisible ? 'is-visible rewards-fade-in' : ''}">
        <div class="rewards-section-title">Gold</div>
        <div class="rewards-gold-amount rewards-gold-pulse" data-gold="${escapeHtml(
          String(goldGained)
        )}">
          +${escapeHtml(formatGoldAmount(goldGained))}
        </div>
      </div>

      <div class="rewards-section rewards-loot ${lootVisible ? 'is-visible rewards-slide-up' : ''}">
        <div class="rewards-section-title">Loot</div>
        <ul class="rewards-loot-list">${lootHtml || '<li class="rewards-loot-item">None</li>'}</ul>
      </div>
    </section>
  `;
};

/**
 * Returns the CSS styles for the rewards animations.
 * @returns {string}
 */
export const getRewardsStyles = () => `
:root {
  --rewards-gold: #d4af37;
  --rewards-xp: #4a9eff;
  --rewards-loot: #4f4;
}

.rewards-panel {
  font-family: "Cinzel", "Garamond", serif;
  background: radial-gradient(circle at top, #1e1e2f, #0b0b14 70%);
  color: #f8f6f2;
  border: 2px solid rgba(212, 175, 55, 0.5);
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  max-width: 520px;
}

.rewards-header {
  text-align: center;
  margin-bottom: 16px;
}

.rewards-title {
  font-size: 22px;
  letter-spacing: 1px;
  margin: 0;
}

.rewards-section {
  margin-bottom: 18px;
  opacity: 0;
  transform: translateY(12px);
}

.rewards-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.rewards-section-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(248, 246, 242, 0.7);
  margin-bottom: 8px;
}

.rewards-rating {
  text-align: center;
}

.rewards-grade {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--rewards-gold);
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
}

.rewards-grade-title {
  font-size: 18px;
}

.rewards-grade-score {
  font-size: 14px;
  opacity: 0.8;
}

.grade-S { color: ${GRADE_COLORS.S}; }
.grade-A { color: ${GRADE_COLORS.A}; }
.grade-B { color: ${GRADE_COLORS.B}; }
.grade-C { color: ${GRADE_COLORS.C}; }
.grade-D { color: ${GRADE_COLORS.D}; }

.rewards-xp-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  height: 16px;
  overflow: hidden;
}

.rewards-xp-fill {
  background: linear-gradient(90deg, rgba(74, 158, 255, 0.8), rgba(74, 158, 255, 1));
  height: 100%;
  width: var(--xp-new, 0%);
  animation: rewards-xp-fill 1.2s ease-out forwards;
}

.rewards-xp-values {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.85;
}

.rewards-level-up {
  margin-top: 8px;
  padding: 6px 10px;
  border: 1px solid var(--rewards-gold);
  color: var(--rewards-gold);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  animation: rewards-level-up 0.8s ease-in-out infinite alternate;
}

.rewards-gold-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--rewards-gold);
  text-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
}

.rewards-loot-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rewards-loot-item {
  background: rgba(79, 255, 79, 0.08);
  border: 1px solid rgba(79, 255, 79, 0.25);
  margin-bottom: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--rewards-loot);
  opacity: 0;
  transform: translateY(20px);
  animation: rewards-loot-item 0.4s ease-out forwards;
}

.rewards-fade-in {
  animation: rewards-fade-in 0.5s ease-out forwards;
}

.rewards-slide-up {
  animation: rewards-slide-up 0.4s ease-out forwards;
}

.rewards-gold-pulse {
  animation: rewards-gold-pulse 0.8s ease-in-out infinite;
}

.rewards-grade-stamp {
  animation: rewards-grade-stamp 0.4s ease-out;
}

@keyframes rewards-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes rewards-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes rewards-xp-fill {
  from { width: var(--xp-old, 0%); }
  to { width: var(--xp-new, 0%); }
}

@keyframes rewards-gold-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

@keyframes rewards-grade-stamp {
  from { transform: scale(2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes rewards-loot-item {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes rewards-level-up {
  from { opacity: 0.7; }
  to { opacity: 1; }
}
`;
