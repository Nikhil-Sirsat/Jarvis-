import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App.jsx';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import { SnackbarProvider } from './Context/SnackBarContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SnackbarProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SnackbarProvider>
    </AuthProvider>
  </StrictMode>
);
