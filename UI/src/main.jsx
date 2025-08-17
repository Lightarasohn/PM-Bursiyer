import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './resources/css/index.css';
import App from './App.jsx';

import { LocalizationProvider } from './tools/localization/LocalizationContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocalizationProvider> 
      <App />
    </LocalizationProvider>
  </StrictMode>
);
