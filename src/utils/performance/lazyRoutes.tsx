// src/utils/performance/lazyRoutes.tsx
/**
 * Lazy Loading Route Configuration
 * Strategic code splitting for optimal performance
 */

import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

/**
 * Loading Fallback Component
 */
const PageLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading page...' 
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-lg text-gray-600">{message}</p>
    </div>
  </div>
);

/**
 * Higher-order component for lazy loading with error boundary
 */
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallbackMessage?: string
) => {
  const LazyComponent = lazy(importFunc);
  
  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={<PageLoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

/**
 * Preload function for critical routes
 */
export const preloadRoute = (importFunc: () => Promise<any>): void => {
  // Preload on idle or after 2 seconds
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => importFunc());
  } else {
    setTimeout(() => importFunc(), 2000);
  }
};

/**
 * Strategic Lazy Loading Configuration
 */

// Core Pages (Load immediately)
export const DashboardPage = withLazyLoading(
  () => import('../../pages/DashboardPage'),
  'Loading dashboard...'
);

// Atoms Management (High priority)
export const AtomsPage = withLazyLoading(
  () => import('../../pages/atoms/AtomsPage'),
  'Loading atoms management...'
);

export const AtomComposerPage = withLazyLoading(
  () => import('../../pages/atoms/AtomComposerPage'),
  'Loading atom composer...'
);

// Moments Management (High priority)
export const MomentsPage = withLazyLoading(
  () => import('../../pages/moments/MomentsPage'),
  'Loading moments...'
);

export const MomentsListPage = withLazyLoading(
  () => import('../../pages/moments/MomentsListPage'),
  'Loading moments list...'
);

export const MomentBuilderPage = withLazyLoading(
  () => import('../../pages/moments/MomentBuilderPage'),
  'Loading moment builder...'
);

// Campaign Management (Medium priority)
export const CampaignsPage = withLazyLoading(
  () => import('../../pages/campaigns/CampaignsPage'),
  'Loading campaigns...'
);

// Analytics & Reporting (Medium priority)
export const AnalyticsPage = withLazyLoading(
  () => import('../../pages/analytics/AnalyticsPage'),
  'Loading analytics...'
);

// Testing & Experiments (Lower priority)
export const TestingPage = withLazyLoading(
  () => import('../../pages/testing/TestingPage'),
  'Loading testing suite...'
);

// Integrations (Lower priority)
export const IntegrationsPage = withLazyLoading(
  () => import('../../pages/integrations/IntegrationsPage'),
  'Loading integrations...'
);

// Authentication (Critical, but separate bundle)
export const LoginPage = withLazyLoading(
  () => import('../../pages/auth/LoginPage'),
  'Loading login...'
);

/**
 * Route Preloading Strategy
 */
export const preloadCriticalRoutes = (): void => {
  // Preload high-usage pages after initial load
  preloadRoute(() => import('../../pages/atoms/AtomsPage'));
  preloadRoute(() => import('../../pages/moments/MomentsPage'));
  preloadRoute(() => import('../../pages/analytics/AnalyticsPage'));
};

/**
 * Component-level lazy loading for heavy components
 */

// Heavy Chart Components
export const AnalyticsDashboard = withLazyLoading(
  () => import('../../components/business/analytics/Dashboard/AnalyticsDashboard'),
  'Loading analytics dashboard...'
);

export const LineChart = withLazyLoading(
  () => import('../../components/business/analytics/Charts/LineChart'),
  'Loading chart...'
);

export const BarChart = withLazyLoading(
  () => import('../../components/business/analytics/Charts/BarChart'),
  'Loading chart...'
);

export const PieChart = withLazyLoading(
  () => import('../../components/business/analytics/Charts/PieChart'),
  'Loading chart...'
);

export const FunnelChart = withLazyLoading(
  () => import('../../components/business/analytics/Charts/FunnelChart'),
  'Loading chart...'
);

// Heavy Business Components
export const CampaignBuilder = withLazyLoading(
  () => import('../../components/business/campaigns/CampaignBuilder/CampaignBuilder'),
  'Loading campaign builder...'
);

export const JourneyCanvas = withLazyLoading(
  () => import('../../components/business/campaigns/JourneyBuilder/JourneyCanvas'),
  'Loading journey designer...'
);

export const ExperimentBuilder = withLazyLoading(
  () => import('../../components/business/testing/ExperimentDesigner/ExperimentBuilder'),
  'Loading experiment designer...'
);

export const IntegrationsDashboard = withLazyLoading(
  () => import('../../components/features/Integrations/IntegrationsDashboard'),
  'Loading integrations dashboard...'
);

/**
 * Dynamic import utilities
 */
export const loadComponentDynamically = async <T extends any>(
  path: string
): Promise<T> => {
  try {
    const module = await import(path);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load component from ${path}:`, error);
    throw error;
  }
};

/**
 * Lazy loading hooks
 */
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  deps: React.DependencyList = []
) => {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    importFunc()
      .then(module => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, deps);

  return { Component, loading, error };
};

/**
 * Bundle splitting configuration
 */
export const BUNDLE_STRATEGY = {
  // Vendor chunks
  vendor: {
    test: /[\\/]node_modules[\\/]/,
    name: 'vendors',
    chunks: 'all' as const,
  },
  
  // UI Components chunk
  ui: {
    test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
    name: 'ui-components',
    chunks: 'all' as const,
    priority: 10,
  },
  
  // Business Components chunk
  business: {
    test: /[\\/]src[\\/]components[\\/]business[\\/]/,
    name: 'business-components',
    chunks: 'async' as const,
    priority: 5,
  },
  
  // Features chunk
  features: {
    test: /[\\/]src[\\/]components[\\/]features[\\/]/,
    name: 'feature-components',
    chunks: 'async' as const,
    priority: 5,
  },
  
  // Charts chunk (heavy)
  charts: {
    test: /[\\/]src[\\/]components[\\/].*[\\/]Charts[\\/]/,
    name: 'charts',
    chunks: 'async' as const,
    priority: 15,
  }
};

/**
 * Performance metrics for lazy loading
 */
export const trackLazyLoadingPerformance = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics
      console.log(`[Lazy Loading] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Track in analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', 'lazy_load_performance', {
          event_category: 'Performance',
          event_label: componentName,
          value: Math.round(loadTime)
        });
      }
      
      return loadTime;
    }
  };
};