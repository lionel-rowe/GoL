import createGameArray from './createGameArray.js';

export const state = {
  playing: false,
  generation: 0,
  activeSquare: null,
  gameTick: Infinity,
  gameArray: createGameArray()
};
