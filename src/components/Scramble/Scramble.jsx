import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { Alg } from 'cubing/alg';
import { randomScrambleForEvent } from 'cubing/scramble';
import { normalizeCubeMove } from 'src/components/Cube/cubeHintArrows.js';
import Inspection from 'src/components/Inspection/Inspection.jsx';
import AdditionalScrambleOptions from 'src/components/Scramble/HintSolution.jsx';
import {
  getCategories,
  getRandomPracticeScramble,
} from 'src/components/Scramble/practiceScramble.js';
import { getMoveComponent } from 'src/components/Scramble/svgMapper.js';
import { TimerState } from 'src/components/Timer/util.js';
import { useCube } from 'src/hooks/useCube';
import { useSettings } from 'src/hooks/useSettings';
import { prepareMoves } from 'src/utils/util.ts';

import { ColoredMove, MoveColor, MoveScrambleStatus } from './/util.js';
import 'src/style.css';
import { checkScrambleProgress, getSolutionHintState } from './checkScrambleProgress.js';

const GOOGLE_SHEET_ID = '11-C2joy19lxXM9FXPF7STqJ2WpRksoUwm0cMyE7oyH0';

const getImageScrambleSizeClass = (textSize) => {
  const sizeMap = {
    'text-xs': 'w-8 h-8',
    'text-sm': 'w-12 h-12',
    'text-lg': 'w-16 h-16',
    'text-xl': 'w-20 h-20',
    'text-2xl': 'w-24 h-24',
    'text-3xl': 'w-28 h-28',
    'text-4xl': 'w-32 h-32',
    'text-5xl': 'w-36 h-36',
  };

  return sizeMap[textSize || 'text-sm'] || sizeMap['text-sm'];
};

const Scramble = ({ className = '' }) => {
  const {
    scramble,
    connection,
    setTimerState,
    showScramble,
    setShowScramble,
    timerState,
    setScramble,
    lastMoves,
    scrambleDisplay,
    setScrambleDisplay,
    lastScrambleRef,
    shouldBeSolved,
    setShouldBeSolved,
    shouldBeSolvedRef,
    practiceModeEnabled,
    lastSolveTime,
    practiceHintArrowRef,
    practiceSetupMoveOffsetRef,
    practiceSetupCompleteRef,
    practiceModeEnabledRef,
  } = useCube();

  const { settings, settingsRef, updateSetting } = useSettings();
  const [categories, setCategories] = useState([]);
  const [historyPracticeRecords, setHistoryPracticeRecords] = useState([]);
  const [visibleHint, setVisibleHint] = useState(false);
  const [practiceSetupComplete, setPracticeSetupComplete] = useState(false);
  const lastPracticeSolveTimeRef = useRef(null);

  const toggleVisibleHint = () => setVisibleHint(!visibleHint);

  const getActivePracticeRecord = () =>
    historyPracticeRecords[historyPracticeRecords.length - 1] ?? null;

  const syncPracticeHintArrows = () => {
    const setupComplete = practiceSetupCompleteRef.current || practiceSetupComplete;

    if (!practiceModeEnabledRef.current || !setupComplete || !visibleHint) {
      practiceHintArrowRef.current = { active: false, move: null };
      return;
    }

    const recommendedSolution = getActivePracticeRecord()?.recommendedSolution;
    const solutionRaw = lastMoves
      .slice(practiceSetupMoveOffsetRef.current)
      .map((entry) => normalizeCubeMove(entry.move))
      .filter(Boolean);
    const solutionMoves = prepareMoves(solutionRaw);
    const { move, hasExtraMoves } = getSolutionHintState(recommendedSolution, solutionMoves);

    if (hasExtraMoves) {
      practiceHintArrowRef.current = { active: false, move: null };
      return;
    }

    practiceHintArrowRef.current = {
      active: Boolean(move),
      move,
    };
  };

  const resetPracticeSolutionPhase = () => {
    practiceSetupCompleteRef.current = false;
    setPracticeSetupComplete(false);
    setVisibleHint(false);
    practiceSetupMoveOffsetRef.current = 0;
    practiceHintArrowRef.current = { active: false, move: null };
  };

  const addPracticeRecord = (newRecord) => {
    setHistoryPracticeRecords((prev) =>
      prev.length >= 10 ? [...prev.slice(1), newRecord] : [...prev, newRecord]
    );
  };

  const setTimeForHistory = (time) =>
    setHistoryPracticeRecords((prev) => {
      if (!prev.length) return prev;
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = { ...updated[lastIndex], time };
      return updated;
    });

  const generateScramble = async () => {
    let newScramble;
    console.log('generate');
    if (practiceModeEnabled) {
      const practiceScrambleRecord = await getRandomPracticeScramble(
        GOOGLE_SHEET_ID,
        settings.practiceMode.category
      );
      addPracticeRecord(practiceScrambleRecord);
      newScramble = Alg.fromString(practiceScrambleRecord.scramble);
      console.log('Practice Record: ', practiceScrambleRecord);
    } else {
      setHistoryPracticeRecords([]);
      newScramble = await randomScrambleForEvent('333');
    }

    const newScrambleDisplay = newScramble
      .toString()
      .split(' ')
      .map((move, index) => new ColoredMove(move, index));

    lastScrambleRef.current = scramble;
    setScramble(newScramble);
    setScrambleDisplay(newScrambleDisplay);
    resetPracticeSolutionPhase();
  };

  const checkScramble = async (cubeMoves) => {
    if (timerState !== TimerState.IDLE) return;

    if (practiceModeEnabledRef.current && practiceSetupCompleteRef.current) {
      syncPracticeHintArrows();
      return;
    }

    const scrambleMoves = scramble?.toString().split(' ');

    const { moves, rollbackMoves } = checkScrambleProgress(scrambleMoves, cubeMoves);

    console.log('Check scramble progress: ', { moves, rollbackMoves });

    if (rollbackMoves.length > 0) {
      const rollbackDisplay = rollbackMoves.map((move, index) =>
        new ColoredMove(move, index, MoveColor.RED, index === 0)
      );

      setScrambleDisplay(rollbackDisplay);

      if (rollbackMoves.length > 10) {
        setShouldBeSolved(true);
        shouldBeSolvedRef.current = true;
      }
      return;
    }

    const currentMoveIndex = moves.findIndex(m => m.status !== MoveScrambleStatus.CORRECT);

    const coloredScramble = moves.map((item, index) => {
      let color = MoveColor.WHITE;

      if (item.status === MoveScrambleStatus.CORRECT) {
        color = MoveColor.GRAY;
      }
      else if (item.status === MoveScrambleStatus.INCORRECT) {
        color = MoveColor.RED;
      }

      const isCurrent = index === currentMoveIndex;

      return new ColoredMove(item.move, index, color, isCurrent);
    });

    setScrambleDisplay(coloredScramble);

    const isSolved = moves.every(m => m.status === MoveScrambleStatus.CORRECT);

    if (isSolved) {
      if (practiceModeEnabledRef.current) {
        practiceSetupMoveOffsetRef.current = lastMoves.length;
        practiceSetupCompleteRef.current = true;
        setPracticeSetupComplete(true);
        syncPracticeHintArrows();
        setTimerState(settingsRef.current.inspection ? TimerState.INSPECTION : TimerState.READY);
        setShowScramble(false);
        return;
      }

      setTimerState(settingsRef.current.inspection ? TimerState.INSPECTION : TimerState.READY);
      setShowScramble(false);
      await generateScramble();
    }
  };

  useEffect(() => {
    const cubeMoves = prepareMoves(lastMoves.map((move) => move.move));

    if (timerState === TimerState.IDLE) {
      checkScramble(cubeMoves).then();
      return;
    }

    if (practiceModeEnabledRef.current && practiceSetupCompleteRef.current) {
      syncPracticeHintArrows();
    }
  }, [lastMoves, timerState, practiceSetupComplete, practiceModeEnabled, visibleHint]);

  useEffect(() => {
    generateScramble().then(() => console.log(settings.practiceMode));
  }, [settings.practiceMode, settings.practiceMode.category, practiceModeEnabled]);

  useEffect(() => {
    if (practiceModeEnabled) {
      return;
    }

    practiceSetupCompleteRef.current = false;
    setPracticeSetupComplete(false);
    practiceSetupMoveOffsetRef.current = 0;
    practiceHintArrowRef.current = { active: false, move: null };
  }, [practiceModeEnabled]);

  useEffect(() => {
    connection ? setShowScramble(true) : setShowScramble(false);
  }, [connection]);

  useEffect(() => {
    getCategories(GOOGLE_SHEET_ID).then((categories) => {
      setCategories(categories);
    });
  }, []);

  useEffect(() => {
    if (timerState === TimerState.STOPPED || timerState === TimerState.STOPPED) {
      setVisibleHint(false);
    }
  }, [timerState]);

  useEffect(() => {
    if (!lastSolveTime || !practiceModeEnabledRef.current) return;

    setTimeForHistory(lastSolveTime);

    if (!practiceSetupCompleteRef.current) {
      return;
    }

    if (lastPracticeSolveTimeRef.current === lastSolveTime) {
      return;
    }

    lastPracticeSolveTimeRef.current = lastSolveTime;
    setVisibleHint(false);
    resetPracticeSolutionPhase();
    generateScramble();
  }, [lastSolveTime]);

  return (
    <>
      {(timerState === TimerState.INSPECTION || timerState === TimerState.DNS) && <Inspection />}

      <div
        className={clsx('w-full', {
          [className]: showScramble && timerState === TimerState.IDLE,
          'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4':
            showScramble && timerState === TimerState.IDLE,
        })}
      >
        {showScramble && timerState === TimerState.IDLE && (
          <>
            <div className='flex justify-start items-center mb-2'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Scramble</h3>

              {practiceModeEnabled && (
                <>
                  <select
                    value={settings.practiceMode.category}
                    className='select select-xs h-8 w-32 ml-2 mt-1 border-0 focus:outline-none'
                    onChange={(e) => {
                      updateSetting('practiceMode.category', e.target.value);
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div
              className={`
                bg-white dark:bg-gray-800 
                p-3 rounded-md font-mono 
                ${settings.scrambleSize}
                overflow-x-auto
          `}
            >
              <div className='whitespace-normal break-all leading-relaxed text-gray-900 dark:text-gray-50'>
                {shouldBeSolved ? (
                  <div className='text-red-500 px-10 py-2'>Cube should be solved</div>
                ) : (
                  scrambleDisplay.map((el) => {
                    const textProps = {
                      style: {
                        color: el.color !== MoveColor.WHITE ? el.color : 'inherit',
                      },
                      children: el.move,
                    };

                    if (settings.imageNotation) {
                      const MoveComponent = getMoveComponent(el.move.replace('2', ''));
                      if (MoveComponent) {
                        const color = settings.theme === 'dark' ? 'white' : 'black';
                        return (
                          <span
                            key={el.index}
                            className={`${el.isCurrent ? 'is-current-move' : ''} inline-block px-1`}
                          >
                            <div className='relative'>
                              {el.move.includes('2') && (
                                <span className='absolute -right-2 -top-4'>x2</span>
                              )}
                              <MoveComponent
                                fill={el.color !== MoveColor.WHITE ? el.color : color}
                                stroke={el.color !== MoveColor.WHITE ? el.color : color}
                                className={getImageScrambleSizeClass(settings.scrambleSize)}
                              />
                            </div>
                          </span>
                        );
                      }
                    }
                    return (
                      <span
                        key={el.index}
                        className={`${el.isCurrent ? 'is-current-move' : ''} inline-block px-1`}
                      >
                        <span {...textProps} />
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
        {practiceModeEnabled && (
          <AdditionalScrambleOptions
            className='pt-2'
            records={historyPracticeRecords}
            visible={visibleHint}
            setupComplete={practiceSetupComplete}
            toggleHintVisible={toggleVisibleHint}
            reload={() => {
              resetPracticeSolutionPhase();
              generateScramble();
            }}
          />
        )}
      </div>
    </>
  );
};

export default Scramble;
