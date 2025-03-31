import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import Confetti from 'react-confetti';
import {Scanner} from '@yudiel/react-qr-scanner';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export function QrCodeScannerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const [showConfetti, setshowConfetti] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(true);

  function handleResize() {
    setWindowSize(() => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      console.log('[QR-Code Page] Window size: ', newSize); // Aktualisierte Werte
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
      const jwt = localStorage.getItem('learnplacesToken');

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
            setShowScanner(false);
            setshowConfetti(true);
            vibrate();
            setTimeout(() => {
              setshowConfetti(false);
            }, 8000);
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

    fetchJson();
  }, [id, navigate, result]);

/*  const handleScan = (data: QrCodeDataInterface | null) => {
    if (data === null) {
      return;
    }
    const token: string = data['text'];
    const tokenRegex = /^[a-zA-Z0-9]{10,}$/;
    if (data && tokenRegex.test(token)) {
      setResult(token);
    } else {
      console.log('[QR-Code] Invalid token: ', token);
      setTimeout(() => setResult(null), 1500); // Scanner schnell wieder aktivieren
    }
  };*/

  //const handleError = (err: Error) => console.error(err);

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

            <Scanner onScan={(result) => console.log(result)} />

          </div>
        )
      }
    </div>
  );
}
