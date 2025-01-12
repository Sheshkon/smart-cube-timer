import {randomScrambleForEvent} from "cubing/scramble";
import {Alg} from "cubing/alg";
import {cube3x3x3} from "cubing/puzzles";
import {activateTimer, timerState} from "./timer.ts";


const scrambleDiv = document.getElementById("scramble-display");


let scramble: Alg | null = null

interface ColoredMoveInterface {
    move: string;
    color: "white" | "gray" | "red" | "yellow"
    isCurrent: boolean;
}

class ColoredMove implements ColoredMoveInterface{

    constructor(
        public move: string = "",
        public color: "white" | "gray" | "red" | "yellow" = "white",
        public isCurrent: boolean = false
    ) {}
}

const generateScramble = async () => {
    scramble = await randomScrambleForEvent("333");

    scrambleDiv!.innerHTML = scramble.toString().split(" ").map((move, index) => colorizeMove(move, "white", index === 0)).join("");
    return scramble
}


const checkScramble = (cubeMoves: string[]): string => {
    const scrambleMoves = scramble?.toString().split(" ");

    if(timerState == "RUNNING"){
        return ""
    }

    let wrongCounter = 0;
    let inverseMoves = "";
    let startWrongIndex = 0

    let coloredMoves: Array<ColoredMove>| undefined = scrambleMoves?.map((move, index) => {
        if (move === cubeMoves[index] && wrongCounter === 0) {
            return new ColoredMove(move, 'gray')
        }

        if ((index > cubeMoves.length - 1 || cubeMoves[index] === "")
            || (move.includes('2') && move.replace("2", "") === cubeMoves[index].replace(/'/g, ""))) {
            return new ColoredMove(move)
        }

        if (move !== cubeMoves[index] && wrongCounter === 0) {
            wrongCounter++
            startWrongIndex = index;
            if (move.replace(/'/g, "") === cubeMoves[index].replace(/'/g, "")) {
                return new ColoredMove(move, "yellow");  // Совпали буквы, но направление неверное: желтый
            }
        }

        if (wrongCounter > 0) {
            wrongCounter++;
            return new ColoredMove(move, "red");
        }

        return new ColoredMove(move)
    });

    const currentMoveIndex = coloredMoves ? coloredMoves.findIndex((el: ColoredMove) => el.color === "white") : 0;
    console.log("current: ", currentMoveIndex)
    const coloredScramble = coloredMoves?.map((el, index) => colorizeMove(el.move, el.color, index === currentMoveIndex)).join("")

    if (wrongCounter > 1) {
        inverseMoves = new Alg(cubeMoves.slice(startWrongIndex, cubeMoves.length).join(" "))
            .experimentalSimplify({cancel: true, puzzleLoader: cube3x3x3})
            .invert()
            .toString()
            .split(" ")
            .map(el => colorizeMove(el, "red"))
            .join(" ");

        console.log("invert: ", inverseMoves);
        console.log("cubeMoves", cubeMoves.toString());
        console.log("wrongCounter", wrongCounter);
        scrambleDiv!.innerHTML = `${inverseMoves}`;
    } else {
        scrambleDiv!.innerHTML = coloredScramble ?? "";
        console.log("cubeMoves.length", cubeMoves.length);
        console.log("scramble.length", scrambleMoves?.length);
    }


    // @ts-ignore
    if(wrongCounter === 0 && cubeMoves.length === scrambleMoves?.length && timerState !== "RUNNING") {
        activateTimer();
        scrambleDiv!.innerHTML = ""
        return ""
    }

    return <string>coloredScramble;
};




const colorizeMove = (move: string, color: string = "white", isCurrent = false): string => {
    return `<span ${isCurrent ? "class='is-current-move'" : ""} style="color: ${color};">${move}</span>`;
}


export {
    generateScramble,
    checkScramble,
    scramble
}
