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
    const apiURL = `${apiBaseUrl}/containers/${containerId}`;
    const cacheName = 'tmp-learnplaces-cache';

    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;

      // 1. SCHNELLIGKEIT: Erst im Cache nachsehen
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(apiURL);

      let initialData = null;
      if (cachedResponse) {
        console.log('[Learnplaces] Found cached response for ' + apiURL);
        initialData = await cachedResponse.json();
        // Wir könnten hier theoretisch stoppen, aber wir wollen ja im Hintergrund aktualisieren
      }

      // 2. AKTUALISIERUNG: Netzwerk-Anfrage starten
      const fetchPromise = fetch(apiURL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(async (response) => {
        if (!response.ok) throw new Error('Network fail');

        const data = await response.json();
        const sorted = data.data.learn_places.sort((a: LearnplaceInterface, b: LearnplaceInterface) =>
          a.title.localeCompare(b.title)
        );

        // Cache für den nächsten Aufruf aktualisieren
        const cache = await caches.open(cacheName);
        await cache.put(apiURL, new Response(JSON.stringify(sorted)));

        console.log('[Learnplaces] Updated cache for ' + apiURL);
        return sorted;
      });

      // Wenn wir Daten im Cache haben, geben wir diese SOFORT zurück (Performance!)
      // Der Netzwerk-Fetch läuft im Hintergrund weiter und aktualisiert den Cache für später.
      if (initialData) {
        // Hinweis: Die UI zeigt jetzt alte Daten an, der Cache ist aber beim nächsten Klick/Refresh neu.
        return initialData;
      }

      // Wenn der Cache leer ist, müssen wir auf das Netzwerk warten
      return await fetchPromise;

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