export function BoardInteraction(bindFunction) {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('board-interaction')) {
            bindFunction(e);   
        }
    });
}