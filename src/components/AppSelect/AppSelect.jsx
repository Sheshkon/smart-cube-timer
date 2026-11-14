import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import clsx from 'clsx';
import { Check, ChevronDown } from 'lucide-react';

const MENU_GAP = 6;
const MENU_MIN_WIDTH = 168;
const VIEW_PAD = 8;

const sameValue = (a, b) => String(a) === String(b);

const AppSelect = ({
  id,
  value,
  onChange,
  options = [],
  disabled = false,
  className = '',
  triggerClassName = '',
  align = 'start',
  fullWidth = false,
  size = 'md',
  'aria-label': ariaLabel,
}) => {
  const generatedId = useId();
  const listboxId = id || generatedId;
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [portalRoot, setPortalRoot] = useState(() =>
    typeof document === 'undefined' ? null : document.body
  );
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = useMemo(
    () => options.findIndex((option) => sameValue(option.value, value)),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(
      Math.max(fullWidth ? rect.width : Math.max(rect.width, MENU_MIN_WIDTH), MENU_MIN_WIDTH),
      window.innerWidth - VIEW_PAD * 2
    );
    let left = align === 'end' ? rect.right - width : rect.left;
    left = Math.max(VIEW_PAD, Math.min(left, window.innerWidth - width - VIEW_PAD));

    const spaceBelow = window.innerHeight - rect.bottom - VIEW_PAD;
    const spaceAbove = rect.top - VIEW_PAD;
    const estimatedHeight = Math.min(
      280,
      Math.max(48, options.length * (size === 'sm' ? 26 : 30) + 10)
    );
    const openUp = spaceBelow < estimatedHeight + MENU_GAP && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(280, openUp ? spaceAbove - MENU_GAP : spaceBelow - MENU_GAP));

    setCoords({
      top: openUp ? 'auto' : rect.bottom + MENU_GAP,
      bottom: openUp ? window.innerHeight - rect.top + MENU_GAP : 'auto',
      left,
      width,
      maxHeight,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, options.length, align, fullWidth, size]);

  useLayoutEffect(() => {
    if (!open || !coords) return undefined;
    const menu = menuRef.current;
    if (!menu) return undefined;
    if (typeof menu.showPopover === 'function') {
      try {
        menu.showPopover();
      } catch {
        /* already open */
      }
    }
    menu.focus();
    return () => {
      if (typeof menu.hidePopover === 'function') {
        try {
          menu.hidePopover();
        } catch {
          /* already closed */
        }
      }
    };
  }, [open, coords]);

  useEffect(() => {
    if (!open) return undefined;

    setPortalRoot(triggerRef.current?.closest('dialog') || document.body);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

    const handlePointer = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleReposition = () => updatePosition();
    const handleKey = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointer, true);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('keydown', handleKey, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointer, true);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('keydown', handleKey, true);
    };
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const item = menuRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const selectValue = (next) => {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveActive = (delta) => {
    if (!options.length) return;
    setActiveIndex((current) => {
      const start = current < 0 ? (delta > 0 ? -1 : 0) : current;
      return (start + delta + options.length) % options.length;
    });
  };

  const onTriggerKeyDown = (event) => {
    if (disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
      return;
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  };

  const onMenuKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) selectValue(option.value);
    }
  };

  return (
    <div
      className={clsx(
        'app-select',
        size === 'sm' && 'app-select-sm',
        fullWidth && 'w-full',
        className
      )}
    >
      <button
        ref={triggerRef}
        id={id}
        type='button'
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className={clsx('app-select-trigger', fullWidth && 'w-full', triggerClassName)}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className='app-select-value'>{selected?.label ?? 'Select'}</span>
        <ChevronDown
          size={size === 'sm' ? 12 : 14}
          aria-hidden
          className={clsx('app-select-chevron', open && 'app-select-chevron-open')}
        />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role='listbox'
            tabIndex={-1}
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            popover='manual'
            className={clsx('app-select-menu', size === 'sm' && 'app-select-sm')}
            style={{
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              width: coords.width,
              maxHeight: coords.maxHeight,
            }}
            onKeyDown={onMenuKeyDown}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {options.map((option, index) => {
              const isSelected = sameValue(option.value, value);
              return (
                <button
                  key={`${option.value}-${index}`}
                  type='button'
                  role='option'
                  id={`${listboxId}-option-${index}`}
                  data-index={index}
                  aria-selected={isSelected}
                  className={clsx(
                    'app-select-option',
                    isSelected && 'is-selected',
                    index === activeIndex && 'is-active'
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectValue(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={size === 'sm' ? 12 : 14} aria-hidden />}
                </button>
              );
            })}
          </div>,
          portalRoot || document.body
        )}
    </div>
  );
};

export default AppSelect;
