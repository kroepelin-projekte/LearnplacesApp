import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
    connectionType: string;
    downloadSpeed: number;
    connectionInfo: string;
}

const initialState: NetworkState = {
    connectionType: 'unknown',
    downloadSpeed: 0,
    connectionInfo: 'Verbindungsstatus wird geprüft...'
};

const networkSlice = createSlice({
    name: 'network',
    initialState,
    reducers: {
        setConnectionInfo(state, action: PayloadAction<NetworkState>) {
            state.connectionType = action.payload.connectionType;
            state.downloadSpeed = action.payload.downloadSpeed;
            state.connectionInfo = action.payload.connectionInfo;
        }
    }
});

export const { setConnectionInfo } = networkSlice.actions;
export default networkSlice.reducer;
