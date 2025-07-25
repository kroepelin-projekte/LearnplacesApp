import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './state/store.ts';
import { registerSW } from './registerSW.ts';
registerSW();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
