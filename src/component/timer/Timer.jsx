import {mergeConsecutiveWords} from "src/utils/string.js";
import {patternToFacelets, SOLVED_STATE} from "src/utils/util.ts";
import {cubeTimestampLinearFit, makeTimeFromTimestamp} from "gan-web-bluetooth";
import {useEffect, useRef, useState} from "react";
import {interval} from "rxjs";
import {TimerState} from "src/component/timer/util.js";
import {useCubeState} from "src/context/CubeContext.jsx";
import 'src/style.css'
import {StatsResult} from "src/component/stats/util.js";
import {Alg} from "cubing/alg";

const Timer = () => {
    const {
        twistyPlayerRef,
        timerState,
        setTimerState,
        timerStateRef,
        solutionMovesRef,
        setShowScramble,
        setResults,
        setLastMoves,
        lastScrambleRef,
    } = useCubeState()

    const localTimerRef = useRef(null);
    const [showTimer, setShowTimer] = useState(false);
    const [timeValue, setTimeValue] = useState("");


    twistyPlayerRef.current.experimentalModel.currentPattern.addFreshListener(async kpattern => {
        const facelets = patternToFacelets(kpattern);
        if (facelets === SOLVED_STATE) {
            if (timerStateRef.current === TimerState.RUNNING) {
                setTimerState(TimerState.STOPPED);
            }
            twistyPlayerRef.current.alg = '';
        }
    });

    const getTimerValueFromTimestamp = (timestamp) => {
        let t = makeTimeFromTimestamp(timestamp);
        let time = `${t.minutes}:${t.seconds.toString(10).padStart(2, '0')}.${t.milliseconds.toString(10).padStart(3, '0')}`
        setTimeValue(time);
        return {time: time, originalTime: t}
    }


    const startLocalTimer = () => {
        const startTime = new Date().getTime()
        localTimerRef.current = interval(30).subscribe(() => {
            getTimerValueFromTimestamp(new Date().getTime() - startTime);
        })
    }

    const stopLocalTimer = () => {
        localTimerRef.current?.unsubscribe();
        localTimerRef.current = null
    }


    useEffect(() => {
        switch (timerState) {
            case TimerState.READY:
                getTimerValueFromTimestamp(0);
                setShowTimer(true);
                break;
            case TimerState.RUNNING:
                startLocalTimer();
                break;
            case TimerState.STOPPED:
                stopLocalTimer();
                const fittedMoves = cubeTimestampLinearFit(solutionMovesRef.current);
                const lastMove = fittedMoves.slice(-1).pop();
                const t = getTimerValueFromTimestamp(lastMove ? lastMove.cubeTimestamp : 0);
                const plainSolution = new Alg(solutionMovesRef.current.map(el => el.move).join(" ")).toString() // simplify
                const solution = mergeConsecutiveWords(plainSolution)
                const solve = new StatsResult(t.originalTime, t.time, lastScrambleRef.current.toString(), solution, plainSolution)
                setResults((prev) => [solve, ...prev])
                setShowTimer(false);
                setLastMoves([])
                setShowScramble(true)
                solutionMovesRef.current = []
                setTimerState(TimerState.IDLE)
                break;
            case TimerState.IDLE:
                break;
        }
    }, [timerState]);


    return (
        <>
            {showTimer && (<div id="timer">{timeValue}</div>)}
        </>
    )

}

export default Timer;
