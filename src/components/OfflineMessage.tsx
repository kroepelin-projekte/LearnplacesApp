import { useEffect, useState, useCallback } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../state/store.ts";

export const OfflineMessage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverReachable, setServerReachable] = useState(true);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Timer for debouncing status changes
  const [statusChangeTimer, setStatusChangeTimer] = useState<number | null>(null);

  // Server health check with timeout
  const checkServerHealth = useCallback(async () => {
    console.log('Checking server health: START');
    if (!navigator.onLine) return;
    console.log('Checking server health: USER IS ONLINE');

    try {
      const controller = new AbortController();



      //const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout


      const TIMEOUT_SECONDS = 10;
      let remainingSeconds = TIMEOUT_SECONDS;

      const countdownInterval = setInterval(() => {
        console.log(`Timeout in ${remainingSeconds} Sekunden...`);
        remainingSeconds--;

        if (remainingSeconds < 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      const timeoutId = setTimeout(() => {
        controller.abort();
        clearInterval(countdownInterval);
      }, TIMEOUT_SECONDS * 1000);



      const response = await fetch(`${apiBaseUrl}/health`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal
      });

      clearInterval(countdownInterval);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Server not reachable');
      }

      setServerReachable(true);
      console.log('Checking server health: SUCCESS');
    } catch (error) {

      setServerReachable(false);
      console.error('Checking server health: ERROR checking server status:', error);


/*      // Ignore AbortError as it only means the request timed out
      if (error instanceof Error && error.name !== 'AbortError') {
        setServerReachable(false);
        console.error('Error checking server status:', error);
      }*/
    }
  }, [apiBaseUrl, accessToken]);

  // Debounced online status update
  const updateOnlineStatus = useCallback(() => {
    console.log('Online status changed');
    // Clear previous timer
    if (statusChangeTimer) {
      clearTimeout(statusChangeTimer);
    }

    // Set new timer with 2 second delay
    const newTimer = setTimeout(() => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        checkServerHealth();
      }
    }, 2000);

    setStatusChangeTimer(newTimer);
  }, [checkServerHealth, statusChangeTimer]);

  // Periodic health check
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkServerHealth();
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [checkServerHealth]);

  // Online/Offline event listeners
  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    checkServerHealth();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (statusChangeTimer) {
        clearTimeout(statusChangeTimer);
      }
    };
  }, [updateOnlineStatus, checkServerHealth, statusChangeTimer]);

  // Only render when status actually changes
  if (!isOnline) {
    return <div className="offline-message">Sie sind offline</div>;
  }

  if (!serverReachable) {
    return <div className="offline-message server">Online - Keine Serververbindung</div>;
  }

  return null;
};