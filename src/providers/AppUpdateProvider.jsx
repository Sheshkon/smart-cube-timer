import React, { useCallback, useRef, useState } from 'react';

import PropTypes from 'prop-types';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AppUpdateContext } from 'src/contexts/AppUpdateContext.jsx';

function waitForWaitingWorker(registration) {
  if (registration.waiting) {
    return Promise.resolve(registration.waiting);
  }

  const installing = registration.installing;
  if (!installing) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      installing.removeEventListener('statechange', onState);
      resolve(registration.waiting || null);
    }, 20000);

    const onState = () => {
      if (
        installing.state === 'installed' ||
        installing.state === 'activated' ||
        installing.state === 'redundant'
      ) {
        clearTimeout(timeout);
        installing.removeEventListener('statechange', onState);
        resolve(registration.waiting || null);
      }
    };

    installing.addEventListener('statechange', onState);
  });
}

async function findWaitingWorker(registration) {
  await registration.update();

  if (!registration.installing && !registration.waiting) {
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return waitForWaitingWorker(registration);
}

export function AppUpdateProvider({ children }) {
  const registrationRef = useRef(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration || null;
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return 'unsupported';
    }

    setIsChecking(true);
    try {
      const registration =
        registrationRef.current || (await navigator.serviceWorker.getRegistration());

      if (!registration) {
        return 'unavailable';
      }

      registrationRef.current = registration;
      const waiting = await findWaitingWorker(registration);
      if (waiting) {
        setNeedRefresh(true);
        return 'available';
      }

      return 'current';
    } finally {
      setIsChecking(false);
    }
  }, [setNeedRefresh]);

  const applyUpdate = useCallback(async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker(true);
    } catch (error) {
      setIsUpdating(false);
      throw error;
    }
  }, [updateServiceWorker]);

  return (
    <AppUpdateContext.Provider
      value={{
        offlineReady,
        setOfflineReady,
        needRefresh,
        setNeedRefresh,
        isChecking,
        isUpdating,
        checkForUpdates,
        applyUpdate,
      }}
    >
      {children}
    </AppUpdateContext.Provider>
  );
}

AppUpdateProvider.propTypes = {
  children: PropTypes.node,
};
