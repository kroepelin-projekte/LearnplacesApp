import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import containersReducer from './containers/containersSlice';
import learnplacesReducer from './learnplaces/learnplacesSlice';
import geolocation from './map/geolocationSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    containers: containersReducer,
    learnplaces: learnplacesReducer,
    geolocation: geolocation,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
