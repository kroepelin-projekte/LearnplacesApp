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

    console.log('code', code);
    console.log('state', state);

    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

    console.log('codeVerifier', codeVerifier);

    // todo state vergleichen
    fetch(`${apiBaseUrl}/token`, {
      method: 'POST',
      body: JSON.stringify({
        code_verifier: codeVerifier,
        code: code,
        state: state
      })
    })
      .then(res => res.json())
      .then((data) => {
        // todo save jwt
        console.log('login---------->', data);
        dispatch(login('test'));
        navigate('/', {replace: true});
      });
  }, [dispatch, navigate]);

  return (
    <div>AuthCallback Page</div>
  );
}
