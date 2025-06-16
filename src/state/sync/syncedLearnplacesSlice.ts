import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface SyncedLearnplaceState {
  id: number;
  title: string;
  status: string;
}

interface SyncedLearnplacesState {
  learnplaces: SyncedLearnplaceState[];
  showOverlay: boolean;
}

const initialState: SyncedLearnplacesState = {
  learnplaces: [],
  showOverlay: false
};

const syncedLearnplacesSlice = createSlice({
  name: 'syncedLearnplaces',
  initialState,
  reducers: {
    setSyncedLearnplaces: (state, action: PayloadAction<SyncedLearnplaceState[]>) => {
      state.learnplaces = action.payload;
      state.showOverlay = action.payload.length > 0;
    },
    hideOverlay: (state) => {
      state.showOverlay = false;
    },
    clearSyncedLearnplaces: (state) => {
      state.learnplaces = [];
      state.showOverlay = false;
    }
  }
});

// Actions
export const {
  setSyncedLearnplaces,
  hideOverlay,
  clearSyncedLearnplaces
} = syncedLearnplacesSlice.actions;

// Selectors
export const getSyncedLearnplaces = (state: RootState) => state.sync.learnplaces;
export const getShowOverlay = (state: RootState) => state.sync.showOverlay;

export default syncedLearnplacesSlice.reducer;