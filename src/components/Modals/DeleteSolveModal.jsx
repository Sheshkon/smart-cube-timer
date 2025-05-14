const DeleteSolveModal = ({ isOpen, onClose, onDeleteSolve }) => {

  const closeModal = () => {
    onClose();
  };

  const handleDeleteSolve = () => {
    onDeleteSolve();
    closeModal();
  };

  return (
    <div>
      {isOpen && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Solve</h3>
            <p className="py-4">Are you sure you want to delete solve?</p>
            <div className="modal-action">
              <button
                className="p-2 rounded bg-red-700 dark:bg-red-700 text-gray-100 dark:text-gray-300  transition-colors"
                onClick={handleDeleteSolve}
              >
                Delete Solve
              </button>
              <button
                className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                onClick={closeModal}
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

export default DeleteSolveModal;
