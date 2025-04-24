import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon, Cuboid as Cube } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={`bg-white dark:bg-gray-800 shadow-sm px-4 py-3 ${className}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Cube className="text-blue-500 dark:text-blue-400 mr-2" size={24} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">CubeTimer</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  className: PropTypes.string
};

export default Header;