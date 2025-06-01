import './App.css'
import { Outlet } from 'react-router-dom';
import { ThemeProviderComponent } from './Context/ThemeContext';

function App() {

  return (
    <>
      <ThemeProviderComponent>
        <div className='hero-cont'>
          <Outlet />
        </div>
      </ThemeProviderComponent>
    </>
  )
}

export default App
