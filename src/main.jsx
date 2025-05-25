import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from 'src/App.jsx';
import 'src/index.css';
import ShareSolveViewPage from 'src/components/Share/ShareSolveViewPage.jsx';
import { ConsoleProvider } from 'src/contexts/ConsoleContext.jsx';
import { AuthProvider } from 'src/contexts/GoogleAuthContext.jsx';
import { CubeProvider } from 'src/providers/CubeProvider.jsx';
import { SettingsProvider } from 'src/providers/SettingsProvider.jsx';

const projectBaseUrl = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <Router>
    <CubeProvider>
      <SettingsProvider>
        <ConsoleProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <Routes>
                <Route path={`/${projectBaseUrl}/`} element={<App />} />
                <Route path={`/${projectBaseUrl}share/:encodedData`} element={<ShareSolveViewPage />} />
              </Routes>
            </AuthProvider>
          </GoogleOAuthProvider>
        </ConsoleProvider>
      </SettingsProvider>
    </CubeProvider>
  </Router>,
);
