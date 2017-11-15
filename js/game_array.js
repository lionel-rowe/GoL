import {drawDiff} from './drawing.js';
import {state} from './state.js'

function updateGameArrayTo(newGameArray) {
  state.gameArray.forEach((row, rowIdx) => {
    row.forEach((cell, cellIdx) => {
      if (state.gameArray[rowIdx][cellIdx] !== newGameArray[rowIdx][cellIdx]) {
        state.gameArray[rowIdx][cellIdx] = newGameArray[rowIdx][cellIdx];
      }
    });
  });
}

export function changeBoardStateTo(newGameArray) {
  drawDiff(newGameArray);
  updateGameArrayTo(newGameArray);
}
