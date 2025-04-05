//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './state/store.ts';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {
    const confirmed = confirm('New content is available. Refresh to display the latest version.');
    if (confirmed) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('Ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
