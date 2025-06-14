import React, { useEffect, useState } from 'react';

import clsx from 'clsx';
import { Alg } from 'cubing/alg';
import { randomScrambleForEvent } from 'cubing/scramble';
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

import { ColoredMove, getInverseMoves, MoveColor } from './/util.js';
import 'src/style.css';

const GOOGLE_SHEET_ID = '11-C2joy19lxXM9FXPF7STqJ2WpRksoUwm0cMyE7oyH0';

const isReadyTimerCondition = (wrongCounter, scrambleMoves, cubeMoves, timerState) =>
  wrongCounter === 0 &&
  scrambleMoves.length > 1 &&
  cubeMoves.length === scrambleMoves.length &&
  cubeMoves.every((move, index) => move === scrambleMoves[index]) &&
  timerState !== TimerState.RUNNING;

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
    practiceModeEnabled,
    lastSolveTime,
  } = useCube();

  const { settings, settingsRef, updateSetting } = useSettings();
  const [categories, setCategories] = useState([]);
  const [historyPracticeRecords, setHistoryPracticeRecords] = useState([]);
  const [visibleHint, setVisibleHint] = useState(false);

  const toggleVisibleHint = () => setVisibleHint(!visibleHint);

  const addPracticeRecord = (newRecord) => {
    setHistoryPracticeRecords((prev) =>
      prev.length >= 10 ? [...prev.slice(1), newRecord] : [...prev, newRecord]
    );
  };

  const setTimeForHistory = (time) =>
    setHistoryPracticeRecords((prev) => {
      if (prev.length < 2) return prev;
      const updated = [...prev];
      const secondLastIndex = updated.length - 2;
      updated[secondLastIndex] = { ...updated[secondLastIndex], time };
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
  };

  const checkScramble = async (cubeMoves) => {
    const scrambleMoves = scramble?.toString().split(' ');
    if (timerState !== TimerState.IDLE) return;

    let wrongCounter = 0;
    let startWrongIndex = 0;

    const coloredMoves = scrambleMoves?.map((move, index) => {
      if (move === cubeMoves[index] && wrongCounter === 0) {
        return new ColoredMove(move, index, MoveColor.GRAY);
      }

      if (
        index > cubeMoves.length - 1 ||
        cubeMoves[index] === '' ||
        (move.includes('2') && move.replace('2', '') === cubeMoves[index].replace(/'/g, ''))
      ) {
        return new ColoredMove(move, index);
      }

      if (move !== cubeMoves[index] && wrongCounter === 0) {
        wrongCounter++;
        startWrongIndex = index;
        if (move.replace(/'/g, '') === cubeMoves[index].replace(/'/g, '')) {
          // return new ColoredMove(move, index, MoveColor.YELLOW);  // The letters match, but the direction is wrong: yellow.
        }
      }

      if (wrongCounter > 0) {
        if (wrongCounter > 10) {
          setShouldBeSolved(true);
        }

        wrongCounter++;
        return new ColoredMove(move, index, MoveColor.RED);
      }

      return new ColoredMove(move, index);
    });

    const currentMoveIndex = coloredMoves
      ? coloredMoves.findIndex((el) => el.color === MoveColor.WHITE)
      : 0;
    const coloredScramble = coloredMoves?.map(
      (el, index) => new ColoredMove(el.move, index, el.color, index === currentMoveIndex)
    );

    wrongCounter > 1
      ? setScrambleDisplay(getInverseMoves(cubeMoves, startWrongIndex))
      : setScrambleDisplay(coloredScramble);

    if (isReadyTimerCondition(wrongCounter, scrambleMoves, cubeMoves, timerState)) {
      settingsRef.current.inspection
        ? setTimerState(TimerState.INSPECTION)
        : setTimerState(TimerState.READY);
      setShowScramble(false);
      await generateScramble();
    }
  };

  useEffect(() => {
    if (timerState === TimerState.IDLE) {
      checkScramble(prepareMoves(lastMoves.map((move) => move.move))).then();
    }
  }, [lastMoves, timerState]);

  useEffect(() => {
    generateScramble().then(() => console.log(settings.practiceMode));
  }, [settings, practiceModeEnabled]);

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
    setTimeForHistory(lastSolveTime);
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
            showPrev={timerState !== TimerState.IDLE}
            toggleHintVisible={toggleVisibleHint}
            reload={() => {
              setVisibleHint(false);
              generateScramble();
            }}
          />
        )}
      </div>
    </>
  );
};

export default Scramble;
