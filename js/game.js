class Table {

    stones = [];

    constructor(turnIndex){
        this.turnIndex = turnIndex;
    }

    setNewStone(newStone){
        this.stones.push(newStone); ;
    }

    getTurn(){
        return this.turn;
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

const table = new Table(0);

export function gameDefaultSetting(){

    
}

export function setStone(e){
    
    let newStone = new Stone(document.createElement("div"), e.target.dataset.x, e.target.dataset.y, table.turnIndex);

    table.plusTurn();
    table.setNewStone(newStone);

    e.target.appendChild(newStone.element);

    console.log(table.stones);
}

export function backToPreviousState(){
    if(table.turnIndex === 0) return;

    table.minusTurn();
    table.stones.pop().element.remove();
}