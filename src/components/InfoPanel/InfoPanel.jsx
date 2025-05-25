import React, { useEffect, useState } from 'react';

const InfoPanel = ({ wrapperClassName = '' }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      setWarningMessage(
        <div>
          <h2 className="font-semibold mb-2">Bluetooth LE Limitations on iOS</h2>
          <p>
            iOS devices don't fully support Web Bluetooth. Please use:
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>Chrome on macOS/Windows/Linux</li>
            <li>Chrome or Edge on Android</li>
          </ul>
        </div>
      );
      setShowWarning(true);
      return;
    }

    const supported =
      typeof BluetoothDevice !== 'undefined' &&
      'watchAdvertisements' in BluetoothDevice.prototype;

    if (!supported) {
      setWarningMessage(
        <div>
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
          <p>List of devices: <code>chrome://bluetooth-internals/#devices</code></p>
        </div>
      );
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
        {warningMessage}
      </div>
    </div>
  );
};

export default InfoPanel;