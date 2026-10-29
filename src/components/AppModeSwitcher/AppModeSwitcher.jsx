import clsx from 'clsx';

import { APP_MODE_OPTIONS, AppMode } from 'src/constants/appModes';
import { TimerState } from 'src/components/Timer/util.js';
import { useCube } from 'src/hooks/useCube';
import { useSettings } from 'src/hooks/useSettings';

const AppModeSwitcher = ({ className = '' }) => {
  const { settings, updateSetting } = useSettings();
  const {
    setPracticeModeEnabled,
    practiceModeEnabledRef,
    timerState,
    timerStateRef,
    setTimerState,
    setLastMoves,
    solutionMovesRef,
    setShowScramble,
  } = useCube();

  const mode = settings.appMode || AppMode.SESSION;

  const setMode = (nextMode) => {
    if (nextMode === mode) return;

    const training = nextMode === AppMode.TRAINING;
    practiceModeEnabledRef.current = training;
    updateSetting('appMode', nextMode);
    setPracticeModeEnabled(training);
    if (nextMode === AppMode.MINI_GAMES && !settings.useGyroscope) {
      updateSetting('useGyroscope', true);
    }

    timerStateRef.current = TimerState.IDLE;
    setTimerState(TimerState.IDLE);
    solutionMovesRef.current = [];
    setLastMoves([]);
    setShowScramble(true);
  };

  return (
    <div
      className={clsx(
        'flex flex-wrap justify-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800',
        className
      )}
      role='tablist'
      aria-label='Application mode'
    >
      {APP_MODE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type='button'
          role='tab'
          aria-selected={mode === option.id}
          disabled={option.id !== AppMode.MINI_GAMES && timerState === TimerState.RUNNING}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-40',
            mode === option.id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
          onClick={() => setMode(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default AppModeSwitcher;
