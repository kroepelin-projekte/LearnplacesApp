import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import Confetti from 'react-confetti';
import {IDetectedBarcode, Scanner} from '@yudiel/react-qr-scanner';
import {setAccessToken} from '../../state/auth/authSlice.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {useDispatch} from 'react-redux';
import {AppDispatch, store} from '../../state/store.ts';

export function QrCodeScannerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // for confetti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setshowConfetti] = useState(false);

  // for scanner
  const [result, setResult] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(true);

  function handleResize() {
    setWindowSize(() => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      return newSize;
    });
  }

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (result === null) {
      return;
    }

    function fetchJson() {
      const accessToken = store.getState().auth.accessToken;
      fetch(`${apiBaseUrl}/learnplaces/${id}/verify/${result}`, {
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
            onSuccess();
            return;
          }
          console.log('[Learnplace] Verify token: ', data);
          setResult(null);
        })
        .catch(() => {
          console.log('[QR-Code] Fetch error or offline.');
          setResult(null);
        });
    }

    const onSuccess = () => {
      setShowScanner(false);
      setshowConfetti(true);

      setTimeout(() => {
        setshowConfetti(false);
      }, 8000);
    }

    fetchJson();
  }, [dispatch, id, navigate, result]);

  const handleScan = (data: IDetectedBarcode[]) => {

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
            <Scanner onScan={(result) => handleScan(result)} />

            {/* Display scanned result */}
            {result && (
              <div className="qr-code-scan-result">
                <p>Scan-Ergebnis:</p>
                <strong>{result}</strong>
              </div>
            )}

          </div>
        )
      }
    </div>
  );
}
