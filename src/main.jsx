import React from 'react';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from 'src/App.jsx';
import 'src/index.css';
import CustomConsole from 'src/components/Console/Console.jsx';
import Footer from 'src/components/Footer/Footer.jsx';
import FormulasLibrary from 'src/components/FormulasLibrary/FormulasLibrary.jsx';
import Header from 'src/components/Header/Header.jsx';
import InfoPanel from 'src/components/InfoPanel/InfoPanel.jsx';
import RefreshPrompt from 'src/components/Prompts/RefreshPrompt.jsx';
import ShareSolveViewPage from 'src/components/Share/ShareSolveViewPage.jsx';
import { ConsoleProvider } from 'src/contexts/ConsoleContext.jsx';
import { AuthProvider } from 'src/contexts/GoogleAuthContext.jsx';
import { CubeProvider } from 'src/providers/CubeProvider.jsx';
import { SettingsProvider } from 'src/providers/SettingsProvider.jsx';
import { ThemeProviderWrapper } from 'src/providers/ThemeProvider.jsx';

const projectBaseUrl = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <CubeProvider>
    <SettingsProvider>
      <ThemeProviderWrapper>
        <ConsoleProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <div className='min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col'>
                <Router>
                  <Header />
                  <CustomConsole />
                  <InfoPanel wrapperClassName="flex flex-col items-center justify-center relative" />
                  <Routes>
                    <Route path={`/${projectBaseUrl}/`} element={<App />} />
                    <Route
                      path={`/${projectBaseUrl}share/:encodedData`}
                      element={<ShareSolveViewPage />}
                    />
                    <Route path={`/${projectBaseUrl}library/`} element={<FormulasLibrary />} />
                  </Routes>
                  <Footer />
                </Router>
              </div>
              <ToastContainer />
              <RefreshPrompt />
            </AuthProvider>
          </GoogleOAuthProvider>
        </ConsoleProvider>
      </ThemeProviderWrapper>
    </SettingsProvider>
  </CubeProvider>
);
