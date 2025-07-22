// src/providers/PWAProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installApp: () => Promise<void>;
  updateApp: () => Promise<void>;
  showInstallPrompt: boolean;
  dismissInstallPrompt: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      // Check for standalone mode (iOS)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check for Chrome PWA
      const isInStandaloneMode = 'standalone' in window.navigator || window.navigator.standalone;
      
      setIsInstalled(isStandalone || isInStandaloneMode);
    };

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show install prompt after 30 seconds if not installed
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Analytics: Track app installation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'App Installed'
        });
      }
    };

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger background sync when coming back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_REQUEST',
          tag: 'user-actions-sync'
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Service Worker update detection
    const handleSWUpdate = () => {
      setIsUpdateAvailable(true);
    };

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker registration and update handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully');
          
          // Check for updates every 60 seconds
          setInterval(() => {
            registration.update();
          }, 60000);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  handleSWUpdate();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        switch (event.data.type) {
          case 'UPDATE_AVAILABLE':
            setIsUpdateAvailable(true);
            break;
          case 'CACHE_UPDATED':
            console.log('[PWA] Cache updated successfully');
            break;
        }
      });
    }

    checkInstallStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('[PWA] Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        setShowInstallPrompt(false);
        
        // Analytics: Track install acceptance
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_accepted', {
            event_category: 'PWA',
            event_label: 'Install Prompt Accepted'
          });
        }
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
    }
  };

  const updateApp = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('[PWA] App update failed:', error);
      }
    }
  };

  const dismissInstallPrompt = (): void => {
    setShowInstallPrompt(false);
    
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    
    // Analytics: Track install dismissal
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install_dismissed', {
        event_category: 'PWA',
        event_label: 'Install Prompt Dismissed'
      });
    }
  };

  const value: PWAContextType = {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installApp,
    updateApp,
    showInstallPrompt,
    dismissInstallPrompt
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

// Custom hook to use PWA context
export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

// Additional PWA utility hooks

export const useInstallPrompt = () => {
  const { isInstallable, installApp, showInstallPrompt, dismissInstallPrompt } = usePWA();
  
  return {
    canInstall: isInstallable,
    install: installApp,
    showPrompt: showInstallPrompt,
    dismissPrompt: dismissInstallPrompt
  };
};

export const useNetworkStatus = () => {
  const { isOnline } = usePWA();
  const [effectiveConnectionType, setEffectiveConnectionType] = useState<string>('unknown');
  
  useEffect(() => {
    // @ts-ignore - Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setEffectiveConnectionType(connection.effectiveType || 'unknown');
      
      const updateConnectionInfo = () => {
        setEffectiveConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', updateConnectionInfo);
      
      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);
  
  return {
    isOnline,
    connectionType: effectiveConnectionType,
    isSlowConnection: ['slow-2g', '2g'].includes(effectiveConnectionType)
  };
};

export const useAppUpdate = () => {
  const { isUpdateAvailable, updateApp } = usePWA();
  
  return {
    hasUpdate: isUpdateAvailable,
    updateApp
  };
};

// Service Worker messaging utilities
export const sendMessageToSW = (message: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('Service Worker not available'));
      return;
    }
    
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
};

// Background sync registration
export const registerBackgroundSync = (tag: string): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SYNC_REQUEST',
      tag
    });
  }
};

// Push notification subscription
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[PWA] Push notifications not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
    });
    
    // Send subscription to backend
    await fetch('/api/v1/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    });
    
    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
};

// Offline storage utilities
export const saveOfflineAction = async (action: any): Promise<void> => {
  if (!('indexedDB' in window)) {
    console.warn('[PWA] IndexedDB not supported');
    return;
  }
  
  try {
    const request = indexedDB.open('KairosOfflineDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['userActions'], 'readwrite');
      const store = transaction.objectStore('userActions');
      
      store.add({
        ...action,
        timestamp: Date.now(),
        synced: false
      });
    };
  } catch (error) {
    console.error('[PWA] Failed to save offline action:', error);
  }
};