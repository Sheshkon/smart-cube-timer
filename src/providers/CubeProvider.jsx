import React, { useEffect, useRef, useState } from 'react';

import { TimerState } from 'src/components/Timer/util.js';
import { CubeContext } from 'src/contexts/CubeContext.jsx';

export const CubeProvider = ({ children }) => {
  const [connection, setConnection] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState({});
  const [deviceName, setDeviceName] = useState('');
  const [deviceMac, setDeviceMac] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [scramble, setScramble] = useState([]);
  const [timerState, setTimerState] = useState(TimerState.IDLE);
  const [lastMoves, setLastMoves] = useState([]);
  const [lastSolveTime, setLastSolveTime] = useState(null);
  const [showScramble, setShowScramble] = useState(false);
  const [shouldBeSolved, setShouldBeSolved] = useState(false);
  const [practiceModeEnabled, setPracticeModeEnabled] = useState(false);

  const twistyPlayerRef = useRef(null);
  const connectionRef = useRef(connection);
  const timerStateRef = useRef(timerState);
  const solutionMovesRef = useRef([]);
  const lastScrambleRef = useRef(scramble);
  const batteryLevelRef = useRef(batteryLevel);
  const hardwareInfoRef = useRef(hardwareInfo);
  const deviceNameRef = useRef(deviceName);
  const deviceMacRef = useRef(deviceMac);
  const practiceModeEnabledRef = useRef(practiceModeEnabled);

  const [scrambleDisplay, setScrambleDisplay] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    connectionRef.current = connection;
    if (connection?.deviceMAC)
      localStorage.setItem('cubeMacAddress', connection?.deviceMAC?.trim());
  }, [connection]);

  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  useEffect(() => {
    practiceModeEnabledRef.current = practiceModeEnabled;
  }, [timerState]);

  return (
    <CubeContext.Provider
      value={{
        connection,
        hardwareInfo,
        batteryLevel,
        scramble,
        lastScrambleRef,
        showScramble,
        scrambleDisplay,
        timerState,
        lastMoves,
        shouldBeSolved,
        practiceModeEnabled,
        lastSolveTime,

        connectionRef,
        timerStateRef,
        twistyPlayerRef,
        solutionMovesRef,
        batteryLevelRef,
        hardwareInfoRef,
        deviceMacRef,
        deviceNameRef,
        practiceModeEnabledRef,

        setPracticeModeEnabled,
        setConnection,
        setHardwareInfo,
        setBatteryLevel,
        setScramble,
        setShowScramble,
        setScrambleDisplay,
        setTimerState,
        setLastMoves,
        isAnimating,
        setIsAnimating,
        setDeviceMac,
        setDeviceName,
        setShouldBeSolved,
        setLastSolveTime,
      }}
    >
      {children}
    </CubeContext.Provider>
  );
};
