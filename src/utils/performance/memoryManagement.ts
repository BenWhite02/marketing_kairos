// src/utils/performance/memoryManagement.ts
/**
 * Memory Management Utilities
 * Tools for preventing memory leaks and optimizing memory usage
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Memory monitoring interface
 */
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsagePercentage: number;
}

/**
 * Get current memory usage (Chrome only)
 */
export const getMemoryInfo = (): MemoryInfo | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      memoryUsagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
};

/**
 * Memory threshold warnings
 */
export const MEMORY_THRESHOLDS = {
  WARNING: 70, // 70% of heap limit
  CRITICAL: 85, // 85% of heap limit
  EMERGENCY: 95 // 95% of heap limit
};

/**
 * Memory monitoring hook
 */
export const useMemoryMonitoring = (
  interval: number = 5000,
  onWarning?: (info: MemoryInfo) => void,
  onCritical?: (info: MemoryInfo) => void
) => {
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastWarningTime = useRef<number>(0);

  const checkMemory = useCallback(() => {
    const memoryInfo = getMemoryInfo();
    if (!memoryInfo) return;

    const now = Date.now();
    const timeSinceLastWarning = now - lastWarningTime.current;

    if (memoryInfo.memoryUsagePercentage >= MEMORY_THRESHOLDS.CRITICAL && timeSinceLastWarning > 30000) {
      console.warn('[Memory] Critical memory usage:', memoryInfo);
      onCritical?.(memoryInfo);
      lastWarningTime.current = now;
    } else if (memoryInfo.memoryUsagePercentage >= MEMORY_THRESHOLDS.WARNING && timeSinceLastWarning > 60000) {
      console.warn('[Memory] High memory usage:', memoryInfo);
      onWarning?.(memoryInfo);
      lastWarningTime.current = now;
    }

    return memoryInfo;
  }, [onWarning, onCritical]);

  useEffect(() => {
    intervalRef.current = setInterval(checkMemory, interval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, checkMemory]);

  return { checkMemory, getMemoryInfo };
};

/**
 * Cleanup manager for preventing memory leaks
 */
export class CleanupManager {
  private cleanupFunctions: Array<() => void> = [];
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private eventListeners: Array<{
    element: Element | Window | Document;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = [];
  private abortControllers: Set<AbortController> = new Set();

  /**
   * Add a cleanup function
   */
  addCleanup(fn: () => void): void {
    this.cleanupFunctions.push(fn);
  }

  /**
   * Add a timeout that will be automatically cleared
   */
  setTimeout(fn: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      fn();
      this.timeouts.delete(timeout);
    }, delay);
    this.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Add an interval that will be automatically cleared
   */
  setInterval(fn: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(fn, delay);
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Add an event listener that will be automatically removed
   */
  addEventListener<K extends keyof WindowEventMap>(
    element: Window,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof DocumentEventMap>(
    element: Document,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof ElementEventMap>(
    element: Element,
    type: K,
    listener: (this: Element, ev: ElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options);
    this.eventListeners.push({ element, event, handler, options });
  }

  /**
   * Create an abort controller that will be automatically aborted
   */
  createAbortController(): AbortController {
    const controller = new AbortController();
    this.abortControllers.add(controller);
    return controller;
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    // Clear timeouts
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();

    // Clear intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventListeners = [];

    // Abort controllers
    this.abortControllers.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    this.abortControllers.clear();

    // Run custom cleanup functions
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('[CleanupManager] Error in cleanup function:', error);
      }
    });
    this.cleanupFunctions = [];
  }
}

/**
 * Hook for automatic cleanup management
 */
export const useCleanupManager = () => {
  const cleanupManager = useRef<CleanupManager>();

  if (!cleanupManager.current) {
    cleanupManager.current = new CleanupManager();
  }

  useEffect(() => {
    return () => {
      cleanupManager.current?.cleanup();
    };
  }, []);

  return cleanupManager.current;
};

/**
 * Hook for preventing memory leaks in event listeners
 */
export const useSafeEventListener = <K extends keyof WindowEventMap>(
  element: Window | null,
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void;
export const useSafeEventListener = <K extends keyof DocumentEventMap>(
  element: Document | null,
  event: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void;
export const useSafeEventListener = <K extends keyof ElementEventMap>(
  element: Element | null,
  event: K,
  handler: (event: ElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void;
export const useSafeEventListener = (
  element: Element | Window | Document | null,
  event: string,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);
  const cleanupManager = useCleanupManager();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => savedHandler.current(event);
    cleanupManager.addEventListener(element, event, eventListener, options);

    return () => {
      element.removeEventListener(event, eventListener, options);
    };
  }, [element, event, options, cleanupManager]);
};

/**
 * Hook for safe intervals
 */
export const useSafeInterval = (
  callback: () => void,
  delay: number | null,
  immediate: boolean = false
) => {
  const savedCallback = useRef(callback);
  const cleanupManager = useCleanupManager();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    if (immediate) {
      savedCallback.current();
    }

    const interval = cleanupManager.setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(interval);
  }, [delay, immediate, cleanupManager]);
};

/**
 * Hook for safe timeouts
 */
export const useSafeTimeout = (
  callback: () => void,
  delay: number | null
) => {
  const savedCallback = useRef(callback);
  const cleanupManager = useCleanupManager();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const timeout = cleanupManager.setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, cleanupManager]);
};

/**
 * Hook for safe fetch requests
 */
export const useSafeFetch = () => {
  const cleanupManager = useCleanupManager();

  const safeFetch = useCallback(async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const controller = cleanupManager.createAbortController();
    
    const response = await fetch(input, {
      ...init,
      signal: controller.signal
    });

    return response;
  }, [cleanupManager]);

  return { safeFetch };
};

/**
 * Memory optimization utilities
 */
export const MemoryOptimizer = {
  /**
   * Trigger garbage collection (Chrome only)
   */
  forceGarbageCollection: (): void => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  },

  /**
   * Clear large objects from memory
   */
  clearLargeObjects: (objects: any[]): void => {
    objects.forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          delete obj[key];
        });
      }
    });
  },

  /**
   * Optimize array memory usage
   */
  optimizeArray: <T>(array: T[], maxSize: number = 1000): T[] => {
    if (array.length > maxSize) {
      return array.slice(-maxSize);
    }
    return array;
  },

  /**
   * Deep freeze objects to prevent memory leaks
   */
  deepFreeze: <T>(obj: T): T => {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      const value = (obj as any)[prop];
      if (value && typeof value === 'object') {
        MemoryOptimizer.deepFreeze(value);
      }
    });
    return Object.freeze(obj);
  }
};

/**
 * Memory leak detector
 */
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private measurements: MemoryInfo[] = [];
  private isMonitoring = false;
  private intervalId?: NodeJS.Timeout;

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  startMonitoring(interval: number = 10000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      const memoryInfo = getMemoryInfo();
      if (memoryInfo) {
        this.measurements.push({
          ...memoryInfo,
          timestamp: Date.now()
        } as any);

        // Keep only last 100 measurements
        if (this.measurements.length > 100) {
          this.measurements = this.measurements.slice(-100);
        }

        this.detectLeaks();
      }
    }, interval);
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isMonitoring = false;
  }

  private detectLeaks(): void {
    if (this.measurements.length < 10) return;

    const recent = this.measurements.slice(-10);
    const trend = this.calculateTrend(recent.map(m => m.usedJSHeapSize));

    // If memory is consistently increasing
    if (trend > 1000000) { // 1MB increase trend
      console.warn('[Memory Leak] Potential memory leak detected. Memory usage trending upward:', {
        trend: `${(trend / 1024 / 1024).toFixed(2)}MB`,
        current: `${(recent[recent.length - 1].usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        percentage: `${recent[recent.length - 1].memoryUsagePercentage.toFixed(2)}%`
      });
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + index * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  getReport(): {
    measurements: MemoryInfo[];
    trend: number;
    isLeaking: boolean;
  } {
    const trend = this.measurements.length > 1 
      ? this.calculateTrend(this.measurements.map(m => m.usedJSHeapSize))
      : 0;

    return {
      measurements: [...this.measurements],
      trend,
      isLeaking: trend > 1000000 // 1MB increase trend
    };
  }
}