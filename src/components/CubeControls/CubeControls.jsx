import { useEffect, useRef } from 'react';

import { experimentalSolve3x3x3IgnoringCenters } from 'cubing/search';
import { connectGanCube } from 'gan-web-bluetooth';
import { toast } from 'react-toastify';
import AppModeSwitcher from 'src/components/AppModeSwitcher/AppModeSwitcher.jsx';
import { TimerState } from 'src/components/Timer/util.js';
import { AppMode } from 'src/constants/appModes';
import { useCube } from 'src/hooks/useCube';
import { useSettings } from 'src/hooks/useSettings';
import {
  cubePoseQuaternion,
  cubeQuaternion,
  faceletsToPattern,
  HOME_ORIENTATION,
  PRACTICE_TEPMPLATES,
  SOLVED_STATE,
} from 'src/utils/util.ts';
import * as THREE from 'three';

import { CubeCommand, CubeEventType, customMacAddressProvider, matchesPattern } from './/util.js';

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
    shouldBeSolvedRef,
    setShowScramble,
    setPracticeModeEnabled,
    practiceModeEnabledRef,
    gyroBasisRef,
  } = useCube();

  const { settingsRef, settings, updateSetting } = useSettings();

  const batteryPollIntervalRef = useRef(null);

  function cubeDisconnectedNotification() {
    return toast.error('Cube disconnected', { theme: settingsRef.current.theme });
  }

  function isUserCancelledDeviceChooser(error) {
    return (
      error?.name === 'NotFoundError' &&
      String(error?.message ?? '').includes('User cancelled the requestDevice() chooser')
    );
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
        const training = settingsRef.current.appMode === AppMode.TRAINING;
        practiceModeEnabledRef.current = training;
        setPracticeModeEnabled(training);
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
          });
        }, 5000);
      }
    } catch (e) {
      await disconnect();
      if (isUserCancelledDeviceChooser(e)) {
        return;
      }
      cubeDisconnectedNotification();
      console.error(e);
    }
  };

  async function disconnect() {
    clearInterval(batteryPollIntervalRef.current);

    if (connection) await connection.disconnect().catch(() => console.log('no connection'));

    setConnection(false);
    connectionRef.current = false;
    practiceModeEnabledRef.current = false;
    setPracticeModeEnabled(false);
    setLastMoves([]);
    if (gyroBasisRef) gyroBasisRef.current = null;
  }

  const handleResetCubeState = () => {
    connection?.sendCubeCommand(CubeCommand.RESET);
    setLastMoves([]);
    setShouldBeSolved(false);
    shouldBeSolvedRef.current = false;
    twistyPlayerRef.current.alg = '';
  };

  const handleCubeEvent = async (event) => {
    switch (event.type) {
      case CubeEventType.GYRO:
        if (settingsRef.current.useGyroscope) {
          handleGyroEvent(event);
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

  function handleGyroEvent(event) {
    if (event.type !== CubeEventType.GYRO) return;
    const { x: qx, y: qy, z: qz, w: qw } = event.quaternion;
    const raw = new THREE.Quaternion(qx, qz, -qy, qw).normalize();
    if (!gyroBasisRef.current) {
      gyroBasisRef.current = raw.clone().conjugate();
    }
    const relative = raw.premultiply(gyroBasisRef.current);
    cubePoseQuaternion.copy(relative);
    cubeQuaternion.copy(relative.clone().premultiply(HOME_ORIENTATION));
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
    const isSolved = practiceModeEnabledRef.current
      ? matchesPattern(
          event.facelets,
          PRACTICE_TEPMPLATES[settingsRef.current.practiceMode.category]
        )
      : event.facelets === SOLVED_STATE;

    if (event.type === CubeEventType.FACELETS && isSolved) {
      setLastMoves([]);
      setShouldBeSolved(false);
    }

    if (event.type === CubeEventType.FACELETS && !cubeInitialized) {
      if (event.facelets !== SOLVED_STATE) {
        setShouldBeSolved(true);
        shouldBeSolvedRef.current = true;
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

    if (settingsRef.current.appMode === AppMode.MINI_GAMES) return;

    if (
      timerStateRef.current === TimerState.READY ||
      timerStateRef.current === TimerState.INSPECTION
    ) {
      setTimerState(TimerState.RUNNING);
    }

    if (timerStateRef.current === TimerState.DNS) {
      setShowScramble(true);
      setShouldBeSolved(true);
      shouldBeSolvedRef.current = false;
      setLastMoves([]);
      solutionMovesRef.current = [];
      setTimerState(TimerState.IDLE);
    }
  }, [lastMoves, setLastMoves, setShouldBeSolved, setShowScramble, setTimerState, timerStateRef]);

  return (
    <div className='controls flex flex-col items-center justify-center gap-2 py-2'>
      {connection && <AppModeSwitcher />}
      <div className='flex flex-row'>
        <button
          className='relative z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
          onClick={handleConnect}
        >
          {connection ? 'Disconnect' : 'Connect'}
        </button>
        <button
          className='relative z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
          onClick={() => updateSetting('showCubeAnimation', !settings.showCubeAnimation)}
        >
          {settings.showCubeAnimation ? 'Hide' : 'Show'} Cube
        </button>
      </div>
      {connection && (settings.showCubeAnimation || settings.appMode === AppMode.MINI_GAMES) && (
        <div className='flex flex-row'>
          <button
            className='relative z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            onClick={() => {
              gyroBasisRef.current = null;
            }}
          >
            Reset Gyro
          </button>
          {settings.showCubeAnimation && timerState === TimerState.IDLE && (
            <button
              onClick={handleResetCubeState}
              className='relative z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            >
              Reset State
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default cubeControls;
