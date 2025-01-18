import {prepareMoves} from "src/utils/util.ts";
import {Alg} from "cubing/alg";
import {cube3x3x3} from "cubing/puzzles";
import {randomScrambleForEvent} from "cubing/scramble";
import React, {useEffect, useState} from "react";
import {ColoredMove, getInverseMoves, MoveColor} from "src/component/scramble/util.js";
import {TimerState} from "src/component/timer/util.js";
import {useCubeState} from "src/context/CubeContext.jsx";
import 'src/style.css'

const isReadyTimerCondition = (wrongCounter, scrambleMoves, cubeMoves, timerState) =>
    wrongCounter === 0 && scrambleMoves.length > 1 &&
    cubeMoves.length === scrambleMoves.length &&
    cubeMoves.every((move, index) => move === scrambleMoves[index]) &&
    timerState !== TimerState.RUNNING;

const Scramble = () => {
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
            {showScramble && timerState === TimerState.IDLE &&
                <div id="scramble-display"> {scrambleDisplay.map((el) => (
                    <span key={el.index} style={{color: el.color}}
                          className={el.isCurrent ? 'is-current-move' : ''}> {el.move}</span>))}
                </div>}
        </>
    );
};

export default Scramble;
