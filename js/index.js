import {startMouseEvent, endMouseEvent, toggleGamePlay, changeGameTick, drawBoard} from './handlers.js';
import {gameStep, startGame} from './timing.js';
import {state} from './state.js';
import exportRle from './exportRle.js';
import {drawBg} from './drawing.js';

import {gameWidth, gameHeight} from './config.js';
import {borderWidth, tilePlusBorder} from './dimensions.js';

const app = (() => {
  'use strict';

  /* SELECTED ELEMENTS */

  const game = document.querySelector('#game');

  const gameTickSlider = document.querySelector('#game-tick-slider');
  const gameTickCounter = document.querySelector('#game-tick-counter');
  const patternSelector = document.querySelector('#pattern-selector');
  const downloadLink = document.querySelector('#download-link');
  const startButton = document.querySelector('#start-button');

  /* OVERALL GAME SETUP */

  state.gameTick = 1000 / gameTickSlider.value;

  /* EVENT LISTENERS */

  game.addEventListener('mousedown', startMouseEvent);
  game.addEventListener('mousemove', startMouseEvent);
  game.addEventListener('mouseup', endMouseEvent);

  startButton.addEventListener('click', toggleGamePlay);
  gameTickSlider.addEventListener('input', changeGameTick);
  patternSelector.addEventListener('input', drawBoard);
  downloadLink.addEventListener('click', exportRle);

  /* STARTING THE GAME */

  drawBg();
  drawBoard();
  startGame();

})();
