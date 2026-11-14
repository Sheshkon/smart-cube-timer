import { useEffect, useRef } from 'react';

const isEditableTarget = (target) => {
  if (!target || typeof target.closest !== 'function') {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }

  if (tag === 'INPUT') {
    const type = (target.type || 'text').toLowerCase();
    return !['button', 'submit', 'checkbox', 'radio', 'range', 'file', 'color'].includes(type);
  }

  return false;
};

const isNativeButtonActivation = (target) => {
  if (!target || typeof target.closest !== 'function') {
    return false;
  }

  return Boolean(target.closest('button, a, [role="button"]'));
};

/**
 * Global Enter / Escape handling for daisyUI dialogs that use the `open` attribute
 * (non-modal, so the browser does not close them on Escape by itself).
 */
const useModalKeyboard = ({
  isOpen,
  onConfirm,
  onCancel,
  confirmOnEnter = true,
} = {}) => {
  const onConfirmRef = useRef(onConfirm);
  const onCancelRef = useRef(onCancel);
  onConfirmRef.current = onConfirm;
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!onCancelRef.current) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        onCancelRef.current();
        return;
      }

      if (event.key !== 'Enter' || !confirmOnEnter || !onConfirmRef.current) {
        return;
      }

      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (isNativeButtonActivation(event.target)) {
        return;
      }

      if (isEditableTarget(event.target) && event.target.tagName === 'TEXTAREA') {
        return;
      }

      event.preventDefault();
      onConfirmRef.current();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, confirmOnEnter]);
};

export default useModalKeyboard;
