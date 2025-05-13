import { createRoot } from 'react-dom/client';
import App from 'src/App.jsx';
import 'src/index.css';
import { CubeProvider } from 'src/providers/CubeProvider.jsx';
import { SettingsProvider } from 'src/providers/SettingsProvider.jsx';

createRoot(document.getElementById('root')).render(
  <>
    <CubeProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </CubeProvider>
  </>,
);
