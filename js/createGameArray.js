import {gameHeightTotal, gameWidthTotal} from './dimensions.js';

export default function createGameArray() {
  const createdArray = new Array(gameHeightTotal).fill(0).map(() => new Array(gameWidthTotal).fill(0));

  // Edges of the array are instadeath zones

  createdArray[0] = createdArray[0].map(() => 8);
  createdArray[createdArray.length - 1] = createdArray[0].map(() => 8);

  createdArray.forEach(row => {
    row[0] = 8;
    row[row.length - 1] = 8;
  });

  return createdArray;

}
