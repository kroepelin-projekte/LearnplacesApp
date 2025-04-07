import {useCallback, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import Confetti from 'react-confetti';
import {IDetectedBarcode, Scanner} from '@yudiel/react-qr-scanner';
import {setAccessToken} from '../../state/auth/authSlice.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {useDispatch} from 'react-redux';
import {AppDispatch, store} from '../../state/store.ts';
import {Loader} from '../Loader.tsx';

export function QrCodeScannerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [ready, setReady] = useState(false);

  const [revisitPage, setRevistPage] = useState(false);

  // for confetti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setshowConfetti] = useState(false);

  // for scanner
  const [result, setResult] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(true);

  // resize confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(() => {
        const newSize = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        return newSize;
      });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // verify qr-code token
  const fetchVerifyToken = useCallback(async (token: string) => {
    const accessToken = store.getState().auth.accessToken;
    return fetch(`${apiBaseUrl}/learnplaces/${id}/verify/${token}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 400) {
          throw new Error('[QR-Code] Failed to fetch learnplace: ' + res.statusText);
        }
        const accessToken = res.headers.get('Learnplaces_token');
        if (accessToken) {
          dispatch(setAccessToken(accessToken));
        }
        return res.json();
      })
      .then((data) => {
        if (data?.data?.valid === true) {
          return true;
        }
        throw new Error('[QR-Code] Invalid QR-Code');
      })
      .catch(() => {
        console.log('[QR-Code] Fetch error or offline.');
        return false;
      });
  }, [dispatch, id]);

  // handle qr-code scanner
  useEffect(() => {
    if (result === null) {
      return;
    }

    const handleOnlineMode = async () => {
      const success = await fetchVerifyToken(result);
      if (success) {
        setShowScanner(false);
        setshowConfetti(true);
        setTimeout(() => {
          setshowConfetti(false);
        }, 8000);
      }
    }

    const handleOfflineMode = () => {
      localStorage.setItem('scanned-code_' + id, JSON.stringify({id, result}));
      setResult(null);
      setRevistPage(true);
    };

    if (navigator.onLine) {
      handleOnlineMode();
    } else {
      handleOfflineMode();
    }
  }, [fetchVerifyToken, dispatch, id, navigate, result]);

  // Fetch qr-code list when online
  useEffect(() => {
    const handleOnline = async () => {
      setRevistPage(false);
      const pendingRequest = localStorage.getItem('scanned-code_' + id);

      if (pendingRequest) {
        const { id, result } = JSON.parse(pendingRequest);

        const success = await fetchVerifyToken(result);
        if (success) {
          setShowScanner(false);
          setshowConfetti(true);
          setTimeout(() => {
            setshowConfetti(false);
          }, 8000);
        } else {
          console.log(`[QR-Code] Request for ID ${id} failed`);
        }

        localStorage.removeItem('scanned-code_' + id);
      } else {
        console.log('[QR-Code] No pending requests found.');
      }
      setReady(true);
    };
    handleOnline();

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchVerifyToken, id]);

  const handleScan = (data: IDetectedBarcode[]) => {
    console.log('SCANNER ', data);
    if (data.length === 0) {
      return;
    }
    const token: string = data[0].rawValue;
    const tokenRegex = /^[a-zA-Z0-9]{10,}$/;
    if (token && tokenRegex.test(token)) {
      setResult(token);
    } else {
      setTimeout(() => setResult(null), 1500);
    }
  };

  if (!ready) {
    return <Loader />;
  }

  if (revisitPage) {
    return (
      <div className="qr-code-message">
        <h3>Bitte öffnen Sie die Scanner-Seite von diesem Lernort erneut, wenn Sie wieder online sind.</h3>
      </div>
    );
  }

  if (!showScanner) {
    return (
      <div className="qr-code-message">
        <Confetti width={windowSize.width} height={windowSize.height} style={{opacity: showConfetti ? 1 : 0, transition: 'opacity 1s ease-in-out' }} />
        <h2>Herzlichen Glückwunsch!</h2>
        <h2>Sie haben den Lernort gefunden.</h2>
      </div>
    )
  }

  return (
    <div className="qr-code-scanner-page">
      {
        showScanner && (
          <div className="qr-code-scanner-wrapper">
            <Scanner
              onScan={(result) => handleScan(result)}
              onError={(err) => console.error(err)}
              allowMultiple={true}
            />
          </div>
        )
      }
    </div>
  );
}
