import { buildBoard, checkWin, isForbiddenMove, BLACK, WHITE, EMPTY } from './rule.js';
import { MP, sendAction } from './state.js';

class Table {

    tableStones = [];
    backedStone = [];
    renjuEnabled = true;
    localRole = null; // null=로컬, 'black'=흑, 'white'=백

    constructor(turnIndex){
        this.turnIndex = turnIndex;
    }

    getNextColor() {
        return this.turnIndex % 2 === 0 ? BLACK : WHITE;
    }

    isMyTurn() {
        if (!MP.active || this.localRole === null) return true;
        const nextColor = this.getNextColor();
        return (this.localRole === 'black' && nextColor === BLACK)
            || (this.localRole === 'white' && nextColor === WHITE);
    }

    setNewStone(e) {
        if (!this.isMyTurn()) return;

        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);

        const board = buildBoard(this.tableStones);
        if (board[x][y] !== EMPTY) return;

        const color = this.getNextColor();

        if (this.renjuEnabled && color === BLACK) {
            const { forbidden } = isForbiddenMove(board, x, y);
            if (forbidden) return;
        }

        if (MP.active) sendAction({ type: 'place', x, y });

        const newStone = new Stone(document.createElement("div"), x, y, color);
        this.backedStone = [];
        this.setStone(newStone);

        const newBoard = buildBoard(this.tableStones);
        if (checkWin(newBoard, x, y, color)) {
            const winner = color === BLACK ? '흑' : '백';
            setTimeout(() => this.showWinMessage(winner), 50);
        } else {
            this.updateForbiddenMarkers();
            this.updateTurnIndicator();
        }
    }

    placeRemoteStone(x, y) {
        const board = buildBoard(this.tableStones);
        if (board[x][y] !== EMPTY) return;

        const color = this.getNextColor();
        const newStone = new Stone(document.createElement("div"), x, y, color);
        this.backedStone = [];
        this.setStone(newStone);

        const newBoard = buildBoard(this.tableStones);
        if (checkWin(newBoard, x, y, color)) {
            const winner = color === BLACK ? '흑' : '백';
            setTimeout(() => this.showWinMessage(winner), 50);
        } else {
            this.updateForbiddenMarkers();
            this.updateTurnIndicator();
        }
    }

    setStone(stone) {
        this.plusTurn();
        document.querySelector(`.board-interaction[data-x='${stone.x}'][data-y='${stone.y}']`).appendChild(stone.element);
        this.tableStones.push(stone);
    }

    undoStone(e) {
        if (this.turnIndex === 0) return;
        if (MP.active) {
            const last = this.tableStones[this.tableStones.length - 1];
            const myColor = this.localRole === 'black' ? BLACK : WHITE;
            if (!last || last.color !== myColor) return;
            sendAction({ type: 'undo' });
        }
        this._doUndo();
    }

    undoRemote() { this._doUndo(); }

    _doUndo() {
        if (this.turnIndex === 0) return;
        const lastStone = this.tableStones.pop();
        this.minusTurn();
        this.backedStone.push(lastStone);
        lastStone.element.remove();
        this.hideMessage();
        this.updateForbiddenMarkers();
        this.updateTurnIndicator();
    }

    redoStone(e) {
        if (this.backedStone.length === 0) return;
        if (MP.active) sendAction({ type: 'redo' });
        this._doRedo();
    }

    redoRemote() { this._doRedo(); }

    _doRedo() {
        if (this.backedStone.length === 0) return;
        const thisStone = this.backedStone.pop();
        this.setStone(thisStone);
        this.updateForbiddenMarkers();
        this.updateTurnIndicator();
    }

    toggleRenju() {
        this.renjuEnabled = !this.renjuEnabled;
        if (MP.active) sendAction({ type: 'renju', enabled: this.renjuEnabled });
        this._applyRenju();
    }

    setRenju(enabled) {
        this.renjuEnabled = enabled;
        this._applyRenju();
    }

    _applyRenju() {
        const btn = document.querySelector('.renju-btn');
        if (btn) {
            const span = btn.querySelector('span');
            if (span) span.textContent = `렌주 금수: ${this.renjuEnabled ? 'ON' : 'OFF'}`;
            btn.classList.toggle('renju-off', !this.renjuEnabled);
        }
        this.updateForbiddenMarkers();
    }

    resetGame(role) {
        this.tableStones.forEach(s => s.element.remove());
        this.backedStone.forEach(s => s.element.remove());
        this.tableStones = [];
        this.backedStone = [];
        this.turnIndex = 0;
        this.localRole = role;
        this.hideMessage();
        this.updateForbiddenMarkers();
        this.updateTurnIndicator();
    }

    updateTurnIndicator() {
        const indicator = document.querySelector('.turn-indicator');
        if (!indicator) return;

        const nextColor = this.getNextColor();
        const isBlack = nextColor === BLACK;

        if (MP.active) {
            const myTurn = this.isMyTurn();
            indicator.textContent = myTurn ? '🔵 내 차례' : '⏳ 상대방 차례';
            indicator.className = 'turn-indicator ' + (myTurn ? 'my-turn' : 'wait-turn');
        } else {
            indicator.textContent = isBlack ? '⚫ 흑돌 차례' : '⚪ 백돌 차례';
            indicator.className = 'turn-indicator ' + (isBlack ? 'black-turn' : 'white-turn');
        }
    }

    updateForbiddenMarkers() {
        document.querySelectorAll('.forbidden-marker').forEach(el => {
            el.parentElement?.removeAttribute('data-forbidden-reason');
            el.remove();
        });

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
