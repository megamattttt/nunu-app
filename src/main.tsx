import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { GameProvider } from './state/store';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);

// Service worker : cache statique + navigation hors-ligne.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI).href).catch(() => {});
  });
}

// Empêche le double-tap-zoom iOS sans casser le scroll.
let lastTouch = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouch < 320) e.preventDefault();
  lastTouch = now;
}, { passive: false });
