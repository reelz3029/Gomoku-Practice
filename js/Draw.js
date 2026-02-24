export function DrawBoardGrid() {

    for (let i = 0; i < 15; i++) {

        let Interval = (i * 7.14286) + "%";

        let Vertical = document.createElement("div");
        Vertical.className = "h-line";
        Vertical.style.top = Interval;
        document.querySelector(".board-grid-container").appendChild(Vertical);

        let Horizontal = document.createElement("div");
        Horizontal.className = "v-line";
        Horizontal.style.left = Interval;
        document.querySelector(".board-grid-container").appendChild(Horizontal);
    }
}

export function DrawBoardInteraction() {
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {

            let element = document.createElement("div");
            element.className = "board-interaction";
            element.style.top = (i * 7.14286) + "%";
            element.style.left = (j * 7.14286) + "%";
            document.querySelector(".board-grid-container").appendChild(element);

            element.dataset.x = i;
            element.dataset.y = j;
        }
    }
}

export function DrawBoardDots() {
    // 실제 오목판 화점(花點) 위치: 3, 7(천원), 11
    const starPoints = [
        [3, 3], [3, 11],
        [7, 7],
        [11, 3], [11, 11],
    ];

    for (const [row, col] of starPoints) {
        const dot = document.createElement("div");
        dot.className = "board-dot";
        dot.style.top  = (row * 7.14286) + "%";
        dot.style.left = (col * 7.14286) + "%";
        document.querySelector(".board-grid-container").appendChild(dot);
    }
}