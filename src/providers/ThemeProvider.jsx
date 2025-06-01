import React, { useMemo } from 'react';

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { useSettings } from 'src/hooks/useSettings.js';
import { darkTheme, lightTheme } from 'src/providers/theme.js';


export const ThemeProviderWrapper = ({ children }) => {
  const { settings } = useSettings();

  const theme = useMemo(() => (settings.theme === 'dark' ? darkTheme : lightTheme), [settings.theme]);

  return (
    <MUIThemeProvider theme={theme}>
      <div style={{ touchAction: 'pan-x pan-y', overflow: 'auto' }}>
        {children}
      </div>
    </MUIThemeProvider>
  );
};
