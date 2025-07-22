// vite.config.pwa.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Kairos - Marketing Orchestration Platform',
        short_name: 'Kairos',
        description: 'Enterprise marketing decisioning and campaign orchestration platform',
        theme_color: '#3b82f6',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        id: 'kairos-marketing-platform',
        categories: ['business', 'productivity', 'marketing'],
        lang: 'en-US',
        dir: 'ltr',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Kairos Dashboard - Desktop View'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Kairos Dashboard - Mobile View'
          }
        ],
        shortcuts: [
          {
            name: 'Create Campaign',
            short_name: 'Campaign',
            description: 'Start creating a new marketing campaign',
            url: '/campaigns/new',
            icons: [{ src: 'shortcut-campaign.png', sizes: '96x96' }]
          },
          {
            name: 'Analytics Dashboard',
            short_name: 'Analytics',
            description: 'View real-time campaign analytics',
            url: '/analytics',
            icons: [{ src: 'shortcut-analytics.png', sizes: '96x96' }]
          },
          {
            name: 'Atom Library',
            short_name: 'Atoms',
            description: 'Browse and manage eligibility atoms',
            url: '/atoms',
            icons: [{ src: 'shortcut-atoms.png', sizes: '96x96' }]
          },
          {
            name: 'Live Experiments',
            short_name: 'Tests',
            description: 'Monitor active A/B tests',
            url: '/testing',
            icons: [{ src: 'shortcut-testing.png', sizes: '96x96' }]
          }
        ],
        share_target: {
          action: '/share',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'files',
                accept: ['image/*', '.csv', '.xlsx', '.pdf']
              }
            ]
          }
        },
        protocol_handlers: [
          {
            protocol: 'web+kairos',
            url: '/handle?url=%s'
          }
        ],
        edge_side_panel: {
          preferred_width: 400
        },
        launch_handler: {
          client_mode: ['navigate-existing', 'auto']
        },
        handle_links: 'preferred'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        globIgnores: ['**/node_modules/**/*'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.kairos\.com\/v1\/(atoms|campaigns|moments)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?${Date.now()}`;
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.kairos\.com\/v1\/analytics/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'analytics-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30 // 30 minutes
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        offlineGoogleAnalytics: true,
        sourcemap: false
      },
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', '@heroicons/react'],
          utils: ['date-fns', 'clsx']
        }
      }
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    https: process.env.NODE_ENV === 'development' ? {
      // For PWA testing in development
      key: './certs/localhost-key.pem',
      cert: './certs/localhost.pem'
    } : undefined
  }
});

// Additional CSS for PWA
const pwaStyles = `
/* PWA Specific Styles */
@viewport {
  width: device-width;
  zoom: 1.0;
}

@media (display-mode: standalone) {
  /* Styles when app is installed as PWA */
  .pwa-only {
    display: block !important;
  }
  
  .browser-only {
    display: none !important;
  }
  
  /* Remove browser UI hints when in standalone mode */
  .install-prompt {
    display: none !important;
  }
}

@media (display-mode: browser) {
  .pwa-only {
    display: none !important;
  }
  
  .browser-only {
    display: block !important;
  }
}

/* iOS specific styles */
@supports (-webkit-touch-callout: none) {
  /* iOS Safari */
  .ios-safari-bar {
    padding-top: env(safe-area-inset-top);
  }
}

/* Android specific styles */
@media (max-width: 768px) and (orientation: portrait) {
  /* Android Chrome PWA */
  .android-chrome {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
}

/* Offline styles */
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #f59e0b;
  color: #92400e;
  text-align: center;
  padding: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.offline-indicator.show {
  transform: translateY(0);
}

/* Install prompt styles */
.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Update prompt styles */
.update-prompt {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: #10b981;
  color: white;
  border-radius: 8px;
  padding: 16px;
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Touch optimization */
.touch-optimized {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

.touch-optimized:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Performance optimizations */
.will-change-transform {
  will-change: transform;
}

.gpu-layer {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.contain-layout {
  contain: layout;
}

.contain-paint {
  contain: paint;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .install-prompt,
  .update-prompt {
    animation: none;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;