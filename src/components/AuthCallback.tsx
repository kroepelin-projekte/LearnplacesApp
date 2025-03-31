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
    const handleAuthCallback = () => {
      // todo
      //  POST Body:
      //   - code_verifier vom zwischengespeicherten
      //   - code von query params
      //   - state von query params
      fetch(`${apiBaseUrl}/token`, {
        method: 'POST',
      })
      .then(res => res.json())
      .then(() => {
        // todo save jwt
        dispatch(login('test'));
        navigate('/', {replace: true});
      });
    }

    handleAuthCallback();
  }, [dispatch, navigate]);

  return (
    <div>AuthCallback Page</div>
  );
}
