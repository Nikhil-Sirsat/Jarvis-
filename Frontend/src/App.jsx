import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProviderComponent } from './Context/ThemeContext';

// import pages
import About from './pages/About.jsx';
import Login from './Pages/Login.jsx';
import Chat from './Pages/Chat.jsx';
import Signup from './Pages/Signup.jsx';
import NewChat from './Pages/NewChat.jsx';
import ViewConv from './Pages/ViewConv.jsx';
import LostPage from './Pages/Lost.jsx';
import Favourite from './Pages/Favourite.jsx';

// import components
import Intro from './Components/Intro.jsx';
import Layout from './Components/Layout.jsx';

import ProtectedRoute from './ProtectedRoutes/ProtectedRoutes.jsx';

export default function App() {
  return (
    <ThemeProviderComponent>
      <div>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><Layout /></ProtectedRoute>
          }>

            {/* Redirect root `/` to `/chat` */}
            <Route index element={<Navigate to="chat" replace />} />

            <Route path="about" element={<About />} />

            <Route path="chat" element={<Chat />} >
              <Route index element={<Intro />} />
              <Route path="new-chat" element={<NewChat />} />
              <Route path="Favourites" element={<Favourite />} />
              <Route path=":convId" element={<ViewConv />} />
            </Route>
          </Route>

          {/* Auth routes */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />

          {/* 404 Page */}
          <Route path="*" element={<LostPage />} />
        </Routes>
      </div>
    </ThemeProviderComponent>
  );
};
