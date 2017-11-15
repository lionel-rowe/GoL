import {state} from './state.js';

export function getNeighborScore(cellRef) {
  let neighborScore = 0;
  const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  neighbors.forEach((neighbor) => {
    neighborScore += state.gameArray[cellRef[0] + neighbor[0]][cellRef[1] + neighbor[1]];
  });

  return neighborScore;
}
