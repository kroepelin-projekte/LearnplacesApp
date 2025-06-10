import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from '../store.ts';

// State-Definition
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  position: number[] | null;
  heading: number | null;
  error: string | null;
}

const initialState: GeolocationState = {
  latitude: null,
  longitude: null,
  position: null,
  heading: null,
  error: null,
};

// Slice-Definition
const geolocationSlice = createSlice({
  name: 'geolocation',
  initialState,
  reducers: {
    updatePosition: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number; heading: number | null }>
    ) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.position = [action.payload.latitude, action.payload.longitude];
      state.heading = action.payload.heading;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const getLatitude = (state: RootState) => state.geolocation.latitude;
export const getLongitude = (state: RootState) => state.geolocation.longitude;
export const getPosition = (state: RootState) => [state.geolocation.latitude, state.geolocation.longitude];
export const getHeading = (state: RootState) => state.geolocation.heading;

export const { updatePosition, setError } = geolocationSlice.actions;
export default geolocationSlice.reducer;