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

  const isDefaultSession = ()  => parseInt(settings.selectedSessionId) !== DEFAULT_SESSION_ID;

  useModalKeyboard({
    isOpen,
    onConfirm: handleDeleteSolves,
    onCancel: closeModal,
  });

  return (
    <div>
      {isOpen && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete All Solves</h3>
            <p className="py-4">Are you sure you want to delete session?</p>
            <div className="modal-action">

              {
                isDefaultSession() &&
                <button
                  type="button"
                  className="p-2 rounded bg-red-700 dark:bg-red-700 text-gray-100 dark:text-gray-300  transition-colors"
                  onClick={() => handleDeleteSession()}
                >
                  Delete Session
                </button>}

              <button
                type="button"
                className={`p-2 rounded ${isDefaultSession() ? 'bg-orange-700' : 'bg-red-700'} text-gray-100 dark:text-gray-300  transition-colors`}
                onClick={() => handleDeleteSolves(onDeleteSolves)}
                title="Enter"
              >
                Delete Solves
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

export default DeleteSessionModal;
