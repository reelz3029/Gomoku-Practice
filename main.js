import { DrawBoardGrid, DrawBoardInteraction, DrawBoardDots } from './js/Draw.js';
import { BindSetStone, BindUndoStone, BindRedoStone, BindRenjuToggle } from './js/Event.js';
import { gameTable } from './js/game.js';

/** Default drawing on table */
DrawBoardGrid();
DrawBoardInteraction();
DrawBoardDots();

/** Default event binding */
BindSetStone();
BindUndoStone();
BindRedoStone();
BindRenjuToggle();

/** 초기 금수 마커 표시 */
gameTable.updateForbiddenMarkers();