import { createRoot } from 'react-dom/client';
import App from 'src/App.jsx';
import 'src/index.css';
import { SettingsProvider } from 'src/providers/SettingsProvider.jsx';

createRoot(document.getElementById('root')).render(
  <>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </>,
);
