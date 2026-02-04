import { setStone, gameDefaultSetting, backToPreviousState} from './js/game.js';
import { DrawBoardGrid, DrawBoardInteraction } from './js/Draw.js';
import { BoardInteraction, BackFunction } from './js/Event.js';

/** Default drawing on table */
DrawBoardGrid();
DrawBoardInteraction(); 


/** Default event binding */
BoardInteraction(setStone);
BackFunction(backToPreviousState);
gameDefaultSetting();

window.backToPreviousState = backToPreviousState;