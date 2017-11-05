const app = (() => {
  'use strict';

  /* SELECTED ELEMENTS */

  const game = document.querySelector('#game');
  const ctx = game.getContext('2d');

  //ctx.scale(1.5,1.5);

  const startButton = document.querySelector('#start-button');
  const gameTickSlider = document.querySelector('#game-tick-slider');
  const gameTickCounter = document.querySelector('#game-tick-counter');
  const patternSelector = document.querySelector('#pattern-selector');
  const generationCounter = document.querySelector('#generation-counter');

  /* OVERALL GAME SETUP */

  const state = {
    playing: false,
    generation: 0
  };

  const tileSize = 7;
  const borderWidth = 1;
  const tilePlusBorder = tileSize + borderWidth;
  const tilePlusDoubleBorder = tileSize + borderWidth * 2;
  const gameWidth = 100; // tiles
  const gameHeight = 100; // tiles

  game.width = Math.floor(gameWidth * tilePlusBorder + borderWidth);
  game.height = Math.floor(gameHeight * tilePlusBorder + borderWidth);
  
  const offScreenSpaceBefore = 50; // prevent "hard edges" effect
  const offScreenSpaceTotal = offScreenSpaceBefore * 2;

  const gameWidthTotal = gameWidth + offScreenSpaceTotal;
  const gameHeightTotal = gameHeight + offScreenSpaceTotal;

  const deadColor = '#222';
  const aliveColor = '#3b3';
  const borderColor = '#333'; //TODO: fix use of this 

  let gameTimeout;
  let animRequest;
  let activeSquare = null;

  let gameTick = 1000 / gameTickSlider.value;

  const gameArray = createGameArray();
  const newGameArray = createGameArray();

  function createGameArray() {
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

  /* EVENT LISTENERS FOR THE GAME CANVAS */

  game.addEventListener('mousedown', startMouseEvent);
  game.addEventListener('mousemove', startMouseEvent);
  game.addEventListener('mouseup', endMouseEvent);

  function startMouseEvent(e) {
    if ((e.type === 'mousedown' && e.button === 0) || (e.type === 'mousemove' && e.buttons === 1)) {

      const gameRect = game.getBoundingClientRect();
      const gameScaleX = gameRect.width / game.width;
      const gameScaleY = gameRect.height / game.height;

      const coords =
      [Math.floor((e.clientX - gameRect.left) / tilePlusBorder / gameScaleX + offScreenSpaceBefore),
      Math.floor((e.clientY - gameRect.top) / tilePlusBorder / gameScaleY + offScreenSpaceBefore)];

      if (activeSquare === null || (coords[0] !== activeSquare[0] || coords[1] !== activeSquare[1])) {
        activeSquare = coords;
        const newAliveState = gameArray[coords[1]][coords[0]] ? 0 : 1;
        gameArray[coords[1]][coords[0]] = newAliveState;
        toggleLife(coords, newAliveState);

      }
    }
  }

  function endMouseEvent(e) {
    if (e.button === 0) {
      activeSquare = null;
    }
  }

  /* OTHER EVENT LISTENERS */

  startButton.addEventListener('click', toggleGamePlay);
  gameTickSlider.addEventListener('input', changeGameTick);
  patternSelector.addEventListener('input', drawBoard);

  function toggleGamePlay(e) {
    e.preventDefault();

    if (!state.playing) {
      startGame();
    } else {
      pauseGame();
    }
  }

  function changeGameTick() {
    gameTick = 1000 / gameTickSlider.value;
    gameTickCounter.textContent = `${gameTickSlider.value}`;
  }

  function drawBoard() {
    pauseGame();

    const selected = patternSelector.value;

    if (selected === 'clear') {
      changeBoardStateTo(createGameArray());
    } else if (selected === 'random') {
      drawRandom(37.5);
      startGame();
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
      drawPattern(selected);
    }

    state.generation = 0;
    generationCounter.textContent = state.generation;
  }

  /* DRAWING STUFF ON THE BOARD */

  function drawSquare(coords, color) {
    ctx.fillStyle = borderColor;
    ctx.fillRect((coords[0] - offScreenSpaceBefore) * tilePlusBorder, (coords[1] - offScreenSpaceBefore) * tilePlusBorder, tilePlusDoubleBorder, tilePlusDoubleBorder);

    ctx.fillStyle = color;
    ctx.fillRect((coords[0] - offScreenSpaceBefore) * tilePlusBorder + borderWidth, (coords[1] - offScreenSpaceBefore) * tilePlusBorder + borderWidth, tileSize, tileSize);
  }

  function drawBg() {

    for (let rowIdx = offScreenSpaceBefore; rowIdx < gameHeight + offScreenSpaceBefore; rowIdx++) {
      for (let cellIdx = offScreenSpaceBefore; cellIdx < gameWidth + offScreenSpaceBefore; cellIdx++) {
        drawSquare([cellIdx, rowIdx], deadColor);
      }
    }

  }

  function toggleLife(coords, newAliveState) {
    const newColor = newAliveState ? aliveColor : deadColor;
    drawSquare(coords, newColor);
  }

  /* UPDATING THE OVERALL BOARD AND GAME ARRAY */

  function gameStep() {

    clearTimeout(gameTimeout);

    gameTimeout = setTimeout(() => {

      animRequest = requestAnimationFrame(gameStep);

      gameArray.forEach((row, rowIdx) => {
        if (rowIdx === 0 || rowIdx === gameArray.length - 1) {
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
            newGameArray[rowIdx][cellIdx] = gameArray[rowIdx][cellIdx];
          }
        });
      });

      changeBoardStateTo(newGameArray);

      state.generation++;
      generationCounter.textContent = state.generation;

    }, gameTick);

  }

  function getNeighborScore(cellRef) {
    let neighborScore = 0;
    const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    neighbors.forEach((neighbor) => {
      neighborScore += gameArray[cellRef[0] + neighbor[0]][cellRef[1] + neighbor[1]];
    });

    return neighborScore;
  }

  function changeBoardStateTo(newGameArray) {
    drawDiff(newGameArray);
    updateGameArrayTo(newGameArray);
  }

  function drawDiff(newGameArray) {

    for (let rowIdx = offScreenSpaceBefore; rowIdx < gameHeight + offScreenSpaceBefore; rowIdx++) {
      for (let cellIdx = offScreenSpaceBefore; cellIdx < gameWidth + offScreenSpaceBefore; cellIdx++) {
        if (gameArray[rowIdx][cellIdx] !== newGameArray[rowIdx][cellIdx]) {
          toggleLife([cellIdx, rowIdx], newGameArray[rowIdx][cellIdx]);
        }
      }
    }
  }

  function updateGameArrayTo(newGameArray) {
    gameArray.forEach((row, rowIdx) => {
      row.forEach((cell, cellIdx) => {
        if (gameArray[rowIdx][cellIdx] !== newGameArray[rowIdx][cellIdx]) {
          gameArray[rowIdx][cellIdx] = newGameArray[rowIdx][cellIdx];
        }
      });
    });
  }

  /* AUXILLIARY FUNCTIONS FOR EVENT LISTENERS */

  function startGame() {
    gameStep();
    startButton.innerHTML = 'Pause';
    state.playing = true;
  }

  function pauseGame() {
    clearTimeout(gameTimeout);
    cancelAnimationFrame(animRequest);
    startButton.innerHTML = 'Start';
    state.playing = false;
  }

  function drawPattern(name) {
    startButton.setAttribute('disabled', 'true');
    patternSelector.setAttribute('disabled', 'true');

    const url = window.location.origin === 'https://lionel-rowe.github.io'
    ? `https://lionel-rowe.github.io/GoL/patterns/${name}.rle`
    : `../patterns/${name}.rle`; // gh pages doesn't play nicely with relative URLs

    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        startButton.removeAttribute('disabled');
        patternSelector.removeAttribute('disabled');
        patternSelector.value = 'clear';
        alert('Network response not OK.');
      }
    })
    .then(text => {

      parseRle(text);

      startButton.removeAttribute('disabled');
      patternSelector.removeAttribute('disabled');

      startGame();
    });
  }

  function parseRle(text) {
    const lineBreak = /[\r\n]+/;
    const lines = text.split(lineBreak).map(l => l.trim()).filter(l => !l.match(/^#[CO]/i));

    const headerLine = lines.filter(l => l.match(/^[\s]*x/i))[0];
    const nameLine = lines.filter(l => l.match(/#N/i))[0];

    function match1(parsedString, matchRegex) {
      return parsedString.match(matchRegex) && parsedString.match(matchRegex)[1];
    }

    const x = +match1(headerLine, /x\s*=\s*(\d+)/);
    const y = +match1(headerLine, /y\s*=\s*(\d+)/);
    const rule = match1(headerLine, /rule\s*=\s*(B\d+\s*\/\s*S\d+)/i).replace(/\s/g, '').toUpperCase();
    if (nameLine) {
      const name = match1(nameLine, /(?:#N\s*)(.+)/);
    }
    const pattern = match1(text, /(?:[\r\n]+)([bo$\d\r\n]+)!/i).replace(/\s+/g, '');
    
    if (!x || !y) {
      alert('x and y must be specified');
    } else if (x > gameWidth || y > gameHeight) {
      alert(`bounding box must be within ${gameWidth} × ${gameHeight}`)
    } else if (rule && rule !== 'B3/S23') {
      alert(`Rule ${rule} not currently supported.`);
    } else {
      const patternArr = createGameArray();
      const xOffset = Math.floor(gameWidthTotal / 2 - x / 2);
      const yOffset = Math.floor(gameWidthTotal / 2 - y / 2);

      const rows = pattern.replace(/(\d)+\$/g, (m, p1) => '$'.repeat(+p1)).split('$');

      rows.forEach((row, rowIdx) => {
        const ranges = row.match(/\d*[bo]/g);

        let cellIdx = 0;
        if (ranges) {
          ranges.forEach(range => {
            const cellState = range[range.length - 1];
            const rangeLength = range.length > 1 ? +range.slice(0, -1) : 1;

            for (let i = 0; i < rangeLength; i++) {
              patternArr[rowIdx + yOffset][cellIdx + xOffset] = cellState === 'o' ? 1 : 0;
              cellIdx++;
            }

          });
        }
      });

      changeBoardStateTo(patternArr);
    }
  }



  function drawRandom(percentDensity) {

    const randomBoard = createGameArray();

    randomBoard.forEach((row, rowIdx) => {
      row.forEach((cell, cellIdx) => {
        randomBoard[rowIdx][cellIdx] = Math.random() > (percentDensity / 100) ? 0 : 1;
      });
    });

    changeBoardStateTo(randomBoard);
  }

  /* SET UP THE GAME TO START ON PAGE LOAD */

  //document.querySelector('body').style.zoom = 1 / window.devicePixelRatio;
  drawBg();
  drawBoard();
  startGame();

})();
