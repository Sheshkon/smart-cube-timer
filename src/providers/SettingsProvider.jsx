import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

const defaultSettings = {
  theme: 'light',
  language: 'en',
  notifications: true,
  fontSize: 16,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(() => ({
          ...defaultSettings,
          ...parsedSettings,
        }));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    } else {
      setSettings((prev) => ({
        ...prev,
      }));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, settingsRef, updateSetting, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
