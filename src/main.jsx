import React from 'react';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from 'src/App.jsx';
import 'react-toastify/dist/ReactToastify.css';
import 'src/index.css';
import 'src/style.css';
import CustomConsole from 'src/components/Console/Console.jsx';
import Footer from 'src/components/Footer/Footer.jsx';
import FormulasLibrary from 'src/components/FormulasLibrary/FormulasLibrary.jsx';
import Header from 'src/components/Header/Header.jsx';
import InfoPanel from 'src/components/InfoPanel/InfoPanel.jsx';
import RefreshPrompt from 'src/components/Prompts/RefreshPrompt.jsx';
import SettingsPage from 'src/components/Settings/SettingsPage.jsx';
import ShareSolveViewPage from 'src/components/Share/ShareSolveViewPage.jsx';
import { ConsoleProvider } from 'src/contexts/ConsoleContext.jsx';
import { AuthProvider } from 'src/contexts/GoogleAuthContext.jsx';
import { useSettings } from 'src/hooks/useSettings.js';
import { AppUpdateProvider } from 'src/providers/AppUpdateProvider.jsx';
import { CubeProvider } from 'src/providers/CubeProvider.jsx';
import { SettingsProvider } from 'src/providers/SettingsProvider.jsx';
import { ThemeProviderWrapper } from 'src/providers/ThemeProvider.jsx';

function AppToasts() {
  const { settings } = useSettings();

  return (
    <ToastContainer
      theme={settings.theme === 'dark' ? 'dark' : 'light'}
      toastClassName='app-toast'
    />
  );
}

const projectBaseUrl = import.meta.env.BASE_URL;

function AppLayout() {
  const { pathname } = useLocation();
  const isFullScreenPage =
    pathname.includes('/library') ||
    pathname.includes('/share/') ||
    pathname.includes('/settings');

  return (
    <div className='min-h-screen app-page flex flex-col'>
      {!isFullScreenPage && <Header />}
      <CustomConsole />
      {!isFullScreenPage && (
        <InfoPanel wrapperClassName="flex flex-col items-center justify-center relative" />
      )}
      <Routes>
        <Route path={`/${projectBaseUrl}/`} element={<App />} />
        <Route
          path={`/${projectBaseUrl}share/:encodedData`}
          element={<ShareSolveViewPage />}
        />
        <Route path={`/${projectBaseUrl}library/`} element={<FormulasLibrary />} />
        <Route path={`/${projectBaseUrl}settings/`} element={<SettingsPage />} />
      </Routes>
      {!isFullScreenPage && <Footer />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <CubeProvider>
    <SettingsProvider>
      <ThemeProviderWrapper>
        <ConsoleProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <AppUpdateProvider>
                <Router>
                  <AppLayout />
                </Router>
                <AppToasts />
                <RefreshPrompt />
              </AppUpdateProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </ConsoleProvider>
      </ThemeProviderWrapper>
    </SettingsProvider>
  </CubeProvider>
);
