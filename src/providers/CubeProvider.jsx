import { TwistyPlayer } from 'cubing/twisty';
import React, { useEffect, useRef, useState } from 'react';
import { TimerState } from 'src/components/Timer/util.js';
import { CubeContext } from 'src/contexts/CubeContext.jsx';

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

export const CubeProvider = ({ children }) => {
  const [connection, setConnection] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState({});
  const [deviceName, setDeviceName] = useState('');
  const [deviceMac, setDeviceMac] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [scramble, setScramble] = useState([]);
  const [timerState, setTimerState] = useState(TimerState.IDLE);
  const [lastMoves, setLastMoves] = useState([]);
  const [showScramble, setShowScramble] = useState(false);

  const twistyPlayerRef = useRef(twistyPlayer);
  const connectionRef = useRef(connection);
  const timerStateRef = useRef(timerState);
  const solutionMovesRef = useRef([]);
  const [results, setResults] = useState([]);
  const lastScrambleRef = useRef(scramble);
  const batteryLevelRef = useRef(batteryLevel);
  const hardwareInfoRef = useRef(hardwareInfo);
  const deviceNameRef = useRef(deviceName);
  const deviceMacRef = useRef(deviceMac);

  const [scrambleDisplay, setScrambleDisplay] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  useEffect(() => {
    timerStateRef.current = timerState;
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
        results,

        connectionRef,
        timerStateRef,
        twistyPlayerRef,
        solutionMovesRef,
        batteryLevelRef,
        hardwareInfoRef,
        deviceMacRef,
        deviceNameRef,

        setConnection,
        setHardwareInfo,
        setBatteryLevel,
        setScramble,
        setShowScramble,
        setScrambleDisplay,
        setTimerState,
        setLastMoves,
        setResults,
        isAnimating,
        setIsAnimating,
        setDeviceMac,
        setDeviceName,
      }}
    >
      {children}
    </CubeContext.Provider>
  );
};
