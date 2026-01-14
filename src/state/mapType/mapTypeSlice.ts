import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MapType = 'tour' | 'collection';

interface MapTypeState {
  activeTab: MapType;
}

const initialState: MapTypeState = {
  activeTab: 'tour',
};

const mapTypeSlice = createSlice({
  name: 'mapType',
  initialState,
  reducers: {
    setMapType(state, action: PayloadAction<MapType>) {
      state.activeTab = action.payload;
    }
  }
});

export const { setMapType } = mapTypeSlice.actions;
export default mapTypeSlice.reducer;