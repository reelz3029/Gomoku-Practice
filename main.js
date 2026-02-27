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

// ES module은 defer로 동작하지만 initMultiUI는 getElementById를 쓰므로
// DOMContentLoaded로 한 번 더 보장
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMultiUI();
        gameTable.updateForbiddenMarkers();
        gameTable.updateTurnIndicator();
    });
} else {
    initMultiUI();
    gameTable.updateForbiddenMarkers();
    gameTable.updateTurnIndicator();
}