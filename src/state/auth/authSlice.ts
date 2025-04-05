import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import { getIndexedDBData, setIndexedDBData, deleteIndexedDBData } from '../../utils/Database';

const ACCESS_TOKEN = 'access_token';

interface IsAuthenticatedState {
  isAuthenticated: boolean;
  accessToken: string | null;
  loading: boolean;
}

const initialState: IsAuthenticatedState = {
  isAuthenticated: false,
  accessToken: null,
  loading: true,
};

export const initializeAuth = createAsyncThunk<string | null>('auth/initializeAuth', async () => {
  const accessToken = await getIndexedDBData(ACCESS_TOKEN);
  return accessToken || null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      const accessToken = action.payload;
      state.isAuthenticated = true;
      state.accessToken = accessToken;
      setIndexedDBData(ACCESS_TOKEN, accessToken);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      deleteIndexedDBData(ACCESS_TOKEN);
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      const accessToken = action.payload;
      state.accessToken = accessToken;
      setIndexedDBData(ACCESS_TOKEN, accessToken);
    },
  },
  extraReducers(builder) {
    builder.addCase(initializeAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action: PayloadAction<string | null>) => {
      const token = action.payload;
      state.accessToken = token;
      state.isAuthenticated = !!token;
      state.loading = false;
    });
    builder.addCase(initializeAuth.rejected, (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
    });
  },
});

export const {login, logout, setAccessToken} = authSlice.actions;
export default authSlice.reducer;