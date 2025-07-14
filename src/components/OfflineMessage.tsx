import { useSelector } from "react-redux";
import { selectHealth } from '../state/health/healthSlice';

export const OfflineMessage = () => {
  const { isOnline, serverReachable } = useSelector(selectHealth);

  if (!isOnline) {
    return <div className="offline-message">Sie sind offline</div>;
  }

  if (!serverReachable) {
    return <div className="offline-message server">Online - Keine Serververbindung</div>;
  }

  return null;
};