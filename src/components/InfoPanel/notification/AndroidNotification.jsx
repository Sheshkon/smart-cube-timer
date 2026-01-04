import React from 'react';

export default function AndroidNotification() {
  return (
    <div className='selectable-text'>
      <h2 className='font-semibold mb-2'>Bluetooth LE on Android</h2>
      <p>
        Android supports Web Bluetooth in <strong>Chrome</strong> and <strong>Edge</strong>. Just open this site in your
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
            href='https://www.rustore.ru/catalog/app/io.github.sheshkon.twa'
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
          >
            PWA
          </a>{' '}
          directly from Chrome/Edge (Add to Home screen).
        </li>
      </ul>
    </div>
  );
}
