import { gameTable } from './game.js';

export function BindSetStone() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('board-interaction')) {
            gameTable.setNewStone(e);
        }
    });
}

export function BindUndoStone() {
    document.addEventListener('click', (e) => {
        // toolbar 안에서만, 정확히 .back-btn을 찾음
        const btn = e.target.closest('.back-btn');
        if (btn && btn.closest('.toolbar')) {
            gameTable.undoStone(e);
        }
    });
}

export function BindRedoStone() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.redo-btn');
        if (btn && btn.closest('.toolbar')) {
            gameTable.redoStone(e);
        }
    });
}

export function BindRenjuToggle() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.renju-btn');
        if (btn && btn.closest('.toolbar')) {
            gameTable.toggleRenju();
        }
    });
}