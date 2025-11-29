import { useEffect, useState } from 'react';

const usePwaExitConfirmation = (
  exitMessage = 'Push "Back" button one more time to close app',
  timeout = 2500
) => {
  const [exitAttempt, setExitAttempt] = useState(false);

  useEffect(() => {
    let timer;

    if (window.history.length === 1) {
      window.history.pushState({ isPWA: true }, null, window.location.href);
    }

    const handlePopState = (event) => {
      window.history.pushState({ isPWA: true }, null, window.location.href);

      if (exitAttempt) {
        window.removeEventListener('popstate', handlePopState);
        window.history.back();
      } else {
        setExitAttempt(true);
        console.warn(exitMessage);

        timer = setTimeout(() => {
          setExitAttempt(false);
        }, timeout);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(timer);
    };
  }, [exitAttempt, exitMessage, timeout]);

  return null;
};

export default usePwaExitConfirmation;
