import React from 'react';

export default function iosNotSupportedNotification() {
  return (
    <div>
      <h2 className='font-semibold mb-2 selectable-text'>Bluetooth LE on iOS</h2>
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
  );
}
