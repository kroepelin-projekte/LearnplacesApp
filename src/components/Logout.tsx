import { Navigate } from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../state/store.ts';
import {logout} from '../state/auth/authSlice.ts';
import {useEffect} from 'react';

export const Logout = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  return <Navigate to="/login" replace />;
}
