import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProviderComponent } from './Context/ThemeContext';

import About from './pages/About.jsx';
import Login from './Pages/Login.jsx';
import Chat from './Pages/Chat.jsx';
import Signup from './Pages/Signup.jsx';
import NewChat from './Pages/NewChat.jsx';
import ViewConv from './Pages/ViewConv.jsx';
import LostPage from './Pages/Lost.jsx';
import Intro from './Components/Intro.jsx';
import Layout from './Components/Layout.jsx';

import ProtectedRoute from './ProtectedRoutes/ProtectedRoutes.jsx';

export default function App() {
  return (
    <ThemeProviderComponent>
      <div>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Redirect root `/` to `/chat` */}
            <Route index element={<Navigate to="chat" replace />} />

            {/* Protected Chat Routes */}
            <Route
              path="chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            >
              <Route index element={<Intro />} />
              <Route path="new-chat" element={<NewChat />} />
              <Route path=":convId" element={<ViewConv />} />
            </Route>

            {/* Other routes */}
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<LostPage />} />
        </Routes>
      </div>
    </ThemeProviderComponent>
  );
};
