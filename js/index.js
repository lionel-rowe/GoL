const app = (() => {
  'use strict';
  const game = document.querySelector('#game');
  const ctx = game.getContext('2d');
  const startButton = document.querySelector('#start-button');

  const state = {
    playing: false
  };

  const tileSize = 8;
  const gameWidth = 100;
  const gameHeight = 100;
  const gameTick = 100; //ms

  const offScreenSpaceBefore = 50;
  const offScreenSpaceTotal = offScreenSpaceBefore * 2;

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

  const bgColor = '#222';
  const aliveColor = '#3b3';

  let gameInterval;
  let activeSquare = null;

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

  function toggleLife(coords, newAliveState) {
    const newColor = newAliveState ? aliveColor : bgColor;
    drawSquare(coords, newColor);
  }

  function drawSquare(coords, color) {
    ctx.fillStyle = bgColor;
    ctx.fillRect((coords[0] - offScreenSpaceBefore) * tileSize, (coords[1] - offScreenSpaceBefore) * tileSize, tileSize, tileSize);

    ctx.fillStyle = color;
    ctx.fillRect((coords[0] - offScreenSpaceBefore) * tileSize + 1, (coords[1] - offScreenSpaceBefore) * tileSize + 1, tileSize - 2, tileSize - 2);
  }

  function clearScreen() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, game.width, game.height);
  }

  function getNeighborScore(cellRef) {
    let neighborScore = 0;
    const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    neighbors.forEach((neighbor) => {
      neighborScore += gameArray[cellRef[0] + neighbor[0]][cellRef[1] + neighbor[1]];
    });

    return neighborScore;
  }

  function updateGame() {

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

    drawDiff(gameArray, newGameArray);
    updateGameArray(gameArray, newGameArray);

    //TODO: see if possible to iterate only once over the array

  }

  function drawDiff(gameArray, newGameArray) {

    for (let rowIdx = offScreenSpaceBefore; rowIdx < gameHeight + offScreenSpaceBefore; rowIdx++) {
      for (let cellIdx = offScreenSpaceBefore; cellIdx < gameWidth + offScreenSpaceBefore; cellIdx++) {
        if (gameArray[rowIdx][cellIdx] !== newGameArray[rowIdx][cellIdx]) {
          toggleLife([cellIdx, rowIdx], newGameArray[rowIdx][cellIdx]);
        }
      }
    }
  }

  function updateGameArray(gameArray, newGameArray) {
    gameArray.forEach((row, rowIdx) => {
      row.forEach((cell, cellIdx) => {
        gameArray[rowIdx][cellIdx] = newGameArray[rowIdx][cellIdx];
      });
    });
  }

  function init() {
    clearScreen();
  }

  init();

  function toggleGamePlay() {

    state.playing = !state.playing;

    if (state.playing) {
      gameInterval = setInterval(updateGame, gameTick);
      startButton.innerHTML = 'Pause';
    } else {
      clearInterval(gameInterval);
      startButton.innerHTML = 'Start';
    }
  }

  startButton.onclick = toggleGamePlay;

  function getGameBoard() {
    console.log(JSON.stringify(gameArray));
  }

  function drawGosperGun() {
    
    fetch('../automata/gosper_gun.json')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          startButton.removeAttribute('disabled');
          throw new Error('Network response not OK.');
        }
      })
      .then(gosperGun => {
        drawDiff(gameArray, gosperGun);
        updateGameArray(gameArray, gosperGun);
        startButton.removeAttribute('disabled');
      });

  }

  drawGosperGun();

  /*return {
    getGameBoard,
    drawGosperGun
  };*/ //for debugging

})();
