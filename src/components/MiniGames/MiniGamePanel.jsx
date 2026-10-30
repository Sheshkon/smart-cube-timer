import { useEffect, useMemo, useRef, useState } from 'react';

import {
  CUBE_HOME_POSE,
  CUBE_START_GESTURE,
  MINI_GAMES_CATALOG,
  MiniGameControl,
  MiniGameId,
} from 'src/constants/miniGames';
import { useCube } from 'src/hooks/useCube';
import { useSettings } from 'src/hooks/useSettings';

import DoodleJumpGame from './games/DoodleJumpGame/DoodleJumpGame';
import { useDoodleFaceSteer } from './games/DoodleJumpGame/faceMoveInput';
import { useRacingFaceSteer } from './games/RacingGame/faceMoveInput';
import RacingGame from './games/RacingGame/RacingGame';
import { useSpaceShipFaceInput } from './games/SpaceShipGame/faceMoveInput';
import SpaceShipGame from './games/SpaceShipGame/SpaceShipGame';
import { useFfStartGesture } from './useFaceMoveInput';
import { useGyroSteer } from './useGyroSteer';

const MiniGamePanel = () => {
  const { connection, hardwareInfo, gyroBasisRef, lastMoves } = useCube();
  const { settings, updateSetting } = useSettings();
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);
  const [ended, setEnded] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(360);
  const steerRef = useRef(0);
  const actionQueueRef = useRef([]);
  const sensitivityRef = useRef(settings.miniGameSensitivity ?? 1);
  sensitivityRef.current = settings.miniGameSensitivity ?? 1;

  useEffect(() => {
    const updateWidth = () => setCanvasWidth(Math.min(360, Math.max(260, window.innerWidth - 48)));
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const selectedId = settings.miniGameId || MiniGameId.SPACESHIP;
  const selectedGame = useMemo(
    () => MINI_GAMES_CATALOG.find((g) => g.id === selectedId) ?? MINI_GAMES_CATALOG[0],
    [selectedId]
  );

  const isGyroGame = selectedGame.control === MiniGameControl.GYRO;
  const gyroReady = Boolean(connection) && hardwareInfo?.gyroSupported === 'YES';
  const facesReady = Boolean(connection);

  useGyroSteer(playing && isGyroGame && gyroReady, steerRef, sensitivityRef);
  useRacingFaceSteer(
    playing && selectedId === MiniGameId.RACING && !gyroReady && facesReady,
    lastMoves,
    steerRef,
    sensitivityRef
  );
  useDoodleFaceSteer(
    playing && selectedId === MiniGameId.DOODLE && !gyroReady && facesReady,
    lastMoves,
    steerRef,
    sensitivityRef
  );
  useSpaceShipFaceInput(
    playing && selectedId === MiniGameId.SPACESHIP && facesReady,
    lastMoves,
    actionQueueRef
  );

  const dark = settings.theme === 'dark';
  const storageKey = `smart-cube-timer:mini:${selectedGame.id}`;
  const height =
    selectedGame.id === MiniGameId.DOODLE ? 380 : selectedGame.id === MiniGameId.RACING ? 300 : 360;

  const startGame = () => {
    if (ended) {
      setRunId((n) => n + 1);
      setEnded(false);
    }
    actionQueueRef.current = [];
    if (isGyroGame && gyroBasisRef) gyroBasisRef.current = null;
    setPlaying(true);
  };

  const handleStartToggle = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    startGame();
  };

  useFfStartGesture(Boolean(connection) && !playing, lastMoves, startGame);

  const handleGameOver = () => {
    setEnded(true);
    setPlaying(false);
  };

  const GameComponent =
    selectedGame.id === MiniGameId.DOODLE
      ? DoodleJumpGame
      : selectedGame.id === MiniGameId.SPACESHIP
        ? SpaceShipGame
        : RacingGame;

  return (
    <div className='w-full max-w-2xl flex flex-col items-center gap-4 py-2'>
      <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>{CUBE_HOME_POSE}</p>
      {!playing && (
        <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>{CUBE_START_GESTURE}</p>
      )}
      <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>{selectedGame.hint}</p>

      {!connection && (
        <p className='text-amber-700 dark:text-amber-400 text-sm font-medium'>
          Connect your smart cube to play.
        </p>
      )}

      {connection && isGyroGame && hardwareInfo?.gyroSupported === 'NO' && (
        <p className='text-amber-700 dark:text-amber-400 text-sm font-medium'>
          This cube has no gyro — steer with F and F′ face turns.
        </p>
      )}

      <div className='flex flex-wrap justify-center gap-2'>
        {MINI_GAMES_CATALOG.map((game) => (
          <button
            key={game.id}
            type='button'
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              game.id === selectedGame.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => {
              updateSetting('miniGameId', game.id);
              setPlaying(false);
              setEnded(false);
              setRunId((n) => n + 1);
              actionQueueRef.current = [];
            }}
          >
            {game.title}
          </button>
        ))}
      </div>

      <p className='text-xs text-gray-500 dark:text-gray-400'>{selectedGame.description}</p>

      <div className='w-full flex justify-center overflow-x-auto'>
        <GameComponent
          key={`${selectedGame.id}-${runId}`}
          width={canvasWidth}
          height={height}
          playing={playing}
          dark={dark}
          steerRef={steerRef}
          actionQueueRef={actionQueueRef}
          sensitivityRef={sensitivityRef}
          storageKey={storageKey}
          onGameOver={handleGameOver}
        />
      </div>

      {selectedGame.supportsSensitivity && (
        <label className='flex items-center gap-3 w-full max-w-sm text-sm text-gray-600 dark:text-gray-400'>
          <span className='shrink-0'>Sensitivity</span>
          <input
            type='range'
            min='0.4'
            max='2'
            step='0.1'
            className='range range-xs flex-1'
            value={settings.miniGameSensitivity ?? 1}
            onChange={(e) => updateSetting('miniGameSensitivity', Number(e.target.value))}
          />
          <span className='w-8 tabular-nums'>{(settings.miniGameSensitivity ?? 1).toFixed(1)}</span>
        </label>
      )}

      <button
        type='button'
        className='px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm font-medium'
        disabled={!connection}
        onClick={handleStartToggle}
      >
        {playing ? 'Pause game' : ended ? 'Play again (or F F′)' : 'Start (or turn F F′)'}
      </button>
    </div>
  );
};

export default MiniGamePanel;
