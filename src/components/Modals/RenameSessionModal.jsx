import { useEffect, useState } from 'react';

import { sessionService } from 'src/db/sessionService.js';
import useModalKeyboard from 'src/hooks/useModalKeyboard.js';

const RenameSessionModal = ({ isOpen, onClose, setSessions, currentSession, sessions }) => {
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState(null);

  const closeModal = () => {
    onClose();
  };

  const addError = (error) => {
    console.log(error);
    setError(error);
    setTimeout(() => {
      setError(null);
    }, 2000);
  };

  useEffect(() => {
    setSessionName(currentSession?.name);
  }, [currentSession]);

  const handleRenameSession = () => {
    if (sessions.filter((s) => s.name === sessionName).length > 0) {
      addError('name already exists');
      return;
    }
    try {
      sessionService.renameSession(currentSession?.id, sessionName);
      setSessions(prev => prev.map(session =>
        session.id == currentSession?.id
          ? { ...session, name: sessionName }
          : session
      ));
      closeModal();
    } catch (e) {
      addError(e?.message);
    }
  };

  useModalKeyboard({
    isOpen,
    onConfirm: handleRenameSession,
    onCancel: closeModal,
  });

  return (
    <div>
      {isOpen && (
        <dialog open className='modal'>
          <div className='modal-box'>
            <h3 className='mb-2 font-bold text-lg'>Rename Session</h3>
            <input
              type='text'
              placeholder='Session name'
              className='input'
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              autoFocus
            />
            {error && (<p className='text-red-700'>{error}</p>)}
            <div className='modal-action'>
              <button
                type='button'
                className='p-2 rounded bg-green-700 dark:bg-green-700 text-gray-100 dark:text-gray-300  transition-colors'
                onClick={() => handleRenameSession()}
                title='Enter'
              >
                Rename
              </button>

              <button
                type='button'
                className='p-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors'
                onClick={closeModal}
                title='Esc'
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default RenameSessionModal;
