import React from 'react';

import CopyButton from 'src/components/CopyButton/CopyButton.jsx';

const CHROME_FLAGS_URL = 'chrome://flags/#enable-experimental-web-platform-features';
const CHROME_BLUETOOTH_DEVICES_URL = 'chrome://bluetooth-internals/#devices';

export default function UnsupportedNotification() {
  return (
    <div>
      <h2 className='font-semibold mb-2 selectable-text'>Enable Web Bluetooth Advertisements</h2>
      <p>
        Your browser does not support <code>watchAdvertisements()</code>. To enable it:
      </p>
      <ol className='list-decimal ml-5 mt-2'>
        <li>Open Chrome</li>
        <li>
          <span className='inline-flex flex-wrap items-center gap-1'>
            Visit <code className='selectable-text'>{CHROME_FLAGS_URL}</code>
            <CopyButton text={CHROME_FLAGS_URL} ariaLabel='Copy Chrome flags URL' />
          </span>
        </li>
        <li>Enable the flag</li>
        <li>Restart your browser</li>
      </ol>
      <p className='mt-2'>Or manually enter your Cube’s MAC address.</p>
      <p>
        <span className='inline-flex flex-wrap items-center gap-1'>
          List of devices: <code className='selectable-text'>{CHROME_BLUETOOTH_DEVICES_URL}</code>
          <CopyButton text={CHROME_BLUETOOTH_DEVICES_URL} ariaLabel='Copy Bluetooth devices URL' />
        </span>
      </p>
    </div>
  );
}
