import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import containersReducer from './containers/containersSlice';
import learnplacesReducer from './learnplaces/learnplacesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    containers: containersReducer,
    learnplaces: learnplacesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
