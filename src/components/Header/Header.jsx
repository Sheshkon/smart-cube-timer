import React from 'react';

import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ContactSupportIcon from '@mui/icons-material/ContactSupportOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import { BluetoothSearching } from 'lucide-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { UserProfile } from 'src/components/UserProfile/UserProfile.jsx';
import { useConsole } from 'src/contexts/ConsoleContext.jsx';
import { useGoogleAuth } from 'src/contexts/GoogleAuthContext.jsx';
import { useSettings } from 'src/hooks/useSettings';

const projectBaseUrl = import.meta.env.BASE_URL;

const Header = ({ className = '' }) => {
  const { settings, updateSetting } = useSettings();
  const { showConsole, setShowConsole } = useConsole();
  const { user } = useGoogleAuth();

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

          <UserProfile user={user} />

          <Link to={`${projectBaseUrl}library/`}
                className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors'
          >
            <AutoStoriesOutlinedIcon/>
          </Link>

          <a
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors'
            href='https://github.com/Sheshkon/smart-cube-timer/blob/main/README.md'
            target='https://github.com/Sheshkon/smart-cube-timer/blob/main/README.md'
            rel='noopener noreferrer'
          >
            <ContactSupportIcon size={38} />
          </a>
          <div className='flex items-center space-x-2 pr-4'>
            <button
              onClick={() => updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light')}
              className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors'
              title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {settings.theme === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </button>
            <button
              className='rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors'
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
