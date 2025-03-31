import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const ACCESS_TOKEN = 'access_token';

interface IsAuthenticatedState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

const initialState: IsAuthenticatedState = {
  isAuthenticated: !! localStorage.getItem(ACCESS_TOKEN),
  accessToken: localStorage.getItem(ACCESS_TOKEN)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      const accessToken = action.payload;
      state.isAuthenticated = true;
      state.accessToken = accessToken;
      localStorage.setItem(ACCESS_TOKEN, accessToken);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      localStorage.removeItem(ACCESS_TOKEN);
    },
  },
});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;