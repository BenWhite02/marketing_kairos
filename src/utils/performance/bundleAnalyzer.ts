// src/utils/performance/bundleAnalyzer.ts
/**
 * Bundle Analysis Configuration
 * Webpack Bundle Analyzer setup for production optimization
 */

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export interface BundleAnalysisConfig {
  enabled: boolean;
  mode: 'server' | 'static' | 'json';
  openAnalyzer: boolean;
  generateStatsFile: boolean;
  reportFilename: string;
}

export const bundleAnalysisConfig: BundleAnalysisConfig = {
  enabled: process.env.ANALYZE_BUNDLE === 'true',
  mode: 'static',
  openAnalyzer: false,
  generateStatsFile: true,
  reportFilename: 'bundle-report.html'
};

/**
 * Webpack Bundle Analyzer Plugin Configuration
 */
export const getBundleAnalyzerPlugin = (): BundleAnalyzerPlugin | null => {
  if (!bundleAnalysisConfig.enabled) return null;

  return new BundleAnalyzerPlugin({
    analyzerMode: bundleAnalysisConfig.mode,
    openAnalyzer: bundleAnalysisConfig.openAnalyzer,
    generateStatsFile: bundleAnalysisConfig.generateStatsFile,
    reportFilename: bundleAnalysisConfig.reportFilename,
    statsFilename: 'bundle-stats.json',
    excludeAssets: [
      /\.map$/,
      /\.gz$/,
      /\.br$/
    ]
  });
};

/**
 * Bundle Size Monitoring
 */
export interface BundleSizeMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  assetsSize: number;
  chunkCount: number;
  largestChunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
}

export const analyzeBundleMetrics = (stats: any): BundleSizeMetrics => {
  const assets = stats.assets || [];
  const chunks = stats.chunks || [];

  const jsAssets = assets.filter((asset: any) => asset.name.endsWith('.js'));
  const cssAssets = assets.filter((asset: any) => asset.name.endsWith('.css'));
  const otherAssets = assets.filter((asset: any) => 
    !asset.name.endsWith('.js') && !asset.name.endsWith('.css')
  );

  const totalSize = assets.reduce((sum: number, asset: any) => sum + asset.size, 0);
  const jsSize = jsAssets.reduce((sum: number, asset: any) => sum + asset.size, 0);
  const cssSize = cssAssets.reduce((sum: number, asset: any) => sum + asset.size, 0);
  const assetsSize = otherAssets.reduce((sum: number, asset: any) => sum + asset.size, 0);

  const largestChunks = chunks
    .map((chunk: any) => ({
      name: chunk.names?.[0] || 'unnamed',
      size: chunk.size,
      percentage: (chunk.size / totalSize) * 100
    }))
    .sort((a: any, b: any) => b.size - a.size)
    .slice(0, 10);

  return {
    totalSize,
    jsSize,
    cssSize,
    assetsSize,
    chunkCount: chunks.length,
    largestChunks
  };
};

/**
 * Bundle Size Warnings
 */
export const BUNDLE_SIZE_LIMITS = {
  totalWarning: 2 * 1024 * 1024, // 2MB warning
  totalError: 5 * 1024 * 1024,   // 5MB error
  chunkWarning: 500 * 1024,      // 500KB per chunk warning
  chunkError: 1 * 1024 * 1024    // 1MB per chunk error
};

export const checkBundleSizeLimits = (metrics: BundleSizeMetrics): {
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check total bundle size
  if (metrics.totalSize > BUNDLE_SIZE_LIMITS.totalError) {
    errors.push(`Total bundle size (${formatBytes(metrics.totalSize)}) exceeds error limit (${formatBytes(BUNDLE_SIZE_LIMITS.totalError)})`);
  } else if (metrics.totalSize > BUNDLE_SIZE_LIMITS.totalWarning) {
    warnings.push(`Total bundle size (${formatBytes(metrics.totalSize)}) exceeds warning limit (${formatBytes(BUNDLE_SIZE_LIMITS.totalWarning)})`);
  }

  // Check largest chunks
  metrics.largestChunks.forEach(chunk => {
    if (chunk.size > BUNDLE_SIZE_LIMITS.chunkError) {
      errors.push(`Chunk "${chunk.name}" (${formatBytes(chunk.size)}) exceeds error limit`);
    } else if (chunk.size > BUNDLE_SIZE_LIMITS.chunkWarning) {
      warnings.push(`Chunk "${chunk.name}" (${formatBytes(chunk.size)}) exceeds warning limit`);
    }
  });

  return { warnings, errors };
};

/**
 * Utility function to format bytes
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Bundle optimization recommendations
 */
export const getBundleOptimizationRecommendations = (metrics: BundleSizeMetrics): string[] => {
  const recommendations: string[] = [];

  if (metrics.totalSize > BUNDLE_SIZE_LIMITS.totalWarning) {
    recommendations.push('Consider implementing more aggressive code splitting');
    recommendations.push('Enable tree shaking for unused exports');
    recommendations.push('Audit and remove unused dependencies');
  }

  if (metrics.jsSize > metrics.totalSize * 0.8) {
    recommendations.push('JavaScript bundle is large - consider lazy loading components');
    recommendations.push('Implement dynamic imports for non-critical features');
  }

  if (metrics.chunkCount > 50) {
    recommendations.push('Too many chunks - consider consolidating smaller chunks');
  } else if (metrics.chunkCount < 5) {
    recommendations.push('Too few chunks - consider more granular code splitting');
  }

  const largeChunks = metrics.largestChunks.filter(chunk => 
    chunk.size > BUNDLE_SIZE_LIMITS.chunkWarning
  );

  if (largeChunks.length > 0) {
    recommendations.push(`Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}`);
    recommendations.push('Consider splitting large chunks with dynamic imports');
  }

  return recommendations;
};