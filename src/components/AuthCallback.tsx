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
      })
    })
      .then(res => res.json())
      .then((data) => {
        console.log('JWT: ?? ', data);

        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');

        dispatch(login('test'));
        navigate('/', {replace: true});
      })
      .catch(err => {
        console.log(err);
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');
      });
  }, [dispatch, navigate]);

  return (
    <div>AuthCallback Page</div>
  );
}
