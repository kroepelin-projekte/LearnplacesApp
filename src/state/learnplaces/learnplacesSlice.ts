import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import { RootState } from '../store';



interface LearnplacesState {
  learnplaces: LearnplaceInterface[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LearnplacesState = {
  learnplaces: [],
  isLoading: false,
  error: null,
};

// Thunk to fetch learnplaces for a container
export const fetchLearnplaces = createAsyncThunk(
  'learnplaces/fetchLearnplaces',
  async (containerId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      const response = await fetch(`${apiBaseUrl}/containers/${containerId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch learnplaces');
      }

      const data = await response.json();
      return data.data.learn_places.sort((a: LearnplaceInterface, b: LearnplaceInterface) =>
        a.title.localeCompare(b.title)
      );
    } catch (error) {
      return rejectWithValue(error?.toString());
    }
  }
);

const learnplacesSlice = createSlice({
  name: 'learnplaces',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLearnplaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLearnplaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.learnplaces = action.payload;
      })
      .addCase(fetchLearnplaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const getLearnplaces = (state: RootState) => state.learnplaces.learnplaces;
export const getLearnplacesLoadingState = (state: RootState) => state.learnplaces.isLoading;

export default learnplacesSlice.reducer;