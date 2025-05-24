import React, { useEffect, useState } from 'react';

const EnableEverything = ({ wrapperClassName = '' }) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const supported =
      typeof BluetoothDevice !== 'undefined' &&
      'watchAdvertisements' in BluetoothDevice.prototype;

    if (!supported) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className={wrapperClassName}>
      <div className="bg-yellow-100 text-yellow-900 p-3 rounded border border-yellow-300 relative">
        <button
          onClick={() => setShowWarning(false)}
          aria-label="Close warning"
          className="absolute top-2 right-2 text-yellow-900 hover:text-yellow-700 font-bold text-lg"
        >
          ×
        </button>
        <h2 className="font-semibold mb-2">Enable Web Bluetooth Advertisements</h2>
        <p>
          Your browser does not support <code>watchAdvertisements()</code>. To enable it:
        </p>
        <ol className="list-decimal ml-5 mt-2">
          <li>Open Chrome</li>
          <li>Visit <code>chrome://flags/#enable-experimental-web-platform-features</code></li>
          <li>Enable the flag</li>
          <li>Restart your browser</li>
        </ol>
        <p className="mt-2">Or manually enter your Cube's MAC address.</p>
      </div>
    </div>
  );
};

export default EnableEverything;
