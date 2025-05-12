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
            <div className="flex justify-between items-center mb-3">
              <b>
                <label htmlFor="inspection">Use inspection</label>
              </b>
              <input
                id="inspection"
                type="checkbox"
                className="toggle"
                checked={settings.inspection || false}
                onChange={(e) =>
                  updateSetting('inspection', e.target.checked)
                }
              />
            </div>
            <div className="flex justify-between items-center mb-3">
              <b>
                <label htmlFor="solutionChart">Solve analyse chart</label>
              </b>
              <input
                id="solutionChart"
                type="checkbox"
                className="toggle"
                checked={settings.solutionChart || false}
                onChange={(e) =>
                  updateSetting('solutionChart', e.target.checked)
                }
              />
            </div>
            <div className="flex justify-between items-center mb-3">
              <b>
                <label htmlFor="scrambleSize">Scramble Size</label>
              </b>
              <select
                value={settings?.scrambleSize || 'text-sm'}
                className="select select-xs w-32"
                onChange={(e) => updateSetting('scrambleSize', e.target.value)}
              >
                <option value="text-xs">Small</option>
                <option value="text-sm">Default</option>
                <option value="text-lg">Large</option>
                <option value="text-xl">X-Large</option>
                <option value="text-2xl">2XL</option>
                <option value="text-3xl">3XL</option>
                <option value="text-4xl">4XL</option>
                <option value="text-5xl">5XL</option>

              </select>
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
