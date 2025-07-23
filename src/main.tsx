// File: src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Performance monitoring
if (import.meta.env.DEV) {
  // Add development error handling
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
  });
  
  window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
  });
}

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('🚨 CRITICAL: Root element not found! Please check your index.html file.');
  throw new Error('Root element not found. Please check your index.html file.');
}

// Log React initialization
console.log('🚀 REACT INIT: Starting Kairos React application...');
console.log('📍 Root element found:', rootElement);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔗 Base URL:', import.meta.env.BASE_URL);

// Create React root and render app
const root = ReactDOM.createRoot(rootElement);

// Render with error boundary
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Signal successful React app load
  setTimeout(() => {
    console.log('✅ REACT SUCCESS: App rendered successfully!');
    
    // Signal to loading screen that React has taken over
    if (typeof window.markAppLoaded === 'function') {
      window.markAppLoaded();
    }
    
    // Additional success indicators
    console.log('🎉 REACT READY: Kairos is ready for user interaction');
    console.log('🔄 ROUTING: React Router should now handle all navigation');
    
    // Check if we're redirecting from emergency HTML
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'emergency') {
      console.log('🔄 EMERGENCY REDIRECT SUCCESS: User successfully switched from HTML to React');
    }
    
  }, 100); // Small delay to ensure rendering is complete
  
} catch (error) {
  console.error('🚨 REACT ERROR: Failed to render app:', error);
  
  // Show emergency fallback
  if (typeof window.handleEmergencyFallback === 'function') {
    window.handleEmergencyFallback();
  }
}

// Hot Module Replacement (HMR) for development
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept();
  
  // Log HMR updates
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('🔄 HMR: Updating modules...');
  });
  
  import.meta.hot.on('vite:afterUpdate', () => {
    console.log('✅ HMR: Modules updated successfully');
  });
}

// Service Worker registration for PWA features
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW: Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ SW: Service Worker registration failed:', error);
      });
  });
}

// Performance measurement
if (import.meta.env.DEV) {
  // Measure initial load time
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
        
        console.log(`⚡ PERFORMANCE: Page load time: ${loadTime.toFixed(2)}ms`);
        console.log(`⚡ PERFORMANCE: DOM ready time: ${domContentLoaded.toFixed(2)}ms`);
        
        // Warn if load time is too slow
        if (loadTime > 3000) {
          console.warn('⚠️ PERFORMANCE: Page load time is slower than 3 seconds. Consider optimization.');
        }
      }
    }, 0);
  });
}

// Emergency route handling for old HTML bookmarks
const handleLegacyRoutes = () => {
  const path = window.location.pathname;
  const search = window.location.search;
  
  // Handle old HTML routes
  if (path.includes('.html') || search.includes('emergency=true')) {
    console.log('🔄 LEGACY ROUTE: Detected old HTML route, redirecting to React equivalent...');
    
    // Map old routes to new React routes
    const routeMap: { [key: string]: string } = {
      '/dashboard.html': '/dashboard',
      '/emergency-login.html': '/login',
      '/login.html': '/login',
      '/index.html': '/dashboard',
    };
    
    const newRoute = routeMap[path] || '/dashboard';
    
    // Use replace to avoid adding to browser history
    window.history.replaceState({}, '', newRoute + '?from=legacy');
    
    console.log(`🔄 LEGACY REDIRECT: ${path} -> ${newRoute}`);
  }
};

// Run legacy route handling
handleLegacyRoutes();

// Global app info for debugging
if (import.meta.env.DEV) {
  (window as any).__KAIROS_DEBUG__ = {
    version: import.meta.env.VITE_APP_VERSION || 'dev',
    mode: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
    reactVersion: React.version,
    features: {
      strictMode: true,
      hmr: !!import.meta.hot,
      serviceWorker: 'serviceWorker' in navigator,
    },
  };
  
  console.log('🔧 DEBUG INFO:', (window as any).__KAIROS_DEBUG__);
}