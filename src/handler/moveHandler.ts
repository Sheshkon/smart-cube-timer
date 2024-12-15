import {cubeTimestampCalcSkew, GanCubeEvent, GanCubeMove} from "gan-web-bluetooth";
import $ from "jquery";
import {twistyPlayer} from "../index.ts";
import {faceletsToPattern, SOLVED_STATE} from "../utils.ts";
import {experimentalSolve3x3x3IgnoringCenters} from "cubing/search";
import {checkScramble} from "../scramble.ts";
import {cube3x3x3} from "cubing/puzzles";
import {Alg} from "cubing/alg";
import {addSolutionMove, setTimerState, timerState} from "../timer.ts";

let lastMoves: GanCubeMove[] = [];

async function handleMoveEvent(event: GanCubeEvent) {
    if (event.type == "MOVE") {
        if (timerState == "READY") {
            setTimerState("RUNNING");
        }
        if (timerState == "RUNNING") {
            addSolutionMove(event);
        }
        twistyPlayer.experimentalAddMove(event.move, {cancel: false});
        lastMoves.push(event);
        if (lastMoves.length > 256) {
            lastMoves = lastMoves.slice(-256);
        }
        if (lastMoves.length > 10) {
            const skew = cubeTimestampCalcSkew(lastMoves);
            $('#skew').val(skew + '%');
        }

        checkScramble(prepareLastMoves(lastMoves.map(move => move.move.toString())))
    }
}



let cubeStateInitialized = false;

async function handleFaceletsEvent(event: GanCubeEvent) {
    // console.log(event)

    if (event.type == "FACELETS" && event.facelets == SOLVED_STATE) {
        lastMoves = []
    }


    if (event.type == "FACELETS" && !cubeStateInitialized) {
        if (event.facelets != SOLVED_STATE) {
            const kpattern = faceletsToPattern(event.facelets);
            const solution = await experimentalSolve3x3x3IgnoringCenters(kpattern);
            twistyPlayer.alg = solution.invert();
        } else {
            twistyPlayer.alg = '';
        }
        cubeStateInitialized = true;
        console.log("Initial cube state is applied successfully", event.facelets);
    }
}

const prepareLastMoves = (lastMoves: string[]): string[] => {
    const lastMoveString = lastMoves.join(" ")
    return new Alg(lastMoveString)
        .experimentalSimplify({cancel: true, puzzleLoader: cube3x3x3})
        .toString()
        .split(" ");
}


export  {
    handleMoveEvent,
    handleFaceletsEvent
}
