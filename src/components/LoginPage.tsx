import {Navigate} from 'react-router-dom';
import {Header} from './Header.tsx';
import {useSelector} from 'react-redux';
import {RootState} from '../state/store.ts';
import bgImage from '../assets/images/bg.svg';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const LoginPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogin = () => {
    // todo
    //   - redirect_uri
    //   - code_challenge
    //   - state
    //  code_verifier zwischenspeichern
    window.location.href = `${apiBaseUrl}/auth`;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Header />
      <main>
        <div className="main-wrapper">
          <div className="login-wrapper" style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center 80px',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            backgroundImage: `url(${bgImage})`,
          }}>
            <button className="btn btn-login" onClick={handleLogin}>Login</button>
          </div>
        </div>
      </main>
    </>
  );
}
