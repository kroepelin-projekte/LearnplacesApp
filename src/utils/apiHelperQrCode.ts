import { store } from '../state/store'; // Pfad anpassen, wenn nötig
import { setAccessToken } from '../state/auth/authSlice';
import { AppDispatch } from '../state/store';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * Verifiziert einen QR-Code-Token mittels der API.
 * @param token string Der QR-Code-Token
 * @param dispatch AppDispatch Redux-Dispatch
 * @returns Promise<any> API-Antwort oder `false` im Fehlerfall
 */
export const fetchVerifyToken = async (token: string, dispatch: AppDispatch): Promise<any> => {
  const accessToken = store.getState().auth.accessToken;
  try {
    const response = await fetch(`${apiBaseUrl}/learnplaces/verifyqrcode/${token}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('[QR-Code] Failed to fetch learnplace: ' + response.statusText);
    }

    const newAccessToken = response.headers.get('Learnplaces_token');
    if (navigator.onLine && newAccessToken) {
      dispatch(setAccessToken(newAccessToken)); // Aktualisiere den Redux-Token
    }

    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.error('[QR-Code] Fetch error or offline.', error);
    return false;
  }
};