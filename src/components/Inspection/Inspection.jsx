import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import twelveMp3 from 'src/assets/mp3/12-inspection-woman.mp3';
import eightMp3 from 'src/assets/mp3/8-inspection-woman.mp3';
import { TimerState } from 'src/components/Timer/util.js';
import { useCube } from 'src/hooks/useCube.js';
import { useSettings } from 'src/hooks/useSettings.js';
import useSound from 'use-sound';


const Inspection = () => {
  const [counter, setCounter] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  const [play8] = useSound(eightMp3);
  const [play12] = useSound(twelveMp3);

  const { setTimerState } = useCube();
  const { settingsRef } = useSettings();

  const startInspection = () => {
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setCounter(prev => {
        const newVal = prev + 1;

        if (newVal === 8)
          play8();

        if (newVal === 12)
          play12();

        if (newVal > 15) {
          clearInterval(interval);
          setIsComplete(true);
        }

        return newVal >= 0 ? newVal : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, play8, play12]);

  useEffect(() => {
    if (isComplete) {
      setTimerState(TimerState.DNS);
      toast.warn('Did Not Start', { theme: settingsRef.current.theme });
    }
  }, [isComplete]);

  useEffect(() => {
    startInspection();
  }, []);


  return (
    <div>
      {isComplete ? (
        <div className="text-error text-6xl">DNS</div>
      ) : (
        <span className="countdown font-mono text-6xl">
          <span
            style={{ '--value': counter }}
            className={counter >= 12 ? 'text-error' : ''}
          >
            {counter}
          </span>
        </span>
      )}
    </div>
  );
};

export default Inspection;