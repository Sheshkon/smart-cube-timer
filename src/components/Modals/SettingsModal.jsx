import React, { useState } from 'react';

import { TimerState } from 'src/components/Timer/util.js';
import {
  ACCENT_PALETTE,
  ACCENT_THEME_IDS,
  DEFAULT_ACCENT_COLOR,
  STATIC_THEMES,
  accentFromSpectrum,
  buildAccentDesign,
  resolveBackgroundTheme,
  spectrumFromAccent,
} from 'src/constants/backgroundThemes';
import { useCube } from 'src/hooks/useCube.js';
import useModalKeyboard from 'src/hooks/useModalKeyboard.js';
import { useSettings } from 'src/hooks/useSettings';

function DesignPreview({ colors, rail, accent }) {
  const cardShadow = `inset ${rail || '0px'} 0 0 ${accent}, 0 0 0 1px ${colors.line}`;

  return (
    <span className='flex flex-col gap-1 p-1.5' style={{ backgroundColor: colors.page }}>
      <span className='overflow-hidden rounded-sm'>
        <span className='block h-1.5' style={{ backgroundColor: colors.handle }} />
        <span className='block h-4' style={{ backgroundColor: colors.card, boxShadow: cardShadow }} />
      </span>
      <span className='overflow-hidden rounded-sm'>
        <span className='block h-1.5' style={{ backgroundColor: colors.handle }} />
        <span className='block h-3' style={{ backgroundColor: colors.card, boxShadow: cardShadow }} />
      </span>
    </span>
  );
}

function AccentSpectrumSlider({ value, onChange }) {
  const [position, setPosition] = useState(() =>
    spectrumFromAccent(value || DEFAULT_ACCENT_COLOR)
  );

  const applyPosition = (next) => {
    const clamped = Math.min(1, Math.max(0, next));
    setPosition(clamped);
    onChange(accentFromSpectrum(clamped));
  };

  return (
    <div className='px-1'>
      <input
        type='range'
        min={0}
        max={1000}
        step={1}
        value={Math.round(position * 1000)}
        aria-label='Accent color'
        className='accent-spectrum'
        style={{
          backgroundImage: `linear-gradient(to right, ${ACCENT_PALETTE.join(', ')})`,
          '--accent-spectrum-thumb': accentFromSpectrum(position),
        }}
        onChange={(event) => applyPosition(Number(event.target.value) / 1000)}
      />
    </div>
  );
}

function ThemeChoice({ themeOption, selected, onSelect }) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={`flex flex-col gap-2 rounded-xl p-2 text-left ${
        selected
          ? 'outline outline-2 outline-offset-2 outline-gray-900 dark:outline-white'
          : 'outline outline-1 outline-black/10 dark:outline-white/20'
      }`}
      aria-pressed={selected}
    >
      <span className='grid grid-cols-2 overflow-hidden rounded-lg'>
        <DesignPreview
          colors={themeOption.light}
          rail={themeOption.rail}
          accent={themeOption.accent}
        />
        <DesignPreview
          colors={themeOption.dark}
          rail={themeOption.rail}
          accent={themeOption.accent}
        />
      </span>
      <span className='px-0.5 text-sm font-medium'>{themeOption.label}</span>
    </button>
  );
}

export const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSetting } = useSettings();
  const { timerState } = useCube();

  useModalKeyboard({
    isOpen,
    onCancel: onClose,
    confirmOnEnter: false,
  });

  return (
    <>
      {isOpen && (
        <dialog open className='modal'>
          <div className={`modal-box ${settings.theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
            <h3 className='font-bold text-lg mb-4'>Settings</h3>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='themeToggle'>Dark Mode</label>
              </b>
              <input
                id='themeToggle'
                type='checkbox'
                className='toggle'
                checked={settings.theme === 'dark'}
                onChange={() =>
                  updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light')
                }
              />
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='gyroToggle'>Use Gyroscope</label>
              </b>
              <input
                id='gyroToggle'
                type='checkbox'
                className='toggle'
                checked={settings.useGyroscope || false}
                onChange={(e) => updateSetting('useGyroscope', e.target.checked)}
              />
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='imageNotation'>Use Image Moves Notation</label>
              </b>
              <input
                id='imageNotation'
                type='checkbox'
                className='toggle'
                checked={settings.imageNotation || false}
                onChange={(e) => updateSetting('imageNotation', e.target.checked)}
              />
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='showScrambleArrows'>Scramble arrows on cube</label>
              </b>
              <input
                id='showScrambleArrows'
                type='checkbox'
                className='toggle'
                checked={settings.showScrambleArrows !== false}
                onChange={(e) => updateSetting('showScrambleArrows', e.target.checked)}
              />
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='inspection'>Use inspection</label>
              </b>
              <input
                id='inspection'
                type='checkbox'
                className='toggle'
                checked={settings.inspection || false}
                onChange={(e) => updateSetting('inspection', e.target.checked)}
                disabled={timerState === TimerState.RUNNING}
              />
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='solutionChart'>Solve analyse chart</label>
              </b>
              <input
                id='solutionChart'
                type='checkbox'
                className='toggle'
                checked={settings.solutionChart || false}
                onChange={(e) => updateSetting('solutionChart', e.target.checked)}
              />
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='scrambleSize'>Scramble Size</label>
              </b>
              <select
                value={settings?.scrambleSize || 'text-sm'}
                className='select select-xs w-32'
                onChange={(e) => updateSetting('scrambleSize', e.target.value)}
              >
                <option value='text-xs'>Small</option>
                <option value='text-sm'>Default</option>
                <option value='text-lg'>Large</option>
                <option value='text-xl'>X-Large</option>
                <option value='text-2xl'>2XL</option>
                <option value='text-3xl'>3XL</option>
                <option value='text-4xl'>4XL</option>
                <option value='text-5xl'>5XL</option>
              </select>
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='solvesPerPage'>Solves Per Page</label>
              </b>
              <select
                value={settings?.solvesPerPage || 'text-sm'}
                className='select select-xs w-32'
                onChange={(e) => updateSetting('solvesPerPage', parseInt(e.target.value))}
              >
                <option value='5'>5</option>
                <option value='10'>10</option>
                <option value='15'>15</option>
                <option value='20'>20</option>
                <option value='25'>25</option>
                <option value='50'>50</option>
                <option value='75'>75</option>
                <option value='100'>100</option>
              </select>
            </div>
            <div className='flex justify-between items-center mb-3'>
              <b>
                <label htmlFor='notifyEveryNSolves'>Notify Every Solves</label>
              </b>
              <select
                value={settings?.notifyEveryNSolves || 'text-sm'}
                className='select select-xs w-32'
                onChange={(e) => updateSetting('notifyEveryNSolves', parseInt(e.target.value))}
              >
                <option value='-1'>Disabled</option>
                <option value='5'>5</option>
                <option value='10'>10</option>
                <option value='12'>15</option>
                <option value='15'>20</option>
                <option value='100'>100</option>
              </select>
            </div>
            <div>
              <b>
                <label htmlFor='appTheme'>Theme</label>
              </b>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3'>
                {STATIC_THEMES.map((themeOption) => (
                  <ThemeChoice
                    key={themeOption.id}
                    themeOption={themeOption}
                    selected={resolveBackgroundTheme(settings.backgroundColor).id === themeOption.id}
                    onSelect={() => updateSetting('backgroundColor', themeOption.id)}
                  />
                ))}
              </div>
              <fieldset className='mt-5 rounded-xl border border-black/10 dark:border-white/15 p-3'>
                <legend className='px-1 text-sm font-bold'>Accent themes</legend>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
                  Color applies to Solid, Accent stripe and Ink cards.
                </p>
                <AccentSpectrumSlider
                  value={settings.accentColor || DEFAULT_ACCENT_COLOR}
                  onChange={(hex) => updateSetting('accentColor', hex)}
                />
                <div className='grid grid-cols-1 gap-3 mt-4'>
                  {ACCENT_THEME_IDS.map((id) => {
                    const themeOption = buildAccentDesign(
                      id,
                      settings.accentColor || DEFAULT_ACCENT_COLOR
                    );

                    return (
                      <ThemeChoice
                        key={id}
                        themeOption={themeOption}
                        selected={resolveBackgroundTheme(settings.backgroundColor).id === id}
                        onSelect={() => updateSetting('backgroundColor', id)}
                      />
                    );
                  })}
                </div>
              </fieldset>
            </div>
            <div className='modal-action'>
              <form method='dialog'>
                <button
                  type='button'
                  className='app-btn p-1.5 rounded transition-colors'
                  onClick={onClose}
                  title='Esc'
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};
