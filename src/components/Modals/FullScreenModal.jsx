import React, { useEffect, useRef } from 'react';

import { X } from 'lucide-react';

const FullScreenModal = ({ children, onClose }) => {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (modalRef.current) {
      modalRef.current.focus();
    }

    const modalState = { isModalOpen: true };
    window.history.pushState(modalState, '', '');

    const handlePopState = (event) => {
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        window.history.back();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);

      if (window.history.state?.isModalOpen) {
        window.history.back();
      }
    };
  }, []);

  const handleCloseButtonClick = () => {
    window.history.back();
  };

  return (
    <dialog
      ref={modalRef}
      open
      className="fixed inset-0 z-50 bg-base-100 w-screen h-dvh max-w-none m-0 p-0 overflow-hidden outline-none"
      aria-modal="true"
    >
      <div className="absolute top-4 right-6 z-50">
        <button
          onClick={handleCloseButtonClick}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
          title="Close"
        >
          <X size={24} />
        </button>
      </div>

      <div className="w-full h-full overflow-y-auto bg-base-100">
        <div className="w-full max-w-[1800px] mx-auto min-h-full">
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default FullScreenModal;