import {FiCheck, FiX} from 'react-icons/fi';
import {Link} from 'react-router-dom';
import {useLayoutEffect, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVerifyToken } from '../utils/apiHelperQrCode.ts';
import {
  setSyncedLearnplaces,
  hideOverlay,
  getSyncedLearnplaces,
  getShowOverlay
} from '../state/sync/syncedLearnplacesSlice.ts';

type QrCodeStatus = 'QR_CODE_USER_FIRST_TIME_HERE' | 'QR_CODE_USER_WAS_HERE';
interface SyncedLearnplaceState {
  id: number;
  title: string;
  status: QrCodeStatus;
}

export const SyncLearnplaces = () => {
  const dispatch = useDispatch();
  const syncAttempted = useRef(false);
  const learnplaces = useSelector(getSyncedLearnplaces);
  const showOverlay = useSelector(getShowOverlay);

  useLayoutEffect(() => {
    const syncLearnplaces = async () => {
      if (syncAttempted.current) return;

      const storedCodes = localStorage.getItem('scannedCodes');
      syncAttempted.current = !storedCodes;
      if (!storedCodes) return;

      try {
        const codes = JSON.parse(storedCodes) as string[];
        localStorage.removeItem('scannedCodes');

        if (!codes || codes.length === 0) return;

        const processPromises = codes.map(async (code: string) => {
          const data = await fetchVerifyToken(code);

          if (!data) {
            return null;
          }

          switch (data?.status) {
            case 'QR_CODE_USER_FIRST_TIME_HERE':
            case 'QR_CODE_USER_WAS_HERE':
              return {
                id: data.id,
                title: data.title,
                status: data.status,
              }
            case 'QR_CODE_ACCESS_DENIED':
            case 'QR_CODE_NOT_FOUND':
              return null;
          }
        });

        const results = await Promise.all(processPromises);
        const validResults = results.filter((result): result is SyncedLearnplaceState =>
          result !== null
        );

        if (validResults.length > 0) {
          syncAttempted.current = true;
          dispatch(setSyncedLearnplaces(validResults));
        }
      } catch (error) {
        console.error('Fehler beim Synchronisieren der Lernorte:', error);
      }
    };

    if (navigator.onLine) {
      syncLearnplaces();
    }
  }, [dispatch]);

  if (!showOverlay || learnplaces.length === 0) {
    return null;
  }

  const handleClose = () => {
    console.log('close');
    dispatch(hideOverlay());
  };

  return (
    <div className="synced-learnplaces-overlay" onClick={handleClose}>
      <div
        className="new-found-learnplaces"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={handleClose} className="btn-cancel">
          <FiX size={30} />
        </button>
        <h2>Synchronisierte Lernorte</h2>
        <p>Folgende neue Lernorte wurden synchronisiert:</p>
        <ul>
          {learnplaces.map((learnplace, index) => (
            <li key={index}>
              <FiCheck size={20} style={{ marginRight: "5px" }} />
              <Link to={`/lernort/${learnplace.id}`}>
                {learnplace.title}
              </Link>
            </li>
          ))}
        </ul>
        <p>
        </p>
      </div>
    </div>
  );
};