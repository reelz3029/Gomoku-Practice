import { DrawBoardGrid, DrawBoardInteraction, DrawBoardDots } from './js/Draw.js';
import { BindSetStone, BindUndoStone, BindRedoStone, BindRenjuToggle } from './js/Event.js';
import { gameTable } from './js/game.js';
import { initMultiUI } from './js/multi.js';

DrawBoardGrid();
DrawBoardInteraction();
DrawBoardDots();

BindSetStone();
BindUndoStone();
BindRedoStone();
BindRenjuToggle();

initMultiUI();

gameTable.updateForbiddenMarkers();
gameTable.updateTurnIndicator();
