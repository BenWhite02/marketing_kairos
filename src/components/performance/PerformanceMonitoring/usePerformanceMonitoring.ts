// src/components/performance/PerformanceMonitoring/usePerformanceMonitoring.ts
/**
 * Performance Monitoring Hook
 * React hook for comprehensive performance tracking
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebVitalsMetrics {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

export interface PerformanceMetrics {
  componentCount: number;
  rerenderCount: number;
  averageRenderTime: number;
  slowRenderCount: number;
  totalRenderTime: number;
  memoryLeaks: number;
  cacheHitRate: number;
}

export interface PerformanceMonitoringOptions {
  interval?: number;
  trackWebVitals?: boolean;
  trackRenders?: boolean;
  slowRenderThreshold?: number;
}

export interface PerformanceMonitoringReturn {
  metrics: PerformanceMetrics | null;
  webVitals: WebVitalsMetrics | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetMetrics: () => void;
  trackComponentRender: (componentName: string, renderTime: number) => void;
}

export const usePerformanceMonitoring = (
  options: PerformanceMonitoringOptions = {}
): PerformanceMonitoringReturn => {
  const {
    interval = 5000,
    trackWebVitals = true,
    trackRenders = true,
    slowRenderThreshold = 16 // 16ms for 60fps
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout>();
  const renderTimes = useRef<number[]>([]);
  const componentRenders = useRef<Map<string, number[]>>(new Map());
  const slowRenders = useRef<number>(0);
  const webVitalsRef = useRef<Partial<WebVitalsMetrics>>({});

  // Web Vitals measurement
  const measureWebVitals = useCallback(() => {
    if (!trackWebVitals || typeof window === 'undefined') return;

    // Measure using Performance Observer API
    try {
      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            webVitalsRef.current.LCP = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-input') {
              webVitalsRef.current.FID = (entry as any).processingStart - entry.startTime;
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          webVitalsRef.current.CLS = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              webVitalsRef.current.FCP = entry.startTime;
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      }

      // Time to First Byte (from Navigation Timing)
      if ('navigation' in performance && (performance as any).navigation) {
        const navigation = (performance as any).getEntriesByType('navigation')[0];
        if (navigation) {
          webVitalsRef.current.TTFB = navigation.responseStart - navigation.requestStart;
        }
      }
    } catch (error) {
      console.warn('[Performance] Web Vitals measurement failed:', error);
    }
  }, [trackWebVitals]);

  // Initialize Web Vitals measurement
  useEffect(() => {
    if (trackWebVitals) {
      measureWebVitals();
    }
  }, [measureWebVitals, trackWebVitals]);

  // Track component render
  const trackComponentRender = useCallback((componentName: string, renderTime: number) => {
    if (!trackRenders) return;

    renderTimes.current.push(renderTime);
    
    // Track per-component renders
    if (!componentRenders.current.has(componentName)) {
      componentRenders.current.set(componentName, []);
    }
    componentRenders.current.get(componentName)!.push(renderTime);

    // Count slow renders
    if (renderTime > slowRenderThreshold) {
      slowRenders.current++;
    }

    // Keep only last 100 render times to prevent memory leaks
    if (renderTimes.current.length > 100) {
      renderTimes.current = renderTimes.current.slice(-100);
    }
  }, [trackRenders, slowRenderThreshold]);

  // Calculate metrics
  const calculateMetrics = useCallback((): PerformanceMetrics => {
    const renders = renderTimes.current;
    const totalRenderTime = renders.reduce((sum, time) => sum + time, 0);
    const averageRenderTime = renders.length > 0 ? totalRenderTime / renders.length : 0;

    return {
      componentCount: componentRenders.current.size,
      rerenderCount: renders.length,
      averageRenderTime,
      slowRenderCount: slowRenders.current,
      totalRenderTime,
      memoryLeaks: 0, // This would be calculated by memory monitoring
      cacheHitRate: 0 // This would be provided by cache monitoring
    };
  }, []);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const newMetrics = calculateMetrics();
    setMetrics(newMetrics);

    // Update web vitals
    const currentWebVitals = { ...webVitalsRef.current };
    if (Object.keys(currentWebVitals).length > 0) {
      setWebVitals(currentWebVitals as WebVitalsMetrics);
    }
  }, [calculateMetrics]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    intervalRef.current = setInterval(updateMetrics, interval);
    
    // Initial measurement
    updateMetrics();
  }, [isMonitoring, updateMetrics, interval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, [isMonitoring]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    renderTimes.current = [];
    componentRenders.current.clear();
    slowRenders.current = 0;
    webVitalsRef.current = {};
    setMetrics(null);
    setWebVitals(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    metrics,
    webVitals,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    trackComponentRender
  };
};

/**
 * Hook for tracking individual component performance
 */
export const useComponentPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const totalRenderTime = useRef<number>(0);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current++;
    totalRenderTime.current += renderTime;

    // Log slow renders
    if (renderTime > 16) {
      console.warn(`[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  }, [componentName]);

  const getStats = useCallback(() => {
    return {
      renderCount: renderCount.current,
      totalRenderTime: totalRenderTime.current,
      averageRenderTime: renderCount.current > 0 
        ? totalRenderTime.current / renderCount.current 
        : 0
    };
  }, []);

  const resetStats = useCallback(() => {
    renderCount.current = 0;
    totalRenderTime.current = 0;
  }, []);

  return {
    startRender,
    endRender,
    getStats,
    resetStats
  };
};

/**
 * Higher-order component for automatic performance tracking
 */
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { startRender, endRender } = useComponentPerformance(
      componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown'
    );

    useEffect(() => {
      startRender();
      return () => {
        endRender();
      };
    });

    return <WrappedComponent {...props} ref={ref} />;
  });
};

/**
 * Hook for performance budgets
 */
export const usePerformanceBudget = (budgets: {
  renderTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
}) => {
  const [violations, setViolations] = useState<string[]>([]);

  const checkBudget = useCallback((metrics: {
    renderTime?: number;
    bundleSize?: number;
    memoryUsage?: number;
  }) => {
    const newViolations: string[] = [];

    if (budgets.renderTime && metrics.renderTime && metrics.renderTime > budgets.renderTime) {
      newViolations.push(`Render time budget exceeded: ${metrics.renderTime.toFixed(2)}ms > ${budgets.renderTime}ms`);
    }

    if (budgets.bundleSize && metrics.bundleSize && metrics.bundleSize > budgets.bundleSize) {
      newViolations.push(`Bundle size budget exceeded: ${(metrics.bundleSize / 1024 / 1024).toFixed(2)}MB > ${(budgets.bundleSize / 1024 / 1024).toFixed(2)}MB`);
    }

    if (budgets.memoryUsage && metrics.memoryUsage && metrics.memoryUsage > budgets.memoryUsage) {
      newViolations.push(`Memory usage budget exceeded: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB > ${(budgets.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    setViolations(newViolations);

    // Log violations
    if (newViolations.length > 0) {
      console.warn('[Performance Budget] Violations detected:', newViolations);
    }

    return newViolations.length === 0;
  }, [budgets]);

  return {
    violations,
    checkBudget,
    isWithinBudget: violations.length === 0
  };
};