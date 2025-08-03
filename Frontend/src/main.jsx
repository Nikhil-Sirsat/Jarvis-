import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App.jsx';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import { SnackbarProvider } from './Context/SnackBarContext.jsx';
import { SocketProvider } from './Context/SocketContext.jsx';
import { ThemeProviderComponent } from './Context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProviderComponent>
        <SocketProvider>
          <SnackbarProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SnackbarProvider>
        </SocketProvider>
      </ThemeProviderComponent>
    </AuthProvider>
  </StrictMode>
);
