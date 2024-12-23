import {cubeQuaternion, faceletsToPattern, HOME_ORIENTATION, SOLVED_STATE} from "@utils/util.ts";
import {experimentalSolve3x3x3IgnoringCenters} from "cubing/search";
import {cubeTimestampCalcSkew} from "gan-web-bluetooth";
import {connectGanCube} from "gan-web-bluetooth";
import {useEffect, useRef} from "react";
import {CubeCommand, CubeEventType} from "src/component/cubeControls/util.js";
import {TimerState} from "src/component/timer/util.js";
import {useCubeState} from "src/context/CubeContext.jsx";
import * as THREE from "three";


const customMacAddressProvider = async (device, isFallbackCall) => {
    if (isFallbackCall) {
        return prompt('Unable do determine cube MAC address!\nPlease enter MAC address manually:');
    } else {
        return typeof device.watchAdvertisements == 'function' ? null :
            prompt('Seems like your browser does not support Web Bluetooth watchAdvertisements() API. Enable following flag in Chrome:\n\nchrome://flags/#enable-experimental-web-platform-features\n\nor enter cube MAC address manually:');
    }
};

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
    } = useCubeState()

    const basisRef = useRef(null);


    const handleConnect = async () => {
        if (connection) {
            await connection.disconnect();
            setConnection(null)
        } else {
            const cn = await connectGanCube(customMacAddressProvider)
            setConnection(cn);
            cn?.events$?.subscribe(handleCubeEvent);
            await cn?.sendCubeCommand(CubeCommand.HARDWARE);
            await cn?.sendCubeCommand(CubeCommand.FACELETS);
            await cn?.sendCubeCommand(CubeCommand.BATTERY);
        }
    }

    const handleResetCubeState = () => {
        connection?.sendCubeCommand(CubeCommand.RESET);
        twistyPlayerRef.current.alg = '';
    }


    const handleCubeEvent = async event => {
        switch (event.type) {
            case CubeEventType.GYRO:
                await handleGyroEvent(event);
                break;
            case CubeEventType.MOVE:
                await handleMoveEvent(event);
                break;
            case CubeEventType.FACELETS:
                await handleFaceletsEvent(event);
                break;
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
                const skew = cubeTimestampCalcSkew(lastMoves);
                // $('#skew').val(skew + '%');
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

    return <>
        <button onClick={handleConnect}>{connection ? "Disconnect" : "Connect"}</button>
        {connection && (
            <>
                {timerState === TimerState.IDLE && (<button onClick={handleResetCubeState}>Reset State</button>)}
                <button onClick={() => basisRef.current = null}>Reset Gyro</button>
            </>
        )}
    </>

}

export default cubeControls;
