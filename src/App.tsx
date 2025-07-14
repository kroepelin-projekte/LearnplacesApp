import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import {Layout} from './components/Layout.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from './state/store.ts';
import './assets/fonts/Roboto-VariableFont.ttf';
import './assets/scss/index.scss';
import { LoginPage } from './components/LoginPage.tsx';
import {OfflineMessage} from './components/OfflineMessage.tsx';
import {Logout} from './components/Logout.tsx';
import {StartPage} from './components/StartPage.tsx';
import {LearnplacePage} from './components/learnplaceComponent/LearnplacePage.tsx';
import {HowToPage} from './components/HowToPage.tsx';
import {MapPage} from './components/learnplaceComponent/MapPage.tsx';
import {QrCodeScannerPage} from './components/learnplaceComponent/QrCodeScannerPage.tsx';
import { LearnplacesPage } from './components/LearnplacesPage.tsx';
import {AuthCallback} from './components/AuthCallback.tsx';
import {DownloadedLearnplaces} from './components/DownloadedLearnplaces.tsx';
import {useEffect} from 'react';
import {initializeAuth} from './state/auth/authSlice.ts';
import useGeolocation from './utils/geolocation.ts';
import { checkServerHealth, setOnlineStatus } from './state/health/healthSlice';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const loading = useSelector((state: RootState) => state.auth.loading);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [navigate, dispatch]);

  useEffect(() => {
    const updateOnlineStatus = () => {
      dispatch(setOnlineStatus(navigator.onLine));
      if (navigator.onLine) {
        dispatch(checkServerHealth());
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    dispatch(checkServerHealth());

    let countdown = 60;

    // Debug Countdown Logger
    const countdownId = setInterval(() => {
      if (countdown % 10 === 0) {
        console.log(`[Health Check] Next check in ${countdown} seconds`);
      }
      countdown--;
      if (countdown < 0) countdown = 60;
    }, 1000);


    // Periodischer Check
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        dispatch(checkServerHealth());
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [dispatch]);

  useGeolocation(isAuthenticated);

  if (loading) {
    return null;
  }

  // redirect to learnplace url after login
  if (!isAuthenticated && location.pathname.startsWith('/lernort/')) {
    localStorage.setItem('targetUrl', location.pathname);
  }
  const targetUrl = localStorage.getItem('targetUrl');
  if (isAuthenticated && targetUrl) {
    localStorage.removeItem('targetUrl');
    navigate(targetUrl, {replace: true});
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="auth_callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<StartPage />} />
          <Route path="logout" element={<Logout />} />
          <Route path="lernorte" element={<LearnplacesPage />} />
          <Route path="how-to" element={<HowToPage />} />
          <Route path="scanner" element={<QrCodeScannerPage />} />
          <Route path="downloads" element={<DownloadedLearnplaces />} />
          <Route path="lernort/:id" element={<LearnplacePage />} />
          <Route path="lernort/:id/map" element={<MapPage />} />
        </Route>
      </Routes>
      <OfflineMessage />
    </div>
  )
}

export default App;
