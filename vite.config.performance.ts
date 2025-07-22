// vite.config.performance.ts
/**
 * Vite Performance Configuration
 * Production-optimized build configuration for Kairos
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { getBundleAnalyzerPlugin } from './src/utils/performance/bundleAnalyzer';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh for development
      fastRefresh: true,
      // Optimize JSX compilation
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          // Remove PropTypes in production
          process.env.NODE_ENV === 'production' && ['babel-plugin-transform-remove-prop-types', { removeImport: true }]
        ].filter(Boolean)
      }
    })
  ],

  // Build optimization
  build: {
    // Target modern browsers for better optimization
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // Remove unused code
        dead_code: true,
        // Inline functions where possible
        inline: 2,
        // Optimize loops
        loops: true,
        // Optimize if statements
        if_return: true,
        // Join variable declarations
        join_vars: true,
        // Optimize sequences
        sequences: true
      },
      mangle: {
        // Mangle top-level variable names
        toplevel: true,
        // Keep function names for better debugging
        keep_fnames: process.env.NODE_ENV === 'development'
      },
      format: {
        // Remove comments
        comments: false
      }
    },
    
    // Rollup options for advanced bundling
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      
      // External dependencies (loaded from CDN in production)
      external: process.env.NODE_ENV === 'production' ? [
        // 'react',
        // 'react-dom'
      ] : [],
      
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@heroicons/react', 'framer-motion', 'clsx'],
          'vendor-charts': ['recharts', 'd3'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'vendor-utils': ['date-fns', 'lodash'],
          
          // Business logic chunks
          'business-atoms': [
            './src/components/business/atoms/AtomCard/AtomCard.tsx',
            './src/components/business/atoms/AtomComposer/AtomComposer.tsx',
            './src/pages/atoms/AtomsPage.tsx'
          ],
          'business-moments': [
            './src/components/business/moments/MomentCard/MomentCard.tsx',
            './src/components/business/moments/MomentBuilder/MomentBuilder.tsx',
            './src/pages/moments/MomentsPage.tsx'
          ],
          'business-campaigns': [
            './src/components/business/campaigns/CampaignCard/CampaignCard.tsx',
            './src/components/business/campaigns/CampaignBuilder/CampaignBuilder.tsx',
            './src/pages/campaigns/CampaignsPage.tsx'
          ],
          'business-analytics': [
            './src/components/business/analytics/Dashboard/AnalyticsDashboard.tsx',
            './src/components/business/analytics/Charts/LineChart.tsx',
            './src/pages/analytics/AnalyticsPage.tsx'
          ],
          'business-testing': [
            './src/components/business/testing/ExperimentDesigner/ExperimentBuilder.tsx',
            './src/pages/testing/TestingPage.tsx'
          ],
          
          // Feature chunks
          'features-integrations': [
            './src/components/features/Integrations/IntegrationsDashboard.tsx',
            './src/pages/integrations/IntegrationsPage.tsx'
          ],
          'features-collaboration': [
            './src/components/features/Collaboration/CollaborativeEditor.tsx',
            './src/components/features/Collaboration/PresenceIndicator.tsx'
          ],
          'features-performance': [
            './src/components/performance/VirtualScrolling/VirtualList.tsx',
            './src/components/performance/PerformanceMonitoring/PerformanceDashboard.tsx'
          ]
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Entry file name
        entryFileNames: `assets/js/[name]-[hash].js`
      }
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000, // 1MB
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Write bundle to disk
    write: true,
    
    // Empty output directory before build
    emptyOutDir: true
  },

  // Development server optimization
  server: {
    // Port configuration
    port: 3000,
    host: true,
    
    // Hot Module Replacement
    hmr: {
      overlay: true
    },
    
    // Proxy configuration for API
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Preview server optimization
  preview: {
    port: 4173,
    host: true
  },

  // Dependency optimization
  optimizeDeps: {
    // Include dependencies for pre-bundling
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      'framer-motion',
      'clsx',
      'date-fns',
      'recharts'
    ],
    
    // Exclude from pre-bundling
    exclude: [
      'virtual:performance-monitor'
    ],
    
    // Force optimization for specific packages
    force: process.env.NODE_ENV === 'development'
  },

  // Resolution configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@stores': resolve(__dirname, './src/stores'),
      '@types': resolve(__dirname, './src/types'),
      '@assets': resolve(__dirname, './src/assets')
    },
    
    // File extensions to resolve
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },

  // CSS optimization
  css: {
    // PostCSS configuration
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        // Optimize CSS in production
        ...(process.env.NODE_ENV === 'production' ? [
          require('cssnano')({
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              minifySelectors: true,
              minifyParams: true
            }]
          })
        ] : [])
      ]
    },
    
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: process.env.NODE_ENV === 'production' 
        ? '[hash:base64:8]'
        : '[name]__[local]___[hash:base64:5]'
    },
    
    // Development source maps
    devSourcemap: process.env.NODE_ENV === 'development'
  },

  // Performance optimizations
  esbuild: {
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    
    // Optimize for size in production
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    minifySyntax: process.env.NODE_ENV === 'production',
    minifyWhitespace: process.env.NODE_ENV === 'production',
    
    // Target ES2020 for better optimization
    target: 'es2020',
    
    // JSX optimization
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsxInject: `import React from 'react'`
  },

  // Define global constants
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    
    // Performance monitoring flags
    __ENABLE_PERFORMANCE_MONITORING__: process.env.ENABLE_PERFORMANCE_MONITORING !== 'false',
    __ENABLE_BUNDLE_ANALYSIS__: process.env.ANALYZE_BUNDLE === 'true',
    __ENABLE_MEMORY_MONITORING__: process.env.ENABLE_MEMORY_MONITORING !== 'false'
  },

  // Worker configuration for background tasks
  worker: {
    format: 'es',
    plugins: [
      // Worker-specific optimizations
    ]
  },

  // Experimental features
  experimental: {
    // Render built-in optimizations
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'css') {
        return { relative: true };
      }
      return { relative: true };
    }
  },

  // Environment variables
  envPrefix: ['VITE_', 'KAIROS_'],

  // Asset handling
  assetsInclude: ['**/*.md', '**/*.txt'],

  // Plugin configuration
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          // Production optimizations
          process.env.NODE_ENV === 'production' && [
            'babel-plugin-transform-remove-prop-types',
            { removeImport: true }
          ],
          process.env.NODE_ENV === 'production' && [
            'babel-plugin-transform-remove-console',
            { exclude: ['error', 'warn'] }
          ]
        ].filter(Boolean)
      }
    }),

    // Bundle analyzer (conditional)
    ...(process.env.ANALYZE_BUNDLE === 'true' ? [getBundleAnalyzerPlugin()] : []),

    // Custom performance monitoring plugin
    {
      name: 'kairos-performance-monitor',
      buildStart() {
        if (process.env.NODE_ENV === 'production') {
          console.log('🚀 Building Kairos with performance optimizations...');
        }
      },
      buildEnd() {
        if (process.env.NODE_ENV === 'production') {
          console.log('✅ Build completed with performance optimizations');
        }
      },
      generateBundle(options, bundle) {
        // Calculate bundle statistics
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;
        
        Object.values(bundle).forEach(chunk => {
          if (chunk.type === 'chunk') {
            totalSize += chunk.code.length;
            jsSize += chunk.code.length;
          } else if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) {
            totalSize += (chunk.source as string).length;
            cssSize += (chunk.source as string).length;
          }
        });

        // Log bundle statistics
        console.log('\n📊 Bundle Statistics:');
        console.log(`   Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
        console.log(`   JavaScript: ${(jsSize / 1024).toFixed(2)} KB`);
        console.log(`   CSS: ${(cssSize / 1024).toFixed(2)} KB`);
        console.log(`   Chunks: ${Object.keys(bundle).length}`);

        // Performance warnings
        if (totalSize > 2 * 1024 * 1024) {
          console.warn('⚠️  Large bundle size detected. Consider code splitting.');
        }
        
        if (Object.keys(bundle).length > 50) {
          console.warn('⚠️  Many chunks detected. Consider chunk consolidation.');
        }
      }
    },

    // PWA plugin for caching (production only)
    ...(process.env.NODE_ENV === 'production' ? [{
      name: 'kairos-pwa-cache',
      generateBundle() {
        // Generate service worker for caching
        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: `
            const CACHE_NAME = 'kairos-v1';
            const urlsToCache = [
              '/',
              '/static/js/bundle.js',
              '/static/css/main.css'
            ];

            self.addEventListener('install', event => {
              event.waitUntil(
                caches.open(CACHE_NAME)
                  .then(cache => cache.addAll(urlsToCache))
              );
            });

            self.addEventListener('fetch', event => {
              event.respondWith(
                caches.match(event.request)
                  .then(response => {
                    if (response) {
                      return response;
                    }
                    return fetch(event.request);
                  })
              );
            });
          `
        });
      }
    }] : [])
  ]
});

/**
 * Development-specific configuration
 */
export const developmentConfig = defineConfig({
  ...config,
  
  // Development optimizations
  build: {
    ...config.build,
    minify: false,
    sourcemap: true,
    rollupOptions: {
      ...config.build.rollupOptions,
      output: {
        ...config.build.rollupOptions.output,
        manualChunks: undefined // Disable chunking in development
      }
    }
  },
  
  // Development server
  server: {
    ...config.server,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
      port: 3001
    }
  },
  
  // Development optimizations
  optimizeDeps: {
    ...config.optimizeDeps,
    force: true
  }
});

/**
 * Production-specific configuration
 */
export const productionConfig = defineConfig({
  ...config,
  
  // Production optimizations
  build: {
    ...config.build,
    
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      ...config.build.terserOptions,
      compress: {
        ...config.build.terserOptions.compress,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    },
    
    // Optimize for production
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500, // Stricter limit for production
    
    // Brotli compression
    rollupOptions: {
      ...config.build.rollupOptions,
      plugins: [
        // Additional production plugins can be added here
      ]
    }
  },
  
  // Production-specific defines
  define: {
    ...config.define,
    __DEV__: false,
    __PROD__: true
  }
});

// Export the appropriate configuration based on NODE_ENV
const config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;