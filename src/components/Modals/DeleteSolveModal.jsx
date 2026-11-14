import { Trash2, X } from 'lucide-react';
import useModalKeyboard from 'src/hooks/useModalKeyboard.js';

const DeleteSolveModal = ({ isOpen, onClose, onDeleteSolve }) => {
  const closeModal = () => {
    onClose();
  };

  const handleDeleteSolve = () => {
    onDeleteSolve();
    closeModal();
  };

  useModalKeyboard({
    isOpen,
    onConfirm: handleDeleteSolve,
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
            Delete solve
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
            This will permanently delete this solve from the session.
          </p>
          <div className='flex justify-end gap-2'>
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
              onClick={handleDeleteSolve}
              title='Enter'
            >
              Delete
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

export default DeleteSolveModal;
