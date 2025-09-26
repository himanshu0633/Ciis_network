import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// ✅ Contexts
import { AuthProvider } from './context/AuthContext';
// import { AssetsProvider } from './hrCds/context/AssetsContext.jsx';
// import { LeavesProvider } from './hrCds/context/LeavesContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {/* <LeavesProvider> */}
        {/* <AssetsProvider> */}
          <BrowserRouter>
            <App />
          </BrowserRouter>
        {/* </AssetsProvider> */}
      {/* </LeavesProvider> */}
    </AuthProvider>
  </StrictMode>
);
