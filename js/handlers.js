import {state} from './state.js';
import {startGame, pauseGame} from './timing.js';
import {parseRle, drawRandom, toggleLife} from './drawing.js';
import createGameArray from './createGameArray.js';
import {changeBoardStateTo} from './game_array.js';
import {patterns} from './patterns.js';
import {offScreenSpaceBefore} from './config.js';
import {tilePlusBorder, dPR} from './dimensions.js';

const patternSelector = document.querySelector('#pattern-selector');
const generationCounter = document.querySelector('#generation-counter');
const gameTickSlider = document.querySelector('#game-tick-slider');
const gameTickCounter = document.querySelector('#game-tick-counter');

export function startMouseEvent(e) {
  if ((e.type === 'mousedown' && e.button === 0) || (e.type === 'mousemove' && e.buttons === 1)) {

    const gameRect = game.getBoundingClientRect();
    const gameScaleX = gameRect.width / game.width;
    const gameScaleY = gameRect.height / game.height;

    const coords =
    [Math.floor((e.clientX * dPR - gameRect.left) / tilePlusBorder / gameScaleX + offScreenSpaceBefore),
    Math.floor((e.clientY * dPR - gameRect.top) / tilePlusBorder / gameScaleY + offScreenSpaceBefore)];

    if (state.activeSquare === null || (coords[0] !== state.activeSquare[0] || coords[1] !== state.activeSquare[1])) {
      state.activeSquare = coords;
      const newAliveState = state.gameArray[coords[1]][coords[0]] ? 0 : 1;
      state.gameArray[coords[1]][coords[0]] = newAliveState;
      toggleLife(coords, newAliveState);

    }
  }
}

export function endMouseEvent(e) {
  if (e.button === 0) {
    state.activeSquare = null;
  }
}

export function toggleGamePlay(e) {
  e.preventDefault();

  if (!state.playing) {
    startGame();
  } else {
    pauseGame();
  }
}

export function changeGameTick() {
  state.gameTick = 1000 / gameTickSlider.value;
  gameTickCounter.textContent = `${gameTickSlider.value}`;
}

export function drawBoard() {
  pauseGame();

  const selected = patternSelector.value;

  if (selected === 'clear') {
    changeBoardStateTo(createGameArray());
  } else if (selected === 'random') {
    drawRandom(37.5);
  } else if (selected === 'upload') {
    const fileUpload = document.createElement('input');
    fileUpload.setAttribute('type', 'file');
    fileUpload.setAttribute('accept', '.rle');
    fileUpload.addEventListener('change', () => {
      const fileReader = new FileReader;
      fileReader.readAsText(fileUpload.files[0], 'UTF-8');
      fileReader.addEventListener('load', e => parseRle(e.target.result));
    });

    fileUpload.click();
  } else {
    parseRle(patterns[selected]);
  }

  state.generation = 0;
  generationCounter.textContent = state.generation;
}
