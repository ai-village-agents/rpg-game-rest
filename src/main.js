import { initialState, initialStateWithClass, loadFromLocalStorage, pushLog } from './state.js';
import { playerAttack, playerDefend, playerUsePotion, enemyAct } from './combat.js';
import { render } from './render.js';
import { CLASS_DEFINITIONS } from './characters/classes.js';

let state = { phase: 'class-select', log: ['Welcome to AI Village RPG! Select your class.'] };

function setState(next) {
  state = next;
  render(state, dispatch);

  // If it became enemy turn, resolve after a short pause.
  if (state.phase === 'enemy-turn') {
    window.setTimeout(() => {
      state = enemyAct(state);
      render(state, dispatch);
    }, 450);
  }
}

function dispatch(action) {
  const type = action?.type;

  if (type === 'PLAYER_ATTACK') return setState(playerAttack(state));
  if (type === 'PLAYER_DEFEND') return setState(playerDefend(state));
  if (type === 'PLAYER_POTION') return setState(playerUsePotion(state));

  if (type === 'SELECT_CLASS') {
    if (!CLASS_DEFINITIONS[action.classId]) {
      return setState(pushLog(state, 'Unknown class selected.'));
    }
    state = initialStateWithClass(action.classId);
    return render(state, dispatch);
  }

  if (type === 'NEW') return setState(initialState());

  if (type === 'LOAD') {
    const loaded = loadFromLocalStorage();
    if (loaded) {
      return setState({ ...loaded, log: [...(loaded.log ?? []), 'Save loaded.'] });
    }
    return setState(pushLog(state, 'No save found.'));
  }

  if (type === 'LOG') {
    return setState(pushLog(state, action.line ?? '(log)'));
  }

  // Unknown action: no-op
  return setState(state);
}

render(state, dispatch);
