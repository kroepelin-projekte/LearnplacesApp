import { store } from '../state/store'; // Pfad anpassen, wenn nötig
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const fetchVerifyToken = async (token: string): Promise<VerifyTokenResponse | false> => {
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

    const data: ApiResponse = await response.json();
    return data?.data;
  } catch (error) {
    console.error('[QR-Code] Fetch error or offline.', error);
    return false;
  }
};