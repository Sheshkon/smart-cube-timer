import React from 'react';

import { Moon, Sun } from 'lucide-react';
import PropTypes from 'prop-types';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import { GoogleAuth } from 'src/components/GoogleAuth.jsx';
import { useSettings } from 'src/hooks/useSettings';

const Header = ({ className = '' }) => {
  const { settings, updateSetting } = useSettings();

  return (
    <>
      <header
        className={`bg-white dark:bg-gray-800 shadow-sm ${className}`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="sticky top-0 z-10 w-full p-4 flex justify-between items-center shadow-sm">
            <div className="w-full max-w-[1800px] mx-auto px-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                SmartTimer
              </h2>
            </div>
          </div>

          <GoogleAuth className="p-2"/>
          <a
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"

            href="https://github.com/Sheshkon/smart-cube-timer/blob/main/README.md"
            target="https://github.com/Sheshkon/smart-cube-timer/blob/main/README.md"
            rel="noopener noreferrer"
            >
            <IoIosHelpCircleOutline size={38} />
          </a>
          <div className="flex items-center space-x-4 pr-4">
            <button
              onClick={() =>
                updateSetting(
                  'theme',
                  settings.theme === 'light' ? 'dark' : 'light',
                )
              }
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              title={
                settings.theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              {settings.theme === 'dark' ? (
                <Sun size={30} />
              ) : (
                <Moon size={30} />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
