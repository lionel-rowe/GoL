const app = (() => {
  'use strict';

  /* SELECTED ELEMENTS */

  const game = document.querySelector('#game');
  const ctx = game.getContext('2d');
  const startButton = document.querySelector('#start-button');
  const gameTickSlider = document.querySelector('#game-tick-slider');
  const gameTickCounter = document.querySelector('#game-tick-counter');
  const patternSelector = document.querySelector('#pattern-selector');
  const generationCounter = document.querySelector('#generation-counter');

  const state = {
    playing: false,
    generation: 0
  };

  /* OVERALL GAME SETUP */

  const tileSize = 8;
  const gameWidth = 100;
  const gameHeight = 100;
  const offScreenSpaceBefore = 50; // prevent "hard edges" effect
  const offScreenSpaceTotal = offScreenSpaceBefore * 2;

  const bgColor = '#222';
  const aliveColor = '#3b3';

  let gameInterval;
  let activeSquare = null;

  let gameTick = gameTickSlider.value * 1000;

  const gameArray = createGameArray();
  const newGameArray = createGameArray();

  function createGameArray() {
    const createdArray = new Array(gameHeight + offScreenSpaceTotal).fill(0).map(() => new Array(gameWidth + offScreenSpaceTotal).fill(0));

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

      const coords =
      [Math.floor((e.clientX - game.getBoundingClientRect().left) / tileSize + offScreenSpaceBefore),
      Math.floor((e.clientY - game.getBoundingClientRect().top) / tileSize + offScreenSpaceBefore)];

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
  gameTickSlider.addEventListener('change', changeGameTick);
  patternSelector.addEventListener('change', drawBoard);

  function toggleGamePlay(e) {
    e.preventDefault();

    if (!state.playing) {
      startGame();
    } else {
      pauseGame();
    }
  }

  function changeGameTick() {
    gameTick = gameTickSlider.value * 1000;
    gameTickCounter.textContent = `${gameTickSlider.value}s`;
    if (state.playing) {
      clearInterval(gameInterval);
      gameInterval = setInterval(gameStep, gameTick);
    }
  }

  function drawBoard() {
    pauseGame();

    if (patternSelector.value === 'random') {
      drawRandom(35);
    } else if (patternSelector.value === 'clear') {
      changeBoardStateTo(createGameArray());
    } else {
      drawPattern(patternSelector.value);
    }

    state.generation = 0;
    generationCounter.textContent = state.generation;

  }

  /* DRAWING STUFF ON THE BOARD */

  function drawSquare(coords, color) {
    ctx.fillStyle = bgColor;
    ctx.fillRect((coords[0] - offScreenSpaceBefore) * tileSize, (coords[1] - offScreenSpaceBefore) * tileSize, tileSize, tileSize);

    ctx.fillStyle = color;
    ctx.fillRect((coords[0] - offScreenSpaceBefore) * tileSize + 1, (coords[1] - offScreenSpaceBefore) * tileSize + 1, tileSize - 2, tileSize - 2);
  }

  function drawBg() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, game.width, game.height);
  }

  function toggleLife(coords, newAliveState) {
    const newColor = newAliveState ? aliveColor : bgColor;
    drawSquare(coords, newColor);
  }

  /* UPDATING THE OVERALL BOARD AND GAME ARRAY */

  function gameStep() {

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
    gameInterval = setInterval(gameStep, gameTick);
    startButton.innerHTML = 'Pause';
    state.playing = true;
  }

  function pauseGame() {
    clearInterval(gameInterval);
    startButton.innerHTML = 'Start';
    state.playing = false;
  }

  function drawPattern(name) { //string name of pattern in ../patterns dir (excluding extension)
    startButton.setAttribute('disabled', 'true');
    patternSelector.setAttribute('disabled', 'true');

    const url = window.location.origin === 'https://lionel-rowe.github.io'
    ? `https://lionel-rowe.github.io/GoL/patterns/${name}.json`
    : `../patterns/${name}.json`; // gh pages doesn't play nicely with relative URLs

    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        startButton.removeAttribute('disabled');
        patternSelector.removeAttribute('disabled');
        patternSelector.value = 'clear';
        throw new Error('Network response not OK.');
      }
    })
    .then(json => {
      const pattern = createGameArray();

      json.aliveCells.forEach((cell) => {
        pattern[cell[1]][cell[0]] = 1;
      });

      changeBoardStateTo(pattern);
      startButton.removeAttribute('disabled');
      patternSelector.removeAttribute('disabled');
    });
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

  /* UTILITY TO GET PATTERN JSON FROM BOARD STATE */

  function getBoardStateObj(xFrom, yFrom, xTo, yTo) { // exclude anything outside that area

    const boardStateObj = {aliveCells: []};

    for (let y = yFrom; y < yTo; y++) {
      for (let x = xFrom; x < xTo; x++) {
        if (gameArray[y][x] === 1) {
          boardStateObj.aliveCells.push([x, y]);
        }
      }
    }

    return boardStateObj;
  }

  /* SET UP THE GAME TO START ON PAGE LOAD */

  drawBg();
  drawBoard();
  startGame();

  return {
    getBoardStateObj
  };

  //^ for creating new patterns

})();
