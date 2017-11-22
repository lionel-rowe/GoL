import {state} from './state.js';

import {offScreenSpaceBefore, gameWidth, gameHeight} from './config.js';

const neighborArray = new Array(offScreenSpaceBefore * 2 + gameHeight).fill(0).map(el => new Array(offScreenSpaceBefore * 2 + gameWidth)); // more performant than recalculating neighbor coords every time

for (let rowIdx = 0; rowIdx < neighborArray.length; rowIdx++) {
  for (let cellIdx = 0; cellIdx < neighborArray[rowIdx].length; cellIdx++) {
    neighborArray[rowIdx][cellIdx] = [
      [rowIdx - 1, cellIdx - 1],
      [rowIdx - 1, cellIdx    ],
      [rowIdx - 1, cellIdx + 1],
      [rowIdx,     cellIdx - 1],
      [rowIdx,     cellIdx + 1],
      [rowIdx + 1, cellIdx - 1],
      [rowIdx + 1, cellIdx    ],
      [rowIdx + 1, cellIdx + 1]
    ];
  }
}

export function getNeighborScore(cellRef) {
  let neighborScore = 0;
  const neighbors = neighborArray[cellRef[0]][cellRef[1]];

  neighbors.forEach((neighbor) => {
    neighborScore += state.gameArray[neighbor[0]][neighbor[1]];
  });

  return neighborScore;
}
