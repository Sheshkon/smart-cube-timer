import { Trash2, X } from 'lucide-react';
import { DEFAULT_SESSION_ID } from 'src/db/configDB.js';
import useModalKeyboard from 'src/hooks/useModalKeyboard.js';
import { useSettings } from 'src/hooks/useSettings.js';

const DeleteSessionModal = ({ isOpen, onClose, onDeleteSolves, onDeleteSession }) => {
  const { settings, updateSetting } = useSettings();

  const closeModal = () => {
    onClose();
  };

  const handleDeleteSolves = () => {
    onDeleteSolves();
    closeModal();
  };

  const handleDeleteSession = () => {
    onDeleteSession();
    updateSetting('selectedSessionId', DEFAULT_SESSION_ID);
    closeModal();
  };

  const canDeleteSession = parseInt(settings.selectedSessionId) !== DEFAULT_SESSION_ID;

  useModalKeyboard({
    isOpen,
    onConfirm: handleDeleteSolves,
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
            <Trash2 size={20} />
            Delete session
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
          <p className='text-sm opacity-70 mb-4'>
            {canDeleteSession
              ? 'Clear all solves in this session, or delete the session itself.'
              : 'This will permanently delete all solves in the current session.'}
          </p>

          <div className='flex flex-wrap justify-end gap-2'>
            <button
              type='button'
              className='app-btn rounded-full px-3 py-1.5 text-sm transition-colors'
              onClick={closeModal}
              title='Esc'
            >
              Cancel
            </button>
            {canDeleteSession && (
              <button
                type='button'
                className='app-btn rounded-full px-3 py-1.5 text-sm transition-colors'
                onClick={handleDeleteSession}
              >
                Delete session
              </button>
            )}
            <button
              type='button'
              className='app-btn-accent rounded-full px-3 py-1.5 text-sm transition-colors'
              onClick={handleDeleteSolves}
              title='Enter'
            >
              Delete solves
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

export default DeleteSessionModal;
