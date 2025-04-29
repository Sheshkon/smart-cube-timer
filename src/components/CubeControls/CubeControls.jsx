import {experimentalSolve3x3x3IgnoringCenters} from "cubing/search";
import {connectGanCube} from "gan-web-bluetooth";
import {useEffect, useRef} from "react";
import {generateScramble} from "src/components/Scramble/util.js";
import {useSettings} from "src/contexts/SettingsContext.jsx";
import * as THREE from "three";
import {TimerState} from "../../components/timer/util.js";
import {useCubeState} from "../../contexts/CubeContext.jsx";
import {cubeQuaternion, faceletsToPattern, HOME_ORIENTATION, SOLVED_STATE} from "../../utils/util.ts";
import {CubeCommand, CubeEventType, customMacAddressProvider} from ".//util.js";

const cubeControls = () => {
    const {
        connection,
        twistyPlayerRef,
        setConnection,
        timerState,
        setTimerState,
        timerStateRef,
        lastMoves,
        setLastMoves,
        solutionMovesRef,
        batteryLevelRef,
        hardwareInfoRef,
        setHardwareInfo,
        setBatteryLevel,
        connectionRef
    } = useCubeState()

    const { settingsRef } = useSettings();

    const basisRef = useRef(null);

    const batteryPollIntervalRef = useRef(null);

    const handleConnect = async () => {
        if (connection) {
            await disconnect();
        } else {
            if (batteryPollIntervalRef.current) {
                clearInterval(batteryPollIntervalRef.current);
                batteryPollIntervalRef.current = null;
            }
            const cn = await connectGanCube(customMacAddressProvider)
            setConnection(cn);
            cn?.events$?.subscribe(handleCubeEvent);

            batteryPollIntervalRef.current = setInterval(() => {
                console.log("send battery command")
                cn?.sendCubeCommand(CubeCommand.BATTERY)
                    .catch(err => console.error('Battery poll error:', err));
            }, 60000);

            await cn?.sendCubeCommand(CubeCommand.HARDWARE);
            await cn?.sendCubeCommand(CubeCommand.FACELETS);
            await cn?.sendCubeCommand(CubeCommand.BATTERY);
        }
    }

    async function disconnect() {
        await connection.disconnect()
            .catch(() => console.log("no connection"));

        setConnection(null)
        connectionRef.current = null
        setLastMoves([]);
        generateScramble()
        // window.location.reload()
    }

    const handleResetCubeState = () => {
        connection?.sendCubeCommand(CubeCommand.RESET);
        twistyPlayerRef.current.alg = '';
    }

    const handleCubeEvent = async event => {
        switch (event.type) {
            case CubeEventType.GYRO:
                if (settingsRef.current.useGyroscope) {
                    await handleGyroEvent(event);
                }
                break;
            case CubeEventType.MOVE:
                await handleMoveEvent(event);
                break;
            case CubeEventType.FACELETS:
                await handleFaceletsEvent(event);
                break;
            case CubeEventType.BATTERY:
                console.log("level", event.batteryLevel)
                setBatteryLevel(event.batteryLevel)
                batteryLevelRef.current = event.batteryLevel
                break;
            case CubeEventType.HARDWARE:
                await handleHardwareEvent(event);
                break
        }
    }

    async function handleGyroEvent(event) {
        if (event.type === CubeEventType.GYRO) {
            let {x: qx, y: qy, z: qz, w: qw} = event.quaternion;
            let quat = new THREE.Quaternion(qx, qz, -qy, qw).normalize();
            if (!basisRef.current) {
                basisRef.current = quat.clone().conjugate();
            }
            cubeQuaternion.copy(quat.premultiply(basisRef.current).premultiply(HOME_ORIENTATION));
        }
    }

    async function handleMoveEvent(event) {
        if (event.type === CubeEventType.MOVE) {
            twistyPlayerRef.current.experimentalAddMove(event.move, {cancel: false});
            setLastMoves((prevMoves) => [...prevMoves, event])

            if (timerStateRef.current !== TimerState.IDLE) {
                solutionMovesRef.current = [...solutionMovesRef.current, event]
            }

            if (lastMoves.length > 10) {
                // const skew = cubeTimestampCalcSkew(lastMoves);
            }
        }
    }

    let cubeInitialized = false;

    async function handleFaceletsEvent(event) {
        if (event.type === CubeEventType.FACELETS && event.facelets === SOLVED_STATE) {
            setLastMoves([])
        }

        if (event.type === CubeEventType.FACELETS && !cubeInitialized) {
            if (event.facelets !== SOLVED_STATE) {
                const kpattern = faceletsToPattern(event.facelets);
                const solution = await experimentalSolve3x3x3IgnoringCenters(kpattern);
                twistyPlayerRef.current.alg = solution.invert();
            } else {
                twistyPlayerRef.current.alg = '';
            }
            cubeInitialized = true
            console.log("Initial cube state is applied successfully", event.facelets);
        }
    }

    async function handleHardwareEvent(event) {
        console.log(event)

        const updatedHardwareInfo = {
            hardwareName: event?.hardwareName || '- n/a -',
            hardwareVersion: event?.hardwareVersion || '- n/a -',
            softwareVersion: event?.softwareVersion || '- n/a -',
            productDate: event?.productDate || '- n/a -',
            gyroSupported: event?.gyroSupported ? "YES" : "NO"
        }
        hardwareInfoRef.current = updatedHardwareInfo
        setHardwareInfo(updatedHardwareInfo)
    }

    const handleRefresh = () => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
                registration.unregister().then(r => console.log("refreshed"));
            });
        });
    }

    useEffect(() => {
        console.log("controls initialize")
    }, [])

    useEffect(() => {
        if (lastMoves.length > 256) {
            setLastMoves(lastMoves.slice(-256));
        }
        if (timerStateRef.current === TimerState.READY) {
            setTimerState(TimerState.RUNNING);
        }

    }, [lastMoves]);

    return <div className="controls">
        <button
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={handleConnect}>{connection ? "Disconnect" : "Connect"}</button>
        {connection && (
            <>
                {timerState === TimerState.IDLE && (
                    <button onClick={handleResetCubeState}
                            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >Reset State
                    </button>)}
                <button
                    className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => basisRef.current = null}>Reset Gyro
                </button>
            </>
        )}
    </div>
}

export default cubeControls;
