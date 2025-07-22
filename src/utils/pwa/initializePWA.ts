// Main PWA initialization script
// src/utils/pwa/initializePWA.ts
export const initializePWA = () => {
  // Apply CSS optimizations
  cssOptimizations.applyOptimizations();

  // Initialize viewport handling
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => setTimeout(setVH, 100));

  // Disable zoom on mobile
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }

  // Service Worker registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully');
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  console.log('[PWA] Kairos PWA initialized successfully');
};