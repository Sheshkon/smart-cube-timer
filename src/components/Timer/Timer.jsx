import { cubeTimestampLinearFit, makeTimeFromTimestamp } from "gan-web-bluetooth";
import { useEffect, useRef, useState, useCallback } from "react";
import { interval } from "rxjs";
import { mergeConsecutiveWords } from "src/utils/string.js";
import StatsResult from "../../components/StatsDisplay/util.js";
import { TimerState } from "../../components/timer/util.js";
import { useCubeState } from "../../contexts/CubeContext.jsx";
import '../../style.css'
import { formatTime, ganTimeToMilliseconds } from "../../utils/time.js";
import { patternToFacelets, SOLVED_STATE } from "../../utils/util.ts";

const Timer = ({ onSaveTime }) => {
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
    } = useCubeState();

    const localTimerRef = useRef(null);
    const [showTimer, setShowTimer] = useState(false);
    const [timeValue, setTimeValue] = useState("");
    const freshListenerRef = useRef(null);

    const handleSolvedState = useCallback(() => {
        stopTimer();

        const fittedMoves = cubeTimestampLinearFit(solutionMovesRef.current);
        const lastMove = fittedMoves.slice(-1).pop();
        const { formattedTime, originalTime } = getTimerValueFromTimestamp(lastMove ? lastMove.cubeTimestamp : 0);

        const solution = solutionMovesRef.current.map(el => el.move).join(' ');
        const filteredSolution = mergeConsecutiveWords(solution);

        const solve = new StatsResult(
            originalTime,
            formattedTime,
            lastScrambleRef.current.toString(),
            filteredSolution
        );

        setShowTimer(false);
        onSaveTime(solve);
        clearTimerAndSolvingData();
        setShowScramble(true);
    }, [onSaveTime, setShowScramble]);


    const getTimerValueFromTimestamp = useCallback((timestamp) => {
        const originalTime = makeTimeFromTimestamp(timestamp);
        const formattedTime = formatTime(ganTimeToMilliseconds(originalTime));
        setTimeValue(formattedTime);
        return { formattedTime, originalTime };
    }, []);

    const startTimer = useCallback(() => {
        const startTime = new Date().getTime();
        localTimerRef.current = interval(30).subscribe(() => {
            if (connectionRef.current) {
                return getTimerValueFromTimestamp(new Date().getTime() - startTime);
            }
            setShowTimer(false);
            clearTimerAndSolvingData();
            stopTimer();
        });
    }, [connectionRef, getTimerValueFromTimestamp]);

    const stopTimer = useCallback(() => {
        localTimerRef.current?.unsubscribe();
        localTimerRef.current = null;
    }, []);

    const clearTimerAndSolvingData = useCallback(() => {
        setLastMoves([]);
        solutionMovesRef.current = [];
        setTimerState(TimerState.IDLE);
        setTimeValue(formatTime(0));
    }, [setLastMoves, setTimerState]);


    useEffect(() => {
        const handleFreshPattern = async (kpattern) => {
            const facelets = patternToFacelets(kpattern);
            console.log("fresh listener")
            if (facelets === SOLVED_STATE && timerStateRef.current === TimerState.RUNNING) {
                setTimerState(TimerState.STOPPED);
                twistyPlayerRef.current.alg = '';
            }
        };

        if (twistyPlayerRef.current) {
            freshListenerRef.current = twistyPlayerRef.current.experimentalModel.currentPattern.addFreshListener(handleFreshPattern);
        }

        return () => {
            if (freshListenerRef.current && twistyPlayerRef.current) {
                twistyPlayerRef.current.experimentalModel.currentPattern.removeFreshListener(freshListenerRef.current);
            }
            stopTimer();
        };
    }, [twistyPlayerRef, timerStateRef, setTimerState, stopTimer]);

    // Timer state management
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
                handleSolvedState();
                break;
            case TimerState.IDLE:
                break;
        }
    }, [timerState, getTimerValueFromTimestamp, startTimer, handleSolvedState]);

    return (
        <>
            {showTimer && (
                <div id="timer" className="font-mono font-semibold text-lg text-gray-900 dark:text-white">
                    {timeValue}
                </div>
            )}
        </>
    );
};

export default Timer;