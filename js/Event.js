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
        if (e.target.closest('.back-btn')) {
            gameTable.undoStone(e);   
        }
    });
}

export function BindRedoStone() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.redo-btn')) {
            gameTable.redoStone(e);   
        }
    });
}

export function BindRenjuToggle() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.renju-btn')) {
            gameTable.toggleRenju();
        }
    });
}