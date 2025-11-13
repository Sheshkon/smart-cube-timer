import React, { useEffect, useState } from 'react';

const InfoPanel = ({ wrapperClassName = '' }) => {
  const [panels, setPanels] = useState([]);

  useEffect(() => {
    const messages = [];

    console.log('Current User Agent:', navigator.userAgent);

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isBluefy = /Bluefy/i.test(navigator.userAgent);


    const isAndroid = /Android/.test(navigator.userAgent);

    const supported =
      typeof BluetoothDevice !== 'undefined' && 'watchAdvertisements' in BluetoothDevice.prototype;

    // --- iOS block ---
    if (isIOS && !isBluefy) {
      messages.push({
        type: 'warning',
        content: (
          <div>
            <h2 className='font-semibold mb-2'>Bluetooth LE on iOS</h2>
            <p>
              Safari and Chrome on iOS do not support Web Bluetooth. To use Bluetooth LE features,
              please install the <strong>Bluefy</strong> browser:
            </p>
            <ul className='list-disc ml-5 mt-2'>
              <li>
                Download Bluefy from the{' '}
                <a
                  href='https://apps.apple.com/app/bluefy-web-ble-browser/id1492822055'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 underline'
                >
                  App Store
                </a>
              </li>
              <li>
                Use this Shortcut to open Smart Cube Timer directly in Bluefy:{' '}
                <a
                  href='https://www.icloud.com/shortcuts/2ad84ffba9f6425ebc9eeaca453b04a3'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 underline'
                >
                  Add Shortcut
                </a>
              </li>
              <li>The Shortcut will launch Bluefy with the app</li>
              <li>
                After adding the Shortcut, you can place it on your Home Screen for quick access.
              </li>
            </ul>
            <p className='mt-4'>
              On <strong>Windows / macOS / Linux desktop</strong>, simply use Chrome with Web
              Bluetooth enabled — no extra apps required.
            </p>
          </div>
        ),
      });
    }

    // --- Unsupported browsers / flags ---
    if (!supported) {
      messages.push({
        type: 'warning',
        content: (
          <div>
            <h2 className='font-semibold mb-2'>Enable Web Bluetooth Advertisements</h2>
            <p>
              Your browser does not support <code>watchAdvertisements()</code>. To enable it:
            </p>
            <ol className='list-decimal ml-5 mt-2'>
              <li>Open Chrome</li>
              <li>
                Visit <code>chrome://flags/#enable-experimental-web-platform-features</code>
              </li>
              <li>Enable the flag</li>
              <li>Restart your browser</li>
            </ol>
            <p className='mt-2'>Or manually enter your Cube’s MAC address.</p>
            <p>
              List of devices: <code>chrome://bluetooth-internals/#devices</code>
            </p>
          </div>
        ),
      });
    }

    // --- Android block ---
    if (isAndroid) {
      messages.push({
        type: 'success',
        content: (
          <div>
            <h2 className='font-semibold mb-2'>Bluetooth LE on Android</h2>
            <p>
              ✅ Android supports Web Bluetooth in Chrome and Edge. Just open this site in your
              mobile browser and connect your cube.
            </p>
            <p className='mt-2'>
              Web Bluetooth may also be available in other browsers, but for best compatibility and
              stability we recommend using <strong>Chrome</strong> or <strong>Edge</strong>.
            </p>
            <p className='mt-2'>You can install the app in several ways:</p>
            <ul className='list-disc ml-5 mt-2'>
              <li>
                Install APK via{' '}
                <a
                  href='https://www.rustore.ru/instruction?appName=Smart+Timer&utm_campaign=io.github.sheshkon.twa&sign=dozYhwxCBmXfEJNXsdkKqrOvk-lB86ZKfR63Tbg-Loo'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 underline'
                >
                  Smart Timer in RuStore
                </a>
              </li>
              <li>
                Download APK directly from{' '}
                <a
                  href='https://github.com/Sheshkon/smart-cube-timer/releases/tag/v1.0.0'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 underline'
                >
                  GitHub Releases
                </a>
              </li>
              <li>
                Or install this app as{' '}
                <a
                  href='https://en.wikipedia.org/wiki/Progressive_web_app'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 underline'
                >PWA</a> directly from
                Chrome/Edge (Add to Home screen).
              </li>
            </ul>
          </div>
        ),
      });
    }

    if (messages.length > 0) {
      setPanels(messages);
    }
  }, []);

  if (panels.length === 0) return null;

  const handleClose = (idx) => {
    setPanels((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className={wrapperClassName}>
      {panels.map((panel, idx) => {
        const panelStyle =
          panel.type === 'success'
            ? 'bg-green-100 text-green-900 border-green-300'
            : 'bg-yellow-100 text-yellow-900 border-yellow-300';
        return (
          <div
            key={idx}
            className={`${panelStyle} w-full min-h-[200px] p-3 rounded border relative mb-3`}
          >
            <button
              onClick={() => handleClose(idx)}
              aria-label='Close panel'
              className='absolute top-2 right-2 font-bold text-lg hover:opacity-70'
            >
              ×
            </button>
            {panel.content}
          </div>
        );
      })}
    </div>
  );
};

export default InfoPanel;
