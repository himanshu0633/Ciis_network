import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// MUI v4 FIX: Required for stable classnames in production
import { StylesProvider } from '@material-ui/core/styles';
import generateClassName from './utils/generateClassName';

// Contexts
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StylesProvider generateClassName={generateClassName}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </StylesProvider>
  </StrictMode>
);
