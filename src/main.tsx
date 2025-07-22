// File: C:\Marketing\kairos\src\main.tsx
// Kairos Application Entry Point
// Author: Sankhadeep Banerjee

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error boundary for development
if (import.meta.env.DEV) {
  // Add development error handling
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
}

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Please check your index.html file.');
}

// Create React root and render app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot Module Replacement (HMR) for development
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept();
}