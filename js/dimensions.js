import {useDevicePixelRatio, baseTileSize, baseBorderWidth, offScreenSpaceBefore, gameWidth, gameHeight} from './config.js';

const game = document.querySelector('#game');

export const dPR = window.devicePixelRatio && useDevicePixelRatio ? window.devicePixelRatio : 1;

game.style.zoom = 1 / dPR;

export const borderWidth = Math.floor(baseBorderWidth * dPR);
export const tileSize = Math.ceil(baseTileSize * dPR);

export const tilePlusBorder = tileSize + borderWidth;
export const tilePlusDoubleBorder = tileSize + borderWidth * 2;
export const offScreenSpaceTotal = offScreenSpaceBefore * 2;
export const gameWidthTotal = gameWidth + offScreenSpaceTotal;
export const gameHeightTotal = gameHeight + offScreenSpaceTotal;

game.width = Math.floor(gameWidth * tilePlusBorder + borderWidth);
game.height = Math.floor(gameHeight * tilePlusBorder + borderWidth);
