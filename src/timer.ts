import {interval, Subscription} from "rxjs";
import {now} from "jquery";
import {cubeTimestampLinearFit, GanCubeMove, makeTimeFromTimestamp} from "gan-web-bluetooth";
import {conn, twistyPlayer} from "./index.ts";
import {patternToFacelets, SOLVED_STATE} from "./utils.ts";
import $ from "jquery";
import {saveResult} from "./stats.ts";
import {generateScramble, scramble} from "./scramble.ts";

var timerState: "IDLE" | "READY" | "RUNNING" | "STOPPED" = "IDLE";

var solutionMoves: GanCubeMove[] = [];

function addSolutionMove(move: GanCubeMove){
    solutionMoves.push(move);
}

function setTimerState(state: typeof timerState) {
    timerState = state;
    console.log(timerState);
    switch (state) {
        case "IDLE":
            stopLocalTimer();
            $('#timer').hide();
            break;
        case 'READY':
            setTimerValue(0);
            $('#timer').show();
            $('#timer').css('color', '#0f0');
            break;
        case 'RUNNING':
            solutionMoves = [];
            startLocalTimer();
            $('#timer').css('color', '#999');
            break;
        case 'STOPPED':
            stopLocalTimer();
            $('#timer').css('color', '#fff');
            var fittedMoves = cubeTimestampLinearFit(solutionMoves);
            var lastMove = fittedMoves.slice(-1).pop();
            const time = setTimerValue(lastMove ? lastMove.cubeTimestamp! : 0);
            console.log(time)
            saveResult({originalTime: time.originalTime, time: time.time, scramble: scramble?.toString()})
            setTimerState("IDLE")
            generateScramble()
            break;
    }

}

function setTimerValue(timestamp: number) {
    let t = makeTimeFromTimestamp(timestamp);
    let time = `${t.minutes}:${t.seconds.toString(10).padStart(2, '0')}.${t.milliseconds.toString(10).padStart(3, '0')}`
    $('#timer').html(time);
    return {time: time, originalTime: t}
}

let localTimer: Subscription | null = null;

function startLocalTimer() {
    const startTime = now();
    localTimer = interval(30).subscribe(() => {
        setTimerValue(now() - startTime);
    });
}

function stopLocalTimer() {
    localTimer?.unsubscribe();
    localTimer = null;
}

function activateTimer() {
    if ((timerState == "IDLE"|| timerState == "STOPPED") && conn) {
        setTimerState("READY");
    } else {
        setTimerState("IDLE");
    }
}

twistyPlayer.experimentalModel.currentPattern.addFreshListener(async (kpattern) => {
    const facelets = patternToFacelets(kpattern);
    if (facelets == SOLVED_STATE) {
        if (timerState == "RUNNING") {
            setTimerState("STOPPED");
        }
        twistyPlayer.alg = '';
    }
});



export {
    activateTimer,
    addSolutionMove,
    timerState,
    setTimerState,
}