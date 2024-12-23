import {patternToFacelets, SOLVED_STATE} from "@utils/util.ts";
import {cubeTimestampLinearFit, makeTimeFromTimestamp} from "gan-web-bluetooth";
import {useEffect, useRef, useState} from "react";
import {interval} from "rxjs";
import {TimerState} from "src/component/timer/util.js";
import {useCubeState} from "src/context/CubeContext.jsx";
import 'src/style.css'


const Timer = () => {
    const {
        twistyPlayerRef,
        timerState,
        setTimerState,
        timerStateRef,
        solutionMovesRef
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
                setShowTimer(false);
                console.log("Solution", solutionMovesRef.current)
                solutionMovesRef.current = []
                console.log(t)
                setTimerState(TimerState.IDLE)
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
