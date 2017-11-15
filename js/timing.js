import {state} from './state.js';
import {changeBoardStateTo} from './game_array.js';
import {getNeighborScore} from './math.js';
import createGameArray from './createGameArray.js';

const startButton = document.querySelector('#start-button');
const generationCounter = document.querySelector('#generation-counter');

const newGameArray = createGameArray();

let gameTimeout;
let animRequest;

export function startGame() {
  gameStep();
  startButton.innerHTML = 'Pause';
  state.playing = true;
}

export function pauseGame() {
  clearTimeout(gameTimeout);
  cancelAnimationFrame(animRequest);
  startButton.innerHTML = 'Start';
  state.playing = false;
}

export function gameStep() {

  clearTimeout(gameTimeout);

  gameTimeout = setTimeout(() => {

    animRequest = requestAnimationFrame(gameStep);

    state.gameArray.forEach((row, rowIdx) => {
      if (rowIdx === 0 || rowIdx === state.gameArray.length - 1) {
        return;
      }
      row.forEach((cell, cellIdx) => {
        if (cellIdx === 0 || cellIdx === row.length - 1) {
          return;
        }
        const neighborScore = getNeighborScore([rowIdx, cellIdx]);
        if (neighborScore < 2 || neighborScore > 3) {
          newGameArray[rowIdx][cellIdx] = 0;
        } else if (neighborScore === 3) {
          newGameArray[rowIdx][cellIdx] = 1;
        } else {
          newGameArray[rowIdx][cellIdx] = state.gameArray[rowIdx][cellIdx];
        }
      });
    });

    changeBoardStateTo(newGameArray);

    state.generation++;
    generationCounter.textContent = state.generation;

  }, state.gameTick);

}
