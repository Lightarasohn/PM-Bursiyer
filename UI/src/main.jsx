import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { LocalizationProvider } from './Localization/LocalizationContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocalizationProvider> 
      <App />
    </LocalizationProvider>
  </StrictMode>
);
