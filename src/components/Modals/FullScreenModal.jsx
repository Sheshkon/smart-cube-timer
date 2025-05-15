import { useEffect, useRef } from 'react';

const FullScreenModal = ({ children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  return (
    <dialog
      ref={modalRef}
      open
      className="fixed inset-0 z-50 bg-base-100 w-screen max-w-none overflow-hidden outline-none"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className=" bg-base-100 w-full flex justify-between items-center shadow-sm">
      <div className="w-full h-[calc(100vh)] overflow-y-auto">
        <div className="w-full max-w-[1800px] mx-auto">
          {children}
        </div>
      </div>
      </div>
    </dialog>

  );
};

export default FullScreenModal;