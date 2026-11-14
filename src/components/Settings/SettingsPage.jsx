import React, { useRef, useState } from 'react';

import 'dexie-export-import';
import { Database, FileDown, FileUp, Loader2, RotateCcw, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppSelect from 'src/components/AppSelect/AppSelect.jsx';
import FullScreenModal from 'src/components/Modals/FullScreenModal.jsx';
import { TimerState } from 'src/components/Timer/util.js';
import db from 'src/db/db.js';
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
import { useSettings } from 'src/hooks/useSettings';

const projectBaseUrl = import.meta.env.BASE_URL;
const SETTINGS_EXPORT_NAME = 'smart-cube-timer-settings';
const SESSIONS_EXPORT_NAME = 'smart_cube_timer_solves';

function downloadJsonBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

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

function SettingsSection({ title, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`min-w-0 h-full flex flex-col ${className}`}>
      <h4 className='text-xs font-semibold uppercase tracking-wide opacity-60 mb-2'>{title}</h4>
      <div className={`app-card rounded-xl px-4 py-1.5 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

function SettingRow({ children }) {
  return (
    <div className='flex justify-between items-center gap-3 py-1.5 leading-tight'>
      {children}
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

function extractImportedSettings(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('This file does not look like timer settings');
  }

  if (parsed.settings && typeof parsed.settings === 'object' && !Array.isArray(parsed.settings)) {
    return parsed.settings;
  }

  if ('theme' in parsed || 'backgroundColor' in parsed || 'inspection' in parsed) {
    return parsed;
  }

  throw new Error('This file does not look like timer settings');
}

async function clearOfflineCache() {
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }
}

const SettingsPage = () => {
  const { settings, settingsRef, updateSetting, resetSettings, importSettings } = useSettings();
  const { timerState } = useCube();
  const navigate = useNavigate();
  const settingsFileRef = useRef(null);
  const sessionsFileRef = useRef(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingSessionsFile, setPendingSessionsFile] = useState(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isExportingSessions, setIsExportingSessions] = useState(false);
  const [isImportingSessions, setIsImportingSessions] = useState(false);

  const goToTimer = () => navigate(projectBaseUrl, { replace: false });
  const toastTheme = { theme: settingsRef.current.theme };

  const handleExportSettings = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    downloadJsonBlob(blob, `${SETTINGS_EXPORT_NAME}-${new Date().toISOString()}.json`);
    toast.success('Settings exported', toastTheme);
  };

  const handleImportSettings = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      importSettings(extractImportedSettings(parsed));
      toast.success('Settings imported', toastTheme);
    } catch (error) {
      toast.error(`Import failed: ${error.message}`, toastTheme);
    }
  };

  const handleExportSessions = async () => {
    try {
      setIsExportingSessions(true);
      const blob = await db.export({ prettyJson: false });
      downloadJsonBlob(blob, `${SESSIONS_EXPORT_NAME}-${new Date().toISOString()}.json`);
      toast.success('Sessions exported', toastTheme);
    } catch (error) {
      toast.error(`Sessions export failed: ${error.message}`, toastTheme);
    } finally {
      setIsExportingSessions(false);
    }
  };

  const handleSessionsFileChosen = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    setPendingSessionsFile(file);
    setConfirmAction('sessions');
  };

  const handleImportSessions = async () => {
    if (!pendingSessionsFile) {
      return;
    }

    try {
      setIsImportingSessions(true);
      await db.import(pendingSessionsFile, {
        clearTablesBeforeImport: true,
      });
      toast.success('Sessions imported', toastTheme);
      setPendingSessionsFile(null);
      setConfirmAction(null);
    } catch (error) {
      toast.error(`Sessions import failed: ${error.message}`, toastTheme);
    } finally {
      setIsImportingSessions(false);
    }
  };

  const handleResetSettings = () => {
    resetSettings();
    setConfirmAction(null);
    toast.success('Settings restored to defaults', toastTheme);
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearOfflineCache();
      toast.success('Cache cleared. Reloading…', toastTheme);
      window.location.reload();
    } catch (error) {
      setIsClearingCache(false);
      setConfirmAction(null);
      toast.error(`Could not clear cache: ${error.message}`, toastTheme);
    }
  };

  const selectedThemeId = resolveBackgroundTheme(settings.backgroundColor).id;
  const accentThemes = ACCENT_THEME_IDS.map((id) =>
    buildAccentDesign(id, settings.accentColor || DEFAULT_ACCENT_COLOR)
  );

  return (
    <FullScreenModal
      title={(
        <>
          <Settings size={22} />
          Settings
        </>
      )}
      onClose={goToTimer}
      useHistory={false}
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch'>
        <SettingsSection title='Timer'>
          <SettingRow>
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
          </SettingRow>
          <SettingRow>
            <b>
              <label htmlFor='hideTimeDuringSolve'>Hide time while solving</label>
            </b>
            <input
              id='hideTimeDuringSolve'
              type='checkbox'
              className='toggle'
              checked={settings.hideTimeDuringSolve || false}
              onChange={(e) => updateSetting('hideTimeDuringSolve', e.target.checked)}
            />
          </SettingRow>
          <SettingRow>
            <b>
              <label htmlFor='notifyEveryNSolves'>Notify Every Solves</label>
            </b>
            <AppSelect
              id='notifyEveryNSolves'
              align='end'
              value={settings?.notifyEveryNSolves ?? -1}
              onChange={(next) => updateSetting('notifyEveryNSolves', parseInt(next, 10))}
              options={[
                { value: -1, label: 'Disabled' },
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 12, label: '15' },
                { value: 15, label: '20' },
                { value: 100, label: '100' },
              ]}
            />
          </SettingRow>
          <SettingRow>
            <b>
              <label htmlFor='solvesPerPage'>Solves Per Page</label>
            </b>
            <AppSelect
              id='solvesPerPage'
              align='end'
              value={settings?.solvesPerPage ?? 10}
              onChange={(next) => updateSetting('solvesPerPage', parseInt(next, 10))}
              options={[5, 10, 15, 20, 25, 50, 75, 100].map((count) => ({
                value: count,
                label: String(count),
              }))}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title='Cube & scramble'>
          <SettingRow>
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
          </SettingRow>
          <SettingRow>
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
          </SettingRow>
          <SettingRow>
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
          </SettingRow>
          <SettingRow>
            <b>
              <label htmlFor='scrambleSize'>Scramble Size</label>
            </b>
            <AppSelect
              id='scrambleSize'
              align='end'
              value={settings?.scrambleSize || 'text-sm'}
              onChange={(next) => updateSetting('scrambleSize', next)}
              options={[
                { value: 'text-xs', label: 'Small' },
                { value: 'text-sm', label: 'Default' },
                { value: 'text-lg', label: 'Large' },
                { value: 'text-xl', label: 'X-Large' },
                { value: 'text-2xl', label: '2XL' },
                { value: 'text-3xl', label: '3XL' },
                { value: 'text-4xl', label: '4XL' },
                { value: 'text-5xl', label: '5XL' },
              ]}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title='Data' className='lg:col-span-2 xl:col-span-1 xl:row-span-2' bodyClassName='py-3 space-y-3'>
          <p className='text-sm opacity-70'>
            Settings and sessions are backed up separately. Importing sessions replaces all local solves.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3'>
            <button
              type='button'
              className='app-btn rounded-xl px-3 py-3 text-left flex items-start gap-3'
              onClick={handleExportSettings}
            >
              <FileUp size={18} className='mt-0.5 shrink-0' />
              <span>
                <span className='block font-semibold'>Export settings</span>
                <span className='block text-sm opacity-70'>Download a JSON file</span>
              </span>
            </button>
            <button
              type='button'
              className='app-btn rounded-xl px-3 py-3 text-left flex items-start gap-3'
              onClick={() => settingsFileRef.current?.click()}
            >
              <FileDown size={18} className='mt-0.5 shrink-0' />
              <span>
                <span className='block font-semibold'>Import settings</span>
                <span className='block text-sm opacity-70'>Restore from a JSON file</span>
              </span>
            </button>
            <button
              type='button'
              className='app-btn rounded-xl px-3 py-3 text-left flex items-start gap-3'
              onClick={handleExportSessions}
              disabled={isExportingSessions}
            >
              {isExportingSessions ? (
                <Loader2 size={18} className='mt-0.5 shrink-0 animate-spin' />
              ) : (
                <Database size={18} className='mt-0.5 shrink-0' />
              )}
              <span>
                <span className='block font-semibold'>Export sessions</span>
                <span className='block text-sm opacity-70'>All sessions and solves</span>
              </span>
            </button>
            <button
              type='button'
              className='app-btn rounded-xl px-3 py-3 text-left flex items-start gap-3'
              onClick={() => sessionsFileRef.current?.click()}
              disabled={isImportingSessions}
            >
              {isImportingSessions ? (
                <Loader2 size={18} className='mt-0.5 shrink-0 animate-spin' />
              ) : (
                <Database size={18} className='mt-0.5 shrink-0' />
              )}
              <span>
                <span className='block font-semibold'>Import sessions</span>
                <span className='block text-sm opacity-70'>Replace all local sessions</span>
              </span>
            </button>
            <button
              type='button'
              className='app-btn rounded-xl px-3 py-3 text-left flex items-start gap-3'
              onClick={() => setConfirmAction('reset')}
            >
              <RotateCcw size={18} className='mt-0.5 shrink-0' />
              <span>
                <span className='block font-semibold'>Reset to defaults</span>
                <span className='block text-sm opacity-70'>Restore default settings</span>
              </span>
            </button>
            <button
              type='button'
              className='app-btn rounded-xl px-3 py-3 text-left flex items-start gap-3'
              onClick={() => setConfirmAction('cache')}
              disabled={isClearingCache}
            >
              <Trash2 size={18} className='mt-0.5 shrink-0' />
              <span>
                <span className='block font-semibold'>Clear cache</span>
                <span className='block text-sm opacity-70'>Offline files only, then reload</span>
              </span>
            </button>
          </div>
          <input
            ref={settingsFileRef}
            type='file'
            accept='application/json,.json'
            className='hidden'
            onChange={handleImportSettings}
          />
          <input
            ref={sessionsFileRef}
            type='file'
            accept='application/json,.json'
            className='hidden'
            onChange={handleSessionsFileChosen}
          />
          {confirmAction === 'reset' && (
            <div className='rounded-xl border border-black/10 dark:border-white/15 p-3'>
              <p className='mb-3 text-sm'>Restore default settings on this device?</p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='app-btn-accent rounded-full px-3 py-1.5'
                  onClick={handleResetSettings}
                >
                  Reset
                </button>
                <button
                  type='button'
                  className='app-btn rounded-full px-3 py-1.5'
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {confirmAction === 'sessions' && (
            <div className='rounded-xl border border-black/10 dark:border-white/15 p-3'>
              <p className='mb-3 text-sm'>
                Replace all sessions and solves on this device with
                {pendingSessionsFile ? ` “${pendingSessionsFile.name}”` : ' this backup'}?
              </p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='app-btn-accent rounded-full px-3 py-1.5'
                  onClick={handleImportSessions}
                  disabled={isImportingSessions}
                >
                  {isImportingSessions ? 'Importing…' : 'Import'}
                </button>
                <button
                  type='button'
                  className='app-btn rounded-full px-3 py-1.5'
                  onClick={() => {
                    setPendingSessionsFile(null);
                    setConfirmAction(null);
                  }}
                  disabled={isImportingSessions}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {confirmAction === 'cache' && (
            <div className='rounded-xl border border-black/10 dark:border-white/15 p-3'>
              <p className='mb-3 text-sm'>
                Clear the app cache and reload? Solves and settings stay on this device.
              </p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='app-btn-accent rounded-full px-3 py-1.5'
                  onClick={handleClearCache}
                  disabled={isClearingCache}
                >
                  {isClearingCache ? 'Clearing…' : 'Clear cache'}
                </button>
                <button
                  type='button'
                  className='app-btn rounded-full px-3 py-1.5'
                  onClick={() => setConfirmAction(null)}
                  disabled={isClearingCache}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </SettingsSection>

        <SettingsSection title='Appearance' className='lg:col-span-2 xl:col-span-2' bodyClassName='py-3'>
          <SettingRow>
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
          </SettingRow>
          <div className='mt-3'>
            <b>
              <label htmlFor='appTheme'>Theme</label>
            </b>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3 mt-3'>
              {STATIC_THEMES.map((themeOption) => (
                <ThemeChoice
                  key={themeOption.id}
                  themeOption={themeOption}
                  selected={selectedThemeId === themeOption.id}
                  onSelect={() => updateSetting('backgroundColor', themeOption.id)}
                />
              ))}
            </div>
          </div>
          <div className='mt-4'>
            <b>
              <label htmlFor='accentColor'>Accent color</label>
            </b>
            <p className='text-sm opacity-70 mb-3'>
              Color applies to Solid, Accent stripe and Ink cards.
            </p>
            <AccentSpectrumSlider
              key={settings.accentColor || DEFAULT_ACCENT_COLOR}
              value={settings.accentColor || DEFAULT_ACCENT_COLOR}
              onChange={(hex) => updateSetting('accentColor', hex)}
            />
          </div>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3 mt-3'>
            {accentThemes.map((themeOption) => (
              <ThemeChoice
                key={themeOption.id}
                themeOption={themeOption}
                selected={selectedThemeId === themeOption.id}
                onSelect={() => updateSetting('backgroundColor', themeOption.id)}
              />
            ))}
          </div>
        </SettingsSection>
      </div>
    </FullScreenModal>
  );
};

export default SettingsPage;
