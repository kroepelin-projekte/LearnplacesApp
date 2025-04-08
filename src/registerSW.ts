import {Workbox} from 'workbox-window';

export const registerSW = () => {
  if ("serviceWorker" in navigator) {
    const wb = new Workbox("/sw.js");

    wb.addEventListener("controlling", () => {
      window.location.reload();
    });

    wb.register()
      .catch((err) => console.log('SW-Registrierung fehlgeschlagen:', err));
  }
}