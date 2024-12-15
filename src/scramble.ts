import {randomScrambleForEvent} from "cubing/scramble";
import {Alg} from "cubing/alg";
import {cube3x3x3} from "cubing/puzzles";
import {activateTimer, timerState} from "./timer.ts";


const scrambleDiv = document.getElementById("scramble-display");


let scramble: Alg | null = null


const generateScramble = async () => {
    scramble = await randomScrambleForEvent("333");
    scrambleDiv!.innerHTML = scramble.toString()
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

    let coloredScramble = scrambleMoves?.map((move, index) => {
        if (index > cubeMoves.length - 1 || cubeMoves[index] === "") {
            return colorizeMove(move);
        }

        if (move === cubeMoves[index] && wrongCounter === 0) {
            return colorizeMove(move, "green");  // Правильный ход: зеленый
        }

        if (move !== cubeMoves[index] && wrongCounter === 0) {
            wrongCounter++
            startWrongIndex = index;
            if (move.replace(/['2]/g, "") === cubeMoves[index].replace(/['2]/g, "")) {
                return colorizeMove(move, "yellow");  // Совпали буквы, но направление неверное: желтый
            }
        }

        if (wrongCounter > 0) {
            wrongCounter++;
            return colorizeMove(move, "red");
        }

        return colorizeMove(move);
    }).join(" ");

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


const colorizeMove = (move: string, color: string = "white"): string => {
    return `<span style="color: ${color};">${move}&nbsp;</span>`;
}


export {
    generateScramble,
    checkScramble,
    scramble
}
