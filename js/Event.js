export function BoardInteraction(bindFunction) {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('board-interaction')) {
            bindFunction(e);   
        }
    });
}

export function BackFunction(bindFunction) {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('back-btn')) {
            bindFunction(e);   
        }
    });
}