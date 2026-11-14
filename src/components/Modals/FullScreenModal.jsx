import React, { useEffect, useRef } from 'react';

import { X } from 'lucide-react';

const FullScreenModal = ({
  children,
  onClose,
  title,
  headerRight,
  useHistory = true,
}) => {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const close = () => {
    if (useHistory) {
      window.history.back();
      return;
    }

    onCloseRef.current?.();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (modalRef.current) {
      modalRef.current.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      if (useHistory) {
        window.history.back();
        return;
      }

      onCloseRef.current?.();
    };

    window.addEventListener('keydown', handleKeyDown);

    if (!useHistory) {
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    const modalState = { isModalOpen: true };
    window.history.pushState(modalState, '', '');

    const handlePopState = () => {
      onCloseRef.current?.();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);

      if (window.history.state?.isModalOpen) {
        window.history.back();
      }
    };
  }, [useHistory]);

  return (
    <dialog
      ref={modalRef}
      open
      className="fixed inset-0 z-50 app-page w-screen h-dvh max-w-none m-0 p-0 border-0 overflow-hidden outline-none"
      aria-modal="true"
    >
      <div className="relative z-0 w-full h-full overflow-y-auto overscroll-y-contain app-page">
        <div className="sticky top-0 z-50 w-full app-page">
          <div className="w-full max-w-[1800px] mx-auto px-5 pt-6 pb-4 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold min-w-0 inline-flex items-center gap-2">
              {title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                type="button"
                onClick={close}
                className="app-btn p-2 rounded-full transition-colors shadow-sm"
                title="Esc"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[1800px] mx-auto min-h-full px-5 pb-8">
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default FullScreenModal;
