// src/components/performance/PerformanceMonitoring/PerformanceDashboard.tsx
/**
 * Performance Monitoring Dashboard
 * Real-time performance metrics and optimization insights
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import { MemoryLeakDetector, getMemoryInfo } from '../../../utils/performance/memoryManagement';
import { CacheManager } from '../../../utils/performance/cachingStrategies';

interface PerformanceDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    metrics,
    webVitals,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics
  } = usePerformanceMonitoring({ interval: refreshInterval });

  const [memoryInfo, setMemoryInfo] = useState(getMemoryInfo());
  const [cacheStats, setCacheStats] = useState(CacheManager.getStats());
  const memoryDetector = useRef(MemoryLeakDetector.getInstance());

  // Update memory and cache stats
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMemoryInfo(getMemoryInfo());
      setCacheStats(CacheManager.getStats());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Start memory leak detection
  useEffect(() => {
    memoryDetector.current.startMonitoring();
    return () => memoryDetector.current.stopMonitoring();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatMs = (ms: number): string => {
    return `${ms.toFixed(2)}ms`;
  };

  const getPerformanceGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600' };
    if (score >= 75) return { grade: 'B', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-600' };
    return { grade: 'D', color: 'text-red-600' };
  };

  const performanceScore = webVitals ? Math.round(
    (100 - Math.min(webVitals.LCP / 25, 100)) * 0.4 +
    (100 - Math.min(webVitals.FID, 100)) * 0.3 +
    (100 - Math.min(webVitals.CLS * 1000, 100)) * 0.3
  ) : 0;

  const { grade, color } = getPerformanceGrade(performanceScore);

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="shadow-lg bg-white/90 backdrop-blur-sm border"
        >
          <ChartBarIcon className="w-4 h-4 mr-2" />
          Performance: <span className={`font-bold ml-1 ${color}`}>{grade}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 ${className}`}>
      <Card className="shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${color}`}>{grade}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="p-1"
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button
              variant={isMonitoring ? "danger" : "primary"}
              size="xs"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={resetMetrics}
            >
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardBody className="space-y-4 max-h-96 overflow-y-auto">
          {/* Core Web Vitals */}
          {webVitals && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                <DocumentChartBarIcon className="w-4 h-4" />
                Core Web Vitals
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">LCP</div>
                  <div className={webVitals.LCP > 2500 ? 'text-red-600' : webVitals.LCP > 1500 ? 'text-yellow-600' : 'text-green-600'}>
                    {formatMs(webVitals.LCP)}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">FID</div>
                  <div className={webVitals.FID > 100 ? 'text-red-600' : webVitals.FID > 50 ? 'text-yellow-600' : 'text-green-600'}>
                    {formatMs(webVitals.FID)}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">CLS</div>
                  <div className={webVitals.CLS > 0.25 ? 'text-red-600' : webVitals.CLS > 0.1 ? 'text-yellow-600' : 'text-green-600'}>
                    {webVitals.CLS.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Memory Usage */}
          {memoryInfo && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                <CpuChipIcon className="w-4 h-4" />
                Memory Usage
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Used Heap:</span>
                  <span className="font-mono">{formatBytes(memoryInfo.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Total Heap:</span>
                  <span className="font-mono">{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Usage:</span>
                  <span className={`font-mono ${memoryInfo.memoryUsagePercentage > 80 ? 'text-red-600' : memoryInfo.memoryUsagePercentage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {memoryInfo.memoryUsagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      memoryInfo.memoryUsagePercentage > 80 ? 'bg-red-500' :
                      memoryInfo.memoryUsagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(memoryInfo.memoryUsagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cache Performance */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Cache Performance</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Query Cache Hit Rate:</span>
                <span className={`font-mono ${cacheStats.queryCache.hitRate > 0.8 ? 'text-green-600' : cacheStats.queryCache.hitRate > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(cacheStats.queryCache.hitRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cache Size:</span>
                <span className="font-mono">{cacheStats.queryCache.size}/{cacheStats.queryCache.maxSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Image Cache:</span>
                <span className="font-mono">{cacheStats.imageCacheSize} images</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Usage:</span>
                <span className="font-mono">{formatBytes(cacheStats.localStorageUsage)}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {metrics && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Render Performance
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Average Render Time:</span>
                  <span className="font-mono">{formatMs(metrics.averageRenderTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Component Count:</span>
                  <span className="font-mono">{metrics.componentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Re-renders:</span>
                  <span className="font-mono">{metrics.rerenderCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slow Renders:</span>
                  <span className={`font-mono ${metrics.slowRenderCount > 5 ? 'text-red-600' : metrics.slowRenderCount > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {metrics.slowRenderCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Warnings */}
          {(memoryInfo?.memoryUsagePercentage > 80 || metrics?.slowRenderCount > 5 || (webVitals && webVitals.LCP > 2500)) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Performance Issues Detected
              </div>
              <div className="text-xs text-red-700 space-y-1">
                {memoryInfo?.memoryUsagePercentage > 80 && (
                  <div>• High memory usage ({memoryInfo.memoryUsagePercentage.toFixed(1)}%)</div>
                )}
                {metrics?.slowRenderCount > 5 && (
                  <div>• Frequent slow renders ({metrics.slowRenderCount})</div>
                )}
                {webVitals?.LCP > 2500 && (
                  <div>• Poor Largest Contentful Paint ({formatMs(webVitals.LCP)})</div>
                )}
              </div>
              <Button
                variant="secondary"
                size="xs"
                className="mt-2"
                onClick={() => {
                  CacheManager.clearAll();
                  if ('gc' in window) (window as any).gc();
                }}
              >
                Clear Caches & GC
              </Button>
            </div>
          )}

          {/* Performance Recommendations */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-800 text-sm font-medium mb-2">Optimization Tips</div>
            <div className="text-xs text-blue-700 space-y-1">
              {metrics?.rerenderCount > 50 && (
                <div>• Consider memoizing components with high re-render counts</div>
              )}
              {cacheStats.queryCache.hitRate < 0.6 && (
                <div>• Improve cache hit rate with better key strategies</div>
              )}
              {memoryInfo?.memoryUsagePercentage > 60 && (
                <div>• Monitor for memory leaks in long-running operations</div>
              )}
              <div>• Use React DevTools Profiler for detailed analysis</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};