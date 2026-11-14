import { useEffect, useState } from 'react';

import { FiDownload, FiRefreshCw, FiX } from 'react-icons/fi';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function RefreshPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      console.log(`Service Worker at: ${swUrl}`);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setIsInstallable(false);
  };

  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(closePrompt, 5000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  const handleInstall = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;

    console.log(outcome === 'accepted'
      ? 'User accepted install'
      : 'User dismissed install');

    setInstallPromptEvent(null);
    setIsInstallable(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  if (!offlineReady && !needRefresh && !isInstallable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="app-card rounded-lg overflow-hidden w-72">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-medium">
                {offlineReady
                  ? 'App Ready'
                  : needRefresh
                    ? 'New Version'
                    : 'Install App'}
              </h3>
              <p className="mt-1 text-sm opacity-70">
                {offlineReady
                  ? 'Your app is now ready to work offline'
                  : needRefresh
                    ? 'A new version is available!'
                    : 'Add this app to your home screen'}
              </p>
            </div>
            <button
              onClick={closePrompt}
              className="opacity-60 hover:opacity-100"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            {needRefresh && (
              <button
                onClick={handleUpdate}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm"
                style={{ backgroundColor: 'var(--app-accent)', color: 'var(--app-on-accent)' }}
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Update
              </button>
            )}
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm"
                style={{ backgroundColor: 'var(--app-accent)', color: 'var(--app-on-accent)' }}
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
