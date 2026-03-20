import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import syncService from './services/syncService';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global Online/Offline Listeners
window.addEventListener('online', () => {
  console.log('App is online. Starting sync...');
  syncService.sync();
});

window.addEventListener('offline', () => {
  console.log('App is offline.');
});

// Initial sync check
if (navigator.onLine) {
  syncService.sync();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
