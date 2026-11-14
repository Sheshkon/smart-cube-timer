import { useState } from 'react';

import useModalKeyboard from 'src/hooks/useModalKeyboard.js';

const AddModal = ({ isOpen, onClose, onAddSession }) => {

  const [sessionName, setSessionName] = useState('');

  const closeModal = () => {
    setSessionName('');
    onClose();
  };

  const handleAddSession = () => {
    onAddSession(sessionName);
    closeModal();
  };

  useModalKeyboard({
    isOpen,
    onConfirm: handleAddSession,
    onCancel: closeModal,
  });

  return (
    <div>
      {isOpen && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="mb-2 font-bold text-lg">Add New Session</h3>
            <input
              type="text" placeholder="Session name"
              className="input"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              autoFocus
            />
            <div className="modal-action">

              <button
                type="button"
                className="p-2 rounded bg-green-700 dark:bg-green-700 text-gray-100 dark:text-gray-300  transition-colors"
                onClick={handleAddSession}
                title="Enter"
              >
                Add
              </button>

              <button
                type="button"
                className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                onClick={closeModal}
                title="Esc"
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

export default AddModal;
