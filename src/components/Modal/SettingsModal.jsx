import React from 'react';
import { useSettings } from 'src/hooks/useSettings';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSetting } = useSettings();

  return (
    <>
      {isOpen && (
        <dialog open className="modal">
          <div
            className={`modal-box ${settings.theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
          >
            <h3 className="font-bold text-lg mb-4">Settings</h3>
            <div className="flex justify-between items-center mb-3">
              <b>
                <label htmlFor="themeToggle">Dark Mode</label>
              </b>
              <input
                id="themeToggle"
                type="checkbox"
                className="toggle"
                checked={settings.theme === 'dark'}
                onChange={() =>
                  updateSetting(
                    'theme',
                    settings.theme === 'light' ? 'dark' : 'light',
                  )
                }
              />
            </div>
            <div className="flex justify-between items-center mb-3">
              <b>
                <label htmlFor="gyroToggle">Use Gyroscope</label>
              </b>
              <input
                id="gyroToggle"
                type="checkbox"
                className="toggle"
                checked={settings.useGyroscope || false}
                onChange={(e) =>
                  updateSetting('useGyroscope', e.target.checked)
                }
              />
            </div>
            <div className="flex justify-between items-center mb-3">
              <b>
                <label htmlFor="gyroToggle">Use Image Moves Notation</label>
              </b>
              <input
                id="imageNotation"
                type="checkbox"
                className="toggle"
                checked={settings.imageNotation || false}
                onChange={(e) =>
                  updateSetting('imageNotation', e.target.checked)
                }
              />
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button
                  className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                  onClick={onClose}
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};
