import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove initial loading screen
window.__removeLoader?.();

declare global {
  interface Window {
    __removeLoader?: () => void;
  }
}
