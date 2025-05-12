import { useCallback, useEffect, useRef, useState } from 'react';

import { cubeTimestampLinearFit, makeTimeFromTimestamp } from 'gan-web-bluetooth';
import { interval } from 'rxjs';
import StatsResult from 'src/components/StatsDisplay/util.js';
import { getReconstruction, TimerState } from 'src/components/Timer/util.js';
import { useCube } from 'src/hooks/useCube';
import 'src/style.css';
import { formatTime, ganTimeToMilliseconds } from 'src/utils/time.js';
import { patternToFacelets, SOLVED_STATE } from 'src/utils/util.ts';

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
    connectionRef
  } = useCube();

  const localTimerRef = useRef(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timeValue, setTimeValue] = useState('');
  const freshListenerRef = useRef(null);

  const handleSolvedState = useCallback(() => {
    stopTimer();

    const fittedMoves = cubeTimestampLinearFit(solutionMovesRef.current);
    const lastMove = fittedMoves.slice(-1).pop();
    const { formattedTime, originalTime } = getTimerValueFromTimestamp(
      lastMove ? lastMove.cubeTimestamp : 0,
    );

    const solve = new StatsResult(
      originalTime,
      formattedTime,
      getReconstruction(lastScrambleRef.current.toString(), solutionMovesRef.current),
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
      if (
        facelets === SOLVED_STATE &&
        timerStateRef.current === TimerState.RUNNING
      ) {
        setTimerState(TimerState.STOPPED);
        twistyPlayerRef.current.alg = '';
      }
    };

    if (twistyPlayerRef.current) {
      freshListenerRef.current =
        twistyPlayerRef.current.experimentalModel.currentPattern.addFreshListener(
          handleFreshPattern,
        );
    }

    return () => {
      if (freshListenerRef.current && twistyPlayerRef.current) {
        twistyPlayerRef.current.experimentalModel.currentPattern.removeFreshListener(
          freshListenerRef.current,
        );
      }
      stopTimer();
    };
  }, [twistyPlayerRef, timerStateRef, setTimerState, stopTimer]);

  useEffect(() => {
    switch (timerState) {
      case TimerState.READY:
        getTimerValueFromTimestamp(0);
        stopTimer();
        setShowTimer(true);
        break;
      case TimerState.INSPECTION:
        getTimerValueFromTimestamp(0);
        break;
      case TimerState.RUNNING:
        setShowTimer(true);
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
        <div
          id="timer"
          className="font-mono font-semibold text-lg text-gray-900 dark:text-white"
        >
          {timeValue}
        </div>
      )}
    </>
  );
};

export default Timer;
