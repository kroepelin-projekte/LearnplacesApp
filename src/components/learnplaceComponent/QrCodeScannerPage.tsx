import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {IDetectedBarcode, Scanner} from '@yudiel/react-qr-scanner';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../state/store.ts';
import { fetchVerifyToken } from '../../utils/apiHelperQrCode.ts';

interface VerifyTokenResponse {
  id: number;
  status: string;
  title: string;
}

export function QrCodeScannerPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [revisitPage, setRevistPage] = useState(false);

  // for scanner
  const [result, setResult] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(true);



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

      switch (data?.status) {
        case 'QR_CODE_USER_FIRST_TIME_HERE':
          navigate(`/lernort/${data.id}?success`);
          break;
        case 'QR_CODE_USER_WAS_HERE':
          navigate(`/lernort/${data.id}`);
          break;
        case 'QR_CODE_ACCESS_DENIED':
          navigate(`/lernort/${data.id}?denied`);
          break;
        case 'QR_CODE_NOT_FOUND':
          navigate(`/lernort/${data.id}?not_found`);
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
  }, [dispatch, navigate, result]);

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

  if (revisitPage) {
    return (
      <div className="qr-code-message">
        <h3>Der Lernort wird geladen wenn Sie wieder online sind.</h3>
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
            />
          </div>
        )
      }
    </div>
  );
}
