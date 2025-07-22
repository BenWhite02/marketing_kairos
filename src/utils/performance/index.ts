// src/utils/performance/index.ts
/**
 * Performance Optimization Module
 * Central exports for all performance optimization utilities
 */

// Bundle Analysis
export {
  bundleAnalysisConfig,
  getBundleAnalyzerPlugin,
  analyzeBundleMetrics,
  BUNDLE_SIZE_LIMITS,
  checkBundleSizeLimits,
  formatBytes,
  getBundleOptimizationRecommendations,
  type BundleAnalysisConfig,
  type BundleSizeMetrics
} from './bundleAnalyzer';

// Lazy Loading
export {
  withLazyLoading,
  preloadRoute,
  preloadCriticalRoutes,
  loadComponentDynamically,
  useLazyComponent,
  BUNDLE_STRATEGY,
  trackLazyLoadingPerformance,
  // Lazy-loaded components
  DashboardPage,
  AtomsPage,
  AtomComposerPage,
  MomentsPage,
  MomentsListPage,
  MomentBuilderPage,
  CampaignsPage,
  AnalyticsPage,
  TestingPage,
  IntegrationsPage,
  LoginPage,
  // Lazy-loaded business components
  AnalyticsDashboard,
  LineChart,
  BarChart,
  PieChart,
  FunnelChart,
  CampaignBuilder,
  JourneyCanvas,
  ExperimentBuilder,
  IntegrationsDashboard
} from './lazyRoutes';

// Virtual Scrolling
export {
  VirtualList,
  VirtualGrid,
  VirtualTable,
  useVirtualScrollingPerformance,
  type VirtualListProps,
  type VirtualGridProps,
  type VirtualTableProps,
  type VirtualTableColumn
} from '../components/performance/VirtualScrolling/VirtualList';

export {
  useVirtualScrolling,
  useDynamicVirtualScrolling,
  useSmoothVirtualScrolling,
  useInfiniteVirtualScrolling,
  type VirtualScrollingOptions,
  type VirtualScrollingReturn
} from '../components/performance/VirtualScrolling/useVirtualScrolling';

// Memory Management
export {
  getMemoryInfo,
  MEMORY_THRESHOLDS,
  useMemoryMonitoring,
  CleanupManager,
  useCleanupManager,
  useSafeEventListener,
  useSafeInterval,
  useSafeTimeout,
  useSafeFetch,
  MemoryOptimizer,
  MemoryLeakDetector,
  type MemoryInfo
} from './memoryManagement';

// Caching Strategies
export {
  AdvancedCache,
  QueryCache,
  useQueryCache,
  useStateCache,
  ImageCache,
  ServiceWorkerCache,
  CacheManager,
  type CacheEntry,
  type CacheConfig
} from './cachingStrategies';

// Performance Monitoring
export {
  PerformanceDashboard
} from '../components/performance/PerformanceMonitoring/PerformanceDashboard';

export {
  usePerformanceMonitoring,
  useComponentPerformance,
  withPerformanceTracking,
  usePerformanceBudget,
  type WebVitalsMetrics,
  type PerformanceMetrics,
  type PerformanceMonitoringOptions,
  type PerformanceMonitoringReturn
} from '../components/performance/PerformanceMonitoring/usePerformanceMonitoring';

/**
 * Performance Optimization Utilities
 */
export const PerformanceUtils = {
  // Bundle optimization
  analyzeBundle: getBundleOptimizationRecommendations,
  formatFileSize: formatBytes,
  
  // Memory optimization
  forceGC: MemoryOptimizer.forceGarbageCollection,
  clearLargeObjects: MemoryOptimizer.clearLargeObjects,
  optimizeArray: MemoryOptimizer.optimizeArray,
  
  // Cache optimization
  clearAllCaches: () => CacheManager.clearAll(),
  getCacheStats: () => CacheManager.getStats(),
  
  // Performance tracking
  trackRender: (componentName: string, renderTime: number) => {
    if (renderTime > 16) {
      console.warn(`[Performance] Slow render: ${componentName} (${renderTime.toFixed(2)}ms)`);
    }
  },
  
  // Lazy loading helpers
  preloadComponents: preloadCriticalRoutes,
  trackLazyLoad: trackLazyLoadingPerformance
};

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONFIG = {
  // Bundle size limits
  BUNDLE_LIMITS: BUNDLE_SIZE_LIMITS,
  
  // Memory thresholds
  MEMORY_LIMITS: MEMORY_THRESHOLDS,
  
  // Performance budgets
  PERFORMANCE_BUDGETS: {
    RENDER_TIME: 16, // 16ms for 60fps
    BUNDLE_SIZE: 2 * 1024 * 1024, // 2MB
    MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
    CACHE_HIT_RATE: 0.8, // 80%
    LCP_THRESHOLD: 2500, // 2.5s
    FID_THRESHOLD: 100, // 100ms
    CLS_THRESHOLD: 0.1 // 0.1
  },
  
  // Cache settings
  CACHE_CONFIG: {
    QUERY_CACHE_SIZE: 500,
    QUERY_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    IMAGE_CACHE_SIZE: 100,
    STATE_CACHE_TTL: 30 * 60 * 1000 // 30 minutes
  },
  
  // Virtual scrolling settings
  VIRTUAL_SCROLL_CONFIG: {
    DEFAULT_ITEM_HEIGHT: 50,
    DEFAULT_OVERSCAN: 5,
    LARGE_LIST_THRESHOLD: 1000
  }
};

/**
 * Performance initialization function
 */
export const initializePerformanceOptimization = (config?: {
  enableMonitoring?: boolean;
  enableCaching?: boolean;
  enableLazyLoading?: boolean;
  enableVirtualScrolling?: boolean;
}) => {
  const {
    enableMonitoring = true,
    enableCaching = true,
    enableLazyLoading = true,
    enableVirtualScrolling = true
  } = config || {};

  console.log('[Performance] Initializing optimization features...');

  if (enableMonitoring) {
    // Start memory leak detection
    MemoryLeakDetector.getInstance().startMonitoring();
    console.log('[Performance] Memory leak detection started');
  }

  if (enableCaching) {
    // Start cache monitoring
    CacheManager.startMonitoring();
    console.log('[Performance] Cache monitoring started');
  }

  if (enableLazyLoading) {
    // Preload critical routes
    preloadCriticalRoutes();
    console.log('[Performance] Critical routes preloaded');
  }

  if (enableVirtualScrolling) {
    console.log('[Performance] Virtual scrolling ready for large lists');
  }

  // Register performance observer for Core Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('[Performance] Core Web Vitals:', entry.name, entry.value || entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('[Performance] Failed to initialize Core Web Vitals observer:', error);
    }
  }

  console.log('[Performance] Optimization initialization complete');
};

/**
 * Performance debugging utilities
 */
export const PerformanceDebugger = {
  // Log current performance state
  logPerformanceState: () => {
    const memoryInfo = getMemoryInfo();
    const cacheStats = CacheManager.getStats();
    
    console.group('[Performance] Current State');
    console.log('Memory:', memoryInfo);
    console.log('Cache:', cacheStats);
    console.log('Bundle Config:', PERFORMANCE_CONFIG);
    console.groupEnd();
  },
  
  // Stress test memory
  stressTestMemory: (iterations: number = 1000) => {
    console.log(`[Performance] Starting memory stress test (${iterations} iterations)...`);
    const startMemory = getMemoryInfo();
    
    const largeArrays = [];
    for (let i = 0; i < iterations; i++) {
      largeArrays.push(new Array(1000).fill(Math.random()));
    }
    
    const endMemory = getMemoryInfo();
    console.log('[Performance] Memory stress test complete');
    console.log('Memory before:', startMemory);
    console.log('Memory after:', endMemory);
    
    // Clean up
    largeArrays.length = 0;
    if ('gc' in window) (window as any).gc();
  },
  
  // Test cache performance
  testCachePerformance: async (operations: number = 1000) => {
    console.log(`[Performance] Testing cache performance (${operations} operations)...`);
    const cache = new AdvancedCache<string>();
    
    const startTime = performance.now();
    
    // Write operations
    for (let i = 0; i < operations; i++) {
      cache.set(`key_${i}`, `value_${i}`);
    }
    
    // Read operations
    for (let i = 0; i < operations; i++) {
      cache.get(`key_${i}`);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] Cache test complete: ${duration.toFixed(2)}ms for ${operations * 2} operations`);
    console.log(`[Performance] Average operation time: ${(duration / (operations * 2)).toFixed(4)}ms`);
    console.log('[Performance] Cache stats:', cache.getStats());
  }
};

// Export everything as default for convenience
export default {
  PerformanceUtils,
  PERFORMANCE_CONFIG,
  initializePerformanceOptimization,
  PerformanceDebugger
};