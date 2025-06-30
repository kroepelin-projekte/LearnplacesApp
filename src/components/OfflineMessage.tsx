import {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {RootState} from "../state/store.ts";

export const OfflineMessage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [serverReachable, setServerReachable] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // health check
  useEffect(() => {
    const checkServerHealth = () => {
      if (!navigator.onLine) return; // Don't check if offline
      console.log('Checking server health...');

      fetch(`${apiBaseUrl}/health`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Server nicht erreichbar');
          }
          setServerReachable(true);
        })
        .catch(error => {
          setServerReachable(false);
          console.error('Fehler beim Abrufen des Serverstatus:', error);
        });
    };

    // Initial check
    checkServerHealth();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkServerHealth, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [apiBaseUrl, accessToken]);


  // check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      // Only trigger server check when going online
      if (online) {
        fetch(`${apiBaseUrl}/health`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then(res => {
            if (!res.ok) throw new Error('Server nicht erreichbar');
            setServerReachable(true);
          })
          .catch(() => setServerReachable(false));
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [apiBaseUrl, accessToken]);

  return (
    <>
      {isOnline && !serverReachable && <div className="offline-message server">Online - Keine Serververbindung</div>}
      {!isOnline && <div className="offline-message">Sie sind offline</div>}
    </>
  );
}
