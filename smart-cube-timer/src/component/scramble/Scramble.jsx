import {prepareMoves} from "@utils/util.ts";
import {Alg} from "cubing/alg";
import {cube3x3x3} from "cubing/puzzles";
import {randomScrambleForEvent} from "cubing/scramble";
import React, {useEffect, useState} from "react";
import {MoveColor} from "src/component/scramble/util.js";
import {TimerState} from "src/component/timer/util.js";
import {useCubeState} from "src/context/CubeContext.jsx";
import 'src/style.css'

const colorizeMove = (move, index, color = MoveColor.WHITE) => {
    return {
        move, key: index, color,
    }
};

const getInverseMoves = (cubeMoves, startWrongIndex) =>
    new Alg(cubeMoves.slice(startWrongIndex).join(" "))
        .experimentalSimplify({cancel: true, puzzleLoader: cube3x3x3})
        .invert()
        .toString()
        .split(" ")
        .map((el, index) => colorizeMove(el, index, MoveColor.RED));


const Scramble = () => {
    const {
        scramble,
        connection,
        setTimerState,
        timerState,
        setScramble,
        lastMoves,
    } = useCubeState();

    const [scrambleDisplay, setScrambleDisplay] = useState([{}]);
    const [showScramble, setShowScramble] = useState(false);

    const generateScramble = async () => {
        const newScramble = (await randomScrambleForEvent("333")).toString().split(" ");
        const newScrambleDisplay = newScramble.map((move, index) => colorizeMove(move, index))

        setScramble(newScramble);
        setScrambleDisplay(newScrambleDisplay);
    };


    const checkScramble = async (cubeMoves) => {
        if (timerState !== TimerState.IDLE) return;

        let wrongCounter = 0;
        let startWrongIndex = 0;

        const coloredScramble = scramble?.map((move, index) => {
            if (index > cubeMoves.length - 1 || cubeMoves[index] === "") return colorizeMove(move, index);

            if (move === cubeMoves[index] && wrongCounter === 0) return colorizeMove(move, index, MoveColor.GREEN);

            if (move !== cubeMoves[index] && wrongCounter === 0) {
                wrongCounter++;
                startWrongIndex = index;
                if (move.replace(/['2]/g, "") === cubeMoves[index].replace(/['2]/g, "")) return colorizeMove(move, index, MoveColor.YELLOW);
            }

            if (wrongCounter > 0) {
                wrongCounter++;
                return colorizeMove(move, index, MoveColor.RED);
            }

            return colorizeMove(move, index);
        })

        wrongCounter > 1 ?
            setScrambleDisplay(getInverseMoves(cubeMoves, startWrongIndex)) : setScrambleDisplay(coloredScramble);

        if (wrongCounter === 0 && cubeMoves.length === scramble?.length && scramble.length > 1 && timerState !== TimerState.RUNNING) {
            setTimerState(TimerState.READY)
            setScrambleDisplay([]);
            await generateScramble();
        }

    };

    useEffect(() => {
        checkScramble(prepareMoves(lastMoves.map(move => move.move))).then(() => console.log("Check Scramble"))
    }, [lastMoves, timerState])

    useEffect(() => {
        generateScramble().then(() => console.log("Scramble generated"))
    }, []);

    useEffect(() => {
        connection ? setShowScramble(true) : setShowScramble(false);
    }, [connection])

    return (
        <>
            {showScramble && timerState === TimerState.IDLE && (
                <div id="scramble-display">{
                    scrambleDisplay.map(el => (
                        <span key={el.key} style={{color: el.color}}>
                        {el.move}
                    </span>
                    ))}

                </div>)}
        </>
    );
};

export default Scramble;
