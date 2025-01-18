import {Alg} from "cubing/alg";
import {cube3x3x3} from "cubing/puzzles";

const MoveColor = Object.freeze({
    RED: "red",
    GREEN: "green",
    YELLOW: "yellow",
    WHITE: "white",
    GRAY: "gray"
})

class ColoredMove {
    constructor(move, index, color = MoveColor.WHITE, isCurrent = false) {
        this.move = move;
        this.index = index;
        this.color = color;
        this.isCurrent = isCurrent;
    }
}

const getInverseMoves = (cubeMoves, startWrongIndex) =>
    new Alg(cubeMoves.slice(startWrongIndex).join(" "))
        .experimentalSimplify({cancel: true, puzzleLoader: cube3x3x3})
        .invert()
        .toString()
        .split(" ")
        .map((el, index) => new ColoredMove(el, index, MoveColor.RED));

export {
    MoveColor,
    ColoredMove,
    getInverseMoves
}