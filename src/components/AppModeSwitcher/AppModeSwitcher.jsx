import clsx from 'clsx';
import { TimerState } from 'src/components/Timer/util.js';
import { APP_MODE_OPTIONS, AppMode } from 'src/constants/appModes';
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

  const modeSwitchLocked = timerState === TimerState.RUNNING;

  const setMode = (nextMode) => {
    if (nextMode === mode) return;
    if (timerStateRef.current === TimerState.RUNNING) return;

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
        'app-inset relative z-10 flex flex-wrap justify-center gap-1 p-1 rounded-full touch-manipulation',
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
          disabled={modeSwitchLocked && option.id !== mode}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-manipulation disabled:opacity-40',
            mode === option.id ? 'app-btn-accent shadow-sm' : 'opacity-80 hover:opacity-100'
          )}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setMode(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default AppModeSwitcher;
