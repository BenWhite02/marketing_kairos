// src/utils/mobile/mobileOptimizations.ts
import { useEffect, useRef, useCallback } from 'react';

/**
 * Mobile Performance Optimization Utilities
 */

// Viewport utilities
export const useViewportHeight = () => {
  const setVH = useCallback(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, []);

  useEffect(() => {
    setVH();
    
    const handleResize = () => {
      requestAnimationFrame(setVH);
    };

    const handleOrientationChange = () => {
      setTimeout(setVH, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [setVH]);
};

// Safe area utilities
export const useSafeArea = () => {
  useEffect(() => {
    const updateSafeAreas = () => {
      const safeAreaTop = getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-top)') || '0px';
      const safeAreaBottom = getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-bottom)') || '0px';
      const safeAreaLeft = getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-left)') || '0px';
      const safeAreaRight = getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-right)') || '0px';

      document.documentElement.style.setProperty('--sat', safeAreaTop);
      document.documentElement.style.setProperty('--sab', safeAreaBottom);
      document.documentElement.style.setProperty('--sal', safeAreaLeft);
      document.documentElement.style.setProperty('--sar', safeAreaRight);
    };

    updateSafeAreas();
    window.addEventListener('resize', updateSafeAreas);
    window.addEventListener('orientationchange', updateSafeAreas);

    return () => {
      window.removeEventListener('resize', updateSafeAreas);
      window.removeEventListener('orientationchange', updateSafeAreas);
    };
  }, []);
};

// Touch scroll optimization
export const useTouchScroll = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleTouchStart = () => {
      isScrolling = true;
      element.style.webkitOverflowScrolling = 'touch';
    };

    const handleTouchEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        element.style.webkitOverflowScrolling = 'auto';
      }, 100);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(scrollTimeout);
    };
  }, [ref]);
};

// Image lazy loading with intersection observer
export const useLazyImage = () => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            const src = target.dataset.src;
            if (src) {
              target.src = src;
              target.removeAttribute('data-src');
              observer.unobserve(target);
            }
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, []);

  return imgRef;
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024;
      const limit = memory.jsHeapSizeLimit / 1024 / 1024;
      const percentage = (used / limit) * 100;

      if (percentage > 80) {
        console.warn(`Memory usage high: ${used.toFixed(1)}MB (${percentage.toFixed(1)}%)`);
        
        // Trigger garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    };

    const interval = setInterval(checkMemory, 30000);
    return () => clearInterval(interval);
  }, []);
};

// Device capability detection
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    touchSupport: false,
    hasHover: false,
    prefersReducedMotion: false,
    isDarkMode: false,
    isLowBandwidth: false,
    deviceMemory: 0,
    hardwareConcurrency: 0
  });

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHover: window.matchMedia('(hover: hover)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        isLowBandwidth: 'connection' in navigator && 
          ['slow-2g', '2g'].includes((navigator as any).connection.effectiveType),
        deviceMemory: (navigator as any).deviceMemory || 0,
        hardwareConcurrency: navigator.hardwareConcurrency || 0
      });
    };

    updateCapabilities();

    // Listen for media query changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    const handleChange = () => updateCapabilities();

    darkModeQuery.addEventListener('change', handleChange);
    reducedMotionQuery.addEventListener('change', handleChange);
    hoverQuery.addEventListener('change', handleChange);

    // Listen for network changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleChange);
    }

    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
      reducedMotionQuery.removeEventListener('change', handleChange);
      hoverQuery.removeEventListener('change', handleChange);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleChange);
      }
    };
  }, []);

  return capabilities;
};

// Adaptive loading based on device capabilities
export const useAdaptiveLoading = () => {
  const capabilities = useDeviceCapabilities();
  
  const shouldLazyLoad = useCallback((priority: 'high' | 'medium' | 'low' = 'medium') => {
    // Always lazy load on low memory devices
    if (capabilities.deviceMemory <= 2) return true;
    
    // Consider network conditions
    if (capabilities.isLowBandwidth && priority === 'low') return true;
    
    // Respect reduced motion preferences
    if (capabilities.prefersReducedMotion && priority === 'low') return true;
    
    return false;
  }, [capabilities]);

  const getImageQuality = useCallback(() => {
    if (capabilities.isLowBandwidth || capabilities.deviceMemory <= 2) {
      return 0.6; // Lower quality for constrained devices
    }
    return 0.8; // Standard quality
  }, [capabilities]);

  const shouldUseWebP = useCallback(() => {
    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  return {
    shouldLazyLoad,
    getImageQuality,
    shouldUseWebP,
    capabilities
  };
};

// CSS optimization utilities
export const cssOptimizations = {
  // Reduce motion for accessibility
  getMotionPreference: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Apply performance-oriented CSS
  applyOptimizations: () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Smooth scrolling optimization */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      input, textarea, [contenteditable] {
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
        user-select: auto;
      }

      /* Hardware acceleration for animations */
      .animate {
        will-change: transform;
        transform: translateZ(0);
      }

      /* Optimized scrolling */
      .scroll-container {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        overscroll-behavior: contain;
      }

      /* Safe area support */
      .safe-area-top {
        padding-top: env(safe-area-inset-top);
      }
      
      .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
      
      .safe-area-inset {
        padding: env(safe-area-inset-top) env(safe-area-inset-right) 
                 env(safe-area-inset-bottom) env(safe-area-inset-left);
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* Touch manipulation */
      .touch-manipulation {
        touch-action: manipulation;
      }

      /* Performance optimizations */
      .gpu-accelerated {
        transform: translateZ(0);
        will-change: transform;
      }

      .contain-layout {
        contain: layout;
      }

      .contain-paint {
        contain: paint;
      }

      .contain-strict {
        contain: strict;
      }
    `;
    
    document.head.appendChild(style);
  }
};

// Performance budget monitoring
export const usePerformanceBudget = () => {
  useEffect(() => {
    const monitorPerformance = () => {
      // Check Core Web Vitals
      if ('web-vitals' in window) {
        // This would typically use the web-vitals library
        console.log('Monitoring Core Web Vitals...');
      }

      // Monitor bundle size
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const transferSize = navTiming.transferSize || 0;
        const budgetKB = 500; // 500KB budget
        
        if (transferSize > budgetKB * 1024) {
          console.warn(`Bundle size exceeds budget: ${(transferSize / 1024).toFixed(1)}KB > ${budgetKB}KB`);
        }
      }

      // Monitor memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const budgetMB = 50; // 50MB budget
        
        if (usedMB > budgetMB) {
          console.warn(`Memory usage exceeds budget: ${usedMB.toFixed(1)}MB > ${budgetMB}MB`);
        }
      }
    };

    // Monitor on page load and periodically
    monitorPerformance();
    const interval = setInterval(monitorPerformance, 60000);
    
    return () => clearInterval(interval);
  }, []);
};

// Utility functions
export const mobileUtils = {
  // Check if device is mobile
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if device is iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  // Check if device is Android
  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  // Get device pixel ratio
  getPixelRatio: () => {
    return window.devicePixelRatio || 1;
  },

  // Get viewport dimensions
  getViewport: () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight
    };
  },

  // Disable zoom on double tap
  disableZoom: () => {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  },

  // Add iOS momentum scrolling
  addMomentumScrolling: (element: HTMLElement) => {
    element.style.webkitOverflowScrolling = 'touch';
    element.style.overflowScrolling = 'touch';
  }
};