import { useEffect, useState } from 'react';

import { Pencil, X } from 'lucide-react';
import { sessionService } from 'src/db/sessionService.js';
import useModalKeyboard from 'src/hooks/useModalKeyboard.js';

const RenameSessionModal = ({ isOpen, onClose, setSessions, currentSession, sessions }) => {
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState(null);

  const closeModal = () => {
    setError(null);
    onClose();
  };

  const addError = (message) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 2000);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setError(null);
    setSessionName(currentSession?.name || '');
  }, [isOpen, currentSession]);

  const handleRenameSession = () => {
    const name = sessionName.trim();
    if (!name) {
      addError('Enter a session name');
      return;
    }
    if (sessions.some((s) => s.name === name && s.id !== currentSession?.id)) {
      addError('Name already exists');
      return;
    }
    try {
      sessionService.renameSession(currentSession?.id, name);
      setSessions((prev) => prev.map((session) =>
        session.id == currentSession?.id
          ? { ...session, name }
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

  if (!isOpen) {
    return null;
  }

  return (
    <dialog open className='modal'>
      <div className='modal-box app-card rounded-2xl p-0 max-w-md overflow-hidden'>
        <div className='flex items-center justify-between gap-3 px-5 pt-5 pb-3'>
          <h3 className='text-xl font-bold inline-flex items-center gap-2'>
            <Pencil size={20} />
            Rename session
          </h3>
          <button
            type='button'
            onClick={closeModal}
            className='app-btn p-2 rounded-full transition-colors'
            title='Esc'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>

        <div className='px-5 pb-5'>
          <p className='text-sm opacity-70 mb-3'>
            Choose a new name for this session.
          </p>
          <input
            type='text'
            placeholder='Session name'
            className='app-input'
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            autoFocus
          />
          {error && (
            <p className='text-sm mt-2' style={{ color: 'var(--app-accent)' }}>{error}</p>
          )}

          <div className='flex justify-end gap-2 mt-4'>
            <button
              type='button'
              className='app-btn rounded-full px-3 py-1.5 text-sm transition-colors'
              onClick={closeModal}
              title='Esc'
            >
              Cancel
            </button>
            <button
              type='button'
              className='app-btn-accent rounded-full px-3 py-1.5 text-sm transition-colors'
              onClick={handleRenameSession}
              title='Enter'
            >
              Rename
            </button>
          </div>
        </div>
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button type='button' onClick={closeModal}>Close</button>
      </form>
    </dialog>
  );
};

export default RenameSessionModal;
