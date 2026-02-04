import { setStone, gameDefaultSetting } from './js/game.js';
import { DrawBoardGrid, DrawBoardInteraction } from './js/Draw.js';
import { BoardInteraction } from './js/Event.js';

/** Default drawing on table */
DrawBoardGrid();
DrawBoardInteraction(); 


/** Default event binding */
BoardInteraction(setStone);
gameDefaultSetting();