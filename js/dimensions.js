import {tileSize, borderWidth, offScreenSpaceBefore, gameWidth, gameHeight} from './config.js';

export const tilePlusBorder = tileSize + borderWidth;
export const tilePlusDoubleBorder = tileSize + borderWidth * 2;
export const offScreenSpaceTotal = offScreenSpaceBefore * 2;
export const gameWidthTotal = gameWidth + offScreenSpaceTotal;
export const gameHeightTotal = gameHeight + offScreenSpaceTotal;
