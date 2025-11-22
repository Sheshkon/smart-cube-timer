import React from 'react';

import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ContactSupportIcon from '@mui/icons-material/ContactSupportOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import { BluetoothSearching } from 'lucide-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SettingsControl from 'src/components/SettingsControl.jsx';
import { useConsole } from 'src/contexts/ConsoleContext.jsx';

const projectBaseUrl = import.meta.env.BASE_URL;

const Header = ({ className = '' }) => {
  const { showConsole, setShowConsole } = useConsole();

  return (
    <>
      <header className={`bg-white dark:bg-gray-800 shadow-sm ${className}`}>
        <div className='container mx-auto flex justify-between items-center'>
          <div className='sticky top-0 z-10 w-full p-4 flex justify-between items-center shadow-sm'>
            <div className='w-full max-w-[1800px] mx-auto px-4 flex justify-between items-center'>
              <h2 className='text-3xl font-bold inline-flex items-center'>
                Sm
                <span className='blink text-3xl text-blue-800 rotated mt-2 dark:text-blue-500'>
                  <BluetoothSearching />
                </span>
                rt<span className='bli1nk text-blu1e-800 dark:tex1t-blue-500'>³</span>
              </h2>
            </div>
          </div>

          <div className='flex gap-2 mr-4'>
            <Link
              to={`${projectBaseUrl}library/`}
              className='rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors'
            >
              <AutoStoriesOutlinedIcon />
            </Link>

            <a
              className='rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors'
              href='https://github.com/Sheshkon/smart-cube-timer/blob/main/README.md'
              target='https://github.com/Sheshkon/smart-cube-timer/blob/main/README.md'
              rel='noopener noreferrer'
            >
              <ContactSupportIcon size={38} />
            </a>
            <SettingsControl className=' rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors' />

            <button
              className='rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors'
              onClick={() => setShowConsole(!showConsole)}
            >
              <TerminalIcon />
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
