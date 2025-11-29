import React, { useEffect, useRef } from 'react';

import { X } from 'lucide-react';

const FullScreenModal = ({ children, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (modalRef.current) {
      modalRef.current.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <dialog
      ref={modalRef}
      open
      className="fixed inset-0 z-50 bg-base-100 w-screen h-dvh max-w-none m-0 p-0 overflow-hidden outline-none"
      aria-modal="true"
    >
      <div className="absolute top-4 right-6 z-50">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
          title="Close (Esc)"
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