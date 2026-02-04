import {getInteractionContainer} from './Draw.js';

let currentGameTurn = 0;
let tableInfo = [];

class Table {
    constructor(x, y, isValidStone, turn){
        this.x = x;
        this.y = y;
        this.isValidStone = isValidStone;
        this.turn = turn;
    }
}

export function gameDefaultSetting(){
    defaultStoneSet();
}

export function setStone(e){
    console.log(e.target);

    currentGameTurn += 1;

    let element = document.createElement("div");
    element.className = currentGameTurn % 2 === 1 ? "stone black-stone" : "stone white-stone";
    e.target.appendChild(element);
}

function defaultStoneSet(){

    for(let i = 0; i < 15; i++){
        for(let j = 0; j < 15; j++){
            tableInfo.push(new Table(i, j, false, -1));
        }
    }

    console.log(tableInfo);
}