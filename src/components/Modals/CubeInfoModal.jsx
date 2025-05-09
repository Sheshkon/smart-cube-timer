import React from 'react';

export const CubeInfoModal = ({ info, isOpen, onClose }) => {
  const getValue = (value, fallback = '- n/a -') => value ?? fallback;

  return (
    <>
      {isOpen && (
        <dialog open className="modal">
          <div className="modal-box">
            <div className="flex justify-between">
              <b>
                <label htmlFor="batteryLevel">Battery</label>
              </b>
              <input
                id="batteryLevel"
                type="text"
                readOnly
                value={getValue(info?.batteryLevel, '0%') + '%'}
                className="bg-gray-100 dark:bg-gray-800 p-1 rounded"
              />
            </div>
            <div className="flex justify-between">
              <b>
                <label htmlFor="deviceMAC">Device MAC</label>
              </b>
              <input
                id="deviceMAC"
                type="text"
                readOnly
                value={getValue(info?.deviceMAC)}
                className="bg-gray-200 dark:bg-gray-900 p-1 rounded"
              />
            </div>
            <div className="flex justify-between">
              <b>
                <label htmlFor="deviceName">Device Name</label>
              </b>
              <input
                id="deviceName"
                type="text"
                readOnly
                value={getValue(info?.deviceName)}
                className="bg-gray-100 dark:bg-gray-800 p-1 rounded"
              />
            </div>
            <div className="flex justify-between">
              <b>
                <label htmlFor="gyroSupported">Gyro Supported</label>
              </b>
              <input
                id="gyroSupported"
                type="text"
                readOnly
                value={getValue(info?.gyroSupported, 'NO')}
                className="bg-gray-200 dark:bg-gray-900 p-1 rounded"
              />
            </div>
            <div className="flex justify-between">
              <b>
                <label htmlFor="hardwareName">Hardware Name</label>
              </b>
              <input
                id="hardwareName"
                type="text"
                readOnly
                value={getValue(info?.hardwareName)}
                className="bg-gray-100 dark:bg-gray-800 p-1 rounded"
              />
            </div>
            <div className="flex justify-between">
              <b>
                <label htmlFor="softwareVersion">Software Version</label>
              </b>
              <input
                id="softwareVersion"
                type="text"
                readOnly
                value={getValue(info?.softwareVersion)}
                className="bg-gray-200 dark:bg-gray-900 p-1 rounded"
              />
            </div>
            <div className="flex justify-between">
              <b>
                <label htmlFor="hardwareVersion">Hardware Version</label>
              </b>
              <input
                id="hardwareVersion"
                type="text"
                readOnly
                value={getValue(info?.hardwareVersion)}
                className="bg-gray-100 dark:bg-gray-800 p-1 rounded"
              />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={onClose}>Close</button>
          </form>
        </dialog>
      )}
    </>
  );
};
