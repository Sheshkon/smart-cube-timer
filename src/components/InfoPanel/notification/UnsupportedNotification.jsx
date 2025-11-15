import React from 'react';

export default function UnsupportedNotification() {
  return (
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
  );
}
