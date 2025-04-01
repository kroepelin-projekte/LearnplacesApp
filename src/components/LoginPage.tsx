import {Navigate} from 'react-router-dom';
import {Header} from './Header.tsx';
import {useSelector} from 'react-redux';
import {RootState} from '../state/store.ts';
import bgImage from '../assets/images/bg.svg';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {generatePkcePair, urlBase64Encode, generateState} from '../utils/OAuth.ts';

export const LoginPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleOAuthLogin = async () => {
    try {
      // Generate PKCE (Code Verifier and Code Challenge)
      const { codeVerifier, codeChallenge } = await generatePkcePair();

      // Store the Code Verifier in storage
      sessionStorage.setItem('pkce_code_verifier', codeVerifier);

      const state = generateState();

      // Encode the Redirect URI
      const redirect_uri = urlBase64Encode(`${window.location.protocol}//${window.location.host}/auth_callback`);

      // Redirect the user to the authentication page with PKCE Code Challenge and Redirect URI
      window.location.href = `${apiBaseUrl}/auth?redirect_uri=${redirect_uri}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;
    } catch (err) {
      console.error('Error during login:', err);
    }
  };

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
            <button className="btn btn-login" onClick={handleOAuthLogin}>Login</button>
          </div>
        </div>
      </main>
    </>
  );
}
