import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../state/store.ts';

export const OfflineMessage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [serverReachable, setServerReachable] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // health check
  useEffect(() => {
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
  }, [apiBaseUrl, dispatch, accessToken, isOnline]);

  // check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setServerReachable(true);
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <>
      {isOnline && !serverReachable && <div className="offline-message server">Online - Keine Serververbindung</div>}
      {!isOnline && <div className="offline-message">Sie sind offline</div>}
    </>
  );
}
