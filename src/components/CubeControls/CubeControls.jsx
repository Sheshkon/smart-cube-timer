import { useEffect, useRef } from 'react';

import { experimentalSolve3x3x3IgnoringCenters } from 'cubing/search';
import { connectGanCube } from 'gan-web-bluetooth';
import { toast } from 'react-toastify';
import { TimerState } from 'src/components/Timer/util.js';
import { useCube } from 'src/hooks/useCube';
import { useSettings } from 'src/hooks/useSettings';
import { cubeQuaternion, faceletsToPattern, HOME_ORIENTATION, SOLVED_STATE } from 'src/utils/util.ts';
import * as THREE from 'three';

import { CubeCommand, CubeEventType, customMacAddressProvider } from './/util.js';

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
    connectionRef,
    setShouldBeSolved,
    setShowScramble
  } = useCube();

  const { settingsRef } = useSettings();

  const basisRef = useRef(null);

  const batteryPollIntervalRef = useRef(null);

  function cubeDisconnectedNotification() {
    return toast.error('Cube disconnected', { theme: settingsRef.current.theme });
  }

  const handleConnect = async () => {
    try {
      if (connection) {
        await disconnect();
      } else {
        if (batteryPollIntervalRef.current) {
          clearInterval(batteryPollIntervalRef.current);
          batteryPollIntervalRef.current = null;
        }
        const cn = await connectGanCube(customMacAddressProvider);
        setConnection(cn);
        cn?.events$?.subscribe(handleCubeEvent);

        await cn?.sendCubeCommand(CubeCommand.HARDWARE);
        await cn?.sendCubeCommand(CubeCommand.FACELETS);
        await cn?.sendCubeCommand(CubeCommand.BATTERY);

        batteryPollIntervalRef.current = setInterval(() => {
          cn?.sendCubeCommand(CubeCommand.BATTERY).catch((err) => {
              clearInterval(batteryPollIntervalRef.current);
              console.error('Battery poll error:', err);
              disconnect().then(() => cubeDisconnectedNotification());
            },
          );
        }, 5000);
      }
    } catch (e) {
      await disconnect();
      cubeDisconnectedNotification();
      console.error(e);
    }
  };

  async function disconnect() {
    clearInterval(batteryPollIntervalRef.current);

    if (connection)
      await connection.disconnect().catch(() => console.log('no connection'));

    setConnection(null);
    connectionRef.current = null;
    setLastMoves([]);
    // window.location.reload()
  }

  const handleResetCubeState = () => {
    connection?.sendCubeCommand(CubeCommand.RESET);
    setLastMoves([]);
    setShouldBeSolved(false);
    twistyPlayerRef.current.alg = '';
  };

  const handleCubeEvent = async (event) => {
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
        console.log('level', event.batteryLevel);
        setBatteryLevel(event.batteryLevel);
        batteryLevelRef.current = event.batteryLevel;
        break;
      case CubeEventType.HARDWARE:
        await handleHardwareEvent(event);
        break;
    }
  };

  async function handleGyroEvent(event) {
    if (event.type === CubeEventType.GYRO) {
      let { x: qx, y: qy, z: qz, w: qw } = event.quaternion;
      let quat = new THREE.Quaternion(qx, qz, -qy, qw).normalize();
      if (!basisRef.current) {
        basisRef.current = quat.clone().conjugate();
      }
      cubeQuaternion.copy(
        quat.premultiply(basisRef.current).premultiply(HOME_ORIENTATION),
      );
    }
  }

  async function handleMoveEvent(event) {
    if (event.type === CubeEventType.MOVE) {
      twistyPlayerRef.current.experimentalAddMove(event.move, {
        cancel: false,
      });
      setLastMoves((prevMoves) => [...prevMoves, event]);

      if (timerStateRef.current !== TimerState.IDLE && timerStateRef.current !== TimerState.DNS) {
        solutionMovesRef.current = [...solutionMovesRef.current, event];
      }

      if (lastMoves.length > 10) {
        // const skew = cubeTimestampCalcSkew(lastMoves);
      }
    }
  }

  let cubeInitialized = false;

  async function handleFaceletsEvent(event) {
    if (
      event.type === CubeEventType.FACELETS &&
      event.facelets === SOLVED_STATE
    ) {
      setLastMoves([]);
      setShouldBeSolved(false);
    }

    if (event.type === CubeEventType.FACELETS && !cubeInitialized) {

      if (event.facelets !== SOLVED_STATE) {
        setShouldBeSolved(true);
        const kpattern = faceletsToPattern(event.facelets);
        const solution = await experimentalSolve3x3x3IgnoringCenters(kpattern);
        twistyPlayerRef.current.alg = solution.invert();
      } else {
        twistyPlayerRef.current.alg = '';
      }
      cubeInitialized = true;
      console.log('Initial cube state is applied successfully', event.facelets);
    }
  }

  async function handleHardwareEvent(event) {
    const updatedHardwareInfo = {
      hardwareName: event?.hardwareName || '- n/a -',
      hardwareVersion: event?.hardwareVersion || '- n/a -',
      softwareVersion: event?.softwareVersion || '- n/a -',
      productDate: event?.productDate || '- n/a -',
      gyroSupported: event?.gyroSupported ? 'YES' : 'NO',
    };
    hardwareInfoRef.current = updatedHardwareInfo;
    setHardwareInfo(updatedHardwareInfo);
  }

  useEffect(() => {
    if (lastMoves.length > 256) {
      setLastMoves(lastMoves.slice(-256));
    }

    if (timerStateRef.current === TimerState.READY || timerStateRef.current === TimerState.INSPECTION) {
      setTimerState(TimerState.RUNNING);
    }

    if (timerStateRef.current === TimerState.DNS) {
      setShowScramble(true);
      setShouldBeSolved(true);
      setLastMoves([]);
      solutionMovesRef.current = [];
      setTimerState(TimerState.IDLE);
    }

  }, [lastMoves]);

  return (
    <div className="controls">
      <button
        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onClick={handleConnect}
      >
        {connection ? 'Disconnect' : 'Connect'}
      </button>
      {connection && (
        <>
          {timerState === TimerState.IDLE && (
            <button
              onClick={handleResetCubeState}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Reset State
            </button>
          )}
          <button
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => (basisRef.current = null)}
          >
            Reset Gyro
          </button>
        </>
      )}
    </div>
  );
};

export default cubeControls;
