import './App.css';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { UserProvider } from './context/userContext';

function App() {
  // eslint-disable-next-line
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  // eslint-disable-next-line
  const [hider, setHider] = useState(false);
  const tele = window.Telegram.WebApp;

  useEffect(() => {
    const handleContextMenu = (event) => event.preventDefault();
    const handleKeyDown = (event) => {
      if ((event.ctrlKey && (event.key === 'u' || event.key === 's')) || 
         (event.ctrlKey && event.shiftKey && event.key === 'i')) {
        event.preventDefault();
      }
    };
  
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    tele.ready();
    tele.expand();
    window.Telegram.WebApp.setHeaderColor('#3A59D1');

    // Check if running in Telegram WebApp and use the result
    const isTelegramApp = tele && tele.initDataUnsafe && tele.initDataUnsafe.query_id;
    if (isTelegramApp) {
      // Telegram-specific initialization
      if (tele.HapticFeedback) {
        tele.HapticFeedback.impactOccurred("medium");
      }
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  }, [tele]);

  useEffect(() => {
    // Check if the user has visited before using localStorage
    const visited = localStorage.getItem('hasVisitedBefore');
    if (visited) {
      setHasVisitedBefore(true);
    } else {
      setHider(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  return (
    <UserProvider>
      <TonConnectUIProvider manifestUrl="https://ltclink.pw/tonconnect-manifest.json">
        <div className="App">
          <Outlet/>
        </div>
      </TonConnectUIProvider>
    </UserProvider>
  );
}

export default App;
