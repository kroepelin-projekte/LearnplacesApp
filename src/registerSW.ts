import {Workbox} from 'workbox-window';

export const registerSW = () => {
  if (import.meta.env.MODE === 'production' && "serviceWorker" in navigator) {
    const wb = new Workbox("/sw.js");

    wb.addEventListener("controlling", () => {
      window.location.reload();
    });

    wb.register()
      .catch((err) => console.log('SW-Registrierung fehlgeschlagen:', err));
  }
};
