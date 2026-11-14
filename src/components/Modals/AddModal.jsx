import { useEffect, useState } from 'react';

import { Plus, X } from 'lucide-react';
import useModalKeyboard from 'src/hooks/useModalKeyboard.js';

const AddModal = ({ isOpen, onClose, onAddSession }) => {
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState(null);

  const closeModal = () => {
    setSessionName('');
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setSessionName('');
    setError(null);
  }, [isOpen]);

  const handleAddSession = () => {
    const name = sessionName.trim();
    if (!name) {
      setError('Enter a session name');
      setTimeout(() => setError(null), 2000);
      return;
    }
    onAddSession(name);
    closeModal();
  };

  useModalKeyboard({
    isOpen,
    onConfirm: handleAddSession,
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
            <Plus size={20} />
            Add session
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
            Create a new session to keep solves separate.
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
              onClick={handleAddSession}
              title='Enter'
            >
              Add
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

export default AddModal;
