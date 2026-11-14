import React from 'react';

import { Info, X } from 'lucide-react';
import useModalKeyboard from 'src/hooks/useModalKeyboard.js';

const formatBattery = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = Number(String(value).replace('%', ''));
  if (Number.isNaN(numeric)) {
    return { label: String(value), percent: null };
  }

  return {
    label: `${Math.round(numeric)}%`,
    percent: Math.min(100, Math.max(0, numeric)),
  };
};

const InfoRow = ({ label, children, selectable = false }) => (
  <div className='flex items-baseline justify-between gap-4 py-2.5 border-b border-[color:var(--app-card-line)] last:border-b-0'>
    <dt className='text-sm opacity-70 shrink-0'>{label}</dt>
    <dd className={`text-sm font-medium text-right min-w-0 break-all ${selectable ? 'selectable-text' : ''}`}>
      {children || '—'}
    </dd>
  </div>
);

export const CubeInfoModal = ({ info, isOpen, onClose }) => {
  useModalKeyboard({
    isOpen,
    onCancel: onClose,
    confirmOnEnter: false,
  });

  if (!isOpen) {
    return null;
  }

  const name = info?.deviceName || info?.hardwareName || 'Smart cube';
  const battery = formatBattery(info?.batteryLevel);
  const gyroYes = String(info?.gyroSupported || '').toUpperCase() === 'YES';

  return (
    <dialog open className='modal'>
      <div className='modal-box app-card rounded-2xl p-0 max-w-md overflow-hidden'>
        <div className='flex items-center justify-between gap-3 px-5 pt-5 pb-3'>
          <h3 className='text-xl font-bold inline-flex items-center gap-2'>
            <Info size={20} />
            Cube info
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='app-btn p-2 rounded-full transition-colors'
            title='Esc'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>

        <div className='px-5 pb-5'>
          <div className='mb-4'>
            <div className='font-bold text-lg leading-tight'>{name}</div>
            <div className='text-sm opacity-70 selectable-text mt-1'>
              {info?.deviceMAC || 'MAC unavailable'}
            </div>
          </div>

          <div className='app-inset rounded-lg p-3 mb-3'>
            <div className='flex items-center justify-between gap-3 mb-2'>
              <span className='text-sm opacity-70'>Battery</span>
              <span className='text-sm font-semibold'>{battery?.label || '—'}</span>
            </div>
            <div className='h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10'>
              <div
                className='h-full rounded-full'
                style={{
                  width: `${battery?.percent ?? 0}%`,
                  backgroundColor: 'var(--app-accent)',
                }}
              />
            </div>
          </div>

          <dl className='app-inset rounded-lg px-3'>
            <InfoRow label='Hardware'>{info?.hardwareName}</InfoRow>
            <InfoRow label='Gyro'>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                  gyroYes ? 'app-btn-accent' : 'app-btn'
                }`}
              >
                {gyroYes ? 'Supported' : (info?.gyroSupported || 'No')}
              </span>
            </InfoRow>
            <InfoRow label='Software'>{info?.softwareVersion}</InfoRow>
            <InfoRow label='Hardware ver.'>{info?.hardwareVersion}</InfoRow>
            <InfoRow label='MAC' selectable>{info?.deviceMAC}</InfoRow>
          </dl>
        </div>
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button type='button' onClick={onClose}>Close</button>
      </form>
    </dialog>
  );
};
