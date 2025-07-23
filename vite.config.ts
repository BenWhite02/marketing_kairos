// File: vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = command === 'serve';
  const isProd = command === 'build';

  return {
    plugins: [
      react({
        // Enable React Fast Refresh in development
        fastRefresh: isDev,
        // JSX runtime optimization
        jsxRuntime: 'automatic',
        // Babel plugins for optimization
        babel: {
          plugins: [
            // Remove React DevTools in production
            ...(isProd ? [['react-remove-properties', { properties: ['data-testid'] }]] : []),
          ],
        },
      }),
    ],

    // Path resolution for clean imports
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@/components': resolve(__dirname, './src/components'),
        '@/pages': resolve(__dirname, './src/pages'),
        '@/hooks': resolve(__dirname, './src/hooks'),
        '@/stores': resolve(__dirname, './src/stores'),
        '@/services': resolve(__dirname, './src/services'),
        '@/utils': resolve(__dirname, './src/utils'),
        '@/types': resolve(__dirname, './src/types'),
        '@/assets': resolve(__dirname, './src/assets'),
      },
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true, // Listen on all addresses
      strictPort: true,
      
      // Enable CORS for HADES API integration
      cors: {
        origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
        credentials: true,
      },

      // API proxy for HADES backend
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🚨 HADES API Proxy Error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 HADES API Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('✅ HADES API Response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },

      // **CRITICAL: React Router SPA Configuration**
      // This ensures all routes go to React instead of looking for HTML files
      historyApiFallback: {
        // Serve index.html for all routes except API calls and static assets
        rewrites: [
          // Redirect emergency HTML routes to React login
          { from: /^\/dashboard\.html/, to: '/login' },
          { from: /^\/emergency-login\.html/, to: '/login' },
          
          // Handle all other routes with React
          { from: /^\/(?!api|assets|public).*/, to: '/index.html' },
        ],
      },

      // Additional middleware for React routing
      middlewareMode: false,
      
      // Custom middleware to handle emergency HTML redirects
      configureServer(server) {
        server.middlewares.use('/dashboard.html', (req, res, next) => {
          console.log('🔄 Emergency HTML Redirect: Sending to React login...');
          res.writeHead(302, { Location: '/login?from=emergency' });
          res.end();
        });
        
        server.middlewares.use('/emergency-login.html', (req, res, next) => {
          console.log('🔄 Emergency HTML Redirect: Sending to React login...');
          res.writeHead(302, { Location: '/login?from=emergency' });
          res.end();
        });
      },
    },

    // Build configuration
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDev,
      minify: isProd ? 'esbuild' : false,
      
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'query-vendor': ['@tanstack/react-query'],
            'store-vendor': ['zustand'],
          },
        },
      },

      // Asset optimization
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
      chunkSizeWarningLimit: 1000, // Warn on chunks larger than 1MB
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __HADES_API_URL__: JSON.stringify(env.VITE_HADES_API_URL || 'http://localhost:8080'),
      __DEV__: isDev,
    },

    // CSS configuration
    css: {
      devSourcemap: isDev,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
        '@tanstack/react-query',
        'zustand',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },

    // Performance and compatibility
    esbuild: {
      target: 'es2020',
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },

    // Preview server configuration (for production builds)
    preview: {
      port: 3000,
      host: true,
      strictPort: true,
      
      // Ensure SPA routing works in preview
      cors: true,
      
      // Custom configuration for preview server
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});