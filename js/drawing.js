import {offScreenSpaceBefore, gameWidth, gameHeight, deadColor, aliveColor, borderColor} from './config.js';
import {borderWidth, tileSize, tilePlusBorder, gameWidthTotal, tilePlusDoubleBorder} from './dimensions.js';
import createGameArray from './createGameArray.js';
import {changeBoardStateTo} from './game_array.js';
import {state} from './state.js';

const ctx = document.querySelector('#game').getContext('2d');

function match1(parsedString, matchRegex) {
  return parsedString.match(matchRegex) && parsedString.match(matchRegex)[1] || '';
}

export function parseRle(text) {
  const lineBreak = /[\r\n]+/;
  const lines = text.split(lineBreak).map(l => l.trim()); //TODO: remove this var entirely

  const headerLine = lines.filter(l => l.match(/^[\s]*x/i))[0];
  // const nameLine = lines.filter(l => l.match(/#N/i))[0];

  const x = +match1(headerLine, /x\s*=\s*(\d+)/);
  const y = +match1(headerLine, /y\s*=\s*(\d+)/);
  const rule = match1(headerLine, /rule\s*=\s*(B\d+\s*\/\s*S\d+)/i).replace(/\s/g, '').toUpperCase();
  // if (nameLine) {
  //   const name = match1(nameLine, /(?:#N\s*)(.+)/);
  // }
  const pattern = match1(text, /(?:[\r\n]+)([bo$\d\r\n]+)!/i).replace(/\s+/g, '');
  
  if (!x || !y) {
    alert('x and y must be specified');
  } else if (x > gameWidth || y > gameHeight) {
    alert(`bounding box must be within ${gameWidth} × ${gameHeight}`)
  } else if (rule && rule !== 'B3/S23') {
    alert(`Rule ${rule} not currently supported.`);
  } else {
    const patternArr = createGameArray();
    const offsetX = Math.floor(gameWidthTotal / 2 - x / 2);
    const offsetY = Math.floor(gameWidthTotal / 2 - y / 2);

    const rows = pattern.replace(/(\d)+\$/g, (m, p1) => '$'.repeat(+p1)).split('$');

    rows.forEach((row, rowIdx) => {
      const ranges = row.match(/\d*[bo]/g);

      let cellIdx = 0;
      if (ranges) {
        ranges.forEach(range => {
          const cellState = range[range.length - 1];
          const rangeLength = range.length > 1 ? +range.slice(0, -1) : 1;

          for (let i = 0; i < rangeLength; i++) {
            patternArr[rowIdx + offsetY][cellIdx + offsetX] = cellState === 'o' ? 1 : 0;
            cellIdx++;
          }

        });
      }
    });

    changeBoardStateTo(patternArr);
  }
}

export function drawRandom(percentDensity) {

  const randomBoard = createGameArray();

  randomBoard.forEach((row, rowIdx) => {
    row.forEach((cell, cellIdx) => {
      randomBoard[rowIdx][cellIdx] = Math.random() > (percentDensity / 100) ? 0 : 1;
    });
  });

  changeBoardStateTo(randomBoard);
}

export function drawDiff(newGameArray) {

  for (let rowIdx = offScreenSpaceBefore; rowIdx < gameHeight + offScreenSpaceBefore; rowIdx++) {
    for (let cellIdx = offScreenSpaceBefore; cellIdx < gameWidth + offScreenSpaceBefore; cellIdx++) {
      if (state.gameArray[rowIdx][cellIdx] !== newGameArray[rowIdx][cellIdx]) {
        toggleLife([cellIdx, rowIdx], newGameArray[rowIdx][cellIdx]);
      }
    }
  }
}

function drawSquare(coords, color) {
  ctx.fillStyle = borderColor;
  ctx.fillRect((coords[0] - offScreenSpaceBefore) * tilePlusBorder, (coords[1] - offScreenSpaceBefore) * tilePlusBorder, tilePlusDoubleBorder, tilePlusDoubleBorder);

  ctx.fillStyle = color;
  ctx.fillRect((coords[0] - offScreenSpaceBefore) * tilePlusBorder + borderWidth, (coords[1] - offScreenSpaceBefore) * tilePlusBorder + borderWidth, tileSize, tileSize);
}

export function drawBg() {

  for (let rowIdx = offScreenSpaceBefore; rowIdx < gameHeight + offScreenSpaceBefore; rowIdx++) {
    for (let cellIdx = offScreenSpaceBefore; cellIdx < gameWidth + offScreenSpaceBefore; cellIdx++) {
      drawSquare([cellIdx, rowIdx], deadColor);
    }
  }

}

export function toggleLife(coords, newAliveState) {
  const newColor = newAliveState ? aliveColor : deadColor;
  drawSquare(coords, newColor);
}
