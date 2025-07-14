import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const HEALTH_CHECK_INTERVAL = 60000;
const TIMEOUT = 10000;

interface HealthState {
    serverReachable: boolean;
    lastCheckTime: number;
    isOnline: boolean;
}

const initialState: HealthState = {
    serverReachable: true,
    lastCheckTime: 0,
    isOnline: navigator.onLine
};

export const checkServerHealth = createAsyncThunk(
    'health/checkServerHealth',
    async (_, { getState }) => {
        const state = getState() as RootState;
        const now = Date.now();
        const timeSinceLastCheck = now - state.health.lastCheckTime;

        if (timeSinceLastCheck < HEALTH_CHECK_INTERVAL) {
            return state.health.serverReachable;
        }

        console.log('[Health Check] Starting server health check...');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(new Error('[Health Check] Timeout after ' + (10000 / 1000) + ' seconds')), TIMEOUT);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
                headers: {
                    Authorization: `Bearer ${state.auth.accessToken}`
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('[Health Check] Server not reachable');
            }

            console.log('[Health Check] Server health check successful');

            return response.ok;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            return false;
        }
    }
);

const healthSlice = createSlice({
    name: 'health',
    initialState,
    reducers: {
        setOnlineStatus: (state, action) => {
            state.isOnline = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkServerHealth.fulfilled, (state, action) => {
                state.serverReachable = action.payload;
                state.lastCheckTime = Date.now();
            });
    }
});

export const { setOnlineStatus } = healthSlice.actions;
export const selectHealth = (state: RootState) => state.health;

export default healthSlice.reducer;