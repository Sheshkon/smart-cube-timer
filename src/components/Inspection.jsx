import { useEffect, useState } from 'react';

import { TimerState } from 'src/components/Timer/util.js';
import { useCube } from 'src/hooks/useCube.js';

const Inspection = () => {
  const [counter, setCounter] = useState(15);
  const [isComplete, setIsComplete] = useState(false);

  const { setTimerState } = useCube();

  const onInspectionEnded = () => {
    console.log('DNS');
    setTimerState(TimerState.DNS);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsComplete(true);
          onInspectionEnded();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {isComplete ? (
        <div className="text-error text-6xl">DNS</div>
      ) : (
        <span className="countdown font-mono text-6xl">
          <span
            style={{ '--value': counter }}
            className={counter <= 3 ? 'text-error' : ''}
          >
            {counter}
          </span>
        </span>
      )}
    </div>
  );
};

export default Inspection;