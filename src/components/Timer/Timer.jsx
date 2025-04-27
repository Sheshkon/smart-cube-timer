import {cubeTimestampLinearFit, makeTimeFromTimestamp} from "gan-web-bluetooth";
import {useEffect, useRef, useState} from "react";
import {interval} from "rxjs";
import {mergeConsecutiveWords} from "src/utils/string.js";
import StatsResult from "../../components/StatsDisplay/util.js";
import {TimerState} from "../../components/timer/util.js";
import {useCubeState} from "../../contexts/CubeContext.jsx";
import '../../style.css'
import {formatTime, ganTimeToMilliseconds} from "../../utils/time.js";
import {patternToFacelets, SOLVED_STATE} from "../../utils/util.ts";

const Timer = ({onSaveTime}) => {
    const {
        twistyPlayerRef,
        timerState,
        setTimerState,
        timerStateRef,
        solutionMovesRef,
        setShowScramble,
        setLastMoves,
        lastScrambleRef,
        connection,
        connectionRef,
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
        let originalTime = makeTimeFromTimestamp(timestamp);
        let formattedTime = formatTime(ganTimeToMilliseconds(originalTime))
        setTimeValue(formattedTime);
        return {formattedTime, originalTime}
    }


    const startTimer = () => {
        const startTime = new Date().getTime()
        localTimerRef.current = interval(30).subscribe(() => {
            if (connectionRef.current) return getTimerValueFromTimestamp(new Date().getTime() - startTime);

            stopTimer()
            setShowTimer(false)
            setTimerState(TimerState.IDLE)
            setTimeValue(formatTime(0));
        })
    }

    const stopTimer = () => {
        localTimerRef.current?.unsubscribe();
        localTimerRef.current = null
    }

    const handleSolvedState = () => {
        stopTimer();

        const fittedMoves = cubeTimestampLinearFit(solutionMovesRef.current);
        const lastMove = fittedMoves.slice(-1).pop();
        const {formattedTime, originalTime} = getTimerValueFromTimestamp(lastMove ? lastMove.cubeTimestamp : 0);

        const solution = solutionMovesRef.current.map(el => el.move).join(' ')
        const filteredSolution = mergeConsecutiveWords(solution)

        console.log("scramble: ", lastScrambleRef.current.toString())
        console.log("plain: ", solution)
        console.log("filtered", filteredSolution)

        const solve = new StatsResult(
            originalTime,
            formattedTime,
            lastScrambleRef.current.toString(),
            filteredSolution
        );

        console.log(solve, originalTime, formattedTime, lastScrambleRef.current)

        onSaveTime(solve);
        setShowTimer(false);
        setLastMoves([]);
        setShowScramble(true);
        solutionMovesRef.current = [];
        setTimerState(TimerState.IDLE);
    };

    useEffect(() => {
        switch (timerState) {
            case TimerState.READY:
                getTimerValueFromTimestamp(0);
                setShowTimer(true);
                break;
            case TimerState.RUNNING:
                startTimer();
                break;
            case TimerState.STOPPED:
                handleSolvedState()
                break;
            case TimerState.IDLE:
                break;
        }
    }, [timerState]);

    return (
        <>
            {showTimer && (
                <div id="timer"
                     className="font-mono font-semibold text-lg text-gray-900 dark:text-white">{timeValue}</div>)}
        </>
    )
}

export default Timer;
