import React, { useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';
import { SettingsContext } from 'src/contexts/SettingsContext';
import { DEFAULT_SESSION_ID } from 'src/db/configDB.js';


const defaultSettings = {
  theme: 'light',
  language: 'en',
  notifications: true,
  fontSize: 16,
  selectedSessionId: DEFAULT_SESSION_ID,
  solutionChart: true,
  inspection: false,
  solvesPerPage: 5,
  practiceMode: {
    category: 'ROUX_CMLL'
  },
  showCubeAnimation: true,
  backgroundColor: 'none'
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
    const keys = key.split('.');

    if (keys.length === 1) {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
      return;
    }

    setSettings((prev) => {
      const updateNestedState = (obj, path, val) => {
        const [currentKey, ...restOfPath] = path;

        if (restOfPath.length === 0) {
          return {
            ...obj,
            [currentKey]: val,
          };
        }

        return {
          ...obj,
          [currentKey]: updateNestedState(obj[currentKey] || {}, restOfPath, val),
        };
      };
      return updateNestedState(prev, keys, value);
    });
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
