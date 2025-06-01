import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import App from './App.jsx'

import About from './pages/About.jsx';
import Login from './Pages/Login.jsx';
import Chat from './Pages/Chat.jsx';
import Signup from './Pages/Signup.jsx';
import NewChat from './Pages/NewChat.jsx';
import ViewConv from './Pages/ViewConv.jsx';
import LostPage from './Pages/Lost.jsx';
import Intro from './Components/Intro.jsx';

import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoutes/ProtectedRoutes.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <ProtectedRoute><Chat /></ProtectedRoute>,
        children: [
          {
            path: '/',
            element: <Intro />
          },
          {
            path: 'new-chat',
            element: <NewChat />
          },
          {
            path: ':convId',
            element: <ViewConv />
          }
        ]
      },
      {
        path: '/About',
        element: <About />
      },
      {
        path: '/Login',
        element: <Login />
      },
      {
        path: '/Signup',
        element: <Signup />
      },
    ]
  },
  {
    path: '*',
    element: <LostPage />
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
