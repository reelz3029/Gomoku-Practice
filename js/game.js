class Table {

    tableStones = [];
    backedStone = [];

    constructor(turnIndex){
        this.turnIndex = turnIndex;
    }

    setNewStone(e) {

        const newStone = new Stone(document.createElement("div"), e.target.dataset.x, e.target.dataset.y, this.turnIndex);

        this.backedStone = [];

        this.setStone(newStone);    
    }

    setStone(stone) {

        this.plusTurn();

        const somethign = document.querySelector(`.board-interaction[data-x='${stone.x}'][data-y='${stone.y}']`).appendChild(stone.element);

        console.log(somethign);

        this.tableStones.push(stone);

    }

    undoStone(e) {
        if (this.turnIndex === 0) return;

        const lastStone = this.tableStones.pop();

        this.minusTurn();
        this.backedStone.push(lastStone);
        lastStone.element.remove();
    }

    redoStone(e) {
        if(this.backedStone.length === 0) return;

        const thisStone = this.backedStone.pop();
        console.log(thisStone);
        
        this.setStone(thisStone);

    }

    getTurn(){
        return this.turnIndex;
    }

    plusTurn(){
        this.turnIndex += 1;
    }
    minusTurn(){
        this.turnIndex -= 1;
    }
}

class Stone {
    constructor(element = document.createElement("div"), x = 0, y = 0, turnIndex = 1){
        this.element = element;
        this.x = x;
        this.y = y;
        this.turnIndex = turnIndex;

        this.setStoneColor();
    }     

    setStoneColor() {
        this.turnIndex % 2 === 0 ? this.element.className = "stone black-stone" : this.element.className = "stone white-stone";
    }

}

export var gameTable  = new Table(0);