import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import {logout} from '../auth/authSlice.ts';
import { RootState } from '../store';

interface ContainerInterface {
  ref_id: number;
  title: string;
  tags: string[];
}

interface ContainersState {
  containers: ContainerInterface[];
  selectedContainer: number | null;
  selectedTag: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ContainersState = {
  containers: [],
  selectedContainer: null,
  selectedTag: null,
  searchQuery: '',
  isLoading: false,
  error: null,
};

// Thunk to fetch containers
export const fetchContainers = createAsyncThunk(
  'containers/fetchContainers',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      const response = await fetch(`${apiBaseUrl}/containers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          dispatch(logout());
          return rejectWithValue('Unauthorized');
        }
        return rejectWithValue('Failed to fetch containers');
      }

      const data = await response.json();

      return data.data.sort((a: ContainerInterface, b: ContainerInterface) => a.title.localeCompare(b.title));
    } catch (error) {
      return rejectWithValue(error?.toString());
    }
  }
);

const containersSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: {
    setSelectedContainer: (state, action: PayloadAction<number | null>) => {
      state.selectedContainer = action.payload;
    },
    setSelectedTag: (state, action: PayloadAction<string | null>) => {
      state.selectedTag = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContainers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.containers = action.payload;
        state.selectedContainer = action.payload.length > 0 ? action.payload[0].ref_id : null; // Wähle den ersten Container standardmäßig aus
      })
      .addCase(fetchContainers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedContainer, setSelectedTag, setSearchQuery } = containersSlice.actions;

export const getContainers = (state: RootState) => state.containers.containers;
export const getSelectedContainer = (state: RootState) => state.containers.selectedContainer;
export const getSelectedTag = (state: RootState) => state.containers.selectedTag;
export const getSearchQuery = (state: RootState) => state.containers.searchQuery;
export const getContainerLoadingState = (state: RootState) => state.containers.isLoading;

export default containersSlice.reducer;
