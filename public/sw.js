// public/sw.js
// src/utils/pwa/serviceWorker.ts

const CACHE_NAME = 'kairos-v1.0.0';
const STATIC_CACHE_NAME = 'kairos-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'kairos-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/fonts/inter-var.woff2',
  '/offline.html'
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.kairos\.com\/v1\/(atoms|campaigns|moments)$/,
  /^https:\/\/api\.kairos\.com\/v1\/analytics\/dashboard$/,
  /^https:\/\/api\.kairos\.com\/v1\/user\/profile$/
];

// Assets that should always be fetched from network
const NETWORK_ONLY_PATTERNS = [
  /^https:\/\/api\.kairos\.com\/v1\/auth\/login$/,
  /^https:\/\/api\.kairos\.com\/v1\/auth\/refresh$/,
  /^https:\/\/api\.kairos\.com\/v1\/live\//,
  /^https:\/\/api\.kairos\.com\/v1\/websocket\//
];

/**
 * Service Worker Installation
 * Pre-cache static assets for offline functionality
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Installation failed:', error);
      })
  );
});

/**
 * Service Worker Activation
 * Clean up old caches and take control
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME &&
                     cacheName.startsWith('kairos-');
            })
            .map((cacheName) => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch Event Handler
 * Implement caching strategies based on request type
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network-only patterns (auth, live data)
  if (NETWORK_ONLY_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Network unavailable', offline: true }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Static assets - Cache first strategy
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/static/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.startsWith('/fonts/')) {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((fetchResponse) => {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return fetchResponse;
            });
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
    );
    return;
  }

  // API requests - Network first with cache fallback
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Add offline indicator to cached responses
                const headers = new Headers(cachedResponse.headers);
                headers.set('X-Served-From', 'cache');
                headers.set('X-Offline-Mode', 'true');
                
                return new Response(cachedResponse.body, {
                  status: cachedResponse.status,
                  statusText: cachedResponse.statusText,
                  headers: headers
                });
              }
              
              // Return offline response
              return new Response(
                JSON.stringify({
                  error: 'Content not available offline',
                  message: 'This data is not cached for offline use',
                  offline: true
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // All other requests - Stale while revalidate
  event.respondWith(
    caches.match(request)
      .then((response) => {
        const fetchPromise = fetch(request)
          .then((fetchResponse) => {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return fetchResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });

        return response || fetchPromise;
      })
  );
});

/**
 * Background Sync Handler
 * Handle offline actions when connection is restored
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  switch (event.tag) {
    case 'campaign-sync':
      event.waitUntil(syncCampaigns());
      break;
    case 'analytics-sync':
      event.waitUntil(syncAnalytics());
      break;
    case 'user-actions-sync':
      event.waitUntil(syncUserActions());
      break;
    default:
      console.log('[ServiceWorker] Unknown sync tag:', event.tag);
  }
});

/**
 * Push Notification Handler
 * Handle incoming push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let notificationData = {
    title: 'Kairos Notification',
    body: 'You have a new update',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    tag: 'default',
    renotify: true,
    requireInteraction: false,
    actions: []
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
      
      // Add action buttons based on notification type
      switch (payload.type) {
        case 'campaign_complete':
          notificationData.actions = [
            { action: 'view', title: 'View Results', icon: '/images/actions/view.png' },
            { action: 'share', title: 'Share', icon: '/images/actions/share.png' }
          ];
          break;
        case 'test_winner':
          notificationData.actions = [
            { action: 'deploy', title: 'Deploy Winner', icon: '/images/actions/deploy.png' },
            { action: 'analyze', title: 'Analyze', icon: '/images/actions/analyze.png' }
          ];
          break;
        case 'alert':
          notificationData.requireInteraction = true;
          notificationData.actions = [
            { action: 'acknowledge', title: 'Acknowledge', icon: '/images/actions/check.png' }
          ];
          break;
      }
    } catch (error) {
      console.error('[ServiceWorker] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

/**
 * Notification Click Handler
 * Handle user interactions with notifications
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  
  let url = '/';
  
  switch (action) {
    case 'view':
      url = data.campaignId ? `/campaigns/${data.campaignId}` : '/campaigns';
      break;
    case 'analyze':
      url = data.testId ? `/testing/${data.testId}` : '/testing';
      break;
    case 'deploy':
      url = data.testId ? `/testing/${data.testId}/deploy` : '/testing';
      break;
    case 'acknowledge':
      // Handle acknowledgment without navigation
      handleNotificationAcknowledgment(data);
      return;
    default:
      url = data.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(url.split('/')[1]) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

/**
 * Message Handler
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    case 'SYNC_REQUEST':
      self.registration.sync.register(event.data.tag);
      break;
  }
});

/**
 * Utility Functions
 */

async function syncCampaigns() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const pendingRequests = await cache.keys();
    
    for (const request of pendingRequests) {
      if (request.url.includes('/campaigns/')) {
        await fetch(request);
      }
    }
    
    console.log('[ServiceWorker] Campaign sync completed');
  } catch (error) {
    console.error('[ServiceWorker] Campaign sync failed:', error);
  }
}

async function syncAnalytics() {
  try {
    // Sync cached analytics data
    const response = await fetch('/api/v1/analytics/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('[ServiceWorker] Analytics sync completed');
    }
  } catch (error) {
    console.error('[ServiceWorker] Analytics sync failed:', error);
  }
}

async function syncUserActions() {
  try {
    // Sync pending user actions from IndexedDB
    const db = await openUserActionsDB();
    const actions = await getAllPendingActions(db);
    
    for (const action of actions) {
      await fetch('/api/v1/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      });
    }
    
    await clearPendingActions(db);
    console.log('[ServiceWorker] User actions sync completed');
  } catch (error) {
    console.error('[ServiceWorker] User actions sync failed:', error);
  }
}

async function handleNotificationAcknowledgment(data) {
  try {
    await fetch('/api/v1/notifications/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: data.id })
    });
  } catch (error) {
    console.error('[ServiceWorker] Failed to acknowledge notification:', error);
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// IndexedDB utilities for offline storage
function openUserActionsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KairosOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('userActions')) {
        const store = db.createObjectStore('userActions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getAllPendingActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['userActions'], 'readonly');
    const store = transaction.objectStore('userActions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function clearPendingActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['userActions'], 'readwrite');
    const store = transaction.objectStore('userActions');
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}