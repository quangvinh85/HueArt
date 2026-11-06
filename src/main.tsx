// Safeguard against third-party extension scripts attempting window.fetch assignment
(function() {
  try {
    const proto = window.Window ? Window.prototype : Object.getPrototypeOf(window);
    const nativeFetch = window.fetch;
    let customFetch = nativeFetch;

    const descriptor = {
      get() { return customFetch; },
      set(v: typeof fetch) { customFetch = v; },
      configurable: true,
      enumerable: true
    };

    try { Object.defineProperty(proto, 'fetch', descriptor); } catch {}
    try { Object.defineProperty(window, 'fetch', descriptor); } catch {}
  } catch {}
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
