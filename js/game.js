import { buildBoard, checkWin, isForbiddenMove, BLACK, WHITE, EMPTY } from './rule.js';

class Table {

    tableStones = [];
    backedStone = [];
    renjuEnabled = true;

    constructor(turnIndex){
        this.turnIndex = turnIndex;
    }

    // turnIndex가 짝수(0,2,4...) → 흑, 홀수(1,3,5...) → 백
    // (놓기 전 turnIndex 기준)
    getNextColor() {
        return this.turnIndex % 2 === 0 ? BLACK : WHITE;
    }

    // ── 돌 놓기 ──────────────────────────────────────────
    setNewStone(e) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);

        const board = buildBoard(this.tableStones);
        if (board[x][y] !== EMPTY) return;

        const color = this.getNextColor();

        // 흑 차례이고 렌주 ON이면 금수 클릭 차단
        if (this.renjuEnabled && color === BLACK) {
            const { forbidden } = isForbiddenMove(board, x, y);
            if (forbidden) return;
        }

        const newStone = new Stone(document.createElement("div"), x, y, color);
        this.backedStone = [];
        this.setStone(newStone);

        // 승리 체크
        const newBoard = buildBoard(this.tableStones);
        if (checkWin(newBoard, x, y, color)) {
            const winner = color === BLACK ? '흑' : '백';
            setTimeout(() => this.showWinMessage(winner), 50);
        } else {
            this.updateForbiddenMarkers();
        }
    }

    setStone(stone) {
        this.plusTurn();
        document.querySelector(`.board-interaction[data-x='${stone.x}'][data-y='${stone.y}']`).appendChild(stone.element);
        this.tableStones.push(stone);
    }

    undoStone(e) {
        if (this.turnIndex === 0) return;
        const lastStone = this.tableStones.pop();
        this.minusTurn();
        this.backedStone.push(lastStone);
        lastStone.element.remove();
        this.hideMessage();
        this.updateForbiddenMarkers();
    }

    redoStone(e) {
        if (this.backedStone.length === 0) return;
        const thisStone = this.backedStone.pop();
        this.setStone(thisStone);
        this.updateForbiddenMarkers();
    }

    // ── 렌주 토글 ────────────────────────────────────────
    toggleRenju() {
        this.renjuEnabled = !this.renjuEnabled;
        const btn = document.querySelector('.renju-btn');
        if (btn) {
            const span = btn.querySelector('span');
            if (span) span.textContent = `렌주 금수: ${this.renjuEnabled ? 'ON' : 'OFF'}`;
            btn.classList.toggle('renju-off', !this.renjuEnabled);
        }
        this.updateForbiddenMarkers();
    }

    // ── 금수 X 마커 갱신 ─────────────────────────────────
    updateForbiddenMarkers() {
        // 기존 마커 전부 제거
        document.querySelectorAll('.forbidden-marker').forEach(el => {
            el.parentElement?.removeAttribute('data-forbidden-reason');
            el.remove();
        });

        // 렌주 OFF이거나 다음 차례가 백이면 표시 안 함
        // setStone()에서 plusTurn()을 호출하므로, 이 시점의 turnIndex는 이미 +1된 상태
        // 짝수 → 다음은 흑 차례
        const nextIsBlack = this.turnIndex % 2 === 0;
        if (!this.renjuEnabled || !nextIsBlack) return;

        const board = buildBoard(this.tableStones);

        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (board[x][y] !== EMPTY) continue;
                const { forbidden, reason } = isForbiddenMove(board, x, y);
                if (!forbidden) continue;

                const cell = document.querySelector(`.board-interaction[data-x='${x}'][data-y='${y}']`);
                if (!cell) continue;

                const marker = document.createElement('div');
                marker.className = 'forbidden-marker';
                cell.dataset.forbiddenReason = reason;
                cell.appendChild(marker);
            }
        }
    }

    // ── 승리 메시지 ──────────────────────────────────────
    showWinMessage(winner) {
        document.querySelectorAll('.forbidden-marker').forEach(el => el.remove());

        let msg = document.querySelector('.game-message');
        if (!msg) {
            msg = document.createElement('div');
            msg.className = 'game-message';
            document.body.appendChild(msg);
        }
        msg.textContent = `🎉 ${winner}돌 승리!`;
        msg.classList.add('win');
        msg.classList.remove('hidden');
    }

    hideMessage() {
        const msg = document.querySelector('.game-message');
        if (msg) msg.classList.add('hidden');
    }

    getTurn(){ return this.turnIndex; }
    plusTurn(){ this.turnIndex += 1; }
    minusTurn(){ this.turnIndex -= 1; }
}

class Stone {
    constructor(element = document.createElement("div"), x = 0, y = 0, color = BLACK){
        this.element = element;
        this.x = x;
        this.y = y;
        this.color = color;
        this.setStoneColor();
    }

    setStoneColor() {
        this.color === BLACK
            ? this.element.className = "stone black-stone"
            : this.element.className = "stone white-stone";
    }
}

export var gameTable = new Table(0);
