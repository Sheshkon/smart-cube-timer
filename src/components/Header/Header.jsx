import React, { useState } from 'react';

import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ContactSupportIcon from '@mui/icons-material/ContactSupportOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import { BluetoothSearching, History, Settings } from 'lucide-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CubeHistoryModal from 'src/components/Modals/CubeHistoryModal.jsx';
import { useConsole } from 'src/contexts/ConsoleContext.jsx';

const projectBaseUrl = import.meta.env.BASE_URL;
const iconButtonClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0 leading-none hover:opacity-80 transition-colors';
const muiIconSx = { fontSize: 24, display: 'block' };

const Header = ({ className = '' }) => {
  const { showConsole, setShowConsole } = useConsole();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      <header className={`app-chrome rounded-b-2xl overflow-hidden shadow-sm ${className}`}>
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

          <div className='flex items-center gap-0 mr-4'>
            <button
              type='button'
              className={iconButtonClass}
              onClick={() => setHistoryOpen(true)}
              title='Cube history'
            >
              <History size={24} />
            </button>

            <Link to={`${projectBaseUrl}library/`} className={iconButtonClass} title='Library'>
              <AutoStoriesOutlinedIcon sx={muiIconSx} />
            </Link>

            <a
              className={iconButtonClass}
              href='https://github.com/Sheshkon/smart-cube-timer/blob/main/README.md'
              target='_blank'
              rel='noopener noreferrer'
              title='Help'
            >
              <ContactSupportIcon sx={muiIconSx} />
            </a>
            <Link
              to={`${projectBaseUrl}settings/`}
              className={iconButtonClass}
              title='Settings'
            >
              <Settings size={24} />
            </Link>

            <button
              type='button'
              className={iconButtonClass}
              onClick={() => setShowConsole(!showConsole)}
              title='Console'
            >
              <TerminalIcon sx={muiIconSx} />
            </button>
          </div>
        </div>
      </header>
      <CubeHistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
