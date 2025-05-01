import { useEffect } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';
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

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(closePrompt, 5000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  if (!offlineReady && !needRefresh) return null;

  const handleUpdate = () => {
    updateServiceWorker(true).then(() => {
      console.log('Update completed');
      // window.location.reload(); // Force reload if needed
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-72">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {offlineReady ? 'App Ready' : 'New Version'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {offlineReady
                  ? 'Your app is now ready to work offline'
                  : 'A new version is available!'}
              </p>
            </div>
            <button
              onClick={closePrompt}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {needRefresh && (
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleUpdate}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Update
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}