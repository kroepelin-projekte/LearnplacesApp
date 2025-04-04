import {Navigate, Route, Routes} from 'react-router-dom';
import {Layout} from './components/Layout.tsx';
import {useSelector} from 'react-redux';
import {RootState} from './state/store.ts';
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

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

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
          <Route path="lernort/:id" element={<LearnplacePage />} />
          <Route path="lernort/:id/map" element={<MapPage />} />
          <Route path="lernort/:id/scanner" element={<QrCodeScannerPage />} />
          <Route path="downloads" element={<DownloadedLearnplaces />} />
        </Route>
      </Routes>
      <OfflineMessage />
    </div>
  )
}

export default App;
