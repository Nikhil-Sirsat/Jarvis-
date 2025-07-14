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
import Settings from './Pages/Settings.jsx';

// import components
import Intro from './Components/Intro.jsx';
import Layout from './Components/Layout.jsx';
import Personalization from './Components/Personalization.jsx';
import Memory from './Components/Memory.jsx';
import DataControl from './Components/DataControl.jsx';
import Account from './Components/Account.jsx';
import ThemeButton from './Components/ThemeButton.jsx';

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
              <Route path="settings" element={<Settings />}>
                <Route path="theme" element={<ThemeButton />} />
                <Route path="personalization" element={<Personalization />} />
                <Route path="memory" element={<Memory />} />
                <Route path="data-control" element={<DataControl />} />
                <Route path="account" element={<Account />} />
              </Route>
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
