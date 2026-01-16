import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {IDetectedBarcode, Scanner} from '@yudiel/react-qr-scanner';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../state/store.ts';
import { fetchVerifyToken } from '../../utils/apiHelperQrCode.ts';
import { isWithinRadius } from '../../utils/BlockVisibility.ts';

export function QrCodeScannerPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [revisitPage, setRevistPage] = useState(false);

  const userPosition = useSelector((state: RootState) => state.geolocation.position);

  // for scanner
  const [result, setResult] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(true);

  const [denied, setDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [tooFarAway, setTooFarAway] = useState(false);

  // handle qr-code scanner
  useEffect(() => {
    if (result === null) {
      return;
    }

    const handleOnlineMode = async () => {
      const data: VerifyTokenResponse|false = await fetchVerifyToken(result);
      console.log(data);

      if (!data) {
        return;
      }

      // Geo-Check: Ist der Nutzer nah genug am Lernort?
      // Hinweis: 'data' muss die Koordinaten und den Radius des Lernorts enthalten
      if (userPosition && data.latitude && data.longitude) {
        const inRadius = isWithinRadius(
          { lat: data.latitude, lng: data.longitude },
          data.radius || 50, // Fallback auf 50m, falls kein Radius vom Server kommt
          { lat: userPosition[0], lng: userPosition[1] }
        );

        if (!inRadius) {
          setTooFarAway(true);
          setShowScanner(false);
          return;
        }
      }

      switch (data?.status) {
        case 'QR_CODE_USER_FIRST_TIME_HERE':
          navigate(`/lernort/${data.id}?success`);
          break;
        case 'QR_CODE_USER_WAS_HERE':
          navigate(`/lernort/${data.id}`);
          break;
        case 'QR_CODE_ACCESS_DENIED':
          setDenied(true);
          break;
        case 'QR_CODE_NOT_FOUND':
          setNotFound(true);
          break;
      }
      setShowScanner(false);
    }

    const handleOfflineMode = () => {
      const storedCodes = localStorage.getItem('scannedCodes');
      const codesArray = storedCodes ? JSON.parse(storedCodes) : [];

      if (result && !codesArray.includes(result)) {
        codesArray.push(result);
        localStorage.setItem('scannedCodes', JSON.stringify(codesArray));
      }

      setResult(null);
      setRevistPage(true);
    };


    if (navigator.onLine) {
      handleOnlineMode();
    } else {
      handleOfflineMode();
    }
  }, [dispatch, navigate, result, userPosition]);

  // scann handler
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

  if (denied) {
    return (
      <div className="qr-code-message">
        <h3>Der Lernort ist nicht für Sie verfügbar.</h3>
      </div>
    );
  }

  if (tooFarAway) {
    return (
      <div className="qr-code-message">
        <h3>Scanner gesperrt</h3>
        <p>Sie befinden sich nicht nah genug am Lernort, um diesen Code zu aktivieren.</p>
        <button className="btn" onClick={() => { setTooFarAway(false); setShowScanner(true); setResult(null); }}>Erneut versuchen</button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="qr-code-message">
        <h3>Der Lernort wurde nicht gefunden.</h3>
      </div>
    );
  }

  if (revisitPage) {
    return (
      <div className="qr-code-message">
        <h3>Der Lernort wird geladen, wenn Sie wieder online sind.</h3>
      </div>
    );
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
              sound={false}
            />
          </div>
        )
      }
    </div>
  );
}
