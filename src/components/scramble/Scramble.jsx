import {Copy} from "lucide-react";
import {prepareMoves} from "../../utils/util.ts";
import {Alg} from "cubing/alg";
import {cube3x3x3} from "cubing/puzzles";
import {randomScrambleForEvent} from "cubing/scramble";
import React, {useEffect, useState} from "react";
import {ColoredMove, getInverseMoves, MoveColor} from "../../components/scramble/util.js";
import {TimerState} from "../../components/timer/util.js";
import {useCubeState} from "../../contexts/CubeContext.jsx";
import '../../style.css'

const isReadyTimerCondition = (wrongCounter, scrambleMoves, cubeMoves, timerState) =>
    wrongCounter === 0 && scrambleMoves.length > 1 &&
    cubeMoves.length === scrambleMoves.length &&
    cubeMoves.every((move, index) => move === scrambleMoves[index]) &&
    timerState !== TimerState.RUNNING;

const Scramble = ({className = ''}) => {
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
    } = useCubeState();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(scramble)
            .then(() => {
                // Show a toast or notification here if you want
                console.log('Scramble copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy scramble: ', err);
            });
    };

    const generateScramble = async () => {
        const newScramble = await randomScrambleForEvent("333")
        const newScrambleDisplay = newScramble.toString().split(" ").map((move, index) => new ColoredMove(move, index))
        lastScrambleRef.current = scramble
        setScramble(newScramble);
        setScrambleDisplay(newScrambleDisplay);
    };


    const checkScramble = async (cubeMoves) => {
        const scrambleMoves = scramble?.toString().split(" ");
        if (timerState !== TimerState.IDLE) return;

        let wrongCounter = 0;
        let startWrongIndex = 0;

        const coloredMoves = scrambleMoves?.map((move, index) => {
            if (move === cubeMoves[index] && wrongCounter === 0) {
                return new ColoredMove(move, index, MoveColor.GRAY)
            }

            if ((index > cubeMoves.length - 1 || cubeMoves[index] === "")
                || (move.includes('2') && move.replace("2", "") === cubeMoves[index].replace(/'/g, ""))) {
                return new ColoredMove(move, index)
            }

            if (move !== cubeMoves[index] && wrongCounter === 0) {
                wrongCounter++
                startWrongIndex = index;
                if (move.replace(/'/g, "") === cubeMoves[index].replace(/'/g, "")) {
                    return new ColoredMove(move, index, MoveColor.YELLOW);  // Совпали буквы, но направление неверное: желтый
                }
            }

            if (wrongCounter > 0) {
                wrongCounter++;
                return new ColoredMove(move, index, MoveColor.RED);
            }

            return new ColoredMove(move, index)
        })

        const currentMoveIndex = coloredMoves ? coloredMoves.findIndex((el) => el.color === MoveColor.WHITE) : 0;
        const coloredScramble = coloredMoves?.map((el, index) => new ColoredMove(el.move, index, el.color, index === currentMoveIndex))

        wrongCounter > 1 ?
            setScrambleDisplay(getInverseMoves(cubeMoves, startWrongIndex)) : setScrambleDisplay(coloredScramble);


        if (isReadyTimerCondition(wrongCounter, scrambleMoves, cubeMoves, timerState)) {
            setTimerState(TimerState.READY)
            setShowScramble(false)
            console.log("timer ready")
            await generateScramble();
        }
    };

    useEffect(() => {
        if (timerState === TimerState.IDLE) {
            checkScramble(prepareMoves(lastMoves.map(move => move.move))).then(() => console.log("Check Scramble"))
        }
    }, [lastMoves, timerState])

    useEffect(() => {
        generateScramble().then(() => console.log("Scramble generated"))
    }, []);

    useEffect(() => {
        connection ? setShowScramble(true) : setShowScramble(false);
    }, [connection])

    return (
        <>
            {
                showScramble && timerState === TimerState.IDLE &&

            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scramble</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={copyToClipboard}
                                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Copy scramble"
                        >
                            <Copy size={16}/>
                        </button>
                        {/*<button*/}
                        {/*  onClick={onNewScramble}*/}
                        {/*  className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"*/}
                        {/*  title="New scramble"*/}
                        {/*>*/}
                        {/*  <RefreshCw size={16} />*/}
                        {/*</button>*/}
                    </div>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 p-3 rounded-md font-mono text-sm md:text-base overflow-x-auto">
                    <span className="whitespace-normal break-all leading-relaxed text-gray-900 dark:text-gray-50">
                      {scrambleDisplay.map((el) => (
                          <span
                              key={el.index}
                              style={el.color !== MoveColor.WHITE ? { color: el.color } : {}}
                              className={`${el.isCurrent ? 'is-current-move text-gray-50' : ''} inline-block px-1   text-black-700`}
                          >
                        {el.move}
                    </span>
                      ))}
                    </span>
                    {/*<div id="scramble-display"> {scrambleDisplay.map((el) => (*/}
                    {/*    <span key={el.index} style={{color: el.color}}*/}

                    {/*          className={el.isCurrent ? 'is-current-move' : ''}> {el.move}</span>))}*/}
                    {/*</div>*/}
                </div>
            </div>
            }
        </>
    );
}

export default Scramble;
