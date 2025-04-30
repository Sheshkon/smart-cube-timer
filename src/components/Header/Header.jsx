import { Moon, Sun } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';
import { useSettings } from 'src/hooks/useSettings';

const Header = ({ className = '' }) => {
  const { settings, updateSetting } = useSettings();

  return (
    <>
      <header
        className={`bg-white dark:bg-gray-800 shadow-sm px-4 py-3 ${className}`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              SmartTimer
            </h1>
          </div>
          <div className="flex items-center space-x-4">
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
                <Sun size={20} />
              ) : (
                <Moon size={20} />
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
