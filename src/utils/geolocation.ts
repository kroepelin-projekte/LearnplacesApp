import { useEffect } from 'react';
import { updatePosition, setError } from '../state/map/geolocationSlice.ts';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../state/store.ts'; // Passe den Slice-Pfad an

const useGeolocation = (isAuthenticated: boolean) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let watchId: number | null = null;

    if (isAuthenticated && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading } = position.coords;
          dispatch(updatePosition({ latitude, longitude, heading: heading ?? null }));
        },
        (error) => {
          dispatch(setError(error.message));
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isAuthenticated, dispatch]);
};

export default useGeolocation;