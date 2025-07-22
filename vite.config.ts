// File: vite.config.ts
// Kairos Vite Configuration - Fixed for Enterprise Development
// Author: Sankhadeep Banerjee

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        // Enable React DevTools in development
        include: "**/*.{jsx,tsx}",
        // Simplified configuration - no custom babel plugins needed
        // React Fast Refresh is enabled by default
      }),
      // Bundle analyzer for production builds (can be added later)
      ...(mode === 'production' ? [
        // Add bundle analyzer plugin here when needed
      ] : []),
    ],

    // Path resolution with aliases
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/features': resolve(__dirname, 'src/features'),
        '@/pages': resolve(__dirname, 'src/pages'),
        '@/hooks': resolve(__dirname, 'src/hooks'),
        '@/stores': resolve(__dirname, 'src/stores'),
        '@/services': resolve(__dirname, 'src/services'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/types': resolve(__dirname, 'src/types'),
        '@/assets': resolve(__dirname, 'src/assets'),
        '@/constants': resolve(__dirname, 'src/constants'),
        '@/config': resolve(__dirname, 'src/config'),
      },
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
      proxy: {
        // HADES API proxy
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
        // WebSocket proxy for real-time features
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:8080',
          ws: true,
          changeOrigin: true,
        },
      },
    },

    // Build optimization
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: mode !== 'production',
      
      // Rollup options for code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            ui: ['@headlessui/react', 'framer-motion'],
            forms: ['react-hook-form', 'zod'],
            charts: ['recharts', 'd3'],
            utils: ['date-fns', 'lodash-es'],
            
            // Feature-based chunks
            'auth-feature': [
              'src/features/auth',
              'src/pages/auth',
            ],
            'atoms-feature': [
              'src/features/atoms',
              'src/pages/atoms',
            ],
            'moments-feature': [
              'src/features/moments',
              'src/pages/moments',
            ],
            'campaigns-feature': [
              'src/features/campaigns',
              'src/pages/campaigns',
            ],
            'analytics-feature': [
              'src/features/analytics',
              'src/pages/analytics',
            ],
          },
        },
      },
      
      // Asset optimization
      assetsInlineLimit: 4096, // 4KB inline limit
      chunkSizeWarningLimit: 1000, // 1MB warning limit
      
      // Minification
      minify: 'esbuild',
      cssMinify: true,
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },

    // CSS preprocessing
    css: {
      postcss: './postcss.config.js',
      devSourcemap: mode === 'development',
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'zustand',
        'react-router-dom',
        'react-hook-form',
        'zod',
        'date-fns',
        'lodash-es',
        'framer-motion',
        '@headlessui/react',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },

    // Performance settings
    esbuild: {
      target: 'esnext',
      platform: 'browser',
      format: 'esm',
      // Drop console.log in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});