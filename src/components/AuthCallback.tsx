import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {login} from '../state/auth/authSlice.ts';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../state/store.ts';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const savedCodeVerifier = sessionStorage.getItem('pkce_code_verifier');
    const savedState = sessionStorage.getItem('pkce_state');

    if (!code || !state) {
      return;
    }

    if (!savedCodeVerifier || !savedState) {
      return;
    }

    fetch(`${apiBaseUrl}/token`, {
      method: 'POST',
      body: JSON.stringify({
        code_verifier: savedCodeVerifier,
        code: code,
        state: state
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Login failed: ');
        }
        const jwt = res.headers.get('Learnplaces_token');
        if (!jwt) {
          throw new Error('Login failed');
        }
        return res.json().then((data) => ({ jwt, data }));
      })
      .then(({ jwt, data }) => {
        if (!data.data.success) {
          throw new Error('Login failed');
        }
        dispatch(login(jwt));
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');
        navigate('/', {replace: true});
      })
      .catch(err => {
        console.log('Login Error: ', err);
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');
        navigate('/login?failed', {replace: true});
      });
  }, [dispatch, navigate]);

  return (
    <></>
  );
}
