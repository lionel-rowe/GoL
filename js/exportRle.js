import {gameWidth, gameHeight, offScreenSpaceBefore} from './config.js';
import {state} from './state.js';

export default function exportRle() {

  const data = {
    startX: gameWidth,
    startY: gameHeight,
    endX: 0,
    endY: 0,
    x: 0,
    y: 0,
    aliveRows: []
  };

  for (let rowIdx = offScreenSpaceBefore; rowIdx < gameHeight + offScreenSpaceBefore; rowIdx++) {

    const row = state.gameArray[rowIdx].slice(offScreenSpaceBefore, gameWidth + offScreenSpaceBefore);
    const firstAliveIdx = row.indexOf(1);
    const lastAliveIdx = row.lastIndexOf(1);
    
    if (firstAliveIdx > -1) {
      data.aliveRows.push({rowIdx: rowIdx, cells: row});

      if (firstAliveIdx < data.startX) {
        data.startX = firstAliveIdx;
      }
      if (lastAliveIdx > data.endX) {
        data.endX = lastAliveIdx;
      }
    }
  }

  data.startY = data.aliveRows[0].rowIdx;
  data.endY = data.aliveRows[data.aliveRows.length - 1].rowIdx;

  data.x = data.endX - data.startX + 1;
  data.y = data.endY - data.startY + 1;

  //convert cell data to a 1D array marking end of rows

  let cells1d = [];
  let prevIdx;

  data.aliveRows.forEach((row, idx) => {
    if (idx !== 0) {
      for (let i = prevIdx; i < row.rowIdx; i++) {
        cells1d.push('$');
      }
    }
    cells1d = cells1d.concat(row.cells.slice(data.startX, row.cells.lastIndexOf(1) + 1));
    prevIdx = row.rowIdx;
  });

  //convert data in 1d arr into RLE format

  const rleSyntax = {0: 'b', 1: 'o', $: '$'};

  let rlePatternData = '';
  let prevVal = null;
  let sameCount = 0;

  cells1d.forEach((val, idx) => {
    if (val !== prevVal && prevVal !== null) {
      rlePatternData += (sameCount === 1 ? '' : sameCount) + rleSyntax[prevVal];
      sameCount = 1;
    } else {
      sameCount++;
    }

    prevVal = val;

    if (idx === cells1d.length - 1) {
      rlePatternData += (sameCount === 1 ? '' : sameCount) + rleSyntax[prevVal];
    }

  });

  rlePatternData += '!';

  //split into lines of max 70 chars

  rlePatternData = rlePatternData.match(/.{1,70}/g).join('\n');

  //create the file string

  const rleString = 
`x = ${data.x}, y = ${data.y}, rule = B3/S23
${rlePatternData}
`;

  const uri = `data:text/plain;charset=utf-8,${encodeURIComponent(rleString)}`;

  const dummyLink = document.createElement('a');
  dummyLink.setAttribute('download', 'GoL_pattern.rle');
  dummyLink.setAttribute('href', uri);
  dummyLink.click();

}
