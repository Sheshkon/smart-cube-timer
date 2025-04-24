import React, {createContext, useState, useContext, useRef, useEffect} from 'react';
import {TwistyPlayer} from "cubing/twisty";
import {TimerState} from "../components/timer/util.js";

const CubeContext = createContext(null);

const hardwareInitialState = {
    name: '- n/a -',
    version: '- n/a -',
    softwareVersion: '- n/a -',
    productDate: '- n/a -',
    gyroSupported: 'NO',
}

const twistyPlayer = new TwistyPlayer({
    puzzle: '3x3x3',
    visualization: 'PG3D',
    alg: '',
    experimentalSetupAnchor: 'start',
    background: 'none',
    controlPanel: 'none',
    hintFacelets: 'none',
    experimentalDragInput: 'none',
    cameraLatitude: 0,
    cameraLongitude: 0,
    cameraLatitudeLimit: 0,
    tempoScale: 5,
});


export const CubeProvider = ({children}) => {
        const [connection, setConnection] = useState(false);
        const [hardwareInfo, setHardwareInfo] = useState(hardwareInitialState);
        const [batteryLevel, setBatteryLevel] = useState(0);
        const [scramble, setScramble] = useState([]);
        const [timerState, setTimerState] = useState(TimerState.IDLE);
        const [lastMoves, setLastMoves] = useState([]);
        const [showScramble, setShowScramble] = useState(false)


        const twistyPlayerRef = useRef(twistyPlayer);
        const connectionRef = useRef(connection);
        const timerStateRef = useRef(timerState);
        const solutionMovesRef = useRef([]);
        const [results, setResults] = useState([])
        const lastScrambleRef = useRef(scramble)

        const [scrambleDisplay, setScrambleDisplay] = useState([]);

        useEffect(() => {
            connectionRef.current = connection
        }, [connection])

        useEffect(() => {
            timerStateRef.current = timerState
        }, [timerState])


        return (
            <CubeContext.Provider value={{
                connection,
                hardwareInfo,
                batteryLevel,
                scramble,
                lastScrambleRef,
                showScramble,
                scrambleDisplay,
                timerState,
                lastMoves,
                results,

                connectionRef,
                timerStateRef,
                twistyPlayerRef,
                solutionMovesRef,

                setConnection,
                setHardwareInfo,
                setBatteryLevel,
                setScramble,
                setShowScramble,
                setScrambleDisplay,
                setTimerState,
                setLastMoves,
                setResults
            }}>
                {children}
            </CubeContext.Provider>
        );
    }
;

export const useCubeState = () => useContext(CubeContext);