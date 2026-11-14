import { useEffect, useRef } from 'react';

import { experimentalSolve3x3x3IgnoringCenters } from 'cubing/search';
import { connectGanCube } from 'gan-web-bluetooth';
import { toast } from 'react-toastify';
import AppModeSwitcher from 'src/components/AppModeSwitcher/AppModeSwitcher.jsx';
import { TimerState } from 'src/components/Timer/util.js';
import { AppMode } from 'src/constants/appModes';
import { cubeHistoryService, SESSION_HEARTBEAT_MS } from 'src/db/cubeHistoryService.js';
import { useCube } from 'src/hooks/useCube';
import { useSettings } from 'src/hooks/useSettings';
import {
  canUseSilentBluetoothReconnect,
  connectGanCubeToDevice,
  findPermittedCube,
  rememberConnectedCube,
} from 'src/utils/ganCubeConnect.js';
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
    cubeHistorySessionIdRef,
    connecting,
    reconnecting,
    setConnecting,
    setReconnecting,
    registerConnectCube,
  } = useCube();

  const { settingsRef, settings, updateSetting } = useSettings();

  const batteryPollIntervalRef = useRef(null);
  const connectingRef = useRef(false);
  const userDisconnectRef = useRef(false);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const handleCubeEventRef = useRef(null);
  const eventsSubscriptionRef = useRef(null);
  const tearingDownRef = useRef(false);
  const cubeInitializedRef = useRef(false);

  function toastTheme() {
    return { theme: settingsRef.current.theme };
  }

  function cubeDisconnectedNotification() {
    return toast.error('Cube disconnected', toastTheme());
  }

  function isUserCancelledDeviceChooser(error) {
    return (
      error?.name === 'NotFoundError' &&
      String(error?.message ?? '').includes('User cancelled the requestDevice() chooser')
    );
  }

  function autoReconnectEnabled() {
    return settingsRef.current.autoReconnect !== false;
  }

  function clearReconnectTimer() {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }

  function stopReconnect() {
    clearReconnectTimer();
    reconnectAttemptRef.current = 0;
    setReconnecting(false);
  }

  function scheduleReconnect() {
    if (!autoReconnectEnabled() || userDisconnectRef.current || !canUseSilentBluetoothReconnect()) {
      setReconnecting(false);
      return;
    }

    clearReconnectTimer();
    setReconnecting(true);
    reconnectAttemptRef.current += 1;
    const delay = Math.min(15000, 1000 * 2 ** Math.min(reconnectAttemptRef.current - 1, 4));
    reconnectTimerRef.current = setTimeout(() => {
      connectPreferredCube({ openChooser: false, silent: true }).catch(() => {});
    }, delay);
  }

  async function teardown(endedBy = 'user', { skipDeviceDisconnect = false, keepMode = false } = {}) {
    if (tearingDownRef.current) return;
    tearingDownRef.current = true;
    try {
      eventsSubscriptionRef.current?.unsubscribe();
      eventsSubscriptionRef.current = null;
      clearInterval(batteryPollIntervalRef.current);
      batteryPollIntervalRef.current = null;

      if (cubeHistorySessionIdRef.current) {
        await cubeHistoryService.endSession(cubeHistorySessionIdRef.current, endedBy);
        cubeHistorySessionIdRef.current = null;
      }

      const current = connectionRef.current;
      if (!skipDeviceDisconnect && current && current !== false) {
        await current.disconnect().catch(() => console.log('no connection'));
      }

      setConnection(false);
      connectionRef.current = false;
      setLastMoves([]);
      if (gyroBasisRef) gyroBasisRef.current = null;

      if (!keepMode) {
        practiceModeEnabledRef.current = false;
        setPracticeModeEnabled(false);
      }
    } finally {
      tearingDownRef.current = false;
    }
  }

  async function establishConnection(device) {
    if (batteryPollIntervalRef.current) {
      clearInterval(batteryPollIntervalRef.current);
      batteryPollIntervalRef.current = null;
    }

    const cn = device
      ? await connectGanCubeToDevice(device, customMacAddressProvider)
      : await connectGanCube(customMacAddressProvider);

    const training = settingsRef.current.appMode === AppMode.TRAINING;
    practiceModeEnabledRef.current = training;
    setPracticeModeEnabled(training);
    timerStateRef.current = TimerState.IDLE;
    setTimerState(TimerState.IDLE);
    setLastMoves([]);
    solutionMovesRef.current = [];
    setShowScramble(true);
    cubeInitializedRef.current = false;
    setShouldBeSolved(false);
    shouldBeSolvedRef.current = false;
    connectionRef.current = cn;
    setConnection(cn);
    cubeHistorySessionIdRef.current = await cubeHistoryService.startSession({
      deviceMAC: cn?.deviceMAC,
      deviceName: cn?.deviceName,
    });
    await rememberConnectedCube(cn, device);
    eventsSubscriptionRef.current?.unsubscribe();
    eventsSubscriptionRef.current = cn?.events$?.subscribe((event) =>
      handleCubeEventRef.current?.(event)
    );

    await cn?.sendCubeCommand(CubeCommand.HARDWARE);
    await cn?.sendCubeCommand(CubeCommand.FACELETS);
    await cn?.sendCubeCommand(CubeCommand.BATTERY);

    batteryPollIntervalRef.current = setInterval(() => {
      cn?.sendCubeCommand(CubeCommand.BATTERY).catch((err) => {
        clearInterval(batteryPollIntervalRef.current);
        batteryPollIntervalRef.current = null;
        console.error('Battery poll error:', err);
        handleUnexpectedDisconnect();
      });
    }, 5000);

    return cn;
  }

  async function connectPreferredCube({
    deviceName,
    deviceId,
    openChooser = false,
    silent = false,
  } = {}) {
    if (connectingRef.current) return;

    userDisconnectRef.current = false;
    connectingRef.current = true;
    if (!silent) setConnecting(true);

    try {
      if (connectionRef.current && connectionRef.current !== false) {
        const sameCube =
          deviceName && connectionRef.current.deviceName === deviceName;
        if (sameCube) return;
        await teardown('user', { keepMode: true });
      }

      const permitted = await findPermittedCube({ deviceId, deviceName });
      if (permitted) {
        try {
          const notifyReconnect = silent && reconnectAttemptRef.current > 0;
          await establishConnection(permitted);
          stopReconnect();
          if (notifyReconnect) toast.success('Cube reconnected', toastTheme());
          return;
        } catch (error) {
          console.warn('Silent cube connect failed', error);
          if (!openChooser) throw error;
        }
      }

      if (!openChooser) {
        throw new Error('No permitted cube available');
      }

      await establishConnection(null);
      stopReconnect();
    } catch (error) {
      await teardown(silent ? 'lost' : 'user', { skipDeviceDisconnect: true, keepMode: silent });
      if (silent) {
        const permitted = await findPermittedCube({ deviceId, deviceName });
        if (permitted) scheduleReconnect();
        else stopReconnect();
        return;
      }
      if (isUserCancelledDeviceChooser(error)) return;
      cubeDisconnectedNotification();
      console.error(error);
    } finally {
      connectingRef.current = false;
      if (!silent) setConnecting(false);
    }
  }

  function handleUnexpectedDisconnect() {
    if (userDisconnectRef.current || tearingDownRef.current) return;
    if (!connectionRef.current) {
      if (autoReconnectEnabled()) scheduleReconnect();
      return;
    }

    teardown('lost', { skipDeviceDisconnect: true, keepMode: autoReconnectEnabled() }).then(() => {
      cubeDisconnectedNotification();
      if (autoReconnectEnabled()) scheduleReconnect();
    });
  }

  const handleConnect = async () => {
    if (connectionRef.current && connectionRef.current !== false) {
      userDisconnectRef.current = true;
      stopReconnect();
      await teardown('user');
      return;
    }

    await connectPreferredCube({ openChooser: true });
  };

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
      case CubeEventType.DISCONNECT:
        handleUnexpectedDisconnect();
        break;
    }
  };

  handleCubeEventRef.current = handleCubeEvent;

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
      shouldBeSolvedRef.current = false;
    }

    if (event.type === CubeEventType.FACELETS && !cubeInitializedRef.current) {
      if (event.facelets !== SOLVED_STATE) {
        setShouldBeSolved(true);
        shouldBeSolvedRef.current = true;
        const kpattern = faceletsToPattern(event.facelets);
        const solution = await experimentalSolve3x3x3IgnoringCenters(kpattern);
        twistyPlayerRef.current.alg = solution.invert();
      } else {
        twistyPlayerRef.current.alg = '';
      }
      cubeInitializedRef.current = true;
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
    if (cubeHistorySessionIdRef.current) {
      cubeHistoryService.updateSession(cubeHistorySessionIdRef.current, updatedHardwareInfo);
    }
  }

  useEffect(() => {
    if (lastMoves.length > 256) {
      setLastMoves(lastMoves.slice(-256));
    }

    if (settingsRef.current.appMode === AppMode.MINI_GAMES) return;

    if (
      lastMoves.length > 0 &&
      (timerStateRef.current === TimerState.READY ||
        timerStateRef.current === TimerState.INSPECTION)
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

  const connectPreferredCubeRef = useRef(connectPreferredCube);
  connectPreferredCubeRef.current = connectPreferredCube;

  useEffect(() => {
    registerConnectCube((options) => connectPreferredCubeRef.current(options));
    return () => {
      registerConnectCube(null);
      clearReconnectTimer();
    };
  }, [registerConnectCube]);

  useEffect(() => {
    if (!autoReconnectEnabled()) {
      stopReconnect();
      return undefined;
    }
    if (connectionRef.current) return undefined;
    if (!canUseSilentBluetoothReconnect()) return undefined;

    const timeoutId = setTimeout(() => {
      connectPreferredCube({ openChooser: false, silent: true }).catch(() => {});
    }, 400);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (settings.autoReconnect === false) {
      stopReconnect();
    }
  }, [settings.autoReconnect]);

  useEffect(() => {
    const handlePageHide = () => {
      const sessionId = cubeHistorySessionIdRef.current;
      if (!sessionId) return;
      cubeHistoryService.endSession(sessionId, 'unload');
      cubeHistorySessionIdRef.current = null;
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [cubeHistorySessionIdRef]);

  useEffect(() => {
    if (!connection) return undefined;

    const touch = () => {
      const sessionId = cubeHistorySessionIdRef.current;
      if (sessionId) cubeHistoryService.touchSession(sessionId);
    };

    touch();
    const heartbeat = setInterval(touch, SESSION_HEARTBEAT_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') touch();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [connection, cubeHistorySessionIdRef]);

  return (
    <div className='controls flex flex-col items-center justify-center gap-2 py-2'>
      {connection && <AppModeSwitcher />}
      <div className='flex flex-row'>
        <button
          className='app-btn relative z-10 p-1.5 rounded-full px-3 transition-colors'
          onClick={handleConnect}
          disabled={connecting}
        >
          {connection ? 'Disconnect' : reconnecting ? 'Reconnecting…' : connecting ? 'Connecting…' : 'Connect'}
        </button>
        <button
          className='app-btn relative z-10 p-1.5 rounded-full px-3 transition-colors'
          onClick={() => updateSetting('showCubeAnimation', !settings.showCubeAnimation)}
        >
          {settings.showCubeAnimation ? 'Hide' : 'Show'} Cube
        </button>
      </div>
      {connection && (settings.showCubeAnimation || settings.appMode === AppMode.MINI_GAMES) && (
        <div className='flex flex-row'>
          <button
            className='app-btn relative z-10 p-1.5 rounded-full px-3 transition-colors'
            onClick={() => {
              gyroBasisRef.current = null;
            }}
          >
            Reset Gyro
          </button>
          {settings.showCubeAnimation && timerState === TimerState.IDLE && (
            <button
              onClick={handleResetCubeState}
              className='app-btn relative z-10 p-1.5 rounded-full px-3 transition-colors'
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
