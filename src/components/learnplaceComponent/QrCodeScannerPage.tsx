import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import Confetti from 'react-confetti';
import {IDetectedBarcode, Scanner} from '@yudiel/react-qr-scanner';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export function QrCodeScannerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  function vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
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
      const jwt = localStorage.getItem('access_token');

      fetch(`${apiBaseUrl}/learnplaces/${id}/verify/${result}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + jwt,
        }
      })
        .then((res) => {
          const jwt = res.headers.get('Learnplaces_token');

          // @ts-ignore
          if (!res.status === 200 || !res.status === 400 || !jwt) {
            throw new Error('[QR-Code] Failed to fetch learnplace: ' + res.statusText);
          }
          if (res.status === 401) {
            navigate('/logout', { replace: true });
            return;
          }
          localStorage.setItem('learnplacesToken', jwt);
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
      vibrate();
      setTimeout(() => {
        setshowConfetti(false);
      }, 8000);
    }

    fetchJson();
  }, [id, navigate, result]);

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
          </div>
        )
      }
    </div>
  );
}
