import { DrawBoardGrid, DrawBoardInteraction } from './js/Draw.js';
import { BindSetStone, BindUndoStone, BindRedoStone } from './js/Event.js';

/** Default drawing on table */
DrawBoardGrid();
DrawBoardInteraction(); 


/** Default event binding */
BindSetStone();
BindUndoStone();
BindRedoStone();